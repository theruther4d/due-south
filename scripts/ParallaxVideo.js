class ParallaxVideo {
    constructor( canvas, url, scrollMonitor ) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext( '2d' );
        this._node = document.createElement( 'video' );
        this._src = url;
        this._scrollMonitor = scrollMonitor;
        this._hasInitted = false;

        this._addVideoListeners( this._node );
        this._node.setAttribute( 'src', this._src );
        // console.log( 'created parallaxVideo' );
        // console.log( this );
    }

    _addVideoListeners( video ) {
        // console.log( 'addVideoListners called' );
        this._node.addEventListener( 'canplay', () => {
            if( this._hasInitted ) {
                return;
            }

            this._hasInitted = true;
            // document.querySelector( 'ul.articles' ).insertBefore( this._node, this._canvas );
            // console.log( 'canplay' );
            // this._ctx.globalCompositeOperation = 'lighter';
            //
            // const largestSide = Math.max( this.width, this.height );
            // const gradient = this._ctx.createRadialGradient( this.width / 2, this.height / 2, largestSide, largestSide, largestSide, 0 );
            // gradient.addColorStop( 0, '#2bff93' );
            // gradient.addColorStop( 1, '#bef4d9' );
            // this._ctx.fillStyle = gradient;

            // console.log( 'parallaxVideo adding item' );
            console.log( 'will add item' );
            this._scrollMonitor.addItem( this._canvas, 0, this.duration * 1000, ( progress ) => {
                console.log( 'adding item!' );
                // @TODO: SOMETHING IN HERE IS CAUSING THE ISSUE
                let position = progress / 1000;
                position = position > this.duration * 1000 ? this.duration * 1000 : position;
                position = position < 0 ? 0 : position;

                if( this._node.currentTime === position ) {
                    return;
                }
                // console.log( 'position: ', position );
                // this._node.currentTime = progress / 1000;
                this._node.currentTime = position;
                this._ctx.drawImage( this._node, 0, 0, this.width, this.height );
                // this._ctx.fillRect( 0, 0, this.width, this.height );
            });
        });

        this._node.addEventListener( 'loadedmetadata', () => {
            // console.log( 'metadata loaded' );
            this.width = this._node.videoWidth;
            this.height = this._node.videoHeight;
            this._canvas.width = this.width;
            this._canvas.height = this.height;
            this.duration = this._node.duration
        });
    }

    destroy() {
        this._canvas = null;
        this._ctx = null;
        this._node = null;
        this._src = null;
        this.width = null;
        this.height = null;
        this.progress = null;
        this._scrollMonitor = null;
        this._hasInitted = null;
    }
};

export default ParallaxVideo;
