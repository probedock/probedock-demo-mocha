var Mocha = require('mocha');
var probedock = require('probedock-node').client;

var fs = require('fs');
var path = require('path');

/**
 * We use mocha programmatically, so we create an object that
 * exposes functionality of the testing framework
 */
var mocha = new Mocha();

/**
 * We need to tell Mocha where are the spec files (the files containing
 * the tests). We state that all files under the "test" directory with
 * a .js extension should be considered.
 */
var testDir = './spec'
fs.readdirSync(testDir).filter(function(file) {
	return file.substr(-3) === '.js';
}).forEach(function(file) {
	mocha.addFile(
	path.join(testDir, file));
});


/**
 * Load the Probe Dock configuration file. Probe Dock will look for
 * a file named "probedock.yml" in the current directory. The file should
 * contain the following YAML fragment, where apiId is the unique id assigned
 * by Probe Dock to your project and where server is the hostname of your
 * Probe Dock server.
 *
 * project:
 *   apiId: kvr0r1t0ydqx
 *   version: 1.0.0
 *   server: trial.probedock.io
 */
var config = probedock.loadConfig();

/**
 * Start the Probe Dock test run. After making this call, it is possible to
 * add test results when they are notified via Mocha events. We also set the
 * category for our tests to "Mocha".
 */
var probeDockTestRun = probedock.startTestRun(config);
probeDockTestRun.category = "Mocha";


/**
 * Ask Mocha to start the execution of the tests. Calling mocha.run() will
 * start the process and return a Runner object. We can attach event listeners
 * to this object, to be notified when the execution of test suites and individual
 * tests starts and completes. At this point, we can pass the information to
 * the Probe Dock client.
 */
var mochaRunner = mocha.run(function(numberOfFailures) {

	console.log("Mocha runner has finished. Number of failures: " + numberOfFailures);

	process.on('uncaughtException', function(error) {
		console.log("Uncaught exception: " + error.message);
		console.log(error.stack);
	});

	process.on('exit', function() {
		process.exit(numberOfFailures);
	});

	/**
	 * Mocha implements an "auto-exit" feature, which prevents hanging if there is
	 * an active event loop. For this reason, we ask the Probe Dock client to send
	 * its results to the Probe Dock server just after the process exits.
	 */
	process.once('beforeExit', function() {

		/**
		 * Tell the Probe Dock client that we are done executing all tests. Time to
		 * process the results (i.e. to send them to the server).
		 */
		probeDockTestRun.end();
		probedock.saveTestRun("./test-run-dump.json", probeDockTestRun, config);
		probedock.process(probeDockTestRun, config).then(function(logInfo, startTime) {
			console.log("Test results successfully sent to Probe Dock server.");
		}).fail(function(logError) {
			console.log("There was an error while sending the test results to the Probe Dock server.");
			console.log(logError);
		}).fin(function() {});
	});
});
console.log("The Mocha runner has " + mochaRunner.total + " tests to execute.");

mochaRunner.on('suite', function(suite) {
	//console.log('--> Execution of test suite started: ' + suite.title);
}).on('test', function(test) {
	//console.log('--> Exection of test started: ' + test.parent.title + " " + test.title);
}).on('test end', function(test) {
	//console.log('--> Execution of test completed: ' + test.parent.title + " " + test.title);
}).on('pass', function(test) {
	//console.log('--> Test has passed: ' + test.parent.title + " " + test.title);
	var metadata = getTestMetadataForProbeDock(test);
	probeDockTestRun.add(null, metadata.name, true, test.duration, {
		tags: metadata.tags
	});
}).on('fail', function(test, err) {
	debugger;
	//console.log('--> Test has failed (error): ' + test.parent.title + " " + test.title + " : " + err.message);
	var metadata = getTestMetadataForProbeDock(test);
	probeDockTestRun.add(null, metadata.name, false, test.duration, {
		tags: metadata.tags,
		message: err.name + ": " + err.message + " (expected: " + err.expected + ", actual: " + err.actual + ")"
	});
}).on('end', function() {
	//console.log("--> Execution of all test suites completed.");
}).on('error', function(error) {
	console.log("error: " + error)
}).on('uncaughtException', function(error) {
	console.log("uncaught exception: " + error);
});


/**
 * This function prepares metadata for Probe Dock. In our specs, we have tests,
 * within suites, within suites, within suites, etc. We create a tag for each
 * level (this is interesting, for instance if the developer is using sub-suites
 * for sub-systems). For the test name, we concateneate the name of the suite
 * ("describe") with the name of the test ("it").
 */

function getTestMetadataForProbeDock(test) {

	/**
	 * Probe Docks cannot contain spaces, so we replace them with hyphens
	 */
	function spaceToHyphen(text) {
		return text.replace(/\s/g, '-');
	}

	var metadata = {};
	var tags = [];

	var level = test.parent.parent;
	var name = test.parent.title + " " + test.title;

	while (level.parent !== undefined) {
		tags.unshift(spaceToHyphen(level.title));
		level = level.parent;
	};

	metadata.name = name;
	metadata.tags = tags;
	return metadata;
}
