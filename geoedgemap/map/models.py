# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Layerfiles(models.Model):
    id = models.AutoField(primary_key=True)
    layer_name = models.CharField(max_length=255, blank=True)
    layer_status = models.CharField(max_length=50)
    layer_descri = models.TextField(blank=True)
    layerfiles_status = models.IntegerField(default='0')
    layer_type = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    group_layerfiles_id = models.IntegerField(default='0')


def upload_to(instance, filename):
    return 'layers/{0}/{1}'.format(instance.layerfiles_id, filename)


class Layerfile_attachments(models.Model):
    layerfiles_id = models.IntegerField()
    file_name = models.CharField(max_length=100)
    attachment = models.FileField(upload_to=upload_to)
    created_at = models.DateTimeField(auto_now_add=True)


class Layer_column_name(models.Model):
    id = models.AutoField(primary_key=True)
    layer_id = models.IntegerField()
    table_name = models.CharField(max_length=255, blank=True)
    column_name = models.CharField(max_length=255, blank=True)
    column_status = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

class Layer_draw(models.Model):
    id = models.AutoField(primary_key=True)
    layer_name = models.CharField(max_length=255)
    layer_descri = models.TextField(blank=True)
    layer_status = models.CharField(max_length=50, blank=True)
    layerdraw_status = models.IntegerField(default='1')
    layer_file = models.CharField(max_length=100, blank=True)
    user_id = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    last_modifed_user = models.IntegerField(default='1')
    group_layer_draw_id = models.IntegerField(default='0')


class Layer_drawfile(models.Model):
    id = models.AutoField(primary_key=True)
    layer_draw_id = models.IntegerField(default='0')
    layer_name = models.CharField(max_length=255)
    layer_status = models.IntegerField(default='1')
    layerdrawfile_status = models.IntegerField(default='1')
    layer_file = models.CharField(max_length=100, blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layer_order = models.IntegerField(default='0')


class Groups(models.Model):
    id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=255, blank=True)
    group_status = models.CharField(max_length=50)
    group_descri = models.TextField(blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    profile_image = models.TextField(max_length=200, blank=True)

class Group_member(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField(blank=True)
    member = models.IntegerField(blank=True)
    superuser = models.IntegerField(blank=True)
    member_status = models.IntegerField(default='1')
    add_by_user = models.IntegerField(blank=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    last_modifed_user = models.IntegerField(default='0')
    first_superuser = models.IntegerField(default='0')


class Group_layerfiles(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField(blank=True)
    layer_name = models.CharField(max_length=255, blank=True)
    layer_status = models.CharField(max_length=50)
    layer_descri = models.TextField(blank=True)
    layerfiles_status = models.IntegerField(default='0')
    layer_type = models.CharField(max_length=50, blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layerfiles_id = models.IntegerField(default='0')


def group_upload_to(instance, filename):
    return 'groups_layer/{0}/{1}'.format(instance.layerfiles_id, filename)


class Group_layerfile_attachments(models.Model):
    group_layerfiles_id = models.IntegerField()
    file_name = models.CharField(max_length=100)
    attachment = models.FileField(upload_to=group_upload_to)
    created_at = models.DateTimeField(auto_now_add=True)


class Group_ayer_column_name(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField()
    table_name = models.CharField(max_length=255, blank=True)
    column_name = models.CharField(max_length=255, blank=True)
    column_status = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class Group_layer_draw(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField()
    layer_name = models.CharField(max_length=255)
    layer_descri = models.TextField(blank=True)
    layer_status = models.CharField(max_length=50, blank=True)
    layerdraw_status = models.IntegerField(default='1')
    layer_file = models.CharField(max_length=200, blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layer_draw_id = models.IntegerField(default='0')


class Group_layer_drawfile(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField()
    grouplayer_draw_id = models.IntegerField(default='0')
    layer_draw_id = models.IntegerField(default='0')
    layer_name = models.CharField(max_length=255)
    layer_status = models.IntegerField(default='1')
    layerdraw_status = models.IntegerField(default='1')
    layer_file = models.CharField(max_length=200, blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layer_order = models.IntegerField(default='0')

class Layer_maps(models.Model):
    id = models.AutoField(primary_key=True)
    map_type = models.CharField(max_length=50)
    layer_name = models.CharField(max_length=255)
    layer_descri = models.TextField(blank=True)
    layer_status = models.CharField(max_length=50, blank=True)
    layerdraw_status = models.IntegerField(default='1')
    data_frame = models.IntegerField(default='0')
    map_center = models.TextField(default='0,0')
    map_zoom = models.IntegerField(default='1')
    legend_status = models.IntegerField(default='0')
    legend = models.TextField(blank=True)
    title = models.IntegerField(default='0')
    north_arrow = models.IntegerField(default='0')
    scale = models.IntegerField(default='0')
    citation = models.IntegerField(default='0')
    grid_ref = models.IntegerField(default='0')
    tileLayer = models.CharField(max_length=255, default='OSM')
    insert_map = models.IntegerField(default='0')
    desc_status = models.IntegerField(default='0')
    user_id = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    last_modifed_user = models.IntegerField(default='1')
    group_layer_draw_id = models.IntegerField(default='0')


class Layer_mapfiles(models.Model):
    id = models.AutoField(primary_key=True)
    layer_draw_id = models.IntegerField(default='0')
    layer_name = models.CharField(max_length=255)
    layer_status = models.IntegerField(default='1')
    layerdrawfile_status = models.IntegerField(default='1')
    layer_file = models.CharField(max_length=100, blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layer_order = models.IntegerField(default='0')


class Group_layer_maps(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField()
    map_type = models.CharField(max_length=50)
    layer_name = models.CharField(max_length=255)
    layer_descri = models.TextField(blank=True)
    layer_status = models.CharField(max_length=50, blank=True)
    layerdraw_status = models.IntegerField(default='1')
    data_frame = models.IntegerField(default='0')
    map_center = models.TextField(default='0,0')
    map_zoom = models.IntegerField(default='1')
    legend_status = models.IntegerField(default='0')
    legend = models.TextField(blank=True)
    title = models.IntegerField(default='0')
    north_arrow = models.IntegerField(default='0')
    scale = models.IntegerField(default='0')
    citation = models.IntegerField(default='0')
    grid_ref = models.IntegerField(default='0')
    tileLayer = models.CharField(max_length=255, default='OSM')
    insert_map = models.IntegerField(default='0')
    desc_status = models.IntegerField(default='0')
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layer_draw_id = models.IntegerField(default='0')


class Group_layer_filemaps(models.Model):
    id = models.AutoField(primary_key=True)
    group_id = models.IntegerField()
    grouplayer_draw_id = models.IntegerField(default='0')
    layer_draw_id = models.IntegerField(default='0')
    layer_name = models.CharField(max_length=255)
    layer_status = models.IntegerField(default='1')
    layerdraw_status = models.IntegerField(default='1')
    layer_file = models.CharField(max_length=200, blank=True)
    user_id = models.IntegerField(default='1')
    last_modifed_user = models.IntegerField(default='1')
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    layer_order = models.IntegerField(default='0')