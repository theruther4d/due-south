var gulp        = require("gulp");
var browserSync = require('browser-sync');
var awspublish  = require('gulp-awspublish');
var fs          = require('fs');

gulp.task('default', ['server', 'watch'], function() {
  require('./metalsmith')();
});

gulp.task('server', function () {
  return browserSync.init(['dist/**/*'], {
    server: { baseDir: './dist' },
    open: false,
    notify: false
  });
});

gulp.task('watch', function(){
  gulp.watch('./src/**/*', ['build']);
  gulp.watch('./templates/**/*', ['build']);
});

gulp.task('build', function(callback) {
  require('./metalsmith')(callback);
});

gulp.task('publish', ['build'], function() {
  var aws       = JSON.parse(fs.readFileSync('./aws.json'));
  var headers   = { 'Cache-Control': 'max-age=315360000, no-transform, public' };
  var publisher = awspublish.create({
    params: { Bucket: aws.bucket },
    accessKeyId: aws.key,
    secretAccessKey: aws.secret,
    region: aws.region
  });

  return gulp.src('./dist/**')
    .pipe(publisher.publish(headers))
    .pipe(awspublish.reporter());
});
