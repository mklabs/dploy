
var events = require('events'),
	assert = require('assert');

var dploy = require('..');

var S3 = dploy.S3;
assert.ok(S3, 'S3 is happy (cause knox exists, otherwise it would be pretty sad)');

var s3 = new S3({ url: 'a', branch: 'f' });
assert.ok(s3, 'S3 instance is happy');
assert.ok(s3 instanceof events.EventEmitter, 'should be an instance of EventEmitter');
assert.ok(s3 instanceof dploy.Publisher, 'should be an instance of Publisher');

try {
	new S3;
	assert.fail('Should raise appropriate error with missing config');
} catch(e) {
	if(e instanceof assert.AssertionError) throw e;
	assert.equal(e.message, 'Required bucket config unset');
}

try {
	new S3({ bucket: 'foobar' });
	assert.fail('Should raise appropriate error with missing config');
} catch(e) {
	if(e instanceof assert.AssertionError) throw e;
	assert.equal(e.message, 'Required key config unset');
}


try {
	new S3({ key: 'foobar', bucket: 'foobar' });
	assert.fail('Should raise appropriate error with missing config');
} catch(e) {
	if(e instanceof assert.AssertionError) throw e;
	assert.equal(e.message, 'Required container config unset');
}
