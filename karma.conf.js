module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['browserify', 'mocha'],
        reporters: ['progress', 'coverage'],
        plugins: [
            'karma-browserify',
            'karma-babel-preprocessor',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-phantomjs-launcher',
            'karma-mocha'],
        files: ['src/**/*.js', 'util/**/*.js', 'test/**/*.js'],
        preprocessors: {
            'test/**/*.js': ['babel', 'browserify'],
            'src/**/*.js': ['babel', 'browserify', 'coverage'],
            'util/**/*.js': ['babel', 'browserify', 'coverage']},
        browserify: {
            debug: true,
            transform: ['babelify']}
    });
};
