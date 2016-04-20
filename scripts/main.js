import imgix from './imgix';
import attachFastclick from 'fastClick';
import ScrollMonitor from './ScrollMonitor';

var Main = ( function() {
    return {
        init: function() {
            window.scrollMonitor = new ScrollMonitor();
            var nav = document.querySelector( '.nav' );
            var hamburger = document.querySelector( '.nav__utilities__item--hamburger' );
            // var navScreen = document.querySelector( '.nav-screen' );
            var navOpen = false;

            hamburger.addEventListener( 'click', function( e ) {
                e.preventDefault();

                navOpen = !navOpen;

                var navClass = navOpen ? 'add' : 'remove';
                var eventName = navOpen ? 'addEventListener' : 'removeEventListener';
                // console.log( eventName );
                nav.classList[navClass]( 'nav--open' );

                window[eventName]( 'scroll', closeNavOnScroll );
            });

            function closeNavOnScroll( e ) {
                e.preventDefault();

                console.log( 'closeNavOnScroll' );
                nav.classList.remove( 'nav--open' );
                navOpen = false;

                window.removeEventListener( 'scroll', closeNavOnScroll );
            };

            document.addEventListener( 'DOMContentLoaded', function( e ) {
                // Attach FastClick:
                attachFastclick( document.body );

                // Do stuff with the images:
                var images = new imgix();
                images._init();
            }, false );
        }
    }
}());

module.exports = Main.init();
