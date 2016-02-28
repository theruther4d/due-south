function imgix() {
    this._resizeTimer;
    this._ww = window.outerWidth ? window.outerWidth : window.innerWidth;
    this._images = document.querySelectorAll( '.fluid' );
    this._bgImages = document.querySelectorAll( '.fluid-bg' );
    this._initialImageTimer;
    this._dpr = 1;
}

var proto = imgix.prototype;

proto._getWindowDPR = function () {
    var dpr = window.devicePixelRatio ? window.devicePixelRatio : 1;

    if( dpr % 1 !== 0 ) {
        var tmpStr  = dpr.toString();
            tmpStr  = tmpStr.split( '.' )[1];
            dpr     = ( tmpStr.length > 1 && tmpStr.slice( 1, 2 ) !== '0' ) ? dpr.toFixed( 2 ) : dpr.toFixed( 1 );
    }

    return dpr;
};

proto._resize = function() {
    clearTimeout( this._resizeTimer );

    var ctx = this;

    this._resizeTimer = setTimeout( function() {
        var ww = window.outerWidth ? window.outerWidth : window.innerWidth;

        if( ww > ctx._ww ) {
            ctx._resizeImages();
            ctx._resizeBgImages();
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
    var ctx         = this;
        ctx._dpr    = ctx._getWindowDPR();

    Array.prototype.slice.call( ctx._images ).forEach( function( img ) {
        var src         = img.src.length && img.src.indexOf( 'imgix' ) > -1 ? img.src : img.getAttribute( 'data-src' ),
            dimensions  = img.getBoundingClientRect(),
            hasParams   = src.indexOf( '?' ) > -1,
            w           = hasParams ? ctx._parseQueryParams( 'w', src ) : '',
            newWidth    = !dimensions.width || !dimensions.height ? ctx._ww : Math.round( dimensions.width ),
            outputSrc   = src;

        if( hasParams ) {
            if( outputSrc.indexOf( 'w=' ) > -1 ) {
                outputSrc = outputSrc.replace( 'w=' + w,  'w=' + newWidth );
            } else {
                outputSrc += '&w=' + newWidth;
            }
        } else {
            outputSrc += '?w=' + newWidth;
        }

        if( outputSrc.indexOf( '&dpr' ) < 0 ) {
            outputSrc += '&dpr=' + ctx._dpr;
        }

        img.src = outputSrc;
    });
};

proto._resizeBgImages = function() {
    var ctx = this;
        ctx._dpr = ctx._getWindowDPR();

    Array.prototype.slice.call( ctx._bgImages ).forEach( function( img ) {
        var src = img.style.backgroundImage.replace( 'url(', '' ).replace( ')', '' );
        var dimensions = img.getBoundingClientRect();
        var hasParams = src.indexOf( '?' ) > -1;
        var w = ctx._parseQueryParams( 'w', src );
        var h = ctx._parseQueryParams( 'h', src );
        var dpr = ctx._parseQueryParams( 'dpr', src );
        var updatedSrc = src;

        if( !hasParams ) {
            updatedSrc = src + '?w=' + dimensions.width + '&h=' + dimensions.height;
            updatedSrc += '&dpr=' + ctx._dpr;
        } else {
            if( w ) {
                updatedSrc = src.replace( 'w=' + w, 'w=' + dimensions.width );
            } else {
                updatedSrc += '&w=' + dimensions.width;
            }

            if( h ) {
                updatedSrc = src.replace( 'h=' + h, 'h=' + dimensions.height );
            } else {
                updatedSrc += '&h=' + dimensions.height;
            }

            if( dpr ) {
                updatedSrc = src.replace( 'dpr=' + dpr, 'dpr=' + ctx._dpr );
            } else {
                updatedSrc += '&dpr=' + ctx._dpr;
            }
        }

        console.log( updatedSrc );
        img.style.backgroundImage = 'url(' + updatedSrc + ')';
    });
};

proto._init = function() {
    this._resizeImages();
    this._resizeBgImages();
    this._attachResize();
};

module.exports = imgix;
