import { roomsApi } from '@Api';
import { StageFactory } from '@Contexts/Stage';
import { getLocalStorageValue } from '@LocalStorage';
import { createUsername } from '@Utils';
import { defer, LoaderFunctionArgs, redirect } from 'react-router-dom';
import { JoinResponse } from 'shared/types';

interface RoomLoaderData {
  joinResponse: PromiseLike<JoinResponse>;
  createNewRoom: boolean;
}

function landingLoader({ params }: LoaderFunctionArgs) {
  StageFactory.destroyStages();

  const { roomId } = params;
  let generatedUsername = '';

  if (roomId) {
    generatedUsername = createUsername();
  }

  return { generatedUsername };
}

function roomLoader({ params, request }: LoaderFunctionArgs) {
  try {
    const { searchParams } = new URL(request.url);
    const createNewRoom = searchParams.get('new_stage') === 'true';
    const storedUsername =
      params.roomId &&
      getLocalStorageValue('username')?.[params.roomId]?.username;
    const username = storedUsername || searchParams.get('username');

    if (!username) {
      return redirect(`/${params.roomId}`);
    }

    return defer({
      joinResponse: createNewRoom
        ? roomsApi.joinRoom(username)
        : roomsApi.joinRoom(username, params.roomId),
      createNewRoom
    });
  } catch (error) {
    console.error('Error in room loader:', error);

    return redirect('/');
  }
}

export type { RoomLoaderData };

export { landingLoader, roomLoader };
