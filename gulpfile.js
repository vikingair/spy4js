'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var clean = require('gulp-clean');
var exec = require('child_process').exec;
var chalk = require('chalk');

var srcs = ['src/*.js', 'src/**/*.js', '!src/**/*test.js'];
var dist = './dist';

gulp.task('dist', function(cb) {
    return runSequence(
        'clean',
        'flow-check',
        'flow-dist',
        'compile-babel',
        'test',
        cb);
});

gulp.task('clean', function() {
    return gulp.src(dist, {read: false})
               .pipe(clean());
});

gulp.task('test', function(cb) {
    var KarmaServer = require('karma').Server;
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }).start();
    cb();
});

gulp.task('flow-dist', function() {
    return gulp.src(srcs)
               .pipe(rename({extname: '.js.flow'}))
               .pipe(gulp.dest(dist));
});

gulp.task('compile-babel', function() {
    return gulp.src(srcs)
               .pipe(babel())
               .pipe(gulp.dest(dist));
});

var runFlow = function(cb, noErrors) {
    exec('./node_modules/.bin/flow', function(error, stdout) {
        var lines = stdout.split('\n');
        var fileRegexp = /^src.*\.jsx?\:[\d]*/;
        var sumRegexpErr = /Found [\d]* error/;
        var sumRegexpOk = /No errors/;
        var pointerRegexp = /\^/;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (fileRegexp.test(line)) {
                console.log(chalk.red.underline(line));
            } else if (pointerRegexp.test(line)) {
                var start = line.indexOf('\^');
                var end = line.lastIndexOf('\^');
                console.log(
                    line.slice(0, start) + chalk.yellow(line.slice(start, end + 1)) + line.slice(end + 1)
                );
            } else if (sumRegexpErr.test(line)) {
                console.log(chalk.white.bold.underline('TypeCheck:') + ' ' + chalk.red.bold(line));
            } else if (sumRegexpOk.test(line)) {
                console.log(chalk.white.bold.underline('TypeCheck:') + ' ' + chalk.green.bold(line));
            } else {
                console.log(chalk.white(line));
            }
        }
        if (!noErrors && error) {
            cb(error);
        } else {
            cb();
        }
    });
};
gulp.task('flow-check', function(cb) {
    runFlow(cb, false);
});