import { noop } from '@Utils';

import { EnhancedUserMediaStreamConstraints } from './types';

const { permissions, mediaDevices } = navigator;

function checkMediaDevicesSupport() {
  if (!mediaDevices) {
    throw new Error(
      'Media device permissions can only be requested in a secure context (i.e. HTTPS).'
    );
  }
}

function stopMediaStream(mediaStream?: MediaStream) {
  const tracks = mediaStream?.getTracks() || [];
  tracks.forEach((track) => track.stop());
}

async function requestUserMediaPermissions({
  onGranted = noop,
  onDenied = noop,
  deviceId = undefined
}: {
  onGranted?: (mediaStream?: MediaStream) => Promise<void> | void;
  onDenied?: (error: Error) => void;
  deviceId?: string;
}) {
  let mediaStream: MediaStream | undefined;
  let isGranted = false;
  let error: Error | undefined;

  try {
    const constraints: MediaStreamConstraints = {};
    checkMediaDevicesSupport();

    try {
      const microphonePermissionQueryResult = await permissions.query({
        name: 'microphone' as PermissionName
      });

      if (microphonePermissionQueryResult.state !== 'granted') {
        throw new Error();
      }
    } catch (e) {
      constraints.audio = {
        deviceId: { ideal: deviceId || 'default' }
      };
    }

    if (Object.keys(constraints).length) {
      mediaStream = await mediaDevices.getUserMedia(constraints);
    }

    isGranted = true;
  } catch (e) {
    console.error(e);
    error = new Error((e as Error).name); // NotAllowedError + NotFoundError
  }

  if (isGranted) {
    /**
     * onGranted is used to enumerate the available media devices upon obtaining permissions
     * to use the respective media inputs. The media device info labels retrieved from
     * navigator.mediaDevices.enumerateDevices() are only available during active MediaStream
     * use, or when persistent permissions have been granted.
     *
     * On Firefox in particular, the media info labels are set to an empty string when there
     * is no active MediaStream, even if the application had previously authorized temporary
     * access to the media devices by calling navigator.mediaDevices.getUserMedia().
     *
     * Therefore, onGranted must be called prior to stopping the media tracks to ensure that
     * we can reliably access the media device info labels across all browsers.
     */
    await onGranted(mediaStream);
    stopMediaStream(mediaStream);
  } else {
    onDenied(error as Error);
  }
}

async function enumerateDevices(): Promise<MediaDeviceInfo[]> {
  try {
    checkMediaDevicesSupport();

    const devices = await mediaDevices.enumerateDevices();

    const audioInputDevices = devices.filter(
      ({ deviceId, kind }) => deviceId && kind === 'audioinput'
    );

    return audioInputDevices;
  } catch (error) {
    console.error(error);

    return [];
  }
}

function getUserMedia(audioDeviceId?: string) {
  if (!audioDeviceId) {
    return;
  }

  checkMediaDevicesSupport();

  const constraints: EnhancedUserMediaStreamConstraints = {
    audio: {
      deviceId: { exact: audioDeviceId }
    }
  };

  return mediaDevices.getUserMedia(constraints);
}

function updateMediaStreamTracks(
  mediaStream: MediaStream,
  nextTracks: MediaStreamTrack[] = []
) {
  for (const nextTrack of nextTracks) {
    const [currentTrack] = mediaStream.getAudioTracks();

    if (currentTrack?.id !== nextTrack.id) {
      if (currentTrack) {
        nextTrack.enabled = currentTrack.enabled;
        mediaStream.removeTrack(currentTrack);
        currentTrack.stop();
      }

      mediaStream.addTrack(nextTrack);
    }
  }
}

export {
  enumerateDevices,
  getUserMedia,
  requestUserMediaPermissions,
  stopMediaStream,
  updateMediaStreamTracks
};
