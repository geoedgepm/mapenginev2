from datetime import datetime
import os
import glob
import subprocess
import json
import shutil

from osgeo import ogr, osr

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db.models import Q
from django.contrib.auth.models import User
from django.db import connection

from django.core.files.storage import FileSystemStorage

from .models import Layerfiles, Layerfile_attachments, Layer_column_name, Layer_draw, Groups, Group_member, \
    Group_layerfiles, Group_layerfile_attachments, Group_ayer_column_name, Group_layer_draw, Layer_drawfile, \
    Group_layer_drawfile, Layer_maps, Layer_mapfiles, Group_layer_maps, Group_layer_filemaps


def index(request):
    return render(request, 'map/index.html')


def print_map(request):
    return render(request, 'map/print_map.html')


def share_map(request):
    return render(request, 'map/share_map.html')


def index_group(request, gid=None, *args, **kwargs):
    if gid is not None:
        current_user = request.user
        accessStatus = False
        memberStatus = Group_member.objects.filter(
            group_id=gid, member=current_user.pk)

        if len(memberStatus) > 0:
            for member_status in memberStatus:
                if(member_status.superuser == 1):
                    accessStatus = True

            return render(request, 'map/index.html', {
                'gid': gid,
                'accessAllow': accessStatus
            })

        else:
            return redirect('/map/')


@csrf_exempt
def add_layer_file(request):
    if request.method == "POST":
        layer_name = request.POST['layer_name']
        layer_status = request.POST['layer_status']
        layer_descri = request.POST['layer_descri']
        groupID = request.POST['group_id']

        current_user = request.user
        nowTime = datetime.now()

        if(layer_name != '' and layer_status != ''):

            post_layerfile = Layerfiles(
                layer_name=layer_name,
                layer_status=layer_status,
                layer_descri=layer_descri,
                layerfiles_status=0,
                user_id=current_user.pk,
                created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
            )
            post_layerfile.save()
            layerfileId = post_layerfile.pk

            # For Group
            if groupID != '':

                if groupID is not None and groupID > 0:

                    post_group_layerfile = Group_layerfiles(
                        group_id=groupID,
                        layer_name=layer_name,
                        layer_status=layer_status,
                        layer_descri=layer_descri,
                        layerfiles_status=0,
                        layerfiles_id=layerfileId,
                        user_id=current_user.pk,
                        last_modifed_user=current_user.pk,
                        created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                        updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                    )
                    post_group_layerfile.save()
                    group_layerfileId = post_group_layerfile.pk

                    post_layerfile.group_layerfiles_id = group_layerfileId
                    post_layerfile.save()

            # /For Group

            response = {'status': 1, 'layerfileID': layerfileId,
                        'message': 'Succssfully added'}
            return JsonResponse(response)
        else:
            response = {'status': 0, 'error': 'Field required'}
            return JsonResponse(response)
    else:
        response = {'status': 0, 'error': 'Try Again'}
        return JsonResponse(response)


@csrf_exempt
def upload_layer_files(request, layer_id=None, *args, **kwargs):
    if request.method == "POST":
        files = request.FILES.getlist('files[]')

        if (layer_id != None and files is not None):

            file_ext = ['shp', 'dbf', 'prj', 'shx', 'kml', 'json']

            for file in files:
                # print("fileName :" + file.name)
                filetype = file.name.split('.')[-1]

                if filetype in file_ext:

                    nowTime = datetime.now()

                    instance = Layerfile_attachments(
                        layerfiles_id=layer_id,
                        file_name=file.name,
                        attachment=file,
                        created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                    )

                    instance.save()

                else:
                    response = {'status': 0}
                    return JsonResponse(response)

        response = {'status': 1, 'layerID': layer_id}
        return JsonResponse(response)
    else:
        response = {'status': 0}
        return JsonResponse(response)


def esriprj2standards(shapeprj_path):

    prj_file = open(shapeprj_path, 'r')
    prj_txt = prj_file.read()
    srs = osr.SpatialReference()
    srs.ImportFromESRI([prj_txt])
    srs.AutoIdentifyEPSG()
    epsg = srs.GetAuthorityCode(None)
    return epsg


def repjoction_shpfile(path, prj_epsg, shp_file):
    # sub string - file name
    shp_name = shp_file[0:-4]

    driver = ogr.GetDriverByName('ESRI Shapefile')

    # input SpatialReference
    inSpatialRef = osr.SpatialReference()
    inSpatialRef.ImportFromEPSG(int(prj_epsg))

    # output SpatialReference
    outSpatialRef = osr.SpatialReference()
    outSpatialRef.ImportFromEPSG(4326)

    # create the CoordinateTransformation
    coordTrans = osr.CoordinateTransformation(inSpatialRef, outSpatialRef)

    # get the input layer
    inDataSet = driver.Open(r'' + path + '/' + shp_name + '.shp')
    inLayer = inDataSet.GetLayer()

    # create the output layer
    outputShapefile = r'' + path + '/rep_' + shp_name + '.shp'
    if os.path.exists(outputShapefile):
        driver.DeleteDataSource(outputShapefile)

    outDataSet = driver.CreateDataSource(outputShapefile)
    outLayer = outDataSet.CreateLayer(
        "rep_" + shp_name, geom_type=ogr.wkbMultiPolygon)

    # add fields
    inLayerDefn = inLayer.GetLayerDefn()
    for i in range(0, inLayerDefn.GetFieldCount()):
        fieldDefn = inLayerDefn.GetFieldDefn(i)
        outLayer.CreateField(fieldDefn)

    # get the output layer's feature definition
    outLayerDefn = outLayer.GetLayerDefn()

    # loop through the input features
    inFeature = inLayer.GetNextFeature()

    while inFeature:
        # get the input geometry
        geom = inFeature.GetGeometryRef()
        # reproject the geometry
        geom.Transform(coordTrans)
        # create a new feature
        outFeature = ogr.Feature(outLayerDefn)
        # set the geometry and attribute
        outFeature.SetGeometry(geom)
        for i in range(0, outLayerDefn.GetFieldCount()):
            outFeature.SetField(outLayerDefn.GetFieldDefn(
                i).GetNameRef(), inFeature.GetField(i))
        # add the feature to the shapefile
        outLayer.CreateFeature(outFeature)
        # dereference the features and get the next input feature
        outFeature = None
        inFeature = inLayer.GetNextFeature()

    # Save and close the shapefiles
    inDataSet = None
    outDataSet = None

    reproject_fileName = "rep_" + shp_name

    return reproject_fileName


def create_prj(file_path):
    spatialRef = osr.SpatialReference()
    spatialRef.ImportFromEPSG(4326)
    spatialRef.MorphToESRI()
    file = open(file_path, 'w')
    file.write(spatialRef.ExportToWkt())
    file.close()

    return True


def load_layer_files(request, layerId=None, groupId=None, *args, **kwargs):
    if layerId != None:
        media_root = settings.MEDIA_ROOT
        file_count = 0
        kml_file_count = 0
        json_file_count = 0
        file_type = ''
        layer_file = ''
        shp_file = ''
        prj_file = ''
        kml_file = ''
        json_file = ''
        fileName = ''
        fullpath = os.path.abspath(os.path.join(os.path.dirname(
            media_root), 'media/layers/' + str(layerId) + '/'))

        if os.path.exists(fullpath) == True:

            for file in os.listdir(fullpath):
                if file.endswith(".dbf"):
                    file_count += 1

                if file.endswith(".prj"):
                    prj_file = file
                    file_count += 1

                if file.endswith(".shx"):
                    file_count += 1

                if file.endswith(".shp"):
                    shp_file = file
                    file_count += 1
                    file_type = 'SHP'

                if file.endswith(".kml"):
                    kml_file = file
                    kml_file_count += 1
                    file_type = 'KML'

                if file.endswith(".json"):
                    json_file = file
                    json_file_count += 1
                    file_type = 'JSON'

            if (file_count == 4 and shp_file != '' and file_type == 'SHP' and prj_file != ''):

                getLayer = Layerfiles.objects.get(pk=layerId)
                new_table_name = 'z_layer_' + \
                    str(layerId) + '_' + file_type.lower()
                final_shp_path = os.path.abspath(
                    os.path.join(fullpath, shp_file))
                final_prj_path = os.path.abspath(
                    os.path.join(fullpath, prj_file))

                # [START] - Reproject
                old_shpfile = ''
                prj_epsg = esriprj2standards(final_prj_path)

                if str(prj_epsg) != '4326':

                    shp_name = shp_file[0:-4]
                    old_shpfile = shp_name
                    rep_shpfile = 'rep_' + shp_name + '.shp'
                    reprojectPath = r'' + fullpath + '/' + rep_shpfile

                    shell = 'ogr2ogr -t_srs EPSG:4326 ' + reprojectPath + ' ' + final_shp_path + ''
                    subprocess.call(shell, shell=True)

                    # [START] - Remove old files
                    remove_filePath = r'' + fullpath + '/' + old_shpfile+'.*'
                    fileList = glob.glob(remove_filePath)
                    for filePath in fileList:
                        os.remove(filePath)
                    # [END] - Remove old files

                    shp_path = reprojectPath
                    shp_file = rep_shpfile

                else:
                    shp_path = final_shp_path
                    shp_file = shp_file

                # [END] - Reproject

                # [START] - Get column name from file & Insert to Table

                source = ogr.Open(shp_path)
                layer = source.GetLayer()

                columns = []
                ldefn = layer.GetLayerDefn()
                for n in range(ldefn.GetFieldCount()):
                    fdefn = ldefn.GetFieldDefn(n)
                    columnsName = Layer_column_name(
                        layer_id=layerId,
                        table_name=new_table_name,
                        column_name=fdefn.name,
                        column_status=1
                    )
                    columnsName.save()

                    columns.append(fdefn.name)

                shell = 'shp2pgsql -I -s 4326 ' + shp_path + ' public.' + new_table_name + \
                    ' | psql -U my_geoedge_user -d my_geoedge_map -h localhost'
                subprocess.run(shell, shell=True)

                # [END] - Get column name from file & Insert to Table

                getLayer.layerfiles_status = 1
                getLayer.layer_type = file_type
                getLayer.save()

                layerName = getLayer.layer_name

                # For Group
                if int(groupId) > 0:
                    group_layer = Group_layerfiles.objects.get(
                        group_id=groupId, layerfiles_id=layerId)
                    group_layer.layer_type = file_type
                    group_layer.layerfiles_status = 1
                    group_layer.save()

                    layerName = group_layer.layer_name
                # /For Group

                isExistGroup = Group_layerfiles.objects.filter(
                    layerfiles_id=layerId).exists()
                if (isExistGroup):
                    getGroup = Group_layerfiles.objects.get(
                        layerfiles_id=layerId)
                    getGroup.layerfiles_status = 1
                    getGroup.save()

                layer_file = shp_file

            elif (kml_file_count == 1 and kml_file != '' and file_type == 'KML'):

                getkml = Layerfiles.objects.get(pk=layerId)
                getkml.layerfiles_status = 1
                getkml.layer_type = file_type
                getkml.save()
                layerName = getkml.layer_name

                # For Group
                if int(groupId) > 0:
                    group_layer = Group_layerfiles.objects.get(
                        group_id=groupId, layerfiles_id=layerId)
                    group_layer.layer_type = file_type
                    group_layer.layerfiles_status = 1
                    group_layer.save()

                    layerName = group_layer.layer_name
                # /For Group

                layer_file = kml_file

            elif (json_file_count == 1 and json_file != '' and file_type == 'JSON'):

                getJson = Layerfiles.objects.get(pk=layerId)
                getJson.layerfiles_status = 1
                getJson.layer_type = file_type
                getJson.save()
                layerName = getJson.layer_name

                # For Group
                if int(groupId) > 0:
                    group_layer = Group_layerfiles.objects.get(
                        group_id=groupId, layerfiles_id=layerId)
                    group_layer.layer_type = file_type
                    group_layer.layerfiles_status = 1
                    group_layer.save()

                    layerName = group_layer.layer_name
                # /For Group

                layer_file = json_file

            response = {'status': 1, 'layer_type': file_type,
                        'layer_file': layer_file, 'layer_name': layerName}
            return JsonResponse(response)

        else:

            response = {'status': 0, 'layer_type': '',
                        'error': 'Not file or directory exist', 'layer_file': '', 'layer_name': ''}
            return JsonResponse(response)

    else:

        response = {'status': 0, 'layer_type': '',
                    'error': 'Layer ID is invaild.', 'layer_file': '', 'layer_name': ''}
        return JsonResponse(response)


def layer_data(request, layer_id=None, groupId=None, *args, **kwargs):

    current_user = request.user
    nowTime = datetime.now()
    dateTime = nowTime.strftime("%Y%m%d%H%M")

    media_root = settings.MEDIA_ROOT
    fullpath = os.path.abspath(os.path.join(
        os.path.dirname(media_root), 'media/loading/'))
    geojson_file = str(dateTime)+'_'+str(current_user.pk) + \
        '_'+str(layer_id)+'.json'
    table_name = 'z_layer_'+str(layer_id)+'_shp'
    geojsonPath = r'' + fullpath + '/' + geojson_file

    shell = 'ogr2ogr -f GeoJSON -t_srs EPSG:4326 ' + geojsonPath + \
        ' "PG:dbname=my_geoedge_map user=my_geoedge_user host=localhost" -sql "select * from public.' + table_name + '"'
    subprocess.run(shell, shell=True)

    file_exists = os.path.isfile(geojsonPath)

    if file_exists:
        response = {'status': 1, 'geojson_file': geojson_file,
                    'file_path': 'media/loading/'}
    else:
        response = {'status': 0, 'geojson_file': '', 'file_path': ''}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def remove_file(request):
    if request.method == "POST":
        fileDir = request.POST['fileDir']
        file = request.POST['filename']

        media_root = settings.MEDIA_ROOT
        fullpath = os.path.abspath(os.path.join(
            os.path.dirname(media_root), fileDir))
        filePath = r'' + fullpath + '/' + file

        file_exists = os.path.isfile(filePath)
        if file_exists:
            fileList = glob.glob(filePath)
            for file in fileList:
                os.remove(file)

            response = {'status': 1}

        else:
            response = {'status': 0}

    else:
        response = {'status': 0}

    return JsonResponse(response, content_type='json')


def map_count(request):

    current_user = request.user
    if current_user.is_active:

        map_count = Layerfiles.objects.filter(
            layerfiles_status=1, user_id=current_user.pk).count()
        layer_count = Layer_draw.objects.filter(
            layerdraw_status=1, user_id=current_user.pk).count()

        response = {'status': 1, 'map_count': map_count,
                    'layer_count': layer_count}
        return JsonResponse(response, content_type='json')


def map_group_count(request, groupId=None,):

    if int(groupId) > 0:

        map_count = Group_layerfiles.objects.filter(
            group_id=groupId, layerfiles_status=1).count()
        layer_count = Group_layer_draw.objects.filter(
            group_id=groupId, layerdraw_status=1).count()

        response = {'status': 1, 'map_count': map_count,
                    'layer_count': layer_count}
        return JsonResponse(response, content_type='json')


def lastest_map(request, groupId=None, *args, **kwargs):
    current_user = request.user
    if current_user.is_active:
        map_layer = Layerfiles.objects.filter(Q(user_id=current_user.pk) | Q(
            layer_status='public')).order_by('-updated_at')[0:25]
        draw_layer = Layer_draw.objects.filter(Q(user_id=current_user.pk) | Q(
            layer_status='public')).order_by('-updated_at')[0:25]

        lastestMaps_tuples = []
        nowTime = datetime.now().replace(tzinfo=None)
        nowTime = nowTime.replace(microsecond=0)

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                if mapLayer.layerfiles_status == 1:

                    lastTime = mapLayer.updated_at.replace(tzinfo=None)
                    diff = nowTime - lastTime
                    day = diff.days
                    seconds = diff.seconds
                    tot_seconds = seconds + day*(24*3600)
                    link = '/map/'+str(mapLayer.pk)+'/map'

                    lastestMaps_tuples.append(
                        (tot_seconds, mapLayer.pk, mapLayer.layer_name, 'map', link))

        if len(draw_layer) > 0:
            for drawLayer in draw_layer:
                if drawLayer.layerdraw_status == 1:
                    lastTime = drawLayer.updated_at
                    diff = nowTime - lastTime
                    day = diff.days
                    seconds = diff.seconds
                    tot_seconds = seconds + day * (24 * 3600)
                    link = '/map/' + str(drawLayer.pk) + '/layer'

                    lastestMaps_tuples.append(
                        (tot_seconds, drawLayer.pk, drawLayer.layer_name, 'layer', link))

        if (int(groupId) > 0):
            mapgroup_layer = Group_layerfiles.objects.filter(
                Q(group_id=groupId) | Q(layer_status='public')).order_by('-updated_at')[0:25]
            drawgroup_layer = Group_layer_draw.objects.filter(
                Q(group_id=groupId) | Q(layer_status='public')).order_by('-updated_at')[0:25]

            if len(mapgroup_layer) > 0:
                for mapgrouplayer in mapgroup_layer:
                    if mapgrouplayer.layerfiles_status == 1 and mapgrouplayer.user_id != current_user.pk:

                        lastTime = mapgrouplayer.updated_at
                        diff = nowTime - lastTime
                        day = diff.days
                        seconds = diff.seconds
                        tot_seconds = seconds + day * (24 * 3600)
                        link = '/map/group/' + \
                            str(mapgrouplayer.group_id) + \
                            '/' + str(mapLayer.pk) + '/map'

                        lastestMaps_tuples.append(
                            (tot_seconds, mapgrouplayer.pk, mapgrouplayer.layer_name, 'map', link))

            if len(drawgroup_layer) > 0:
                for drawgroupLayer in drawgroup_layer:
                    if drawgroupLayer.layerdraw_status == 1 and drawgroupLayer.user_id != current_user.pk:
                        lastTime = drawgroupLayer.updated_at
                        diff = nowTime - lastTime
                        day = diff.days
                        seconds = diff.seconds
                        tot_seconds = seconds + day * (24 * 3600)
                        link = '/map/group/' + \
                            str(drawgroupLayer.group_id) + '/' + \
                            str(drawgroupLayer.pk) + '/layer'

                        lastestMaps_tuples.append(
                            (tot_seconds, drawgroupLayer.pk, drawgroupLayer.layer_name, 'layer', link))

        lastestMaps_short = sorted(
            lastestMaps_tuples, key=lambda lastestMaps: lastestMaps[0])
        response = {'status': 1, 'lastestMaps': lastestMaps_short}
        return JsonResponse(response, content_type='json')


def lastest_News(request, groupId=None, *args, **kwargs):
    current_user = request.user
    if current_user.is_active:
        map_layer = Layerfiles.objects.filter(Q(user_id=current_user.pk) | Q(
            layer_status='public')).order_by('-updated_at')[0:25]
        draw_layer = Layer_draw.objects.filter(Q(user_id=current_user.pk) | Q(
            layer_status='public')).order_by('-updated_at')[0:25]

        lastestNews_tuples = []
        nowTime = datetime.now().replace(tzinfo=None)

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                if mapLayer.layerfiles_status == 1 and mapLayer.layer_descri != '':
                    lastTime = mapLayer.updated_at.replace(tzinfo=None)
                    diff = nowTime - lastTime
                    day = diff.days
                    seconds = diff.seconds
                    tot_seconds = seconds + day * (24 * 3600)
                    link = '/map/' + str(mapLayer.pk) + '/map'

                    lastestNews_tuples.append(
                        (tot_seconds, mapLayer.pk, mapLayer.layer_name, 'map', mapLayer.layer_descri, link))

        if len(draw_layer) > 0:
            for drawLayer in draw_layer:
                if drawLayer.layerdraw_status == 1 and drawLayer.layer_descri != '':
                    lastTime = mapLayer.updated_at.replace(tzinfo=None)
                    diff = nowTime - lastTime
                    day = diff.days
                    seconds = diff.seconds
                    tot_seconds = seconds + day * (24 * 3600)
                    link = '/map/' + str(drawLayer.pk) + '/layer'

                    lastestNews_tuples.append(
                        (tot_seconds, drawLayer.pk, drawLayer.layer_name, 'layer', drawLayer.layer_descri, link))

        if (int(groupId) > 0):
            mapgroup_layer = Group_layerfiles.objects.filter(
                Q(group_id=groupId) | Q(layer_status='public')).order_by('-updated_at')[0:25]
            drawgroup_layer = Group_layer_draw.objects.filter(
                Q(group_id=groupId) | Q(layer_status='public')).order_by('-updated_at')[0:25]

            if len(mapgroup_layer) > 0:
                for mapgrouplayer in mapgroup_layer:
                    if mapgrouplayer.layerfiles_status == 1 and mapgrouplayer.layer_descri != '' and mapgrouplayer.user_id != current_user.pk:

                        lastTime = mapgrouplayer.updated_at.replace(tzinfo=None)
                        diff = nowTime - lastTime
                        day = diff.days
                        seconds = diff.seconds
                        tot_seconds = seconds + day * (24 * 3600)
                        link = '/map/group/' + \
                            str(mapgrouplayer.group_id) + \
                            '/' + str(mapLayer.pk) + '/map'

                        lastestNews_tuples.append(
                            (tot_seconds, mapgrouplayer.pk, mapgrouplayer.layer_name, 'map', mapgrouplayer.layer_descri, link))

            if len(drawgroup_layer) > 0:
                for drawgroupLayer in drawgroup_layer:
                    if drawgroupLayer.layerdraw_status == 1 and drawgroupLayer.layer_descri != '' and drawgroupLayer.user_id != current_user.pk:
                        lastTime = drawgroupLayer.updated_at.replace(tzinfo=None)
                        diff = nowTime - lastTime
                        day = diff.days
                        seconds = diff.seconds
                        tot_seconds = seconds + day * (24 * 3600)
                        link = '/map/group/' + \
                            str(drawgroupLayer.group_id) + '/' + \
                            str(drawgroupLayer.pk) + '/layer'

                        lastestNews_tuples.append(
                            (tot_seconds, drawgroupLayer.pk, drawgroupLayer.layer_name, 'layer', drawgroupLayer.layer_descri, link))

        lastestNews_short = sorted(
            lastestNews_tuples, key=lambda lastestNews: lastestNews[0])
        response = {'status': 1, 'lastestNews': lastestNews_short}
        return JsonResponse(response, content_type='json')


def get_layer_data(request, map=None, layer_type=None, *args, **kwargs):

    if int(map) > 0 and (layer_type == 'map' or layer_type == 'layer'):
        if layer_type == 'map':
            layer = Layerfiles.objects.get(pk=int(map))
            layer_file_type = layer.layer_type
            layer_name = layer.layer_name
            layer_desc = layer.layer_descri

            if layer.layerfiles_status == 1 and layer.layer_type == 'KML':

                layer_file = Layerfile_attachments.objects.get(
                    layerfiles_id=int(map), file_name__contains='.kml')

                layer_filename = layer_file.file_name

                context = {'layer_status': 1, 'map_id': map, 'map_type': layer_type, 'layer_file_type': layer_file_type,
                           'filename': layer_filename, 'layer_name': layer_name, 'layer_description': layer_desc}

            elif layer.layerfiles_status == 1 and layer.layer_type == 'SHP':

                context = {'layer_status': 1, 'map_id': map, 'map_type': layer_type, 'layer_file_type': layer_file_type,
                           'filename': '', 'layer_name': layer_name, 'layer_description': layer_desc}

            else:
                context = {'layer_status': 0, 'map_id': map,
                           'map_type': layer_type, 'layer_file_type': ''}

        if layer_type == 'layer':
            layer_geojson = Layer_draw.objects.get(pk=int(map))
            layer_name = layer_geojson.layer_name
            layer_filename = layer_geojson.layer_file
            layer_desc = layer_geojson.layer_descri
            layer_file_type = 'JEOJSON'
            context = {'layer_status': 1, 'map_id': map, 'map_type': layer_type, 'layer_file_type': layer_file_type,
                       'filename': layer_filename, 'layer_name': layer_name, 'layer_description': layer_desc}
    else:
        context = {'layer_status': 0, 'map_id': map,
                   'map_type': layer_type, 'layer_file_type': ''}

    return render(request, 'map/index.html', context)


def get_group_data(request, gid=None, map=None, layer_type=None, *args, **kwargs):

    if int(gid) > 0 and int(map) > 0 and (layer_type == 'map' or layer_type == 'layer'):
        if layer_type == 'map':
            group_layer = Group_layerfiles.objects.get(pk=int(map))
            layer_file_type = group_layer.layer_type
            layer_name = group_layer.layer_name
            layer_desc = group_layer.layer_descri
            layerID = group_layer.layerfiles_id

            if group_layer.layerfiles_status == 1 and group_layer.layer_type == 'KML':

                layer_file = Layerfile_attachments.objects.get(
                    layerfiles_id=layerID, file_name__contains='.kml')

                layer_filename = layer_file.file_name

                context = {'layer_status': 1, 'gid': gid, 'map_id': layerID, 'map_type': layer_type, 'layer_file_type': layer_file_type,
                           'filename': layer_filename, 'layer_name': layer_name, 'layer_description': layer_desc}

            elif group_layer.layerfiles_status == 1 and group_layer.layer_type == 'SHP':

                context = {'layer_status': 1, 'gid': gid, 'map': layerID, 'map_type': layer_type,
                           'layer_file_type': layer_file_type, 'filename': '', 'layer_name': layer_name, 'layer_description': layer_desc}

            else:
                context = {'layer_status': 0, 'gid': gid, 'map': layerID,
                           'map_type': layer_type, 'layer_file_type': ''}

        if layer_type == 'layer':
            group_layer_geojson = Group_layer_draw.objects.get(pk=int(map))
            layer_name = group_layer_geojson.layer_name
            layer_filename = group_layer_geojson.layer_file
            layerID = group_layer_geojson.layer_draw_id
            layer_desc = group_layer.layer_descri
            layer_file_type = 'JEOJSON'

            context = {'layer_status': 1, 'gid': gid, 'map_id': map, 'map_type': layer_type, 'layer_file_type': layer_file_type,
                       'filename': layer_filename, 'layer_name': layer_name, 'layer_description': layer_desc}
    else:
        context = {'layer_status': 0, 'gid': gid, 'map_id': map,
                   'map_type': layer_type, 'layer_file_type': ''}

    return render(request, 'map/index.html', context)


def get_lastest_layer_data(request, groupId=None, *args, **kwargs):
    current_user = request.user
    lastestData_tuples = []
    layerfileName = ''
    lastestData = ''
    layer_description = ''
    nowTime = datetime.now().replace(tzinfo=None)

    if(int(groupId) > 0):
        layer_map = Group_layerfiles.objects.filter(
            group_id=groupId, layerfiles_status=1).order_by("-pk")
        layer_draw = Group_layer_draw.objects.filter(
            group_id=groupId, layerdraw_status=1).order_by("-pk")
    else:
        layer_map = Layerfiles.objects.filter(
            user_id=current_user.pk, layerfiles_status=1).order_by("-pk")
        layer_draw = Layer_draw.objects.filter(
            user_id=current_user.pk, layerdraw_status=1).order_by("-pk")

    if len(layer_map) > 0:
        lastTime = layer_map[0].updated_at.replace(tzinfo=None)
        layer_description = layer_map[0].layer_descri
        diff = nowTime - lastTime
        seconds = diff.seconds
        layerID = layer_map[0].pk
        group_id = 0

        if (int(groupId) > 0):
            layerID = layer_map[0].layerfiles_id
            group_id = layer_map[0].pk

        if layer_map[0].layer_type == 'KML':
            layer_file = Layerfile_attachments.objects.get(
                layerfiles_id=layerID, file_name__contains='.kml')
            layerfileName = layer_file.file_name

        lastestData_tuples.append(
            (seconds, layerID, layer_map[0].layer_name, 'map', layer_map[0].layer_type, layerfileName, layer_description, group_id))

    if len(layer_draw) > 0:
        lastTime = layer_draw[0].updated_at
        layer_description = layer_draw[0].layer_descri
        diff = nowTime - lastTime
        seconds = diff.seconds
        layerfileName = layer_draw[0].layer_file
        layerID = layer_draw[0].pk
        group_id = 0

        if (int(groupId) > 0):
            # layerID = layer_draw[0].layer_draw_id
            layerID = layer_draw[0].pk

        lastestData_tuples.append(
            (seconds, layerID, layer_draw[0].layer_name, 'layer', 'geojson', layerfileName, layer_description, groupId))

    if len(lastestData_tuples) > 0:
        lastestData_tuples_short = sorted(
            lastestData_tuples, key=lambda lastestData: lastestData[0])

        lastestData = lastestData_tuples_short[0]

        response = {'status': 1, 'lastestData': lastestData}

    else:
        response = {'status': 0, 'lastestData': ''}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def save_as_new_drawing(request):
    if request.method == "POST":

        layer_name = request.POST['layer_name']
        layer_status = request.POST['layer_status']
        layer_descri = request.POST['layer_descri']
        groupID = request.POST['group_id']
        nowTime = datetime.now()
        current_user = request.user
        group_layerfileId = ''

        if (layer_name != '' and layer_status != ''):

            add_layer = Layer_draw(
                layer_name=layer_name,
                layer_status=layer_status,
                layer_descri=layer_descri,
                layerdraw_status=1,
                user_id=current_user.pk,
                created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
            )
            add_layer.save()
            layerfileId = add_layer.pk

            # For Group
            if groupID != '':
                add_group_layer = Group_layer_draw(
                    group_id=groupID,
                    layer_name=layer_name,
                    layer_status=layer_status,
                    layer_descri=layer_descri,
                    layerdraw_status=1,
                    layer_draw_id=layerfileId,
                    user_id=current_user.pk,
                    last_modifed_user=current_user.pk,
                    created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                    updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                )
                add_group_layer.save()
                group_layerfileId = add_group_layer.pk

                add_layer.group_layer_draw_id = group_layerfileId
                add_layer.save()

            # /For Group
            response = {'status': 1, 'drawLayerId': layerfileId,
                        'group_drawLayerId': group_layerfileId}

        else:
            response = {'status': 0}
    else:
        response = {'status': 0}

    return JsonResponse(response)


@csrf_exempt
def save_drawing_file(request):
    if request.method == "POST":

        geojsonData = request.POST['dataGeojson']

        if geojsonData != '':

            layer_name = request.POST['layer_name']
            layerfileID = request.POST['layerfileID']
            layer_status = request.POST['layer_status']
            groupID = request.POST['group_id']
            groupFildID = request.POST['group_file_id']
            layer_order = request.POST['layer_order']
            nowTime = datetime.now()
            current_user = request.user
            media_root = settings.MEDIA_ROOT

            if (layer_name != '' and layerfileID != ''):

                add_layerfile = Layer_drawfile(
                    layer_name=layer_name,
                    layer_draw_id=layerfileID,
                    layer_status=layer_status,
                    layerdrawfile_status=0,
                    layer_order=layer_order,
                    user_id=current_user.pk,
                    last_modifed_user=current_user.pk,
                    created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                    updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                )
                add_layerfile.save()
                layerfile_id = add_layerfile.pk

                fileName = 'drawmapdata_' + \
                    str(layerfileID)+'_'+str(layerfile_id)+'.json'
                file_path = 'media/draw_layers/'+fileName
                full_filepath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), file_path))

                jsonData = json.loads(geojsonData)
                with open(full_filepath, 'w') as outfile:
                    json.dump(jsonData, outfile)

                add_layerfile.layer_file = fileName
                add_layerfile.layerdrawfile_status = 1
                add_layerfile.updated_at = nowTime.strftime(
                    "%Y-%m-%d %H:%M:%S")
                add_layerfile.save()

                # For Group
                if groupFildID != '':
                    add_group_layerfile = Group_layer_drawfile(
                        group_id=groupID,
                        grouplayer_draw_id=groupFildID,
                        layer_name=layer_name,
                        layer_status=layer_status,
                        layerdraw_status=0,
                        layer_draw_id=layerfileID,
                        layer_order=layer_order,
                        user_id=current_user.pk,
                        last_modifed_user=current_user.pk,
                        created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                        updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                    )
                    add_group_layerfile.save()
                    add_group_layerfile = add_group_layerfile.pk

                    group_fileName = 'group_drawmapdata_' + \
                        str(groupID)+'_'+str(add_group_layerfile)+'.json'
                    group_file_path = 'media/draw_layers/' + group_fileName
                    group_full_filepath = os.path.abspath(os.path.join(
                        os.path.dirname(media_root), group_file_path))

                    group_jsonData = json.loads(geojsonData)
                    with open(group_full_filepath, 'w') as outfile:
                        json.dump(group_jsonData, outfile)

                    update_group_layerfile = Group_layer_drawfile.objects.get(
                        pk=add_group_layerfile, group_id=groupID)
                    update_group_layerfile.layer_file = group_fileName
                    update_group_layerfile.layerdraw_status = 1
                    update_group_layerfile.updated_at = nowTime.strftime(
                        "%Y-%m-%d %H:%M:%S")
                    update_group_layerfile.save()

                # /For Group
                response = {'status': 1, 'drawLayerId': layerfile_id,
                            'filepath': file_path, 'group_drawLayerId': groupFildID}

            else:
                response = {'status': 0, 'filepath': ""}
        else:
            response = {'status': 0, 'filepath': ""}
    else:
        response = {'status': 0, 'filepath': ""}

    return JsonResponse(response)


@csrf_exempt
def save_new_drawing(request):
    if request.method == "POST":

        geojsonData = request.POST['dataGeojson']
        groupID = request.POST['group_id']
        fileId = request.POST['fileId']
        layer_status = request.POST['layer_status']
        layer_order = request.POST['layer_order']

        current_user = request.user
        nowTime = datetime.now()
        media_root = settings.MEDIA_ROOT

        if geojsonData != '':
            if groupID != '':
                groupFile = Group_layer_drawfile.objects.get(
                    pk=fileId, group_id=groupID)
                fileName = groupFile.layer_file
                file_path = 'media/draw_layers/' + fileName
                full_filepath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), file_path))

                jsonData = json.loads(geojsonData)
                with open(full_filepath, 'w') as outfile:
                    json.dump(jsonData, outfile)

                groupFile.layerdraw_status = 1
                groupFile.layer_order = layer_order
                groupFile.layer_status = layer_status
                groupFile.last_modifed_user = current_user.pk
                groupFile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
                groupFile.save()
                group_layer_id = groupFile.grouplayer_draw_id
                response = {'status': 1, 'drawLayerId': group_layer_id}

            else:
                layerFile = Layer_drawfile.objects.get(pk=fileId)
                fileName = layerFile.layer_file
                file_path = 'media/draw_layers/' + fileName
                full_filepath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), file_path))

                layerFile.layerdraw_status = 1
                layerFile.layer_order = layer_order
                layerFile.layer_status = layer_status
                layerFile.last_modifed_user = current_user.pk
                layerFile.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
                layerFile.save()
                layer_id = layerFile.layer_draw_id
                response = {'status': 1, 'drawLayerId': layer_id}

        else:
            response = {'status': 0, 'drawLayerId': ''}
    else:
        response = {'status': 0, 'drawLayerId': ''}

    return JsonResponse(response)


def search_layers_list(request, layer_status_type=None, gid=None, **kwargs):
    current_user = request.user
    lists_tuples = []

    if (layer_status_type == 'user' or layer_status_type == 'public' or layer_status_type == 'all'):

        if (layer_status_type == 'user'):
            map_layer = Layerfiles.objects.filter(
                user_id=current_user.pk).order_by('layer_name')
            draw_layer = Layer_draw.objects.filter(
                user_id=current_user.pk, layerdraw_status=1).order_by('layer_name')

        if (layer_status_type == 'public'):
            map_layer = Layerfiles.objects.filter(layer_status='public').exclude(
                user_id=current_user.pk).order_by('layer_name')
            draw_layer = Layer_draw.objects.filter(layer_status='public').exclude(
                user_id=current_user.pk).order_by('layer_name')

        if (layer_status_type == 'all'):
            map_layer = Layerfiles.objects.filter(Q(user_id=current_user.pk) | Q(
                layer_status='public')).order_by('layer_name')
            draw_layer = Layer_draw.objects.filter(Q(user_id=current_user.pk) | Q(
                layer_status='public')).order_by('layer_name')

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                if (mapLayer.layerfiles_status == 1):

                    layerfileName = ''

                    if mapLayer.layer_type == 'KML':
                        layer_file = Layerfile_attachments.objects.get(
                            layerfiles_id=mapLayer.pk, file_name__contains='.kml')
                        layerfileName = layer_file.file_name

                    lists_tuples.append({'layer_name': mapLayer.layer_name, 'layerID': mapLayer.pk, 'layerType': 'map', 'description': mapLayer.layer_descri,
                                        'fileType': mapLayer.layer_type, 'fileName': layerfileName, 'userType': 'user', 'group_id': ''})

        if len(draw_layer) > 0:
            for drawLayer in draw_layer:
                if (drawLayer.layerdraw_status == 1):

                    drawLayerFiles = Layer_drawfile.objects.filter(
                        layer_draw_id=drawLayer.pk)
                    if len(drawLayerFiles) > 0:
                        for drawLayerFile in drawLayerFiles:
                            lists_tuples.append({'layer_name': drawLayerFile.layer_name, 'layerID': drawLayerFile.pk, 'layerType': 'layer',
                                                'description': '', 'fileType': 'GEOJSON', 'fileName': drawLayerFile.layer_file, 'userType': 'user', 'group_id': ''})

        response = {'status': 1, 'searchList': lists_tuples}

    else:
        response = {'status': 0, 'searchList': ''}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def searchbox_layers_list(request, gid=None, *args, **kwargs):
    if request.method == "GET":
        search = request.GET['search']
        current_user = request.user
        lists_tuples = []

        if (int(gid) > 0):

            map_layer = Group_layerfiles.objects.filter(
                layerfiles_status=1, layer_name__contains=search).order_by('layer_name')
            draw_layer = Group_layer_drawfile.objects.filter(
                layer_status=1, layer_name__contains=search).order_by('layer_name')

            if len(map_layer) > 0:
                for mapLayer in map_layer:
                    if (mapLayer.group_id == gid or mapLayer.layer_status == 'public'):

                        layerfileName = ''

                        if mapLayer.layer_type == 'KML':
                            layer_file = Layerfile_attachments.objects.get(
                                layerfiles_id=mapLayer.layerfiles_id, file_name__contains='.kml')
                            layerfileName = layer_file.file_name

                        lists_tuples.append({'layer_name': mapLayer.layer_name, 'layerID': mapLayer.pk, 'layerType': 'map', 'description': mapLayer.layer_descri,
                                            'fileType': mapLayer.layer_type, 'fileName': layerfileName, 'userType': 'group', 'group_id': gid})

            if len(draw_layer) > 0:
                for drawLayer in draw_layer:

                    drawLayerFiles = Group_layer_draw.objects.filter(
                        group_id=gid, pk=drawLayer.grouplayer_draw_id).exists()

                    if(drawLayerFiles):
                        drawLayerFile = Group_layer_draw.objects.get(
                            group_id=gid, pk=drawLayer.grouplayer_draw_id)
                        if (drawLayerFile.layer_status == 'public'):
                            lists_tuples.append({'layer_name': drawLayer.layer_name, 'layerID': drawLayer.pk, 'layerType': 'layer', 'description': '',
                                                'fileType': 'GEOJSON', 'fileName': drawLayer.layer_file, 'userType': 'group', 'group_id': drawLayerFile.group_id})

            response = {'status': 1, 'searchList': lists_tuples}

        else:

            map_layer = Layerfiles.objects.filter(
                layer_name__contains=search).order_by('layer_name')
            draw_layer = Layer_drawfile.objects.filter(
                layer_name__contains=search).order_by('layer_name')

            if len(map_layer) > 0:
                for mapLayer in map_layer:
                    if (mapLayer.user_id == current_user.pk or mapLayer.layer_status == 'public'):

                        layerfileName = ''

                        if mapLayer.layer_type == 'KML':
                            layer_file = Layerfile_attachments.objects.get(
                                layerfiles_id=mapLayer.pk, file_name__contains='.kml')
                            layerfileName = layer_file.file_name

                        lists_tuples.append({'layer_name': mapLayer.layer_name, 'layerID': mapLayer.pk, 'layerType': 'map', 'description': mapLayer.layer_descri,
                                            'fileType': mapLayer.layer_type, 'fileName': layerfileName, 'userType': 'user', 'group_id': ''})

            if len(draw_layer) > 0:
                for drawLayer in draw_layer:
                    if (drawLayer.layer_status == 1):

                        drawLayerFiles = Layer_draw.objects.filter(
                            pk=drawLayer.layer_draw_id).exists()

                        if (drawLayerFiles):
                            drawLayerFile = Layer_draw.objects.get(
                                pk=drawLayer.layer_draw_id)
                            if (drawLayerFile.user_id == current_user.pk or drawLayerFile.layer_status == 'public'):
                                lists_tuples.append({'layer_name': drawLayer.layer_name, 'layerID': drawLayer.pk, 'layerType': 'layer',
                                                    'description': '', 'fileType': 'GEOJSON', 'fileName': drawLayer.layer_file, 'userType': 'user', 'group_id': ''})

            response = {'status': 1, 'searchList': lists_tuples}
    else:
        response = {'status': 0, 'searchList': ''}

    return JsonResponse(response, content_type='json')


def search_group_layers_list(request, layer_status_type=None, gid=None, *args, **kwargs):
    current_user = request.user
    lists_tuples = []

    if (layer_status_type == 'group' and int(gid) > 0):

        map_layer = Group_layerfiles.objects.filter(
            group_id=gid, layerfiles_status=1).order_by('layer_name')

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                if (mapLayer.layerfiles_status == 1):

                    layerfileName = ''
                    layerID = mapLayer.layerfiles_id

                    if mapLayer.layer_type == 'KML':
                        layer_file = Layerfile_attachments.objects.get(
                            layerfiles_id=mapLayer.layerfiles_id, file_name__contains='.kml')
                        layerfileName = layer_file.file_name

                    lists_tuples.append({'layer_name': mapLayer.layer_name, 'layerID': layerID, 'layerType': 'map', 'description': mapLayer.layer_descri,
                                        'fileType': mapLayer.layer_type, 'fileName': layerfileName, 'userType': 'group', 'group_id': mapLayer.group_id})

        draw_layer = Group_layer_draw.objects.filter(
            group_id=gid, layerdraw_status=1).order_by('layer_name')

        if len(draw_layer) > 0:
            for drawLayer in draw_layer:

                drawLayerFiles = Group_layer_drawfile.objects.filter(
                    group_id=gid, grouplayer_draw_id=drawLayer.pk)
                if len(drawLayerFiles) > 0:
                    for drawLayerFile in drawLayerFiles:
                        lists_tuples.append({'layer_name': drawLayerFile.layer_name, 'layerID': drawLayerFile.pk, 'layerType': 'layer', 'description': '',
                                            'fileType': 'GEOJSON', 'fileName': drawLayerFile.layer_file, 'userType': 'group', 'group_id': drawLayerFile.group_id})

        response = {'status': 1, 'searchList': lists_tuples}

    elif (layer_status_type == 'public_group' and int(gid) > 0):

        map_layer = Group_layerfiles.objects.filter(
            layer_status='public').exclude(group_id=gid).order_by('layer_name')

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                if (mapLayer.layerfiles_status == 1):

                    layerfileName = ''
                    layerID = mapLayer.layerfiles_id

                    if mapLayer.layer_type == 'KML':
                        layer_file = Layerfile_attachments.objects.get(
                            layerfiles_id=mapLayer.layerfiles_id, file_name__contains='.kml')
                        layerfileName = layer_file.file_name

                    lists_tuples.append({'layer_name': mapLayer.layer_name, 'layerID': layerID, 'layerType': 'map', 'description': mapLayer.layer_descri,
                                        'fileType': mapLayer.layer_type, 'fileName': layerfileName, 'userType': 'group', 'group_id': mapLayer.group_id})

        draw_layer = Group_layer_draw.objects.filter(
            layer_status='public').exclude(group_id=gid).order_by('layer_name')

        if len(draw_layer) > 0:
            for drawLayer in draw_layer:
                if (drawLayer.layerdraw_status == 1):

                    drawLayerFiles = Group_layer_drawfile.objects.filter(
                        group_id=gid, grouplayer_draw_id=drawLayer.pk)
                    if len(drawLayerFiles) > 0:
                        for drawLayerFile in drawLayerFiles:
                            lists_tuples.append({'layer_name': drawLayerFile.layer_name, 'layerID': drawLayerFile.pk, 'layerType': 'layer', 'description': '',
                                                'fileType': 'GEOJSON', 'fileName': drawLayerFile.layer_file, 'userType': 'group', 'group_id': drawLayerFile.group_id})

        response = {'status': 1, 'searchList': lists_tuples}

    elif (layer_status_type == 'all_group' and int(gid) > 0):

        map_layer = Group_layerfiles.objects.filter(
            Q(group_id=gid) | Q(layer_status='public')).order_by('layer_name')

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                if (mapLayer.layerfiles_status == 1):

                    layerfileName = ''
                    layerID = mapLayer.layerfiles_id

                    if mapLayer.layer_type == 'KML':
                        layer_file = Layerfile_attachments.objects.get(
                            layerfiles_id=mapLayer.layerfiles_id, file_name__contains='.kml')
                        layerfileName = layer_file.file_name

                    lists_tuples.append({'layer_name': mapLayer.layer_name, 'layerID': layerID, 'layerType': 'map', 'description': mapLayer.layer_descri,
                                        'fileType': mapLayer.layer_type, 'fileName': layerfileName, 'userType': 'group', 'group_id': mapLayer.group_id})

        draw_layer = Group_layer_draw.objects.filter(
            Q(group_id=gid) | Q(layer_status='public')).order_by('layer_name')

        if len(draw_layer) > 0:
            for drawLayer in draw_layer:
                if (drawLayer.layerdraw_status == 1):

                    drawLayerFiles = Group_layer_drawfile.objects.filter(
                        group_id=gid, grouplayer_draw_id=drawLayer.pk)
                    if len(drawLayerFiles) > 0:
                        for drawLayerFile in drawLayerFiles:
                            lists_tuples.append({'layer_name': drawLayerFile.layer_name, 'layerID': drawLayerFile.pk, 'layerType': 'layer', 'description': '',
                                                'fileType': 'GEOJSON', 'fileName': drawLayerFile.layer_file, 'userType': 'group', 'group_id': drawLayerFile.group_id})

        response = {'status': 1, 'searchList': lists_tuples}

    else:
        response = {'status': 0, 'searchList': ''}

    return JsonResponse(response, content_type='json')


@xframe_options_exempt
def share_layer_data(request, map=None, layer_type=None, *args, **kwargs):

    if int(map) > 0 and (layer_type == 'map' or layer_type == 'layer'):
        if layer_type == 'map':
            layer = Layerfiles.objects.get(pk=int(map))
            layer_file_type = layer.layer_type
            layer_name = layer.layer_name

            if layer.layerfiles_status == 1 and layer.layer_type == 'KML':

                layer_file = Layerfile_attachments.objects.get(
                    layerfiles_id=int(map), file_name__contains='.kml')

                layer_filename = layer_file.file_name

                context = {'layer_status': 1, 'map_id': map, 'map_type': layer_type,
                           'layer_file_type': layer_file_type, 'filename': layer_filename, 'layer_name': layer_name}

            elif layer.layerfiles_status == 1 and layer.layer_type == 'SHP':

                context = {'layer_status': 1, 'map_id': map, 'map_type': layer_type,
                           'layer_file_type': layer_file_type, 'filename': '', 'layer_name': layer_name}

            else:
                context = {'layer_status': 0, 'map_id': map,
                           'map_type': layer_type, 'layer_file_type': ''}

        if layer_type == 'layer':
            layer_geojson = Layer_draw.objects.get(pk=int(map))
            layer_name = layer_geojson.layer_name
            layer_filename = layer_geojson.layer_file
            layer_file_type = 'JEOJSON'
            context = {'layer_status': 1, 'map_id': map, 'map_type': layer_type,
                       'layer_file_type': layer_file_type, 'filename': layer_filename, 'layer_name': layer_name}
    else:
        context = {'layer_status': 0, 'map_id': map,
                   'map_type': layer_type, 'layer_file_type': ''}

    return render(request, 'map/share_map.html', context)


@csrf_exempt
def my_map_data(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        myMaps = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if(len(request.POST) == 3):
            map_layer_count = Layerfiles.objects.filter(
                user_id=current_user.pk, layerfiles_status=1, layer_name__contains=request.POST['search']).count()
            map_layer = Layerfiles.objects.filter(user_id=current_user.pk, layerfiles_status=1,
                                                  layer_name__contains=request.POST['search']).order_by('created_at')[start_row:end_row]
        else:
            map_layer_count = Layerfiles.objects.filter(
                user_id=current_user.pk, layerfiles_status=1).count()
            map_layer = Layerfiles.objects.filter(
                user_id=current_user.pk, layerfiles_status=1).order_by('created_at')[start_row:end_row]

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                last_user = User.objects.get(
                    pk=int(mapLayer.last_modifed_user))
                row = {'id': mapLayer.pk, 'name': mapLayer.layer_name, 'description': mapLayer.layer_descri,
                       'created_date': mapLayer.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
                myMaps.append(row)

            response = {'total': map_layer_count, 'rows': myMaps}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def my_map_data_all(request):

    current_user = request.user
    myLayers = []
    myProjects = []
    myMaps = []

    layers = Layerfiles.objects.filter(
        user_id=current_user.pk, layerfiles_status=1).order_by('layer_name')
    project = Layer_draw.objects.filter(
        user_id=current_user.pk, layerdraw_status=1).order_by('layer_name')
    map = Layer_maps.objects.filter(
        user_id=current_user.pk, layerdraw_status=1).order_by('layer_name')

    if len(layers) > 0:
        for mapLayer in layers:
            last_user = User.objects.get(pk=int(mapLayer.last_modifed_user))

            layerType = '.'+mapLayer.layer_type.lower()
            layer_file = Layerfile_attachments.objects.get(
                layerfiles_id=mapLayer.id, file_name__contains=layerType)
            filePath = str(layer_file.attachment)
            file = filePath.split('/')
            filename = file[len(file)-1]

            row = {'id': mapLayer.pk, 'name': mapLayer.layer_name, 'description': mapLayer.layer_descri, 'layer_type': mapLayer.layer_type,
                   'layerfileName': filename, 'created_date': mapLayer.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
            myLayers.append(row)

    if len(project) > 0:
        for myProject in project:
            last_user = User.objects.get(pk=int(myProject.last_modifed_user))
            row = {'id': myProject.pk, 'name': myProject.layer_name, 'description': myProject.layer_descri,
                   'created_date': myProject.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
            myProjects.append(row)

    if len(map) > 0:
        for myMap in map:
            last_user = User.objects.get(pk=int(myMap.last_modifed_user))
            row = {'id': myMap.pk, 'name': myMap.layer_name,
                   'map_type': myMap.map_type}
            myMaps.append(row)

    response = {'my_layers': myLayers,
                'my_map': myMaps, 'my_projects': myProjects}
    # else:
    #     response = {'my_layers': [], 'my_map':[], 'my_projects':[],'user':current_user.pk}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def my_layer_data(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        myMaps = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            map_layer_count = Layer_draw.objects.filter(
                user_id=current_user.pk, layerdraw_status=1, layer_name__contains=request.POST['search']).count()
            map_layer = Layer_draw.objects.filter(user_id=current_user.pk, layerdraw_status=1,
                                                  layer_name__contains=request.POST['search']).order_by('created_at')[start_row:end_row]
        else:
            map_layer_count = Layer_draw.objects.filter(
                user_id=current_user.pk, layerdraw_status=1).count()
            map_layer = Layer_draw.objects.filter(
                user_id=current_user.pk, layerdraw_status=1).order_by('created_at')[start_row:end_row]

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                last_user = User.objects.get(
                    pk=int(mapLayer.last_modifed_user))
                row = {'id': mapLayer.pk, 'name': mapLayer.layer_name, 'description': mapLayer.layer_descri,
                       'created_date': mapLayer.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
                myMaps.append(row)

            response = {'total': map_layer_count, 'rows': myMaps}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


def layers_data(request, layerId=None, groupId=None, *args, **kwargs):
    groupLayerArr = []

    if(int(groupId) > 0 and int(layerId) > 0):

        groupLayer = Group_layer_draw.objects.get(pk=layerId)
        groupFiles = Group_layer_drawfile.objects.filter(
            grouplayer_draw_id=layerId, group_id=groupId, layerdraw_status=1).order_by('-layer_order')

        if len(groupFiles) > 0:
            for groupFile in groupFiles:
                fileRow = {'fileId': groupFile.pk, 'groupLayerId': groupFile.grouplayer_draw_id, 'layerName': groupFile.layer_name,
                           'layerStatus': groupFile.layer_status, 'layerFile': groupFile.layer_file, 'layerOder': groupFile.layer_order}
                groupLayerArr.append(fileRow)

            response = {'status': 1, 'rows': groupLayerArr,
                        'group_id': groupId, 'map_id': layerId}

    elif(int(groupId) == 0 and int(layerId) > 0):

        layers = Layer_draw.objects.get(pk=layerId)
        layerFiles = Layer_drawfile.objects.filter(
            layer_draw_id=layerId, layerdrawfile_status=1).order_by('-layer_order')

        if len(layerFiles) > 0:
            for layerFile in layerFiles:
                fileRow = {'fileId': layerFile.pk, 'groupLayerId': groupId, 'layerName': layerFile.layer_name,
                           'layerStatus': layerFile.layer_status, 'layerFile': layerFile.layer_file, 'layerOder': layerFile.layer_order}
                groupLayerArr.append(fileRow)

        response = {'status': 1, 'rows': groupLayerArr,
                    'group_id': groupId, 'map_id': layerId}

    else:
        response = {'status': 0, 'rows': '', 'group_id': '', 'map_id': ''}

    return JsonResponse(response)


@csrf_exempt
def all_map_data(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        myMaps = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            map_layer_count = Layerfiles.objects.filter(
                layer_status='public', layerfiles_status=1, layer_name__contains=request.POST['search']).count()
            map_layer = Layerfiles.objects.filter(layer_status='public', layerfiles_status=1,
                                                  layer_name__contains=request.POST['search']).order_by('created_at')[start_row:end_row]
        else:
            map_layer_count = Layerfiles.objects.filter(
                layer_status='public', layerfiles_status=1).count()
            map_layer = Layerfiles.objects.filter(
                layer_status='public', layerfiles_status=1).order_by('created_at')[start_row:end_row]

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                last_user = User.objects.get(
                    pk=int(mapLayer.last_modifed_user))
                row = {'id': mapLayer.pk, 'name': mapLayer.layer_name, 'description': mapLayer.layer_descri,
                       'created_date': mapLayer.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
                myMaps.append(row)

            response = {'total': map_layer_count, 'rows': myMaps}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def all_layer_data(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        myMaps = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            map_layer_count = Layer_draw.objects.filter(
                layer_status='public', layerdraw_status=1, layer_name__contains=request.POST['search']).count()
            map_layer = Layer_draw.objects.filter(layer_status='public', layerdraw_status=1,
                                                  layer_name__contains=request.POST['search']).order_by('created_at')[start_row:end_row]
        else:
            map_layer_count = Layer_draw.objects.filter(
                layer_status='public', layerdraw_status=1).count()
            map_layer = Layer_draw.objects.filter(
                layer_status='public', layerdraw_status=1).order_by('created_at')[start_row:end_row]

        if len(map_layer) > 0:
            for mapLayer in map_layer:
                last_user = User.objects.get(
                    pk=int(mapLayer.last_modifed_user))
                row = {'id': mapLayer.pk, 'name': mapLayer.layer_name, 'description': mapLayer.layer_descri,
                       'created_date': mapLayer.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
                myMaps.append(row)

            response = {'total': map_layer_count, 'rows': myMaps}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def my_group(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        myGroup = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            group_count = Groups.objects.filter(
                user_id=current_user.pk, layer_name__contains=request.POST['search']).count()
            groups = Groups.objects.filter(user_id=current_user.pk, layer_name__contains=request.POST['search']).order_by(
                'updated_at')[start_row:end_row]
        else:
            group_count = Groups.objects.filter(
                user_id=current_user.pk).count()
            groups = Groups.objects.filter(user_id=current_user.pk).order_by(
                'updated_at')[start_row:end_row]

        if len(groups) > 0:
            for group in groups:
                last_user = User.objects.get(pk=int(group.last_modifed_user))
                row = {'id': group.pk, 'group_name': group.group_name, 'description': group.group_descri,
                       'created_date': group.created_at, 'create_by': current_user.username, 'lmu': last_user.username}
                myGroup.append(row)

            response = {'total': group_count, 'rows': myGroup}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def all_group(request):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        myGroup = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            group_count = Groups.objects.filter(
                group_name__contains=request.POST['search']).count()
            groups = Groups.objects.filter(group_name__contains=request.POST['search']).order_by(
                'updated_at')[start_row:end_row]
        else:
            group_count = Group_member.objects.filter(
                member=current_user.pk).count()
            groups = Groups.objects.order_by('updated_at')[start_row:end_row]

        if len(groups) > 0:
            for group in groups:
                createdUser = User.objects.get(pk=int(group.user_id))
                last_user = User.objects.get(pk=int(group.last_modifed_user))

                isMember = Group_member.objects.filter(
                    member=current_user.pk, group_id=group.pk).exists()
                if(group.user_id == current_user.pk):
                    row = {'id': group.pk, 'group_name': group.group_name, 'description': group.group_descri,
                           'created_date': group.created_at, 'create_by': createdUser.username, 'lmu': last_user.username}
                    myGroup.append(row)
                elif(isMember):
                    row = {'id': group.pk, 'group_name': group.group_name, 'description': group.group_descri,
                           'created_date': group.created_at, 'create_by': createdUser.username, 'lmu': last_user.username}
                    myGroup.append(row)

            response = {'total': group_count, 'rows': myGroup}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def data_update(request):
    if request.method == "POST":
        postData = request.POST

        sub_proj = postData['sub_proj_page']
        # search = postData['search']

        nowTime = datetime.now()
        current_user = request.user

        if(sub_proj == 'my_map' or sub_proj == 'all_map'):
            id = postData['id']
            layerName = postData['name']
            layer_descri = postData['description']
            updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            last_modifed_user = current_user.pk

            layer = Layerfiles.objects.get(pk=int(id))

            layer.layer_name = layerName
            layer.layer_descri = layer_descri
            layer.updated_at = updated_at
            layer.last_modifed_user = current_user.pk
            layer.save()
            response = {'status': 1, 'id': id, 'lmu': current_user.username}

        elif(sub_proj == 'my_layer' or sub_proj == 'all_layer'):
            id = postData['id']
            layerName = postData['name']
            layer_descri = postData['description']
            updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            last_modifed_user = current_user.pk

            layer = Layer_draw.objects.get(pk=int(id))

            layer.layer_name = layerName
            layer.layer_descri = layer_descri
            layer.updated_at = updated_at
            layer.last_modifed_user = current_user.pk
            layer.save()
            response = {'status': 1, 'id': id, 'lmu': current_user.username}

        elif (sub_proj == 'my_group' or sub_proj == 'all_group'):
            id = postData['id']
            group_name = postData['group_name']
            group_descri = postData['description']
            updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            last_modifed_user = current_user.pk

            group = Groups.objects.get(pk=int(id))

            group.group_name = group_name
            group.group_descri = group_descri
            group.updated_at = updated_at
            group.last_modifed_user = current_user.pk
            group.save()
            response = {'status': 1, 'id': id, 'lmu': current_user.username}

        else:
            response = {'status': 0}
    else:
        response = {'status': 0}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def data_delete(request):
    if request.method == "POST":

        postData = request.POST
        sub_proj = postData['sub_proj_page']
        id = postData['id']
        media_root = settings.MEDIA_ROOT

        if(sub_proj == 'my_map' or sub_proj == 'all_map'):

            mapDel = Layerfiles.objects.get(pk=int(id))
            mapDel.delete()

            isExistGroup = Group_layerfiles.objects.filter(
                layerfiles_id=int(id))

            if len(isExistGroup) <= 0:
                directoryPath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), 'media/layers/' + str(id)))
                shutil.rmtree(directoryPath)

                mapFilesDel = Layerfile_attachments.objects.filter(
                    layerfiles_id=int(id))
                mapFilesDel.delete()

                getTable = Layer_column_name.objects.filter(
                    layer_id=int(id)).order_by('-id')[:1]
                for table in getTable:
                    tableName = table.table_name

                table_name = tableName

                if table_name:
                    cursor = connection.cursor()
                    sql = """DROP TABLE """ + table_name + """;"""
                    cursor.execute(sql)

                layerColumnsDel = Layer_column_name.objects.filter(
                    layer_id=int(id))
                layerColumnsDel.delete()

            response = {'status': 1}

        elif(sub_proj == 'my_layer' or sub_proj == 'all_layer'):

            layerDele = Layer_draw.objects.get(pk=int(id))
            layerDele.delete()

            layerFilesDele = Layer_drawfile.objects.filter(
                layer_draw_id=int(id))

            for layerFileDele in layerFilesDele:
                fileName = layerFileDele.layer_file

                directoryPath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), 'media/draw_layers/' + str(fileName)))
                os.remove(directoryPath)

                layerFileDele.delete()

            response = {'status': 1}

        elif (sub_proj == 'my_group' or sub_proj == 'all_group'):

            group = Groups.objects.get(pk=int(id))
            group.delete()

            response = {'status': 1}

        elif (sub_proj == 'group_member'):

            member = Group_member.objects.get(pk=int(id))
            member.delete()

            response = {'status': 1}

        elif(sub_proj == 'group_map'):

            mapDel = Group_layerfiles.objects.get(pk=int(id))
            fileID = mapDel.layerfiles_id
            mapDel.delete()

            mapFilesDel = Group_layerfile_attachments.objects.filter(
                group_layerfiles_id=int(id))
            mapFilesDel.delete()

            isExistLayer = Layerfiles.objects.filter(pk=int(fileID))

            if len(isExistLayer) <= 0:
                directoryPath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), 'media/layers/' + str(fileID)))
                shutil.rmtree(directoryPath)

                mapFilesDel = Layerfile_attachments.objects.filter(
                    layerfiles_id=int(fileID))
                mapFilesDel.delete()

                getTable = Layer_column_name.objects.filter(
                    layer_id=int(fileID)).order_by('-id')[:1]
                for table in getTable:
                    tableName = table.table_name

                table_name = tableName

                layerColumnsDel = Layer_column_name.objects.filter(
                    layer_id=int(fileID))
                layerColumnsDel.delete()

                if table_name:
                    cursor = connection.cursor()
                    sql = """DROP TABLE """ + table_name + """;"""
                    cursor.execute(sql)

            response = {'status': 1}

        elif(sub_proj == 'group_layer'):

            layerDele = Group_layer_draw.objects.get(pk=int(id))
            fileID = layerDele.layer_draw_id
            layerDele.delete()

            groupFilesDele = Group_layer_drawfile.objects.filter(
                grouplayer_draw_id=int(id))

            for groupFileDele in groupFilesDele:
                fileName = groupFileDele.layer_file

                directoryPath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), 'media/draw_layers/' + str(fileName)))
                os.remove(directoryPath)

                groupFileDele.delete()

            response = {'status': 1}

        else:
            response = {'status': 0}
    else:
        response = {'status': 0}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def add_group(request):
    if request.method == "POST":
        group_name = request.POST['group_name']
        group_descri = request.POST['group_descri']

        current_user = request.user

        if (group_name != ''):

            nowTime = datetime.now()

            post_group = Groups(
                group_name=group_name,
                group_descri=group_descri,
                group_status=1,
                user_id=current_user.pk,
                last_modifed_user=current_user.pk,
                created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
            )

            post_group.save()
            groupID = post_group.pk

            post_member = Group_member(
                group_id=groupID,
                member=current_user.pk,
                superuser=1,
                member_status=1,
                add_by_user=current_user.pk,
                created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
            )

            post_member.save()

            response = {'status': 1, 'groupID': groupID,
                        'message': 'Succssfully added'}
            return JsonResponse(response)

    response = {'status': 1, 'groupID': '', 'message': 'Not Added'}
    return JsonResponse(response)


@csrf_exempt
def group_maps(request, gid=None, *args, **kwargs):

    if request.method == "POST":
        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        groupArr = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            group_count = Group_layerfiles.objects.filter(
                group_id=gid, layerfiles_status=1, layer_name__contains=request.POST['search']).count()
            groups = Group_layerfiles.objects.filter(
                group_id=gid, layerfiles_status=1, layer_name__contains=request.POST['search']).order_by('updated_at')[start_row:end_row]
        else:
            group_count = Group_layerfiles.objects.filter(
                group_id=gid, layerfiles_status=1).count()
            groups = Group_layerfiles.objects.filter(
                group_id=gid, layerfiles_status=1).order_by('updated_at')[start_row:end_row]

        if len(groups) > 0:
            for group in groups:
                created_user = User.objects.get(pk=int(group.user_id))
                last_user = User.objects.get(pk=int(group.last_modifed_user))
                row = {'id': group.pk, 'group_id': group.group_id, 'name': group.layer_name, 'description': group.layer_descri,
                       'created_date': group.created_at, 'create_by': created_user.username, 'lmu': last_user.username}
                groupArr.append(row)

            response = {'total': group_count, 'rows': groupArr}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def group_layers(request, gid=None, *args, **kwargs):
    if request.method == "POST":
        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        groupArr = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            group_count = Group_layer_draw.objects.filter(
                group_id=gid, layerdraw_status=1, layer_name__contains=request.POST['search']).count()
            groups = Group_layer_draw.objects.filter(
                group_id=gid, layerdraw_status=1, layer_name__contains=request.POST['search']).order_by('updated_at')[start_row:end_row]
        else:
            group_count = Group_layer_draw.objects.filter(
                group_id=gid, layerdraw_status=1).count()
            groups = Group_layer_draw.objects.filter(
                group_id=gid, layerdraw_status=1).order_by('updated_at')[start_row:end_row]

        if len(groups) > 0:
            for group in groups:
                created_user = User.objects.get(pk=int(group.user_id))
                last_user = User.objects.get(pk=int(group.last_modifed_user))
                row = {'id': group.pk, 'group_id': group.group_id, 'name': group.layer_name, 'description': group.layer_descri,
                       'created_date': group.created_at, 'create_by': created_user.username, 'lmu': last_user.username}
                groupArr.append(row)

            response = {'total': group_count, 'rows': groupArr}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def group_members(request, gid=None, *args, **kwargs):
    if request.method == "POST":

        n_page = request.POST['page']
        n_rows = request.POST['rows']

        current_user = request.user
        groupArr = []
        start_row = (int(n_page) - 1)*int(n_rows)
        end_row = int(n_page)*int(n_rows)

        if (len(request.POST) == 3):
            group_count = Group_member.objects.filter(
                group_id=gid, layer_name__contains=request.POST['search']).count()
            groups = Group_member.objects.filter(
                group_id=gid, layer_name__contains=request.POST['search']).order_by('updated_at')[start_row:end_row]
        else:
            group_count = Group_member.objects.filter(group_id=gid).count()
            groups = Group_member.objects.filter(group_id=gid).order_by('updated_at')[
                start_row:end_row]

        if len(groups) > 0:
            for group in groups:
                member = User.objects.get(pk=int(group.member))
                row = {'id': group.pk, 'group_id': group.group_id, 'fname': member.first_name,
                       'lname': member.last_name, 'superuser': group.superuser, 'first_admin': group.first_superuser}
                groupArr.append(row)

            response = {'total': group_count, 'rows': groupArr}

        else:
            response = {'total': 0, 'rows': ''}

    else:
        response = {'total': 0, 'rows': ''}
    return JsonResponse(response, content_type='json')


@csrf_exempt
def group_update(request):
    if request.method == "POST":

        nowTime = datetime.now()

        current_user = request.user
        group_name = request.POST['group_name']
        groupID = request.POST['group_id']
        desc = request.POST['e_desc']
        updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")

        group = Groups.objects.get(pk=int(groupID))

        group.group_name = group_name
        group.group_descri = desc
        group.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
        group.save()

        # Store Photo ) or Replace
        try:
            photo = request.FILES['e_photo']
            ext = photo.name.split('.')[-1]
            photoName = 'group_profile_' + str(groupID) + '.' + ext

            fs = FileSystemStorage()
            file_path = 'media/group_profile/' + photoName
            media_root = settings.MEDIA_ROOT
            full_filepath = os.path.abspath(os.path.join(
                os.path.dirname(media_root), file_path))
            filename = fs.save(full_filepath, photo)

            group.profile_image = photoName
            group.updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")
            group.save()
        except:
            photoName = ''
        # /Store Photo or Replace

        response = {'status': 1}
        return JsonResponse(response, content_type='json')


@csrf_exempt
def add_member(request):
    if request.method == "POST":
        group_id = request.POST['group_id']
        member = request.POST['add_member']

        current_user = request.user

        if (member != ''):

            firstAdmin = 0
            isFirstAdmin = Group_member.objects.filter(
                group_id=group_id).count()

            if(isFirstAdmin <= 0):
                firstAdmin = 1

            nowTime = datetime.now()

            post_member = Group_member(
                group_id=group_id,
                member=member,
                superuser=0,
                first_superuser=firstAdmin,
                member_status=1,
                add_by_user=current_user.pk,
                created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
            )

            post_member.save()

            response = {'status': 1, 'groupID': group_id,
                        'message': 'Succssfully added'}
            return JsonResponse(response)

    response = {'status': 1, 'groupID': '', 'message': 'Not Added member'}
    return JsonResponse(response)


@csrf_exempt
def superuser_update(request):
    if request.method == "POST":
        nowTime = datetime.now()
        current_user = request.user
        groupID = request.POST['groupID']
        memberID = request.POST['memberId']
        updated_at = nowTime.strftime("%Y-%m-%d %H:%M:%S")

        member = Group_member.objects.get(
            pk=int(memberID), group_id=int(groupID))

        superuser = member.superuser

        if superuser == 1:
            member.superuser = 0
        else:
            member.superuser = 1

        member.last_modifed_user = current_user.pk
        member.updated_at = updated_at
        member.save()

        response = {'status': 1}

    else:
        response = {'status': 0}

    return JsonResponse(response, content_type='json')


@csrf_exempt
def download_shp(request):
    if request.method == "POST":

        geojsonData = request.POST['dataGeojson']
        map_title = request.POST['map_title']
        download_type = request.POST['download_type']

        if geojsonData != '' and map_title != '':

            current_user = request.user

            newfolder = "download_"+str(current_user.pk)
            geojson = str(map_title) + '.json'

            media_root = settings.MEDIA_ROOT
            mkdir = os.path.abspath(os.path.join(os.path.dirname(
                media_root), 'media/download/' + newfolder))

            if not os.path.isdir(mkdir):
                os.mkdir(mkdir)

            jsonpath = os.path.abspath(os.path.join(os.path.dirname(
                media_root), 'media/download/'+newfolder+'/'+geojson))

            jsonData = json.loads(geojsonData)
            with open(jsonpath, 'w') as outfile:
                json.dump(jsonData, outfile)

            if (download_type == 'SHP'):
                shpfile = map_title + '.shp'
                download_path = os.path.abspath(os.path.join(os.path.dirname(
                    media_root), 'media/download/' + newfolder + '/' + shpfile))
                args = ['ogr2ogr', '-f', 'ESRI Shapefile',
                        download_path, jsonpath]
                p = subprocess.Popen(args)
                p.communicate()

                # Create Zip
                zip_file = map_title+".zip"
                zip_path = os.path.abspath(os.path.join(os.path.dirname(
                    media_root), 'media/download/' + newfolder + '/' + zip_file))

                try:
                    zip_archive = ZipFile(zip_path, "w")

                    for folder, subfolders, files in os.walk(mkdir):
                        for file in files:
                            print("fileCount :"+file)
                            if not file.endswith('.json') and not file.endswith('.zip'):
                                zip_archive.write(os.path.join(folder, file), os.path.relpath(
                                    os.path.join(folder, file), mkdir))

                    response = {'status': 1, 'filepath': 'media/download/' +
                                newfolder + '/' + zip_file, 'file': zip_file, 'dir': mkdir}
                    return JsonResponse(response, content_type='json')

                except:
                    print("Error zip")

            elif(download_type == 'GEOJSON'):
                response = {'status': 1, 'filepath': 'media/download/' +
                            newfolder + '/' + geojson, 'file': geojson, 'dir': mkdir}
                return JsonResponse(response, content_type='json')

        else:
            response = {'status': 0}
            return JsonResponse(response, content_type='json')
    else:
        response = {'status': 0}
        return JsonResponse(response, content_type='json')


@csrf_exempt
def remove_downloaded(request):
    if request.method == "POST":
        dir = request.POST['downloadedDir']

        if(dir is not None and os.path.isdir(dir)):
            shutil.rmtree(dir)
            response = {'status': 1}
        else:
            response = {'status': 0}

    else:
        response = {'status': 0}

    return JsonResponse(response, content_type='json')


def get_layer_details(request, layerId=None, layerType=None, *args, **kwargs):
    if int(layerId) > 0:

        if layerType == 'map':
            getLayerDeatils = Layerfiles.objects.get(pk=layerId)
            response = {'status': 1,
                        'gourpID': getLayerDeatils.group_layerfiles_id}

        elif layerType == 'layer':
            getLayerDeatils = Layer_draw.objects.get(pk=layerId)
            response = {'status': 1,
                        'gourpID': getLayerDeatils.group_layer_draw_id}

        else:
            response = {'status': 0, 'gourpID': ""}

        return JsonResponse(response, content_type='json')

    else:
        response = {'status': 0, 'gourpID': ""}
        return JsonResponse(response, content_type='json')


def map_view(request, map=None, gid=None, *args, **kwargs):
    if int(gid) > 0 and int(map) > 0:
        map_view = Group_layer_maps.objects.get(pk=int(map))
        context = {'layer_status': 1, 'map_id': map, 'group_id': gid, 'map_type': map_view.map_type, 'map_center': map_view.map_center, 'map_zoom': map_view.map_zoom, 'layerTitle': map_view.tileLayer, 'data_frame': map_view.data_frame, 'north_arrow': map_view.north_arrow, 'desc_status': map_view.desc_status,
                   'legend_status': map_view.legend_status, 'legend': map_view.legend, 'citation': map_view.citation, 'scale': map_view.scale, 'title': map_view.title, 'layer_name': map_view.layer_name, 'insert_map': map_view.insert_map, 'layer_descrip': map_view.layer_descri, 'grid_ref': map_view.grid_ref}

    elif int(map) > 0 and int(gid) == 0:
        map_view = Layer_maps.objects.get(pk=int(map))
        context = {'layer_status': 1, 'map_id': map, 'group_id': gid, 'map_type': map_view.map_type, 'map_center': map_view.map_center, 'map_zoom': map_view.map_zoom, 'layerTitle': map_view.tileLayer, 'data_frame': map_view.data_frame, 'north_arrow': map_view.north_arrow, 'desc_status': map_view.desc_status,
                   'legend_status': map_view.legend_status, 'legend': map_view.legend, 'citation': map_view.citation, 'scale': map_view.scale, 'title': map_view.title, 'layer_name': map_view.layer_name, 'insert_map': map_view.insert_map, 'layer_descrip': map_view.layer_descri, 'grid_ref': map_view.grid_ref}

    else:
        context = {'layer_status': 0, 'map_id': '',
                   'map_type': '', 'layer_file_type': ''}

    return render(request, 'map/view.html', context)


@csrf_exempt
def save_as_map(request):
    if request.method == "POST":

        layer_name = request.POST['layer_name']
        layer_status = request.POST['layer_status']
        layer_descri = request.POST['layer_descri']
        groupID = request.POST['group_id']
        mapType = request.POST['map_type']
        map_center = request.POST['map_center']
        map_zoom = request.POST['map_zoom']
        mapTool_data_frame = request.POST['mapTool_data_frame']
        mapTool_legend = request.POST['mapTool_legend']
        mapTool_title = request.POST['mapTool_title']
        mapTool_north_arrow = request.POST['mapTool_north_arrow']
        mapTool_scale = request.POST['mapTool_scale']
        mapTool_citation = request.POST['mapTool_citation']
        mapTool_grid = request.POST['mapTool_grid']
        mapTool_data = request.POST['mapTool_data']
        mapTool_insert_map = request.POST['mapTool_insert_map']
        legend = request.POST['legend']

        nowTime = datetime.now()
        current_user = request.user
        group_layerfileId = ''

        if (layer_name != '' and layer_status != ''):

            add_layer = Layer_maps(
                layer_name=layer_name,
                map_type=mapType,
                map_center=map_center,
                map_zoom=map_zoom,
                data_frame=mapTool_data_frame,
                legend_status=mapTool_legend,
                title=mapTool_title,
                north_arrow=mapTool_north_arrow,
                scale=mapTool_scale,
                citation=mapTool_citation,
                grid_ref=mapTool_grid,
                insert_map=mapTool_insert_map,
                desc_status=mapTool_data,
                legend=legend,
                layer_status=layer_status,
                layer_descri=layer_descri,
                layerdraw_status=1,
                user_id=current_user.pk,
                created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
            )
            add_layer.save()
            layerfileId = add_layer.pk

            # For Group
            if groupID != '':
                add_group_layer = Group_layer_maps(
                    group_id=groupID,
                    layer_name=layer_name,
                    map_type=mapType,
                    map_center=map_center,
                    map_zoom=map_zoom,
                    data_frame=mapTool_data_frame,
                    legend_status=mapTool_legend,
                    title=mapTool_title,
                    north_arrow=mapTool_north_arrow,
                    scale=mapTool_scale,
                    citation=mapTool_citation,
                    grid_ref=mapTool_grid,
                    insert_map=mapTool_insert_map,
                    desc_status=mapTool_data,
                    legend=legend,
                    layer_status=layer_status,
                    layer_descri=layer_descri,
                    layerdraw_status=1,
                    layer_draw_id=layerfileId,
                    user_id=current_user.pk,
                    last_modifed_user=current_user.pk,
                    created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                    updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                )
                add_group_layer.save()
                group_layerfileId = add_group_layer.pk

                add_layer.group_layer_draw_id = group_layerfileId
                add_layer.save()

            # /For Group
            response = {'status': 1, 'mapLayerId': layerfileId,
                        'group_mapLayerId': group_layerfileId}

        else:
            response = {'status': 0}
    else:
        response = {'status': 0}

    return JsonResponse(response)


@csrf_exempt
def save_map_file(request):
    if request.method == "POST":

        geojsonData = request.POST['dataGeojson']

        if geojsonData != '':

            layer_name = request.POST['layer_name']
            layerfileID = request.POST['layerfileID']
            layer_status = request.POST['layer_status']
            groupID = request.POST['group_id']
            groupFildID = request.POST['group_file_id']
            layer_order = request.POST['layer_order']
            nowTime = datetime.now()
            current_user = request.user
            media_root = settings.MEDIA_ROOT

            if (layer_name != '' and layerfileID != ''):

                add_layerfile = Layer_mapfiles(
                    layer_name=layer_name,
                    layer_draw_id=layerfileID,
                    layer_status=layer_status,
                    layerdrawfile_status=0,
                    layer_order=layer_order,
                    user_id=current_user.pk,
                    last_modifed_user=current_user.pk,
                    created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                    updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                )
                add_layerfile.save()
                layerfile_id = add_layerfile.pk

                fileName = 'mapdata_' + \
                    str(layerfileID)+'_'+str(layerfile_id)+'.json'
                file_path = 'media/map_layers/'+fileName
                full_filepath = os.path.abspath(os.path.join(
                    os.path.dirname(media_root), file_path))

                jsonData = json.loads(geojsonData)
                with open(full_filepath, 'w') as outfile:
                    json.dump(jsonData, outfile)

                add_layerfile.layer_file = fileName
                add_layerfile.layerdrawfile_status = 1
                add_layerfile.updated_at = nowTime.strftime(
                    "%Y-%m-%d %H:%M:%S")
                add_layerfile.save()

                # For Group
                if groupFildID != '':
                    add_group_layerfile = Group_layer_filemaps(
                        group_id=groupID,
                        grouplayer_draw_id=groupFildID,
                        layer_name=layer_name,
                        layer_status=layer_status,
                        layerdraw_status=0,
                        layer_draw_id=layerfileID,
                        layer_order=layer_order,
                        user_id=current_user.pk,
                        last_modifed_user=current_user.pk,
                        created_at=nowTime.strftime("%Y-%m-%d %H:%M:%S"),
                        updated_at=nowTime.strftime("%Y-%m-%d %H:%M:%S")
                    )
                    add_group_layerfile.save()
                    add_group_layerfile = add_group_layerfile.pk

                    group_fileName = 'group_drawmapdata_' + \
                        str(groupID)+'_'+str(add_group_layerfile)+'.json'
                    group_file_path = 'media/draw_layers/' + group_fileName
                    group_full_filepath = os.path.abspath(os.path.join(
                        os.path.dirname(media_root), group_file_path))

                    group_jsonData = json.loads(geojsonData)
                    with open(group_full_filepath, 'w') as outfile:
                        json.dump(group_jsonData, outfile)

                    update_group_layerfile = Group_layer_drawfile.objects.get(
                        pk=add_group_layerfile, group_id=groupID)
                    update_group_layerfile.layer_file = group_fileName
                    update_group_layerfile.layerdraw_status = 1
                    update_group_layerfile.updated_at = nowTime.strftime(
                        "%Y-%m-%d %H:%M:%S")
                    update_group_layerfile.save()

                # /For Group
                response = {'status': 1, 'mapLayerId': layerfile_id,
                            'filepath': file_path, 'group_mapLayerId': groupFildID}

            else:
                response = {'status': 0, 'filepath': ""}
        else:
            response = {'status': 0, 'filepath': ""}
    else:
        response = {'status': 0, 'filepath': ""}

    return JsonResponse(response)


def map_data(request, layerId=None, groupId=None, *args, **kwargs):
    groupLayerArr = []

    if(int(groupId) > 0 and int(layerId) > 0):

        groupLayer = Group_layer_maps.objects.get(pk=layerId)
        groupFiles = Group_layer_filemaps.objects.filter(
            grouplayer_draw_id=layerId, group_id=groupId, layerdraw_status=1).order_by('-layer_order')

        if len(groupFiles) > 0:
            for groupFile in groupFiles:
                fileRow = {'fileId': groupFile.pk, 'groupLayerId': groupFile.grouplayer_draw_id, 'layerName': groupFile.layer_name,
                           'layerStatus': groupFile.layer_status, 'layerFile': groupFile.layer_file, 'layerOder': groupFile.layer_order}
                groupLayerArr.append(fileRow)

            response = {'status': 1, 'rows': groupLayerArr,
                        'group_id': groupId, 'map_id': layerId}

    elif(int(groupId) == 0 and int(layerId) > 0):

        layers = Layer_maps.objects.get(pk=layerId)
        layerFiles = Layer_mapfiles.objects.filter(
            layer_draw_id=layerId, layerdrawfile_status=1).order_by('-layer_order')

        if len(layerFiles) > 0:
            for layerFile in layerFiles:
                fileRow = {'fileId': layerFile.pk, 'groupLayerId': groupId, 'layerName': layerFile.layer_name,
                           'layerStatus': layerFile.layer_status, 'layerFile': layerFile.layer_file, 'layerOder': layerFile.layer_order}
                groupLayerArr.append(fileRow)

        response = {'status': 1, 'rows': groupLayerArr,
                    'group_id': groupId, 'map_id': layerId}

    else:
        response = {'status': 0, 'rows': '', 'group_id': '', 'map_id': ''}

    return JsonResponse(response)


def map_get_legends(request, mapID=None, groupId=None, *args, **kwargs):
    mapLegendMain = []
    mapLegendSub = []

    if(int(groupId) > 0 and int(mapID) > 0):

        map_view = Group_layer_maps.objects.get(pk=int(mapID))
        data = json.loads(map_view.legend)

        if len(data['main_legend']) > 0:
            for main_legend in data['main_legend']:
                row = {
                    'legend_text': main_legend['text'], 'legend_color': main_legend['color']}
                mapLegendMain.append(row)

        if len(data['sub_legend']) > 0:
            for main_legend in data['sub_legend']:
                row = {
                    'legend_text': main_legend['text'], 'legend_color': main_legend['color']}
                mapLegendSub.append(row)

        response = {'status': 1, 'main_legend': mapLegendMain,
                    'sub_legend': mapLegendSub}

    elif (int(groupId) == 0 and int(mapID) > 0):

        map_view = Layer_maps.objects.get(pk=int(mapID))
        data = json.loads(map_view.legend)

        if len(data['main_legend']) > 0:
            for main_legend in data['main_legend']:
                row = {
                    'legend_text': main_legend['text'], 'legend_color': main_legend['color']}
                mapLegendMain.append(row)

        if len(data['sub_legend']) > 0:
            for main_legend in data['sub_legend']:
                row = {
                    'legend_text': main_legend['text'], 'legend_color': main_legend['color']}
                mapLegendSub.append(row)

        response = {'status': 1, 'main_legend': mapLegendMain,
                    'sub_legend': mapLegendSub}
    else:
        response = {'status': 0, 'main_legend': [], 'sub_legend': []}

    return JsonResponse(response)
