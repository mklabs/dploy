
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  glob = require('glob'),
  cloudfiles = require('cloudfiles'),
  Publisher = require('./publisher');

module.exports = Cloudfiles;
//
// **Rackspace Cloudfiles publisher** - A simple higher level interface to work with
// Rackspace cloudfiles through [node-cloudfiles](https://github.com/nodejitsu/node-cloudfiles#readme).
//
// The publish method will "clean" the remote endpoint before streaming in
// any files under `_site/` directory. Depending on connection and the number of
// files to process, this may go very quickly or take a while.
//
// - config - a Hash object where `username`, `apiKey` and `container` values
// are setup.
function Cloudfiles(config) {
  config = config || {};
  Publisher.call(this);

  this.cwd = config.cwd || process.cwd();
  this.path = path.resolve(this.cwd || '_site');
  this.username = config.username;
  this.key = config.apiKey || config.key;
  this.containerName = config.container;

  if(!this.username) return this.emit('error', new Error('Required username config unset'));
  if(!this.key) return this.emit('error', new Error('Required key config unset'));
  if(!this.containerName) return this.emit('error', new Error('Required container config unset'));

  this.client = cloudfiles.createClient({
    auth: {
      username: this.username,
      apiKey: this.key
    }
  });
}

util.inherits(Cloudfiles, Publisher);

// publish - removed any files before adding in anything that is under
// `_site` directory.
Cloudfiles.prototype.publish = function publish(cb) {
  var self = this;
  this.clean(function(e) {
    if(e) return cb(e);
    var files = glob.sync('**/*', { cwd: self.path }).filter(function(filepath) {
      return !fs.statSync(path.resolve(self.path, filepath)).isDirectory();
    });

    var ln = files.length;
    this.info('About to upload', files.length, 'files to container', self.containerName);
    files.forEach(function(file) {
      var filepath = path.resolve(self.path, file);
      self.put(file, filepath, function(err, res){
        if(err) return next(err);
        self.debug('done streaming ', file);
        next();
      });
    });

    function next(e) {
      if(e) return cb(e);
      if(--ln) return;
      self.undebug();
      return cb();
    }
  });
};


// get a container for further usage
Cloudfiles.prototype.container = function container(cb) {
  var client = this.client,
    self = this;

  if(self._container) return cb(null, self._container);
  client.setAuth(function (err) {
    if(err) return cb(err);
    client.createContainer(self.containerName, function (err, container) {
      if(err) return cb(err);
      self._container = container;
      return cb(null, container);
    });
  });
};

Cloudfiles.prototype.clean = function clean(cb) {
  this.info('Cleaning Rackspace cloudfiles container', this.containerName);
  this.warn('Every files under', this.containerName, 'container will be removed');
  var client = this.client,
    self = this;
  this.list(function(e, files) {
    if(e) return cb(e);
    self.info('About to delete', files.length, 'files from container', self.containerName);
    var ln = files.length;
    if(!ln) return cb();
    files.forEach(function(file) {
      client.destroyFile(self.containerName, file.name, function(e, res) {
        if(e) return cb(e);
        self.debug('done deleting ', file.name);
        ln--;
        if(!ln) {
          self.undebug();
          return cb();
        }
      });
    });
  });
};


// put a single file to the configured container
Cloudfiles.prototype.put = function put(file, from, cb) {
  var self = this;
  this.container(function(err, container) {
    if(err) return cb(err);
    client.addFile(self.containerName, {
      remote: file,
      local: from
    }, cb);
  });
};


// list all files in the container
Cloudfiles.prototype.list = function list(cb) {
  var client = this.client,
    self = this;
  this.container(function(err, container) {
    if(err) return cb(err);
    client.getFiles(self.containerName, function(err, files) {
      if(err) return cb(err);
      return cb(null, files);
    });
  });
};

