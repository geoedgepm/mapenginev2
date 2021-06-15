var server_url = 'http://127.0.0.1:8000/';
var subdivision = '';

$(function () {
  var url = '';
  var getNewLayerId;

  /* [START] - Post Layer */
  $('#layer_submit').click(function () {
    var layerStatus = false;
    var layer_name = $('#layer_name').val();
    var layer_status = $("input[name='layer_status']:checked").val();
    var layer_descri = $('#layer_descri').val();
    var post_data;

    $('#layer_error').empty();

    if (layer_name != '') {
      layerStatus = true;
    } else {
      $('#layer_error').html('Field required');
    }

    if (layerStatus == true) {
      post_data = {
        layer_name: layer_name,
        layer_status: layer_status,
        layer_descri: layer_descri,
      };
      $.ajax({
        url:  '/map/post_layers/',
        data: post_data,
        type: 'POST',
        dataType: 'json',
        beforeSend: function () {
          // $("#overlay_product_list").show();
        },
        success: function (data) {
          if (data.status == 1) {
            $('#layer_id').val(data.layerfileID);
            $('#layer_form').hide();
            $('#layer_upload_form').show();
          } else {
            $('#layer_error').html(data.error);
          }
        },
      });
    }
  });

  /* [END] - Post Layer */
});

//////////// JavaScrip ///////////////////

var map;
var defaultLayer;
var geojsonMap;
var userAccess = true;
var gourpID = 0;

function init() {
  map = new L.Map('map', {
    center: new L.LatLng(0, 0),
    zoom: 2,
    minZoom: 2,
    zoomControl: false,
  });
  defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

  lastest_layer();
  lastest_map();
  lastest_news();
}

function user_access(status) {
  if (status == 'False') {
    userAccess = false;
  }
}

function layer_to_map(layer_id, layer_type, layer_file) {
  /* Hide New Layer Button */
  $('#upt').hide();
  /* /Hide New Layer Button */

  if (layer_id != '' || layer_type != '') {
    if (layer_type == 'SHP') {
      var getGeojson = $.ajax({
        url:  subdivision+'/map/layer_data/' + layer_id + '/' + gourpID + '/',
        dataType: 'json',
        //success: console.log("data successfully loaded."),
        error: function (xhr) {
          //alert(xhr.statusText);
        },
      });

      $.when(getGeojson).done(function () {
        var to_json = jQuery.parseJSON(getGeojson.responseText);
		
		if(to_json['status'] !== 1){
			return false;
		}
		
		var geojson_path = subdivision+'/'+to_json['file_path']+to_json['geojson_file'];
		
		
		console.log(to_json);
		console.log(to_json['status']);
		console.log(to_json['geojson_file']);
		console.log(to_json['file_path']);
		console.log(geojson_path);

        /* Generate Color & add color to layer*/
        var random_color = getRandomColor();
        var random_fillcolor = getRandomColor();
        /* /Generate Color & add color to layer*/

        geojsonMap = L.geoJson(geojson_path, {
          style: function (feature) {
            var fillcolor = !feature.properties['_layerFillColor']
              ? random_color
              : feature.properties['_layerFillColor'];
            var color = !feature.properties['_layerColor']
              ? random_fillcolor
              : feature.properties['_layerColor'];
            var fillOpacity = !feature.properties['_layerFillOpacity']
              ? 0.8
              : feature.properties['_layerFillOpacity'];
            var opacity = !feature.properties['_layerOpacity']
              ? 1
              : feature.properties['_layerOpacity'];
            var fill = !feature.properties['_layerFill']
              ? true
              : feature.properties['_layerFill'];
            var weight = !feature.properties['_layerWeight']
              ? 2
              : feature.properties['_layerWeight'];
            var stroke = !feature.properties['_layerStroke']
              ? true
              : feature.properties['_layerStroke'];
            var dashArray = !feature.properties['_layerDashArray']
              ? []
              : feature.properties['_layerDashArray'];

            return {
              fillColor: fillcolor,
              color: color,
              fillOpacity: fillOpacity,
              opacity: opacity,
              weight: weight,
              fill: fill,
              stroke: stroke,
            };
          },
        });

        geojsonMap.addTo(map);
        preloader_out();
        map.fitBounds(geojsonMap.getBounds());
      });
    }

    if (layer_type == 'KML' && layer_file != '') {
      var kml_url = mapengine+'/media/layers/' + layer_id + '/' + layer_file;
      var kmlLoad = new L.KML(kml_url, { async: true });
      kmlLoad.on('loaded', function (e) {
        preloader_out();
        map.fitBounds(e.target.getBounds());
      });
      map.addLayer(kmlLoad);
    }
  } else {
    console.log('Layer ID or Layer type are empty.');
  }
}

function geojsons_to_map(layer_id, group_id) {
  var get_data = $.ajax({
    url:  subdivision+'/map/layersdata/' + layer_id + '/' + gourpID + '/',
    type: 'GET',
    dataType: 'json',
    //                  success: ,
    error: function (xhr) {
      //
    },
  });

  $.when(get_data).done(function () {
    var response = jQuery.parseJSON(get_data.responseText);
    if (response['status'] == 1) {
      var filesData = response['rows'];
      var filesCount = filesData.length;
      var promises = [];

      for (f = 0; f < filesCount; f++) {
        var filename = filesData[f].layerFile;
        var file_url = subdivision+'/media/draw_layers/' + filename;

        var getJson = $.ajax({
          url: file_url,
          async: false,
          dataType: 'json',
          done: function (results) {
            return results;
          },
        });

        var layerGroup = getJson['responseText'];
        promises.push(layerGroup);
      }

      $.when.apply($, promises).then(function () {
        for (var i = 0; i < arguments.length; i++) {
          /* Generate Color & add color to layer*/
          var random_color = getRandomColor();
          var random_fillcolor = getRandomColor();

          var convertData = jQuery.parseJSON(promises[i]);

          geojsonMap = L.geoJson(convertData, {
            pointToLayer: function (feature, latlng) {
              var geometry = feature.geometry;
              var properties = feature.properties;

              if (geometry['type'] == 'Point') {
                var _layerRadius = properties['_layerRadius'];
                if (_layerRadius != null) {
                  fillcolor = feature.properties['_layerFillColor'];
                  var color = feature.properties['_layerColor'];
                  var fillOpacity = feature.properties['_layerFillOpacity'];
                  var opacity = feature.properties['_layerOpacity'];
                  var weight = feature.properties['_layerWeight'];

                  var circle = L.circle([latlng.lat, latlng.lng], {
                    radius: _layerRadius,
                    color: color,
                    weight: weight,
                    opacity: opacity,
                    fillColor: fillcolor,
                    fillOpacity: fillOpacity,
                  });
                  return circle;
                } else if (_layerRadius == null) {
                  var marker = L.marker([latlng.lat, latlng.lng]);
                  return marker;
                }
              }
            },
            style: function (feature) {
              var geometry = feature.geometry;

              if (geometry['type'] != 'Point') {
                var fillcolor = !feature.properties['_layerFillColor']
                  ? random_color
                  : feature.properties['_layerFillColor'];
                var color = !feature.properties['_layerColor']
                  ? random_fillcolor
                  : feature.properties['_layerColor'];
                var fillOpacity = !feature.properties['_layerFillOpacity']
                  ? 0.8
                  : feature.properties['_layerFillOpacity'];
                var opacity = !feature.properties['_layerOpacity']
                  ? 1
                  : feature.properties['_layerOpacity'];
                var fill = !feature.properties['_layerFill']
                  ? true
                  : feature.properties['_layerFill'];
                var weight = !feature.properties['_layerWeight']
                  ? 2
                  : feature.properties['_layerWeight'];
                var stroke = !feature.properties['_layerStroke']
                  ? true
                  : feature.properties['_layerStroke'];
                var dashArray = !feature.properties['_layerDashArray']
                  ? []
                  : feature.properties['_layerDashArray'];

                return {
                  fillColor: fillcolor,
                  color: color,
                  fillOpacity: fillOpacity,
                  opacity: opacity,
                  weight: weight,
                  fill: fill,
                  stroke: stroke,
                };
              }
            },
          });

          geojsonMap.addTo(map);
          map.fitBounds(geojsonMap.getBounds());
        }
      });
    }
  });

  preloader_out();
}

function preloader_out() {
  jQuery('#status').delay(1000).fadeOut();
  jQuery('#preloader').delay(1000).fadeOut('slow');
}

function preloader_in() {
  jQuery('#preloader').delay(1000).fadeIn('slow');
  jQuery('#status').delay(1000).fadeIn();
}

/* Map Count Appear*/
function map_count_fun(groupID = '') {
  var url;
  if (groupID > 0) {
    gourpID = groupID;
    url =  subdivision+'/map/map_group_count/' + groupID + '/';
  } else {
    url = subdivision+ '/map/map_count/';
  }

  $.ajax({
    url: url,
    dataType: 'json',
    success: function (data) {
      if (data.status == 1) {
        var map_count = data.map_count;
        var layer_count = data.layer_count;
        $('#map_count').html(map_count);
        $('#layer_count').html(layer_count);

        map_chart(map_count, layer_count);
      }
    },
    error: function (xhr) {
      console.log(xhr.statusText);
    },
  });
}

/* /Map Count Appear */

/* Chart */
function map_chart(map_count, layer_count) {
  var ctx = $('#map_chart');
  var myChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      datasets: [
        {
          label: 'Map',
          data: [map_count],
          backgroundColor: '#33cccc',
        },
        {
          label: 'Layer',
          data: [layer_count],
          backgroundColor: '#0089FF',
        },
      ],
    },
    options: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontColor: '#404040',
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              beginAtZero: true,
              stacked: true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Count',
              fontColor: '#404040',
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              stacked: true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Map & Layer',
              fontColor: '#404040',
            },
            barPercentage: 0.8,
            categoryPercentage: 0.4,
          },
        ],
      },
    },
  });
}
/* /Chart */

/* Lastest Maps */
function lastest_map() {
  $.ajax({
    url:  subdivision+'/map/lastest_map/' + gourpID + '/',
    dataType: 'json',
    success: function (data) {
      if (data.status == 1) {
        var lastestMaps = data.lastestMaps;
        var lastestMapsSort = lastestMaps.sort(sortArray);

        for (i = 0; i < lastestMapsSort.length; i++) {
          var tot_seconds = lastestMapsSort[i][0];
          var days = parseInt(tot_seconds / (24 * 3600));
          var re_day = tot_seconds % (24 * 3600);
          var hours = parseInt(re_day / 3600);
          var re_hours = re_day % 3600;
          var minutes = parseInt(re_hours / 60);

          var days_txt = days > 0 ? days + 'd ' : '';
          var hours_txt = hours > 0 ? hours + 'h ' : '';
          var minutes_txt = minutes > 0 ? minutes + 'min ' : '';

          var time = days_txt + hours_txt + minutes_txt + 'ago';

          var list =
            '<li style="margin-left:10px;" class="list-group-item">' +
            '<a href="' +
            lastestMapsSort[i][4] +
            '" target="_blank">' +
            lastestMapsSort[i][2] +
            '</a>' +
            '<small class="block text-muted">' +
            '<i class="fa fa-clock-o"></i> ' +
            time +
            '</small>' +
            '</li>';
          $('#map_list').append(list);
        }
      }
    },
    error: function (xhr) {
      console.log(xhr.statusText);
    },
  });
}
/*  /Lastest Maps */

/* Lastest News */
function lastest_news() {
  $.ajax({
    url:  subdivision+'/map/lastest_news/' + gourpID + '/',
    dataType: 'json',
    success: function (data) {
      if (data.status == 1) {
        var lastestNews = data.lastestNews;
        var lastestNewsSort = lastestNews.sort(sortArray);
        for (i = 0; i < lastestNewsSort.length; i++) {
          var tot_seconds = lastestNewsSort[i][0];
          var days = parseInt(tot_seconds / (24 * 3600));
          var re_day = tot_seconds % (24 * 3600);
          var hours = parseInt(re_day / 3600);
          var re_hours = re_day % 3600;
          var minutes = parseInt(re_hours / 60);

          var days_txt = days > 0 ? days + 'd ' : '';
          var hours_txt = hours > 0 ? hours + 'h ' : '';
          var minutes_txt = minutes > 0 ? minutes + 'min ' : '';

          var time = days_txt + hours_txt + minutes_txt + 'ago';

          var list =
            '<li style="margin-left:10px;" class="list-group-item">' +
            '<a href="' +
            lastestNewsSort[i][5] +
            '" target="_blank">' +
            lastestNewsSort[i][2] +
            '</a>' +
            '<small class="block text-muted">' +
            '<i class="fa fa-clock-o"></i> ' +
            time +
            '</small>' +
            '</li>';
          $('#news_list').append(list);
        }
      }
    },
    error: function (xhr) {
      console.log(xhr.statusText);
    },
  });
}
/*  /Lastest News */

function sortArray(a, b) {
  return a - b;
}

/* Lastest Layer */
function lastest_layer() {
  $.ajax({
    url:  subdivision+'/map/lastest_layer_data/' + gourpID + '/',
    dataType: 'json',
    success: function (data) {
      if (data.status == 1) {
        var lastestNews = data.lastestData;
        var a = document.getElementById('map_view');

        var layer_tile = 'My Recent Map of ' + lastestNews[2];
        $('#recent_mheading').html(layer_tile);

        if (lastestNews[3] == 'map') {
          layer_to_map(lastestNews[1], lastestNews[4], lastestNews[5]);
          if (groupID > 0) {
            a.href =
              
              subdivision+'/map/group/' +
              groupID +
              '/' +
              lastestNews[7] +
              '/map';
          } else {
            a.href =  subdivision+'/map/' + lastestNews[1] + '/map';
          }
        }

        if (lastestNews[3] == 'layer') {
          // GeoJson Data

          geojsons_to_map(lastestNews[1], lastestNews[5]);

          if (groupID > 0) {
            a.href =
              
              subdivision+'/map/group/' +
              groupID +
              '/' +
              lastestNews[1] +
              '/layer';
          } else {
            a.href =  subdivision+'/map/' + lastestNews[1] + '/layer';
          }
        }
      } else {
        $('#map_view').hide();
      }
    },
    error: function (xhr) {
      console.log(xhr.statusText);
    },
  });
}

/* [START] - Menu */
$(document).on('click', '.menu_list', function () {
  var $this = $(this);
  var actives = $('.menu_list_ul li.menu_list');

  if (actives.hasClass('active')) {
    actives.removeClass('active');
  }

  $(this).toggleClass('active');
});
/* [END] - End */

/* My Map & Group table */
var sub_project_page = null;
var page_data_url = '';
var pageColumns = [];
var tableId = 'tt';
var groupID;

function dashboard_section_view() {
  if (sub_project_page != null || sub_project_page != 'edit_profile') {
    $('#layers_maps_table_section').show();
    $('#dashboard_section').hide();
    $('#user_profile_section').hide();
    $('#group_profile_section').hide();
  } else {
    $('#layers_maps_table_section').hide();
    $('#dashboard_section').show();
    $('#user_profile_section').hide();
    $('#group_profile_section').hide();
  }
}

function click_profile_page() {
  $('#layers_maps_table_section').hide();
  $('#dashboard_section').hide();
  $('#user_profile_section').show();
}

function click_group_profile_page() {
  $('#layers_maps_table_section').hide();
  $('#dashboard_section').hide();
  $('#group_profile_section').show();
}

function click_page(sub_proj, groupId = '') {
  sub_project_page = sub_proj;
  tableId = sub_proj;
  groupID = groupId;
  $('#search_layer').val('');

  dashboard_section_view();

  var table =
    '<table id="' +
    sub_proj +
    '" style="width:99%;min-height:150px;position:relative;left:400px;"  title="Map Manager" singleSelect="true" idField="itemid" fitColumns="true"  rownumbers="true" pagination="true"></table>';
  $('#page_table').html(table);

  /*Button for New Map or Group*/
  if (
    sub_project_page == 'my_map' ||
    sub_project_page == 'my_layer' ||
    sub_project_page == 'all_map' ||
    sub_project_page == 'all_layer'
  ) {
    $('#new_map_button').show();
    $('#new_group_button').hide();
    $('#new_user_button').hide();
    $('#new_group_member_button').hide();
  } else if (
    sub_project_page == 'my_group' ||
    sub_project_page == 'all_group'
  ) {
    $('#new_group_button').show();
    $('#new_map_button').hide();
    $('#new_user_button').hide();
    $('#new_group_member_button').hide();
  } else if (sub_project_page == 'user_manage') {
    $('#new_group_button').hide();
    $('#new_map_button').hide();
    $('#new_user_button').show();
    $('#new_group_member_button').hide();
  } else if (sub_project_page == 'group_map') {
    $('#new_group_button').hide();
    $('#new_map_button').hide();
    $('#new_user_button').hide();
    $('#new_group_member_button').hide();
    $('#new_group_map_button').show();
    // $('#add_group_map_button').show();
    $('#add_group_layer_button').hide();
  } else if (sub_project_page == 'group_layer') {
    $('#new_group_button').hide();
    $('#new_map_button').hide();
    $('#new_user_button').hide();

    $('#new_group_member_button').hide();
    $('#new_group_map_button').show();
    $('#add_group_map_button').hide();
    //$('#add_group_layer_button').show();
  } else if (sub_project_page == 'group_member') {
    $('#new_group_button').hide();
    $('#new_map_button').hide();
    $('#new_user_button').hide();

    $('#new_group_member_button').show();
    $('#new_group_map_button').hide();
    $('#add_group_map_button').hide();
    $('#add_group_layer_button').hide();
  } else {
    $('#new_group_button').hide();
    $('#new_map_button').hide();
    $('#new_user_button').hide();

    $('#new_group_member_button').hide();
    $('#new_group_map_button').hide();
    $('#add_group_map_button').hide();
    $('#add_group_layer_button').hide();
  }
  /*Button for New Map or Group*/

  $(function () {
    $('#' + tableId).datagrid({
      title: '',
      //iconCls:'icon-edit',
      url: pageDataUrl(),
      columns: column_gen(),
      onBeforeEdit: function (index, row) {
        row.editing = true;
        $(this).datagrid('refreshRow', index);
      },
      onAfterEdit: function (index, row) {
        row.editing = false;
        $(this).datagrid('refreshRow', index);
        editData(row);
      },
      onCancelEdit: function (index, row) {
        row.editing = false;
        $(this).datagrid('refreshRow', index);
      },
    });
  });
}

function pageDataUrl() {
  if (sub_project_page == 'my_map') {
    page_data_url = server_url+'/map/my_map_data/';
  } else if (sub_project_page == 'my_layer') {
    page_data_url = server_url+'/map/my_layer_data/';
  } else if (sub_project_page == 'all_map') {
    page_data_url = server_url+'/map/all_map_data/';
  } else if (sub_project_page == 'all_layer') {
    page_data_url = server_url+'/map/all_layer_data/';
  } else if (sub_project_page == 'my_group') {
    page_data_url = server_url+'/map/my_group/';
  } else if (sub_project_page == 'all_group') {
    page_data_url = server_url+'/map/all_group/';
  } else if (sub_project_page == 'user_manage') {
    page_data_url = server_url+'/user_data/';
  } else if (sub_project_page == 'group_map') {
    page_data_url =
      server_url+'/map/group_maps/' + groupID + '/';
  } else if (sub_project_page == 'group_layer') {
    page_data_url =
      server_url+'/map/group_layers/' + groupID + '/';
  } else if (sub_project_page == 'group_member') {
    page_data_url =
      server_url+'/map/group_members/' + groupID + '/';
  } else {
    page_data_url = '';
  }
  console.log("XXXAAAXXX");
  console.log(page_data_url);
  return page_data_url;
}

function column_gen() {
  if (sub_project_page == 'my_map' || sub_project_page == 'all_map') {
    pageColumns = [
      [
        {
          field: 'name',
          title: 'Name',
          width: 100,
          formatter: function (value, row) {
            return row.name || value;
          },
          editor: {
            type: 'text',
          },
        },
        {
          field: 'description',
          title: 'Description',
          width: 200,
          editor: { type: 'text' },
        },
        {
          field: 'created_date',
          title: 'Created Date',
          width: 80,
          formatter: function (value, row, index) {
            var dateTime = row.created_date;
            var re_dateTime = dateTime.replace('T', ' ');
            var redateTime = re_dateTime.slice(0, -3);
            return redateTime;
          },
        },
        { field: 'create_by', title: 'Created by', width: 50 },
        { field: 'lmu', title: 'Last modified user', width: 70 },
        {
          field: 'action',
          title: 'Action',
          width: 30,
          align: 'center',
          formatter: function (value, row, index) {
            if (row.editing) {
              var s =
                '<a href="javascript:void(0)" onclick="saverow(this)"><i class="fa fa-check" style="color:#01A9DB"></i></a> ';
              var c =
                '<a href="javascript:void(0)" onclick="cancelrow(this)"><i class="fa fa-times" style="color:#01A9DB"></a>';
              return s + c;
            } else {
              var f =
                '<a href="' +
                server_url +
                
                '/map/' +
                row.id +
                '/map" target="_blank"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-external-link"></i></a> ';
              var e =
                '<a href="javascript:void(0)" onclick="editrow(this)"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-pencil"></i></a> ';
              var d =
                '<a href="javascript:void(0)" onclick="deleterow(this,' +
                row.id +
                ')"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-trash-o"></i></a>';
              return f + e + d;
            }
          },
        },
      ],
    ];
  } else if (
    sub_project_page == 'my_layer' ||
    sub_project_page == 'all_layer'
  ) {
    pageColumns = [
      [
        {
          field: 'name',
          title: 'Name',
          width: 100,
          formatter: function (value, row) {
            return row.name || value;
          },
          editor: {
            type: 'text',
          },
        },
        {
          field: 'description',
          title: 'Description',
          width: 200,
          editor: { type: 'text' },
        },
        {
          field: 'created_date',
          title: 'Created Date',
          width: 80,
          formatter: function (value, row, index) {
            var dateTime = row.created_date;
            var re_dateTime = dateTime.replace('T', ' ');
            var redateTime = re_dateTime.slice(0, -3);
            return redateTime;
          },
        },
        { field: 'create_by', title: 'Created by', width: 50 },
        { field: 'lmu', title: 'Last modified user', width: 70 },
        {
          field: 'action',
          title: 'Action',
          width: 30,
          align: 'center',
          formatter: function (value, row, index) {
            if (row.editing) {
              var s =
                '<a href="javascript:void(0)" onclick="saverow(this)"><i class="fa fa-check" style="color:#01A9DB"></i></a> ';
              var c =
                '<a href="javascript:void(0)" onclick="cancelrow(this)"><i class="fa fa-times" style="color:#01A9DB"></a>';
              return s + c;
            } else {
              var f =
                '<a href="' +
                server_url +
                
                '/map/' +
                row.id +
                '/layer" target="_blank"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-external-link"></i></a> ';
              var e =
                '<a href="javascript:void(0)" onclick="editrow(this)"><i style="color:#01A9DB" class="fa fa-pencil"></i></a> ';
              var d =
                '<a href="javascript:void(0)" onclick="deleterow(this,' +
                row.id +
                ')"><i style="color:#01A9DB" class="fa fa-trash-o"></i></a>';
              return f + e + d;
            }
          },
        },
      ],
    ];
  } else if (
    sub_project_page == 'my_group' ||
    sub_project_page == 'all_group'
  ) {
    pageColumns = [
      [
        {
          field: 'group_name',
          title: 'Name',
          width: 100,
          formatter: function (value, row) {
            return row.name || value;
          },
          editor: {
            type: 'text',
          },
        },
        {
          field: 'description',
          title: 'Description',
          width: 200,
          editor: { type: 'text' },
        },
        {
          field: 'created_date',
          title: 'Created Date',
          width: 80,
          formatter: function (value, row, index) {
            var dateTime = row.created_date;
            var re_dateTime = dateTime.replace('T', ' ');
            var redateTime = re_dateTime.slice(0, -3);
            return redateTime;
          },
        },
        { field: 'create_by', title: 'Created by', width: 50 },
        { field: 'lmu', title: 'Last modified user', width: 70 },
        {
          field: 'action',
          title: 'Action',
          width: 30,
          align: 'center',
          formatter: function (value, row, index) {
            if (row.editing) {
              var s =
                '<a href="javascript:void(0)" onclick="saverow(this)"><i class="fa fa-check" style="color:#01A9DB"></i></a> ';
              var c =
                '<a href="javascript:void(0)" onclick="cancelrow(this)"><i class="fa fa-times" style="color:#01A9DB"></a>';
              return s + c;
            } else {
              var f =
                '<a href="' +
                server_url +
                
                '/group/' +
                row.id +
                '/" target="_blank"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-external-link"></i></a> ';
              var e = '',
                d = '';
              if (userAccess != false) {
                e =
                  '<a href="javascript:void(0)" onclick="editrow(this)"><i style="color:#01A9DB" class="fa fa-pencil"></i></a> ';
                d =
                  '<a href="javascript:void(0)" onclick="deleterow(this,' +
                  row.id +
                  ')"><i style="color:#01A9DB" class="fa fa-trash-o"></i></a>';
              }
              return f + e + d;
            }
          },
        },
      ],
    ];
  } else if (sub_project_page == 'user_manage') {
    pageColumns = [
      [
        {
          field: 'first_name',
          title: 'First Name',
          width: 100,
          formatter: function (value, row) {
            return row.name || value;
          },
          editor: {
            type: 'text',
          },
        },
        {
          field: 'last_name',
          title: 'Last Name',
          width: 70,
          editor: { type: 'text' },
        },
        { field: 'username', title: 'Username', width: 70 },
        { field: 'email', title: 'Email', width: 80 },
        {
          field: 'created_date',
          title: 'Created Date',
          width: 80,
          formatter: function (value, row, index) {
            var dateTime = row.created_date;
            var re_dateTime = dateTime.replace('T', ' ');
            var redateTime = re_dateTime.slice(0, -3);
            return redateTime;
          },
        },
        { field: 'user_status', title: 'Status', width: 20 },
        {
          field: 'action',
          title: 'Action',
          width: 30,
          align: 'center',
          formatter: function (value, row, index) {
            if (row.editing) {
              var s =
                '<a href="javascript:void(0)" onclick="saverow(this)"><i class="fa fa-check" style="color:#01A9DB"></i></a> ';
              var c =
                '<a href="javascript:void(0)" onclick="cancelrow(this)"><i class="fa fa-times" style="color:#01A9DB"></a>';
              return s + c;
            } else {
              var e =
                '<a href="javascript:void(0)" onclick="editrow(this)"><i style="color:#01A9DB" class="fa fa-pencil"></i></a> ';
              return e;
            }
          },
        },
      ],
    ];
  } else if (sub_project_page == 'group_map') {
    pageColumns = [
      [
        {
          field: 'name',
          title: 'Name',
          width: 100,
          formatter: function (value, row) {
            return row.name || value;
          },
          editor: {
            type: 'text',
          },
        },
        {
          field: 'description',
          title: 'Description',
          width: 200,
          editor: { type: 'text' },
        },
        {
          field: 'created_date',
          title: 'Created Date',
          width: 80,
          formatter: function (value, row, index) {
            var dateTime = row.created_date;
            var re_dateTime = dateTime.replace('T', ' ');
            var redateTime = re_dateTime.slice(0, -3);
            return redateTime;
          },
        },
        { field: 'create_by', title: 'Created by', width: 50 },
        { field: 'lmu', title: 'Last modified user', width: 70 },
        {
          field: 'action',
          title: 'Action',
          width: 30,
          align: 'center',
          formatter: function (value, row, index) {
            if (row.editing) {
              var s =
                '<a href="javascript:void(0)" onclick="saverow(this)"><i class="fa fa-check" style="color:#01A9DB"></i></a> ';
              var c =
                '<a href="javascript:void(0)" onclick="cancelrow(this)"><i class="fa fa-times" style="color:#01A9DB"></a>';
              return s + c;
            } else {
              var f =
                '<a href="' +
                server_url +
                
                '/map/group/' +
                groupID +
                '/' +
                row.id +
                '/map" target="_blank"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-external-link"></i></a> ';
              var e = '',
                d = '';
              if (userAccess != false) {
                e =
                  '<a href="javascript:void(0)" onclick="editrow(this)"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-pencil"></i></a> ';
                d =
                  '<a href="javascript:void(0)" onclick="deleterow(this,' +
                  row.id +
                  ')"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-trash-o"></i></a>';
              }
              return f + e + d;
            }
          },
        },
      ],
    ];
  } else if (sub_project_page == 'group_layer') {
    pageColumns = [
      [
        {
          field: 'name',
          title: 'Name',
          width: 100,
          formatter: function (value, row) {
            return row.name || value;
          },
          editor: {
            type: 'text',
          },
        },
        {
          field: 'description',
          title: 'Description',
          width: 200,
          editor: { type: 'text' },
        },
        {
          field: 'created_date',
          title: 'Created Date',
          width: 80,
          formatter: function (value, row, index) {
            var dateTime = row.created_date;
            var re_dateTime = dateTime.replace('T', ' ');
            var redateTime = re_dateTime.slice(0, -3);
            return redateTime;
          },
        },
        { field: 'create_by', title: 'Created by', width: 50 },
        { field: 'lmu', title: 'Last modified user', width: 70 },
        {
          field: 'action',
          title: 'Action',
          width: 30,
          align: 'center',
          formatter: function (value, row, index) {
            if (row.editing) {
              var s =
                '<a href="javascript:void(0)" onclick="saverow(this)"><i class="fa fa-check" style="color:#01A9DB"></i></a> ';
              var c =
                '<a href="javascript:void(0)" onclick="cancelrow(this)"><i class="fa fa-times" style="color:#01A9DB"></a>';
              return s + c;
            } else {
              var f =
                '<a href="' +
                server_url +
                
                '/map/group/' +
                groupID +
                '/' +
                row.id +
                '/layer" target="_blank"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-external-link"></i></a> ';
              var e = '',
                d = '';
              if (userAccess != false) {
                e =
                  '<a href="javascript:void(0)" onclick="editrow(this)"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-pencil"></i></a> ';
                d =
                  '<a href="javascript:void(0)" onclick="deleterow(this,' +
                  row.id +
                  ')"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-trash-o"></i></a>';
              }
              return f + e + d;
            }
          },
        },
      ],
    ];
  } else if (sub_project_page == 'group_member') {
    pageColumns = [
      [
        { field: 'fname', title: 'First Name', width: 100 },
        { field: 'lname', title: 'Last Name', width: 100 },
        {
          field: 'superuserCk',
          title: 'Admin',
          width: 12,
          align: 'center',
          formatter: function (value, row) {
            var superuser = row.superuser;
            var first_admin = row.first_admin;
            var checkboxEnable = first_admin == 1 ? 'disabled' : '';
            var uAccess = userAccess != false ? '' : 'disabled';
            if (superuser == 1) {
              var d =
                '<input type="checkbox" checked onclick="superuser_update(this,' +
                row.id +
                ',' +
                groupID +
                ')" ' +
                checkboxEnable +
                ' ' +
                uAccess +
                '>';
            } else {
              var d =
                '<input type="checkbox" onclick="superuser_update(this,' +
                row.id +
                ',' +
                groupID +
                ')" ' +
                uAccess +
                '>';
            }
            return d;
          },
        },
        {
          field: 'action',
          title: 'Action',
          width: 12,
          align: 'center',
          formatter: function (value, row, index) {
            var d = '';
            if (userAccess != false) {
              d =
                '<a href="javascript:void(0)" onclick="deleterow(this,' +
                row.id +
                ')"><i style="color:#01A9DB; padding-left:2px;" class="fa fa-trash-o"></i></a>';
            }

            return d;
          },
        },
      ],
    ];
  } else {
    pageColumns = [];
  }
  return pageColumns;
}

function superuser_update(target, id, groupID) {
  var post_data = { groupID: groupID, memberId: id };
  $.ajax({
    url:  '/map/superuser_update/',
    data: post_data,
    type: 'POST',
    dataType: 'json',
    success: function (data) {
      //
    },
  });
}

function getRowIndex(target) {
  var tr = $(target).closest('tr.datagrid-row');
  return parseInt(tr.attr('datagrid-row-index'));
}
function editrow(target) {
  $('#' + tableId).datagrid('beginEdit', getRowIndex(target));
}
function deleterow(target, id) {
  $.messager.confirm('Confirm', 'Are you sure?', function (r) {
    if (r) {
      $('#' + tableId).datagrid('deleteRow', getRowIndex(target));
      deleteData(id);
    }
  });
}
function saverow(target) {
  $('#' + tableId).datagrid('endEdit', getRowIndex(target));
}
function cancelrow(target) {
  $('#' + tableId).datagrid('cancelEdit', getRowIndex(target));
}

function editData(data) {
  data.sub_proj_page = sub_project_page;
  var post_data = data,
    url;

  if (sub_project_page != 'user_manage') {
    url =  '/map/data_update/';
  } else {
    url =  '/user_data_update/';
  }
  $.ajax({
    url: url,
    data: post_data,
    type: 'POST',
    dataType: 'json',
    success: function (data) {
      //                    if(data.status == 1 ){}
    },
  });
}

function deleteData(id) {
  var sub_proj_page = sub_project_page;
  var post_data = { sub_proj_page: sub_proj_page, id: id };
  console.log(id);
  $.ajax({
    url:  subdivision+'/map/data_delete/',
    data: post_data,
    type: 'POST',
    dataType: 'json',
    success: function (data) {
      //                    if(data.status == 1 ){}
    },
  });
}

function doSearch() {
  $('#' + tableId).datagrid('load', {
    search: $('#search_layer').val(),
  });
}

function searchClose() {
  $('#search_layer').val('');
  $('#' + tableId).datagrid('load', {
    search: '',
  });
}

/* /*My Map & Group table */

/* Group Map */
function newGroup() {
  $('#group_error_msg').html('');
  $('#dlg_group').dialog('open');
}

function saveGroup() {
  var group_name = $('#group_name').val();

  if (!group_name) {
    $('#group_error_msg').html('Please Enter Name');
  } else {
    $('#group_error_msg').empty();

    $('#fm_group').form('submit', {
      url:  '/map/add_group/',
      onSubmit: function () {
        return $(this).form('validate');
      },
      success: function (result) {
        $('#dlg_group').dialog('close'); // close the dialog
        $('#' + sub_project_page).datagrid('reload');
      },
    });
  }
}
/* /Group Map */

/* Add Member*/
function newMemner() {
  $('#member_error_msg').html('');
  var gourp_id = $('#group_id_hidden').val();

  if (gourp_id != '') {
    $.ajax({
      url: '/member_list/' + gourp_id + '/',
      //type: 'POST',
      dataType: 'json',
      success: function (data) {
        var userList = '';
        var users = data.user_list;
        if (users.length > 0) {
          for (u = 0; u < users.length; u++) {
            userList +=
              '<option value="' +
              users[u].id +
              '">' +
              users[u].name +
              '</option>';
          }
          $('#member_list').html(userList);
        }
        $('#dlg_member').dialog('open');
      },
    });
  }
}

function saveMember() {
  $('#member_error_msg').html('');
  var gourp_id = $('#group_id_hidden').val();

  if (!gourp_id) {
    $('#member_error_msg').html('Please select user');
  } else {
    $('#member_error_msg').empty();

    $('#fm_member').form('submit', {
      url:  '/map/add_member/',
      onSubmit: function () {
        return $(this).form('validate');
      },
      success: function (result) {
        $('#dlg_member').dialog('close'); // close the dialog
        $('#' + sub_project_page).datagrid('reload');
      },
    });
  }
}
/* /Add Member*/

$(document).on('change', '.btn-file :file', function () {
  var input = $(this),
    numFiles = input.get(0).files ? input.get(0).files.length : 1,
    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
  input.trigger('fileselect', [numFiles, label]);
});

$(document).ready(function () {
  $('.btn-file :file').on('fileselect', function (event, numFiles, label) {
    var input = $(this).parents('.input-group').find(':text'),
      log = numFiles > 1 ? numFiles + ' files selected' : label;

    if (input.length) {
      input.val(log);
    } else {
      //            if( log ) alert(log);
    }
  });

  /*User Profile*/
  $('#e_fname').on('input', function () {
    var input = $(this);
    var is_name = input.val();
    var input_span = input.next('span');

    if (is_name) {
      $(input_span).removeClass('invalid').addClass('valid');
    } else {
      $(input_span).html('Please enter a valid first name.');
      $(input_span).removeClass('valid').addClass('invalid');
    }
  });

  $('#e_lname').on('input', function () {
    var input = $(this);
    var is_name = input.val();
    var input_span = input.next('span');

    if (is_name) {
      $(input_span).removeClass('invalid').addClass('valid');
    } else {
      $(input_span).html('Please enter a valid last name.');
      $(input_span).removeClass('valid').addClass('invalid');
    }
  });

  $('#e_password').on('input', function () {
    var input = $(this);
    var is_name = input.val();
    var input_span = input.next('span');

    if (is_name) {
      $(input_span).removeClass('invalid').addClass('valid');
    } else {
      $(input_span).html('Password is required.');
      $(input_span).removeClass('valid').addClass('invalid');
    }
  });

  $('#e_cpassword').on('input', function (e) {
    var input = $(this);
    var is_name = input.val();
    var input_span = input.next('span');

    if (is_name) {
      $(input_span).removeClass('invalid').addClass('valid');
    } else {
      $(input_span).html('Confirm Password is required.');
      $(input_span).removeClass('valid').addClass('invalid');
    }

    var e_pw = $('#e_password').val();
    if (is_name != e_pw) {
      $(input_span).html('Passwords mismatched.');
      $(input_span).removeClass('valid').addClass('invalid');
    } else {
      $(input_span).removeClass('invalid').addClass('valid');
    }
  });

  $('#user_profile_button').click(function (e) {
    var error_free = true;

    $('#e_fname, #e_lname, #e_password, #e_cpassword').each(function () {
      var input = $(this);
      var input_span = input.next('span');
      var error_element = $(input_span).hasClass('valid');

      var pw = $('#e_password');
      var cpw = $('#e_cpassword');
      var error_pw = cpw.next('span');

      if (pw.val() != cpw.val()) {
        $(error_pw).html('Passwords mismatched');
        $(error_pw).removeClass('valid').addClass('invalid');
        error_free = false;
      } else {
        $(error_pw).removeClass('invalid').addClass('valid');
      }
    });

    if (error_free == false) {
      e.preventDefault();
    } else {
      $('#profile_form').form('submit', {
        url: '/user_update/',
        onSubmit: function () {
          return $(this).form('validate');
        },
        success: function (result) {
          console.log(result);
        },
      });
    }
  });
  /*User Profile*/

  /* Group Profile*/
  $('#e_group_name').on('input', function () {
    var input = $(this);
    var is_name = input.val();
    var input_span = input.next('span');

    if (is_name) {
      $(input_span).removeClass('invalid').addClass('valid');
    } else {
      $(input_span).html('Please enter a valid group name.');
      $(input_span).removeClass('valid').addClass('invalid');
    }
  });

  $('#group_profile_button').click(function (e) {
    var error_free = true;

    $('#e_group_name').each(function () {
      var input = $(this);
      var input_span = input.next('span');
      var error_element = $(input_span).hasClass('valid');
    });

    if (error_free == false) {
      e.preventDefault();
    } else {
      $('#group_profile_form').form('submit', {
        url:  '/map/group_update/',
        onSubmit: function () {
          return $(this).form('validate');
        },
        success: function (result) {
          console.log(result);
        },
      });
    }
  });

  /* /Group Profile*/
});

/* Random color generator */
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
