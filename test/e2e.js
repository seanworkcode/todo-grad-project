var express = require("express");
var server = require("../server/server");
var webdriver = require("selenium-webdriver");
var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

testing.describe("end to end", function() {
    var router;
    var serverInstance;
    var driver;
    testing.beforeEach(function() {
        router = express.Router();
        if (gatheringCoverage) {
            router.get("/main.js", function (req, res) {
                var absPath = path.join(__dirname, "..", "public", "main.js");
                res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
            });
        }
        serverInstance = server(testPort, router);
        driver = new webdriver.Builder().forBrowser("chrome").build();
    });
    testing.afterEach(function() {
        if (gatheringCoverage) {
            driver.executeScript("return __coverage__;").then(function (coverage) {
                collector.add(coverage);
            });
        }
        serverInstance.close();
        driver.quit();
    });
    if (gatheringCoverage) {
        testing.after(function () {
            fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
        });
    }
    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            driver.get(baseUrl);
            driver.findElement(webdriver.By.css("h1")).getText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
    });
});

