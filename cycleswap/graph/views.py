from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from graph.models import *
from django.contrib.auth import authenticate, login, logout
import json

###  utils ###
def import_courses():
	# import data as json, convert it to a list of course dicts
	json_data=open('static/banner.json').read()
	data = json.loads(json_data)

	for course_data in data:
		new_course = Course(name=course_data['name'].replace(" ","",1),title=course_data['title'],description=course_data['description'])
		new_course.save()
		print course_data['name'] + ": " + course_data['title']

def create_students():
	names = ['dan','ezra','charlie','andrew','nathan','brian','colleen']
	for i in range(0,7):
		new_student = Student(name=names[i])
		new_student.save()




### views ###

def welcome(request):
	if request.user.is_authenticated():
		li = True
		name = request.user.student.name
	else: li = name = False
	return render_to_response('graph/welcome.html',{'logged_in':li, 'name':name},context_instance=RequestContext(request))

### web functions ###

def create_new_user(name,email,password):
	user = User(email=email,username=email)
	user.set_password(password)
	user.save()
	user = authenticate(username=user.email, password=password)
	user.save()

	new_student = Student.objects.create(name=name, user=user)
	new_student.save()
	print user
	print user.student
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
		school = email.split('@')[-1].split('.')[0]
		errors.append('You need a brown.edu email address to join. Go away, ' + school + ' student.')

	if User.objects.filter(username=email).exists():
		errors.append('Someone already joined with this email!')

	if not errors:
		user = create_new_user(name,email,password)
		login(request, user)
		return HttpResponse(json.dumps({}))
	else:
		return HttpResponse(json.dumps({'error':errors}))

def log_in(request):
	email = request.POST['email']
	password = request.POST['password']
	user = authenticate(username=email, password=password)
	if user:
		login(request,user)
		student = user.student
		print student
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
		preferences = json.loads(request.POST['courses'])
		# delete previous preferences
		student.courses.clear()
		# and create new ones
		rank_counter = 1
		print preferences
		for preference in preferences:
			course_full_title = preference['full_title']
			course_name = course_full_title.split(':')[0]
			print course_name
			course = Course.objects.get(name=course_name)
			registered = (preference['registered'] == 'True')
			rank = rank_counter
			rank_counter += 1
			new_pref = Course_preference(student=student,course=course,registered=registered,rank=rank)
			new_pref.save()
	return HttpResponse('courses saved')


def get_user_courses_ajax(request):
	user = request.user
	print user
	print user
	print user
	print user.student
	data = {}
	if user.is_authenticated():
		preferences = user.student.preferences.all()
	else:
		preferences = []
	return HttpResponse(json.dumps([pref.jsonify() for pref in preferences]))

def get_course_list_ajax(request):
	list_of_courses = [str(course) for course in Course.objects.all()]
	return HttpResponse(json.dumps(list_of_courses))