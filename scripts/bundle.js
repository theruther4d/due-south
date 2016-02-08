(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        } else {
            console.log( 'sizing down, no change!' );
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
        var src         = img.src,
            dimensions  = img.getBoundingClientRect(),
            hasParams   = src.indexOf( '?' ) > -1,
            cleanedSrc  = hasParams ? src.substr( 0, src.indexOf( '?' ) ) : src,
            w           = hasParams ? ctx._parseQueryParams( 'w', src ) : '',
            h           = hasParams ? ctx._parseQueryParams( 'h', src ) : '';

        clearTimeout( ctx._initialImageTimer );
        if( !dimensions.width || !dimensions.height ) {
            console.log( 'no width! Aborting!' );
            if( img.getAttribute( 'data-src' ) && !src.length ) {
                img.src = img.getAttribute( 'data-src' );
            }

            ctx._initialImageTimer = setTimeout( function() {
                console.log( 'recalling _resizeImages' );
                ctx._resizeImages();
            }, 100 );
            return false;
        }

        console.log( 'new width: ', dimensions.width );
        console.log( 'new height: ', dimensions.height );

        if( hasParams ) {
            img.src = img.getAttribute( 'data-src' ).replace( 'w=' + w, 'w=' + img.getBoundingClientRect().width );
            img.src = img.getAttribute( 'data-src' ).replace( 'h=' + w, 'h=' + img.getBoundingClientRect().height );
        } else {
            img.src = cleanedSrc + '?w=' + img.getBoundingClientRect().width;
        }
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
