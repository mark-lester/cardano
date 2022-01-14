const matchAll = require("match-all");
var readline = require('readline');
var reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var words = [];
function parsewords(line){
	return matchAll(line.toLowerCase(),/([a-z]+)/g).toArray()
		.filter(word => word.length > 2)
}


reader.on('line', function (line) {
    words=words.concat(parsewords(line));
});

reader.on('close', function (line) {
    console.log(words.join('\n'))
});
