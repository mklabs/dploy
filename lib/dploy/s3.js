
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  knox = require('knox'),
  glob = require('glob'),
  events = require('events'),
  Publisher = require('./publisher');

module.exports = S3;

//
// **S3 publisher** - A simple higher level interface to work with
// AmazonS3 through [knox](https://github.com/LearnBoost/knox#readme).
//
// The publish method will "clean" the remote endpoint before streaming in
// any files under `_site/` directory. Depending on connection and the number of
// files to process, this may go very quickly or take a while.
//
// This will list each files to upload (glob), iterate through each one,
// initiate a new putStream for each and call callback on last completion
// (or if any error raised during the process)
//
// - config - a Hash object where `bucket`, `key` and `secret` values
// are setup. Optionnaly, `cwd` may be setup (defaults `process.cwd()`)
//
function S3(config) {
  config = config || {};
  Publisher.call(this);

  this.cwd = config.cwd || process.cwd();
  this.path = path.resolve(this.cwd || '_site');
  this.bucket = config.bucket;
  this.key = config.key;
  this.secret = config.secret;
  this.endpoint = config.endpoint;

  if(!this.bucket) return this.emit('error', new Error('Required bucket config unset'));
  if(!this.key) return this.emit('error', new Error('Required key config unset'));
  if(!this.secret) return this.emit('error', new Error('Required secret config unset'));

  var o = {
    bucket: this.bucket,
    key: this.key,
    secret: this.secret
  };

  if(config.endpoint) o.endpoint = config.endpoint;

  this.client = knox.createClient(o);
}

util.inherits(S3, Publisher);

S3.prototype.publish = function publish(cb) {
  var self = this;
  this.clean(function(e) {
    if(e) return cb(e);
    return cb();
    self.push(cb);
  });
};

S3.prototype.push = function push(cb) {
  var self = this,
    files = glob.sync('**/*', { cwd: this.path }).filter(function(filepath) {
      return !fs.statSync(path.resolve(self.path, filepath)).isDirectory();
    });

  var ln = files.length;
  this.info('About to upload', files.length, 'files and folders');
  files.forEach(function(file) {
    var filepath = path.resolve(self.cwd, file);
    var stream = fs.createReadStream(filepath);
    self.client.putStream(stream, '/' + file, function(err, res){
      if(err) return next(err);
      self.debug('done streaming ', file);
      next();
    });
  });

  function next(e) {
    if(e) return cb(e);
    if(--ln) return;
    self.cloself();
    return cb();
  }
};

S3.prototype.get = function get(file, cb) {
  this.debug('Getting AmazonS3 file', file);
  this.client.get(file).on('response', cb).end();
};

S3.prototype.list = function list(cb) {
  this.get('/', function(res) {
    var data = [];
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      data = data.concat(chunk);
    });

    res.on('end', function() {
      var body = data.join('');
      // parse xml response for any valid key, cleanup surrounding tag
      // and return the array results.
      var keys = (body.match(/<Key>([^<]+)<\/Key>/g) || []).map(function(key) {
        return key.replace(/<Key>|<\/Key>/g, '');
      });

      cb(null, keys, body, res);
    });
  });

  return this;
};

S3.prototype.clean = function clean(cb) {
  this.info('Cleaning AmazonS3 bucket', this.bucket);
  this.warn('Every files under', this.bucket, 'bucket will be removed');
  var client = this.client,
   self = this;
  this.list(function(e, files) {
    if(e) return cb(e);
    self.info('About to delete', files.length, 'files and folders');
    var ln = files.length;
    if(!ln) return cb();
    files.forEach(function(file) {
      client.deleteFile(file, function(e, res) {
        self.debug('done deleting ', file);

        if(e) return cb(e);
        if(--ln) return;
        self.cloself();
        return cb();
      });
    });
  });
}
