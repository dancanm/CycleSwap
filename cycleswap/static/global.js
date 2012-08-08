/* album_sort.js 

*/



(function(){

	function setupUI(){
<<<<<<< HEAD
        $('#courses_registered').append(createElem('div',{'id':'courses_im_registered_for_txt', 'className':'h_description'},"Courses I'm registered for:"));
        $('#courses_registered').append(createElem('input',{'id':'course_registered_input', 'className': 'autocomplete_this', 'type':'text'},"Courses I'm registered for:"));
        $('#courses_want').append(createElem('div',{'id':'courses_i_want_text', 'className':'h_description'},"Courses I want to get into:"));
        $('#courses_want').append(createElem('input',{'id':'course_want_input', 'className': 'autocomplete_this', 'type':'text'}));
        $('#preference_interface').append(createElem('div',{'id':'drag_and_drop_prefs_txt', 'className':'h_description'},"Drag & Drop Preferences"));
	
        
=======
        var want_autofill1 = createElem('div',{'id':'want_autofill_1','className':'autofill'});
        var want_autofill2 = createElem('div',{'id':'want_autofill_2','className':'autofill'});
        var want_autofill3 = createElem('div',{'id':'want_autofill_3','className':'autofill'});
        var registered_autofill1 = createElem('div',{'id':'registered_autofill1','className':'autofill'});
        var registered_autofill2 = createElem('div',{'id':'registered_autofill2','className':'autofill'});
        var registered_autofill3 = createElem('div',{'id':'registered_autofill3','className':'autofill'});
       // $('.autofill').hide();
        $('#want_results').append(want_autofill1);
        $('#want_results').append(want_autofill2);
        $('#want_results').append(want_autofill3);
        $('#registered_results').append(registered_autofill1);
        $('#registered_results').append(registered_autofill2);
        $('#registered_results').append(registered_autofill3);

	   
>>>>>>> fbb1132dd054adf742ba927d26a3e15f91fe3ca1
    }

	function setupUserCourses(data){
		/* set up courses */
	}

	function getUserCourses(){
		$.ajax({
            type: 'GET',
            url: '/get-user-courses-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
            },
            success: function(data){
                console.log('Retrieved courses.');
                setupUserCourses(data);
            }
        });
	}

    function watchInputs(val_list){
        $('#course_want_input').keydown(function(e){
            clearTimeout( CoursesWant );
            var CoursesWant = setTimeout(function(){
                var acl = autoComplete(val_list, $('#course_want_input').val(), 3);
                for (var i=1; i<acl.length; i++){
                    $('#want_autofill_' + i).html(acl[i-1]);
                }
            }, 400);
        });

        $('#course_registered_input').keydown(function(e){
            clearTimeout( CoursesRegistered );
            var CoursesRegistered = setTimeout(function(){
                var acl = autoComplete(val_list, $('#course_registered_input').val(), 3);
                for (var i=1; i<acl.length; i++){
                    $('#registered_autofill_' + i).html(acl[i-1]);
                }
            }, 400);
        });
    }


    function setupAutocomplete(){
        $.ajax({
            type: 'GET',
            url: '/get-course-list-ajax/',
            data: {},
            success: function(data){
                var parsed = $.parseJSON(data);
                watchInputs(parsed);
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
                setupUserCourses(data);
            }
        });
	}

	function setupSite(){
		setupUI();
		getUserCourses();
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

