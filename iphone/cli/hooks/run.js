/*
 * run.js: Titanium iOS CLI run hook
 *
 * Copyright (c) 2012, Appcelerator, Inc.  All Rights Reserved.
 * See the LICENSE file for more information.
 */

var appc = require('node-appc'),
	i18n = appc.i18n(__dirname),
	__ = i18n.__,
	__n = i18n.__n,
	afs = appc.fs,
	fs = require('fs'),
	path = require('path'),
	parallel = require('async').parallel,
	cp = require('child_process'),
	exec = cp.exec,
	spawn = cp.spawn;

exports.cliVersion = '>=3.X';

exports.init = function (logger, config, cli) {

	cli.addHook('build.post.compile', {
		priority: 10000,
		post: function (build, finished) {
			if (cli.argv.target != 'simulator') return finished();

			if (cli.argv['build-only']) {
				logger.info(__('Performed build only, skipping running of the application'));
				return finished();
			}

			logger.info(__('Running application in iOS Simulator'));

			var simulatorDir = afs.resolvePath('~/Library/Application Support/iPhone Simulator/' + build.iosSimVersion + '/Applications'),
				logFile = build.tiapp.guid + '.log';

			parallel([
				function (next) {
					logger.debug(__('Terminating all iOS simulators'));
					exec('/usr/bin/killall ios-sim', setTimeout(next, 250));
				},

				function (next) {
					exec('/usr/bin/killall "iPhone Simulator"', setTimeout(next, 250));
				},

				function (next) {
					// sometimes the simulator doesn't remove old log files in which case we get
					// our logging jacked - we need to remove them before running the simulator
					afs.exists(simulatorDir) && fs.readdirSync(simulatorDir).forEach(function (guid) {
						var file = path.join(simulatorDir, guid, 'Documents', logFile);
						if (afs.exists(file)) {
							logger.debug(__('Removing old log file: %s', file.cyan));
							fs.unlinkSync(file);
						}
					});

					setTimeout(next, 250);
				}
			], function () {
				var cmd = [
						'"' + path.join(build.titaniumIosSdkPath, 'ios-sim') + '"',
						'launch',
						'"' + build.xcodeAppDir + '"',
						'--sdk',
						build.iosSimVersion,
						'--family',
						build.iosSimType
					],
					findLogTimer,
					simProcess,
					simErr = [],
					stripLogLevelRE = new RegExp('\\[(?:' + logger.getLevels().join('|') + ')\\] '),
					logProcess,
					simStarted = false,
					simEnv = path.join(build.xcodeEnv.path, 'Platforms', 'iPhoneSimulator.platform', 'Developer', 'Library', 'PrivateFrameworks') +
							':' + afs.resolvePath(build.xcodeEnv.path, '..', 'OtherFrameworks');

				if (cli.argv.retina) {
					cmd.push('--retina');
					if (appc.version.gte(build.iosSimVersion, '6.0.0') && build.iosSimType == 'iphone' && cli.argv.tall) {
						cmd.push('--tall');	
					}
				}
				cmd = cmd.join(' ');

				logger.info(__('Launching application in iOS Simulator'));
				logger.trace(__('Simulator environment: %s', ('DYLD_FRAMEWORK_PATH=' + simEnv).cyan));
				logger.debug(__('Simulator command: %s', cmd.cyan));

				simProcess = spawn('/bin/sh', ['-c', cmd], {
					cwd: build.titaniumIosSdkPath,
					env: {
						DYLD_FRAMEWORK_PATH: simEnv
					}
				});

				simProcess.stderr.on('data', function (data) {
					data.toString().split('\n').forEach(function (line) {
						line.length && simErr.push(line.replace(stripLogLevelRE, ''));
					}, this);
				}.bind(this));

				simProcess.on('exit', function (code, signal) {
					clearTimeout(findLogTimer);
					logProcess && logProcess.kill();

					if (simStarted) {
						var endLogTxt = __('End simulator log');
						logger.log(('-- ' + endLogTxt + ' ' + (new Array(75 - endLogTxt.length)).join('-')).grey);
					}

					if (code || simErr.length) {
						finished(new appc.exception(__('An error occurred running the iOS Simulator'), simErr));
					} else {
						logger.info(__('Application has exited from iOS Simulator'));
						finished();
					}
				}.bind(this));

				// focus the simulator
				logger.info(__('Focusing the iOS Simulator'));
				exec([
					'osascript',
					'"' + path.join(build.titaniumIosSdkPath, 'iphone_sim_activate.scpt') + '"',
					'"' + path.join(build.xcodeEnv.path, 'Platforms', 'iPhoneSimulator.platform', 'Developer', 'Applications', 'iPhone Simulator.app') + '"'
				].join(' '), function (err, stdout, stderr) {
					if (err) {
						logger.error(__('Failed to focus the iPhone Simulator window'));
						logger.error(stderr);
					}
				});
				
				function findLogFile() {
					var files = fs.readdirSync(simulatorDir),
						file,
						i = 0,
						l = files.length,
						logLevelRE = new RegExp('^(\u001b\\[\\d+m)?\\[?(' + logger.getLevels().join('|') + ')\\]?\s*(\u001b\\[\\d+m)?(.*)', 'i');

					for (; i < l; i++) {
						file = path.join(simulatorDir, files[i], 'Documents', logFile);
						if (afs.exists(file)) {
							// if we found the log file, then the simulator must be running
							simStarted = true;
							
							// pipe the log file
							logger.debug(__('Found iPhone Simulator log file: %s', file.cyan));
							
							var startLogTxt = __('Start simulator log');
							logger.log(('-- ' + startLogTxt + ' ' + (new Array(75 - startLogTxt.length)).join('-')).grey);

							var position = 0,
								buf = new Buffer(16),
								buffer = '',
								readChangesTimer,
								lastLogger = 'debug';

							(function readChanges () {
								var stats = fs.statSync(file),
									fd,
									bytesRead,
									lines,
									m,
									line,
									i, len;
								
								if (position < stats.size) {
									fd = fs.openSync(file, 'r');
									do {
										bytesRead = fs.readSync(fd, buf, 0, 16, position);
										position += bytesRead;
										buffer += buf.toString('utf-8', 0, bytesRead);
									} while (bytesRead === 16);
									fs.closeSync(fd);
									
									lines = buffer.split('\n');
									buffer = lines.pop(); // keep the last line because it could be incomplete
									for (i = 0, len = lines.length; i < len; i++) {
										line = lines[i];
										if (line) {
											m = line.match(logLevelRE);
											if (m) {
												logger[lastLogger = m[2].toLowerCase()](m[4].trim());
											} else {
												logger[lastLogger](line);
											}
										}
									}
								}
								readChangesTimer = setTimeout(readChanges, 30);
							}());

							simProcess.on('exit', function() {
								clearTimeout(readChangesTimer);
							});

							// we found the log file, no need to keep searching for it
							return;
						}
					}

					// didn't find any log files, try again in 250ms
					findLogTimer = setTimeout(findLogFile, 250);
				}

				afs.exists(simulatorDir) && findLogFile();
			});
		}
	});

};
