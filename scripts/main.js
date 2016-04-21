import imgix from './imgix';
import attachFastclick from 'fastClick';
import ScrollMonitor from './ScrollMonitor';

var Main = ( function() {
    return {
        init: () => {
            window.scrollMonitor = new ScrollMonitor();
            const nav = document.querySelector( '.nav' );
            const hamburger = document.querySelector( '.nav__utilities__item--hamburger' );
            const parallax = document.querySelector( '#VqqoSyQAAJ0ddSja img.article-block__image' );
            let navOpen = false;
            const articleImages = Array.from( document.querySelectorAll( 'img.article-block__image' ) );

            articleImages.forEach( ( image ) => {
                scrollMonitor.addItem( image, -50, 50, ( progress ) => {
                    image.style.transform = `translate3d( 0, ${progress}px, 0 )`;
                });
            });

            hamburger.addEventListener( 'click', ( e ) => {
                e.preventDefault();
                navOpen = !navOpen;
                const navClass = navOpen ? 'add' : 'remove';
                const eventName = navOpen ? 'addEventListener' : 'removeEventListener';
                nav.classList[navClass]( 'nav--open' );
                window[eventName]( 'scroll', closeNavOnScroll );
            });

            function closeNavOnScroll( e ) {
                e.preventDefault();
                nav.classList.remove( 'nav--open' );
                navOpen = false;
                window.removeEventListener( 'scroll', closeNavOnScroll );
            };

            document.addEventListener( 'DOMContentLoaded', function( e ) {
                attachFastclick( document.body );
                var images = new imgix();
                images._init();
            }, false );
        }
    }
}());

module.exports = Main.init();
