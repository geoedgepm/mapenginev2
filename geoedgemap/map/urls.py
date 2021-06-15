from django.urls import include, path
from django.conf.urls import url

from . import views

app_name = 'map'
urlpatterns = [
    path('', views.index, name='index'),
    url('group/(?P<gid>[\w-]+)/$', views.index_group, name='index_group'),
    url('group/(?P<gid>[\w-]+)$', views.index_group, name='index_group'),
    url('view/(?P<map>[\w-]+)/(?P<gid>[\w-]+)$', views.map_view, name='map_view'),
    url('(?P<map>[\w-]+)/(?P<layer_type>[\w-]+)$', views.get_layer_data, name='get_layer_data'),
    url('group/(?P<gid>[\w-]+)/(?P<map>[\w-]+)/(?P<layer_type>[\w-]+)$', views.get_group_data, name='get_group_data'),
    url('post_layers/$', views.add_layer_file, name='post_layer_file'),
    url('post_upload/(?P<layer_id>[\w-]+)/$', views.upload_layer_files, name='post_upload'),
    url('load_layer_files/(?P<layerId>[\w-]+)/(?P<groupId>[\w-]+)/$', views.load_layer_files,
        name='load_layer_files'),
    url('layer_data/(?P<layer_id>[\w-]+)/(?P<groupId>[\w-]+)/$', views.layer_data, name='layer_data'),
	url('aaib_layer_data/(?P<layer_id>[\w-]+)/$', views.aaib_layer_data, name='aaib_layer_data'),
    url('layersdata/(?P<layerId>[\w-]+)/(?P<groupId>[\w-]+)/$', views.layers_data, name='layers_data'),
    url('mapsdata/(?P<layerId>[\w-]+)/(?P<groupId>[\w-]+)/$', views.map_data, name='map_data'),
    url('get_legends/(?P<mapID>[\w-]+)/(?P<groupId>[\w-]+)/$', views.map_get_legends, name='map_get_legends'),
    url('map_count/$', views.map_count, name='map_count'),
    url('map_group_count/(?P<groupId>[\w-]+)/$', views.map_group_count, name='map_group_count'),
    url('lastest_map/(?P<groupId>[\w-]+)/$', views.lastest_map, name='lastest_map'),
    url('lastest_news/(?P<groupId>[\w-]+)/$', views.lastest_News, name='lastest_news'),
    url('lastest_layer_data/(?P<groupId>[\w-]+)/$', views.get_lastest_layer_data, name='lastest_layer_data'),
    url('save_as_layers/$', views.save_as_new_drawing, name='save_as_layers'),
    url('save_layers_file/$', views.save_drawing_file, name='save_drawing_file'),
    url('save_as_map/$', views.save_as_map, name='save_as_map'),
    url('save_map_file/$', views.save_map_file, name='save_map_file'),
    url('save_layers/$', views.save_new_drawing, name='save_layers'),
    url('search_layers_list/(?P<layer_status_type>[\w-]+)/$', views.search_layers_list, name='search_layers_list'),
    url('search_public_layers_list/(?P<layer_status_type>[\w-]+)/$', views.search_public_layers_list, name='search_public_layers_list'),
    url('search_group_layers_list/(?P<layer_status_type>[\w-]+)/(?P<gid>[\w-]+)/$', views.search_group_layers_list, name='search_grouplayers_list'),
    url('searchbox_layers_list/(?P<gid>[\w-]+)/$', views.searchbox_layers_list, name='searchbox_layers_list'),
    url('save_as_map/$', views.save_as_map, name='save_as_map'),
    url('save_map_file/$', views.save_map_file, name='save_map_file'),
    url('save_layers/$', views.save_new_drawing, name='save_layers'),
    url('search_layers_list/(?P<layer_status_type>[\w-]+)/$', views.search_layers_list, name='search_layers_list'),
    url('search_group_layers_list/(?P<layer_status_type>[\w-]+)/(?P<gid>[\w-]+)/$', views.search_group_layers_list,
        name='search_grouplayers_list'),
    url('searchbox_layers_list/(?P<gid>[\w-]+)/$', views.searchbox_layers_list, name='searchbox_layers_list'),
    url('share_map/(?P<map>[\w-]+)/(?P<layer_type>[\w-]+)$', views.share_layer_data, name='share_layer_data'),
    url('my_map_data/$', views.my_map_data, name='my_map_data'),
    url('my_map_data_all/$', views.my_map_data_all, name='my_map_data_all'),
    url('data_update/$', views.data_update, name='data_update'),
    url('my_layer_data/$', views.my_layer_data, name='my_layer_data'),
    url('all_map_data/$', views.all_map_data, name='all_map_data'),
    url('all_layer_data/$', views.all_layer_data, name='all_layer_data'),
    url('my_group/$', views.my_group, name='my_group'),
    url('all_group/$', views.all_group, name='all_group'),
    url('data_delete/$', views.data_delete, name='data_delete'),
    url('add_group/$', views.add_group, name='add_group'),
    url('group_maps/(?P<gid>[\w-]+)/$', views.group_maps, name='group_maps'),
    url('group_layers/(?P<gid>[\w-]+)/$', views.group_layers, name='group_layers'),
    url('group_members/(?P<gid>[\w-]+)/$', views.group_members, name='group_members'),
    url('^group_update/$', views.group_update, name='group_update'),
    url('add_member/$', views.add_member, name='add_member'),
    url('superuser_update/$', views.superuser_update, name='superuser_update'),
    url('download_shp/$', views.download_shp, name='download_shp'),
    url('remove_downloaded/$', views.remove_downloaded, name='remove_downloaded'),
    url('get_layer_details/(?P<layerId>[\w-]+)/(?P<layerType>[\w-]+)/$', views.get_layer_details,
        name='get_layer_details'),
    url('remove_file/$', views.remove_file, name='remove_file'),
    url('province/$', views.province, name='province'),
    url('district/(?P<province>[\w-]+)/$', views.district, name='district'),
    url('asc/(?P<district>[\w-]+)/$', views.asc, name='asc'),
    url('ds/(?P<province>[\w-]+)/(?P<district>[\w-]+)/$', views.ds, name='ds'),
    url('gn/(?P<province>[\w-]+)/(?P<district>[\w-]+)/(?P<ds>[\w-]+)/$', views.gn, name='gn'),
    url('aaib_section/$', views.aaib_section, name='aaib_section'),
    url('aaib_polygon/$', views.aaib_polygon, name='aaib_polygon'),
    url('aaib_data/$', views.aaib_data, name='aaib_data'),
    url('aaib_one_polygon/$', views.aaib_one_polygon, name='aaib_one_polygon'),
]
