from django.conf.urls import include, url
from . import views

app_name = 'geoedge'
urlpatterns = [
    url(r'^$',views.index,name='index'),
    url(r'^login/$',views.user_login,name='login'),
    url(r'^video/$',views.video,name='video'),
    url(r'^register/$',views.register,name='register'),
    url(r'^new_user/$',views.new_user,name='new_user'),
    url(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', views.activate, name='activate'),
    url(r'^profile/$',views.profile,name='profile'),
    url(r'^user_data/$', views.user_data, name='user_data'),
    url(r'^user_data_update/$', views.user_data_update, name='user_data_update'),
    url(r'^user_update/$', views.user_update, name='user_update'),
    url(r'^group/(?P<gid>[\w-]+)/$',views.group,name='group'),
    url(r'^member_list/(?P<gid>[\w-]+)/$', views.member_list, name='member_list'),

]