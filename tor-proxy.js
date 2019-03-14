// Copyright ©2019 Scott Mathieson <scttmthsn@gmail.com>

import { exec as _exec, spawn } from 'child_process';
import { promisify } from 'util';

import dotenv from 'dotenv';

const { env, exit, stderr, stdout } = process;
const exec = promisify(_exec);

// See ./.env
dotenv.config();

export default (async () => {
  if (env.TOR_ENABLED === 'true') {
    try {
      await exec('which tor');
      await spawn('tor').on('error', (error) => {
        stderr.write(`Failed to start TOR proxy; exiting.\n`);
        exit(1);
      });
      stdout.write(`TOR proxy started.\n`);
    } catch (error) {
      stderr.write(`The TOR binary must be in your PATH; exiting.\n`);
      exit(1);
    }
  }
})();
