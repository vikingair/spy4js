module.exports = function(config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['browserify', 'mocha'],
        plugins: [
            require('karma-browserify'),
            require('karma-babel-preprocessor'),
            require('karma-chrome-launcher'),
            require('karma-mocha')
        ],
        files: [
            "src/**/*.js"
        ],
        preprocessors: {
            "src/**/*.js": ["babel", "browserify"]
        },
        browserify: {
            debug: true,
            transform: [ 'babelify' ]
        }
    });
};
