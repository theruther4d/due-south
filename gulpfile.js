// Get all our gulp needs:
var gulp        = require( 'gulp' );
var include     = require( 'gulp-file-include' );
var rename      = require( 'gulp-rename' );
var ejs         = require( 'gulp-ejs' );
var del         = require( 'del' );
var prismic     = require( './prismic' );
var each        = require('async').each;

// Prismic config:
var prismicConfig = {
    articles: {
        template: 'articles.ejs',
        tags: true,
        linkResolver: function( ctx, doc, isBroken ) {
            if( isBroken ) {
                return '#broken';
            }

            return '/articles/' + doc.slug + '/index.html';
        },
        htmlSerializer: function( elem, content ) {
            console.log( elem.type );
            if (elem.type == "paragraph") {
                return '<p class="test-p-class">' + content + '</p>';
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

            return '/my-pages/' + doc.slug + '/index.html';
        }
    }
};

// Path Variables:
var templateDir = './templates';
var partialDir = './partials';

// Setup includes:
var includeSettings = {
    prefix: '@',
    basepath: partialDir
};

gulp.task( 'default', ['clean'], function() {
    // Loop through each collection type:
    Object.keys( prismicConfig ).forEach( function( collectionName ) {
        console.log( 'Request for ', collectionName );
        prismic.getDocumentsByType( collectionName, function( res ) {
            var collection          = prismicConfig[collectionName],
                linkResolver        = collection.linkResolver || null,
                htmlSerializer      = collection.htmlSerializer || null;

            // Loop through each document returned
            // for this collection type:
            res.forEach( function( doc ) {

                // Create the collection files:
                gulp.src( templateDir + '/' + collection.template )
                    .pipe( include( includeSettings ) )
                    .pipe( ejs({
                        prismic: prismic.formatDoc( doc, linkResolver, htmlSerializer )
                    }))
                    .pipe( rename( 'index.html' ) )
                    .pipe( gulp.dest( './_build/' + collection.linkResolver( null, doc, false ) ) );
            });
        });
    });
});

gulp.task( 'clean', function() {
    del( './_build' );
});
