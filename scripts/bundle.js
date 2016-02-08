(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function imgix() {
    this._resizeTimer;
    this._ww = window.outerWidth;
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
    var images = document.querySelectorAll( '.fluid' ),
        ctx    = this;

    Array.prototype.slice.call( images ).forEach( function( img ) {
        var src         = img.src,
            hasParams   = src.indexOf( '?' ) > -1,
            cleanedSrc  = hasParams ? src.substr( 0, src.indexOf( '?' ) ) : src,
            w           = hasParams ? ctx._parseQueryParams( 'w', src ) : '',
            h           = hasParams ? ctx._parseQueryParams( 'h', src ) : '';

        if( hasParams ) {
            img.src = img.src.replace( 'w=' + w, 'w=' + img.getBoundingClientRect().width );
            img.src = img.src.replace( 'h=' + w, 'h=' + img.getBoundingClientRect().height );
        } else {
            img.src = cleanedSrc + '?w=' + img.getBoundingClientRect().width;
        }
    });
}

proto._init = function() {
    this._attachResize();
};

module.exports = imgix;

},{}],2:[function(require,module,exports){
var imgix = require( './imgix' );

var Main = ( function() {
    // Do stuff with the images:
    var images = new imgix();
    images._init();
}());

},{"./imgix":1}]},{},[2]);
