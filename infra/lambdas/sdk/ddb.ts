import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ReturnValue,
  ScanCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { Participant, ParticipantState } from '@aws-sdk/client-ivs-realtime';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { convertToAttr, marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ActiveRoomRecord, RoomRecord } from '@Lambda/types';
import { WithRequired } from '@Shared/types';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient(), {
  marshallOptions: {
    convertClassInstanceToMap: false, // Whether to convert typeof object to map attribute
    convertEmptyValues: false, // Whether to automatically convert empty strings, blobs, and sets to `null`
    removeUndefinedValues: true // Whether to remove undefined values while marshalling
  },
  unmarshallOptions: {
    wrapNumbers: false // Whether to return numbers as a string instead of converting them to native JavaScript numbers
  }
});

async function createRoomRecord(
  roomAttributes: Pick<RoomRecord, 'id' | 'stageArn' | 'stageEndpoints'>
) {
  const now = new Date().toISOString();
  const roomRecord: RoomRecord = {
    ...roomAttributes,
    createdAt: now,
    updatedAt: now,
    participantAttributes: {}
  };

  await ddbDocClient.send(
    new PutItemCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      Item: marshall(roomRecord)
    })
  );

  return roomRecord;
}

async function deleteRoomRecord(id: string) {
  await ddbDocClient.send(
    new DeleteItemCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      Key: { id: convertToAttr(id) }
    })
  );
}

async function getActiveRoomRecords() {
  const { Items = [] } = await ddbDocClient.send(
    new ScanCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      IndexName: process.env.ACTIVE_ROOMS_INDEX_NAME
    })
  );

  return Items.map((item) => unmarshall(item)) as ActiveRoomRecord[];
}

async function getRoomRecord(roomId: string) {
  const { Item } = await ddbDocClient.send(
    new GetItemCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      Key: { id: convertToAttr(roomId) }
    })
  );

  if (Item) {
    return unmarshall(Item) as RoomRecord;
  }
}

async function getRoomRecords<Attributes extends keyof Partial<RoomRecord>>(
  attributesToGet: Attributes[] = [],
  filters: Partial<RoomRecord> = {}
) {
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, AttributeValue> = {};

  const filterExpression = Object.entries(filters)
    .map(([filterKey, filterValue]) => {
      expressionAttributeNames[`#${filterKey}`] = filterKey;
      expressionAttributeValues[`:${filterValue}`] = convertToAttr(filterValue);

      return `#${filterKey} = :${filterValue}`;
    })
    .join(' AND ');

  const projectionExpression = attributesToGet
    .map((attr) => {
      expressionAttributeNames[`#${attr}`] = attr;

      return `#${attr}`;
    })
    .join(',');

  const { Items = [] } = await ddbDocClient.send(
    new ScanCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      FilterExpression: filterExpression.length ? filterExpression : undefined,
      ProjectionExpression: projectionExpression.length
        ? projectionExpression
        : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length
        ? expressionAttributeNames
        : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length
        ? expressionAttributeValues
        : undefined
    })
  );

  return Items.map(
    (item) => unmarshall(item) as Pick<Required<RoomRecord>, Attributes>
  );
}

async function updateRoomParticipant({
  id,
  participant,
  isPublishing
}: {
  id: string;
  participant: WithRequired<Participant, 'participantId'>;
  isPublishing?: boolean;
}) {
  const { participantId, state, attributes } = participant;
  const expressionAttributeNames: Record<string, string> = { '#id': 'id' };
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const setActions: string[] = [];
  const addActions: string[] = [];
  const delActions: string[] = [];

  if (attributes) {
    expressionAttributeNames['#participantAttributes'] =
      'participantAttributes';
    expressionAttributeNames[`#${participantId}`] = participantId;
    expressionAttributeValues[':attributes'] = convertToAttr(attributes);
    const action = `#participantAttributes.#${participantId} = :attributes`;

    setActions.push(action);
  }

  if (isPublishing !== undefined) {
    expressionAttributeNames['#publishers'] = 'publishers';
    expressionAttributeValues[':participantId'] = convertToAttr(
      new Set([participantId])
    );
    const action = '#publishers :participantId';

    if (isPublishing) {
      addActions.push(action);
    } else {
      delActions.push(action);
    }
  }

  if (state !== undefined) {
    expressionAttributeNames['#subscribers'] = 'subscribers';
    expressionAttributeValues[':participantId'] = convertToAttr(
      new Set([participantId])
    );
    const isConnected = state === ParticipantState.CONNECTED;
    const action = '#subscribers :participantId';

    if (isConnected) {
      addActions.push(action);
    } else {
      delActions.push(action);
    }
  }

  const now = new Date().toISOString();
  expressionAttributeValues[':updatedAt'] = convertToAttr(now);
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  setActions.push('#updatedAt = :updatedAt');

  const setClause = setActions.length ? `SET ${setActions.join(',')}` : '';
  const addClause = addActions.length ? `ADD ${addActions.join(',')}` : '';
  const delClause = delActions.length ? `DELETE ${delActions.join(',')}` : '';

  const updateExpression = [setClause, addClause, delClause].join(' ').trim();
  const conditionExpression = 'attribute_exists(#id)';

  const { Attributes = {} } = await ddbDocClient.send(
    new UpdateItemCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      Key: { id: convertToAttr(id) },
      UpdateExpression: updateExpression,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: ReturnValue.ALL_NEW
    })
  );

  return unmarshall(Attributes) as RoomRecord;
}

async function updateRoomRecord({
  id,
  attrsToSet = {},
  attrsToRemove = [],
  onlyUpdateIfActive = false
}: {
  id: string;
  attrsToSet?: Partial<Omit<RoomRecord, 'id'>>;
  attrsToRemove?: (keyof Partial<Omit<RoomRecord, 'id'>>)[];
  onlyUpdateIfActive?: boolean;
}) {
  const expressionAttributeValues: Record<string, AttributeValue> = {};
  const expressionAttributeNames: Record<string, string> = { '#id': 'id' };

  const setActions = Object.entries(attrsToSet).map(([key, value]) => {
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = convertToAttr(value);

    return `#${key} = :${key}`;
  });

  const remActions = attrsToRemove.map((key) => {
    expressionAttributeNames[`#${key}`] = key;

    return `#${key}`;
  });

  const now = new Date().toISOString();
  expressionAttributeValues[':updatedAt'] = convertToAttr(now);
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  setActions.push('#updatedAt = :updatedAt');

  const setClause = setActions.length ? `SET ${setActions.join(',')}` : '';
  const remClause = remActions.length ? `REMOVE ${remActions.join(',')}` : '';

  const updateExpression = [setClause, remClause].join(' ').trim();

  let conditionExpression = 'attribute_exists(#id)';
  if (onlyUpdateIfActive) {
    conditionExpression += ' and attribute_exists(#activeSessionId)';
    expressionAttributeNames['#activeSessionId'] = 'activeSessionId';
  }

  await ddbDocClient.send(
    new UpdateItemCommand({
      TableName: process.env.ROOMS_TABLE_NAME,
      Key: { id: convertToAttr(id) },
      UpdateExpression: updateExpression,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: ReturnValue.ALL_NEW
    })
  );
}

export {
  createRoomRecord,
  deleteRoomRecord,
  getActiveRoomRecords,
  getRoomRecord,
  getRoomRecords,
  updateRoomParticipant,
  updateRoomRecord
};
