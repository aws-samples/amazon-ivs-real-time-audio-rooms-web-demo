import { STORAGE_VERSION } from '@Constants';
import { DeviceSettings } from '@Contexts/Device/types';
import { ValueOf } from '@Shared/types';
import cleanupOldUsernames from '@Utils/username';
import { Cache } from 'swr';

interface UsernameData {
  username: string;
  updatedAt: number;
}

interface StoredUsername {
  [roomId: string]: UsernameData;
}

interface LocalStorage {
  devices?: DeviceSettings;
  username?: StoredUsername;
}

const isLocalStorageSupported = (function isSupported() {
  try {
    localStorage.setItem('key', 'value');
    localStorage.removeItem('key');

    return true;
  } catch (e) {
    return false;
  }
})();

const defaultLocalStorageState: LocalStorage = {
  devices: {}
};

// Local storage initialization
if (isLocalStorageSupported) {
  if (localStorage.getItem('_storageVersion') !== STORAGE_VERSION) {
    localStorage.clear();
    localStorage.setItem('_storageVersion', STORAGE_VERSION);
  }

  const initialLocalStorageEntries = Object.entries({
    ...defaultLocalStorageState,
    ...getLocalStorageState()
  });

  for (const [key, value] of initialLocalStorageEntries) {
    localStorage.setItem(key, serialize(value));
  }
}

function serialize(value: unknown) {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch (error) {
    return `${value}`;
  }
}

function deserialize(value: string | null) {
  try {
    return value && JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function getLocalStorageState() {
  const state: LocalStorage = {};

  if (isLocalStorageSupported) {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      const item = key && localStorage.getItem(key);

      if (item !== null) {
        state[key as keyof LocalStorage] = deserialize(item);
      }
    }
  }

  return state;
}

function getLocalStorageValue<K extends keyof LocalStorage>(key: K) {
  let value: NonNullable<LocalStorage[K]> | null = null;

  if (isLocalStorageSupported) {
    value = deserialize(localStorage.getItem(key));
  }

  return value;
}

function setLocalStorageValue<K extends keyof LocalStorage>(
  key: K,
  value: LocalStorage[K]
) {
  if (isLocalStorageSupported) {
    localStorage.setItem(key, serialize(value));
  }
}

function removeLocalStorageValue<K extends keyof LocalStorage>(key: K) {
  if (isLocalStorageSupported) {
    localStorage.removeItem(key);
  }
}

function localStorageProvider() {
  const cache: Cache<ValueOf<LocalStorage>> = new Map();
  const state = getLocalStorageState();

  for (const [key, data] of Object.entries(state)) {
    cache.set(key, { data });
  }

  return cache;
}

(function cleanupUsernameLocalStorage() {
  const { username } = getLocalStorageState();

  const nextStoredUserNames = cleanupOldUsernames(username);

  if (nextStoredUserNames)
    setLocalStorageValue('username', nextStoredUserNames);
})();

export type { LocalStorage, StoredUsername };

export {
  getLocalStorageState,
  getLocalStorageValue,
  isLocalStorageSupported,
  localStorageProvider,
  removeLocalStorageValue,
  setLocalStorageValue
};
