(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function imgix() {
    this._resizeTimer;
    this._ww = window.outerWidth ? window.outerWidth : window.innerWidth;
    this._images = document.querySelectorAll( '.fluid' );
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
        var src         = img.src.length ? img.src : img.getAttribute( 'data-src' ),
            dimensions  = img.getBoundingClientRect(),
            hasParams   = src.indexOf( '?' ) > -1,
            cleanedSrc  = hasParams ? src.substr( 0, src.indexOf( '?' ) ) : src,
            w           = hasParams ? ctx._parseQueryParams( 'w', src ) : '',
            h           = hasParams ? ctx._parseQueryParams( 'h', src ) : '',
            newWidth    = !dimensions.width || !dimensions.height ? ctx._ww : Math.round( dimensions.width ),
            outputSrc   = src;

        if( hasParams ) {
            outputSrc = outputSrc.replace( 'w=' + w,  'w=' + newWidth );
        } else {
            outputSrc += '?w=' + newWidth;
        }

        outputSrc += '&dpr=' + ctx._dpr;

        img.src = outputSrc;
        console.log( 'outputSrc: ', outputSrc );
    });
}

proto._init = function() {
    this._resizeImages();
    this._attachResize();
};

module.exports = imgix;

},{}],2:[function(require,module,exports){
var imgix = require( './imgix' );

var Main = ( function() {
    return {
        init: function() {
            document.addEventListener( 'DOMContentLoaded', function( e ) {
                // Do stuff with the images:
                var images = new imgix();
                images._init();
            });
        }
    }
}());

module.exports = Main.init();

},{"./imgix":1}]},{},[2]);
