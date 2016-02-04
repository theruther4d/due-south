var Prismic     = require('prismic.io').Prismic;

module.exports = {
    /*
    ** Where we'll store tags as we encounter them:
    */
    everything: {
        collections: {},
        tags: {}
    },

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
                    res     = res.results;

                    // Sort the documents:
                    res.forEach( function( doc ) {

                        // By Tag:
                        if( doc.tags.length ) {
                            doc.tags.forEach( function( tag ) {
                                if( module.exports.everything.tags.hasOwnProperty( tag ) ) {
                                    module.exports.everything.tags[tag].push( doc );
                                } else {
                                    module.exports.everything.tags[tag] = [ doc ];
                                }
                            });
                        }

                        // By Type:
                        if( module.exports.everything.collections.hasOwnProperty( doc.type ) ) {
                            module.exports.everything.collections[doc.type].push( doc );
                        } else {
                            module.exports.everything.collections[doc.type] = [ doc ];
                        }

                    });

                    console.log( module.exports.everything );
                    callback( module.exports.everything );
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
};
