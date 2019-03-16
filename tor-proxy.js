// Copyright ©2019 Scott Mathieson <scttmthsn@gmail.com>

import { exec as _exec, spawn } from 'child_process';
import { promisify } from 'util';

import dotenv from 'dotenv';

const { env, exit, stderr, stdout } = process;
const exec = promisify(_exec);

// See ./.env
dotenv.config();

const create = async () => {
  if (env.TOR_ENABLED === 'true') {
    try {
      await exec('which tor');

      const proxy = await spawn('tor');

      stdout.write(`TOR proxy started with PID ${proxy.pid}.\n`);

      return proxy;
    } catch (error) {
      stderr.write(`The TOR binary must be in your PATH; exiting.\n`);
      exit(1);
    }
  }
};

export { create };
