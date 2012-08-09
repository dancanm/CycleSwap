from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'cycleswap.views.home', name='home'),
    # url(r'^cycleswap/', include('cycleswap.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'graph.views.welcome'),
    url(r'^register/', 'graph.views.register'),
    url(r'^log-in/', 'graph.views.log_in'),
    url(r'^log-out/', 'graph.views.log_out'),
    url(r'^save-courses-ajax/', 'graph.views.save_courses_ajax'),
    url(r'^get-user-courses-ajax/', 'graph.views.get_user_courses_ajax'),
    url(r'^get-course-list-ajax/', 'graph.views.get_course_list_ajax'),

)
