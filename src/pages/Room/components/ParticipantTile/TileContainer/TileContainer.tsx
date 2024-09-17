import { clsm } from '@Utils';
import { useRef } from 'react';

interface TileContainerProps {
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
  color?: string;
  className?: string;
}

function TileContainer({
  children,
  containerStyle,
  color,
  className
}: TileContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={clsm([
        '@container',
        'relative',
        'w-full',
        'h-full',
        'overflow-hidden',
        'pointer-events-none',
        className
      ])}
    >
      <div
        className={clsm([
          'relative',
          'w-full',
          'h-full',
          'rounded-lg',
          '@2xs:md:rounded-3xl',
          'overflow-hidden',
          'bg-zinc-200',
          'dark:bg-zinc-800'
        ])}
      >
        <div
          className={clsm([
            'absolute',
            'w-full',
            'h-full',
            'top-0',
            'left-0',
            'opacity-80',
            'dark:opacity-50',
            'pointer-events-none'
          ])}
          {...(color ? { style: { backgroundColor: color } } : {})}
        />
        {children}
      </div>
    </div>
  );
}

export default TileContainer;
