function imgix() {
    this._resizeTimer;
    this._ww = window.outerWidth;
    this._images = document.querySelectorAll( '.fluid' );
    this._initialImageTimer;
}

var proto = imgix.prototype;

proto._resize = function() {
    clearTimeout( this._resizeTimer );

    var ctx = this;

    this._resizeTimer = setTimeout( function() {
        var ww = window.outerWidth;

        if( ww > ctx._ww ) {
            ctx._resizeImages();
        }

        ctx._ww = ww;

    }, 500 );
};

proto._attachResize = function() {
    window.addEventListener( 'resize', this._resize.bind( this ) );
};

proto._getImgWidth = function( img ) {
    var width = img.getBoundingClientRect().width;

    img.setAttribute( img.href + '?w=' + width );
};

proto._parseQueryParams = function( name, url ) {
    name = name.replace( /[\[\]]/g, "\\$&" );
    var regex   = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ),
        results = regex.exec( url );

    if( !results ) {
        return null;
    }

    if( !results[2] ) {
        return '';
    }

    return decodeURIComponent( results[2].replace( /\+/g, " " ) );
};

proto._resizeImages = function() {
    var ctx    = this;

    Array.prototype.slice.call( ctx._images ).forEach( function( img ) {
        var src         = img.src.length ? img.src : img.getAttribute( 'data-src' ),
            dimensions  = img.getBoundingClientRect(),
            hasParams   = src.indexOf( '?' ) > -1,
            cleanedSrc  = hasParams ? src.substr( 0, src.indexOf( '?' ) ) : src,
            w           = hasParams ? ctx._parseQueryParams( 'w', src ) : '',
            h           = hasParams ? ctx._parseQueryParams( 'h', src ) : '';

        if( hasParams ) {
            if( !dimensions.width || !dimensions.height ) {
                img.src = src.replace( 'w=' + w, 'w=' + ctx._ww );
            } else {
                img.src = src.replace( 'w=' + w, 'w=' + Math.round( img.getBoundingClientRect().width ) );
                img.src = src.replace( 'h=' + w, 'h=' + Math.round( img.getBoundingClientRect().height ) );
            }
        } else {
            if( !dimensions.width || !dimensions.height ) {
                img.src = cleanedSrc + '?w=' + ctx._ww;
            } else {
                img.src = cleanedSrc + '?w=' + img.getBoundingClientRect().width;
            }
        }
    });
}

proto._init = function() {
    this._resizeImages();
    this._attachResize();
};

module.exports = imgix;
