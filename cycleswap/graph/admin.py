from django.contrib import admin
from graph.models import Student
from graph.models import Course
from graph.models import Course_preference

admin.site.register(Student)
admin.site.register(Course)
admin.site.register(Course_preference)
