var server = require("../server/server");
var webdriver = require("selenium-webdriver");
var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;

testing.describe("end to end", function() {
    var serverInstance;
    var driver;
    testing.beforeEach(function() {
        serverInstance = server(testPort);
        driver = new webdriver.Builder().forBrowser("chrome").build();
    });
    testing.afterEach(function() {
        serverInstance.close();
        driver.quit();
    });
    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            driver.get(baseUrl);
            driver.findElement(webdriver.By.css("h1")).getText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
    });
});
