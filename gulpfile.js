var gulp = require('gulp'),
  gutil = require('gulp-util'),
  pkg = require('./package.json');


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

  gulp.watch('bower.json', ['bower-install', livereload.reload]);
});


// Update the Bower dependencies based on the bower.json file
gulp.task('bower-install', function(next) {
  require('bower').commands.install([], {}, { interactive: false })
    .on('end', function () {
      gutil.log('Bower Dependencies Updated');
      next();
    })
    .on('log', function (log) {
      if (log.level == 'action' && log.id == 'install') {
        gutil.log('Added Bower Dependency: ', log.message);
      }
    })
    .on('error', function (error) {
      gutil.error('Bower Error: ', error);
      next(error);
    });
});


// Run Atom
gulp.task('atom', function() {
  var atomExePath = require('gulp-atom-downloader');
  var proc = require('child_process');

  return atomExePath().then(function(atomExePath) {
    return proc.spawn(atomExePath, ['./']);
  });
});


// Deploy the app on Heroku
gulp.task('heroku-deploy', function() {
  var apiToken = process.env.HEROKU_API_TOKEN;
  var appName = process.env.HEROKU_APP_NAME || require("path").basename(__dirname);

  return gulp.src(['app.js', 'bower.json', 'gulpfile.js', 'package.json', 'gulp', 'gulp.exe'])
    .pipe(require('gulp-tar')('app.tar'))
    .pipe(require('gulp-gzip')())
    .pipe(require('gulp-heroku-source-deployer').deploy(apiToken, appName))
    .on("data", function(buildInfo) {
      gutil.log("Deploy has begun!  Watch the progress:\n" +
        "https://dashboard.heroku.com/apps/" + appName + "/activity/builds/" + buildInfo.id);
    });
});


// Default
gulp.task('default', []);