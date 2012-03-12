
module.exports = dploy;

dploy.Publisher = require('./dploy/publisher');

dploy.Git = require('./dploy/git');
dploy.S3 = require('./dploy/s3');
dploy.Cloudfiles = require('./dploy/cloudfiles');

//
// deploy higher level interface.
//
// - name 		- the adapter name to use
// - options 	- the Hash object configuration fot the adapter
// - cb 			- callback to execute on completion
//
function dploy() {}
