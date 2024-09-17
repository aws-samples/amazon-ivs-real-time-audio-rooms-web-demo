import { Avatar } from '@Components';
import { clsm } from '@Utils';
import { analyzeAudio } from '@Utils/audio';
import { useEffect, useRef } from 'react';

interface AvatarAudioIndicatorProps {
  name: string;
  audioActivityStream?: MediaStream;
  colors: string[];
}

const AVATAR_HEIGHT_STYLES = clsm([
  'min-h-12',
  'h-1/2',
  'max-h-20',
  '@xs:max-h-24',
  '@sm:max-h-36'
]);

function AvatarAudioIndicator({
  name,
  audioActivityStream,
  colors
}: AvatarAudioIndicatorProps) {
  const audioIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioActivityStream && audioIndicatorRef.current) {
      return analyzeAudio(audioActivityStream, audioIndicatorRef.current);
    }
  }, [audioActivityStream, audioIndicatorRef]);

  return (
    <div
      className={clsm([
        'relative',
        'flex',
        'items-center',
        'justify-center',
        'gap-y-3',
        'font-semibold',
        'w-full',
        'h-full',
        '@2xs:p-4'
      ])}
    >
      <span
        ref={audioIndicatorRef}
        className={clsm([
          'absolute',
          'aspect-square',
          'rounded-full',
          AVATAR_HEIGHT_STYLES
        ])}
      >
        <div
          className={clsm([
            'audio-indicator',
            'w-full',
            'h-full',
            'scale-100',
            'absolute',
            'rounded-full',
            'p-5',
            'transition-transform',
            'duration-200',
            'will-change-transform',
            'bg-black/20',
            'shadow-black/20',
            'dark:bg-white/20',
            'dark:shadow-white/20'
          ])}
        />
        <div
          className={clsm([
            'audio-ping',
            'scale-100',
            'w-full',
            'h-full',
            'absolute',
            'rounded-full',
            'border',
            'transition-transform',
            'will-change-transform',
            'animate-none',
            'border-black/20',
            'dark:border-white/20'
          ])}
          onAnimationIteration={(event) => {
            // Remove the ping animation once the iteration ends
            if (event.currentTarget.classList.contains('stop-animation')) {
              event.currentTarget.classList.add('animate-none');
              event.currentTarget.classList.remove('animate-ping');
              event.currentTarget.classList.remove('stop-animation'); // Clean up the stop flag
            }
          }}
        />
      </span>
      <Avatar
        name={name}
        className={clsm([
          'absolute',
          'border-2',
          'border-white',
          AVATAR_HEIGHT_STYLES
        ])}
        colors={colors}
      />
    </div>
  );
}

export default AvatarAudioIndicator;
