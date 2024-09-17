import { ddbSdk } from '@Lambda/sdk';
import { APIException } from '@Lambda/types';
import { createErrorResponse, createSuccessResponse } from '@Lambda/utils';
import {
  GetRoomResponse,
  RoomParticipant,
  RoomParticipants
} from '@Shared/types';
import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWithCognitoAuthorizerEvent
} from 'aws-lambda';

async function handler(
  event: APIGatewayProxyWithCognitoAuthorizerEvent
): Promise<APIGatewayProxyResultV2> {
  const roomId = event.pathParameters!.proxy as string;
  let response: GetRoomResponse;

  console.info('[EVENT]', JSON.stringify(event));

  try {
    const roomRecord = await ddbSdk.getRoomRecord(roomId);

    if (!roomRecord) {
      return createErrorResponse({
        code: 404,
        name: APIException.ROOM_NOT_FOUND,
        message: `No room exists with the room ID "${roomId}"`
      });
    }

    console.info('Found room record', roomRecord);

    const {
      id,
      stageArn,
      createdAt,
      activeSessionId,
      participantAttributes,
      publishers = new Set(),
      subscribers = new Set()
    } = roomRecord;
    const isActive = !!activeSessionId;

    const participants: RoomParticipants = {};

    Array.from(subscribers).forEach((participantId) => {
      const attributes = participantAttributes[participantId];
      const isPublishing = publishers.has(participantId);
      const participant: RoomParticipant = {
        isPublishing,
        attributes,
        id: participantId
      };

      participants[participantId] = participant;
    });

    response = {
      id,
      stageArn,
      createdAt,
      isActive,
      participants
    };
  } catch (error) {
    console.error(error);

    return createErrorResponse({ message: 'Failed to get room details.' });
  }

  console.info('[RESPONSE]', response);

  return createSuccessResponse({ body: response });
}

export { handler };
