
var events = require('events'),
  assert = require('assert');

var dploy = require('..');

var Git = dploy.Git;
assert.ok(Git, 'Git is happy');

var git = new Git({ url: 'a', branch: 'f' });
assert.ok(git, 'Git instance is happy');
assert.ok(git instanceof events.EventEmitter, 'should be an instance of EventEmitter');
assert.ok(git instanceof dploy.Publisher, 'should be an instance of Publisher');


try {
  new Git;
  assert.fail('Should raise appropriate error with missing config');
} catch(e) {
  if(e instanceof assert.AssertionError) throw e;
  assert.equal(e.message, 'Required deploy.url config unset');
}


try {
  new Git({ url: 'foobar' });
  assert.fail('Should raise appropriate error with missing config');
} catch(e) {
  if(e instanceof assert.AssertionError) throw e;
  assert.equal(e.message, 'Required deploy.branch config unset');
}
