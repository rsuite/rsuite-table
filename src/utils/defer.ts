import { defer } from 'lodash-es';

/**
 * Defer callbacks to wait for DOM rendering to complete.
 */
export default (callback: () => void) => {
  defer(callback, 'deferred');
};
