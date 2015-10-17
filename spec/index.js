/**
 * Let's use the standard node.js module "assert" for making assertions. 
 * We could use a richer framework, such as should.js or chai.
 */
var assert = require("assert");


/**
 * Load the code that we want to test. It is a simple node module, 
 * which exposes two functions.
 */
var app = require("../app/index.js");


/**
 * Create a test suite for our "app" node module.
 */
describe("app", function() {

	/**
	 * Within the module test suite, create a test suite for 
	 * the "doSomething()" function
	 */
	describe("doSomething", function() {

		/**
		 * Define a first test for the function
		 */
		it("should return a string", function() {
			var result = app.doSomething();
			assert.equal('string', typeof result);
		});

		/**
		 * Define a second test for the function
		 */
		it("should return 'sweet'", function() {
			var result = app.doSomething();
			assert.equal("sweet", result);
		});
	});

	/**
	 * Within the module test suite, create a test suite for the 
	 * "doSomethingAsynchronously()" function.
	 */
	describe("doSomethingAsynchronously", function() {
		it("should return 'cool'", function(done) {
			this.timeout(5000);
			app.doSomethingAsynchronously(function(result) {
				assert.equal("cool", result);
				done();
			});
		});
	});
});
