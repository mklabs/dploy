
var assert = require('assert');


var dploy = require('..');

// top-level provided entry point
assert.ok(dploy, 'dploy is dploy');

// Few adapters objects
assert.ok(dploy.Git, 'Git adapter is happy');
assert.ok(dploy.S3, 'S3 adapter is happy');
assert.ok(dploy.Cloudfiles, 'Cloudfiles adapter is happy');

// top-level API checks
assert.ok(typeof dploy === 'function', 'exposed module should be a function');

