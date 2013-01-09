from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from graph.models import *
from django.contrib.auth import authenticate, login, logout
import json
from django.core.mail import send_mail

###  utils ###
def import_courses():
	# import data as json, convert it to a list of course dicts
	json_data=open('static/banner.json').read()
	data = json.loads(json_data)

	for course_data in data:
		new_course = Course(name=course_data['name'].replace(" ","",1),title=course_data['title'],description=course_data['description'])
		new_course.save()
		print course_data['name'] + ": " + course_data['title']

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
	return user

def send_individual_email(student, cycle, pref):
	course = pref.course
	subject = "You're in a swap! Register for " + course.title + " now."
	message = "Hello " + student.name.split(" ")[0] + "." + "\r\n\r\n"
	message += "After poring over the data, we've found a swap cycle which will allow you to register for " + course.name + ": " + course.title + ". Here's how it works:" + "\r\n\r\n"

	want_nodes = cycle.nodes.filter(pref__registered=False)
	curr_node = want_nodes[0]
	for i in range(len(want_nodes)):
		node_pref = curr_node.pref
		node_student = node_pref.student
		if node_student == student:
			# second person
			message += "You want to take " + node_pref.course.name + ": " + node_pref.course.title + ", and are willing to give up " + curr_node.prev.pref.course.name + ": " + curr_node.prev.pref.course.title + " for it.\r\n"
		else:
			# third person
			message += node_student.name + " ("+node_student.user.email+") wants to take " + node_pref.course.name + ": " + node_pref.course.title + ", and is willing to give up " + curr_node.prev.pref.course.name + ": " + curr_node.prev.pref.course.title + " for it.\r\n"
		curr_node = curr_node.next.next

	message += "\r\nCorrespond with your peers via email and pick a time to swap. It's a good idea to complete the swap in person to ensure that nobody backs out, but this isn't necessary. At the chosen time, everybody in the swap should log into banner (boca.brown.edu), simultaneously drop the course they're giving away, then add the course they want.\r\n\r\nLet us know how it went on courseswap.co, and enjoy the rest of your semester!\r\n\r\n"
	message += "Happy swapping,\r\nthe Courseswap team"

	message += "\r\n\r\nP.S. If you're looking for an easy way to find a time for everybody to meet, consider using Calendar Clash (www.calclash.com). Calendar Clash is a tool created by two former Brown students that makes it easy to set up meetings between people with busy schedules."
	
	from_address = 'The Courseswap Team <Pareto@courseswap.co>'
	print message
	student.cycle_info = message
	student.save()
	send_mail(subject, message, from_address, [student.user.email], fail_silently=False)


def craft_email(cycle):
	for node in cycle.nodes.filter(pref__registered=False):
		pref = node.pref
		student = pref.student
		course = pref.course
		pref.is_in_cycle = True
		pref.save()
		send_individual_email(student, cycle, pref)

# takes a list of Course_preferences, saves a Cycle object, and returns it
def save_cycle(pref_list):
	new_cycle = Cycle()
	new_cycle.save()
	curr_pref = pref_list[0]
	prev_node = Node(cycle=new_cycle, pref=pref_list[0])
	prev_node.save()
	first_node = prev_node
	for i in range(1, len(pref_list)):
		new_node = Node(cycle=new_cycle, pref=pref_list[i])
		new_node.save()
		prev_node.next = new_node
		prev_node.save()
		prev_node = new_node
	prev_node.next = first_node
	prev_node.save()

	return new_cycle

# saves a cycle as a Cycle and sends an email to those involved
def save_cycle_and_send_email(pref_list):
	craft_email(save_cycle(pref_list))


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
		return HttpResponse(json.dumps(student.jsonify()))
	else:
		return HttpResponse(json.dumps({'error':'invalid email/password!'}))

def log_out(request):
	logout(request)
	return HttpResponse('')

def save_courses_ajax(request):
	print 'savecourses 1'
	user = request.user
	if user.is_authenticated():
		student = user.student
		# load preferences, which are a list of dicts including course name, registered boolean, and rank
		preferences = json.loads(request.POST['courses'])
		# delete previous preferences
		student.courses.clear()
		# and create new ones
		rank_counter = 1
		print 'savecourses 2'
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
		preferences = Course_preference.objects.filter(student=user.student).order_by('-rank')
	else:
		preferences = []
	return HttpResponse(json.dumps([pref.jsonify() for pref in preferences]))

def get_course_list_ajax(request):
	list_of_courses = [str(course) for course in Course.objects.all()]
	return HttpResponse(json.dumps(list_of_courses))

### algorithms ##

# test findCycle
def test(k,n):
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

	# for each course the root student wants
	for course_wanted in courses_wanted:
		# run helper function on that course
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
		# else (if root_student doesn't have course_wanted), find all the students
		# who do, and run a recursive search on the courses they want, which are
		# also preferred to course_wanted
		else:
			prefs_have_course = Course_preference.objects.filter(course=course_wanted).filter(registered=True)
			for cycle_pref in cycle:
				for i in range(len(prefs_have_course)):
					if cycle_pref.student == prefs_have_course[i].student or prefs_have_course[i].student.is_in_cycle():
						prefs_have_course = prefs_have_course.exclude(student=prefs_have_course[i].student)
			for pref_has in prefs_have_course:
				cycle.append(pref_has)
				student_has_course = pref_has.student
				prefs_student_wants = student_has_course.preferences.filter(registered=False).filter(rank__lt=pref_has.rank)
				for pref_wants in prefs_student_wants:
					new_cycle_list = cycle + [pref_wants]
					new_course_wanted = pref_wants.course
					complete_cycle = findCyclesHelper(root_student,root_course,new_course_wanted,new_cycle_list,n-1)
					if complete_cycle:
						return complete_cycle