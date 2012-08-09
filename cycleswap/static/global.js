/* album_sort.js 

*/



(function(){

	function setupUI(){
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
                            complete:function(){$t.hide();}
                        });
                    },
                });
            }
        });

        //clicking
        $("#login #submit").click(function(){
            logIn();
        });
   }
   function logIn(){
    $.ajax({
        url : '/log-in/',
        type : 'POST',
        data : {
            'email' : $("#email").val(),
            'password':$("#password").val(),
            'csrfmiddlewaretoken': csrfTOKEN,
        },
        dataType:'json',
        success:function(data){
            if(data.error){
                console.log('login unsuccessful');
                //error message
            }else{
                setupUserCourses(data.courses);
            }
        }
    });
   }

   //courses will be a list of jsonified course_preferences
	function setupUserCourses(courses){
		
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
            console.log('PENIS');
            clearTimeout( CoursesRegistered );
            var CoursesRegistered = setTimeout(function(){
                $.each(autoComplete(val_list, $('#course_registered_input').val(), 3),function(i,v){
                    console.log(i+ " "+v);
                    $('#registered_autofill_' + String(i) +" span").html(v);
                });
            }, 400);
        });
    }


    function setupAutocomplete(){
        $.ajax({
            type: 'GET',
            url: '/get-course-list-ajax/',
            data: {},
            dataType : 'json',
            success: function(data){
                watchInputs(data);
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

