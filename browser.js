// Copyright ©2019 Scott Mathieson <scttmthsn@gmail.com>

process.setMaxListeners(128);

import puppeteer from 'puppeteer';

import { findUserBySchool } from './db';
import tor from './tor-proxy';

var dato = new Date();

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
    stderr.write(dato.toUTCString() + ` No school matching id ${school}\n`);
    exit(1);
  }

  try {
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
    });

    page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);

    stdout.write(dato.toUTCString() + `: Logging in...\n`);
    await page.goto(`${BASE_URL}/${user.school}/login.aspx`, NET_IDLE);
    await page.type(`${USERNAME_SELECTOR}`, user.name);
    await page.type(`${PASSWORD_SELECTOR}`, user.pass);

    await Promise.all([
      page.click(`${BUTTON_SELECTOR}`),
      page.waitForNavigation(NET_IDLE),
    ]);

    cookies = await page.cookies();

    return { browser, cookies };
  } catch (error) {
    stderr.write(dato.toUTCString() + ` browserLogin(): ${error}`);
    exit(1);
  }
};

export const fetch = async (url, school) => {
  let proxy;

  try {
    proxy = await tor.create();
  } catch (error) {
    stderr.write(dato.toUTCString() + ` fetch() > tor.create(): ${error}`);
    exit(1);
  }

  try {
    const { browser, cookies } = await browserLogin(school);

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);

    stdout.write(dato.toUTCString() + ` Fetching ${url}\n`);
    await page.setCookie(...cookies);
    await page.goto(url, NET_IDLE);

    const response = await page.content();

    stdout.write(dato.toUTCString() + ` Stopping browser...\n`);
    await page.waitForTimeout(BROWSER_WAIT);
    await browser.close();

    stdout.write(dato.toUTCString() + ` Stopping proxy...\n`);
    proxy.kill();

    stdout.write(dato.toUTCString() + ` Task complete.\n`);
    return response;
  } catch (error) {
    stderr.write(dato.toUTCString() + ` fetch(): ${error}`);
    exit(1);
  }
};
