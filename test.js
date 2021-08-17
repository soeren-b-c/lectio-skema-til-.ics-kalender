/* eslint-disable no-console*/

const URL = 'http://icanhazip.com';
const SCHOOL = '590';

import browser from './browser';
import retry from './retry';

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

  const expectedResult = 'yay'
  const fnSuccess = () => expectedResult;
  
  const result = await retry(fnSuccess);

  if (result !== expectedResult) {
    stderr.write(`expected result ${expectedResult}, got ${result}`);
    exit(1);
  }

  let tryTimes = 0;
  const expectedRetries = 3;
  try {
    const fnFail = () => {
      tryTimes ++;
      throw new Error('some error');
    }
    await retry(fnFail, { maxTries: expectedRetries });
  } catch (error) {
    if (error.message !== `Gave up after ${expectedRetries} attempts`) {
      stderr.write(error.message);
      exit(1);
    }

    if (tryTimes !== expectedRetries) {
      stderr.write(`expected to try ${expectedRetries} times, actually tried ${tryTimes} times`);
      exit(1);
    }
  }
})();
