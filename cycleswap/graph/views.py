from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from graph.models import *
from django.contrib.auth import authenticate, login, logout
import json


### setup utils ###
def create_students():
	names = ['dan','ezra','charlie','andrew','nathan','brian','colleen']
	emails = ['dan','ezra','charlie','andrew','nathan','brian','colleen']
	for i in range(0,7):
		new_student = Student(name=names[i],email=emails[i])
		new_student.save()




### views ###

def welcome(request):
	if request.user.is_authenticated():
		li = True
	else: li = False
	return render_to_response('graph/welcome.html',{'logged_in':li},context_instance=RequestContext(request))

### web functions ###

def create_new_user(name,email,password):
	user = User(email=email,username=email)
	user.set_password(password)
	user.save()
	user = authenticate(username=user.email, password=password)

	new_student = Student.objects.create(name=name, user=user)

	return user
### ajax calls ###

def register(request):
	name = request.POST['name']
	email = request.POST['email']
	password = request.POST['password']
	password_again = request.POST['password_again']
	errors = []
	if password != password_again:
		errors.append('Your passwords don\'t seem to match')

	if email.split('@')[-1] != 'brown.edu':
		errors.append('You need a brown.edu email address to join')

	if User.objects.filter(username=email).exists():
		errors.append('Someone already joined with this email!')

	if not errors:
		user = create_new_user(name,email,password)
		login(request, user)
		return HttpResponse('')
	else:
		return HttpResponse(json.dumps({'error':errors}))

def log_in(request):
	email = request.POST['email']
	password = request.POST['password']
	user = authenticate(username=email, password=password)
	if user:
		login(request,user)
		student = user.student
		return HttpResponse(json.dumps(student.jsonify()))
	else:
		return HttpResponse(json.dumps({'error':'invalid email/password!'}))
def log_out(request):
	logout(request)
	return HttpResponse('')
def save_courses_ajax(request):
	user = request.user
	if user.is_authenticated():
		student = user.student
		# load preferences, which are a list of dicts including course name, registered boolean, and rank
		preferences = json.loads(request.POST['preferences'])
		# delete previous preferences
		student.courses.clear()
		# and create new ones
		for preference in preferences:
			course_name = preference.name
			course = Course.objects.get(name=course_name)
			registered = (preference['registered'] == 'True')
			rank = preference['rank']
			new_pref = Course_preference(student=student,course=course,registered=registered,rank=rank)
			new_pref.save()

def get_user_courses_ajax(request):
	user = request.user
	data = {}
	if user.is_authenticated():
		preferences = user.student.preferences.all()
	else:
		preferences = []
	return HttpResponse(json.dumps([pref.jsonify() for pref in preferences]))

def get_course_list_ajax(request):
	list_of_courses = [str(course).replace(" ","",1) for course in Course.objects.all()]
	return HttpResponse(json.dumps(list_of_courses))