import gulp from 'gulp';
import util from 'gulp-util';
import del from 'del';
import concat from 'gulp-concat';
import childProcess from 'child_process';
import readline from 'readline';

import log from './log';
import Server from './server/server';

gulp.task('hi', done => {
    log.info('Hi, this is eve.');
    done();
});

gulp.task('build', () => gulp
    .src(['app/jspm_packages/system.js', 'app/jspm.config.js'])
    .pipe(concat('jspm.js'))
    .pipe(gulp.dest('app'))
);

var jspm = (cmd, done) => {
    childProcess.exec('jspm ' + cmd, (err, stdout, stderr) => {
        log.info(stdout);

        if (stderr) {
            log.info(stderr);
        }

        if (err) throw err;
        done();
    });
};

gulp.task('clean-bundle', gulp.series(
    () => del(['app/bundle.js', 'app/bundle.js.map']),
    done => jspm('unbundle app/bundle.js', done)
));

gulp.task('bundle', gulp.series(
    done => jspm('bundle jsx/app app/bundle.js -i', done)
));

gulp.task('release', gulp.series(
    'clean-bundle',
    'bundle',
    'build'
));

gulp.task('serve', gulp.series(
    done => {
        var server = new Server();

        server.listen();

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('', answer => {
            rl.close();
            server.close();
            done();
        });
    }
));

gulp.task('development', gulp.series(
    'clean-bundle',
    'build',
    'serve'
));

gulp.task('production', gulp.series(
    'release',
    'serve'
));

gulp.task('default', gulp.series(
    'development'
));

log.on('entry', entry => {
    switch (entry.level) {
        case 'info':
            util.log(entry.msg);
            break;
        default:
            break;
    }
});
