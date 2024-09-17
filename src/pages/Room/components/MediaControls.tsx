import { Button, MicIcon } from '@Components';
import { useDevice } from '@Contexts/Device';
import { useModalManager } from '@Contexts/ModalManager';
import { useStage } from '@Contexts/Stage';
import { useBreakpoint } from '@Hooks';
import {
  CaretDown,
  CaretUp,
  Check,
  DotsThreeVertical,
  Info,
  Link as LinkIcon,
  MicrophoneSlash,
  PhoneDisconnect,
  PhonePlus,
  QrCode
} from '@phosphor-icons/react';
import { clsm, copyTextToClipboard } from '@Utils';
import {
  StageConnectionState,
  StageParticipantPublishState
} from 'amazon-ivs-web-broadcast';
import { MouseEvent, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { ButtonAppearance, ButtonStyleType } from 'src/components/Button/theme';

import { About, Invite } from './Modals';
import { Backdrop, MenuPopover, MicSelectionPopover } from './Popovers';

const MIC_SELECTION_ID = 'mic-selection';
const MENU_ID = 'menu';

interface MediaControlsProps {
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  startPublishing: () => void;
}

function MediaControls({
  isMuted,
  setIsMuted,
  startPublishing
}: MediaControlsProps) {
  const { pathname } = useLocation();
  const {
    toggleAudio,
    devices,
    updateActiveDevice,
    activeDevice,
    stopUserMedia
  } = useDevice();
  const stage = useStage();
  const { modalOpen, setModalOpen, setModalContent } = useModalManager();
  const [isCopied, setIsCopied] = useState(false);
  const [isMicSelectionOpen, setIsMicSelectionOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const copyLinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fullWidth = useBreakpoint('xs');

  const stageJoined = stage.connectState === StageConnectionState.CONNECTED;
  const isPublished =
    stage.publishState === StageParticipantPublishState.PUBLISHED;

  function toggleMicSelection(e: MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setIsMicSelectionOpen(!isMicSelectionOpen);
    setIsMenuOpen(false);
  }

  function toggleMenu(e: MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setIsMicSelectionOpen(false);
  }

  function toggleAudioMute() {
    toggleAudio({ muted: !isMuted });
    setIsMuted(!isMuted);
  }

  async function handlePublishing() {
    if (isPublished) {
      stage.unpublish();
      stopUserMedia();
    } else {
      await startPublishing();
    }
  }

  function copyInviteLink(copyToClipboard = true) {
    const fullLink = window.location.origin + pathname;

    let copied = false;
    if (copyLinkTimeoutRef.current) clearTimeout(copyLinkTimeoutRef.current);

    if (copyToClipboard) {
      copyTextToClipboard(fullLink);
      copied = true;
    }

    copyLinkTimeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 4000);

    return { link: fullLink, copied };
  }

  function handleCopyLinkClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const { copied } = copyInviteLink();

    if (copyLinkTimeoutRef.current) clearTimeout(copyLinkTimeoutRef.current);
    setIsCopied(copied);
    copyLinkTimeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 4000);
    setIsMenuOpen(false);
  }

  function handleInviteClick() {
    const { link } = copyInviteLink(false);
    setModalContent(<Invite link={link} copyLink={copyInviteLink} />);
    setModalOpen(!modalOpen);
  }

  function handleAboutIcon() {
    setModalContent(<About />);
    setModalOpen(true);
  }

  return (
    <>
      <Backdrop isOpen={isMicSelectionOpen || isMenuOpen} />
      <MicSelectionPopover
        id={MIC_SELECTION_ID}
        isOpen={isMicSelectionOpen}
        setIsOpen={(isOpen: boolean) => {
          if (isMicSelectionOpen !== isOpen) setIsMicSelectionOpen(isOpen);
        }}
        fullWidth={fullWidth}
        devices={devices}
        updateActiveDevice={updateActiveDevice}
        activeDevice={activeDevice}
      />
      <MenuPopover
        id={MENU_ID}
        isOpen={isMenuOpen}
        setIsOpen={(isOpen: boolean) => {
          if (isMenuOpen !== isOpen) setIsMenuOpen(isOpen);
        }}
        fullWidth={fullWidth}
        handleAboutIcon={handleAboutIcon}
        handleCopyLinkClick={handleCopyLinkClick}
        handleInviteClick={handleInviteClick}
      />
      <div
        className={clsm(
          'grid',
          'grid-cols-[1fr_auto]',
          'sm:grid-cols-[1fr_auto_1fr]',
          'w-full',
          'px-2',
          'pb-2',
          'items-center',
          'bg-overlay',
          'z-50'
        )}
      >
        <div className={clsm(['w-16', 'hidden', 'sm:block'])}>
          <Button
            appearance={ButtonAppearance.OVERLAY}
            styleType={ButtonStyleType.ROUNDED}
            fullWidth
            onClick={handleAboutIcon}
          >
            <Info size={24} weight="fill" />
          </Button>
        </div>

        <div
          className={clsm(
            'w-full',
            'sm:w-fit',
            'justify-self-center',
            'sm:w-auto',
            'flex',
            'rounded-none',
            'sm:rounded-3xl',
            'bg-none',
            'p-2',
            'sm:bg-surfaceAlt3',
            'gap-2'
          )}
        >
          <span className={clsm(['relative', 'flex', 'items-center'])}>
            <Button
              onClick={toggleAudioMute}
              appearance={
                isMuted ? ButtonAppearance.DESTRUCT : ButtonAppearance.OVERLAY
              }
              styleType={ButtonStyleType.ROUNDED}
              loading={!stageJoined}
              className="pr-9"
            >
              {isMuted ? (
                <MicrophoneSlash size={24} weight="fill" />
              ) : (
                <MicIcon noMic={!devices.length} />
              )}
            </Button>
            <Button
              id={MIC_SELECTION_ID}
              onClick={toggleMicSelection}
              appearance={ButtonAppearance.OVERLAY}
              styleType={ButtonStyleType.ROUND}
              disabled={!stageJoined}
              className={clsm([
                'absolute',
                'right-2',
                'group',
                'ml-0',
                'p-0.5',
                'w-[18px]',
                'h-[18px]',
                isMuted ? 'opacity-70' : 'opacity-100',
                isMicSelectionOpen && [
                  'focus:ring-0',
                  'focus:text-neutral-900',
                  'focus:bg-neutral-300/75'
                ]
              ])}
            >
              <CaretUp
                size={14}
                className={clsm(isMicSelectionOpen && 'hidden')}
              />
              <CaretDown
                size={14}
                className={clsm(isMicSelectionOpen ? 'block' : 'hidden')}
              />
            </Button>
          </span>
          <Button
            appearance={
              isPublished
                ? ButtonAppearance.DESTRUCT
                : ButtonAppearance.POSITIVE
            }
            styleType={ButtonStyleType.ROUNDED}
            onClick={handlePublishing}
            disabled={!stageJoined}
            fullWidth
          >
            {isPublished ? (
              <span className={clsm(['flex', 'gap-2', 'items-center'])}>
                <PhoneDisconnect size={24} weight="fill" />
                <p className="sm:hidden">Leave</p>
              </span>
            ) : (
              <span className={clsm(['flex', 'gap-2', 'items-center'])}>
                <PhonePlus size={24} weight="fill" />
                <p className={clsm(['hidden', 'sm:inline'])}>Join Session</p>
                <p className="sm:hidden">Join</p>
              </span>
            )}
          </Button>
        </div>
        <div className={clsm(['sm:flex', 'hidden', 'justify-self-end'])}>
          <span className="w-16">
            <Button
              appearance={
                isCopied ? ButtonAppearance.POSITIVE : ButtonAppearance.OVERLAY
              }
              styleType={ButtonStyleType.ROUNDED}
              fullWidth
              onClick={handleCopyLinkClick}
            >
              {isCopied ? <Check size={24} /> : <LinkIcon size={24} />}
            </Button>
          </span>
          <span className="w-16">
            <Button
              appearance={ButtonAppearance.OVERLAY}
              styleType={ButtonStyleType.ROUNDED}
              onClick={handleInviteClick}
              loading={!stageJoined}
              fullWidth
            >
              <QrCode size={24} />
            </Button>
          </span>
        </div>
        <div className="sm:hidden">
          <Button
            id={MENU_ID}
            appearance={ButtonAppearance.OVERLAY}
            onClick={toggleMenu}
          >
            <DotsThreeVertical size={24} weight="bold" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default MediaControls;
