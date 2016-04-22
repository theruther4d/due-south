import Emitter from './Emitter';
import ScrollMonitorItem from './ScrollMonitorItem';
import BrowserWindow from './BrowserWindow';

/**
 * @Class ScrollMonitor - Watches the document for scroll events.
 */
class ScrollMonitor extends Emitter {
    constructor() {
        super();
        this._lastScroll = 0;
        this._ticking = false;
        this._bindScroll();
        this._createWorker()
        this._items = {};
        this._update( window.scrollY );
    }

    /**
     * Monitors a DOM node's position relative to the viewport.
     * @param { DOM node } el - The element to watch.
     * @param { number } min - The lowest possible callback value (when the item has just entered the viewport).
     * @param { number } max - The highest possible callback value (when the item is just about to leave the viewport).
     * @param { function } callBack - Executed when the scroll position has changed, while the item is still in the viewport.
     */
    addItem( el, min = 0, max = 1, callBack ) {
        const itemId = performance.now();
        this._items[itemId] = new ScrollMonitorItem( itemId, el, callBack );
        // console.log( 'add item called' );

        if( this.workerSupported ) {
            this._items[itemId].on( 'ready', () => {
                this.worker.postMessage({
                    type: 'addItem',
                    item: {
                        id: itemId,
                        topBound: this._items[itemId]._topBound,
                        bottomBound: this._items[itemId]._bottomBound,
                        min: min,
                        max: max
                    }
                });
            });
        }
    }

    /**
     * Returns the current scroll position.
     */
    get scrollY() {
        return this._lastScroll;
    }

    /**
     * Creates a worker to handle scroll monitoring (if possible).
     */
    _createWorker() {
        if( !window.Worker ) {
            this.workerSupported = false;
            return;
        }

        this.workerSupported = true;
        this.worker = new Worker( `${document.location.origin}/workers/scrollWorker.js` );
        this.worker.postMessage({
            type: 'windowHeight',
            windowHeight: BrowserWindow.height
        });
    }

    /**
     * Binds the scroll handler.
     */
    _bindScroll() {
        window.addEventListener( 'scroll', this._onScroll.bind( this ), false );
    }

    /**
     * Executed inside the scroll handler.
     */
    _onScroll() {
        this._lastScroll = window.scrollY;
        this.worker.postMessage({
            type: 'update',
            scrollY: this._lastScroll
        });
        this._requestTick();
    }

    /**
     * Checks if an animationFrame is in progress. If not, asks for a new one.
     */
    _requestTick() {
        if( !this._ticking ) {
            requestAnimationFrame( this._update.bind( this ) );
        }

        this._ticking = true;
    }

    /**
     * The actual work that gets done. Fires when scrolling and during an animation frame.
     */
    _update() {
        // console.log( 'updated' );
        this._ticking = false;

        this.worker.onmessage = ( e ) => {
            if( !this._items.hasOwnProperty( e.data.id ) ) {
                return;
            }

            this._items[e.data.id].trigger( 'update', e.data.progress );
        }

        this.trigger( 'update', this._lastScroll );
    }

    /**
     * Destroys the instance of ScrollMonitor.
     */
    destroy() {
        this._lastScroll = null;
        this._ticking = null;
        this._items = null;
        this.workerSupported = null;
        window.removeEventListener( 'scroll', this._onScroll.bind( this ), false );
    }
};

export default ScrollMonitor;
