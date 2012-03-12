
var path = require('path'),
  util = require('util'),
  child = require('child_process'),
  Publisher = require('./publisher');

module.exports = Git;

//
// **Git publisher** - Uses configuration in `deploy.git` config
// to publish changes to the remote url on the given branch.
//
// Works by copying the files to process to `_deploy/`, initing a new repository in
// `_deploy/`, adding / comitting any new or updated files and pushing the changes
// back to configured remote.
//
// - config - a Hash object with url and branch setup.
//
function Git(config) {
  config = config || {};
  Publisher.call(this);

  this.path = path.resolve(config.dest || '_site');
  this.url = config.url;
  this.branch = config.branch;

  this.script = config.script || path.join(__dirname, './util/git.sh');

  if(!this.url) return this.emit('error', new Error('Required deploy.url config unset'));
  if(!this.branch) return this.emit('error', new Error('Required deploy.branch config unset'));
}

util.inherits(Git, Publisher);

Git.prototype.publish = function publish(cb) {
  if(!path.existsSync(this.path)) return cb(new Error("The destination output must exist. Make sure to generate as deploy won't do that for you"));
  if(!path.existsSync(this.script)) return cb(new Error("The deploy script must exist."));

  var opts = { env: process.env };
  opts.env.DPLOY_REMOTE_URL = this.url;
  opts.env.DPLOY_REMOTE_BRANCH = this.branch;

  this.info('Executing deploy script with following configuration');
  this.info('deploy script:', this.script);
  this.info('remote:', this.url);
  this.info('remote:', this.branch);
  this.debug('opts:', opts);

  this.spawn('sh', [this.script], opts, true, cb);
  return this;
};
