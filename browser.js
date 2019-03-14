// Copyright ©2019 Scott Mathieson <scttmthsn@gmail.com>

/* eslint-disable no-console */

process.setMaxListeners(128);

import { exec as _exec, spawn } from 'child_process';
import { promisify } from 'util';

import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

import tor from './tor-proxy';

const exec = promisify(_exec);
const { env, exit, stderr, stdout } = process;

// See ./.env
dotenv.config();

const LOGIN_URL = `https://www.lectio.dk/lectio/${env.SCHOOL_NUMBER}/login.aspx`;

// DOM Selectors
const BUTTON_SELECTOR = '#m_Content_submitbtn2';
const PASSWORD_SELECTOR = '#password2';
const USERNAME_SELECTOR = '#m_Content_username2';

// Puppeteer
const BROWSER_ARGS =
  env.TOR_ENABLED === 'true'
    ? [ '--proxy-server=socks5://127.0.0.1:9050' ]
    : [];

const BROWSER_WAIT = env.NODE_ENV === 'development' ? 3e3 : 0;
const IS_HEADLESS = env.NODE_ENV === 'production' ? true : false;
const NET_IDLE = { waitUntil: 'networkidle0' };
const TIMEOUT = 6e4; // 60 seconds

const browserLogin = async () => {
  try {
    const browser = await puppeteer.launch({
      args: [
        ...BROWSER_ARGS,
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
      headless: IS_HEADLESS,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);

    await page.goto(`${LOGIN_URL}`, NET_IDLE);
    await page.type(`${USERNAME_SELECTOR}`, env.USERNAME);
    await page.type(`${PASSWORD_SELECTOR}`, env.PASSWORD);

    await Promise.all([
      page.click(`${BUTTON_SELECTOR}`),
      page.waitForNavigation(NET_IDLE),
    ]);

    const cookies = await page.cookies();

    return { browser, cookies };
  } catch (error) {
    stderr.write(error);
  }
};

export const fetch = async (url) => {
  try {
    const { browser, cookies } = await browserLogin();

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);

    await page.setCookie(...cookies);
    await page.goto(url, NET_IDLE);

    const response = await page.content();

    await page.waitFor(BROWSER_WAIT);
    await browser.close();

    return response;
  } catch (error) {
    stderr.write(error);
  }
};
