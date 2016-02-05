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
                    // Where we'll store our results:
                    var everything = {
                        collections: {},
                        tags: {}
                    };

                    // Get rid of extranneous stuff:
                    res = res.results;

                    // Sort the documents:
                    res.forEach( function( doc ) {

                        // By Tag:
                        if( doc.tags.length ) {
                            doc.tags.forEach( function( tag ) {

                                // If tags.articles exists
                                if( everything.tags.hasOwnProperty( doc.type ) ) {

                                    // If tags.articles.paint exists
                                    if( everything.tags[doc.type].hasOwnProperty( tag ) ) {

                                        // Put the current doc into tags.articles.paint
                                        everything.tags[doc.type][tag].push( doc );
                                    }

                                    // If tags.articles.paint doesn't exist:
                                    else {

                                        // Create tags.articles.paint:
                                        everything.tags[doc.type][tag] = {};

                                        // Put the current doc into tags.articles.paint:
                                        everything.tags[doc.type][tag] = [ doc ];
                                    }
                                }

                                // If tags.articles doesn't exist:
                                else {

                                    // Create tags.articles:
                                    everything.tags[doc.type] = {};

                                    // Put the current doc into tags.articles.paint:
                                    everything.tags[doc.type][tag] = [ doc ];
                                }
                            });
                        }

                        // By Type:
                        if( everything.collections.hasOwnProperty( doc.type ) ) {
                            everything.collections[doc.type].push( doc );
                        } else {
                            everything.collections[doc.type] = [ doc ];
                        }

                    });

                    callback( everything );
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
        module.exports.getAllDocuments( function( res ) {
            callback( res.collections[type] );
        });
    },

    /*
    ** Gets all documents ordered by tag
    **
    ** @param   {string}        type        :  the type of document to get tags for
    ** @param   {function}      callback    :  function to execute on completion
    ** @return  {object}        return      :  { tagname: [ doc, doc, doc ], tagname: [ doc, doc, doc ] }
    */
    getTaggedDocuments: function( type, callback ) {
        module.exports.getAllDocuments( function( res ) {
            callback( res.tags[type] );
        });
    }
};
