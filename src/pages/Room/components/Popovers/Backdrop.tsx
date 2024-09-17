import { clsm } from '@Utils';

interface BackdropProps {
  isOpen: boolean;
}

function Backdrop({ isOpen }: BackdropProps) {
  return (
    <div
      className={clsm([
        'absolute',
        'w-screen',
        'h-screen',
        'bg-surfaceAlt',
        'hidden',
        'opacity-0',
        'transition-opacity',
        isOpen && ['block', 'sm:hidden', 'opacity-90', 'sm:opacity-0']
      ])}
    />
  );
}

export default Backdrop;
