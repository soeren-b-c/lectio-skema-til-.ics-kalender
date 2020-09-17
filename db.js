/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'fast-csv';

const { stderr } = process;

const _db = () => {
  return new Promise((resolve, reject) => {
    let result = [];

    fs.createReadStream(path.resolve(__dirname, 'db.csv'))
      .pipe(parse({ headers: true }))
      .on('data', (row) => result.push(row))
      .on('end', () => resolve(result))
      .on('error', (error) => reject(error));
  });
};

const _users = async () => {
  try {
    return await _db();
  } catch (error) {
    stderr.write(`db error: ${error}`);
  }
};

const findUserBySchool = async (school) => {
  return new Promise(async (resolve, reject) => {
    const users = await _users();
    const keys = Object.keys(users);

    keys.forEach((key) => {
      const user = users[key];
      if (user.school === school) resolve(user);
    });

    reject();
  });
};

export { findUserBySchool };
