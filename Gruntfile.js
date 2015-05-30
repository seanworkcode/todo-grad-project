module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-istanbul");
    grunt.loadNpmTasks("grunt-coveralls");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = "build_artifacts";
    grunt.initConfig({
        jshint: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/**/*.js"],
            options: {
                jshintrc: true
            }
        },
        jscs: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/**/*.js"]
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    reporter: "xunit",
                    captureFile: testOutputLocation + "/mocha/results.xml",
                    quiet: true
                }
            }
        },
        "mocha_istanbul": {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    quiet: true
                }
            },
            options: {
                coverageFolder: artifactsLocation,
                check: {
                    lines: 100,
                    statements: 100,
                    branches: 100,
                    functions: 100
                },
                reportFormats: ["lcov"]
            }
        },
        coveralls: {
            ci: {
                src: artifactsLocation + "/lcov.info"
            }
        }
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["check", "mochaTest:test", "mocha_istanbul:test"]);
    grunt.registerTask("ci-test", ["check", "mochaTest:ci", "mocha_istanbul:ci", "coveralls"]);
    grunt.registerTask("default", "test");
};
