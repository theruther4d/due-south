var imgix = require( './imgix' );

var Main = ( function() {
    return {
        init: function() {
            alert( 'initted!' );
            document.addEventListener( 'DOMContentLoaded', function( e ) {
                alert( 'loaded!' );
                // Do stuff with the images:
                var images = new imgix();
                images._init();
            });
        }
    }
}());

module.exports = Main.init();
