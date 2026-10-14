/**
 * Translates Firebase/Firestore failures into messages that are safe and
 * useful to show in a toast.
 *
 * The raw Firebase error carries a `code` but its `message` often repeats the
 * request URL and internal details, so it must never be surfaced verbatim.
 */

interface FirebaseLikeError {
  code?: unknown;
  name?: unknown;
  message?: unknown;
}

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account matches that email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-login-credentials': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account already uses that email.',
  'auth/weak-password': 'Choose a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and retry.',
  'auth/network-request-failed': 'Network problem. Check your connection.',
  'auth/operation-not-allowed': 'Email sign-in is not enabled for this project.',
  'permission-denied': 'You do not have permission to do that.',
  'unavailable': 'Cannot reach the server. Check your connection and retry.',
  'unauthenticated': 'Your session expired. Please sign in again.',
  'not-found': 'That record no longer exists.',
  'failed-precondition':
    'The database is missing an index for this query. Please contact support.',
  'resource-exhausted': 'The service is busy right now. Please retry shortly.',
  'deadline-exceeded': 'The request timed out. Please retry.',
  cancelled: 'The request was cancelled.'
};

export function readErrorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return '';
  }

  const candidate = error as FirebaseLikeError;
  const code = typeof candidate.code === 'string' ? candidate.code : '';

  if (code) {
    // Some SDK paths prefix the code, e.g. "FirebaseError: auth/invalid-email".
    return code.replace(/^.*?\/?[A-Za-z-]*Error:\s*/, '').trim();
  }

  return typeof candidate.name === 'string' ? candidate.name : '';
}

/** Best-effort, human readable message for any thrown value. */
export function toUserMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  const code = readErrorCode(error);

  if (code && MESSAGES[code]) {
    return MESSAGES[code];
  }

  // Plain `new Error('...')` values we raised ourselves are already safe.
  if (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as FirebaseLikeError).message === 'string' &&
    !code
  ) {
    const message = (error as FirebaseLikeError).message as string;

    if (/auth\/|firebase|FIRESTORE|https?:\/\//i.test(message) === false) {
      return message;
    }
  }

  return fallback;
}
