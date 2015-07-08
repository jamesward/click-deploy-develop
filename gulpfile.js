var gulp = require('gulp'),
  gutil = require('gulp-util'),
  pkg = require('./package.json');

if (require('fs').existsSync(".env")) {
  // load .env into process.env
  require('dotenv').load();
}

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
            proc.spawn(atomPaths.atom, ['./', 'README.md'], {env: {ATOM_PATH: atomPaths.base}}).on('close', function (code) {
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
  var machines = require('netrc2')();
  var apiToken = machines['api.heroku.com'][1];

  if (apiToken == null) {
    throw new gutil.PluginError(pkg.name, 'You must set a HEROKU_API_TOKEN in a .env file.');
  }

  var appName = process.env.HEROKU_APP_NAME || require('path').basename(__dirname);

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


// Login to Heroku
gulp.task('heroku-login', function(cb) {
  var readlineSync = require('readline-sync');

  var username = readlineSync.question('Heroku Username: ');
  var password = readlineSync.question('Heroku Password: ', {hideEchoBack:true});
  var secondFactor = readlineSync.question('Heroku 2FA Code (if enabled): ', {hideEchoBack:true});

  // try to login

  var options = {
    json: true,
    auth: {
      user: username,
      pass: password
    },
    headers: {
      'Heroku-Two-Factor-Code': secondFactor
    }
  };

  require('request').post('https://api.heroku.com/oauth/authorizations', options, function(error, response, body) {
    if (!error && response.statusCode == 201) {
      accessToken = body.access_tokens[0].token;

      var netrc = require('netrc2');
      machines = netrc();
      machines['api.heroku.com'] = [username, accessToken];
      machines.save();

      cb();
    }
    else {
      cb(body.error);
    }
  });

});



// Default
gulp.task('default', ['atom', 'server']);
