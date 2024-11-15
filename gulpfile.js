const gulp = require('gulp');
const ts = require('gulp-typescript');
const swc = require('gulp-swc');
const del = require('del');

gulp.task('clean', async function () {
  await del('lib/**');
  await del('es/**');
  await del('dist/**');
});

const swcConfig = {
  env: {
    targets: { node: 16, chrome: '79' },
  },
  jsc: {
    parser: {
      syntax: 'typescript',
      topLevelAwait: false,
    },
  },
  module: {},
  sourceMaps: false,
  minify: false,
};

gulp.task('cjs', function () {
  swcConfig.module.type = 'commonjs';
  return gulp.src('src/**/*.ts').pipe(swc(swcConfig)).pipe(gulp.dest('lib/'));
});

gulp.task('es', function () {
  swcConfig.module.type = 'es6';
  return gulp.src('src/**/*.ts').pipe(swc(swcConfig)).pipe(gulp.dest('es/'));
});

gulp.task('declaration', function () {
  const tsProject = ts.createProject('tsconfig.pro.json', {
    declaration: true,
    emitDeclarationOnly: true,
  });
  return tsProject.src().pipe(tsProject()).pipe(gulp.dest('es/')).pipe(gulp.dest('lib/'));
});

exports.default = gulp.series('clean', 'cjs', 'es', 'declaration');
