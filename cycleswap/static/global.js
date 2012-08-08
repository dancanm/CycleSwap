/* album_sort.js 

*/



(function(){

	function setupUI(){
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

   
        //login events
        $("#login .h_description").click(function(){
            var $t =  $("#login table");
            if($t.css('display') === 'none'){
                $t.show();
                $("#login").animate({
                    'width' : '90%'
                },
                {
                    duration:200,
                    complete: function(){
                        $(this).animate({
                            'height':'200px'
                        },{
                            duration: 300
                        });
                    },
                });
            }else{
                $("#login").animate({
                    'height' : '20px'
                },
                {
                    duration:300,
                    complete: function(){
                        $(this).animate({
                            'width':'45%'
                        },{
                            duration: 300,
                            easing: 'swing',
                            complete:function(){$t.hide();}
                        });
                    },
                });
            }
        });

            


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

