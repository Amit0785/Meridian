/**
 * Generic debounce utility function.
 * Delays the execution of a function until after `delay` milliseconds have passed
 * since the last time the debounced function was invoked.
 *
 * @param fn The callback function to debounce
 * @param delay Milliseconds to delay execution (default: 400ms)
 * @returns Debounced function with a .cancel() cleanup helper
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 400,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

export default debounce;
