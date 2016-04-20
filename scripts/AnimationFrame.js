import Emitter from './Emitter';

class AnimationFrame extends Emitter {
    constructor() {
        super();
        this._lastFrame = false;
        this.ticking = false;
    }

    start() {
        this._run();
    }

    stop() {
        this.ticking = false;
        if( this._lastFrame ) {
            cancelAnimationFrame( this._lastFrame );
        }
    }

    _run() {
        console.log( 'drawing' );
        this.ticking = true;

        this.trigger( 'update' );
        this.trigger( 'draw' );

        this.ticking = false;

        this._lastFrame = requestAnimationFrame( this._run.bind( this ) );
    }

    destroy() {
        this._lastFrameId = null;
        this.ticking = false;
    }
};

export default AnimationFrame;
