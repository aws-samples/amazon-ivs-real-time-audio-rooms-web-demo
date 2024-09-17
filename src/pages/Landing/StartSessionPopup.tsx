import { Button, Input } from '@Components';
import { clsm } from '@Utils';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MIN_USERNAME_LENGTH } from 'src/constants';

interface StartSessionProps {
  name: string;
  roomId?: string;
  isLoading?: boolean;
}

function StartSessionPopup({
  name,
  roomId,
  isLoading = false
}: StartSessionProps) {
  const [username, setUsername] = useState(name);
  const navigate = useNavigate();

  function updateUsername(e: ChangeEvent<HTMLInputElement>) {
    if (isLoading) return;

    setUsername(e.target.value);
  }

  function startSession(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    if (roomId) {
      navigate(`/room/${roomId}?username=${username}`);
    } else {
      navigate(`/room/-?new_stage=true&username=${username}`);
    }
  }

  return (
    <>
      <div
        className={clsm([
          'absolute',
          'w-full',
          'h-full',
          'opacity-90',
          'bg-surfaceAlt'
        ])}
      />
      <div
        className={clsm(
          'absolute',
          'w-full',
          'h-full',
          'flex',
          'justify-center',
          'items-center',
          'backdrop-blur-md'
        )}
      >
        <div
          className={clsm(
            'flex',
            'flex-col',
            'gap-2',
            'bg-surface',
            'w-96',
            'px-6',
            'py-8',
            'rounded-xl',
            'overflow-hidden',
            'text-uiText/50',
            'shadow-xl',
            'dark:shadow-black/80',
            'ring-1',
            'ring-surfaceAlt2/10'
          )}
        >
          <h3
            id="title"
            className={clsm([
              'text-md',
              'font-bold',
              'text-uiText',
              'text-center',
              'mb-4'
            ])}
          >
            Enter your name
          </h3>
          <span id="full_description" className="hidden">
            <p>Enter a name to continue.</p>
          </span>
          <form onSubmit={startSession}>
            <div
              className={clsm(['flex', 'justify-center', 'gap-x-2', 'mb-5'])}
            >
              <Input
                name="username"
                inputValue={username}
                onChange={updateUsername}
              />
            </div>
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={username.length < MIN_USERNAME_LENGTH}
            >
              Start session
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default StartSessionPopup;
