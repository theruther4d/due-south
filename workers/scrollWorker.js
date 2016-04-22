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
    console.log( 'add Item received' );
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
        var item = items[id];
        var inView = ( scrollY + windowHeight ) >= item.topBound && scrollY <= item.bottomBound;

        if( !inView ) {
            return;
        }

        // console.log( `item ${id} in view` );

        var normalized = scrollY < item.topBound ? item.topBound : scrollY;
        normalized = scrollY > item.bottomBound ? item.bottomBound : scrollY;
        var delta = ( normalized - item.topBound ) / ( item.bottomBound - item.topBound );
        var progress = Math.round( ( delta * ( item.max - item.min ) ) + item.min );

        postMessage({
            type: 'itemInView',
            id: id,
            progress: progress
        });
    });
}
