import babel from 'babelify';
import gulp from 'gulp';
import buffer from 'vinyl-buffer';
import rename from 'gulp-rename';
import ejs from 'gulp-ejs';
import del from 'del';
import prismicStatic from 'prismic-static';
import ImgixClient from 'imgix-core-js';
// import browserSync from 'browser-sync';
import scss from 'gulp-sass';
import prefix from 'gulp-autoprefixer';
import cssMin from 'gulp-minify-css';
import source from 'vinyl-source-stream';
import watchify from 'watchify';
import browserify from 'browserify';
import cheerio from 'cheerio';
import resemble from 'node-resemble-js';
import path from 'path';
import https from 'https';
import fs from 'fs';
import gm from 'gm';

const prismic = new prismicStatic( 'https://due-south.cdn.prismic.io/api' );
// browserSync.create();

// Path Variables:
const templateDir = './templates';

function makeImgixUrl( path ) {
    const fileName = path.substr( path.lastIndexOf( '/' ) + 1, path.length - 1 );

    return `https://duesouth.imgix.net/${fileName}`;
};

function sluggify( string ) {
    return string
            .toLowerCase()
            .replace( /[^\w ]+/g, '' )
            .replace( / +/g, '-' );
};

function getExcerpt( doc ) {
    let firstTextSlice = -1;
    const slices = doc.getSliceZone( 'articles.body' ).slices;

    slices.forEach( ( slice, idx ) => {
        if( slice.sliceType == 'text' && firstTextSlice == -1 ) {
            firstTextSlice = idx;
        }
    });

    if( firstTextSlice != -1 ) {
        const text = slices[firstTextSlice].value.asHtml();

        const $ = cheerio.load( text );
        return $( 'p' ).eq( 0 ).text().substr( 0, 300 ) + '..';

    } else {
        return '';
    }
};

// Prismic config:
const prismicConfig = {
    articles: {
        template: 'articles.ejs',
        tags: true,
        tagTemplate: 'articles-tags.ejs',
        linkResolver: ( ctx, doc, isBroken ) => {
            if( isBroken ) {
                return '#broken';
            }

            return `/articles/${doc.slug}`;
        },
        htmlSerializer: ( elem, content ) => {
            if( elem.type == 'image' ) {
                return `<img class="fluid" src="../../images/blank.png" data-src="${makeImgixUrl( elem.url )}" width="${elem.dimensions.width}" height="${elem.dimensions.height}" />`;
            }
        }
    },
    pages: {
        template: 'pages.ejs',
        tags: false,
        linkResolver: ( ctx, doc, isBroken ) => {
            if( isBroken ) {
                return '#broken'
            }

            return `/my-pages/${doc.slug}`;
        }
    }
};

/*
** Takes every file in the ./src directory and
** passes it all documents in prismic, then
** processes with ejs, and puts in ./_build
*/
gulp.task( 'src', ( done ) => {
    prismic.getAllDocuments( ( docs ) => {
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

gulp.task( 'collections', () => {
    // Loop through each collection type:
    Object.keys( prismicConfig ).forEach( ( collectionName ) => {
        prismic.getDocumentsByType( collectionName, ( res ) => {
            const collection = prismicConfig[collectionName];
            const linkResolver = collection.linkResolver || null;
            const htmlSerializer = collection.htmlSerializer || null;

            if( !res || !res.length ) {
                return;
            }

            // Loop through each document returned
            // for this collection type:
            res.forEach( ( doc ) => {

                // Create the collection files:
                gulp.src( `${templateDir}/${collection.template}` )
                    .pipe( ejs({
                        sluggify: sluggify,
                        doc: doc,
                        makeImgix: makeImgixUrl,
                        linkResolver: collection.linkResolver || null,
                        htmlSerializer: collection.htmlSerializer || null,
                        getExcerpt: getExcerpt
                    }))
                    .pipe( rename( 'index.html' ) )
                    .pipe( gulp.dest( `./_build/${collection.linkResolver( null, doc, false )}` ) );
            });
        });
    });
});

gulp.task( 'tags', () => {
    Object.keys( prismicConfig ).forEach( ( collectionName ) => {
        const collection = prismicConfig[collectionName];

        if( collection.tags && collection.tagTemplate ) {
            prismic.getTaggedDocuments( collectionName, ( tags ) => {
                // Now we've got an object containing tagname: [ documents ]
                Object.keys( tags ).forEach( ( tag ) => {
                    gulp.src( `${templateDir}/${collection.tagTemplate}` )
                        .pipe( ejs({
                            sluggify: sluggify,
                            tag: tag,
                            makeImgix: makeImgixUrl,
                            docs: tags[tag],
                            getExcerpt: getExcerpt
                        }))
                        .pipe( rename( 'index.html' ) )
                        .pipe( gulp.dest( `./_build/${collectionName}/tagged/${sluggify( tag )}/` ) );
                });
            });
        }
    });
});

// gulp.task( 'scripts', () => {
//     return browserify( './scripts/main.js' )
//         .bundle()
//         .on( 'error', ( e ) => {
//             console.log( 'error: ', e );
//         })
//         .pipe( source( 'bundle.js'  ) )
//         .pipe( gulp.dest( './_build/scripts' ) );
// });

const compile = ( watch ) => {
    const bundler = watchify(
        browserify(
            './scripts/main.js',
            {
                debug: true,
                presets: ['es2015'],
                plugins: ['babel-plugin-transform-es2015-spread', 'babel-plugin-transform-object-rest-spread']
            }
        ).transform( babel ) );

    const rebundle = () => {
        bundler.bundle()
            .on( 'error', ( err ) => {
                console.log( `error: ${err }` );
            })
            .pipe( source( 'bundle.js' ) )
            .pipe( buffer() )
            // .pipe( ugly() )
            .pipe( gulp.dest( './_build/scripts' ) );
    }

    if( watch ) {
        bundler.on( 'update', () => {
            console.log( 'bundling' );
            rebundle();
        });
    }

    rebundle();
};

const watch = () => {
    return compile( true );
}

gulp.task( 'scripts', () => {
    return compile();
});

gulp.task( 'css', () => {
    return gulp.src( './css/scss/main.scss' )
        .pipe( scss() )
        .pipe( prefix( ['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true } ) )
        .pipe( cssMin() )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( './_build/' ) );
        // .pipe( browserSync.stream() );
});

gulp.task( 'img', () => {
    return gulp.src( './images/*' )
        .pipe( gulp.dest( './_build/images/' ) );
});

gulp.task( 'workers', () => {
    return gulp.src( './workers/*.js' )
        .pipe( gulp.dest( './_build/workers' ) );
});

gulp.task( 'clean', () => {
    del( './_build' );
});

gulp.task( 'default', ['clean', 'collections', 'tags', 'src', 'scripts', 'css', 'img', 'workers'] );

gulp.task( 'serve', ['css', 'collections', 'tags', 'src', 'scripts', 'img', 'workers'], () => {
  // browserSync.init({
  //   server: { baseDir: './_build' },
  //   open: false,
  //   notify: false
  // });

  gulp.watch( "./css/scss/**/*", ['css'] );
  gulp.watch( "./templates/**/*", ['collections', 'tags'] );
  gulp.watch( "./src/**/*", ['src'] );
  gulp.watch( "./scripts/**/*", ['scripts'] );
  gulp.watch( "./images/**/*", ['img'] );
  gulp.watch( "./workers/**.js", ['workers'] );

  // gulp.watch( "./_build/**/*!(*.css)" ).on( 'change', browserSync.reload );
});
