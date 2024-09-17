import { RoomParticipantInfo } from '@Shared/types';
import { clsm } from '@Utils';
import {
  getBestFitWithOverflow,
  getComputedGridSlotStyle,
  getComputedParticipantGridStyle
} from '@Utils/layout';
import UniquePaletteAssigner from '@Utils/palette';
import { deepEqual } from 'fast-equals';
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useResizeDetector } from 'react-resize-detector';

import { JoinSessionTile, ParticipantAudioTile } from './components';

interface ParticipantsGridProps {
  participants: RoomParticipantInfo[];
  startPublishing: () => void;
  showJoinSessionTile: boolean;
}

function ParticipantsGrid({
  participants,
  startPublishing,
  showJoinSessionTile
}: ParticipantsGridProps) {
  const paletteAssigner = useMemo(() => new UniquePaletteAssigner(), []);
  const [bestFit, setBestFit] = useState(getBestFitWithOverflow);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioTilesCount = participants.length - bestFit.overflow;
  const audioParticipants = participants.slice(0, audioTilesCount);

  const updateBestFit = useCallback(() => {
    const tileCount = participants.length + (showJoinSessionTile ? 1 : 0);

    setBestFit(
      getBestFitWithOverflow(
        tileCount,
        containerRef.current?.clientWidth,
        containerRef.current?.clientHeight
      )
    );
  }, [participants.length, showJoinSessionTile]);

  // Re-compute best-fit calculations on participant count changes
  useLayoutEffect(updateBestFit, [
    updateBestFit,
    participants.length,
    showJoinSessionTile
  ]);
  // Re-compute best-fit calculations on container resize events
  useResizeDetector({ targetRef: containerRef, onResize: updateBestFit });

  return (
    <div
      data-grid
      ref={containerRef}
      className={clsm([
        'peer',
        'flex',
        'items-center',
        'justify-center',
        'w-full',
        'h-full',
        'animate-scaleIn',
        'peer-data-[grid]:animate-fadeInUp'
      ])}
    >
      <div
        style={getComputedParticipantGridStyle(bestFit)}
        className={clsm([
          'grid',
          'grow',
          'place-items-center',
          'auto-rows-fr',
          'max-h-full'
        ])}
      >
        {audioParticipants.map((vp, i) => {
          const participantName = vp.attributes.name;

          return (
            <ParticipantAudioTile
              {...vp}
              key={vp.id}
              containerStyle={getComputedGridSlotStyle(i, bestFit)}
              colors={paletteAssigner.getNumberFromUsername(participantName)}
            />
          );
        })}
        {showJoinSessionTile && (
          <JoinSessionTile
            containerStyle={getComputedGridSlotStyle(
              Math.max(0, audioParticipants.length),
              bestFit
            )}
            startPublishing={startPublishing}
          />
        )}
      </div>
    </div>
  );
}

export default memo(ParticipantsGrid, deepEqual);
