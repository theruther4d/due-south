import BrowserWindow from './BrowserWindow';

/**
 * @Class ScrollMonitor - Watches the document for scroll events.
 * @param el { DOM node } - The element to watch.
 * @param scrollMonitor { function } - An instance of ScrollMonitor.
 * @param callBack { function } - Fired when the element is in the viewport. Passed a number between 0 & 1 representing the progress of the scroll range.
 */
class ScrollMonitorItem {
    constructor( el, scrollMonitor, callBack ) {
        this._el = el;
        this._scrollMonitor = scrollMonitor;
        this._callBack = callBack;
        this._windowHeight = BrowserWindow.height;
        requestAnimationFrame( this._init.bind( this ) );
        this._scrollMonitor.on( 'update', this._update.bind( this ) );

        // Update on construction in case we're starting page
        // load at a scrolled position.
        this._update( this._scrollMonitor.scrollY );
    }

    /**
     * Gets initial element measurements. Fires inside an animation frame.
     */
    _init() {
        const dimensions = this._el.getBoundingClientRect();
        this._topBound = dimensions.top - this._windowHeight;
        this._bottomBound = dimensions.bottom;
        console.log( `topBound: ${this._topBound}` );
        console.log( `bottomBound: ${this._bottomBound}` );
    }

    /**
     * Determines if a node is in the viewport.
     * @param scrollY { number } - The current document.scrollY.
     * @return inView { boolean }
     */
    _isInView( scrollY ) {
        return ( scrollY + this._windowHeight ) >= this._topBound && scrollY <= this._bottomBound;
    }

    /**
     * Fires when this._scrollMonitor triggers its update event.
     * @param { number } scrollY - The current document.scrollY
     */
    _update( scrollY ) {
        if( this._isInView( scrollY ) ) {
            const progress = this._getProgress( scrollY );
            this._callBack( progress );
        }
    }

    _getProgress( scrollY ) {
        scrollY = scrollY < this._topBound ? this._topBound : scrollY;
        scrollY = scrollY > this._bottomBound ? this._bottomBound : scrollY;
        return ( scrollY - this._topBound ) / ( this._bottomBound - this._topBound );
    }

    /**
     * Destroys the instance of ScrollMonitorItem.
     */
    destroy() {
        this._scrollMonitor.destroy();
        this._scrollMonitor = null;
        this._callBack = null;
        this._initted = null;
        this._topBound = null;
        this._bottomBound = null;
    }
};

export default ScrollMonitorItem;
