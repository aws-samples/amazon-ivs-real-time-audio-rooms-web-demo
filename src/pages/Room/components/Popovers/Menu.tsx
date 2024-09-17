import { Info, Link as LinkIcon, QrCode } from '@phosphor-icons/react';
import React, { useMemo } from 'react';
import { Tooltip } from 'react-tooltip';

import {
  getTooltipStyles,
  POPOVER_BUTTON_STYLES,
  POPOVER_CONTAINER_STYLES,
  POPOVER_LABEL_STYLES,
  POPOVER_LIST_STYLES,
  POPOVER_TRUNCATED_TEXT_STYLES
} from './theme';

interface MenuProps {
  fullWidth: boolean;
  id: string;
  isOpen: boolean;
  handleAboutIcon: React.MouseEventHandler<HTMLButtonElement>;
  handleCopyLinkClick: React.MouseEventHandler<HTMLButtonElement>;
  handleInviteClick: React.MouseEventHandler<HTMLButtonElement>;
  setIsOpen: (isOpen: boolean) => void;
}

function Menu({
  fullWidth,
  id,
  isOpen,
  handleAboutIcon,
  handleCopyLinkClick,
  handleInviteClick,
  setIsOpen
}: MenuProps) {
  const tooltipStyles = useMemo(() => getTooltipStyles(fullWidth), [fullWidth]);

  return (
    <Tooltip
      anchorSelect={`#${id}`}
      openOnClick
      noArrow
      clickable
      offset={18}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      opacity={1}
      globalCloseEvents={{ resize: true, clickOutsideAnchor: true }}
      className={tooltipStyles}
    >
      <div className={POPOVER_CONTAINER_STYLES}>
        <button
          type="button"
          className={POPOVER_BUTTON_STYLES}
          onClick={handleAboutIcon}
        >
          <Info size={32} weight="fill" />
          <p className={POPOVER_TRUNCATED_TEXT_STYLES}>About this app</p>
        </button>
        <span className={POPOVER_LABEL_STYLES}>Invite to session</span>
        <ul className={POPOVER_LIST_STYLES}>
          <li>
            <button
              type="button"
              className={POPOVER_BUTTON_STYLES}
              onClick={handleCopyLinkClick}
            >
              <LinkIcon size={32} />
              <p className={POPOVER_TRUNCATED_TEXT_STYLES}>Copy Link</p>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={POPOVER_BUTTON_STYLES}
              onClick={handleInviteClick}
            >
              <QrCode size={32} />
              <p className={POPOVER_TRUNCATED_TEXT_STYLES}>Show QR Code</p>
            </button>
          </li>
        </ul>
      </div>
    </Tooltip>
  );
}

export default Menu;
