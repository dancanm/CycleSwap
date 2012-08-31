from django.db import models
from django.contrib.auth.models import User

class Student (models.Model):
	name = models.CharField(max_length=30)
	user = models.OneToOneField(User,related_name='student',blank=True,null=True)
	courses = models.ManyToManyField('Course', through='Course_preference', blank=True,null=True)
	school = models.CharField(max_length=10, default="brown")
	cycle_info = models.TextField(null=True, blank=True)
	
	def __unicode__(self):
		return self.name

	def is_in_cycle(self):
		ret = False
		for pref in self.preferences.all():
			if pref.is_in_cycle:
				ret = True
		return ret

	def jsonify(self):
		preferences = Course_preference.objects.filter(student=self).order_by('-rank')
		return {
			'name' : self.name,
			'courses' : [cp.jsonify() for cp in preferences],
			'is_in_cycle' : self.is_in_cycle(),
			'school' : self.school,
			'cycle_info' : self.cycle_info
		}


class Course (models.Model):
	name = models.CharField(max_length=10)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True)
	school = models.CharField(max_length=10, default="brown")

	def __unicode__(self):
		return self.name + ": " + self.title

	def jsonify(self):
		return {
			'name' : self.name,
			'title' : self.title,
			'description' : self.description,
			'school' : self.school
		}

		
# Intermediary between Student and Class
# Keeps track of course preferences and ordering
class Course_preference (models.Model):
	student = models.ForeignKey('Student', related_name='preferences')
	course = models.ForeignKey('Course', related_name='preferences')
	registered = models.BooleanField()
	rank = models.IntegerField()
	is_in_cycle = models.BooleanField(default=False)
	# nodes <= related name link to list of Nodes

	def __unicode__(self):
		if self.registered:
			return self.student.__unicode__() + " has " + self.course.__unicode__()
		else:
			return self.student.__unicode__() + " wants " + self.course.__unicode__()

	def jsonify(self):
		return {
			'rank' : self.rank,
			'registered' : 't' if self.registered else 'f',
			'course' : self.course.jsonify(),
			'is_in_cycle' : self.is_in_cycle
		}

# Holds information about a pending or completed cycle
class Cycle (models.Model):
	creation_date = models.DateTimeField(auto_now_add=True)
	resolution_date = models.DateTimeField(null=True)
	resolved = models.BooleanField(default=False)
	successful = models.NullBooleanField()
	# nodes <= related name link to list of Nodes

# Each node in a Cycle is a Node
# Contains: a pointer to it's Cycle, a pointer to a pref, and a
#   pointer to the next pref
class Node (models.Model):
	cycle = models.ForeignKey('Cycle', related_name='nodes')
	pref = models.ForeignKey('Course_preference', related_name='nodes')
	next = models.OneToOneField('Node', related_name='prev', null=True)
