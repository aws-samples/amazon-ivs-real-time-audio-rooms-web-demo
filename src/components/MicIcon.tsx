import { Microphone, X } from '@phosphor-icons/react';
import { clsm } from '@Utils';

interface MicIconProps {
  noMic?: boolean;
}

function MicIcon({ noMic = false }: MicIconProps) {
  return (
    <div className={clsm(['relative'])}>
      {noMic && (
        <span
          className={clsm([
            'absolute',
            'bottom-0',
            '-right-1',
            'rounded-full',
            'bg-surfaceAlt',
            'p-0.5'
          ])}
        >
          <X size={10} color="#D92700" weight="bold" />
        </span>
      )}
      <Microphone size={24} weight={!noMic ? 'fill' : 'regular'} />
    </div>
  );
}

export default MicIcon;
