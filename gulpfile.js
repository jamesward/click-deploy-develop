var gulp = require('gulp'),
  gutil = require('gulp-util'),
  pkg = require('./package.json');

// load .env into process.env
require('dotenv').load();

// Start a server with livereload support
gulp.task('server', function() {
  var livereload = require('gulp-livereload');
  livereload.listen();

  require('gulp-nodemon')({script: 'app.js', stdout: false}).on('readable', function() {
    // this waits until the actual server is up
    this.stdout.on('data', function(chunk) {
      if (/^Running/.test(chunk)) {
        livereload.reload();
      }
      process.stdout.write(chunk);
    });
  });
});


// Install the gulp-control Atom package and then run Atom
gulp.task('atom', function(cb) {
  var atomPaths = require('gulp-atom-downloader');
  var proc = require('child_process');
  var path = require('path');

  atomPaths().then(function(atomPaths) {
    // todo: cleanup

    // quietly install gulp-control
    proc.spawn(atomPaths.apm, ['install', '-q', 'gulp-control']).on('close', function (code) {
      if (code != 0) {
        cb('Could not use apm to install gulp-control.');
      }
      else {
        // quietly install heroku-tools
        proc.spawn(atomPaths.apm, ['install', '-q', 'heroku-tools']).on('close', function (code) {
          if (code != 0) {
            cb('Could not use apm to install heroku-tools.');
          }
          else {
            proc.spawn(atomPaths.atom, ['./', 'README.md']).on('close', function (code) {
              if (code == 0) cb();
              else cb('Atom shutdown with an error.');
            });
          }
        });
      }
    });
  });
});


// Deploy the app on Heroku
gulp.task('heroku-deploy', function() {
  var apiToken = process.env.HEROKU_API_TOKEN;
  var appName = process.env.HEROKU_APP_NAME || require('path').basename(__dirname);

  if (apiToken == null) {
    throw new gutil.PluginError(pkg.name, 'You must set a HEROKU_API_TOKEN in a .env file.');
  }

  return gulp.src(['app.js', 'gulpfile.js', 'package.json', 'gulp', 'gulp.exe'])
    .pipe(require('gulp-tar')('app.tar'))
    .pipe(require('gulp-gzip')())
    .pipe(require('gulp-heroku-source-deployer').deploy(apiToken, appName))
    .on('data', function(buildInfo) {
      gutil.log('Deploy has begun!  Watch the progress:\n' +
        'https://dashboard.heroku.com/apps/' + appName + '/activity/builds/' + buildInfo.id);
    });
    // todo: better error handling when the app isn't found
});


// Default
gulp.task('default', ['atom', 'server']);
