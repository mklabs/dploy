#!/usr/bin/env node

// Test runner - coming and derived from tako's runner
// -> https://raw.github.com/mikeal/tako/master/tests/run.js

//
// > I don't use test frameworks. I like my tests to require nothing but node.js, it
// > means they are understandable by anyone that is familiar with node and not my
// > chosen test framework.
//
// Mikeal in http://www.mikealrogers.com/posts/a-little-test-server.html
//
// I more and more tends to adopt the same approache. Being a huge fan of vows, using
// it in every test case I had to setup, sometimes it just feel good to use no test
// framework at all.

var fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn;

var testTimeout = 8000,
  verbose = true,
  failed = [],
  success = [],
  pathPrefix = __dirname;

function runTest(test, callback) {
  var child = spawn(process.execPath, [ path.join(__dirname, test) ]),
    stdout = '',
    stderr = '',
    killTimeout;

  child.stdout.on('data', function (chunk) {
    stdout += chunk;
  });

  child.stderr.on('data', function (chunk) {
    stderr += chunk;
  });

  killTimeout = setTimeout(function () {
    child.kill();
    console.log('  ' + path.basename(test) + ' timed out');
    callback();
  }, testTimeout);

  child.on('exit', function (exitCode) {
    clearTimeout(killTimeout);

    console.log('  ' + (exitCode ? '✘' : '✔') + ' ' + path.basename(test));

    (exitCode ? failed : success).push(test);

    if (exitCode || verbose) {
      console.log('stdout:');
      process.stdout.write(stdout);

      console.log('stderr:');
      process.stdout.write(stderr);
    }

    callback();
  })
}

function runTests(tests) {
  var index = 0;

  console.log('Running tests:');

  if(!tests.length) return console.log('No test to run buddy');

  function next() {
    if (index === tests.length - 1) {
      console.log();
      console.log('Summary:');
      console.log('  ' + success.length + '\tpassed tests');
      console.log('  ' + failed.length + '\tfailed tests');
      process.exit(failed.length);
    }
    runTest(tests[++index], next);
  }
  runTest(tests[0], next);
}

runTests(fs.readdirSync(pathPrefix).filter(function (test) {
  return test.substr(0, 5) === 'test-'
}));
