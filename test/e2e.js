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
            router.get("/main.js", function(req, res) {
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
        testing.it("displays empty TODO list", function() {
            driver.get(baseUrl);
            driver.findElements(webdriver.By.css("#todo-list li")).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            router.get("/api/todo", function(req, res) {
                res.sendStatus(500);
            });
            driver.get(baseUrl);
            var errorElement = driver.findElement(webdriver.By.id("error"));
            driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"));
            errorElement.getText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            driver.get(baseUrl);
            driver.findElement(webdriver.By.id("new-todo")).sendKeys("New todo item");
            driver.findElement(webdriver.By.id("submit-todo")).click();
            driver.findElement(webdriver.By.id("new-todo")).getAttribute("value").then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            driver.get(baseUrl);
            driver.findElement(webdriver.By.id("new-todo")).sendKeys("New todo item");
            driver.findElement(webdriver.By.id("submit-todo")).click();
            driver.wait(webdriver.until.elementsLocated(webdriver.By.css("#todo-list li")));
            driver.findElements(webdriver.By.css("#todo-list li")).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            router.put("/api/todo", function(req, res) {
                res.sendStatus(500);
            });
            driver.get(baseUrl);
            driver.findElement(webdriver.By.id("new-todo")).sendKeys("New todo item");
            driver.findElement(webdriver.By.id("submit-todo")).click();
            var errorElement = driver.findElement(webdriver.By.id("error"));
            driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"));
            errorElement.getText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            driver.get(baseUrl);
            driver.findElement(webdriver.By.id("new-todo")).sendKeys("New todo item");
            driver.findElement(webdriver.By.id("submit-todo")).click();
            driver.findElement(webdriver.By.id("new-todo")).sendKeys("Another new todo item");
            driver.findElement(webdriver.By.id("submit-todo")).click();
            driver.wait(webdriver.until.elementsLocated(webdriver.By.css("#todo-list li")));
            driver.findElements(webdriver.By.css("#todo-list li")).then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
});

