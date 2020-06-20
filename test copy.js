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

var url = base + result;


var promise = browser.fetch(url);

promise
  .then(function (body) {
    var cheerio = require("cheerio");
    $ = cheerio.load(body);
    l.els = l.els + $(".s2bgbox")["length"];
    $(".s2bgbox").each(function (i, item) {
      var promise = new Promise(function (resolve, reject) {
        l.processEvent(item.attribs["data-additionalinfo"], function (
          output
        ) {
          resolve(output);
        });
      });
      promise.then(function (output) {
        l.res.write(output);
      });
    });
  })
  .catch(function (error) {
    console.log(error.message);
  });

promises.push(promise);
}

Promise.all(promises)
.then(function () {
  l.finishedProcessing();
})
.catch(function (error) {
  console.log(error.message);
});
};
