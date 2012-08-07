/* album_sort.js 

*/



(function(){

	function setupUI(){
        $('#courses_registered').append(createElem('div',{'id':'courses_im_registered_for_txt', 'className':'h_description'},"Courses I'm registered for:"));
        $('#courses_registered').append(createElem('input',{'id':'course_registered_input', 'className': 'autocomplete_this', 'type':'text'},"Courses I'm registered for:"));
        $('#courses_want').append(createElem('div',{'id':'courses_i_want_text', 'className':'h_description'},"Courses I want to get into:"));
        $('#courses_want').append(createElem('input',{'id':'course_want_input', 'className': 'autocomplete_this', 'type':'text'}));
        $('#preference_interface').append(createElem('div',{'id':'drag_and_drop_prefs_txt', 'className':'h_description'},"Drag & Drop Preferences"));
	}

	function setupCourses(data){
		/* set up courses */
	}

	function getCourses(){
		$.ajax({
            type: 'GET',
            url: '/get-courses-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
            },
            success: function(data){
                console.log('Retrieved courses.');
                setupCourses(data);
            }
        });
	}

    function setupAutocomplete(){
        $.ajax({
            type: 'GET',
            url: '/get-course-list-ajax/',
            data: {},
            success: function(data){
                var parsed = $.parseJSON(data);
                console.log(parsed);
            }
        });
    }

	function logIn(){
		/* if course data exists, logging in will override it. are you sure you want to log in?
		if so, POST register-ajax, if not, undo login attempt. */
		$.ajax({
            type: 'POST',
            url: '/log-in-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
                'email': $('#email_input').val(),
                'password': $('#password_input').val(),
            },
            success: function(data){
            	console.log('User logged in.');
            	/* reset login fields */
                setupCourses(data);
            }
        });
	}

	function setupSite(){
		setupUI();
		getCourses();
        setupAutocomplete();
	}

	function saveCourses(){
		setupUI();
		$.ajax({
            type: 'POST',
            url: '/save-courses-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
                /* course data */
            },
            success: function(){
                console.log('Courses saved.');
            }
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
            	console.log('Registered new user.');
                /* save courses */
                /* reset register fields */
            }
        });
	}

window.setupSite = setupSite;
window.saveCourses = saveCourses;

}());

