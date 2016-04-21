import BrowserWindow from './BrowserWindow';
import Emitter from './Emitter';

/**
 * @Class ScrollMonitor - Watches the document for scroll events.
 * @param options.el { DOM node } - The element to watch.
 * @param callBack { function } - Fired when the element is in the viewport. Passed a number between 0 & 1 representing the progress of the scroll range.
 */
class ScrollMonitorItem extends Emitter {
    constructor( id, el, callBack ) {
        super();
        this._id = id;
        this._el = el;
        this._callBack = callBack;
        this._windowHeight = BrowserWindow.height;
        requestAnimationFrame( this._getDimensions.bind( this ) );
        this.on( 'update', this._update.bind( this ) );
    }

    /**
     * Gets initial element measurements. Fires inside an animation frame.
     */
    _getDimensions() {
        const dimensions = this._el.getBoundingClientRect();
        this._topBound = dimensions.top - this._windowHeight;
        this._bottomBound = dimensions.bottom;
        this.trigger( 'ready' );
    }

    /**
     * Fires when this._el is in view.
     * @param { number } progress - A number between 1 and 0 representing the progress of the animation.
     */
    _update( progress ) {
        this._callBack( progress );
    }

    /**
     * Destroys the instance of ScrollMonitorItem.
     */
    destroy() {
        this._id = null;
        this._el = null;
        this._callBack = null;
        this._topBound = null;
        this._bottomBound = null;
    }
};

export default ScrollMonitorItem;
