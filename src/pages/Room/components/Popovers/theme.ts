import { clsm } from '@Utils';

const getTooltipStyles = (fullWidth: boolean) =>
  clsm([
    '!bg-surface',
    '!text-uiText',
    '!max-h-[180px]',
    '!rounded-xl',
    '!border',
    '!py-2.5',
    '!px-0',
    '!overflow-scroll',
    '!border-white/15',
    '!shadow-lg',
    fullWidth && '!w-[calc(100%_-_8px)]'
  ]);

const POPOVER_CONTAINER_STYLES = clsm([
  'flex',
  'flex-col',
  'sm:w-[273px]',
  'w-full',
  'gap-1.5',
  'xsh:min-h-[180px]'
]);

const POPOVER_LABEL_STYLES = clsm([
  'text-base',
  'sm:text-sm',
  'text-secondary',
  'opacity-50',
  'mx-5',
  'pl-8',
  'sm:pl-1'
]);

const POPOVER_LIST_STYLES = clsm(['flex', 'flex-col', 'text-sm']);

const POPOVER_BUTTON_STYLES = clsm([
  'flex',
  'gap-4',
  'sm:gap-1',
  'items-center',
  'w-full',
  'text-start',
  'px-5',
  'sm:pl-2',
  'sm:pr-3',
  'py-2',
  'hover:bg-primary',
  'hover:text-uiTextAlt'
]);

const POPOVER_BASE_TEXT_STYLES = clsm(['text-base', 'sm:text-sm']);

const POPOVER_TRUNCATED_TEXT_STYLES = clsm([
  POPOVER_BASE_TEXT_STYLES,
  'w-full',
  'truncate'
]);

export {
  getTooltipStyles,
  POPOVER_BASE_TEXT_STYLES,
  POPOVER_BUTTON_STYLES,
  POPOVER_CONTAINER_STYLES,
  POPOVER_LABEL_STYLES,
  POPOVER_LIST_STYLES,
  POPOVER_TRUNCATED_TEXT_STYLES
};
