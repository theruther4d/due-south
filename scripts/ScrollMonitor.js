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
        // this.worker.onmessage = ( e ) => {
            // console.log( 'PREMATURE MESSAGE RECEIVED' );
            // console.log( e.data );
        // };
        this._items = {};
        // this._update( window.scrollY );
        this._addUpdateTimer = false;
    }

    /**
     * Monitors a DOM node's position relative to the viewport.
     * @param { DOM node } el - The element to watch.
     * @param { number } min - The lowest possible callback value (when the item has just entered the viewport).
     * @param { number } max - The highest possible callback value (when the item is just about to leave the viewport).
     * @param { function } callBack - Executed when the scroll position has changed, while the item is still in the viewport.
     */
    addItem( el,  min = 0, max = 1, callBack ) {
        const itemId = performance.now();
        this._items[itemId] = new ScrollMonitorItem( itemId, el, scrollY, callBack );

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

                if( this._addUpdateTimer ) {
                    clearTimeout( this._addUpdateTimer );
                }

                this._addUpdateTimer = setTimeout( () => {
                    this._onScroll();
                    // this._update();
                }, 0 );
            });
        }
    }

    /**
     * Returns the current scroll position.
     */
    // get scrollY() {
    //     return this._lastScroll;
    // }

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

        this.worker.onmessage = ( e ) => {
            const message = e.data;
            const type = message.type;

            if( type === 'itemEnter' ) {
                console.log( 'item ENTERING' );
            } else if( type === 'itemCenter' ) {
                console.log( 'item CENTERED' );
            } else if( type === 'itemExit' ) {
                console.log( 'item EXITING' );
            } else if( type === 'itemInView' ) {
                this._items[message.id].trigger( 'update', message.progress );
            }

        }

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
    _onScroll( e ) {
        this._lastScroll = window.scrollY;
        this._requestTick();
    }

    /**
     * Checks if an animationFrame is in progress. If not, asks for a new one.
     */
    _requestTick() {
        if( !this._ticking ) {
            // console.log( '- - - - - RAF - - - - -' );
            requestAnimationFrame( this._update.bind( this ) );
            // console.log( '/- - - - - RAF - - - - -/' );
        }

        this._ticking = true;
    }

    /**
     * The actual work that gets done. Fires when scrolling and during an animation frame.
     */
    _update() {
        // this._lastScroll = window.scrollY;
        // console.log( '- - - - - RAF - - - - -' );
        // console.log( 'updated' );
        this._ticking = false;

        this.worker.postMessage({
            type: 'update',
            scrollY: this._lastScroll
        });

        // console.log( 'updating' );

        this.trigger( 'update', this._lastScroll );
        // console.log( `triggering update with ${this._lastScroll}` );
        // console.log( '- - - - - /RAF - - - - -' );
    }

    /**
     * Destroys the instance of ScrollMonitor.
     */
    destroy() {
        this._lastScroll = null;
        this._ticking = null;
        this._items = null;
        this.workerSupported = null;
        this._addUpdateTimer = null;
        window.removeEventListener( 'scroll', this._onScroll.bind( this ), false );
    }
};

export default ScrollMonitor;
