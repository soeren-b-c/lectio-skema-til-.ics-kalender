/* eslint-disable no-console*/

const URL = 'http://icanhazip.com';
const SCHOOL = '590';

import browser from './browser';

const { exit, stderr, stdout } = process;

(async () => {
  try {
    const page = await browser.fetch(`${URL}`, `${SCHOOL}`);
    stdout.write(page);
    exit(0);
  } catch (error) {
    stderr.write(error.message);
    exit(1);
  }
})();
