/*
 * create.js: Titanium iOS CLI create command
 *
 * Copyright (c) 2012, Appcelerator, Inc.  All Rights Reserved.
 * See the LICENSE file for more information.
 */

var appc = require('node-appc'),
	afs = appc.fs,
	path = require('path');

exports.config = function (logger, config, cli) {
	return {
		//
	};
};

exports.run = function (logger, config, cli, projectConfig) {
	var templatePath = afs.resolvePath(path.dirname(module.filename), '..', '..', 'templates', cli.argv.type, cli.argv.template),
		projectDir = afs.resolvePath(cli.argv['workspace-dir'], cli.argv.name);
	if (afs.exists(templatePath)) {
		afs.copyDirSyncRecursive(templatePath, projectDir, { preserve: true, logger: logger.debug });
	}
};
