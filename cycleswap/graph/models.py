from django.db import models
from django.contrib.auth.models import User

class Student (models.Model):
	name = models.CharField(max_length=30)
	user = models.OneToOneField(User,related_name='student',blank=True,null=True)
	courses = models.ManyToManyField('Course', through='Course_preference', blank=True,null=True)
	
	def __unicode__(self):
		return self.name
	def jsonify(self):
		preferences = Course_preference.objects.filter(student=self).order_by('-rank')
		return {
			'name' : self.name,
			'courses' : [cp.jsonify() for cp in preferences]
		}
class Course (models.Model):
	name = models.CharField(max_length=10)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True)

	def __unicode__(self):
		return self.name + ": " + self.title
	def jsonify(self):
		return {
			'name' : self.name,
			'title' : self.title,
			'description' : self.description
		}
# Intermediary between Student and Class
# Keeps track of class preferences and ordering
class Course_preference (models.Model):
	student = models.ForeignKey('Student', related_name='preferences')
	course = models.ForeignKey('Course', related_name='preferences')
	registered = models.BooleanField()
	rank = models.IntegerField(blank=True,null=True)
	is_in_cycle = models.BooleanField(default=False)

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