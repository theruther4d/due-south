var imgix = require( './imgix' );

var Main = ( function() {
    return {
        init: function() {
            document.addEventListener( 'DOMContentLoaded', function( e ) {
                // Do stuff with the images:
                var images = new imgix();
                images._init();
            });
        }
    }
}());

module.exports = Main.init();
