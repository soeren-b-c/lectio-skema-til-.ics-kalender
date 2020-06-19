/* eslint-disable no-console*/

const URL = 'http://icanhazip.com';

import browser from './browser';

const { exit, stderr, stdout } = process;

(async () => {
  try {
    const page = await browser.fetch(`${URL}`);
    stdout.write(page);
    exit(0);
  } catch (error) {
    stderr.write(error.message);
    exit(1);
  }
})();
