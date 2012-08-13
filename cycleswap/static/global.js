/* album_sort.js 

*/


var logged_in
(function(){
	function setupUI(){
        //login events
        if(logged_in){
            changeToLogout();
        }else{
            changeToLogin();
        }

        $(".registration_input").hide();
        //clicking
        $("#login #submit").click(function(){
            logIn();
        });
        $("#submit_button").click(function(){
            if(logged_in){
                saveCourses();
            }else {
                changeToRegister();
            }
        })

        $( "#preferences" ).sortable({
            revert: true,
            stop : numberPreferences,
            cancel : '.delete_button'
        });
   }
   function showHide(){
        if($("#login table").css('display') === 'none'){showIt();
        }else{ hideIt();}
   }
   function showIt(){
        var $t =  $("#login table");
        $t.show();
        $("#login").animate({
            'width' : '90%'
        },
        {
            duration:200,
            complete: function(){
                $(this).animate({
                    'height':'200px'
                },{duration: 300});}});
   }
   function hideIt(){
        var $t =  $("#login table");
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
   function changeToRegister(){
        if($("#login_container .h_description").text()=='Register'){
            //pulsate
            $("#login").animate({
                boxShadow: '0px 0px 25px  #000000'
            },200,function(){
                $(this).animate({boxShadow:'0px 0px 25px #2B2B2B'})
            });
        }else{
            //open up the registration jawn
            $("#login_container .h_description")
                .fadeOut(400, function(){
                    $(this).text('Register');
                }).fadeIn(400);
            showIt();
            $(".registration_input").show();
        }
        $("#submit").unbind('click').click(register);
   }
   function changeToLogin(){
    $("#login_container .h_description")
        .fadeOut(400, function(){
            $(this).text('Log in');
        }).fadeIn(400).unbind('click').click(showHide);
        hideIt()
    $("#submit").unbind('click').click(logIn);
   }
   function changeToLogout(){
    $("#login_container .h_description")
        .fadeOut(400, function(){
            $(this).text('Log out');
        }).fadeIn(400).unbind('click');
        hideIt();
    $("#login .h_description").unbind('click').click(logOut);
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
            console.log(data);
            if(data.error){
                console.log('login unsuccessful');
                //error message
            }else{
                logged_in = true;
                setupUserCourses(data.courses);
                changeToLogout();
            }
        }
    });
   }
   function logOut(){
        $.post('/log-out/',{'csrfmiddlewaretoken': csrfTOKEN}, function(){
            $("#app_body").fadeOut(500,function(){
                logged_in = false;
                changeToLogin();
                setupUserCourses([]);
                $("#app_body").fadeIn(500);
            });
        });
   }
   function register(){

        $.ajax({
            url : '/register/',
            type: 'POST',
            data : {
                'csrfmiddlewaretoken': csrfTOKEN,
                'name' : $("#name").val(),
                'email' : $("#email").val(),
                'password' : $("#password").val(),
                'password_again' : $("#password_again").val()
            },
            dataType:'json',
            success:function(data){
                if(data.error){
                    console.log(data);
                }else{
                    changeToLogout();
                }
            }
        })
   }
   function prefListing(v,type){
        return "<div class='autofill ellipsis "+type+"' name='"+v+"'><span>"+v+"</span><div class='delete_button' style='display:none'></div></div>"
   }
   //courses will be a list of jsonified course_preferences
	function setupUserCourses(courses){
        var $p = $("#preferences");
		$p.empty();
        $.each(courses,function(){
            console.log(this);
            var name = this.course.name+": "+this.course.title;
            var type = this.registered === 't' ? 'registered' : 'want';
            $p.append(prefListing(this.course.name))
        });
	}

	function getUserCourses(){
		$.ajax({
            type: 'GET',
            url: '/get-user-courses-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
            },
            dataType:'json',
            success: function(data){
                console.log(data);
                setupUserCourses(data);
            }
        });
	}

    $.fn.auto = function(options){
        var ops = $.extend({
            'div' : this,//registered
            'type' : this.attr('type'),
            'courses' : [],
            'delay' : 400
        },options);
        var input = ops.div.find('input');
        var results = ops.div.find('.results');

        input.keydown(function(e){
            clearTimeout(time);
            var time = setTimeout(function(){
                var query = input.val();

                if(query === ''){results.hide();}
                else{results.show();}

                ops.div.find('.autofill').hide();
                $.each(autoComplete(ops.courses, query, 3), function(i,v){
                    $("#"+ops.type+"_autofill_"+String(i+1)).show()
                        .unbind('click')
                        .click(function(){
                            if(! alreadySelected(v) && $("#preferences ."+ops.type).length < 4){
                                $(this).hide();
                                $("#preferences").append(prefListing(v, ops.type))
                                numberPreferences();
                            }
                        }).find('span').html(v);
                });

            },ops.delay);
        });
    }
    function alreadySelected(name){
        var r = false;
        $("#preferences").children().each(function(){
            if($(this).attr('name')==name){r = true;}
        });
        return r;
    }
    function setupAutocomplete(){
        $.ajax({
            type: 'GET',
            url: '/get-course-list-ajax/',
            data: {},
            dataType : 'json',
            success: function(data){
                $("#courses_want").auto({'courses' : data});
                $("#courses_registered").auto({'courses': data,});
            }
        });
    }

    function numberPreferences(){
        $("#preferences").children().each(function(i,v){
            var s = $(v).find('span');
            s.html(String(i+1)+". "+ $(v).attr('name'));
            $(v).hover(function(){
                $(this).find('.delete_button').show();
            },function(){
                $(this).find('.delete_button').hide();
            })
            $(v).find('.delete_button').click(function(){
                $(v).remove();
            });
        });
    }
	function setupSite(){
		setupUI();
		getUserCourses();
        setupAutocomplete();
	}

	function saveCourses(){
        courses = []
        $("#preferences").children().each(function(){
            courses.push({'full_title':$(this).attr('name'),'registered' : $(this).hasClass('want')?'f':'t'})
        })
        courses = JSON.stringify(courses);
		$.ajax({
            type: 'POST',
            url: '/save-courses-ajax/',
            data: {	
                'csrfmiddlewaretoken': csrfTOKEN,
                'courses' : courses
                /* course data */
            },
            success: function(){
                console.log('Courses saved.');
            }
        });
	}


window.setupSite = setupSite;
window.saveCourses = saveCourses;
window.logged_in = logged_in;
}());

