/* lightbox.js 

*/    


(function(){

    function removeLightbox(){
        $('#darkbackground').fadeOut(300, function(){$('#darkbackground').remove();});
        window.onresize =  null;
    }

    function recenterLightbox(){
        $('#darkbackground').css({
            'width': $(window).width() + 'px',
            'height': $(document).height() + 'px'
        });
        $('#lightbox').css({
            'left': ($(window).width() - 600) / 2,
            'top': ($(window).height() - 600) / 2
        });
    }

    function displayLightbox(){
        var darkbackground = createElem('div', { id: 'darkbackground' , align: 'center'});
        $(darkbackground).css({
            'width': $(document).width() + 'px',
            'height': $(document).height() + 'px',
        });
        var lightbox = createElem('div', { id: 'lightbox' , align: 'center', className: 'shadow_box'});
        $('body').append(darkbackground);
        $(darkbackground).append(lightbox);

        $(darkbackground, lightbox).click(function(e){
                    e.stopPropagation();
                });
        recenterLightbox();

    }

window.displayLightbox = displayLightbox;
}());