from django.contrib import admin
from .models import Layerfiles, upload_to, Layerfile_attachments, Layer_column_name, Layer_draw, Layer_drawfile, Groups, Group_member, Group_layerfiles, group_upload_to, Group_layerfile_attachments, Group_ayer_column_name, Group_layer_draw, Group_layer_drawfile, Layer_maps, Layer_mapfiles, Group_layer_maps, Group_layer_filemaps

admin.site.register(Layerfiles)
# admin.site.register(upload_to)
admin.site.register(Layerfile_attachments)
admin.site.register(Layer_column_name)
admin.site.register(Layer_draw)
admin.site.register(Layer_drawfile)
admin.site.register(Groups)
admin.site.register(Group_member)
admin.site.register(Group_layerfiles)
#admin.site.register(group_upload_to)
admin.site.register(Group_layerfile_attachments)
admin.site.register(Group_ayer_column_name)
admin.site.register(Group_layer_draw)
admin.site.register(Group_layer_drawfile)
admin.site.register(Layer_maps)
admin.site.register(Layer_mapfiles)
admin.site.register(Group_layer_maps)
admin.site.register(Group_layer_filemaps)

