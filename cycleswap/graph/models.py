from django.db import models
from django.contrib.auth.models import User

class Student (models.Model):
	name = models.CharField(max_length=30)
	user = models.OneToOneField(User,blank=True,null=True)
	courses = models.ManyToManyField('Course', through='Course_preference',blank=True,null=True)

	def __unicode__(self):
		return self.name

class Course (models.Model):
	name = models.CharField(max_length=10)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True)

	def __unicode__(self):
		return self.name + ": " + self.title

# Intermediary between Student and Class
# Keeps track of class preferences and ordering
class Course_preference (models.Model):
	student = models.ForeignKey('Student', related_name='preferences')
	course = models.ForeignKey('Course', related_name='preferences')
	registered = models.BooleanField()
	utility = models.IntegerField(blank=True,null=True)

	def __unicode__(self):
		return self.student.__unicode__() + " -> " + self.course.__unicode__()