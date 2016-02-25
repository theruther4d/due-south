// Get all our gulp needs:
var gulp        = require( 'gulp' );
var rename      = require( 'gulp-rename' );
var ejs         = require( 'gulp-ejs' );
var del         = require( 'del' );
var prismic     = require( './prismic' );
var ImgixClient = require( 'imgix-core-js' );
var browserSync = require( 'browser-sync' ).create();
var scss        = require( 'gulp-sass' );
var prefix      = require( 'gulp-autoprefixer' );
var cssMin      = require( 'gulp-minify-css' );
var source      = require( 'vinyl-source-stream' );
var browserify  = require( 'browserify' );
var cheerio     = require( 'cheerio' );
// var resemble = require( 'node-resemble-js' );
// var http = require( 'http' );
// var request = require( 'request' );
// var fs = require( 'fs' );

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

function overlayImage( file, cb ) {
    // request.get( file, function( err, res, body ) {
    //     if( !err && res.statusCode == 200 ) {
    //         var fileStream = new Buffer( body )/*.toString( 'base64' )*/;
    //         // var fileStream = new Buffer( body );
    //         // console.log( fileStream );
    //         var api = resemble( fileStream ).onComplete( function( data ) {
    //             cb( data.brightness );
    //         })
    //     }
    // });

    // var fileStream = request( file );
    // console.log( fileStream );

    // var fileStream = request( file ).pipe( fs.createReadStream( 'bozo.jpg' ) );
    // var api = resemble( fileStream ).onComplete( function( data ) {
    //     cb( data.brightness );
    // });


    // var fileData = new Buffer( file, 'base64' );
    var api = resemble( file ).onComplete( function( data ) {
    	cb( data.brightness );
    });
};

// overlayImage( 'file:///Users/joshrutherford/due-south/images/jess.png', function( brightness ) {
//     console.log( 'brightness: ', brightness );
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
    // overlayImage( __dirname + '/images/jess.png', function( brightness ) {
    //     console.log( brightness );
    // });
    // console.log( __dirname + '/images/jess.png' );
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
                        overlayImage: overlayImage,
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
