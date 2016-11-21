var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),//js压缩
    concat = require('gulp-concat'),//文件合并
    rename = require('gulp-rename'),//文件更名
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    plumber = require('gulp-plumber'),
    webserver = require('gulp-webserver'),
    opn = require('opn'),
    config = require('./config.json');
//css处理所需插件
var concat = require('gulp-concat');
//- 多个文件合并为一个；
var minifyCss = require('gulp-minify-css');
//- 压缩CSS为一行； 
var rev = require('gulp-rev');
//- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');

//开启本地 Web 服务器功能
gulp.task('webserver', function () {
    gulp.src('./src')
        .pipe(webserver({
            host: config.localserver.host,
            port: config.localserver.port,
            livereload: true,
            directoryListing: false
        }));
});
//通过浏览器打开本地 Web服务器 路径
gulp.task('openbrowser', function () {
    opn('http://' + config.localserver.host + ':' + config.localserver.port);
});

//处理css包括 css压缩与MD5命名及路径替换
gulp.task('concat', function () {                                //- 创建一个名为 concat 的 task
    gulp.src('./src/css/**/*.css')    //- 需要处理的css文件，放到一个字符串数组里   
        .pipe(minifyCss())                                      //- 压缩处理成一行                               //- 压缩处理成一行
        .pipe(rev())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest('./build/css'))                               //- 输出文件本地
        .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev'));                              //- 将 rev-manifest.json 保存到 rev 目录内

});

gulp.task('rev', function () {
    gulp.src(['./rev/*.json', './src/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('./build/'));                     //- 替换后的文件输出的目录

});
//js处理
// 合并、压缩js文件

gulp.task('alljs', function () {
    return gulp.src('src/js/*.js')
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('build/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));;
});
//这里获取不到 文件
gulp.task('revjs', function () {
    gulp.src(['./rev/js/*.json', './build/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('./build/'));                     //- 替换后的文件输出的目录

});

//压缩图片
gulp.task('imagemin', function () {
    return gulp.src('./src/images/*.{jpg,gif,png}')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./build/images'));
});

gulp.task('default', ['webserver', 'openbrowser']);
gulp.task('build', ['concat', 'rev', 'alljs','revjs','imagemin']);