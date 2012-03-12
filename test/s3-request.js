

var S3 = require('../').S3;

var keys = require('./keys');

var client = new S3(keys.s3);
client.list(function(e, list) {
	console.log('>> list', list);
});
