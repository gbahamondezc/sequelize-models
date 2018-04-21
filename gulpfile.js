"use strict";

var path             = require("path");
var gulp             = require("gulp");
var eslint           = require("gulp-eslint");
var excludeGitignore = require("gulp-exclude-gitignore");
var mocha            = require("gulp-mocha");
var istanbul         = require("gulp-istanbul");
var nsp              = require("gulp-nsp");
var plumber          = require("gulp-plumber");
var coveralls        = require("gulp-coveralls");
var open             = require("gulp-open");
var shell            = require("gulp-shell");
var sequence         = require("run-sequence");
var configMySQL      = require("./test/mysql/config.js");
var configPSQL       = require("./test/psql/config.js");
var Gutil            = require("gulp-util");
var del              = require("del");


function stringSrc (filename, string) {
  var src = require("stream").Readable({ objectMode : true });
  src._read = function () {
    this.push( new Gutil.File({
      cwd      : "",
      base     : "",
      path     : filename,
      contents : new Buffer(string)
    }));
    this.push(null);
  };
  return src;
}

gulp.task("clean-migrations", function() {
  del("./migrations/*.js");
});

gulp.task("cp-config-psql", function() {
  gulp.src("./migrations_data/postgres/**/*.js")
    .pipe(gulp.dest("./migrations"));
});


gulp.task("cp-config-mysql", function() {
  gulp.src("./migrations_data/mysql/**/*.js")
    .pipe(gulp.dest("./migrations"));
});


gulp.task("config-mysql", ["clean-migrations", "cp-config-mysql"], function() {
  var jsonObject = {
    development : {
      username : configMySQL.connection.username,
      password : configMySQL.connection.password,
      database : configMySQL.connection.schema,
      host     : configMySQL.connection.host,
      dialect  : configMySQL.connection.dialect,
      port: 3308
    }
  };
  var jsString = JSON.stringify(jsonObject, null, 2);
  return stringSrc("config.json", jsString)
    .pipe( gulp.dest("./config/"));
});


gulp.task("config-psql", ["clean-migrations", "cp-config-psql"], function() {
  var jsonObject = {
    development : {
      username : configPSQL.connection.username,
      password : configPSQL.connection.password,
      database : configPSQL.connection.schema,
      host     : configPSQL.connection.host,
      dialect  : configPSQL.connection.dialect,
      port: 5438
    }
  };
  var jsString = JSON.stringify(jsonObject, null, 2);
  return stringSrc("config.json", jsString)
    .pipe( gulp.dest("./config/"));
});


gulp.task("lint", function () {
  return gulp.src("**/*.js")
    .pipe( excludeGitignore())
    .pipe( eslint())
    .pipe( eslint.format())
    .pipe( eslint.failAfterError());
});


gulp.task("docs:generate", shell.task([
  "./node_modules/jsdoc/jsdoc.js --recurse  \
  ./lib ./Readme.md -t ./node_modules/minami/ -d ./docs"
]));


gulp.task("docs:open", function () {
  gulp.src("./docs/index.html").pipe( open() );
});


gulp.task("docs", function () {
  sequence("docs:generate", "docs:open");
});


gulp.task("nsp", function (cb) {
  nsp({package: path.resolve("package.json")}, cb);
});


gulp.task("pre-test", function () {
  return gulp.src("lib/**/*.js")
    .pipe( excludeGitignore())
    .pipe( istanbul({
      includeUntested : true
    }))
    .pipe( istanbul.hookRequire());
});


gulp.task("test", [ "pre-test" ], function (cb) {
  var mochaErr;

  gulp.src("test/**/*.js")
    .pipe( plumber())
    .pipe( mocha( { reporter: "spec" } ))
    .on("error", function (err) {
      mochaErr = err;
    })
    .pipe( istanbul.writeReports())
    .on( "end", function () {
      cb( mochaErr );
    });
});


gulp.task("watch", function () {
  gulp.watch([ "lib/**/*.js", "test/**" ], [ "test" ]);
});


gulp.task("coveralls", [ "test" ], function () {
  if (!process.env.CI) {
    return;
  }
  return gulp.src( path.join( __dirname, "coverage/lcov.info"))
    .pipe( coveralls());
});

gulp.task("prepublish", [ "nsp" ]);
gulp.task("default", [ "lint", "test", "coveralls" ]);
