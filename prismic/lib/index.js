var Prismic     = require('prismic.io').Prismic;

module.exports = {

    /*
    ** Gets all documents:
    **
    ** @param {function}    callback    :  function to execute on completion
    */
    getAllDocuments: function( callback ) {
        Prismic.Api( 'https://due-south.prismic.io/api', function( err, api ) {

            // Generate Collections:
            api.form( 'everything' )
                .ref( api.master() )
                .submit( function( err, res ) {
                    // Get rid of extranneous stuff:
                    var sorted  = {};
                        res     = res.results;

                    res.forEach( function( doc ) {
                        if( sorted[doc.type] ) {
                            sorted[doc.type].push( doc );
                        } else {
                            sorted[doc.type] = [ doc ];
                        }
                    });

                    console.log( sorted );
                    callback( sorted );
                });

        }, null );
    },

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
