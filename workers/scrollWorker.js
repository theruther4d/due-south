var items = {};
var windowHeight = 0;

onmessage = function( e ) {
    var message = e.data;

    if( message.type === 'addItem' ) {
        addItem( message.item.id, message.item.topBound, message.item.bottomBound, message.item.min, message.item.max );
    } else if( message.type === 'removeItem' ) {
        removeItem( message.item.id );
    } else if( message.type === 'update' ) {
        update( message.scrollY );
    } else if( message.type === 'windowHeight' ) {
        windowHeight = message.windowHeight;
    }
}

function hasItem( id ) {
    return items.hasOwnProperty( id );
};

function addItem( id, topBound, bottomBound, min, max ) {
    items[id] = {
        topBound: topBound,
        bottomBound: bottomBound,
        min: min,
        max: max
    };
};

function removeItem( id ) {
    if( !hasItem( id ) ) {
        return;
    }

    delete items[id];
};

function update( scrollY ) {
    Object.keys( items ).forEach( function( id ) {
        var fudge = 10;
        var item = items[id];
        var inView = ( scrollY + windowHeight ) >= item.topBound && scrollY <= item.bottomBound;
        var itemEnter = scrollY + windowHeight >= item.topBound + fudge || scrollY + windowHeight >=item.topBound - fudge;
        var itemExit = scrollY >= item.bottomBound + fudge || scrollY >= item.bottomBound - fudge;
        var itemCenter = scrollY + windowHeight === ( item.topBound - item.bottomBound ) / 2;

        if( !inView ) {
            return;
        }

        var normalized = scrollY < item.topBound ? item.topBound : scrollY;
        normalized = scrollY > item.bottomBound ? item.bottomBound : scrollY;
        var delta = ( normalized - item.topBound ) / ( item.bottomBound - item.topBound );
        var progress = Math.round( ( delta * ( item.max - item.min ) ) + item.min );

        if( itemEnter && !item.hasEntered ) {
            item.hasEntered = true;

            postMessage({
                type: 'itemEnter',
                id: id,
                progress: progress
            })
        }

        if( itemExit && !item.hasExited ) {
            item.hasExited = true;

            postMessage({
                type: 'itemExit',
                id: id,
                progress: progress
            });
        }

        if( itemCenter && !item.hasCentered ) {
            item.hasCentered = true;

            postMessage({
                type: 'itemCenter',
                id: id,
                progress: progress
            });
        }

        postMessage({
            type: 'itemInView',
            id: id,
            progress: progress
        });
    });
}
