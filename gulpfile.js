'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const exec = require('child_process').exec;
const chalk = require('chalk');

const srcs = ['src/*.js', '!src/*test.js'];
const dist = './dist';

gulp.task('dist', (cb) => {
    return runSequence(
        'clean',
        'flow-check',
        'flow-dist',
        'compile-babel',
        'test',
        cb);
});

gulp.task('clean', () => {
    return gulp.src(dist, {read: false})
               .pipe(clean());
});

gulp.task('test', (cb) => {
    const KarmaServer = require('karma').Server;
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }).start();
    cb();
});

gulp.task('flow-dist', () => {
    return gulp.src(srcs)
               .pipe(rename({extname: '.js.flow'}))
               .pipe(gulp.dest(dist));
});

gulp.task('compile-babel', () => {
    return gulp.src(srcs)
               .pipe(babel({
                   plugins: ["transform-flow-strip-types", "add-module-exports", "transform-runtime"],
                   presets: ["es2015", "stage-0"]
               }))
               .pipe(gulp.dest(dist));
});

const runFlow = (cb, noErrors) => {
    exec('./node_modules/.bin/flow', (error, stdout) => {
        const lines = stdout.split('\n');
        const fileRegexp = /^src.*\.jsx?:[\d]*/;
        const sumRegexpErr = /Found [\d]* error/;
        const sumRegexpOk = /No errors/;
        const pointerRegexp = /\^/;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (fileRegexp.test(line)) {
                console.log(chalk.red.underline(line));
            } else if (pointerRegexp.test(line)) {
                const start = line.indexOf('\^');
                const end = line.lastIndexOf('\^');
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

const runEslint = (cb, noErrors) => {
    exec('./node_modules/.bin/eslint --rulesdir=./etc ./src', (error, stdout) => {
        const lines = stdout.split('\n');
        const fileRegexp = /src.*\.jsx?$/;
        const sumRegexpErr = /[\d]* problems?/;
        let foundErr = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (fileRegexp.test(line)) {
                console.log(chalk.red.underline(line));
            } else if (sumRegexpErr.test(line)) {
                foundErr = true;
                console.log(chalk.white.bold.underline('EsLint:') + ' ' + chalk.red.bold(line));
            } else {
                console.log(chalk.white(line));
            }
        }
        if (!foundErr) {
            console.log(chalk.white.bold.underline('EsLint:') + ' ' + chalk.green.bold('no problems'));
            console.log('');
        }
        if (!noErrors && error) {
            cb(error);
        } else {
            cb();
        }
    });
};

gulp.task('flow-check', (cb) => {
    runFlow(cb, false);
});

gulp.task('eslint-check', (cb) => {
    runEslint(cb, false);
});
