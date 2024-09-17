import { NAME_PREFIX_FRUITS } from '@Constants';
import { successMessages } from '@Content';
import clsx, { ClassValue } from 'clsx';
import copyToClipboard from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

const resolvedTwConfig = resolveConfig(tailwindConfig);

function clsm(...classes: ClassValue[]) {
  if (!classes) return;

  return twMerge(clsx(classes));
}

function noop() {
  // No operation performed.
}

/**
 * Create username
 */
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function createUsername() {
  const randomIndex = getRandomInt(NAME_PREFIX_FRUITS.length - 1);
  const randomNumber = getRandomInt(999);

  return `${NAME_PREFIX_FRUITS[randomIndex]}-${randomNumber}`;
}

function queueMacrotask(task: VoidFunction) {
  setTimeout(task, 0);
}

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  callback: F,
  waitFor: number,
  leading = false
) {
  let timeout: NodeJS.Timeout | undefined;

  function debounced(...args: Parameters<F>) {
    if (leading && !timeout) {
      callback(...args);
    }

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = undefined;

      if (!leading) {
        callback(...args);
      }
    }, waitFor);
  }

  function cancel() {
    clearTimeout(timeout);
    timeout = undefined;
  }

  debounced.cancel = cancel;

  return debounced;
}

function exhaustiveSwitchGuard(value: never): never {
  throw new Error(
    `ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(
      value
    )}`
  );
}

function copyTextToClipboard(text: string) {
  copyToClipboard(text);
  toast.success(successMessages.copied_to_clipboard, { id: 'clipboard-toast' });
}

export {
  clsm,
  copyTextToClipboard,
  createUsername,
  debounce,
  exhaustiveSwitchGuard,
  noop,
  queueMacrotask,
  resolvedTwConfig
};
