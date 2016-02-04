// Get all our gulp needs:
var gulp        = require( 'gulp' );
var rename      = require( 'gulp-rename' );
var ejs         = require( 'gulp-ejs' );
var del         = require( 'del' );
var prismic     = require( './prismic' );
var ImgixClient = require( 'imgix-core-js' );
var browserSync = require( 'browser-sync' ).create();

// Path Variables:
var templateDir = './templates';

function makeImgixUrl( path ) {
    var fileName = path.substr( path.lastIndexOf( '/' ) + 1, path.length - 1 );

    return `https://duesouth.imgix.net/${fileName}`;
};

// Prismic config:
var prismicConfig = {
    articles: {
        template: 'articles.ejs',
        tags: true,
        linkResolver: function( ctx, doc, isBroken ) {
            if( isBroken ) {
                return '#broken';
            }

            return `/articles/${doc.slug}`;
        },
        htmlSerializer: function( elem, content ) {
            if( elem.type == 'image' ) {
                return `<img class="fluid" src="${makeImgixUrl( elem.url )}" />`;
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

            return `/my-pages/${doc.slug}`;
        }
    }
};

gulp.task( 'collections', function() {
    // Loop through each collection type:
    Object.keys( prismicConfig ).forEach( function( collectionName ) {
        prismic.getDocumentsByType( collectionName, function( res ) {
            var collection          = prismicConfig[collectionName],
                linkResolver        = collection.linkResolver || null,
                htmlSerializer      = collection.htmlSerializer || null;

            // Loop through each document returned
            // for this collection type:
            res.forEach( function( doc ) {

                // Create the collection files:
                gulp.src( `${templateDir}/${collection.template}` )
                    .pipe( ejs({
                        doc: doc,
                        makeImgix: makeImgixUrl,
                        linkResolver: collection.linkResolver || null,
                        htmlSerializer: collection.htmlSerializer || null
                    }))
                    .pipe( rename( 'index.html' ) )
                    .pipe( gulp.dest( `./_build/${collection.linkResolver( null, doc, false )}` ) );
            });
        });
    });
});

gulp.task( 'scripts', function() {
    return gulp.src( 'scripts/*' )
        .pipe( gulp.dest( './_build/scripts' ) );
});

gulp.task( 'clean', function() {
    del( './_build' );
});

gulp.task( 'default', ['clean', 'collections', 'scripts'] );

gulp.task( 'serve', function() {
    browserSync.init({
        server: {
            baseDir: '_build',
            directory: true
        }
    });
});
