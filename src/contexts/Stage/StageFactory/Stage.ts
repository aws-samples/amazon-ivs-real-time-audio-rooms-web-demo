import { successMessages } from '@Content';
import { StageClientConfig } from '@Shared/types';
import { queueMacrotask } from '@Utils';
import {
  Stage,
  StageConnectionState,
  StageErrorCategory,
  StageEvents,
  StageParticipantPublishState
} from 'amazon-ivs-web-broadcast';
import toast from 'react-hot-toast';

import { StrategyMutators } from '../types';
import StageStrategy from './StageStrategy';

const {
  STAGE_LEFT,
  ERROR: STAGE_ERROR,
  STAGE_CONNECTION_STATE_CHANGED,
  STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED
} = StageEvents;
const { PUBLISH_ERROR } = StageErrorCategory;
const { PUBLISHED } = StageParticipantPublishState;
const { CONNECTED } = StageConnectionState;

class CustomStage extends Stage {
  readonly strategyMutators: StrategyMutators;

  readonly localParticipantId: string;

  protected connected = false; // Indicates whether the participant is currently connected

  protected published = false; // Indicates whether the participant has ever published to this session

  constructor(stageConfig: StageClientConfig) {
    const strategy = new StageStrategy();
    super(stageConfig.token, strategy);

    this.strategyMutators = strategy.mutators(this);
    this.localParticipantId = stageConfig.participantId;

    /**
     * Ensure we leave the Stage when the window, the document and its resources are about to be unloaded,
     * i.e., when the user refreshes the page, closes the tab or closes the browser window.
     */
    const onBeforeUnload = () => queueMacrotask(this.leave);
    window.addEventListener('online', this.refreshStrategy, true);
    window.addEventListener('beforeunload', onBeforeUnload, true);

    this.on(STAGE_LEFT, (reason) => {
      console.warn('Stage left ', reason);

      this.connected = false;
      this.published = false;
      window.removeEventListener('online', this.refreshStrategy);
      window.removeEventListener('beforeunload', onBeforeUnload);
    });

    this.on(STAGE_ERROR, (error) => {
      console.error('Stage error ', error.toString());

      if (!this.published && error.category === PUBLISH_ERROR) {
        this.strategyMutators.unpublish(); // Unpublish to reset shouldPublish
      }
    });

    this.on(STAGE_CONNECTION_STATE_CHANGED, (state) => {
      this.connected = state === CONNECTED;
    });

    this.on(STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED, (_, state) => {
      if (state === StageParticipantPublishState.PUBLISHED) {
        toast.success(successMessages.joined_session, { id: 'publish-state' });
      }

      if (state === StageParticipantPublishState.NOT_PUBLISHED) {
        toast.success(successMessages.left_session, { id: 'publish-state' });
      }

      this.published = this.published || state === PUBLISHED;
    });
  }

  readonly join = async (mediaStreamToPublish?: MediaStream) => {
    await super.join();

    if (mediaStreamToPublish) {
      this.strategyMutators.publish(mediaStreamToPublish);
    }
  };
}

export default CustomStage;
