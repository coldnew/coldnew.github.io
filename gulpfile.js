
// Load plugins
var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    util = require('gulp-util'),
    rev = require('gulp-rev'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    notify = require('gulp-notify'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    path = require('path'),
    livereload = require('gulp-livereload'),
    sync = require('gulp-npm-script-sync'),
    del = require('del'),
    shell = require('gulp-shell'),
    ghpages = require('gulp-gh-pages'),
    streamqueue = require('streamqueue'),
    run = require('gulp-run');

var config = {
    // source code
    src_content: 'content/**/*',
    src_js: 'theme/js/**/*.js',
    src_less: 'theme/less/**/*.less',
    src_images: 'theme/images/**/*',
    // output
    output_dir: 'output',
    output_js_dir: 'output/theme/js',
    output_css_dir: 'output/theme/css',
    output_fonts_dir: 'output/theme/fonts',
    output_images_dir: 'output/theme/images',
    // development hint
    sourceMaps: util.env.debug  // use gulp --debug to trigger
};

// update package.json from gulp
sync(gulp);

// livereload server
gulp.task('server', function() {
    connect.server({
        root: ['output'],
        port:8000,
        livereload: false
    });
});

// Fonts
gulp.task('fonts', function() {
    gulp.src([ 'bower_components/font-awesome/fonts/fontawesome-webfont.*',
               'bower_components/bootstrap/fonts/glyphicons-halflings*.*'])
        .pipe(gulp.dest(config.output_fonts_dir));
});

// Js
gulp.task('js', function() {
    // my js sources
    var files = gulp.src(config.src_js)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'));

    // 3rdparty libraries
    var libraries = gulp.src([
        // jquery
        'bower_components/jquery/dist/jquery.min.js',
        // bootstrap
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        // fancybox
        'bower_components/fancybox/source/jquery.fancybox.js',
        'bower_components/fancybox/source/helpers/jquery.fancybox-buttons.js',
        'bower_components/fancybox/source/helpers/jquery.fancybox-media.js',
        'bower_components/fancybox/source/helpers/jquery.fancybox-thumbs.js',
    ]);

    // merge all streams in order
    var stream = streamqueue({ objectMode: true });
    stream.queue(libraries);
    stream.queue(files);

    return stream.done()
        .pipe(concat('blogit.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(config.output_js_dir))
        .pipe(notify({ message: 'js task complete' }));
});

// Css
gulp.task('css', function() {
    var files = gulp.src(config.src_less)
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(minifycss())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(gulpif(config.sourceMaps, sourcemaps.write('.')));

    var libraries = gulp.src([
        'bower_components/font-awesome/css/font-awesome.min.css',
    ]);

    // merge all streams in order
    var stream = streamqueue({ objectMode: true });
    stream.queue(libraries);
    stream.queue(files);

    return stream.done()
        .pipe(concat('blogit.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.output_css_dir))
        .pipe(notify({ message: 'css task complete' }));
});

// Images
gulp.task('images', function() {
    return gulp.src(config.src_images)
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest(config.output_images_dir))
        .pipe(notify({ message: 'Images task complete' }));
});

// // Revision
// gulp.task('rev', ['css','js'], function() {
//     return gulp.src(['static/**/*.css', 'static/**/*.js'])
//         .pipe(rev())
//         .pipe(gulp.dest('static'))
//         .pipe(rev.manifest())
//         .pipe(gulp.dest('static'));
// });

// publish
gulp.task('publish', function() {
    run("pelican -s pelicanconf.py").exec();
});

// deploy
gulp.task('deploy', function(){
    // TODO: republish content with release version
    // then deploy
    return gulp.src('output/**/*')
        .pipe(ghpages({
            remoteUrl: "git@github.com:coldnew/coldnew.github.io.git",
            // TODO: since github only allow master branch for xxx.github.io, replace it later
            branch: "gh-pages"
        }));
});

// Clean
gulp.task('clean', function(cb) {
    //    del(['static/css', 'static/js', 'static/images'], cb)
    del(['output/**'], cb);
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('fonts', 'js', 'css', 'images', 'publish');
});

// Watch
gulp.task('watch', ['server'], function() {

    // Watch .less files
    gulp.watch(config.src_less, ['css']);

    // Watch .js files
    gulp.watch(config.src_js, ['js']);

    // Watch image files
    gulp.watch(config.src_images, ['images']);

    // Watch contents
//    gulp.watch(config.src_content, ['publish']);

    // // // Watch any files in dist/, reload on change
    // gulp.watch(['output/**/*']).on('change',function(file){
    //     gulp.src(file.path)
    //         .pipe(connect.reload());
    // });
});