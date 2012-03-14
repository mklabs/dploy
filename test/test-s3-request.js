
var path = require('path'),
  assert = require('assert');

var S3 = require('../').S3;

var auth, client;

try {
  auth = require(path.join(__dirname, '../auth.json'));
  client = new S3(auth.s3);
} catch (err) {
	console.log(err);
  console.error('`npm test` requires ./auth.json to contain a JSON string with');
  console.error('s3.key, s3.secret, and s3.bucket in order to run tests.');
  process.exit(1);
}

client.list(function(e, list) {
  assert.ifError(e);
  assert.ok(Array.isArray(list), 'should list be an array');
  assert.ok(list.length, 'should have some files');
});
