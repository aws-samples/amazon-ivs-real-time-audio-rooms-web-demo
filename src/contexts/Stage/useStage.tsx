import { useContextHook } from '@Hooks';
import { JoinResponse, RoomParticipantInfo } from '@Shared/types';
import {
  StageConnectionState,
  StageError,
  StageErrorCategory,
  StageEvents,
  StageParticipantInfo,
  StageParticipantPublishState
} from 'amazon-ivs-web-broadcast';
import memoize from 'fast-memoize';
import { createContext, useMemo, useState } from 'react';
import { useAsyncValue } from 'react-router';

import StageFactory from './StageFactory';
import { ParticipantsFilters, StageContext, StageProviderProps } from './types';
import useParticipants from './useParticipants';
import useStreams from './useStreams';

const Context = createContext<StageContext | null>(null);
Context.displayName = 'Stage';

function useStage() {
  return useContextHook(Context);
}

const {
  ERROR: STAGE_ERROR,
  STAGE_CONNECTION_STATE_CHANGED,
  STAGE_PARTICIPANT_JOINED,
  STAGE_PARTICIPANT_LEFT,
  STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED,
  STAGE_PARTICIPANT_STREAMS_ADDED,
  STAGE_PARTICIPANT_STREAMS_REMOVED,
  STAGE_STREAM_MUTE_CHANGED
} = StageEvents;
const { CONNECTED, DISCONNECTED } = StageConnectionState;
const { PUBLISHED, NOT_PUBLISHED } = StageParticipantPublishState;

function StageProvider({ children }: StageProviderProps) {
  const { stageConfig } = useAsyncValue() as JoinResponse;
  const { mediaStreams, toggleLocalStageStreamMutedState, ...streamHandlers } =
    useStreams(stageConfig);
  const { participants, ...participantHandlers } = useParticipants(stageConfig);
  const [connectError, setConnectError] = useState<StageError | null>(null);
  const [publishError, setPublishError] = useState<StageError | null>(null);
  const [connectState, setConnectState] = useState(DISCONNECTED);
  const [publishState, setPublishState] = useState(NOT_PUBLISHED);

  const subscribeOnly =
    connectState === CONNECTED && publishState !== PUBLISHED;

  const [stage] = useState(function createStage() {
    const stg = StageFactory.create(stageConfig);

    // Register stage events strictly for UI state management
    stg.on(STAGE_ERROR, onStageError);
    stg.on(STAGE_CONNECTION_STATE_CHANGED, onConnectionStateChanged);
    stg.on(STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED, onPublishStateChanged);
    stg.on(STAGE_PARTICIPANT_JOINED, participantHandlers.upsertParticipant);
    stg.on(STAGE_PARTICIPANT_LEFT, participantHandlers.removeParticipant);
    stg.on(STAGE_PARTICIPANT_STREAMS_ADDED, streamHandlers.upsertStreams);
    stg.on(STAGE_PARTICIPANT_STREAMS_REMOVED, streamHandlers.removeStreams);
    stg.on(STAGE_STREAM_MUTE_CHANGED, participantHandlers.upsertParticipant);
    stg.on(STAGE_STREAM_MUTE_CHANGED, streamHandlers.upsertStreams);

    return stg;
  });

  function onConnectionStateChanged(state: StageConnectionState) {
    setConnectState(state);

    if (state === CONNECTED || state === DISCONNECTED) {
      setConnectError(null); // Reset the connect error
    }
  }

  function onPublishStateChanged(
    participant: StageParticipantInfo,
    state: StageParticipantPublishState
  ) {
    setPublishState(state);
    participantHandlers.upsertParticipant(participant);

    if (state === PUBLISHED || state === NOT_PUBLISHED) {
      setPublishError(null); // Reset the publish error
    }
  }

  function onStageError(error: StageError) {
    if (error.category === StageErrorCategory.JOIN_ERROR) {
      setConnectError(error); // Update the connect error
    }

    if (error.category === StageErrorCategory.PUBLISH_ERROR) {
      setPublishError(error); // Update the publish error
    }
  }

  const getParticipants = useMemo(
    () =>
      memoize(
        (filters: ParticipantsFilters = {}) => {
          const ppts: RoomParticipantInfo[] = [];
          const keys = Object.keys(filters) as (keyof ParticipantsFilters)[];

          participants.forEach((participant, participantId) => {
            const shouldInclude = keys.every((key) => {
              if (key === 'canSubscribeTo') {
                return (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  participant.capabilities?.has('subscribe' as any) ===
                  filters[key]
                );
              }

              return participant[key] === filters[key];
            });

            if (shouldInclude) {
              ppts.push({
                ...participant,
                mediaStream: mediaStreams.get(participantId)
              });
            }
          });

          return ppts;
        },
        { strategy: memoize.strategies.variadic }
      ),
    [mediaStreams, participants]
  );

  const value = useMemo<StageContext>(
    () => ({
      connectState,
      connectError,
      publishState,
      publishError,
      subscribeOnly,
      getParticipants,
      toggleLocalStageStreamMutedState,
      join: stage.join,
      leave: stage.leave,
      publish: stage.strategyMutators.publish,
      unpublish: stage.strategyMutators.unpublish,
      updateStreamsToPublish: stage.strategyMutators.updateStreamsToPublish
    }),
    [
      connectError,
      connectState,
      getParticipants,
      publishError,
      publishState,
      stage,
      subscribeOnly,
      toggleLocalStageStreamMutedState
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export { StageProvider, useStage };
