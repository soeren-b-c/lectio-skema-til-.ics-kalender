// Copyright ©2019 Scott Mathieson <scttmthsn@gmail.com>

process.setMaxListeners(128);

import puppeteer from 'puppeteer';

import { findUserBySchool } from './db';
import tor from './tor-proxy';
import retry from './retry';

const { env, exit, stderr, stdout } = process;

const BASE_URL = `https://www.lectio.dk/lectio`;

// DOM Selectors
const BUTTON_SELECTOR = '#m_Content_submitbtn2';
const PASSWORD_SELECTOR = '#password';
const USERNAME_SELECTOR = '#username';

// Puppeteer
const BROWSER_ARGS =
  env.NODE_ENV === 'production'
    ? ['--proxy-server=socks5://127.0.0.1:9050']
    : [];
const BROWSER_WAIT = env.NODE_ENV === 'development' ? 3e3 : 0;
const IS_HEADLESS = env.NODE_ENV === 'production' ? true : false;
const NET_IDLE = { waitUntil: 'networkidle0' };
const TIMEOUT = 12e4; // 120 seconds

const browserLogin = async (school) => {
  let browser, cookies, page, user;

  try {
    user = await findUserBySchool(school);
  } catch (error) {
    stderr.write(new Date().toUTCString() + ` No school matching id ${school}\n`);
    exit(1);
  }

  try {
    return retry(async () => {
      browser = await puppeteer.launch({
        args: [
          ...BROWSER_ARGS,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
        ],
        headless: IS_HEADLESS,
        executablePath: '/usr/bin/chromium-browser',
      });

      page = await browser.newPage();
      page.setDefaultNavigationTimeout(TIMEOUT);

      stdout.write(new Date().toUTCString() + `: Logging in...\n`);
      await page.goto(`${BASE_URL}/${user.school}/login.aspx?type=brugernavn`, NET_IDLE);
      await page.type(`${USERNAME_SELECTOR}`, user.name);
      await page.type(`${PASSWORD_SELECTOR}`, user.pass);

      await Promise.all([
        page.click(`${BUTTON_SELECTOR}`),
        page.waitForNavigation(NET_IDLE),
      ]);

      cookies = await page.cookies();

      return { browser, cookies };
    }, { onError: (error) => stderr.write(new Date().toUTCString() + ` browserLogin(): ${error}`) });
  } catch (error) {
    stderr.write(new Date().toUTCString() + ` browserLogin(): ${error}`);
    exit(1);
  }
};

export const fetch = async (url, school) => {
  let proxy;

  try {
    proxy = await retry(tor.create, { onError: error => stderr.write(new Date().toUTCString() + ` fetch() > tor.create(): ${error}`) });
  } catch (error) {
    stderr.write(new Date().toUTCString() + ` fetch() > tor.create(): ${error}`);
    exit(1);
  }

  try {
    return await retry(async () => {
      const { browser, cookies } = await browserLogin(school);

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(TIMEOUT);

      stdout.write(new Date().toUTCString() + ` Fetching ${url}\n`);
      await page.setCookie(...cookies);
      await page.goto(url, NET_IDLE);

      const response = await page.content();

      stdout.write(new Date().toUTCString() + ` Stopping browser...\n`);
      await page.waitForTimeout(BROWSER_WAIT);
      await browser.close();

      stdout.write(new Date().toUTCString() + ` Stopping proxy...\n`);
      proxy.kill();

      stdout.write(new Date().toUTCString() + ` Task complete.\n`);
      return response;
    }, { onError: err => stderr.write(new Date().toUTCString() + `fetch(): ${error}`) });
  } catch (error) {
    stderr.write(new Date().toUTCString() + `fetch(): ${error}`);
    exit(1);
  }
};
