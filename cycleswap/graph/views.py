from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from graph.models import *
import json


### management utils ###

def import_courses():
	# import data as json, convert it to a list of course dicts
	json_data=open('static/banner.json').read()
	data = json.loads(json_data)

	for course_data in data:
		new_course = Course(name=course_data['name'],title=course_data['title'],description=course_data['description'])
		new_course.save()
		print course_data['name'] + ": " + course_data['title']

def create_students():
	names = ['dan','ezra','charlie','andrew','nathan','brian','colleen']
	emails = ['dan','ezra','charlie','andrew','nathan','brian','colleen']
	for i in range(0,7):
		new_student = Student(name=names[i],email=emails[i])
		new_student.save()

### views ###

def welcome(request):
	return render_to_response('graph/welcome.html',{},context_instance=RequestContext(request))

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
	return HttpResponse('registered')