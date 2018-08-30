const gulp = require('gulp');   //czasem var zamiast const. ta linijka mówi, że chcemy użyć gulpa. używamy tym samym jakiegoś obiektu Gulp. ten obiekt udostepnia nam różne metody
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const c = require('ansi-colors');
const notifier = require('node-notifier');
var browserSync = require('browser-sync').create();


function showError(err) {  //jak sie pojawi bład, plumber odpali funkcję i zakończy zadanie mimo że jest błąd

    notifier.notify({
        title: 'Błąd kompilacji SCSS',
        message: err.messageFormatted
    });

    console.log(c.red('==============='));
    console.log(c.red(err.messageFormatted));
    console.log(c.red('==============='));
    this.emit('end');
}

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"  //lub "." //przeglądarka otworzy w pierwszej kolejności to, co jest w tym folderze
        },
        notify: false, //czy pokazywać tooltipa
        //host: "192.168.0.24", //IPv4 Address Wirless LAN adapter WiFi from ipconfig
        //port: 3000, //port na którym otworzy
        //browser: "google chrome" //jaka przeglądarka ma być otwierana - zaleznie od systemu - https://stackoverflow.com/questions/24686585/gulp-browser-sync-open-chrome-only
    });
});


gulp.task('sass', function () {
    return gulp.src('./scss/main.scss')     //w katalogu sass (i podkatalogach, jeśli jest /**/) znajdz wszystkie pliki z rozszerzeniem .scss, a następnie na nich wykonaj wsz poniższe operacje; ALE my każemy,żeby znalazl na razie main.scss
        .pipe(plumber({
            errorHandler: showError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed' //nested, expanded, compact, compressed
        }))   //!!!!!!! PO PIPACH NIE MA ŚREDNIKÓW. TYLKO NA KOŃCU
        .pipe(autoprefixer({
            browsers: ['last 2 versions'] //usuneliśmy cascade: false. LAST 2 VERSION to dwie ostatnie wersje przeglądarki. inne opcje: NA SLACKU link do githuba
        })).pipe(sourcemaps.write('.')) //'.' znaczy, że stworzy osobny plik obok css do zapisywnaia jakichś tam komentarzy do rzutowania
        .pipe(gulp.dest('./css'))    //wynik tych operacji zapisz w katalogu .css
        .pipe(browserSync.stream());
});

gulp.task('watch', function () {
    gulp.watch('./scss/**/*.scss', ['sass']); //obserwuj, czy coś się zmienia w jakimś pliku (z rozszerzeniem .scss w folderze 'scss' i podfolderach). jeśli tak, odpal zadanie 'sass' (powyżej).
    gulp.watch("*.html").on('change', browserSync.reload); //przeladuje stronę, jeśli pojawi się coś nowego w .html
});

gulp.task('default', function () {
   console.log(c.yellow('----- rozpoczęcie pracy -----'));
   gulp.start(['browser-sync', 'sass', 'watch']);         //sluży do odpalania innych tasków, w srodku tablica z nazwami tasków. default odpala się na starcie po wpisaniu 'gulp'. ja chcę, żeby na starcie odpalał mi się też 'watch'.
});

//LUB
// gulp.task['moje'] ////??????