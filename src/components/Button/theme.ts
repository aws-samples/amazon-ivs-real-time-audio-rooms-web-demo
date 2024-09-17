import { clsm } from '@Utils';

enum ButtonAppearance {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DESTRUCT = 'destruct',
  POSITIVE = 'positive',
  TOAST = 'toast',
  OVERLAY = 'overlay'
}

enum ButtonStyleType {
  ROUND = 'round',
  ROUND_TEXT = 'roundedText',
  ROUNDED = 'rounded',
  TALL = 'tall',
  SHARP = 'sharp'
}

const BASE_CLASSES = clsm([
  'hover:ring-2',
  'focus:ring-2',
  'ring-inset',
  'ring-uiText/5 hover:ring-uiText/20 focus:ring-uiText/20',
  'outline-none',
  'cursor-pointer disabled:cursor-not-allowed',
  'appearance-none',
  'h-11',
  'inline-flex',
  'items-center',
  'justify-center',
  'rounded-lg',
  'bg-surfaceAlt/90 hover:bg-surfaceAlt',
  'disabled:opacity-75 disabled:pointer-events-none disabled:ring-0',
  'text-uiText/90 hover:text-uiText disabled:opacity-50',
  'select-none'
]);

const APPEARANCE_CLASSES = {
  [ButtonAppearance.PRIMARY]: clsm([
    'bg-primary/10',
    'ring-2',
    'ring-primary/10',
    'text-primaryAlt',
    'hover:bg-primary/20',
    'hover:text-primaryAlt',
    'hover:ring-primary/20',
    'focus:text-primaryAlt',
    'focus:ring-primary/40'
  ]),
  [ButtonAppearance.SECONDARY]: clsm([
    'bg-secondary/50',
    'dark:bg-secondaryAlt',
    'text-uiText/90',
    'hover:text-uiText/100',
    'focus:text-uiText/100'
  ]),
  [ButtonAppearance.DESTRUCT]: clsm([
    'bg-destruct/10',
    'ring-2',
    'ring-destruct/10',
    'text-destruct',
    'hover:text-destructAlt',
    'hover:ring-destruct/20',
    'hover:bg-destruct/20',
    'focus:text-destructAlt',
    'focus:ring-destruct/40',
    'focus:bg-destruct/20'
  ]),
  [ButtonAppearance.POSITIVE]: clsm([
    'bg-positive/10',
    'ring-2',
    'ring-positive/10',
    'text-positive',
    'hover:text-positiveAlt',
    'hover:ring-positive/20',
    'hover:bg-positive/20',
    'focus:text-positiveAlt',
    'focus:ring-positive/40',
    'focus:bg-positive/20'
  ]),
  [ButtonAppearance.TOAST]: clsm([
    'h-8',
    'px-2',
    'bg-neutral-300/50',
    'text-neutral-800',
    'hover:text-neutral-900',
    'hover:bg-neutral-300/75',
    'focus:text-neutral-900',
    'focus:bg-neutral-300/75'
  ]),
  [ButtonAppearance.OVERLAY]: clsm([
    'bg-surfaceAlt',
    'backdrop-blur',
    'text-uiText/80',
    'ring-surfaceAlt2/10',
    'hover:ring-surfaceAlt2/40',
    'hover:text-uiText',
    'focus:ring-2',
    'focus:ring-surfaceAlt2',
    'focus:text-uiText',
    'hover:bg-surfaceAlt',
    'focus:bg-surfaceAlt'
  ])
};

const STYLE_TYPE_CLASSES = {
  [ButtonStyleType.ROUND]: clsm(['rounded-full', 'p-2', 'aspect-[1]']),
  [ButtonStyleType.ROUND_TEXT]: clsm(['rounded-full', 'py-2', 'px-4']),
  [ButtonStyleType.ROUNDED]: ['rounded-3xl', 'py-2', 'px-4'],
  [ButtonStyleType.TALL]: clsm([
    'rounded-full',
    'p-2',
    'aspect-[2]',
    'md:aspect-[0.5]',
    'md:py-8'
  ]),
  [ButtonStyleType.SHARP]: 'rounded-none'
};

export {
  APPEARANCE_CLASSES,
  BASE_CLASSES,
  ButtonAppearance,
  ButtonStyleType,
  STYLE_TYPE_CLASSES
};
