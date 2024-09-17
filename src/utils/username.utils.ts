import { STORAGE_USERNAME_TTL } from '@Constants';
import type { StoredUsername } from '@LocalStorage';

/**
 * Cleanup old local storage usernames based on updatedAt unix timestamp value
 */
function cleanupOldUsernames(storedUsernames?: StoredUsername) {
  if (!storedUsernames) return null;

  const newStoredUserNames = Object.keys(storedUsernames).reduce(
    (acc, roomId) => {
      const currTime = Date.now();
      const timeDiff = currTime - storedUsernames[roomId].updatedAt;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24); // Convert milliseconds to days: 1 day = 1000 ms * 60 s * 60 min * 24 h

      return daysDiff >= STORAGE_USERNAME_TTL
        ? acc
        : { ...acc, [roomId]: storedUsernames[roomId] };
    },
    {}
  );

  return newStoredUserNames;
}

export default cleanupOldUsernames;
