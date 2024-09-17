import { useMap } from '@Hooks';
import { StageClientConfig } from '@Shared/types';
import {
  LocalStageStream,
  RemoteStageStream,
  StageParticipantInfo,
  StageStream
} from 'amazon-ivs-web-broadcast';
import { useCallback, useEffect } from 'react';

function useStreams(stageConfig: StageClientConfig) {
  const { participantId: localParticipantId } = stageConfig;
  const [stageStreams, stageStreamsMutators] = useMap<StageStream[]>();
  const [mediaStreams, mediaStreamsMutators] = useMap<MediaStream>();

  const toggleStageStreamMutedState = useCallback(
    (participantId: string, muted?: boolean) => {
      const streams = stageStreams.get(participantId);
      const stream = streams?.find((s) => s.streamType === 'audio');

      if (stream) {
        (stream as LocalStageStream | RemoteStageStream).setMuted(
          muted ?? !stream.isMuted
        );

        return stream.isMuted;
      }
    },
    [stageStreams]
  );

  const toggleLocalStageStreamMutedState = useCallback(
    (muted?: boolean) => toggleStageStreamMutedState(localParticipantId, muted),
    [localParticipantId, toggleStageStreamMutedState]
  );

  const upsertStreams = useCallback(
    (
      participant: StageParticipantInfo,
      streams: StageStream | StageStream[]
    ) => {
      const streamsToUpsert = [streams].flat();
      stageStreamsMutators.set(participant.id, (prevStageStreams = []) =>
        streamsToUpsert.reduce((nextStageStreams, streamToUpsert) => {
          const nextStreams = nextStageStreams.concat();
          const streamIndex = nextStreams.findIndex(
            (stream) => stream.streamType === streamToUpsert.streamType
          );

          if (streamIndex === -1) {
            // insert stream
            nextStreams.push(streamToUpsert);
          } else {
            // update stream
            nextStreams[streamIndex] = streamToUpsert;
          }

          return nextStreams;
        }, prevStageStreams)
      );
    },
    [stageStreamsMutators]
  );

  const removeStreams = useCallback(
    (
      participant: StageParticipantInfo,
      streams: StageStream | StageStream[]
    ) => {
      const streamsToRemove = [streams].flat();
      stageStreamsMutators.set(participant.id, (prevStageStreams = []) =>
        prevStageStreams.filter((prevStageStream) => {
          const streamIndex = streamsToRemove.findIndex(
            (removedStream) =>
              prevStageStream.streamType === removedStream.streamType
          );

          return streamIndex === -1;
        })
      );
    },
    [stageStreamsMutators]
  );

  const resetStreams = useCallback(() => {
    mediaStreamsMutators.clear();
    stageStreamsMutators.clear();
  }, [mediaStreamsMutators, stageStreamsMutators]);

  // Update the media stream containers when changes have been made to the stage streams
  useEffect(() => {
    stageStreams.forEach((streams, participantId) => {
      const mediaStream = mediaStreams.get(participantId) || new MediaStream();
      const mediaStreamTracks = mediaStream.getTracks();
      const stageStreamTracks = streams.map((st) => st.mediaStreamTrack); // "source-of-truth"

      // Remove tracks that are in nextMediaStreamTracks but not in stageStreamTracks
      for (const mediaStreamTrack of mediaStreamTracks) {
        if (!stageStreamTracks.includes(mediaStreamTrack)) {
          mediaStream.removeTrack(mediaStreamTrack);
        }
      }

      // Add tracks that are in nextTracks but not in nextMediaStreamTracks
      for (const stageStreamTrack of stageStreamTracks) {
        if (!mediaStreamTracks.includes(stageStreamTrack)) {
          mediaStream.addTrack(stageStreamTrack);
        }
      }

      if (mediaStream.active) {
        mediaStreamsMutators.set(participantId, mediaStream);
      } else {
        mediaStreamsMutators.remove(participantId);
        stageStreamsMutators.remove(participantId);
      }
    });
  }, [mediaStreams, mediaStreamsMutators, stageStreams, stageStreamsMutators]);

  return {
    mediaStreams,
    upsertStreams,
    removeStreams,
    resetStreams,
    toggleLocalStageStreamMutedState
  };
}

export default useStreams;
