import { clsm } from '@Utils';

enum SpinnerType {
  DEFAULT = 'default',
  ALERT = 'alert',
  INVERTED = 'inverted'
}

enum SpinnerSize {
  DEFAULT = 'default',
  LARGE = 'large'
}

const TYPE_CLASSES = {
  [SpinnerType.DEFAULT]: clsm(['text-current', 'fill-surface/50']),
  [SpinnerType.ALERT]: clsm(['text-white/50', 'fill-white']),
  [SpinnerType.INVERTED]: clsm(['text-current', 'fill-surfaceAlt/50'])
};

const SIZE_CLASSES = {
  [SpinnerSize.DEFAULT]: clsm(['w-4', 'h-4']),
  [SpinnerSize.LARGE]: clsm(['w-8', 'h-8'])
};

export { SIZE_CLASSES, SpinnerSize, SpinnerType, TYPE_CLASSES };
