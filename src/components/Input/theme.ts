import { clsm } from '@Utils';

const BASE_CLASSES = clsm([
  'relative',
  'w-full',
  'rounded-lg',
  'bg-surfaceAlt/75',
  'hover:bg-surfaceAlt',
  'py-2.5',
  'text-center',
  'text-xl',
  'text-uiText/80',
  'focus:text-uiText',
  'hover:text-uiText',
  'appearance-none',
  'focus:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-inset',
  'focus-visible:ring-surfaceAlt2/25',
  'ring-offset-surface',
  'disabled:opacity-75'
]);

const ERROR_CLASSES = clsm([
  'bg-destruct/10',
  'ring-2',
  'ring-destruct/10',
  'text-destruct',
  'placeholder:text-destruct',
  'hover:text-destructAlt',
  'hover:ring-destruct/20',
  'hover:bg-destruct/20',
  'focus-visible:text-destructAlt',
  'focus-visible:ring-destruct/40',
  'focus-visible:bg-destruct/10',
  'motion-safe:animate-error-shake'
]);

export { BASE_CLASSES, ERROR_CLASSES };
