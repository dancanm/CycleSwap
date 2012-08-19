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
			registered = (preference['registered'] == 't')
			rank = rank_counter
			rank_counter += 1
			new_pref = Course_preference(student=student,course=course,registered=registered,rank=rank)
			new_pref.save()
	return HttpResponse('courses saved')

def get_user_courses_ajax(request):
	user = request.user
	data = {}
	if user.is_authenticated():
		preferences = user.student.preferences.all()
	else:
		preferences = []
	return HttpResponse(json.dumps([pref.jsonify() for pref in preferences]))

def get_course_list_ajax(request):
	list_of_courses = [str(course) for course in Course.objects.all()]
	return HttpResponse(json.dumps(list_of_courses))

### algorithms ##

# test findcycle
def findCycleTest(k,n):
	s = Student.objects.all()[k]
	return findCycles(s,n)

# findCycle
# takes in a Student and an integer n, and returns
# a list of the cycles involving the starting node in n
# moves or less.
def findCycles(root_student,n):
	cycles = []
	prefs_wanted = root_student.preferences.filter(registered=False)
	courses_wanted = []
	for pref in prefs_wanted:
		courses_wanted.append(pref.course)

	for course_wanted in courses_wanted:
		found_cycle = findCyclesHelper(root_student, course_wanted, course_wanted, [root_student.preferences.get(course=course_wanted)], n)
		if found_cycle:
			cycles.append(found_cycle)

	return cycles


def findCyclesHelper(root_student, root_course, course_wanted,cycle,n):
	if n > 0:
		# if course_wanted is being offered by root_student,
		pref_give = Course_preference.objects.filter(student=root_student).filter(course=course_wanted).filter(registered=True)
		if pref_give:
			# and if ranks agree that its a cycle,
			pref_give = pref_give[0]
			rank_give = pref_give.rank
			rank_receive = Course_preference.objects.filter(student=root_student).filter(course=root_course)[0].rank
			if rank_receive < rank_give:
				# then return the cycle
				cycle.append(pref_give)
				return cycle
			else:
				return []
		# else if root_student doesn't have course_wanted, find all the students
		# who do, and run a recursive search on the courses they want, which are
		# also preferred to course_wanted
		else:
			prefs_have_course = Course_preference.objects.filter(course=course_wanted).filter(registered=True)
			for pref_has in prefs_have_course:
				cycle.append(pref_has)
				print pref_has
				student_has_course = pref_has.student
				prefs_student_wants = student_has_course.preferences.filter(registered=False).filter(rank__lt=pref_has.rank)
				for pref_wants in prefs_student_wants:
					print pref_wants
					cycle.append(pref_wants)
					new_course_wanted = pref_wants.course
					found_cycle = findCyclesHelper(root_student,root_course,new_course_wanted,cycle,n-1)
					if found_cycle:
						return found_cycle
