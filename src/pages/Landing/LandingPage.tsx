import { clsm } from '@Utils';
import { MouseEventHandler } from 'react';

import CreateSession from './CreateSession';
import StartSessionPopup from './StartSessionPopup';

interface LandingPageProps {
  username: string;
  roomId?: string;
  generateRandomUsername?: MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
}

function LandingPage({
  username,
  roomId,
  generateRandomUsername,
  isLoading = false
}: LandingPageProps) {
  return (
    <div className={clsm(['h-dvh', 'flex', 'justify-center'])}>
      {username && (
        <StartSessionPopup
          name={username}
          roomId={roomId}
          isLoading={isLoading}
        />
      )}
      <CreateSession generateRandomUsername={generateRandomUsername} />
    </div>
  );
}

export default LandingPage;
