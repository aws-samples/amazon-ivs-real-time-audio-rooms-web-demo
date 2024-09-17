import { Button } from '@Components';
import { clsm, noop } from '@Utils';
import { MouseEventHandler } from 'react';

interface CreateSessionProps {
  generateRandomUsername?: MouseEventHandler<HTMLButtonElement>;
}

function CreateSession({ generateRandomUsername = noop }: CreateSessionProps) {
  return (
    <>
      <div
        className={clsm(
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          'gap-5',
          'text-center'
        )}
      >
        <h1 className={clsm(['text-uiText'])}>Amazon IVS Audio Rooms</h1>
        <span className={clsm(['flex', 'flex-col', 'items-center', 'gap-9'])}>
          <p className={clsm(['text-uiText/50'])}>
            Create a session to talk with up to 11 other <br /> participants in
            real-time.
          </p>
          <Button fullWidth onClick={generateRandomUsername}>
            Create a session
          </Button>
        </span>
      </div>
      <div className={clsm(['absolute', 'bottom-7'])}>
        <p className="text-uiTextAlt">
          More demos like this at{' '}
          <a
            href="/"
            className={clsm(
              'hover:text-uiText',
              'underline',
              'underline-offset-1'
            )}
          >
            IVS.rocks
          </a>
        </p>
      </div>
    </>
  );
}

export default CreateSession;
