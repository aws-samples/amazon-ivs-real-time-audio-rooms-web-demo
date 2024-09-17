import { Button, MicIcon } from '@Components';
import { useDevice } from '@Contexts/Device';
import { ArrowClockwise, Check } from '@phosphor-icons/react';
import { clsm } from '@Utils';
import { useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import { ButtonAppearance } from 'src/components/Button/theme';

import {
  getTooltipStyles,
  POPOVER_BASE_TEXT_STYLES,
  POPOVER_BUTTON_STYLES,
  POPOVER_CONTAINER_STYLES,
  POPOVER_LABEL_STYLES,
  POPOVER_LIST_STYLES,
  POPOVER_TRUNCATED_TEXT_STYLES
} from './theme';

interface MicSelectionProps {
  activeDevice?: MediaDeviceInfo;
  devices: MediaDeviceInfo[];
  fullWidth: boolean;
  id: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updateActiveDevice: (device?: MediaDeviceInfo) => void;
}

function MicSelection({
  activeDevice,
  devices,
  fullWidth,
  id,
  isOpen,
  setIsOpen,
  updateActiveDevice
}: MicSelectionProps) {
  const tooltipStyles = useMemo(() => getTooltipStyles(fullWidth), [fullWidth]);
  const { startUserMedia } = useDevice();

  return (
    <Tooltip
      anchorSelect={`#${id}`}
      openOnClick
      noArrow
      clickable
      offset={32}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      opacity={1}
      className={tooltipStyles}
    >
      <div className={POPOVER_CONTAINER_STYLES}>
        {devices.length > 0 ? (
          <>
            <span className={POPOVER_LABEL_STYLES}>Microphones</span>
            <ul className={POPOVER_LIST_STYLES}>
              {devices.map((device) => {
                const isSelected = device.deviceId === activeDevice?.deviceId;

                return (
                  <li key={`mic-selection-${device.deviceId}`}>
                    <button
                      type="button"
                      className={POPOVER_BUTTON_STYLES}
                      onClick={() => updateActiveDevice(device)}
                    >
                      <Check
                        size={16}
                        className={isSelected ? 'visible' : 'invisible'}
                        weight="bold"
                      />
                      <p className={POPOVER_TRUNCATED_TEXT_STYLES}>
                        {device.label}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div
            className={clsm([
              'flex',
              'flex-col',
              'items-center',
              'gap-4',
              'py-4',
              POPOVER_BASE_TEXT_STYLES
            ])}
          >
            <div
              className={clsm(['flex', 'flex-col', 'items-center', 'gap-2'])}
            >
              <MicIcon noMic={!devices.length} />
              <p>No microphones detected</p>
            </div>
            <Button
              appearance={ButtonAppearance.SECONDARY}
              onClick={startUserMedia}
            >
              <span className={clsm(['flex', 'items-center', 'gap-1'])}>
                <ArrowClockwise size={14} weight="bold" />
                Retry
              </span>
            </Button>
          </div>
        )}
      </div>
    </Tooltip>
  );
}

export default MicSelection;
