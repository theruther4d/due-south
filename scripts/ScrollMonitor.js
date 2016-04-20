import Emitter from './Emitter';

/**
 * @Class ScrollMonitor - Watches the document for scroll events.
 *
 */
class ScrollMonitor extends Emitter {
    constructor() {
        super();
        this._lastScroll = 0;
        this._ticking = false;
        this._bindScroll();
    }

    _bindScroll() {
        window.addEventListener( 'scroll', this._onScroll.bind( this ), false );
    }

    _onScroll() {
        this._lastScroll = window.scrollY;
        this._requestTick();
    }

    _requestTick() {
        if( !this._ticking ) {
            requestAnimationFrame( this._update.bind( this ) );
        }

        this._ticking = true;
    }

    _update() {
        this._ticking = false;
        console.log( `scrolling: ${this._lastScroll}` );
        this.trigger( 'update', this._lastScroll );
    }

    destroy() {
        this._lastScroll = null;
        this._ticking = null;
        window.removeEventListener( 'scroll', this._onScroll.bind( this ), false );
    }
};

export default ScrollMonitor;
