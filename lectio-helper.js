var exports = (module.exports = {});
/*exports.getWeekNumber = function(time){
    var d = new Date(time+6048e5);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)-1;
};*/

exports.getWeekNumber = function (time) {
  var target = new Date(time);
  var dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  var firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
  }
  var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

  return retVal < 10 ? '0' + retVal : retVal;
};

exports.pad = function (arg) {
  if (String(arg).length == 1) arg = '0' + arg;
  return arg;
};

exports.dateFormat = function (date, skew) {
  //Skew compared to time in Denmark
  if (skew != 0) {
    date.setTime(date.getTime() - 3.6e6 * skew);
  }

  return (
    date.getUTCFullYear() +
    '' +
    this.pad(date.getUTCMonth() + 1) +
    '' +
    this.pad(date.getUTCDate()) +
    'T' +
    this.pad(date.getUTCHours()) +
    '' +
    this.pad(date.getUTCMinutes()) +
    '' +
    this.pad(date.getUTCSeconds()) +
    'Z'
  );
};

exports.removePadding = function (str) {
  arr = str.split('\n');
  arr.reverse();
  while (arr[0] != undefined && arr[0] == '') {
    arr.splice(0, 1);
  }
  arr.reverse();
  str = arr.join('\n');
  return str;
};
