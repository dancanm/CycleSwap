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

        $( "#preferences" ).sortable({
            revert: true,
            stop : numberPreferences,
            cancel : '.delete_button'
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
                                $("#preferences").append("<div class='autofill ellipsis "+ops.type+"' name='"+v+"'><span>"+v+"</span><div class='delete_button' style='display:none'></div></div>")
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

