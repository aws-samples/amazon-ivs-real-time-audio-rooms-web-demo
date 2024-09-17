import { errorMessages, successMessages } from '@Content';
import { useLocalStorage } from '@Hooks';
import { debounce } from '@Utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { enumerateDevices, requestUserMediaPermissions } from './helpers';
import { MediaToggles } from './types';

const { mediaDevices } = navigator;

/**
 * Manages the devices connected to the local machine
 */
function useLocalDevices({ toggleAudio }: MediaToggles) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceSettings = {}] = useLocalStorage('devices');
  const [activeDevice, setActiveDevice] = useState<MediaDeviceInfo>();
  const discoveredDevices = useRef(new Map<string, Set<string>>());

  const updateActiveDevice = useCallback(
    (nextActiveDevice?: MediaDeviceInfo) => {
      setActiveDevice((prevActiveDevice) => {
        const newActiveDevice = (
          prevActiveDevice?.deviceId !== nextActiveDevice?.deviceId
            ? nextActiveDevice
            : prevActiveDevice
        ) as MediaDeviceInfo;

        if (
          prevActiveDevice &&
          prevActiveDevice?.deviceId !== nextActiveDevice?.deviceId
        )
          toast.success(
            `${successMessages.switch_device}${newActiveDevice.label}`,
            {
              id: newActiveDevice.groupId
            }
          );

        return newActiveDevice;
      });
    },
    []
  );

  const startLocalDevices = useCallback(async () => {
    toast.dismiss('permissions-toast');
    const deviceId = deviceSettings.deviceId ?? '';
    let grantedDeviceLabel: string;
    let initialDevices: MediaDeviceInfo[] = [];

    async function onGranted(mediaStream?: MediaStream) {
      initialDevices = await enumerateDevices();

      if (!initialDevices.length) {
        toast.error(errorMessages.no_devices, {
          id: 'mic-toast'
        });
      }

      setDevices(initialDevices);

      const grantedTracks = mediaStream?.getTracks() ?? [];

      grantedTracks.forEach(({ kind, label }) => {
        if (kind === 'audio') {
          grantedDeviceLabel = label;
        }
      });
    }

    function onDenied() {
      toast.error(errorMessages.permissions_denied, {
        id: 'permissions-toast'
      });
    }

    await requestUserMediaPermissions({ deviceId, onGranted, onDenied });

    const initialActiveDevice =
      initialDevices.find((d) => d.label === grantedDeviceLabel) || // 1. Specific device for which permissions were granted (Firefox only)
      initialDevices.find((d) => d.deviceId === deviceId) || // 2. Device stored in local storage as a user preference
      initialDevices.find((d) => d.deviceId === 'default') || // 3. Default device in the list
      initialDevices[0]; // 4. First device in the list

    if (initialActiveDevice) {
      updateActiveDevice(initialActiveDevice);
    }

    return initialActiveDevice;
  }, [deviceSettings.deviceId, updateActiveDevice]);

  const refreshDevices = useCallback(async () => {
    const nextDevices = await enumerateDevices();

    setDevices((prevDevices) => {
      const prevDevicesList = prevDevices ?? [];
      const nextDevicesList: MediaDeviceInfo[] = nextDevices ?? [];

      if (prevDevicesList.length > nextDevicesList.length) {
        // Device was disconnected
        const [disconnectedDevice] = prevDevicesList.filter(
          (prevDevice) =>
            nextDevicesList.findIndex(
              (nextDevice) => prevDevice.deviceId === nextDevice.deviceId
            ) === -1
        );

        if (disconnectedDevice.deviceId === activeDevice?.deviceId) {
          // Disconnected device was active -> switch to the next device in the list
          const nextActiveDevice =
            nextDevicesList.find((d) => d.deviceId === 'default') ||
            nextDevicesList[0];

          // Before switching to the next active device, mute the current state.
          // This also ensures that we reach a sensible state even if there is no nextActiveDevice.
          toggleAudio({ muted: true });

          updateActiveDevice(nextActiveDevice);

          const { label, groupId } = disconnectedDevice;
          toast.error(`${errorMessages.disconnected_device}${label}`, {
            id: groupId
          });
        }
      } else if (prevDevicesList.length < nextDevicesList.length) {
        // New device was connected
        const [connectedDevice] = nextDevicesList.filter(
          (nextDevice) =>
            prevDevicesList.findIndex(
              (prevDevice) => prevDevice.deviceId === nextDevice.deviceId
            ) === -1
        );

        const { label, groupId, deviceId } = connectedDevice;
        const discoveredSet = discoveredDevices.current.get(groupId);
        const discovered = !!discoveredSet?.has(deviceId);

        // Update the active device only if the newly connected device
        // has not been discovered this session
        if (!discovered) {
          updateActiveDevice(connectedDevice);

          toast.success(`${successMessages.switch_device}${label}`, {
            id: groupId
          });
        }
      }

      return nextDevices;
    });
  }, [activeDevice, toggleAudio, updateActiveDevice]);

  useEffect(() => {
    const deviceInfoList: MediaDeviceInfo[] = Object.values(devices).flat();

    for (const { groupId, deviceId } of deviceInfoList) {
      const discoveredSet = discoveredDevices.current.get(groupId) ?? new Set();

      discoveredSet.add(deviceId);
      discoveredDevices.current.set(groupId, discoveredSet);
    }
  }, [devices]);

  useEffect(() => {
    // mediaDevices is available only in secure contexts
    if (!mediaDevices) {
      return;
    }

    /**
     * A devicechange event is sent to a MediaDevices instance whenever a media device such
     * as a camera, microphone, or speaker is connected to or removed from the system
     */
    const onDeviceChange = debounce(refreshDevices, 1000);
    mediaDevices.addEventListener('devicechange', onDeviceChange);

    return () => {
      mediaDevices.removeEventListener('devicechange', onDeviceChange);
      onDeviceChange.cancel();
    };
  }, [refreshDevices]);

  return {
    devices,
    activeDevice,
    startLocalDevices,
    updateActiveDevice
  };
}

export default useLocalDevices;
