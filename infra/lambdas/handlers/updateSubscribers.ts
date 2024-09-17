import { ParticipantState } from '@aws-sdk/client-ivs-realtime';
import { ddbSdk, realTimeSdk } from '@Lambda/sdk';
import { ActiveRoomRecord } from '@Lambda/types';
import { SQSEvent } from 'aws-lambda';

async function handler(event: SQSEvent) {
  const activeRooms: ActiveRoomRecord[] = event.Records.map(({ body }) =>
    JSON.parse(body)
  );

  await Promise.allSettled(
    activeRooms.map(async (activeRoom) => {
      const { id, activeSessionId, stageArn } = activeRoom;
      let subscribers: Set<string> | undefined;

      try {
        const connectedParticipants = await realTimeSdk.listParticipants(
          stageArn,
          activeSessionId,
          ParticipantState.CONNECTED
        );

        subscribers = new Set(
          connectedParticipants.map(
            (participant) => participant.participantId as string
          )
        );
      } catch (error) {
        console.error(error);
        /**
         * Swallow the error to allow for the RoomRecord update to proceed.
         * Doing so will change the updatedAt attribute and allow us to send a
         * subsequent SQS message to the queue for this room without having
         * to wait for the 5-minute message deduplication timeout to expire.
         */
      }

      try {
        await ddbSdk.updateRoomRecord({
          id,
          onlyUpdateIfActive: true,
          attrsToSet: subscribers && { subscribers }
        });
      } catch (error) {
        console.error(error);
        // Swallow the error to continue processing remaining active rooms
      }
    })
  );
}

export { handler };
