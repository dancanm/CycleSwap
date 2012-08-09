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
	new_student = Student(name=name)
	new_student.user = User.objects.create_user(email,None,password)
	new_student.save()

### ajax calls ###

def register_ajax(request):
	name = request.POST['name']
	email = request.POST['email']
	password = request.POST['password']
	create_new_user(name,email,password)
	login(request, user)
	return HttpResponse('registered')

def log_in(request):
	email = request.POST['email']
	password = request.POST['password']
	user = authenticate(email=email, password=password)
	if user:
		login(request,user)
		student = user.student
		return HttpResponse(json.dumps(student.jsonify()))
	else:
		return HttpResponse(json.dumps({'error':'invalid email/password!'}))
def log_out(request):
	return HttpResponseRedirect('/')
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
		preferences = user.student.preferences
		for preference in preferences:
			course = preference.course
			data[course.name] = {'title': course.title, 'name': course.name, 'description': course.description, 'rank': preference.rank, 'registered': preference.registered}
	return HttpResponse(json.dumps(data))

def get_course_list_ajax(request):
	list_of_courses = [str(course).replace(" ","",1) for course in Course.objects.all()]
	return HttpResponse(json.dumps(list_of_courses))