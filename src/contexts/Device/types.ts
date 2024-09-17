interface DeviceProviderProps {
  children: React.ReactNode;
}

interface UserMediaContext {
  devices: MediaDeviceInfo[];
  activeDevice?: MediaDeviceInfo;
  audioMuted: boolean;
  mediaStream?: MediaStream;
  toggleAudio: (options?: { muted?: boolean }) => void;
  startUserMedia: () => Promise<MediaStream | undefined>;
  stopUserMedia: () => void;
  updateActiveDevice: (device?: MediaDeviceInfo) => void;
}

interface DeviceSettings {
  deviceId?: string;
}

type EnhancedUserMediaStreamConstraints = Omit<MediaStreamConstraints, 'video'>;

type MediaToggles = Pick<UserMediaContext, 'toggleAudio'>;

export type {
  DeviceProviderProps,
  DeviceSettings,
  EnhancedUserMediaStreamConstraints,
  MediaToggles,
  UserMediaContext
};
