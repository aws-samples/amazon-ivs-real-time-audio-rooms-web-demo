import { roomsApi } from '@Api';
import { GetRoomResponse, JoinResponse } from '@Shared/types';
import { useMemo } from 'react';
import { useAsyncValue } from 'react-router-dom';
import useSWR from 'swr';

function useRoom() {
  const joinData = useAsyncValue() as JoinResponse | undefined;
  const { data: roomData, mutate: mutateRoom } = useSWR(
    joinData?.roomId || null,
    roomsApi.getRoom,
    { refreshInterval: 1000 }
  );

  const room = useMemo<Partial<GetRoomResponse>>(
    () => ({ ...roomData }),
    [roomData]
  );

  return [room, mutateRoom] as const;
}

export default useRoom;
