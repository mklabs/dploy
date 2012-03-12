
var assert = require('assert');


var Publisher = require('..').Publisher;
assert.ok(Publisher, 'Publisher is happy');


var publisher = new Publisher;
assert.ok(publisher, 'Publisher instance is happy');


// tesing out the log api
publisher.write('loggers are so...');
['error', 'warn', 'info', 'log', 'debug'].forEach(function(lvl) {
	assert.ok(typeof publisher[lvl] === 'function', 'publiher.' + lvl + ' should be a function');
	publisher[lvl]('loggers are sooo...');
});

var higher = new Publisher({ loglevel: 1 });
assert.ok(higher, 'Publisher instance is happy');


// tesing out the log api
higher.write('loggers are so...');
['error', 'warn', 'info', 'log', 'debug'].forEach(function(lvl) {
	assert.ok(typeof higher[lvl] === 'function', 'publiher.' + lvl + ' should be a function');
	higher[lvl]('loggers are sooo...');
});
