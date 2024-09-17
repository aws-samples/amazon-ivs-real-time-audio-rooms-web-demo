import { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs';
import { ddbSdk, sqsSdk } from '@Lambda/sdk';

async function handler() {
  const activeRooms = await ddbSdk.getActiveRoomRecords();
  const batchEntries = activeRooms.map<SendMessageBatchRequestEntry>(
    (activeRoom) => ({
      Id: activeRoom.id,
      MessageGroupId: 'ActiveRooms',
      MessageBody: JSON.stringify(activeRoom)
    })
  );

  await sqsSdk.batchSendMessages(
    batchEntries,
    process.env.ACTIVE_ROOMS_QUEUE_URL as string
  );
}

export { handler };
