import { RoomParticipantAttributes } from '@Shared/types';
import { deepEqual } from 'fast-equals';
import { memo } from 'react';

import Audio from './media';
import TileContainer from './TileContainer';
import TileOverlays from './TileOverlays';

interface ParticipantAudioTileProps {
  id: string;
  attributes: RoomParticipantAttributes;
  mediaStream?: MediaStream;
  isLocal?: boolean;
  audioMuted?: boolean;
  containerStyle?: React.CSSProperties;
  colors: string[];
}

function ParticipantAudioTile({
  id,
  attributes,
  mediaStream,
  containerStyle,
  isLocal = false,
  audioMuted = false,
  colors
}: ParticipantAudioTileProps) {
  return (
    <TileContainer containerStyle={containerStyle} color={colors[2]}>
      <Audio id={id} mediaStream={mediaStream} muted={audioMuted || isLocal} />
      <TileOverlays
        attributes={attributes}
        audioMuted={audioMuted}
        isLocal={isLocal}
        colors={colors}
        audioActivityStream={mediaStream}
      />
    </TileContainer>
  );
}

export default memo(ParticipantAudioTile, deepEqual);
