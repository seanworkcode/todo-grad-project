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
        }
    });

    grunt.registerTask("test", ["mochaTest:test", "mocha_istanbul:test"]);
    grunt.registerTask("ci-test", ["mochaTest:ci", "mocha_istanbul:ci"]);
    grunt.registerTask("default", "test");
};
