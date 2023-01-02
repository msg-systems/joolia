// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-junit-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
            jasmine: {
                timeoutInterval: 10000
            }
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, '../coverage'),
            reports: ['html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },
        reporters: ['dots', 'junit'],
        junitReporter: {
            outputFile: 'test-results.xml'
        },
        port: 9876,
        jasmineNodeOpts: {
            defaultTimeoutInterval: 10000
        },
        colors: true,
        logLevel: config.LOG_LOG,
        browsers: ['Chrome_without_security'],
        browserDisconnectTimeout: 20000,
        browserDisconnectTolerance: 4,
        browserNoActivityTimeout: 4 * 60 * 1000,
        captureTimeout: 4 * 60 * 1000,
        customLaunchers: {
            Chrome_without_security: {
                base: 'ChromeHeadless',
                flags: ['--disable-web-security', '--disable-gpu', '--no-sandbox']
            }
        },
        singleRun: true
    });
};
