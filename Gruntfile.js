module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-mocha-test");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
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
        }
    });

    grunt.registerTask("test", "mochaTest:test");
    grunt.registerTask("ci-test", "mochaTest:ci");
    grunt.registerTask("default", "test");
};
