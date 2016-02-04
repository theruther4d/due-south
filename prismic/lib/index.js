var Prismic     = require('prismic.io').Prismic;

module.exports = {

    /*
    ** Gets all documents of a specified type:
    **
    ** @param {string}      type        : the type of documents to retreive
    ** @param {function}    callback    :  function to execute on completion
    */
    getDocumentsByType: function( type, callback ) {
        Prismic.Api( 'https://due-south.prismic.io/api', function( err, api ) {

            var promise = new Promise( function( resolve, reject ) {
                // Generate Collections:
                api.form( 'everything' )
                    .ref( api.master() )
                    .query( Prismic.Predicates.at( 'document.type', type ) )
                    .submit( function( err, res ) {
                        resolve( callback( res.results ) );
                    });
            });

            }, null );
    }

    // TODO:
    // ~~~~~~
    // - generate tag files
    //
};

// function plugin( config ) {
//     return test = function( ) {
//         return 'this is from prismic!!';
//     };
    // return function( files, metalsmith, done ) {
    //
    //     // Abort if we don't have at least a URL in config:
    //     if( config.url == null ) {
    //         console.log( 'You MUST specify an api url in your config object!' );
    //         return false;
    //     }
    //
    //     // Initialize the API:
    //     Prismic.Api( config.url, function( err, api ) {
    //
    //         // Generate Collections:
    //         if( config.collections ) {
    //             each( Object.keys( config.collections ), function( collection, callback ) {
    //                 var tags = {};
    //
    //                 if( collection.generateTags ) {
    //                     tags[collection] = {};
    //                 };
    //
    //                 api.form( 'everything' )
    //                     .ref( api.master() )
    //                     .query( Prismic.Predicates.at( 'document.type', collection ) )
    //                     .submit( function( err, res ) {
    //                         generateFiles( collection, res, tags, callback );
    //                     });
    //             }, function( err ) {
    //                 if( err ) {
    //                     console.log( err );
    //                 }
    //
    //                 done();
    //             });
    //         }
    //
    //     }, config.accessToken );
    //
    //     // Does the actual file generation:
    //     function generateFiles( collectionName, res, tags, callback ) {
    //         res.results.forEach( function( doc, idx ) {
    //             var permalink = config.collections[collectionName].linkResolver ? config.collections[collectionName].linkResolver( doc, doc ) : './' + doc.type + '/' + doc.slug + '/index.md';
    //
    //             generateTagFiles( doc, tags, collectionName );
    //
    //             files[permalink]    = {
    //                 prismic:    doc,
    //                 title:      doc.id,
    //                 layout:     config.collections[collectionName].template,
    //                 contents:   new Buffer( '' )
    //             };
    //
    //             files[permalink].prismic.data = formatPrismicData( files[permalink].prismic.data );
    //         });
    //
    //         callback();
    //     };
    //
    //     function generateTagFiles( doc, tags, collectionName ) {
    //         doc.tags.forEach( function( tag ) {
    //             // doc.data = formatPrismicData( doc.prismic.data );
    //             tags[tag] = tags[tag] || [];
    //             tags[tag].push( doc );
    //
    //             // console.log( doc );
    //             // formattedDoc = formatPrismicData( files[permalink].prismic.data );
    //         });
    //
    //         console.log( tags );
    //
    //         Object.keys( tags ).forEach( function( tagName ) {
    //             var tagPermalink = './' + collectionName + '/tagged/' +  encodeURIComponent( tagName ) + '/index.md';
    //
    //             files[tagPermalink] = {
    //                 tagged:     tags[tagName],
    //                 contents:   new Buffer( '' ),
    //                 layout:     config.collections[collectionName].tagTemplate || 'home.hbs'
    //             };
    //
    //
    //         });
    //     };
    //
    //     // Makes prismic's response data easier to use:
    //     function formatPrismicData( data ) {
    //         var formattedData = {};
    //
    //         // Remove prefix from first-level properties:
    //         // articles.id  => id
    //         Object.keys( data ).forEach( function( ctx, idx ) {
    //             formattedData[ctx.substr( ctx.lastIndexOf( '.' ) + 1 )] = data[ctx];
    //         });
    //
    //         // Remove prefix from formattedData.data:
    //         // data: { articles.title: {} } => data: { title: {} }
    //         // formattedData.data = formattedData[formattedData.data.substr( formattedData.data.lastIndexOf( '.' ) + 1 )]
    //
    //         // console.log( 'formatted data ------------' );
    //         // console.log( formattedData );
    //         return formattedData;
    //     }
    // }
// }
