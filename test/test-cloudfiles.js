
var events = require('events'),
  assert = require('assert');

var dploy = require('..');

var Cloudfiles = dploy.Cloudfiles;
assert.ok(Cloudfiles, 'Cloudfiles is happy');

try {
  new Cloudfiles;
  assert.fail('Should raise appropriate error with missing config');
} catch(e) {
  if(e instanceof assert.AssertionError) throw e;
  assert.equal(e.message, 'Required username config unset');
}

try {
  new Cloudfiles({ username: 'foobar' });
  assert.fail('Should raise appropriate error with missing config');
} catch(e) {
  if(e instanceof assert.AssertionError) throw e;
  assert.equal(e.message, 'Required key config unset');
}

try {
  new Cloudfiles({ username: 'foobar', key: 'foobar' });
  assert.fail('Should raise appropriate error with missing config');
} catch(e) {
  if(e instanceof assert.AssertionError) throw e;
  assert.equal(e.message, 'Required container config unset');
}
