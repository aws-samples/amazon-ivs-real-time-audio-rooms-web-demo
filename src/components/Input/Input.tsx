import { clsm } from '@Utils';
import { ChangeEvent } from 'react';

import { BASE_CLASSES, ERROR_CLASSES } from './theme';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  placeholder?: string;
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  description?: string;
}

function Input({
  name,
  placeholder = '',
  inputValue,
  onChange,
  error = false,
  description,
  autoCorrect = 'off',
  autoComplete = 'off',
  autoCapitalize = 'none'
}: InputProps) {
  return (
    <input
      className={clsm(BASE_CLASSES, error && ERROR_CLASSES)}
      placeholder={placeholder}
      value={inputValue}
      onChange={onChange}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      aria-describedby={description && `${name}-description`}
      aria-invalid={!!error}
    />
  );
}

export default Input;
