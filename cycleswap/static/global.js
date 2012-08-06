/* album_sort.js 

*/



(function(){

	function setupSite(){
		$('#register_txt').click(function(){
			$('#register_txt').unbind('click');
			$('#register_txt').fadeOut(600,function(){
				$('#register_txt').remove();
				register_ui();
			});
		});
	}

	function register(){
		$.ajax({
            type: 'POST',
            url: '/register-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
                'name': $('#name_input').val(),
                'email': $('#email_input').val(),
                'password': $('#password_input').val(),
            },
            success: function(){
                console.log('register successful.')
            }
        });
	}

	function register_ui(){
		var register_div = createElem('div',{'id': 'register_div'});
		var name_input = createElem('input',{'id': 'name_input', 'type':'text', 'value': 'Name'});
		var email_input = createElem('input',{'id': 'email_input', 'type':'text', 'value': 'Brown email address'});
		var password_input = createElem('input',{'id': 'password_input', 'type':'password', 'value': 'Password'});
		var cycle_img = createElem('img',{'src': '/public/images/cycle.png'});
		$(cycle_img).css({
			'display' : 'block',
			'width' : '100px',
		});
		$(register_div).append(name_input);
		$(register_div).append(email_input);
		$(register_div).append(password_input);
		$(register_div).append(cycle_img);
		$(register_div).hide();
		$('#welcome_txt').append(register_div);
		$(register_div).fadeIn(1000);
		$(cycle_img).click(register);
	}

window.setupSite = setupSite;

}());

