const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');

gulp.task('clean', async function () {
  await del('lib/**');
});

gulp.task('cjs', function () {
  const tsProject = ts.createProject('tsconfig.pro.json', {
    module: 'CommonJS',
    declaration: true,
  });
  return tsProject.src().pipe(tsProject()).pipe(gulp.dest('lib/'));
});

exports.default = gulp.series('clean', 'cjs');
