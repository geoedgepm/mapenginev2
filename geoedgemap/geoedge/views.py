# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import json
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from datetime import datetime, date

from django.shortcuts import render, redirect

from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from .tokens import account_activation_token
from django.core.mail import EmailMessage

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse, HttpResponseForbidden
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from .register_forms import RegisterForm
from map.models import Groups, Group_member, Group_layerfiles, Group_layer_draw

import urllib
import urllib2

def index(request):
    args = {'user': request.user}
    return render(request,'geoedge/main_content.html', args)

def special(request):
    return HttpResponse("You are logged in !")

def user_logout(request):
    aaib_taken = ''
    try:
        aaib_taken = request.session['access_token']
        del request.session['remember_me']
        del request.session['access_token']
    except:
        pass

    logout(request)
    # url = reverse('geoedge:login', kwargs={'access-token': aaib_taken})
    url = reverse('geoedge:login')
    return HttpResponseRedirect(url)


def user_login(request):
    access_token = request.GET.get('access-token')
    if access_token is None and request.method == 'GET':
        # return HttpResponseForbidden('403 Forbidden', content_type='text/html')
        return render(request, 'geoedge/login.html', {'access-token': access_token, 'error': 'Invaild token'})

    if access_token == '' and request.method == 'GET':
        # return HttpResponseForbidden('403 Forbidden', content_type='text/html')
        return render(request, 'geoedge/login.html', {'access-token': access_token, 'error': 'Invaild token'})

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        accessToken = request.POST.get('aaib_token')

        try:
            main_server = settings.AAIB_URL
            url = str(main_server) + 'api/api/user-map-engine&access-token=' + str(accessToken)
            values = {'access_token': accessToken}
            data = urllib.urlencode(values)
            req = urllib2.Request(url, data)
            response = urllib2.urlopen(req)
            result = json.load(response)

            if result['status'] != 1:
                return render(request, 'geoedge/login.html', {'access-token': accessToken, 'access_token': accessToken, 'error': 'Invalid login details given with AAIB'})

            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                request.session['remember_me'] = username
                request.session['access_token'] = accessToken
                settings.SESSION_EXPIRE_AT_BROWSER_CLOSE = True
                return HttpResponseRedirect(reverse('map:index'))

            return render(request, 'geoedge/login.html', {'access-token': accessToken, 'access_token': accessToken, 'error': 'Your account was inactive.'})

        except:
            return render(request, 'geoedge/login.html', {'access-token': accessToken, 'access_token': accessToken, 'error': 'Your token is invaild'})



    else:
        return render(request, 'geoedge/login.html', {'access-token': access_token, 'access_token': access_token})
    #
    #
    # if request.method == 'POST':
    #
    #     username = request.POST.get('username')
    #     password = request.POST.get('password')
    #     user = authenticate(username=username, password=password)
    #     if user:
    #         if user.is_active:
    #             login(request, user)
    #             request.session['remember_me'] = username
    #             # request.session.set_expiry(settings.LOGIN_SESSION_TIMEOUT)
    #             # print(request.session.get_expire_at_browser_close())
    #             settings.SESSION_EXPIRE_AT_BROWSER_CLOSE = True
    #             # return HttpResponseRedirect(reverse('geoedge:index'))
    #             return HttpResponseRedirect(reverse('map:index'))
    #         else:
    #             return render(request, 'geoedge/login.html', {'error': 'Your account was inactive.'})
    #     else:
    #         return render(request, 'geoedge/login.html',{'error': 'Invalid login details given'})
    # else:
    #     return render(request,'geoedge/login.html')


def register(request):
    template = 'geoedge/register.html'
    nowTime = datetime.now()


    if request.method == 'POST':
        reg_description = request.POST['description']
        form = RegisterForm(request.POST)
        if form.is_valid():
            if User.objects.filter(username=form.cleaned_data['username']).exists():
                return render(request, template, {
                    'form': form,
                    'error_message': 'Username already exists.'
                })
            elif User.objects.filter(email=form.cleaned_data['email']).exists():
                return render(request, template, {
                    'form': form,
                    'error_message': 'Email already exists.'
                })
            elif form.cleaned_data['password'] != form.cleaned_data['password_repeat']:
                return render(request, template, {
                    'form': form,
                    'error_message': 'Passwords do not match.'
                })
            else:
                # Create the user:
                user = User.objects.create_user(
                    form.cleaned_data['username'],
                    form.cleaned_data['email'],
                    form.cleaned_data['password']
                )

            if(request.user):
                by_user_id = request.user.pk
            else:
                by_user_id = 0

            user.is_active = False
            user.first_name = form.cleaned_data['first_name']
            user.last_name = form.cleaned_data['last_name']
            user.profile.user_descri = reg_description
            # user.photo = post_inpt['']
            user.profile.created_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            user.profile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            user.profile.by_user_id = by_user_id
            user.save()
            userId = user.pk

            # Store Photo
            try:
                photo = request.FILES['photo']
                ext = photo.name.split('.')[-1]
                photoName = 'profile_' + str(userId) + '.' + ext

                fs = FileSystemStorage()
                file_path = 'media/profile/' + photoName
                media_root = settings.MEDIA_ROOT
                full_filepath = os.path.abspath(os.path.join(os.path.dirname(media_root), file_path))
                filename = fs.save(full_filepath, photo)

                user.profile.profile_image = photoName
                user.profile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
                user.save()
            except:
                photoName = ''
            # /Store Photo

            # Send Email
            current_site = get_current_site(request)
            mail_subject = 'Activate your GeoEdgeMap account.'
            message = render_to_string('geoedge/acc_active_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })
            to_email = form.cleaned_data.get('email')
            email = EmailMessage(
                mail_subject, message, to=[to_email]
            )
            email.send()
            # /Send Email

            reform = RegisterForm()
            return render(request, template, {
                'success_message': 'Please confirm your email address to complete the registration',
                'form': reform
            })
    else:
        form = RegisterForm()
        return render(request, template, {'form': form})


def new_user(request):
    template = 'geoedge/create_user.html'
    nowTime = datetime.now()


    if request.method == 'POST':
        reg_description = request.POST['description']
        form = RegisterForm(request.POST)
        if form.is_valid():
            if User.objects.filter(username=form.cleaned_data['username']).exists():
                return render(request, template, {
                    'form': form,
                    'error_message': 'Username already exists.'
                })
            elif User.objects.filter(email=form.cleaned_data['email']).exists():
                return render(request, template, {
                    'form': form,
                    'error_message': 'Email already exists.'
                })
            elif form.cleaned_data['password'] != form.cleaned_data['password_repeat']:
                return render(request, template, {
                    'form': form,
                    'error_message': 'Passwords do not match.'
                })
            else:
                # Create the user:
                user = User.objects.create_user(
                    form.cleaned_data['username'],
                    form.cleaned_data['email'],
                    form.cleaned_data['password']
                )

            user.is_active = False
            user.first_name = form.cleaned_data['first_name']
            user.last_name = form.cleaned_data['last_name']
            user.profile.user_descri = reg_description
            # user.photo = post_inpt['']
            user.profile.created_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            user.profile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            user.profile.by_user_id = request.user.pk
            user.save()
            userId = user.pk

            # Store Photo
            try:
                photo = request.FILES['photo']
                ext = photo.name.split('.')[-1]
                photoName = 'profile_' + str(userId) + '.' + ext

                fs = FileSystemStorage()
                file_path = 'media/profile/' + photoName
                media_root = settings.MEDIA_ROOT
                full_filepath = os.path.abspath(os.path.join(os.path.dirname(media_root), file_path))
                filename = fs.save(full_filepath, photo)

                user.profile.profile_image = photoName
                user.profile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
                user.save()
            except:
                photoName = ''
            # /Store Photo

            # Send Email
            current_site = get_current_site(request)
            mail_subject = 'Activate your GeoEdgeMap account.'
            message = render_to_string('geoedge/acc_active_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })
            to_email = form.cleaned_data.get('email')
            email = EmailMessage(
                mail_subject, message, to=[to_email]
            )
            email.send()
            # /Send Email

            reform = RegisterForm()
            return render(request, template, {
                'success_message': 'Please confirm your email address to complete the registration',
                'form': reform
            })
    else:
        form = RegisterForm()
        return render(request, template, {'form': form})


def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        return redirect('login', {
            'success_message': 'Thank you for your email confirmation. Now you can login your account.',
        })
    else:
        return HttpResponse('Activation link is invalid!')


def video(request):
    args = {}
    return render(request, 'geoedge/video.html', args)

def profile(request):
    return render(request, 'geoedge/profile.html')


@csrf_exempt
def user_data(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        userList = []
        start_row = (int(n_page) - 1) * int(n_rows)
        end_row = int(n_page) * int(n_rows)

        if (len(request.POST) == 3):
            user_count = User.objects.filter(first_name__contains=request.POST['search']).count()
            users = User.objects.filter(first_name__contains=request.POST['search']).order_by('date_joined')[start_row:end_row]
        else:
            user_count = User.objects.count()
            users = User.objects.order_by('date_joined')[start_row:end_row]

        if len(users) > 0:
            for user in users:

                row = {'id': user.pk, 'first_name': user.first_name, 'last_name': user.last_name, 'username':user.username, 'email':user.email, 'user_status':user.is_active, 'created_date': user.date_joined}
                userList.append(row)

            response = {'total': user_count, 'rows': userList}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')

@csrf_exempt
def user_data_update(request):
    if request.method == "POST":
        postData = request.POST

        nowTime = datetime.now()

        id = postData['id']
        first_name = postData['first_name']
        last_name = postData['last_name']
        user_status = postData['user_status']
        # updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")

        user = User.objects.get(pk=int(id))

        user.first_name = first_name
        user.last_name = last_name
        user.user_status = 1
        # user.date_joined = updated_at
        user.save()

        response = {'status': 1}

        return JsonResponse(response, content_type='json')


@csrf_exempt
def user_update(request):
    if request.method == "POST":
        postData = request.POST

        nowTime = datetime.now()

        current_user = request.user
        first_name = postData['e_fname']
        last_name = postData['e_lname']
        password = postData['e_password']
        desc = postData['e_desc']
        # updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")

        user = User.objects.get(pk=current_user.pk)

        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.profile.user_descri = desc
        user.profile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
        user.save()

        # Store Photo ) or Replace
        try:
            photo = request.FILES['e_photo']
            ext = photo.name.split('.')[-1]
            photoName = 'profile_' + str(user.pk) + '.' + ext

            fs = FileSystemStorage()
            file_path = 'media/profile/' + photoName
            media_root = settings.MEDIA_ROOT
            full_filepath = os.path.abspath(os.path.join(os.path.dirname(media_root), file_path))
            filename = fs.save(full_filepath, photo)

            user.profile.profile_image = photoName
            user.profile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            user.save()
        except:
            photoName = ''
        # /Store Photo or Replace

        update_session_auth_hash(request, user)

        response = {'status': 1}
        return JsonResponse(response, content_type='json')

def group(request, gid=None, *args, **kwargs):

    if (gid is not None and gid > 0):
        current_user = request.user
        accessStatus = False

        memberStatus = Group_member.objects.filter(group_id=gid, member=current_user.pk)

        if len(memberStatus) > 0:
            for member_status in memberStatus:
                if(member_status.superuser == 1):
                    accessStatus = True

            group = Groups.objects.get(pk=gid)
            member_count = Group_member.objects.filter(group_id=gid, member_status=1).count()

            mapCount = Group_layerfiles.objects.filter(group_id=gid, layerfiles_status=1).count()
            layersCount = Group_layer_draw.objects.filter(group_id=gid, layerdraw_status=1).count()

            return render(request, 'geoedge/main_content_group.html', {
                'user': request.user,
                'group': group,
                'memberCount': member_count,
                'accessAllow': accessStatus,
                'mapCount': mapCount,
                'layersCount': layersCount,
            })
        else:
            return redirect('/geoedgepro/')

    else:
        return redirect('/geoedgepro/')


@csrf_exempt
def member_list(request, gid=None, *args, **kwargs):
    userList = []
    memberArr = []

    members = Group_member.objects.filter(group_id=int(gid))

    for member in members:
        memberArr.append(member.member)

    users = User.objects.filter(is_active=True).order_by('first_name')
    for user in users:
        if(user.first_name != '' and user.last_name !=''):
            if user.pk in memberArr:
                userRow = {'id': user.pk, 'name': user.first_name + ' ' + user.last_name, 'username': user.username}
            #    Not add to list
            else:
                userRow = {'id':user.pk, 'name': user.first_name+' '+user.last_name, 'username':user.username}
                userList.append(userRow)

    response = {'user_list': userList}
    return JsonResponse(response, content_type='json')
