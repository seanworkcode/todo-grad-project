module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-istanbul");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = process.env.CIRCLE_ARTIFACTS || "build_artifacts";
    grunt.initConfig({
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
        mocha_istanbul: {
            coverage: {
                src: ["test/**/*.js"],
                options: {
                    coverageFolder: artifactsLocation + "/coverage",
                    check: {
                        lines: 100,
                        statements: 100
                    },
                    reportFormats: ["lcov"]
                }
            }
        }
    });

    grunt.registerTask("test", ["mochaTest:test", "mocha_istanbul"]);
    grunt.registerTask("ci-test", ["mochaTest:ci", "mocha_istanbul"]);
    grunt.registerTask("default", "test");
};
