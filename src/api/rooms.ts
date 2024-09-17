import './setup';

import axios from 'axios';
import { GetRoomResponse, JoinResponse } from 'shared/types';

async function joinRoom(
  username: string,
  roomId?: string
): Promise<JoinResponse> {
  const response = await axios.post('/room/join', { username, roomId });

  return response.data;
}

async function getRoom(roomId: string): Promise<GetRoomResponse> {
  const response = await axios.get(`/rooms/${roomId}`);

  return response.data;
}

export { getRoom, joinRoom };
