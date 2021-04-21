var server_url = 'http://geoedge.lk';
var subdivision = '/aaib_map';
//var server_url = 'http://127.0.0.1:8000/';
//var subdivision = '';

$(function(){

/*[START] - Map Tool*/
    $("#mapTool").draggable({
        handle: ".mapTool_hand"
    });

    $('#mtclose').click(function(){
        $('#mapTool').slideToggle();
    });

    $("#mapTool_dataFrame").click(function(){
        if($("#map_fram").is(":hidden")){
            $("#map_fram").show();
        }else{
            $("#map_fram").hide();
        }
    });

/*[START] - Title*/
    $("#mapToolTitle").click(function(){
         var title_block = '<div class="map_tool_title_block" style="position: absolute; top: 60px; left:700px; z-index: 1000000000000000; cursor: move;"><span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span><h2><span class="title_text" style="cursor: text;">Title</span></h2></div>';
            $("#page_area").append(title_block);

            $(".map_tool_title_block").draggable();
            $(".map_tool_title_block").resizable();

            $(".title_text").editable({
                multiline: true,
                autoselect: true
            });

            $(".map_tool_title_block").mouseover(function(){
                var $this = $(this);
                $(this).css('border', '1px dashed #8c8c8c');
                $this.find('.close_btn_span').show();
            });

            $(".map_tool_title_block").mouseout(function(){
                var $this = $(this);
                $(this).css('border', '');
                $this.find('.close_btn_span').hide();
            });

            $('.close_img').click(function(){
                var $this = $(this).parent();
                $this.parent().remove();
            });
    });

/*[END] - Title*/

/*[START] - North Arrow*/

$('#mapToolNorthArrow').click(function(){
    $('.northArrowContent').toggle();
});

$(".northArrowContent").mouseover(function(){
    $(this).css('border', '1px dashed #8c8c8c');
});

$(".northArrowContent").mouseout(function(){
    $(this).css('border', '');
});

$("#north_arrow_content").resizable();
$("#north_arrow_content").draggable();
/*[END] - North Arrow*/


/*[START] - Scale Bar*/
$('#mapToolScaleBar').click(function(){

    if($("#scale_bar_content").length == 0) {
           var scale_bar_content = '<div id="scale_bar_content" class="mapToolScaleBarContent" style="width: 300px; height: 80px; padding: 0.5em; margin: 0.5; position: absolute; top: 5cm; right: 1cm; cursor: move; z-index: 1000000000000000; display: none;">'
                            +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                            +'<div id="scale_bar" style="cursor: move; width: 100%; height: 100%;">'
                            +'</div></div>';

           $("#page_area").append(scale_bar_content);

           $("#scale_bar_content").resizable();
           $("#scale_bar_content").draggable();

            $("#scale_bar_content").mouseover(function(){
                var $this = $(this);
                $(this).css('border', '1px dashed #8c8c8c');
                $this.find('.close_btn_span').show();
            });

            $("#scale_bar_content").mouseout(function(){
                var $this = $(this);
                $(this).css('border', '');
                $this.find('.close_btn_span').hide();
            });

            $('.close_img').click(function(){
                var $this = $(this).parent();
                $this.parent().remove();
            });
    }

    $("#scale_bar").empty();
    $('.mapToolScaleBarContent').toggle();



    if($("#loyout_panel").is(":hidden")){
        //
    }else{
        var scale_block = document.getElementsByClassName("leaflet-bottom")[0];
        var scale_clone = scale_block.firstElementChild.cloneNode(true);
        var scale_div = document.getElementById("scale_bar");
        scale_div.appendChild(scale_clone);

        html2canvas(document.querySelector("#scale_bar")).then(canvas => {
            var  canvas_re= document.body.appendChild(canvas);
            $("#scale_bar").empty();
            $("#scale_bar").append(canvas_re);
        });
    }

    var element = $(".legend_contain")[0]; // global variable
    var getCanvas;

     html2canvas(element, {
     allowTaint: true,
     onrendered: function (canvas) {
            $("#previewImage").append(canvas);
            getCanvas = canvas;
         }
     });
});

$("#scale_bar_content").resizable();
$("#scale_bar_content").draggable();

$("#scale_bar_content").mouseover(function(){
    var $this = $(this);
    $(this).css('border', '1px dashed #8c8c8c');
    $this.find('.close_btn_span').show();
});

$("#scale_bar_content").mouseout(function(){
    var $this = $(this);
    $(this).css('border', '');
    $this.find('.close_btn_span').hide();
});

$('.close_img').click(function(){
    var $this = $(this).parent();
    $this.parent().remove();
});


/*[END] - Scale Bar*/

/*[START] - Scale Text*/
$("#mapToolScaleText").click(function(){
    var scale_text_block = '<div class="map_tool_scale_text_block" style="position: absolute; top: 250px; right: 60px; width:100px; z-index: 1000000000000000; cursor: move;">'
                           +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                           +'<p><b><span class="scale_text_content text_style2" style="margin:5px;">'
                           +'<span class="scale_text_left" style="cursor: text;">1</span>'
                           +'<span class="scale_text_middle"> : </span>'
                           +'<span class="scale_text_right" style="cursor:text;">10000</span>'
                           +'</span></b></p>'
                           +'</div>';

    $("#page_area").append(scale_text_block);

    $(".map_tool_scale_text_block").draggable();
    $(".map_tool_scale_text_block").resizable();

    $(".scale_text_left").editable({
        autoselect: true
    });

    $(".scale_text_right").editable({
        autoselect: true
    });

    $(".map_tool_scale_text_block").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();

    });

    $(".map_tool_scale_text_block").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
        $this.find('.close_btn_span').hide();
    });

    $('.close_img').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });
});
/*[END] - Scale Text*/

/*[START] - Citation*/
$("#mapToolCitation").click(function(){
    var desc_block = '<div class="map_tool_citation_block" style="position: absolute; top: 280px; right: 60px; width:300px; z-index: 1000000000000000; cursor: move;">'
                   +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                   +'<p><span class="citation_content text_style2" style="cursor:text;">'
                   +'Authority :'
                   +'</span></p>'
                   +'</div>';

    $("#page_area").append(desc_block);

    $(".map_tool_citation_block").draggable();
    $(".map_tool_citation_block").resizable();

    $(".citation_content").editable({
        multiline: true,
        autoselect: true
    });

    $(".map_tool_citation_block").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();

    });

    $(".map_tool_citation_block").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
        $this.find('.close_btn_span').hide();
    });

    $('.close_img').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });
});
/*[END] - Citation*/


/*[START] - Description*/
$("#mapToolDescription").click(function(){
    var desc_block = '<div class="map_tool_description_block" style="position: absolute; top: 480px; left: 650px; width:400px; z-index: 1000000000000000; cursor: move;">'
                   +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                   +'<p><span class="description_content text_style" style="cursor:text;">Description</span></p>'
                   +'</div>';

    $("#page_area").append(desc_block);

    $(".map_tool_description_block").draggable();
    $(".map_tool_description_block").resizable();

    $(".description_content").editable({
        multiline: true,
        autoselect: true
    });

    $(".map_tool_description_block").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();

    });

    $(".map_tool_description_block").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
        $this.find('.close_btn_span').hide();
    });

    $('.close_img').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });
});
/*[END] - Description*/

/*[START] - Legend*/
$("#mapToolLegend").click(function(){

    var legend_block = '<div class="legend_contain" style="width: 200px; position: relative; top: 300px; left:800px; z-index: 1000000000000000; cursor: move;">'
                      +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                      +'<div class="text_style2" style="padding: 5px;">'
                      +'<b><span class="legend_title" style="cursor: text;">Legend</span></b>'
                      +'<span class="legend_add_btn" style="margin-left: 20px; padding: 5px; cursor: pointer; display:none;" title="Add Legend"><b>+</b></span>'
                      +'</div>'
                      +'<div class="legend_content" style="width:200px; left: 0px;">';


    // Get Legend
    var legend_text = '';
    var lagendMain = '', legendSub = '';

    $.each($("#legend_content_layer .legend_row"), function(){
        var $this = $(this);
        var $color = $(this).find('.legend_text').css("color");
        var $text = $.trim($this.text());

        var legend_row = '<div class="legen_row" style="margin: 5px; cursor: move;"><div id="legend_rectangle" class="legend_rectangle" style="background-color:'+$color+'!important; -webkit-print-color-adjust: exact; float: left; cursor: pointer;"></div><div class="legen_text text_style" style="float: left; margin-left: 10px; cursor: text;">'+$text+'</div><b><span class="legend_row_close text_style" style="float: right; cursor: pointer; margin-right: 10px; color: #ff0000; display:none;">x</span></b><br></div>';
        lagendMain +=legend_row;
    });

    $.each($(".legend_subcontent .legend_row"), function(){
        var $this = $(this);
        var $color = $(this).find('.legend_text').css("color");
        var $text = $.trim($this.text());
        var legend_row = '<div class="legen_row" style="margin: 5px; cursor: move;"><div id="legend_rectangle" class="legend_rectangle" style="background-color:'+$color+'!important; -webkit-print-color-adjust: exact; float: left; cursor: pointer;"></div><div class="legen_text text_style" style="float: left; margin-left: 10px; cursor: text;">'+$text+'</div><b><span class="legend_row_close text_style" style="float: right; cursor: pointer; margin-right: 10px; color: #ff0000; display:none;">x</span></b><br></div>';
        legendSub +=legend_row;
    });

    legend_block +=lagendMain;
    legend_block +=legendSub;
    legend_block += '</div></div>';

    $("#page_area").append(legend_block);

     $(".legend_contain").draggable();
     $(".legend_contain").resizable();
     $(".legend_title").editable({multiline: true, autoselect: true});
     $(".legen_text").editable({multiline: true, autoselect: true});
     $(".legen_row").draggable();

    // Colpick
     $('.legend_rectangle').colpick({
        layout:'rgbhex',
        color: 'ff0000',
        onSubmit:function(hsb,hex,rgb,el,bySetColor) {
            var hex_color = '#'+hex;
            $(el).css('background-color', hex_color);
            $(el).colpickHide();
        }
    });
    $('.colpick').css({'z-index' : '10000000000000000'});
    // /Colpick


    $(".legend_contain").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();
        $this.find('.legend_add_btn').show();

        var $legend_content = $this.find('.legend_content');
        var $legen_row = $legend_content.find('.legen_row');
        $legen_row.find('.legend_row_close').show();
    });

    $(".legend_contain").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
        $this.find('.close_btn_span').hide();
        $this.find('.legend_add_btn').hide();

        var $legend_content = $this.find('.legend_content');
        var $legen_row = $legend_content.find('.legen_row');
        $legen_row.find('.legend_row_close').hide();
    });

    $('.close_img').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });


    $(".legen_row").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
    });

    $(".legen_row").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
    });

    $('.legend_row_close').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });

    $('.legend_add_btn').click(function(){
        var $this = $(this).parent();
        var $parents = $this.parent();
        var $legend_content = $parents.find('.legend_content');
        var new_legend = '<div class="legen_row" style="margin: 5px; cursor: move;"><div id="legend_rectangle" class="legend_rectangle" style="background-color:rgb(204, 204, 204); float: left; cursor: pointer;"></div><div class="legen_text text_style" style="float: left; margin-left: 10px; cursor: text;">Text</div><b><span class="legend_row_close text_style" style="float: right; cursor: pointer; margin-right: 10px; color: #ff0000; display:none;">x</span></b><br></div>';
        $legend_content.append(new_legend);

        $(".legen_text").editable({multiline: true, autoselect: true});
        $(".legen_row").draggable();

        // Colpick
         $('.legend_rectangle').colpick({
            layout:'rgbhex',
            color: 'ff0000',
            onSubmit:function(hsb,hex,rgb,el,bySetColor) {
                var hex_color = '#'+hex;
                $(el).css('background-color', hex_color);
                $(el).colpickHide();
            }
        });
        $('.colpick').css({'z-index' : '10000000000000000'});
        // /Colpick

        $(".legen_row").mouseover(function(){
            var $this = $(this);
            $(this).css('border', '1px dashed #8c8c8c');
        });

        $(".legen_row").mouseout(function(){
            var $this = $(this);
            $(this).css('border', '');
        });

        $('.legend_row_close').click(function(){
            var $this = $(this).parent();
            $this.parent().remove();
        });
    });
});

/*[END] - Legend*/


/*[START] - Map Indicator*/
$("#mapToolIndicator").click(function(){
    $('#map_loyout .leaflet-control-minimap').toggle();
});
/*[END] - Map Indicator*/

/*[START] - Map Loyout*/

$('#layout_button').click(function(){
    if($("#loyout_panel").is(":hidden")){
        $('#mapTool').slideUp();
    }
});

$(".map_loyout_content").mouseover(function(){
    $(".map_loyout_hand").show();
});

$(".map_loyout_content").mouseout(function(){
    $(".map_loyout_hand").hide();
});

$("#map_fram").resizable();
$("#map_fram").draggable({
    handle: ".map_loyout_hand"
});
/*[END] - Map Loyout*/
});

var map_panel;
var map_panelLayers = [];
var layer_title_panel;
var randomColorArray_panel = [];
var miniMap_panel;
var graphicScale_panel;
var grid_panel;
var scale_bar;
var grid;
var grid_status = 1;
var temp_grid_status = 0;
var indicator_status = 1;
var temp_indicator_status = 0;
var miniMap;


function loyout_map_panel(mapZoom, mapCenter, layerTitle){

    (function($) {
        $('#loyout_panel').toggle();

        // Hide map tool on sheet
        $('#mapTool_on_sheet').hide();
        // /Hide map tool on sheet

        if($("#map_loyout").is(":hidden")){
           $("#map_loyout_area").empty();
        }else{
//            $("#map_tools_panel").css({'z-index':'10000000000000000', 'position':'fixed', 'top':'30px', 'right':'6%'});
            $("#mapTool").show();
            init_map_panel(mapZoom, mapCenter, layerTitle);
        }
    })(jQuery);
}


function init_map_panel(mapZoom, mapCenter, layerTitle){
    let map_enter = mapCenter.split(",");
    let lat = (map_enter[0] && !isNaN(map_enter[0]))?map_enter[0]:0;
    let lng = (map_enter[1] && !isNaN(map_enter[1]))?map_enter[1]:0;
    let map_zoom = (mapZoom > 0)?mapZoom:1;

    if(layerTitle == 'OSM'){
        layer_title_panel = L.tileLayer.provider('OpenStreetMap.Mapnik');
    }else if(layerTitle == 'NON_OSM'){
        layer_title_panel = L.tileLayer('')
    }else if(layerTitle == 'googleSatellite'){
        layer_title_panel = L.gridLayer.googleMutant({type:'satellite'});
    }else if(layerTitle == 'googleTerrain'){
        layer_title_panel = L.gridLayer.googleMutant({type:'terrain'});
    }else if(layerTitle == 'googleTerrain'){
        layer_title_panel = L.gridLayer.googleMutant({type:'terrain'});
    }else if(layerTitle == 'googleHybrid'){
        layer_title_panel = L.gridLayer.googleMutant({type:'hybrid'});
    }else if(layerTitle == 'osm_german_style'){
        layer_title_panel = L.tileLayer.provider('OpenStreetMap.DE');
    }else if(layerTitle == 'osm_BlackAndWhite'){
        layer_title_panel = L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
    }else if(layerTitle == 'osm_hot'){
        layer_title_panel = L.tileLayer.provider('OpenStreetMap.HOT');
    }else if(layerTitle == 'Thunderforest_OpenCycleMap'){
        layer_title_panel = L.tileLayer.provider('Thunderforest.OpenCycleMap');
    }else if(layerTitle == 'Thunderforest_Transport'){
        layer_title_panel = L.tileLayer.provider('Thunderforest.Transport');
    }else if(layerTitle == 'Thunderforest_Landscape'){
       layer_title_panel = L.tileLayer.provider('Thunderforest.Landscape');
    }else if(layerTitle == 'Hydda_full'){
        layer_title_panel = L.tileLayer.provider('Hydda.Full');
    }else if(layerTitle == 'Stamen_toner'){
        layer_title_panel = L.tileLayer.provider('Stamen.Toner');
    }else if(layerTitle == 'Stamen_terrain'){
       layer_title_panel = L.tileLayer.provider('Stamen.Terrain');
    }else if(layerTitle == 'Stamen_watercolor'){
        layer_title = L.tileLayer.provider('Stamen.Watercolor');
    }else if(layerTitle == 'Esri_worldStreetMap'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldStreetMap');
    }else if(layerTitle == 'Esri_DeLorme'){
       layer_title_panel = L.tileLayer.provider('Esri.DeLorme');
    }else if(layerTitle == 'Esri_WorldTopoMap'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldTopoMap');
    }else if(layerTitle == 'Esri_worldImagery'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldImagery');
    }else if(layerTitle == 'Esri_WorldTerrain'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldTerrain');
    }else if(layerTitle == 'Esri_WorldShadedRelief'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldShadedRelief');
    }else if(layerTitle == 'Esri_WorldPhysical'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldPhysical');
    }else if(layerTitle == 'Esri_OceanBasemap'){
        layer_title_panel = L.tileLayer.provider('Esri.OceanBasemap');
    }else if(layerTitle == 'Esri_NatGeoWorldMap'){
        layer_title_panel = L.tileLayer.provider('Esri.NatGeoWorldMap');
    }else if(layerTitle == 'Esri_WorldGrayCanvas'){
        layer_title_panel = L.tileLayer.provider('Esri.WorldGrayCanvas');
    }else if(layerTitle == 'GeoportailFrance'){
        layer_title_panel = L.tileLayer.provider('GeoportailFrance');
    }else if(layerTitle == 'GeoportailFrance_orthos'){
        layer_title_panel = L.tileLayer.provider('GeoportailFrance.orthos');
    }else if(layerTitle == 'GeoportailFrance_ignMaps'){
        layer_title_panel = L.tileLayer.provider('GeoportailFrance.ignMaps');
    }else if(layerTitle == 'bing_map'){
        var BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
        layer_title_panel = L.tileLayer.bing(BING_KEY);
    }else if(layerTitle == 'mapbox'){
        layer_title_panel = L.mapboxGL({
                    accessToken: 'no-token',
                    style: 'http://127.0.0.1:8000/static/css/bright-v9-cdn.json'
                    });
    }else{
        layer_title_panel = L.tileLayer.provider('OpenStreetMap.Mapnik');
    }

     document.getElementById('map_loyout_area').innerHTML = "<div id='map_loyout' style='width: 100%; height: 100%;'></div>";
     map_panel = new L.Map('map_loyout', {center: new L.LatLng(lat, lng), zoom: map_zoom, zoomControl: true});
     layer_title_panel.addTo(map_panel);

     scale_bar = L.control.graphicScale({doubleLine: true, fill: 'hollow'}).addTo(map_panel);

     layers_to_map();

    // Map Indicator
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var miniOsm = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: map_zoom});
    var miniMap = new L.Control.MiniMap(miniOsm, { centerFixed: [lat, lng],  toggleDisplay: true, width: 180, height: 110 }).addTo(map_panel);

    (function($) {
        $('#map_loyout .leaflet-control-minimap').hide();
    })(jQuery);
    // /Map Indicator


//    graphicScale = L.control.graphicScale({doubleLine: true, fill: 'hollow'}).addTo(map);

//    if(data_frame == 1){
//        geojsons_to_map(map_id, group_id, false);
//    }

//    if(grid_ref == 1){
//        grid = L.grid().addTo(map);
//    }


//    map.dragging.disable();
//    map.touchZoom.disable();
//    map.doubleClickZoom.disable();
//    map.scrollWheelZoom.disable();

}

function layers_to_map(){

    var layersOrder = $("#sortable").sortable("toArray");
    var layersOrderCount = layersOrder.length;

    for(var l=layersOrderCount-1; l>=0; l--){
        var groupID = layersOrder[l];
        var layerData;

        var fileId = $('#'+groupID).data("fileid");
        var groupID_visibility = $('#checkbox_'+groupID);
        var layer_status = 0;

        if (groupID_visibility.is(':checked')){
            layer_status = 1;
            layerData = toGeojson_generation(groupID);
        }

         if(layerData != null && layer_status==1){

            var random_color = getRandomColor();
            var random_fillcolor = getRandomColor();
            var fillcolor = random_fillcolor;

            var printGeoJson = L.geoJson(layerData, {
                    pointToLayer: function(feature, latlng) {

                        var geometry = feature.geometry;
                        var properties = feature.properties;

                        if(geometry['type'] == 'Point'){
                            var _layerRadius = properties['_layerRadius'];
                            if(_layerRadius != null){
                                fillcolor = feature.properties['_layerFillColor'];
                                var color = feature.properties['_layerColor'];
                                var fillOpacity = feature.properties['_layerFillOpacity'];
                                var opacity = feature.properties['_layerOpacity'];
                                var weight = feature.properties['_layerWeight'];

                                var circle = L.circle([latlng.lat, latlng.lng],{radius: _layerRadius, color:color,weight:weight, opacity:opacity,fillColor: fillcolor,fillOpacity:fillOpacity}).addTo(mapPrintLayers);
                                // return circle;

                            }else if(_layerRadius == null){
                                var marker = L.marker([latlng.lat, latlng.lng]).addTo(map_panel);
                                // return marker;
                            }
                        }
                    },
                    style: function(feature){

                        var geometry = feature.geometry;

                        if(geometry['type'] != 'Point'){

                            fillcolor = (!feature.properties['_layerFillColor'])? random_color : feature.properties['_layerFillColor'];
                            var color = (!feature.properties['_layerColor'])? random_fillcolor : feature.properties['_layerColor'];
                            var fillOpacity = (!feature.properties['_layerFillOpacity'])? 0.8 : feature.properties['_layerFillOpacity'];
                            var opacity = (!feature.properties['_layerOpacity'])? 1 : feature.properties['_layerOpacity'];
                            var fill = (!feature.properties['_layerFill'])? true : feature.properties['_layerFill'];
                            var weight = (!feature.properties['_layerWeight'])? 2 : feature.properties['_layerWeight'];
                            var stroke = (!feature.properties['_layerStroke'])? true : feature.properties['_layerStroke'];
                            var dashArray = (!feature.properties['_layerDashArray'])? [] : feature.properties['_layerDashArray'];

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

//            var layerNamePrint = $('#'+groupID+'_layerName').text();
//            var layerNameListPrint = '<div class="legend_row">'
//                                        +'<div class="rectangle_print" style="background-color: '+fillcolor+' !important; -webkit-print-color-adjust: exact;"></div> '+layerNamePrint
//                                        +'</div>';
//
//            $('#print_legend_context').append(layerNameListPrint);
            mapPrintLayers.addLayer(printGeoJson).addTo(map_panel);
        }

    }

}

/* [START] - Add Layer to Map */
function layerGroup_map(layerGroup){

    var layer_group = layerGroup.group_id;
    var geojson = layerGroup.geoJson;
    var layer_name = layerGroup.group_name;
    var layer_statuts = layerGroup.layer_status;
    var get_fillColor = "#ff0066", get_Color = "#3399ff", get_fillOpacity = 0.8, get_opacity = 1, get_weight = 2, get_fill = true, get_stroke = true, get_dashArray = [];

    window[layer_group] = L.layerGroup();
    window[layer_group].addLayer(geojson);
    window[layer_group].addTo(map_panel);

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
//                                if(popup_status != 0){
//                                    circle.bindPopup(table);
//                                }
                                circle.addTo(window[layer_group]);

                            }else if(_layerRadius == null){
                                var marker = L.marker([latlng.lat, latlng.lng]).addTo(window[layer_group]);
                                marker.feature = {
                                                   type: 'Feature',
                                                   geometry:{type: "Point", coordinates: [latlng.lng, latlng.lat]},
                                                   properties:propertiesArr
                                                  };
//                                if(popup_status != 0){
//                                     marker.bindPopup(table);
//                                }
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
        window[layer_group].addLayer(newGeoJson).addTo(map_panel);
    }else{
        window[layer_group].addLayer(geojson).addTo(map_panel);
    }

//    create_layers_list_to_legend(layer_group, layer_name, get_fillColor);

//    /* store style of layer group */
//    layerGroup._layerColor = get_Color;
//    layerGroup._layerFillColor = get_fillColor;
//    layerGroup._layerWeight = get_weight;
//    layerGroup._layerOpacity = get_opacity;
//    layerGroup._layerFillOpacity = get_fillOpacity;
//    layerGroup._layerFill= get_fill;
//    layerGroup._layerStroke= get_stroke;
//    layerGroup._layerDashArray= get_dashArray;
//    layerGroup.layer_status = 1;
//    layersGroups.push(layerGroup);
//    /* /store style of layer group */

    /* Layer Hide */
    if(layer_statuts == 0){
        map_panel.removeLayer(window[layer_group]);
    }
    /* /Layer Hide */
}
/* [END] - Add Layer to Map */


/*[START] - Map Tool - Grid*/
function map_tool_grid(){

    if(grid_status == 1){
        grid = L.grid().addTo(map_panel);
    }else{
        map_panel.removeLayer(grid);
    }

    var temp = grid_status;
    var temp_new = temp_grid_status;
    grid_status = temp_new;
    temp_grid_status = temp;

}
/*[END] - Map Tool - Grid*/
