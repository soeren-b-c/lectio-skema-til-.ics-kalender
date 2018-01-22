var exports = module.exports = {};
var fs = require("fs");
var file = "./lectio.json";
cache = require(file);
exports.read = function(name){
	return cache[name];
};
exports.write = function(name,value,callback){
	cache[name] = value;
	return fs.writeFile(file, JSON.stringify(cache), "utf8", (err) => {
          if (err) throw err;
        });
};
