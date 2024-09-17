import { StageParticipantInfo } from 'amazon-ivs-web-broadcast';

type ValueOf<T> = T[keyof T];

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

enum StackType {
  BACKEND = 'backend',
  WEBSITE = 'website'
}

enum AppEnv {
  DEV = 'development',
  PROD = 'production'
}

interface RoomParticipantAttributes {
  [attr: string]: string;
  name: string;
}

/**
 * Stage API Participant Types (backend)
 */

interface RoomParticipant {
  id: string;
  isPublishing: boolean;
  attributes: RoomParticipantAttributes;
}

type RoomParticipants = Record<string, RoomParticipant>;

/**
 * Backend API Responses
 */
interface StageClientConfig {
  readonly token: string;
  readonly participantId: string;
}

interface JoinResponse {
  roomId: string;
  stageArn: string;
  stageConfig: StageClientConfig;
}

interface GetRoomResponse {
  id: string;
  stageArn: string;
  createdAt: string;
  isActive: boolean;
  participants: RoomParticipants;
}

/**
 * Stage Client Participant Types (frontend)
 */

interface RoomParticipantInfo
  extends RoomParticipant,
    Partial<Omit<StageParticipantInfo, keyof RoomParticipant>> {
  mediaStream?: MediaStream;
}

export type {
  GetRoomResponse,
  JoinResponse,
  RoomParticipant,
  RoomParticipantAttributes,
  RoomParticipantInfo,
  RoomParticipants,
  StageClientConfig,
  ValueOf,
  WithRequired
};

export { AppEnv, StackType };
