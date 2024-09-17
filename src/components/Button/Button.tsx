import { clsm } from '@Utils';
import { ButtonHTMLAttributes } from 'react';

import Spinner from '../Spinner';
import {
  APPEARANCE_CLASSES,
  BASE_CLASSES,
  ButtonAppearance,
  ButtonStyleType,
  STYLE_TYPE_CLASSES
} from './theme';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ButtonAppearance;
  styleType?: ButtonStyleType;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

function Button({
  appearance = ButtonAppearance.PRIMARY,
  styleType = ButtonStyleType.ROUND_TEXT,
  fullWidth = false,
  loading = false,
  type = 'button',
  children,
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type} // eslint-disable-line react/button-has-type
      className={clsm(
        BASE_CLASSES,
        APPEARANCE_CLASSES[appearance],
        STYLE_TYPE_CLASSES[styleType],
        fullWidth ? 'w-full' : ['grow', 'w-auto'],
        className
      )}
      {...buttonProps}
    >
      {children && (
        <span
          className={clsm([
            'inline-flex',
            'items-center',
            'justify-center',
            loading ? 'invisible' : 'visible'
          ])}
        >
          {children}
        </span>
      )}
      <span
        className={clsm(
          loading ? ['visible', 'absolute'] : ['invisible', 'absolute']
        )}
      >
        <Spinner />
      </span>
    </button>
  );
}

export default Button;
