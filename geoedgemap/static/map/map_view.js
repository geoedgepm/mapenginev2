var server_url = 'http://127.0.0.1:8000/';
var subdivision = '';

var map;
var layersGroups = [];
var layer_title;
var randomColorArray = [];
var miniMap;
var graphicScale;
var grid;

function init(map_id, group_id, mapZoom, mapCenter, layerTitle, data_frame, min_map, legend_status, grid_ref){
    let map_enter = mapCenter.split(",");
    let lat = (map_enter[0] && !isNaN(map_enter[0]))?map_enter[0]:0;
    let lng = (map_enter[1] && !isNaN(map_enter[1]))?map_enter[1]:0;
    let map_zoom = (mapZoom > 0)?mapZoom:1;

    if(layerTitle == 'OSM'){
        layer_title = L.tileLayer.provider('OpenStreetMap.Mapnik');
    }else if(layerTitle == 'NON_OSM'){
        layer_title = L.tileLayer('')
    }else if(layerTitle == 'googleSatellite'){
        layer_title = L.gridLayer.googleMutant({type:'satellite'});
    }else if(layerTitle == 'googleTerrain'){
        layer_title = L.gridLayer.googleMutant({type:'terrain'});
    }else if(layerTitle == 'googleTerrain'){
        layer_title = L.gridLayer.googleMutant({type:'terrain'});
    }else if(layerTitle == 'googleHybrid'){
        layer_title = L.gridLayer.googleMutant({type:'hybrid'});
    }else if(layerTitle == 'osm_german_style'){
        layer_title = L.tileLayer.provider('OpenStreetMap.DE');
    }else if(layerTitle == 'osm_BlackAndWhite'){
        layer_title = L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
    }else if(layerTitle == 'osm_hot'){
        layer_title = L.tileLayer.provider('OpenStreetMap.HOT');
    }else if(layerTitle == 'Thunderforest_OpenCycleMap'){
        layer_title = L.tileLayer.provider('Thunderforest.OpenCycleMap');
    }else if(layerTitle == 'Thunderforest_Transport'){
        layer_title = L.tileLayer.provider('Thunderforest.Transport');
    }else if(layerTitle == 'Thunderforest_Landscape'){
       layer_title = L.tileLayer.provider('Thunderforest.Landscape');
    }else if(layerTitle == 'Hydda_full'){
        layer_title = L.tileLayer.provider('Hydda.Full');
    }else if(layerTitle == 'Stamen_toner'){
        layer_title = L.tileLayer.provider('Stamen.Toner');
    }else if(layerTitle == 'Stamen_terrain'){
       layer_title = L.tileLayer.provider('Stamen.Terrain');
    }else if(layerTitle == 'Stamen_watercolor'){
        layer_title = L.tileLayer.provider('Stamen.Watercolor');
    }else if(layerTitle == 'Esri_worldStreetMap'){
        layer_title = L.tileLayer.provider('Esri.WorldStreetMap');
    }else if(layerTitle == 'Esri_DeLorme'){
       layer_title = L.tileLayer.provider('Esri.DeLorme');
    }else if(layerTitle == 'Esri_WorldTopoMap'){
        layer_title = L.tileLayer.provider('Esri.WorldTopoMap');
    }else if(layerTitle == 'Esri_worldImagery'){
        layer_title = L.tileLayer.provider('Esri.WorldImagery');
    }else if(layerTitle == 'Esri_WorldTerrain'){
        layer_title = L.tileLayer.provider('Esri.WorldTerrain');
    }else if(layerTitle == 'Esri_WorldShadedRelief'){
        layer_title = L.tileLayer.provider('Esri.WorldShadedRelief');
    }else if(layerTitle == 'Esri_WorldPhysical'){
        layer_title = L.tileLayer.provider('Esri.WorldPhysical');
    }else if(layerTitle == 'Esri_OceanBasemap'){
        layer_title = L.tileLayer.provider('Esri.OceanBasemap');
    }else if(layerTitle == 'Esri_NatGeoWorldMap'){
        layer_title = L.tileLayer.provider('Esri.NatGeoWorldMap');
    }else if(layerTitle == 'Esri_WorldGrayCanvas'){
        layer_title = L.tileLayer.provider('Esri.WorldGrayCanvas');
    }else if(layerTitle == 'GeoportailFrance'){
        layer_title = L.tileLayer.provider('GeoportailFrance');
    }else if(layerTitle == 'GeoportailFrance_orthos'){
        layer_title = L.tileLayer.provider('GeoportailFrance.orthos');
    }else if(layerTitle == 'GeoportailFrance_ignMaps'){
        layer_title = L.tileLayer.provider('GeoportailFrance.ignMaps');
    }else if(layerTitle == 'bing_map'){
        var BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
        layer_title = L.tileLayer.bing(BING_KEY);
    }else if(layerTitle == 'mapbox'){
        layer_title = L.mapboxGL({
                    accessToken: 'no-token',
                    style: 'http://127.0.0.1:8000/static/css/bright-v9-cdn.json'
                    });
    }else{
        layer_title = L.tileLayer.provider('OpenStreetMap.Mapnik');
    }

    map = new L.Map('map', {center: new L.LatLng(lat, lng), zoom: map_zoom, zoomControl: false});
    layer_title.addTo(map);

    if(min_map == 1){
        var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var miniOsm = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: map_zoom});
        var miniMap = new L.Control.MiniMap(miniOsm, { centerFixed: [lat, lng],  toggleDisplay: true, width: 180, height: 110 }).addTo(map);
    }

    graphicScale = L.control.graphicScale({doubleLine: true, fill: 'hollow'}).addTo(map);

    if(data_frame == 1){
        geojsons_to_map(map_id, group_id, false);
    }

    if(grid_ref == 1){
        grid = L.grid().addTo(map);
    }


    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();


    // Legend
    if(legend_status == 1){
        (function($) {
            $.ajax({
                  url:"/map/get_legends/"+map_id+"/"+group_id+"/",
                  type: 'GET',
                  dataType: "json",
                  error: function (xhr) {
                    // alert_notification_popup('fail', 7);
                  },
                  success: function(data){
                        var row = '';
                        if(data['status'] == 1){

                                if(data['main_legend'].length > 0){
                                    var legends = data['main_legend'];
                                    for(var l=0; l<legends.length;l++){
                                        row +='<tr><td><div class="rectangle" style="background-color:'+legends[l]['legend_color']+';"></div></td><td>'+legends[l]['legend_text']+'</td></tr>';
                                    }
                                }

                                if(data['sub_legend'].length > 0){
                                    var legends = data['sub_legend'];
                                    for(var l=0; l<legends.length;l++){
                                        row +='<tr><td><div class="rectangle" style="background-color:'+legends[l]['legend_color']+';"></div></td><td>'+legends[l]['legend_text']+'</td></tr>';
                                    }
                                }
                                $("#legend_table tbody").append(row);
                        }
                  }
            });
        })(jQuery);
    }
    // /Legend
}

/* [START] - Load geojson file to Map*/
function geojsons_to_map(layer_id, group_id, fitBound, layer_name){

    var groupID = 0

    if(group_id !='' && group_id != null){
        groupID = group_id;
    }

    var get_data = $.ajax({
                  url:"/map/mapsdata/"+layer_id+"/"+groupID+"/",
                  type:'GET',
                  dataType: "json",
                  success: '', //alert_notification_popup('success', 2),
                  error: function (xhr) {
                   // alert_notification_popup('fail', 7);
                  }
                });

    $.when(get_data).done(function(){
        var response = jQuery.parseJSON(get_data.responseText);

        if(response['status'] == 1){

            var filesData = response['rows'];
            var filesCount = filesData.length;
            var promises = [];

            for(f=0; f<filesCount; f++){

                var filename = filesData[f].layerFile;
                var changeStr = filename.replace(".json", "");
                var rechangeStr = changeStr.replace(".", "_");
                var group_Id = rechangeStr;

                var layer_name = filesData[f].layerName;
                var fileID = filesData[f].fileId;
                var layerStatus = filesData[f].layerStatus;

                var file_url = "/media/map_layers/"+filename;

                var getJson = $.ajax({
                        url: file_url,
                        async: false,
                        dataType: 'json',
                        done: function(results) {
                            return results;
                        }
                    }).responseJSON;

                var layerGroup = {'getJson':getJson, group_id:group_Id, group_name:layer_name, fileType:'geojson', fileID:fileID, layer_status:layerStatus};
                promises.push(layerGroup);

            }

            $.when.apply($, promises).then(function(){

                for(var i = 0; i < arguments.length; i++){
                    var geojsonFileMap = L.geoJson(promises[i].getJson);
                    var layerGroup = {group_id:promises[i].group_id, geoJson:geojsonFileMap, group_name:promises[i].group_name, fileType:'geojson', fileID:promises[i].fileID, layer_status:promises[i].layer_status};

                    layerGroup_add(layerGroup);

                    if(fitBound === true){
                        map.fitBounds(geojsonFileMap.getBounds(),{padding: [30, 30]});
                    }
                }
            });
        }
    });
}


/* [START] - Add Layer to Map */
function layerGroup_add(layerGroup){

    var layer_group = layerGroup.group_id;
    var geojson = layerGroup.geoJson;
    var layer_name = layerGroup.group_name;
    var layer_statuts = layerGroup.layer_status;
    var get_fillColor = "#ff0066", get_Color = "#3399ff", get_fillOpacity = 0.8, get_opacity = 1, get_weight = 2, get_fill = true, get_stroke = true, get_dashArray = [];

    window[layer_group] = L.layerGroup();
    window[layer_group].addLayer(geojson);
    window[layer_group].addTo(map);

    /* Generate Color & add color to layer*/
    var random_color = getRandomColor();
    var random_fillcolor = getRandomColor();
    /* /Generate Color & add color to layer*/

    var getLayer = window[layer_group].toGeoJSON();
    var layer_temp = getLayer;

    window[layer_group].clearLayers();

    var newGeoJson = L.geoJson(layer_temp, {
                    //onEachFeature: onEachFeature,
                    pointToLayer: function(feature, latlng) {
                        var geometry = feature.geometry;
                        var properties = feature.properties;
                         var table, popup, propertiesArr = {};
                         var popup_status = 0;

                        if(geometry['type'] == 'Point'){

                            var _layerRadius = properties['_layerRadius'];
                            if(_layerRadius != null){
                                fillcolor = feature.properties['_layerFillColor'];
                                var color = feature.properties['_layerColor'];
                                var fillOpacity = feature.properties['_layerFillOpacity'];
                                var opacity = feature.properties['_layerOpacity'];
                                var weight = feature.properties['_layerWeight'];

                                var circle = L.circle([latlng.lat, latlng.lng],{radius: _layerRadius, color:color,weight:weight, opacity:opacity,fillColor: fillcolor,fillOpacity:fillOpacity}).addTo(window[layer_group]);
                                 circle.feature = {
                                                   type: 'Feature',
                                                   geometry:{type: "Point", coordinates: [latlng.lng, latlng.lat]},
                                                   properties:propertiesArr
                                                  };
                                if(popup_status != 0){
                                    circle.bindPopup(table);
                                }
                                circle.addTo(window[layer_group]);

                            }else if(_layerRadius == null){
                                var marker = L.marker([latlng.lat, latlng.lng]).addTo(window[layer_group]);
                                marker.feature = {
                                                   type: 'Feature',
                                                   geometry:{type: "Point", coordinates: [latlng.lng, latlng.lat]},
                                                   properties:propertiesArr
                                                  };
                                if(popup_status != 0){
                                     marker.bindPopup(table);
                                }
                                marker.addTo(window[layer_group]);
                            }
                        }
                    },
                    style: function(feature){

                        var geometry = feature.geometry;

                        if(geometry['type'] != 'Point'){

                            var fillcolor = (!feature.properties['_layerFillColor'])? random_fillcolor : feature.properties['_layerFillColor'];
                            var color = (!feature.properties['_layerColor'])? random_color : feature.properties['_layerColor'];
                            var fillOpacity = (!feature.properties['_layerFillOpacity'])? 0.8 : feature.properties['_layerFillOpacity'];
                            var opacity = (!feature.properties['_layerOpacity'])? 1 : feature.properties['_layerOpacity'];
                            var fill = (!feature.properties['_layerFill'])? true : feature.properties['_layerFill'];
                            var weight = (!feature.properties['_layerWeight'])? 2 : feature.properties['_layerWeight'];
                            var stroke = (!feature.properties['_layerStroke'])? true : feature.properties['_layerStroke'];
                            var dashArray = (!feature.properties['_layerDashArray'])? [] : feature.properties['_layerDashArray'];

                            get_fillColor = fillcolor;
                            get_Color = color;
                            get_fillOpacity = fillOpacity;
                            get_opacity = opacity;
                            get_weight = weight;
                            get_fill = fill;
                            get_stroke = stroke;
                            get_dashArray = dashArray;

                            return {
                                fillColor: fillcolor,
                                color: color,
                                fillOpacity:fillOpacity,
                                opacity:opacity,
                                weight:weight,
                                fill:fill,
                                stroke:stroke
                            };
                        }
                    },
                });

    if(layerGroup.fileType != 'kml'){
        window[layer_group].addLayer(newGeoJson).addTo(map);
    }else{
        window[layer_group].addLayer(geojson).addTo(map);
    }

//    create_layers_list_to_legend(layer_group, layer_name, get_fillColor);

    /* store style of layer group */
    layerGroup._layerColor = get_Color;
    layerGroup._layerFillColor = get_fillColor;
    layerGroup._layerWeight = get_weight;
    layerGroup._layerOpacity = get_opacity;
    layerGroup._layerFillOpacity = get_fillOpacity;
    layerGroup._layerFill= get_fill;
    layerGroup._layerStroke= get_stroke;
    layerGroup._layerDashArray= get_dashArray;
    layerGroup.layer_status = 1;
    layersGroups.push(layerGroup);
    /* /store style of layer group */

    /* Layer Hide */
    if(layer_statuts == 0){
        map.removeLayer(window[layer_group]);
    }
    /* /Layer Hide */
}
/* [END] - Add Layer to Map */


/* [START] - Random color generator */
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  var new_color = color;
  var isExistColor = randomColorArray.includes(new_color);
  if(isExistColor === false){
    randomColorArray.push(isExistColor);
    return new_color;
  }else{
    getRandomColor();
  }
}
/* [END] - Random color generator */