/**
 * @Class
 * Emitter - Dispatches and stores events.
 */
class Emitter {
    constructor() {
        this._events = {};
    }

    _hasEvent( eventName ) {
        return this._events.hasOwnProperty( eventName );
    }

    on( eventName, callBack ) {
        this._events = {
            ...this._events,
            [eventName]: [
                ...this._events[eventName] || [],
                callBack
            ]
        }
    }

    off( eventName, callBack ) {
        if( !this._hasEvent( eventName ) ) {
            return;
        }

        const idx = this._events[eventName].indexOf( callBack );

        if( idx === -1 ) {
            return;
        }

        this._events[eventName].splice( idx, 1 );
    }

    trigger( eventName, args = null ) {
        if( !this._hasEvent( eventName ) ) {
            return;
        }
        
        this._events[eventName].forEach( ( callBack ) => {
            callBack( args )
        });
    }

    destroy() {
        Object.keys( this._events ).forEach( ( eventName ) => {
            this._events[eventName] = null;
        });

        this._events = null;
    }
};

export default Emitter;
