import { successMessages } from '@Content';
import { useStage } from '@Contexts/Stage';
import { useContextHook, useLocalStorage } from '@Hooks';
import { StageParticipantPublishState } from 'amazon-ivs-web-broadcast';
import {
  createContext,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from 'react';
import toast from 'react-hot-toast';

import {
  getUserMedia,
  stopMediaStream,
  updateMediaStreamTracks
} from './helpers';
import { DeviceProviderProps, UserMediaContext } from './types';
import useLocalDevices from './useLocalDevices';

const Context = createContext<UserMediaContext | null>(null);
Context.displayName = 'Device';

function useDevice() {
  return useContextHook(Context);
}

const { PUBLISHED } = StageParticipantPublishState;

let mediaStream: MediaStream = new MediaStream();

/**
 * Creates and manages a single user media stream
 */
function DeviceProvider({ children }: DeviceProviderProps) {
  const {
    publishState,
    subscribeOnly,
    updateStreamsToPublish,
    toggleLocalStageStreamMutedState
  } = useStage();
  const [audioMuted, setAudioMuted] = useState(false);
  const [_, storeDeviceSettings] = useLocalStorage('devices');
  const publishStateDeferred = useDeferredValue(publishState);
  const unpublished = subscribeOnly && publishStateDeferred === PUBLISHED;

  const toggleAudio = useCallback(
    ({ muted }: { muted?: boolean } = {}) => {
      // If available, the audio local stage stream should be the source of truth for the next muted state
      const isAudioLocalStageStreamMuted =
        toggleLocalStageStreamMutedState(muted);

      const mediaStreamAudioTrack = mediaStream.getAudioTracks()[0];
      if (mediaStreamAudioTrack) {
        const nextAudioMuted =
          isAudioLocalStageStreamMuted ??
          muted ??
          mediaStreamAudioTrack.enabled;
        setAudioMuted(nextAudioMuted);

        /**
         * If the local participant is not yet publishing, then no audio LocalStageStream instances will be available.
         * As a result, since there is no link yet between the Stage and the local audio MediaStream track, attempting
         * to mute the track by calling the setMuted method on the LocalStageStream class will have no effect. Therefore,
         * we must ensure that the `enabled` property on the local audio MediaStream track reflects the correct muted state
         * before the local participant starts publishing. Once the local participant starts publishing, this state will be
         * picked up by the Stage strategy to instantiate the audio LocalStageStream instance with the expected muted state.
         */
        if (isAudioLocalStageStreamMuted === undefined) {
          mediaStreamAudioTrack.enabled = !nextAudioMuted;
        } else {
          // Only show mute/unmuted toast message when the participant is publishing
          const toastMessage = nextAudioMuted
            ? successMessages.microphone_muted
            : successMessages.microphone_unmuted;
          toast.success(toastMessage, { id: 'mic-toast' });
        }
      }
    },
    [toggleLocalStageStreamMutedState]
  );

  const { devices, activeDevice, startLocalDevices, updateActiveDevice } =
    useLocalDevices({ toggleAudio });

  const updateMediaStream = useCallback(
    async (audioDeviceId?: string) => {
      let newMediaStream: MediaStream | undefined;

      try {
        newMediaStream = await getUserMedia(audioDeviceId);
      } catch (error) {
        console.error(error);

        return;
      }

      if (newMediaStream) {
        updateMediaStreamTracks(mediaStream, newMediaStream.getTracks());
        updateStreamsToPublish(newMediaStream);
      }

      return mediaStream;
    },
    [updateStreamsToPublish]
  );

  const startUserMedia = useCallback(async () => {
    const activeDeviceInfo = await startLocalDevices();

    return updateMediaStream(activeDeviceInfo?.deviceId);
  }, [startLocalDevices, updateMediaStream]);

  const stopUserMedia = useCallback(() => {
    stopMediaStream(mediaStream);
    mediaStream = new MediaStream();

    setAudioMuted(false);
  }, []);

  useEffect(() => {
    const audioDeviceId = activeDevice?.deviceId;

    storeDeviceSettings((prevStoredPreferences) => ({
      ...prevStoredPreferences,
      deviceId: audioDeviceId ?? prevStoredPreferences?.deviceId
    }));

    // Only process changes made to existing mediaStream tracks
    if (mediaStream.getTracks().length) {
      updateMediaStream(audioDeviceId);
    }
  }, [activeDevice?.deviceId, storeDeviceSettings, updateMediaStream]);

  useEffect(() => {
    if (unpublished) {
      stopUserMedia();
    }
  }, [unpublished, stopUserMedia]);

  useEffect(() => stopUserMedia, [stopUserMedia]);

  const value = useMemo<UserMediaContext>(
    () => ({
      activeDevice,
      audioMuted,
      devices,
      startUserMedia,
      mediaStream,
      stopUserMedia,
      toggleAudio,
      updateActiveDevice
    }),
    [
      activeDevice,
      audioMuted,
      devices,
      startUserMedia,
      stopUserMedia,
      toggleAudio,
      updateActiveDevice
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export { DeviceProvider, useDevice };
