import gulp from 'gulp';
import stylelint from "gulp-stylelint";

const paths = {
  scss: './app/sass/blocks/*.scss',
};

function testScssLint() {
  return gulp.src(paths.scss).
    pipe(stylelint({
      reporters: [
        {
          failAfterError: true,
          formatter: 'string',
          console: true,
        },
      ],
    }));
  }

  const tests = gulp.parallel(testScssLint);
exports.tests = tests;

export default tests;
