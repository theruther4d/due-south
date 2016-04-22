import imgix from './imgix';
import attachFastclick from 'fastClick';
import ScrollMonitor from './ScrollMonitor';
import ParallaxVideo from './ParallaxVideo';

var Main = ( function() {
    return {
        init: function() {
            window.scrollMonitor = new ScrollMonitor();

            // this.video();
            // this.navSetup();
            // this.images();
            this.testVideos();
        },

        testVideos: function() {
            const canvases = Array.from( document.querySelectorAll( '.testVideoCanvas' ) );
            // const vidSrc = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/25381/2887672.mp4';
            //
            canvases.forEach( ( canvas, idx ) => {
                scrollMonitor.addItem( canvas, 0, 1000, ( progress ) => {
                    canvas.style.backgroundColor = `rgba( 255, 0, 0, ${progress / 1000})`;
                });
                // window[`testCanvas${idx + 1}`] = new ParallaxVideo( canvas, vidSrc, scrollMonitor );
            });
        },

        video: function() {
            console.log( 'creating ParallaxVideo' );
            window.splat = new ParallaxVideo( document.getElementById( 'videoCanvas' ), 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/25381/2887672.mp4', scrollMonitor );
        },

        navSetup: function() {
            const nav = document.querySelector( '.nav' );
            const hamburger = document.querySelector( '.nav__utilities__item--hamburger' );
            let navOpen = false;

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
        },

        images: function() {
            document.addEventListener( 'DOMContentLoaded', function( e ) {
                attachFastclick( document.body );
                var images = new imgix();
                images._init();
            }, false );
        }
    }
}());

module.exports = Main.init();
