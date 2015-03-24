var gulp        = require("gulp");
var browserSync = require('browser-sync');

gulp.task('default', ['server', 'watch']);

gulp.task('server', function () {
  return browserSync.init(['dist/**/*'], {
    server: { baseDir: './dist' }
  });
});

gulp.task('watch', function(){
  gulp.watch('./src/**/*', ['build']);
  gulp.watch('./templates/**/*', ['build']);
});

gulp.task('build', function() {
  require('./metalsmith')();
});
