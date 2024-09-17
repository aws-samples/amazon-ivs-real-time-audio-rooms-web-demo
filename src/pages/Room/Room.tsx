import { AnimatedModal, Spinner } from '@Components';
import { SpinnerSize } from '@Components/Spinner';
import { STAGE_PUBLISHING_CAPACITY } from '@Constants';
import { useDevice } from '@Contexts/Device';
import { useModalManager } from '@Contexts/ModalManager';
import { StageFactory, useStage } from '@Contexts/Stage';
import { useBreakpoint, useMount } from '@Hooks';
import { Users } from '@phosphor-icons/react';
import { clsm } from '@Utils';
import {
  AspectRatio,
  getGridContainerDimensions,
  LAYOUT_CONFIG
} from '@Utils/layout';
import { RoomLoaderData } from '@Utils/loaders';
import {
  StageConnectionState,
  StageParticipantPublishState
} from 'amazon-ivs-web-broadcast';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { Toaster } from 'react-hot-toast';
import { useResizeDetector } from 'react-resize-detector';
import { useRouteLoaderData } from 'react-router-dom';

import { MediaControls } from './components';
import ParticipantsGrid from './ParticipantsGrid';

function Room() {
  const { createNewRoom } = useRouteLoaderData('room') as RoomLoaderData;
  const stage = useStage();
  const userMedia = useDevice();
  const { modalOpen, setModalOpen, modalContent } = useModalManager();
  const initLocked = useRef(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const isMounted = useMount();
  const isFullWidthGrid = useBreakpoint('xs');
  const [isMuted, setIsMuted] = useState(userMedia.audioMuted); // Keep track of mute state when not publishing
  const isConnecting = stage.connectState === StageConnectionState.CONNECTING;
  const isAttemptingPublish =
    stage.publishState === StageParticipantPublishState.ATTEMPTING_PUBLISH;
  const isUnpublished =
    stage.publishState === StageParticipantPublishState.NOT_PUBLISHED;
  const isConnected = stage.connectState === StageConnectionState.CONNECTED;
  const isLoading = isConnecting || isAttemptingPublish;
  const publishers = stage.getParticipants({
    isPublishing: true,
    canSubscribeTo: true
  });
  const subscribers = stage.getParticipants({
    isPublishing: false
  });
  const showJoinSessionTile =
    (isConnected &&
      isUnpublished &&
      publishers.length < STAGE_PUBLISHING_CAPACITY) ||
    isAttemptingPublish;

  const enterRoom = useCallback(
    async ({
      joinMuted = false,
      joinAsListener = false,
      userStreamToPublish = userMedia.mediaStream
    }: {
      joinMuted?: boolean;
      joinAsListener?: boolean;
      userStreamToPublish?: MediaStream;
    } = {}) => {
      try {
        if (joinMuted) userMedia.toggleAudio({ muted: true });

        await stage.join(joinAsListener ? undefined : userStreamToPublish);

        if (joinAsListener) userMedia.stopUserMedia();
      } catch (error) {
        StageFactory.leaveStages();
      }
    },
    [userMedia, stage]
  );

  const startPublishing = useCallback(async () => {
    const userStreamToPublish = await userMedia.startUserMedia();
    userMedia.toggleAudio({ muted: isMuted });
    stage.publish(userStreamToPublish);
  }, [userMedia, stage, isMuted]);

  /**
   * Audio Room initialization entry-point
   */
  useEffect(() => {
    if (initLocked.current) return;

    async function initRoom() {
      /**
       * Start the user's device media
       */
      const userStreamToPublish = await userMedia.startUserMedia();

      /**
       * On mount we will join the stage
       */
      if (isMounted()) {
        await enterRoom({
          userStreamToPublish,
          joinAsListener: !createNewRoom
        });
      }

      /**
       * If the Room unmounts at any point during the preceding async operations,
       * then we will make sure to stop all actively running user devices
       */
      if (!isMounted()) userMedia.stopUserMedia();
    }

    initLocked.current = true;
    initRoom();
  }, [isMounted, enterRoom, userMedia.stopUserMedia, userMedia, createNewRoom]);

  const updateGridContainer = useCallback(() => {
    const tileCount = publishers.length + (showJoinSessionTile ? 1 : 0);

    const { width, maxHeight } = getGridContainerDimensions(
      Math.max(1, tileCount),
      isFullWidthGrid
    );

    if (gridContainerRef.current) {
      gridContainerRef.current.style.width = width;
      gridContainerRef.current.style.maxHeight = maxHeight;
    }

    // Update tile aspect ratio between auto and portrait based on screen size
    LAYOUT_CONFIG.aspectRatio = isFullWidthGrid
      ? AspectRatio.AUTO
      : AspectRatio.PORTRAIT;

    // Update grid layout gap based on screen size
    LAYOUT_CONFIG.gridGap =
      window.innerHeight <= 520 || isFullWidthGrid ? 2 : 12;
  }, [isFullWidthGrid, publishers.length, showJoinSessionTile]);

  // Re-compute grid container dimension calculations on participant count changes
  useLayoutEffect(updateGridContainer, [
    updateGridContainer,
    publishers.length,
    showJoinSessionTile
  ]);
  // Re-compute grid container dimension calculations on resize events
  useResizeDetector({
    targetRef: gridContainerRef,
    onResize: updateGridContainer
  });

  return (
    <div>
      <Toaster />
      <div className={clsm(['flex', 'flex-col', 'gap-2', 'sm:gap-2.5'])}>
        <div
          className={clsm([
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'gap-4',
            'py-3',
            'sm:p-8',
            'xswh:p-2',
            'h-[calc(100vh_-_76px)]'
          ])}
        >
          <div
            ref={gridContainerRef}
            className={clsm([
              'min-w-full',
              'sm:min-h-[65%]',
              'lg:min-h-[50%]',
              'h-full'
            ])}
          >
            {isConnecting ? (
              <div
                className={clsm([
                  'flex',
                  'h-full',
                  'justify-center',
                  'items-center'
                ])}
              >
                <Spinner size={SpinnerSize.LARGE} />
              </div>
            ) : (
              <ParticipantsGrid
                participants={publishers}
                startPublishing={startPublishing}
                showJoinSessionTile={showJoinSessionTile}
              />
            )}
          </div>
          {publishers.length > 0 && (
            <div
              className={clsm([
                'flex',
                'justify-center',
                'items-center',
                'gap-2',
                'min-w-[260px]',
                'w-full',
                'sm:w-auto',
                'px-3',
                'xswh:py-2',
                'py-4',
                'rounded-3xl',
                'bg-surface',
                'xswh:text-sm',
                'text-base'
              ])}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <Users size={24} />
                  {subscribers.length}{' '}
                  {`Listener${subscribers.length !== 1 ? 's' : ''}`}
                </>
              )}
            </div>
          )}
        </div>
        <AnimatedModal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
        >
          {modalContent}
        </AnimatedModal>
        <MediaControls
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          startPublishing={startPublishing}
        />
      </div>
    </div>
  );
}

export default Room;
