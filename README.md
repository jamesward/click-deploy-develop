Click, Deploy, Develop
======================

This is a simple Node.js application that can be instantly deployed on Heroku and provides an out-of-the-box experience for local development.

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Once you've deployed this app on Heroku you can fetch the source for your deployed application by visiting [https://download-heroku-source.herokuapp.com](https://download-heroku-source.herokuapp.com).  After downloading the source simply run `gulp` or `gulp.exe` to download all of the necessary components, launch the local server, and run the Atom code editor.


Local Development
-----------------

This application uses the [gulp](http://gulpjs.com/) build tool, making it easy start a local server, run the Atom code editor, and deploy changes to Heroku.  The gulp build definition lives in the [gulpfile.js](gulpfile.js) file.  The local server is powered by [Express](http://expressjs.com/) and the code to start the server and handle requests lives in the [app.js](app.js) file.

Gulp builds have *tasks* that can be run from the command line or via Atom (with the [gulp-control](https://atom.io/packages/gulp-control) package).  This project has four tasks:

```
server        - Starts the local Express server, automatically reloads it on changes to app.js, and notifies the LiveReload browser plugin
atom          - Downloads the Atom code editor (if needed), installs the gulp-control and heroku-tools packages, and runs Atom
heroku-deploy - Deploys this app to Heroku
heroku-login  - Logs into Heroku
```

The `gulp.exe` and `gulp` executables can be run from a UI file explorer by double-clicking in Windows or for Mac ctrl-click and then select *Open*.  This runs the default gulp tasks `atom` and `server` causing Atom to be download and run, and the local server to be started.  The command line can also be used with tasks specified as command parameters, for instance:

    $ ./gulp server

With the local server up and running, check out the app in your browser: [http://localhost:5000](http://localhost:5000)

Now in Atom (or your preferred code editor), edit the [app.js](app.js) file and change `hello, world` to `hello, earthlings` and refresh your browser.  You should see your change.


Deploying Changes
-----------------

Once you are ready to deploy your changes back to Heroku, you can use the `heroku-deploy` gulp task.  Before running this task, it needs to know how to authenticate with Heroku and which Heroku application is being deployed.

The authentication info is stored in a `$HOME/.netrc` file. (Note: The [Heroku command-line client](https://toolbelt.heroku.com) also uses this file for authentication info.)  To login via Atom, select the *Heroku* menu, then *Login*, and after you login the credentials will be stored for the `heroku-deploy` gulp task to use.  To login from the command line run `./gulp heroku-login` on Mac or `gulp heroku-login` on Windows.

The target Heroku application to deploy to can be set as a `HEROKU_APP_NAME` parameter in a `.env` file or the directory name for this project will be used.  (Note: If you downloaded your source from [https://download-heroku-source.herokuapp.com](https://download-heroku-source.herokuapp.com) then the directory should already be named correctly.)

The `heroku-deploy` gulp task can be run from within Atom or from the command line.  In Atom, select the *Packages* menu, then *gulp-control*, then *Open*, then click on *heroku-deploy* and the app will be deployed.  Or from a command line run `./gulp heroku-deploy` (Mac) or `gulp heroku-deploy` (Windows) to deploy the app.

If you are familiar with the git SCM tool then you can use [Heroku's typical git workflow](https://devcenter.heroku.com/articles/git) to deploy your changes.  If you project is on GitHub then you can [have Heroku deploy changes whenever you push them to Github](https://devcenter.heroku.com/articles/github-integration).
