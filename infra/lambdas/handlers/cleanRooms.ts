import { ddbSdk, realTimeSdk } from '@Lambda/sdk';
import { RoomRecord } from '@Lambda/types';
import { getElapsedTimeInSeconds } from '@Lambda/utils';

async function handler() {
  try {
    const [roomRecords, stages] = await Promise.all([
      ddbSdk.getRoomRecords(['id', 'stageArn', 'updatedAt']),
      realTimeSdk.listStages()
    ]);

    console.info('Data to process', JSON.stringify({ roomRecords, stages }));

    const stageSummaryMap = new Map(
      stages.map(({ arn, ...restData }) => [arn, restData])
    );

    const results = await Promise.all(
      roomRecords.map(async (roomRecord) => {
        const { id, stageArn, updatedAt } = roomRecord;
        const stageSummary = stageSummaryMap.get(stageArn);
        const isActive = !!stageSummary?.activeSessionId;
        const isStale = getElapsedTimeInSeconds(updatedAt) > 24 * 3600;
        const shouldRetain = stageSummary?.tags?.retain === 'Y';

        if (!isActive && isStale && !shouldRetain) {
          try {
            await Promise.all([
              realTimeSdk.deleteStage(stageArn),
              ddbSdk.deleteRoomRecord(id)
            ]);

            return roomRecord;
          } catch (error) {
            console.error(error);
            // Swallow the error to continue processing remaining items
          }
        }
      })
    );

    const deletedRecords = results.filter<RoomRecord>(
      (record): record is RoomRecord => record !== undefined
    );
    console.info('Deleted room records', deletedRecords);
  } catch (error) {
    console.error(error);
  }
}

export { handler };
