var exports = (module.exports = {});
exports.splitQuery = function (query) {
  obj = new Object();
  qs = query.split('&');
  for (i = 0; i < qs.length; i++) {
    qg = qs[i].split('=');
    obj[qg[0]] = qg[1];
  }
  return obj;
};
