import { PageSpinner } from '@Components/Spinner';
import { errorMessages } from '@Content';
import { DeviceProvider } from '@Contexts/Device';
import { ModalManagerProvider } from '@Contexts/ModalManager';
import { StageProvider } from '@Contexts/Stage';
import { useLocalStorage } from '@Hooks';
import { localStorageProvider } from '@LocalStorage';
import { Landing, Room } from '@Pages';
import { landingLoader, roomLoader, RoomLoaderData } from '@Utils/loaders';
import { AxiosError } from 'axios';
import { Suspense, useEffect, useRef } from 'react';
import {
  Await,
  createBrowserRouter,
  createRoutesFromElements,
  generatePath,
  matchRoutes,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  UIMatch,
  useAsyncError,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigate,
  useSearchParams
} from 'react-router-dom';
import { JoinResponse } from 'shared/types';
import { SWRConfig } from 'swr';

import { LandingPage } from './pages/Landing';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <SWRConfig value={{ provider: localStorageProvider }}>
          <Outlet />
        </SWRConfig>
      }
    >
      <Route
        path="/"
        loader={landingLoader}
        element={<Landing />}
        shouldRevalidate={() => false}
      >
        <Route index element={<Landing />} />
        <Route path="/:roomId" element={<Landing />} />
      </Route>
      <Route
        id="room"
        loader={roomLoader}
        element={<RoomLoader />}
        shouldRevalidate={() => false}
      >
        <Route
          path="/room/:roomId"
          element={
            <ModalManagerProvider>
              <StageProvider>
                <DeviceProvider>
                  <Room />
                </DeviceProvider>
              </StageProvider>
            </ModalManagerProvider>
          }
          handle={{ error: errorMessages.session_start_failed }}
        />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Route>
  )
);

function RoomLoader() {
  const { joinResponse, createNewRoom } = useLoaderData() as RoomLoaderData;
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username')!;

  return (
    <Suspense
      fallback={
        createNewRoom ? (
          <LandingPage username={username} isLoading />
        ) : (
          <PageSpinner />
        )
      }
    >
      <Await resolve={joinResponse} errorElement={<RoomLoaderError />}>
        {({ roomId }: JoinResponse) => (
          <RoomRedirect roomId={roomId} username={username} />
        )}
      </Await>
    </Suspense>
  );
}

function RoomRedirect({
  roomId,
  username: usernameSearchParam
}: {
  roomId: string;
  username?: string;
}) {
  const storedRef = useRef(false);
  const { createNewRoom } = useLoaderData() as RoomLoaderData;
  const location = useLocation();
  const navigate = useNavigate();
  const routeMatches = matchRoutes(router.routes, location);
  const currRouteMatch = routeMatches?.at(-1);
  const currRoutePath = currRouteMatch?.route.path || '/';
  const [storedUsernames, storeUsername] = useLocalStorage('username');
  const username =
    storedUsernames?.[roomId]?.username || (usernameSearchParam as string);

  useEffect(() => {
    if (roomId && username && !storedRef.current) {
      /**
       * Saving a username for a specific room
       * when storedUsername does not exist for room or does not match
       */
      storeUsername({
        ...storedUsernames,
        [roomId]: { username, updatedAt: Date.now() }
      });
      storedRef.current = true;

      navigate(generatePath(currRoutePath, { roomId }), {
        replace: true
      });
    }
  }, [
    currRoutePath,
    navigate,
    roomId,
    storedUsernames,
    storeUsername,
    createNewRoom,
    username
  ]);

  return <Outlet />;
}

function RoomLoaderError() {
  const asyncError = useAsyncError();
  const isApiError = asyncError instanceof AxiosError;

  const matches = useMatches();
  const route = matches.at(-1) as UIMatch<unknown, { error: string }>;
  const error = route?.handle.error;

  return isApiError && <Navigate replace to="/" state={{ error }} />;
}

function App() {
  return <RouterProvider router={router} fallbackElement={<PageSpinner />} />;
}

export default App;
