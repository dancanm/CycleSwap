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
        $('#courses_want input').keydown(function(e){
            clearTimeout( CoursesWant );
            var CoursesWant = setTimeout(function(){
                var query = $("#courses_want input").val();
                if(query === ''){
                    $("#courses_want .results").hide()
                }else{
                    $("#courses_want .results").show()
                }
                var acl = autoComplete(val_list,query, 3);
                $("#courses_want .autofill").hide('');
                $.each(autoComplete(val_list, query, 3),function(i,v){
                    $($("#courses_want .autofill")[i]).show();
                    $('#want_autofill_'+ String(i+1) +" span").html(v);
                });
            }, 400);
        });

        $('#courses_registered input').keydown(function(e){
            clearTimeout( CoursesRegistered );
            var CoursesRegistered = setTimeout(function(){
                var query = $("#courses_registered input").val();
                if(query === ''){
                    $("#courses_registered .results").hide()
                }else{
                    $("#courses_registered .results").show()
                }
                $("#courses_registered .autofill").hide();
                $.each(autoComplete(val_list, query, 3),function(i,v){
                    $($("#courses_registered .autofill")[i]).show();
                    $('#registered_autofill_' + String(i+1) +" span").html(v);
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

