/**
 * Let's use the standard node.js module "assert" for making assertions. We
 * could use a richer framework, such as should.js or chai.
 */
var assert = require("assert");


/**
 * Create a test suite for a distributed application, composed of several
 * sub-systems. This shows how test suites can be nested in multiple levels.
 */
describe("A distributed application", function() {

	describe("The backend sub-system", function() {

		describe("The REST API", function() {	
			it("should work", function() {});
		});

		describe("The business services", function() {	
			it("should work", function() {});
		});

		describe("The data access layer", function() {	
			it("should work", function() {
				throw Error("Technical error while talking to the database.");
			});
		});
	});

	describe("The front-end sub-system", function() {
		describe("The admin interface", function() {	
			describe("The monitoring pages", function() {	
				it("should work", function() {});
			});
			describe("The configuration pages", function() {	
				it("should work", function() {});
			});
		});
		describe("The end-user interface", function() {	
			describe("The account pages", function() {	
				it("should work", function() {
					var hasWorked = false;
					assert.equal(hasWorked, true);
				});
			});
			describe("The fun pages", function() {	
				it("should work", function() {});
			});
		});
	});

});


