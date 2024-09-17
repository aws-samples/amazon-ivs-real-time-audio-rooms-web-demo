import { useMap, useRoom } from '@Hooks';
import {
  GetRoomResponse,
  RoomParticipantInfo,
  StageClientConfig
} from '@Shared/types';
import { StageParticipantInfo } from 'amazon-ivs-web-broadcast';
import { useCallback, useMemo } from 'react';

type Participants = ReadonlyMap<string, RoomParticipantInfo>;

function useParticipants(stageConfig: StageClientConfig) {
  const { participantId: localParticipantId } = stageConfig;
  const [stageParticipants, stageParticipantsMutators] =
    useMap<StageParticipantInfo>();
  const [room, mutateRoom] = useRoom();
  const roomParticipantsInfo = room.participants;

  const participants = useMemo<Participants>(() => {
    // Initialize from the stage participants map to preserve insertion order
    const participantsMap = new Map(stageParticipants as Participants);

    // Augment participantsMap with the room participant info retrieved from the backend
    if (roomParticipantsInfo) {
      Object.entries(roomParticipantsInfo).forEach(([id, info]) => {
        participantsMap.set(id, { ...info, ...participantsMap.get(id) });
      });
    }

    // Ensure the local participant is the last participant in participantsMap
    const localParticipant = participantsMap.get(localParticipantId);
    if (localParticipant) {
      participantsMap.delete(localParticipant.id);
      participantsMap.set(localParticipant.id, localParticipant);
    }

    return participantsMap;
  }, [localParticipantId, roomParticipantsInfo, stageParticipants]);

  const upsertParticipant = useCallback(
    async (participant: StageParticipantInfo) => {
      const { id: participantId } = participant;

      await mutateRoom(
        (currentData?: GetRoomResponse) => {
          const mutatedData = structuredClone(currentData);

          if (mutatedData) {
            mutatedData.participants[participantId] = {
              ...mutatedData.participants[participantId],
              ...(participant as RoomParticipantInfo)
            };
          }

          return mutatedData;
        },
        { revalidate: false }
      );

      stageParticipantsMutators.set(participantId, (prevParticipant) => ({
        ...prevParticipant,
        ...participant
      }));
    },
    [mutateRoom, stageParticipantsMutators]
  );

  const removeParticipant = useCallback(
    async (participant: StageParticipantInfo) => {
      const { id: participantId } = participant;

      await mutateRoom(
        (currentData?: GetRoomResponse) => {
          const mutatedData = structuredClone(currentData);

          if (mutatedData) {
            delete mutatedData.participants[participantId];
          }

          return mutatedData;
        },
        { revalidate: false }
      );

      stageParticipantsMutators.remove(participantId);
    },
    [mutateRoom, stageParticipantsMutators]
  );

  return {
    participants,
    upsertParticipant,
    removeParticipant,
    resetParticipants: stageParticipantsMutators.clear
  };
}

export default useParticipants;
