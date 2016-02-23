var imgix = require( './imgix' );
var FastClick = require( './fastClick' );

var Main = ( function() {
    return {
        init: function() {
            var nav = document.querySelector( '.nav' );
            var hamburger = document.querySelector( '.nav__utilities__item--hamburger' );

            hamburger.addEventListener( 'click', function( e ) {
                e.preventDefault();

                nav.classList.toggle( 'nav--open' );
            });

            document.addEventListener( 'DOMContentLoaded', function( e ) {
                // Attach FastClick:
                FastClick.attach( document.body );

                // Do stuff with the images:
                var images = new imgix();
                images._init();
            }, false );
        }
    }
}());

module.exports = Main.init();
