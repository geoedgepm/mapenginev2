from django.urls import path
from . import views


app_name = 'geoedge'
urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.user_login, name='login'),
    path('new_user/', views.new_user, name='new_user'),
    path('video/', views.video, name='video'),
    path('register/', views.register, name='register'),
    path('new_user/', views.new_user, name='new_user'),
    path('activate/<uidb64>/<token>/', views.activate,
         name='activate'),
    path('profile/', views.profile, name='profile'),
    path('user_data/', views.user_data, name='user_data'),
    path('user_data_update/', views.user_data_update, name='user_data_update'),
    path('user_update/', views.user_update, name='user_update'),
    path('group/<gid>/', views.group, name='group'),
    path('member_list/<gid>/', views.member_list, name='member_list'),
]
