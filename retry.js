/**
 * 
 * @param {Function} fn async function to be called
 * @param {{ maxTries: Number, onError: Function }} opt optional options
 * @returns successfull fn result or throws error
 */
export default async function retry(fn, opt = { maxTries: 10, onError: null }) {
  const { maxTries, onError } = opt;

  async function tryFn(i) {
    if (i === 0) {
      throw new Error(`Gave up after ${maxTries} attempts`);
    }

    try {
      return await fn();
    }
    catch (error) {
      if (typeof onError === 'function') {
        onError(error);
      }

      return await tryFn(i - 1);
    }
  }

  return await tryFn(maxTries);
}
