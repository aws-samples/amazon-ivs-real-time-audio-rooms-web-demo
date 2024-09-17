import { StageEndpoints } from '@aws-sdk/client-ivs-realtime';
import { RoomParticipantAttributes } from '@Shared/types';

enum APIException {
  BAD_INPUT = 'BadInputException',
  ROOM_NOT_FOUND = 'RoomNotFoundException'
}

interface RoomRecord {
  id: string; // partition key
  createdAt: string;
  updatedAt: string;
  stageArn: string;
  stageEndpoints: StageEndpoints;
  participantAttributes: Record<string, RoomParticipantAttributes>;
  publishers?: Set<string>;
  subscribers?: Set<string>;
  activeSessionId?: string;
}

interface ActiveRoomRecord {
  activeSessionId: string; // partition key
  id: string;
  stageArn: string;
  updatedAt: string; // used for SQS message deduplication
}

interface UserData {
  name: string;
}

interface StageUpdateEventDetail {
  event_name: 'Participant Published' | 'Participant Unpublished';
  participant_id: string;
  session_id: string;
  user_id: string;
}

interface JoinRoomBody {
  username: string;
  roomId?: string;
}

export { APIException };

export type {
  ActiveRoomRecord,
  JoinRoomBody,
  RoomRecord,
  StageUpdateEventDetail,
  UserData
};
