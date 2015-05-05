var gulp        = require("gulp");
var browserSync = require('browser-sync');

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

gulp.task('build', function() {
  require('./metalsmith')();
});
