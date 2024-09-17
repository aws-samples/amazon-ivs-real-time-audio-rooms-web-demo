import { MicrophoneSlash } from '@phosphor-icons/react';
import { RoomParticipantAttributes } from '@Shared/types';
import { clsm } from '@Utils';

import AvatarAudioIndicator from './AvatarAudioIndicator';
import TileInfoPill from './TileInfoPill';

interface TileOverlaysProps {
  attributes: RoomParticipantAttributes;
  audioMuted?: boolean;
  isLocal?: boolean;
  audioActivityStream?: MediaStream;
  colors: string[];
}

function TileOverlays({
  attributes,
  audioMuted = false,
  isLocal = false,
  audioActivityStream,
  colors
}: TileOverlaysProps) {
  const participantName = attributes.name;
  const participantDisplayName = isLocal
    ? `You (${participantName})`
    : participantName;

  return (
    <>
      <AvatarAudioIndicator
        name={participantName}
        audioActivityStream={audioActivityStream}
        colors={colors}
      />
      <div
        className={clsm([
          '@2xs:bottom-[10%]',
          '@2xs:px-4',
          'absolute',
          'bottom-2.5',
          'px-2.5',
          'w-full'
        ])}
      >
        <TileInfoPill
          isVisible
          content={participantDisplayName}
          icon={
            <MicrophoneSlash
              size={20}
              weight="fill"
              className={clsm(['fill-surfaceAlt2', '@2xs:fill-destruct'])}
            />
          }
          isIconVisible={audioMuted}
        />
      </div>
    </>
  );
}

export default TileOverlays;
