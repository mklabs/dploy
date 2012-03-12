
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  events = require('events');

module.exports = Publisher;

// ### Publishers

//
// Publishers are object that needs to expose only one method: publish.
//
// `publisher.publish` is an async process, so the last argument of the
// publish method is always a callback. The actual implementation of the
// publish process is left to the implementer.


// ### Base class for publisher
//
// Is an EventEmitter and provides the necessary interface for spawning
// child process and common utilities for publishers.

function Publisher(config) {
	config = config || {};
  events.EventEmitter.call(this);
  this.options = config;
  this._progress = false;

  this.loglevel = config.loglevel || 4;
}

util.inherits(Publisher, events.EventEmitter);

// **publish** - noop, meant to be overriden by subclass
Publisher.prototype.publish = function publish(cb) {};


// **spawn** - simple child process spawn helper.
//
// - cmd 			- the command to run
// - args 		- list of String arguments
// - o 				- child process options (with cwd, env, setsid, customFds)
// - takeOver	- a Boolean to indicate whether the child process should run
//							using same file descriptors for stdio than current process.
// - cb				- callback to execute on completion
Publisher.prototype.spawn = function spawn(cmd, args, o, takeOver, cb) {
  if(!cb) {
    cb = takeOver;
    takeOver = false;
  }

  if(takeOver) o.customFds = [0, 1, 2];
  ch = child.spawn(cmd, args, o).on('exit', cb);
  return ch;
};

// **write** - little log helper, using loglevel to info will get a set of `.` to
// emulate a progress bar or using raw debug statement when appropriate. Should be
// used with messages, most likely just something like `.`
Publisher.prototype.write = function write() {
  var args = Array.prototype.slice.call(arguments).join(' '),
    level = this.loglevel,
    higher = level < 4;

  if(higher) return this.log.apply(this, arguments);

  if(this._progress) return this._write(args);

  this._progress = true;
	return this._write('»', args);
};

Publisher.prototype._write = function _write() {
	var args = Array.prototype.slice.call(arguments);
  process.stdout.write(args.join(' '));
  return this;
};

// **cloself** - close the debugging output, switching back progress flag to false,
// adding a new line feed to std output.
Publisher.prototype.cloself = function close() {
  this._progress = false;
  return this._write('\n');
};

// Logger interface, this will eventually be configurable.
['error', 'warn', 'info', 'log', 'debug'].forEach(function(lvl) {
  Publisher.prototype[lvl] = function() {
  	var args = Array.prototype.slice.call(arguments);
		lvl = lvl === 'debug' ? 'log' : lvl;
		console[lvl].apply(console, args);
  };
});

