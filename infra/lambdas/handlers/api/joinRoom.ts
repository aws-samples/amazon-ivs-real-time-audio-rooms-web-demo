import { StageEndpoints } from '@aws-sdk/client-ivs-realtime';
import { ddbSdk, realTimeSdk } from '@Lambda/sdk';
import { JoinRoomBody, RoomRecord } from '@Lambda/types';
import {
  createErrorResponse,
  createRoomIdFromStageArn,
  createSuccessResponse
} from '@Lambda/utils';
import { JoinResponse, StageClientConfig } from '@Shared/types';
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';

async function createRoom() {
  const stage = await realTimeSdk.createStage();

  const stageArn = stage.arn as string;
  const roomId = createRoomIdFromStageArn(stageArn); // e.g. abCd1234E5f6

  return ddbSdk.createRoomRecord({
    stageArn,
    id: roomId,
    stageEndpoints: stage.endpoints as StageEndpoints
  });
}

async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> {
  const { username, roomId }: JoinRoomBody = JSON.parse(event.body || '{}');
  let response: JoinResponse;

  console.info('[EVENT]', JSON.stringify(event));

  try {
    let roomRecord: RoomRecord | undefined;

    if (roomId) {
      console.info(`Checking if a room record exists for "${roomId}".`);
      roomRecord = await ddbSdk.getRoomRecord(roomId);

      if (roomRecord) {
        console.info('Found room record', roomRecord);
      } else {
        throw new Error('Failed to find room record.');
      }
    } else {
      console.info('Creating new room');
      roomRecord = await createRoom();
    }

    console.info('Generating participant token.');
    const { token, participantId, attributes } = await realTimeSdk.createToken({
      userData: {
        name: username
      },
      stageArn: roomRecord.stageArn,
      stageEndpoints: roomRecord.stageEndpoints
    });

    await ddbSdk.updateRoomParticipant({
      id: roomRecord.id,
      participant: { participantId, attributes }
    });

    const stageConfig: StageClientConfig = {
      token,
      participantId
    };

    response = {
      stageConfig,
      stageArn: roomRecord.stageArn,
      roomId: roomRecord.id
    };
  } catch (error) {
    console.error(error);

    return createErrorResponse({ message: 'Failed to join/create room.' });
  }

  console.info('[RESPONSE]', response);

  return createSuccessResponse({ body: response });
}

export { handler };
