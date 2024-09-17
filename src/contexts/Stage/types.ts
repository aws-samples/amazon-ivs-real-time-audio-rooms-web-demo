import { RoomParticipantInfo } from '@Shared/types';
import {
  StageConnectionState,
  StageError,
  StageParticipantPublishState
} from 'amazon-ivs-web-broadcast';

import type { Stage } from './StageFactory';

interface StageProviderProps {
  children: React.ReactNode;
}

interface StageContext {
  connectError: StageError | null;
  connectState: StageConnectionState;
  publishError: StageError | null;
  publishState: StageParticipantPublishState;
  subscribeOnly: boolean;
  join: Stage['join'];
  leave: Stage['leave'];
  publish: StrategyMutators['publish'];
  unpublish: StrategyMutators['unpublish'];
  updateStreamsToPublish: StrategyMutators['updateStreamsToPublish'];
  getParticipants: (filters?: ParticipantsFilters) => RoomParticipantInfo[];
  toggleLocalStageStreamMutedState: (muted?: boolean) => boolean | undefined;
}

interface StrategyMutators {
  publish: (mediaStreamToPublish?: MediaStream) => void;
  unpublish: () => void;
  updateStreamsToPublish: (mediaStreamToPublish: MediaStream) => void;
}

type ParticipantsFilters = Partial<
  Pick<RoomParticipantInfo, 'isLocal' | 'isPublishing'> & {
    canSubscribeTo?: boolean;
  }
>;

export type {
  ParticipantsFilters,
  StageContext,
  StageProviderProps,
  StrategyMutators
};
