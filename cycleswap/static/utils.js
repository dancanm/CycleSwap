//  createElem
//      Desc: makes any DOM element and gives it attributes and/or innerHTML, and can append other objects to it
//      Args: 
//          a: string, name of element we're making
//          b: key:value map of attribute names and values. ex: { 'className': 'fan_button', 'id': 'fan_button_34' }
//          c: string, will be put into the element as innerHTML
//          d: list of already-defined elements to append to this element, in the order they're listed
//      Called by: any functions that generate HTML, usually using ajax data (ex: jam page, profile page)
//      Returns: the finished element

function createElem(a, b, c, d){ // artur's
    var x, i, e, h = a === 'a-external' ? true : false;

    if (h){
        a = 'a';
        b.target = '_newtab';
    }

    x = document.createElement(a);
    
    for (i in b){
        if (b.hasOwnProperty(i) && typeof(i) !== 'function') {
            x[i] = b[i];
        }
    }

    if (c !== undefined){
        x.innerHTML = c;
    }

    d = d || [ ];

    for (e in d){
        if (d.hasOwnProperty(e) && typeof(e) !== 'function') {
            x.appendChild(d[e]);	    
        }
    }

    if (a === 'a' && !h){
        bind_anchor(x);
    }
    
    if ($(x).hasClass('playSong')){ // Special case for song play buttons which usually get set when the doc loads.
        bind_play_function(x);
    }

    return x;
}