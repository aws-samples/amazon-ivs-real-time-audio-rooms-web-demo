import { Button, Spinner } from '@Components';
import { SpinnerSize } from '@Components/Spinner';
import { useStage } from '@Contexts/Stage';
import { Plus } from '@phosphor-icons/react';
import { clsm } from '@Utils';
import { StageParticipantPublishState } from 'amazon-ivs-web-broadcast';
import { ButtonAppearance, ButtonStyleType } from 'src/components/Button/theme';

import TileContainer from './TileContainer';

interface JoinSessionTileProps {
  containerStyle?: React.CSSProperties;
  startPublishing: () => void;
}

function JoinSessionTile({
  containerStyle,
  startPublishing
}: JoinSessionTileProps) {
  const stage = useStage();
  const isAttemptingPublish =
    stage.publishState === StageParticipantPublishState.ATTEMPTING_PUBLISH;

  return (
    <TileContainer
      containerStyle={containerStyle}
      className="pointer-events-auto"
    >
      <div
        className={clsm([
          'flex',
          'justify-center',
          'items-center',
          'w-full',
          'h-full'
        ])}
      >
        {isAttemptingPublish ? (
          <Spinner size={SpinnerSize.LARGE} />
        ) : (
          <Button
            appearance={ButtonAppearance.SECONDARY}
            styleType={ButtonStyleType.ROUND}
            className={clsm(['max-w-24', 'h-24'])}
            onClick={startPublishing}
          >
            <Plus size={48} />
          </Button>
        )}
      </div>
    </TileContainer>
  );
}

export default JoinSessionTile;
