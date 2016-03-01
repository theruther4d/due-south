// Get all our gulp needs:
var gulp = require( 'gulp' );
var rename = require( 'gulp-rename' );
var ejs = require( 'gulp-ejs' );
var del = require( 'del' );
var prismicStatic = require( 'prismic-static' );
var prismic = new prismicStatic( 'https://due-south.cdn.prismic.io/api' );
var ImgixClient = require( 'imgix-core-js' );
var browserSync = require( 'browser-sync' ).create();
var scss = require( 'gulp-sass' );
var prefix = require( 'gulp-autoprefixer' );
var cssMin = require( 'gulp-minify-css' );
var source = require( 'vinyl-source-stream' );
var browserify = require( 'browserify' );
var cheerio = require( 'cheerio' );
var resemble = require( 'node-resemble-js' );
// var http = require( 'http' );
var path = require( 'path' );
var https = require( 'https' );
// var request = require( 'request' );
var fs = require( 'fs' );
var gm = require( 'gm' );

// Path Variables:
var templateDir = './templates';

function makeImgixUrl( path ) {
    var fileName = path.substr( path.lastIndexOf( '/' ) + 1, path.length - 1 );

    return 'https://duesouth.imgix.net/' + fileName;
};

function sluggify( string ) {
    return string
            .toLowerCase()
            .replace( /[^\w ]+/g, '' )
            .replace( / +/g, '-' );
};

function getExcerpt( doc ) {
    var firstTextSlice  = -1,
        slices          = doc.getSliceZone( 'articles.body' ).slices;

    slices.forEach( function( slice, idx ) {
        if( slice.sliceType == 'text' && firstTextSlice == -1 ) {
            firstTextSlice = idx;
        }
    });

    if( firstTextSlice != -1 ) {
        var text = slices[firstTextSlice].value.asHtml();

        $ = cheerio.load( text );
        return $( 'p' ).eq( 0 ).text().substr( 0, 300 ) + '..';

    } else {
        return '';
    }
};

function download( url, dest, cb ) {
    var file = fs.createWriteStream( dest );
    var request = https.get( url, function( response ) {
        response.pipe( file );
        file.on('finish', function() {
            gm( file ).setFormat( 'png' ).write( __dirname + '/bozo.png', function( err ) {
                console.log( 'stuff' );
                file.close( cb );
            })
            // console.log( 'file finished' );
        });
    });
};

function convertToPng( file ) {
    // var converted = __dirname + '/bozo.png';
    // var writeStream = fs.createWriteStream( file );

    // console.log( writeStream );

    gm( file ).setFormat( 'png' ).write( __dirname + '/bozo.png', function( err ) {
        console.log( arguments );
        console.log( 'finished ', err );
    });
    // gm( file ).setFormat( 'png' ).pipe( writeStream );

    // writeStream.on( 'finish', function() {
    //     console.log( 'converted is finished' );
    //     file.close();
    // });
};

// download( 'https://duesouth.imgix.net/2554eb882db1c3fe769fc55ee50d6a9d79c05ec5_bedroom.jpg', __dirname + '/images/bozo.jpg', function() {
//     // convertToPng( __dirname + '/images/bozo.jpg' );
//     // console.log( arguments );
//     // resemble( __dirname + '/images/bozo.png' ).onComplete( function( data ) {
//     //     cb( data.brightness );
//     // });
// });

// Prismic config:
var prismicConfig = {
    articles: {
        template: 'articles.ejs',
        tags: true,
        tagTemplate: 'articles-tags.ejs',
        linkResolver: function( ctx, doc, isBroken ) {
            if( isBroken ) {
                return '#broken';
            }

            return '/articles/' + doc.slug;
        },
        htmlSerializer: function( elem, content ) {
            if( elem.type == 'image' ) {
                return '<img class="fluid" src="../../images/blank.png" data-src="' + makeImgixUrl( elem.url ) + '" width="' + elem.dimensions.width + '" height="' + elem.dimensions.height + '" />';
            }
        }
    },
    pages: {
        template: 'pages.ejs',
        tags: false,
        linkResolver: function( ctx, doc, isBroken ) {
            if( isBroken ) {
                return '#broken'
            }

            return '/my-pages/' + doc.slug;
        }
    }
};

/*
** Takes every file in the ./src directory and
** passes it all documents in prismic, then
** processes with ejs, and puts in ./_build
*/
gulp.task( 'src', function( done ) {
    prismic.getAllDocuments( function( docs ) {
        gulp.src( 'src/*' )
            .pipe( ejs({
                makeImgix: makeImgixUrl,
                sluggify: sluggify,
                docs: docs,
                getExcerpt: getExcerpt
            }))
            .pipe( rename({
                extname: '.html'
            }))
            .pipe( gulp.dest( './_build/' ) );

        // Tell gulp that we're finished:
        done();
    });
});

gulp.task( 'collections', function() {
    // Loop through each collection type:
    Object.keys( prismicConfig ).forEach( function( collectionName ) {
        prismic.getDocumentsByType( collectionName, function( res ) {
            var collection          = prismicConfig[collectionName],
                linkResolver        = collection.linkResolver || null,
                htmlSerializer      = collection.htmlSerializer || null;

            if( !res || !res.length ) {
                return;
            }

            // Loop through each document returned
            // for this collection type:
            res.forEach( function( doc ) {

                // Create the collection files:
                gulp.src( templateDir + '/' + collection.template )
                    .pipe( ejs({
                        // overlayImage: overlayImage,
                        sluggify: sluggify,
                        doc: doc,
                        makeImgix: makeImgixUrl,
                        linkResolver: collection.linkResolver || null,
                        htmlSerializer: collection.htmlSerializer || null,
                        getExcerpt: getExcerpt
                    }))
                    .pipe( rename( 'index.html' ) )
                    .pipe( gulp.dest( './_build/' + collection.linkResolver( null, doc, false ) ) );
            });
        });
    });
});

gulp.task( 'tags', function() {
    Object.keys( prismicConfig ).forEach( function( collectionName ) {
        var collection = prismicConfig[collectionName];

        if( collection.tags && collection.tagTemplate ) {
            prismic.getTaggedDocuments( collectionName, function( tags ) {
                // Now we've got an object containing tagname: [ documents ]
                Object.keys( tags ).forEach( function( tag ) {
                    gulp.src( templateDir + '/' + collection.tagTemplate )
                        .pipe( ejs({
                            sluggify: sluggify,
                            tag: tag,
                            makeImgix: makeImgixUrl,
                            docs: tags[tag],
                            getExcerpt: getExcerpt
                        }))
                        .pipe( rename( 'index.html' ) )
                        .pipe( gulp.dest( './_build/' + collectionName + '/tagged/' + sluggify( tag ) + '/' ) );
                });
            });
        }
    });
});

gulp.task( 'scripts', function() {
    return browserify( './scripts/main.js' )
        .bundle()
        .on( 'error', function( e ) {
            console.log( 'error: ', e );
        })
        .pipe( source( 'bundle.js'  ) )
        .pipe( gulp.dest( './_build/scripts' ) );
});

gulp.task( 'css', function() {
    return gulp.src( './css/scss/main.scss' )
        .pipe( scss() )
        .pipe(prefix(['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true }))
        .pipe(cssMin())
        .pipe(rename('style.css'))
        .pipe(gulp.dest('./_build/'))
        .pipe( browserSync.stream() );
});

gulp.task( 'img', function() {
    return gulp.src( './images/*' )
        .pipe( gulp.dest( './_build/images/' ) );
});

gulp.task( 'clean', function() {
    del( './_build' );
});

gulp.task( 'default', ['clean', 'collections', 'tags', 'src', 'scripts', 'css', 'img'] );

gulp.task( 'serve', ['css', 'collections', 'tags', 'src', 'scripts', 'img'], function() {
  browserSync.init({
    server: { baseDir: './_build' },
    open: false,
    notify: false
  });

  gulp.watch( "./css/scss/**/*", ['css'] );
  gulp.watch( "./templates/**/*", ['collections', 'tags'] );
  gulp.watch( "./src/**/*", ['src'] );
  gulp.watch( "./scripts/**/*", ['scripts'] );
  gulp.watch( "./images/**/*", ['img'] );

  gulp.watch( "./_build/**/*!(*.css)" ).on( 'change', browserSync.reload );
});
