var server_url = 'http://127.0.0.1:8000/';
var subdivision = '';

$(function(){

var url = '';
var extensions = ['prj','shp','shx', 'dbf'];
var fileNamesInQueue = [];
var uploading_filesCount = 0;
var shp_file_status = 0;
var other_file_status = 0;
var originalFilesCount
var upload_error_status = 0;
var otherfile_count = 0;
var shp_file_name = '';

/* [START] - Post Layer Panel */
$("#modal-87694").click(function(){

    aaib_tab_province();

    $("#layer_form").show();
    $("#layer_name").val('');
    $("#layer_descri").val('');
    $('#layer_private').prop('checked', true);

    $("#upload").show();
    $("#files_list").empty();
    $(".progress-bar").css({"width": 0, "display":"none"});
    $("#upload_finals").css({"display":"none"});
    $("#layer_upload_form").hide();

// Clean previous uploaded
    uploading_filesCount = 0;
    fileNamesInQueue = [];
    shp_file_name = '';
    shp_file_status = 0;
    other_file_status = 0;
    otherfile_count = 0;


    $('.add_layer_checkbox').prop("checked", false);

});


// AAIB Function
function aaib_tab_province(){
    var url = subdivision+"/map/province/";
    $.ajax({
        url: url,
        dataType: 'json',
        //data:values,
        beforeSend: function(){
            //preloader_in();
        },
        success: function(response){
            var provinces = response['province'];

            var select = '<option value="">Province</option>';

            $.each(provinces[0], function (index, value) {
                    select +='<option value="'+index+'">'+value+'</option>'
            });

            $("#aaib_province").html(select);

            $("#aaib_district").html(select_option("District"));
            $("#aaib_asc").html(select_option("ASC"));
            $("#aaib_ds").html(select_option("DS"));
            $("#aaib_gn").html(select_option("GN"));
        }
    });
}

function select_option(name){
    var select_null = '<option value="">'+name+'</option>';
    return select_null;
}
// AAIB Function

$("#layer_submit").click(function (){
    var layerStatus = false;
    var layer_name = $('#layer_name').val();
    var layer_status = $("input[name='layer_status']:checked").val();
    var layer_descri = $('#layer_descri').val();
    var post_data;

    $("#layer_error").empty();

    if(layer_name != ''){
        layerStatus = true;
    }else{
        $("#layer_error").html("Field required");
    }

    if(layerStatus == true){

//        $("#layer_form").hide();
//        $("#layer_upload_form").show();

        post_data = {'layer_name':layer_name, 'layer_status':layer_status, 'layer_descri':layer_descri, 'group_id':gid};
        $.ajax({
          url: subdivision+"/map/post_layers/",
          data: post_data,
          type: 'POST',
          dataType: 'json',
          beforeSend: function(){
           // $("#overlay_product_list").show();
          },
          success: function(data){
              if(data.status ==1){
                $("#layer_id").val(data.layerfileID);
                $("#layer_form").hide();
                $("#layer_upload_form").show();

              }else{
                $("#layer_error").html(data.error);
              }
            }
        });

    }
});
/* [END] - Post Layer Panel */

/* [START] - Upload Layer files */

'use strict';

/* To Click "Upload" button to upload finally */
var uploadButton = $('<button/>').addClass('button btn-blue each_upload').text('Upload');	//create upload button
var uploadButton_fasle = $('<button/>').addClass('button btn-blue each_upload_false').text('No Upload');	//create upload button

$(document).on('click','#upload_finals',function(){

        $( ".each_upload" ).each(function( index ) {
            var $this = $(this), data = $this.data();

            var layer_id = $("#layer_id").val();
            data.url = subdivision+"/map/post_upload/"+layer_id+"/";
            data.submit();
        });
});

/* Enable/Disable for Group user */
if($('#groupID').length){
    var groupId = parseInt($('#groupID').text());
    gid = groupId;
}
/* Enable/Disable for Group user*/


/*  /To Click "Upload" button to upload finally */
$('#upload_browse').click(function(){
        $('#error_file_text').fadeOut();
        $(this).parent().find('input').click();
});

if($('#modal-87694').length){

    $("#upload").fileupload({
        dropZone: $('#drop'),
        //url: url_upload,
        dataType: 'json',
        autoUpload:false,
        sequentialUploads: false,

        add: function (e, data){

            var fileTypeAllowed = /.\.(cpg|dbf|prj|shp|shx|qpj|kml|json)$/i;

            data.context = $('<div/>').addClass('file-wrapper col-md-offset-2').appendTo('#files_list'); //create new DIV with "file-wrapper" class

            $.each(data.files, function (index, file){

                originalFilesCount = data.originalFiles.length;
                var fileName = data.files[0].name;
                uploading_filesCount++;
                var extension = fileName.split('.').pop();

                if(fileTypeAllowed.test(fileName)){

                    var isExitExt = extensions.includes(extension);

                    if(isExitExt == true){
                        fileNamesInQueue.push(extension);

                        if(shp_file_name == ''){
                            shp_file_name = fileName.split('.').slice(0, -1).join('.');
                        }

                        /* Add file Details to panel*/
                        if(fileName.split('.').slice(0, -1).join('.') == shp_file_name){
                            add_file_details_to_panel(file.name, file.size, extension, data, true);
                        }
                         /* /Add file Details to panel*/
                    }

                    if(extension == 'shp'){
                        shp_file_status = 1;
                    }

                    if(extension == 'kml' || extension == 'json'){
                        other_file_status = 1;
                        extensions = [];
                        otherfile_count++;
                        fileNamesInQueue = [extension];

                        if(otherfile_count == 1){
                            add_file_details_to_panel(file.name, file.size, extension, data, true);
                        }
                    }

                }else{
                    add_file_details_to_panel(file.name, file.size, extension, data, false);
                }
            });

            if(uploading_filesCount == originalFilesCount){
                var notExist = $(extensions).not(fileNamesInQueue).get();
                var notExist_count = notExist.length;
                var required_ext = '';
                var required_other_ext = '';

                if(notExist_count > 0){
                    if(other_file_status != 1){

                        if(notExist_count > 1){
                            for(i=0; i < notExist_count - 1; i++){
                                console.log(notExist[i]);
                                required_ext += notExist[i]+', ';
                            }
                            required_ext += notExist[notExist_count - 1];
                        }else{
                            required_ext = notExist[0];
                        }

                        if(notExist_count == 4){
                            required_other_ext = ' or kml or json';
                        }

                        extensions = notExist;
                        uploading_filesCount = 0;

                        var error_msg = 'Please upload the files with following extensions : <br>'+required_ext+required_other_ext;

                        $('#error_file_text').html(error_msg);
                        $('#error_file_text').fadeIn();

                    }
                }else{
                    $('#upload').slideUp();
                    $('#progress').fadeIn();
                    $('#upload_finals').fadeIn();
                    $('#upload_finals').prop('disabled', false);
                }
            }
        },

        start: function (e) {  /* 2. WHEN THE UPLOADING PROCESS STARTS, SHOW THE MODAL */
            //$("#modal-progress").modal("show");
        },
        stop: function (e) {  /* 3. WHEN THE UPLOADING PROCESS FINALIZE, HIDE THE MODAL */

            var layer_id = $("#layer_id").val();

            /* If error uoloaded, Not load to Map */
            if (upload_error_status > 0){
                // error Alert
                console.log("Uploaded error");
            }else{

                preloader_in();

                //Progress bar
                $("#progess_bar_text").html("Loading...");
                $("#progess_bar_text").fadeIn();
                //alert_notification_popup('success', 5);

                setTimeout(function(){

//                    $("#modal-container-87694").delay(2000).modal("hide");
                    if(!gid){
                        var gourdId = '0';
                    }else{
                        var gourdId = gid;
                    }

                    var load_url = subdivision+"/map/load_layer_files/"+layer_id+"/"+gourdId+"/";
                    var layerLoad = $.ajax({
                                  url:load_url,
                                  dataType: "json",
                                  success: alert_notification_popup('success', 1),
                                  error: function (xhr) {
                                    alert_notification_popup('fail', 7);
                                  }
                                });

                    $.when(layerLoad).done(function() {
                        var response = jQuery.parseJSON(layerLoad.responseText);
                            if(response['status'] == 1){
                               var groupId = (!gid)? 0 : gid;

//                               layer_to_map(layer_id, groupId, response['layer_type'], response['layer_file'],true, response['layer_name'],1);
                               layer_to_map_new(layer_id, groupId, response['layer_type'], response['layer_file'],true, response['layer_name'],1);

                               //Progress bar
                               var strProgress = 90 + "%";
                               $(".progress-bar").css({"width": strProgress});
                               $(".progress-bar").text(strProgress);

                            }else{
                                alert_notification_popup('fail', 3);

                                var groupId = (!gid)? 0 : gid;
                                deleteData(layer_id, 'map');

                            }
                    });

                }, 3000);
            }
        },
        progressall: function (e, data) {  /* 4. UPDATE THE PROGRESS BAR */

          $(".progress-bar").show();
          $('#upload_finals').fadeOut();
          $("#progess_bar_text").html("Uploading...");
          $("#progess_bar_text").fadeIn();


          var progress = parseInt(data.loaded / data.total * 100, 10);

          var half_percent = parseInt(((data.total/2) / data.total) * 100, 10);

          var currentProgress = 0;

          if(progress >= half_percent){
                currentProgress = parseInt((progress - (progress/10)),10);
          }else{
                currentProgress = parseInt(progress,10);
          }


          var strProgress = currentProgress + "%";
          $(".progress-bar").css({"width": strProgress});
          $(".progress-bar").text(strProgress);
        },
        done: function (e, data) {

            /* To Remove not allowed file row from panel */
            $(".file-row-text-no").each(function (){
                var $this = $(this);
                $this.slideUp(function() {
                    $this.parent().parent().remove();
                });
            });
            /* /To Remove not allowed file row from panel */

            /* To update the allowed file with uploading status*/
            var result = data.result;
            if(result.status === 1){
                var _img = 'complete_icon.png'
            }else{
                upload_error_status++;
                var _img = 'fail_icon.png'
            }
            var uploadStatu_img = '<img src="/static/img/'+_img+'">';
            var data_context = data.context.children()[0];
            var data_context_child = $(data_context).children();
            var data_context_child_find = $(data_context_child).find('.uploading_stauts');
            $(data_context_child_find).html(uploadStatu_img);

            /* To update the allowed file with uploading status*/
        }
    });

}

function add_file_details_to_panel(filename, fileSize, fileExtension, data, fileStatus){

    var extensions = ['prj','shp','shx', 'dbf', 'kml', 'json', 'zip'];
    var isExtension = extensions.includes(fileExtension);

    if (isExtension == false){
        fileExtension = 'other';
    }

    if(fileStatus == true){
        var _file_row_text = 'file-row-text col-sm-12';
        var _file_upload_status = 'pending.png';
        var _file_img = 'file_icon_'+fileExtension+'.png';
    }else{
        var _file_row_text = 'file-row-text-no col-sm-12';
        var _file_upload_status = 'stop.png';
        var _file_img = 'file_icon_no.png';
    }

    var node = $('<div/>').addClass('file-row');
    var format_size = getReadableFileSizeString(fileSize);
    var file_detail ='<span class="uploading_file_icon col-sm-2"><img src="/static/img/'+_file_img+'"></span><span class="uploading_file_text col-sm-8"><small>'+filename +'</small><br><small>'+format_size+'</small></span><span class="uploading_stauts col-sm-2"><img src="/static/img/'+_file_upload_status+'"></span>';
    var file_txt = $('<div/>').addClass(_file_row_text).append(file_detail);

    if(fileStatus == true){
        file_txt.prependTo(node).append(uploadButton.clone(true).data(data)); //add to node element
    }else{
        file_txt.prependTo(node).append(uploadButton_fasle.clone(true));
    }

    node.appendTo(data.context); //attach node to data context
    $('.each_upload').hide();
    $('.each_upload_false').hide();

}
/* [END] - Upload Layer files */


/* [START] - Navigative */

$('#sidepanel_open').click(function(){
    if($('.st-menu-open').length){
        $('#st-container').removeClass('st-menu-open');
    }else{
        $('#st-container').addClass('st-effect-1');
        $('#st-container').addClass('st-menu-open');
    }
});

/* [START] - Open Panel */

$("#open_panel").draggable({
   handle: ".open_panel_hand"
});

$('#opening_panel').click(function(){
    $('#open_panel').slideToggle('normal', function(){
        if ($(this).is(':hidden')) {

            $("#my_layer_panel").empty();
            $("#my_map_panel").empty();
            $("#my_project_panel").empty();

        }else{
            $.ajax({
                  url:subdivision+"/map/my_map_data_all/",
                  type: 'GET',
                  dataType: "json",
                  beforeSend: function(){
                               // $("#overlay_product_list").show();
                            },
                  success: function(data){

                            $("#my_layer_panel").empty();
                            $("#my_map_panel").empty();
                            $("#my_project_panel").empty();

                            var myProjectList = '';
                            if(data.my_projects.length > 0){
                                for(var p=0; p<data.my_projects.length; p++){
                                   var my_projects = data.my_projects;
                                   myProjectList += '<li class="list-group-item2" onclick="popup_project_open(`'+my_projects[p]['id']+'`,`'+my_projects[p]['name']+'`)";><small>'+my_projects[p]['name']+'</small></li>';
                                }
                            }
                            $('#my_project_panel').append(myProjectList);

                            /*var myMapList = '';
                            var gourpID = (!gid)?0:gid;
                            if(data.my_map.length > 0){
                                for(var m=0; m<data.my_map.length; m++){
                                   var my_map = data.my_map;
                                   myMapList += '<li class="list-group-item2"><a href="'+subdivision+'/map/view/'+my_map[m]['id']+'/'+gourpID+'" target="_blank" style="text-decoration: none;"><small>'+my_map[m]['name']+'</small></a></li>';
                                }
                            }
                            $('#my_map_panel').append(myMapList);
							*/

                            var myLayerList = '';
                            if(data.my_layers.length > 0){
                                for(var l=0; l<data.my_layers.length; l++){
                                   var my_layers = data.my_layers;
                                   myLayerList += '<li class="list-group-item2" onclick="my_layer_load(`'+my_layers[l]['id']+'`,`'+my_layers[l]['layer_type']+'`,`'+my_layers[l]['layerfileName']+'`,`'+my_layers[l]['name']+'`)";><small>'+my_layers[l]['name']+'</small></li>';
                                }
                             }
                             $('#my_layer_panel').append(myLayerList);
                        }
            });
        }
    });
});

$('#oclose').click(function(){
    $('#open_panel').slideToggle();
});

/* [END] - Open Panel */

/* [START] - Map Tool on sheet*/

$('#mapToolPanel').click(function(){
    if($("#page_area").is(":hidden")){
        $('#mapTool_on_sheet').slideToggle();
    }else{
        $('#mapTool_on_sheet').slideUp();
    }
});

$("#mapTool_on_sheet").draggable({
   handle: ".mapTool_hand_on_sheet"
});

$('#mtclose').click(function(){
    $('#mapTool_on_sheet').slideToggle();
});

// [START] - Map Tool on Sheet - Data Frame
$("#mapTool_dataFrame_sheet").click(function(){
    if($("#map_area").is(":hidden")){
        $("#map_area").show();
    }else{
        $("#map_area").hide();
    }
});
// [END] - Map Tool on Sheet - Data Frame

// [START] - Map Tool on Sheet - Title
$("#mapToolTitle_sheet").click(function(){
     var title_block = '<div class="map_tool_title_block_sheet" style="position: absolute; top: 70px; left:850px; z-index: 1000; cursor: move;"><span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span><h2><span class="title_text" style="cursor: text;">Title</span></h2></div>';
        $("#map_area").append(title_block);

        $(".map_tool_title_block_sheet").draggable();
        $(".map_tool_title_block_sheet").resizable();

        $(".title_text").editable({
            multiline: true,
            //autoselect: true,
            saveDelay: 800
        });

        $(".map_tool_title_block_sheet").mouseover(function(){
            var $this = $(this);
            $(this).css('border', '1px dashed #8c8c8c');
            $this.find('.close_btn_span').show();
        });

        $(".map_tool_title_block_sheet").mouseout(function(){
            var $this = $(this);
            $(this).css('border', '');
            $this.find('.close_btn_span').hide();
        });

        $('.close_img').click(function(){
            var $this = $(this).parent();
            $this.parent().remove();
        });
});
// [START] - Map Tool on Sheet - Title

// [START] - Map Tool on Sheet - North Arrow
$('#mapToolNorthArrow_sheet').click(function(){
    if($("#north_arrow_content_on_sheet").length == 0) {

        var nA = '<div id="north_arrow_content_on_sheet" class="northArrowContent_sheet" style="width: 150px; height: 150px; padding: 10px; margin: 0; position: absolute; top: 60px; right: 200px; cursor: move; z-index: 1000;">'
                +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                +'<div id="north_arrow" style="cursor: move;">'
                +'<img src="/static/img/north_arrow.png" style="width: 100%; height: 100%;">'
                +'</div></div>';

        $("#map_area").append(nA);

        $(".northArrowContent_sheet").mouseover(function(){
            var $this = $(this);
            $(this).css('border', '1px dashed #8c8c8c');
            $this.find('.close_btn_span').show();
        });

        $(".northArrowContent_sheet").mouseout(function(){
            var $this = $(this);
            $(this).css('border', '');
            $this.find('.close_btn_span').hide();
        });

        $("#north_arrow_content_on_sheet").resizable();
        $("#north_arrow_content_on_sheet").draggable();

        $('.close_img').click(function(){
            var $this = $(this).parent();
            $this.parent().remove();
        });
    }

    if($("#mapToolNorthArrow_sheet").is(":hidden")){
        //
    }else{
        $('.mapToolNorthArrow_sheet').toggle();
    }
});
// [END] - Map Tool on Sheet - North Arrow

// [START] - Map Tool on Sheet - Scale Bar
$('#mapToolScaleBar_sheet').click(function(){

    if($("#scale_bar_content_sheet").length == 0) {
           var scale_bar_content = '<div id="scale_bar_content_sheet" class="mapToolScaleBarContent_sheet" style="width: 300px; height: 80px; padding: 0.5em; margin: 0.5em; position: absolute; top: 220px; right: 200px; cursor: move; z-index: 1000; display: none;">'
                            +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                            +'<div id="scale_bar_sheet" style="cursor: move; width: 100%; height: 100%; margin:auto;">'
                            +'</div></div>';

           $("#map_area").append(scale_bar_content);

           $("#scale_bar_content_sheet").resizable();
           $("#scale_bar_content_sheet").draggable();

            $("#scale_bar_content_sheet").mouseover(function(){
                var $this = $(this);
                $(this).css('border', '1px dashed #8c8c8c');
                $this.find('.close_btn_span').show();
            });

            $("#scale_bar_content_sheet").mouseout(function(){
                var $this = $(this);
                $(this).css('border', '');
                $this.find('.close_btn_span').hide();
            });

            $('.close_img').click(function(){
                var $this = $(this).parent();
                $this.parent().remove();
            });
    }

    $("#scale_bar_sheet").empty();
    $('.mapToolScaleBarContent_sheet').toggle();
    var scale_block = document.getElementsByClassName("leaflet-bottom")[0];
    var scale_clone = scale_block.firstElementChild.cloneNode(true);
    var scale_div = document.getElementById("scale_bar_sheet");
    scale_div.appendChild(scale_clone);

    html2canvas(document.querySelector("#scale_bar_sheet")).then(canvas => {
        var  canvas_re= document.body.appendChild(canvas);
        $("#scale_bar_sheet").empty();
        $("#scale_bar_sheet").append(canvas_re);
    });
});
// [END] - Map Tool on Sheet - Scale Bar



/* [END] - Map Tool on sheet */


// [START] - Map Tool on Sheet - Citation
$("#mapToolCitation_sheet").click(function(){
    var desc_block = '<div class="map_tool_citation_block_sheet" style="position: absolute; top: 300px; right: 200px; width:300px; z-index: 1000; cursor: move;">'
                   +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                   +'<p><span class="citation_content_sheet text_style2" style="cursor:text;">'
                   +'Authority :'
                   +'</span></p>'
                   +'</div>';

    $("#map_area").append(desc_block);

    $(".map_tool_citation_block_sheet").draggable();
    $(".map_tool_citation_block_sheet").resizable();

    $(".citation_content_sheet").editable({
        multiline: true,
        //autoselect: true,
        saveDelay: 800
    });

    $(".map_tool_citation_block_sheet").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();

    });

    $(".map_tool_citation_block_sheet").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
        $this.find('.close_btn_span').hide();
    });

    $('.close_img').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });
});
// [END] - Map Tool on Sheet - Citation

// [START] - Map Tool on Sheet - Description
$("#mapToolDescription_sheet").click(function(){
    var desc_block = '<div class="map_tool_description_block_sheet" style="position: absolute; top: 330px; left: 865px; width:300px; z-index: 1000; cursor: move;">'
                   +'<span class="close_btn_span" style="position: absolute; top: -8px; right: -8px; cursor: pointer; display:none;"><img class="close_img" src="/static/img/close_button.png"></span>'
                   +'<p><span class="description_content_sheet text_style" style="cursor:text;">Description</span></p>'
                   +'</div>';

    $("#map_area").append(desc_block);

    $(".map_tool_description_block_sheet").draggable();
    $(".map_tool_description_block_sheet").resizable();

    $(".description_content_sheet").editable({
        multiline: true,
        //autoselect: true
        saveDelay: 1000
    });

    $(".map_tool_description_block_sheet").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();

    });

    $(".map_tool_description_block_sheet").mouseout(function(){
        var $this = $(this);
        $(this).css('border', '');
        $this.find('.close_btn_span').hide();
    });

    $('.close_img').click(function(){
        var $this = $(this).parent();
        $this.parent().remove();
    });
});
// [END] - Map Tool on Sheet - Description


// [START] - Map Tool on Sheet - Legend
$("#mapToolLegend_sheet").click(function(){

    var legend_block = '<div class="legend_contain_sheet" style="width: 200px; position: relative; top: 360px; left:900px; z-index: 1000; cursor: move;">'
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

        var legend_row = '<div class="legen_row" style="margin: 5px; cursor: move;"><div id="legend_rectangle" class="legend_rectangle" style="background-color:'+$color+' !important; -webkit-print-color-adjust: exact; float: left; cursor: pointer;"></div><div class="legen_text text_style" style="float: left; margin-left: 10px; cursor: text;">'+$text+'</div><b><span class="legend_row_close text_style" style="float: right; cursor: pointer; margin-right: 10px; color: #ff0000; display:none;">x</span></b><br></div>';
        lagendMain +=legend_row;
    });

    $.each($(".legend_subcontent .legend_row"), function(){
        var $this = $(this);
        var $color = $(this).find('.legend_text').css("color");
        var $text = $.trim($this.text());
        var legend_row = '<div class="legen_row" style="margin: 5px; cursor: move;"><div id="legend_rectangle" class="legend_rectangle" style="background-color:'+$color+' !important; -webkit-print-color-adjust: exact; float: left; cursor: pointer;"></div><div class="legen_text text_style" style="float: left; margin-left: 10px; cursor: text;">'+$text+'</div><b><span class="legend_row_close text_style" style="float: right; cursor: pointer; margin-right: 10px; color: #ff0000; display:none;">x</span></b><br></div>';
        legendSub +=legend_row;
    });

    legend_block +=lagendMain;
    legend_block +=legendSub;
    legend_block += '</div></div>';

    $("#map_area").append(legend_block);

     $(".legend_contain_sheet").draggable();
     $(".legend_contain_sheet").resizable();
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
    $('.colpick').css({'z-index' : '1000000000000000'});
    // /Colpick


    $(".legend_contain_sheet").mouseover(function(){
        var $this = $(this);
        $(this).css('border', '1px dashed #8c8c8c');
        $this.find('.close_btn_span').show();
        $this.find('.legend_add_btn').show();

        var $legend_content = $this.find('.legend_content');
        var $legen_row = $legend_content.find('.legen_row');
        $legen_row.find('.legend_row_close').show();
    });

    $(".legend_contain_sheet").mouseout(function(){
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
        $('.colpick').css({'z-index' : '1000000000000000'});
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
// [END] - Map Tool on Sheet - Legend

// [START] - Map Tool on Sheet - Map Indicator
$("#mapToolIndicator_sheet").click(function(){
    if($("#map .leaflet-control-minimap").length == 0) {
        map_indicator_sheet(1);
    }else{
        $('#map .leaflet-control-minimap').toggle();
    }

});
// [END] - Map Tool on Sheet - Map Indicator

//$('#preview_map_button').click(function(){
//    $('#preview_map').slideToggle();
//});

$('#pmclose').click(function(){
    $('#preview_map').slideToggle();
});


$('#settings_panel').click(function(){
    $('#con_panel').slideToggle();
});

$('#cclose').click(function(){
    $('#con_panel').slideToggle();
});

/* [END] - Navigative */


/* [START] - Switch Toggle */

$('.switch_toggle').bootstrapToggle('off');

$('#track_location').change(function(){
    var track = $(this);
    if (track.is(':checked')){
        getLocation();
    }else{
        removeLocation();
    }
});

$('#digitizing_tool').change(function(){
    var digi_tool = $(this);
    if (digi_tool.is(':checked')){
        $('.leaflet-draw').fadeIn();
    }else{
        draw_editstop();
        $('.leaflet-draw').fadeOut();

    }
});

$('#measurements_tool').change(function(){
    var ms_tool = $(this);
    if (ms_tool.is(':checked')){
        measure_layersId("add");
        $('#measurements').fadeIn();
        shapes_vertexs_style();
    }else{
        measure_layersId("remove");
        $('#measurements').fadeOut();
    }
});

$('#legend_box').change(function(){
    $("#legend").slideToggle();
});

$('#info_window_switch').change(function(){
    var info = $(this);
    if (info.is(':checked')){
        popup_enable = true;
    }else{
        popup_enable = false;
    }
});

$('#swipe_control').change(function(){
    var sw = $(this);
    if (sw.is(':checked')){
        var rangeSlider = "<center><input id='range' class='range' type='range' min='0' max='1.0' step='any' /></center>";
        $('#swipecontrol').html(rangeSlider);
        $('#swipecontrol').fadeIn();
        swipeControl();
    }else{
        swipeControlOut();
        $('#swipecontrol').html('');
        $('#swipecontrol').fadeOut();
    }
});

/* [END] - Switch Toggle */

/* [START] - Legend */
$("#legend").draggable({
   handle: ".legendhand"
});
/* [END] - Legend */


/* [START] - Save As Layer */
$("#layer_submit_save").click(function (){
    var layerStatus = false;
    var layer_name = $('#layer_name_save').val();
    var layer_status = $("input[name='layer_status']:checked").val();
    var layer_descri = $('#layer_descri_save').val();
    var save_data;

    $("#layer_error_save_as").empty();

    if(layer_name != ''){
        layerStatus = true;
    }else{
        $("#layer_error_save_as").html("Field required");
    }

    if(layerStatus == true){

        $("#map_description").html(layer_descri);
        $("#print_map_description_container").html(layer_descri);
        save_data = {'layer_name':layer_name, 'layer_status':layer_status, 'layer_descri':layer_descri, 'group_id':gid};

        var layersOrder = $("#sortable").sortable("toArray");
        var layersOrderCount = layersOrder.length;
        if(layersOrderCount > 0){
            var tosave = $.ajax({
                          url:subdivision+"/map/save_as_layers/",
                          data: save_data,
                          type: 'POST',
                          dataType: "json",
                          success: alert_notification_popup('success', 2),
                          error: function (xhr) {
                            alert_notification_popup('fail', 7);
                          }
                        });

            $.when(tosave).done(function() {

                var response = jQuery.parseJSON(tosave.responseText);

                if(response['status'] == 1){

                    var layerFileID = response['drawLayerId']
                    var group_file_id = response['group_drawLayerId'];
                    SetDrawLayerId(layerFileID);
                    measure_layersId("remove");

                    for(l=0; l<layersOrderCount; l++){
                        var groupID = layersOrder[l];
                        var getLayerGroup = getLayerGroupArr(groupID);
                        var groupID_visibility = $('#checkbox_'+groupID);
                        var layer_status = 0;

                        if (groupID_visibility.is(':checked')){
                            layer_status = 1;
                        }

                        var layerData = toGeojson_generation(groupID);
                        if(layerData != null){
                            var convertedData = JSON.stringify(layerData);
                            var data = {'layer_name':getLayerGroup.group_name, 'dataGeojson':convertedData, 'layerfileID':layerFileID, 'layer_status':layer_status, 'group_id':gid, 'group_file_id':group_file_id, 'layer_order':(l+1)}

                            $.ajax({
                                  url:subdivision+"/map/save_layers_file/",
                                  data: data,
                                  type: 'POST',
                                  dataType: "json",
                                  beforeSend: function(){
                                //                $("#overlay_product_list").show();
                                              },
                                  success: function(data){
                                            // console.log(data);
                                            },
                                  error: function (xhr) {
                                    alert_notification_popup('fail', 7);
                                  }
                                });
                        }
                    }

                }
            });
        }

        measure_layersId("add");
        $('#modal_container_save_as').modal('hide');
    }
});

/* [END] - Save As Layer */

/* [START] - Searching Layers*/

$('#search_layer_tab').click(function(){
    if(!gid){
        add_layers_list_to_panel("user");
        $('#search_user_layers').prop('checked', true);
    }else{
        add_layers_list_to_panel("group");
        $('#search_group_layers').prop('checked', true);
    }
});

$("input[name='search_layers']").click(function(){
    var $this = $(this);
    var leayer_status_type =  $this.val();
    $('#layers_searching').val('');
    add_layers_list_to_panel(leayer_status_type);
});

$('#layers_search').click(function(){
    var searchVal = $('#layers_searching').val();
    if(searchVal != ''){
        add_layers_list_to_panel("search", searchVal);
    }
});

function add_layers_list_to_panel(search_type, val=''){

    var layer_row = '', url, values = {};
    var group_id = (!gid)?0:gid;

    if(search_type == 'group' || search_type == 'public_group' || search_type == 'all_group'){
        url = subdivision+"/map/search_group_layers_list/"+search_type+"/"+group_id+"/";
    }else if(search_type == 'search' & val !=''){
        url = subdivision+"/map/searchbox_layers_list/"+group_id+"/";
        values = {'search':val}
    }else{
        url = subdivision+"/map/search_layers_list/"+search_type+"/";
    }

    $.ajax({
        url: url,
        dataType: 'json',
        data:values,
        beforeSend: function(){
            preloader_in();
        },
        success: function(response){
            if(response.status ==1){
                var search_list = response.searchList;
                var count = search_list.length;
                if(count > 0){
                    for(var i=0; i<count; i++){

                        layer_row += '<div class="well well-sm">'
                                    +'<div class="row">'
                                    +'<div class="col-xs-8 col-md-10 section-box">'
                                    +'<h5>'+search_list[i].layer_name+'</h5>'
                                    +'<small>'+search_list[i].description+'</small>'
                                    +'</div>'
                                    +'<div class="col-xs-4 col-md-2 text-center">'
                                    +'<input type="checkbox" class="add_layer_checkbox" name="add_layers_checkbox[]" data-name="'+search_list[i].layer_name+'" value="'+search_list[i].layerType+'_^_'+search_list[i].layerID+'_^_'+search_list[i].fileType+'_^_'+search_list[i].fileName+'_^_'+search_list[i].group_id+'">'
                                    +'<span style="padding-left: 10dpx;"><button type="button" class="btn btn-success btn-xs layer_add_button" onClick ="add_layer_button(`'+search_list[i].layerType+'`, '+search_list[i].layerID+', `'+search_list[i].fileType+'`, `'+search_list[i].fileName+'`, `'+search_list[i].layer_name+'`, `'+search_list[i].group_id+'`)"> Add Layer </button></span>'
                                    +'</div>'
                                    +'</div>'
                                    +'</div>';
                    }
                }
                $('#all_layer_list').html(layer_row);
                preloader_out();
              }
        }
    });
}

/* [END] - Searching Layers*/

/* [START] - sortable Layer Order*/

var $sortableList = $("#sortable");
var sortEventHandler = function(event, ui){
    var idsInOrder = $("#sortable").sortable("toArray");
    change_layer_order(idsInOrder);
};

$sortableList.sortable({
    placeholder: "ui-state-highlight",
    stop: sortEventHandler
});

$( "#sortable" ).disableSelection();

/* To remove layer in order layer panel*/
$(document).on('click','.layergroup_order_remove',function(){
    var $this = $(this).parent();
    var order_sub_div = $this.parent();
    var layerGroupId = $(order_sub_div).attr('id');

    /*Remove from layer group array & remove layergroup from map*/
    layerGroup_remove(layerGroupId);

    /* Clear Mesauere Array */
    if(layerGroupId == '_drawLayerGroup'){
        measureLayers = [];
        measureLayerID = [];
    }
    /* /Clear Mesauere Array */

    /* /Remove from layer group array & remove layergroup from map*/

    /* Remove from legend */
    var legend_row = '#legend_'+layerGroupId;
    $(legend_row).remove();
    /* /Remove from legend */

    $(order_sub_div).remove();
});

/* /To remove layer*/

/* To switch layer opacity in order layer panel*/
$(document).on('click','.layerGroup_opacity_button',function(){
    var $this = $(this).next();
    var slider_id = $($this).attr('id');
    var slider = $('#'+slider_id);

    if(slider.is(":visible")){
        slider.hide();
    }else{
        slider.show();
    }
});
/* /To switch layer opacity in order layer panel*/

/* To hide/show layer in order layer panel*/
$(document).on('change','.layerGroup_checkbox',function(){
    var $this = $(this);
    var goupIdCheckbox = $($this).attr('id');
    var goupId = goupIdCheckbox.substring(9);

    if($('#'+goupIdCheckbox).is(":checked")){
        hide_layergroup(goupId, 0);
    }else{
        hide_layergroup(goupId, 1);
    }
});
/* /To hide/show layer in order layer panel*/

/* [END] - sortable Layer Order*/

/* [START] - Layer Styling */

$("#line_weight").slider({
    value: 20,
    slide: function(event, ui ) {
        var width = Math.round(ui.value/10);
        $('#line_weight_text').html(width);
        layer_styling('_layerWeight', width);
    }
});

$("#fill_color_fillOpacity").slider({
    value: 40,
    slide: function(event, ui ) {
        var val = ui.value;
        var opacity = val/100;
        $('#fill_color_fillOpacity_text').html(val);
        layer_styling('_layerFillOpacity', opacity);
    }
});

$("#border_color_Opacity").slider({
    value: 100,
    slide: function(event, ui ) {
        var val = ui.value;
        var opacity = val/100;
        $('#border_color_Opacity_text').html(val);
        layer_styling('_layerOpacity', opacity);
    }
});

$("#fill_color_fillOpacity_bubble").slider({
    value: 40,
    slide: function(event, ui ) {
        var val = ui.value;
        var opacity = val/100;
        $('#fill_color_fillOpacity_bubble_text').html(val);
        var property = $('#bubble_attrs').val();
        bubble_styling(property, '_layerFillOpacity', opacity);
    }
});

$("#border_color_Opacity_bubble").slider({
    value: 100,
    slide: function(event, ui ) {
        var val = ui.value;
        var opacity = val/100;
        $('#border_color_opacity_bubble_text').html(val);
        var property = $('#bubble_attrs').val();
        bubble_styling(property, '_layerOpacity', opacity);
    }
});

$("#bubble_weight").slider({
    value: 20,
    slide: function(event, ui ) {
        var width = Math.round(ui.value/10);
        $('#weight_bubble_text').html(width);
        var property = $('#bubble_attrs').val();
        bubble_styling(property, '_layerWeight', width);
    }
});

$("#radius_bubble").slider({
    value: 40,
    slide: function(event, ui ) {
        var width = ui.value;
        $('#radius_bubble_text').html(width);
        var property = $('#bubble_attrs').val();
        bubble_styling(property, '_layerRadius', width);
    }
});

$('#bubble_attrs').change(function(){
    var $this = $(this).val(), value, option;
    var current_layer_group = $('#layer_group_options').val();
    var radius = parseInt($('#radius_bubble_text').text());
    $('#bubble_marker').attr("disabled", true);

    if(current_layer_group != ''){
        if($this != ''){
            $('#bubble_marker').attr("disabled", false);
            bubble_styling($this, '_layerRadius', radius);
        }
    }else{
        $this.html('');
        $('#bubble_marker').prop('checked', false);
        $('#bubble_marker').attr("disabled", true);
    }

});

$(document).on('click','#no_fill_col',function(){
    var $this = $(this), value;
    if ($this.is(':checked')){
        $('#fill_color_cntr').fadeOut();
        value = false;
    }else{
        $('#fill_color_cntr').fadeIn();
        value = true;
    }
    layer_styling('_layerFill', value);
});

$(document).on('click','#no_line_col',function(){
    var $this = $(this), value;
    if ($this.is(':checked')){
        $('#border_color_div').fadeOut();
        value = false;
    }else{
        $('#border_color_div').fadeIn();
        value = true;
    }
    layer_styling('_layerStroke', value);

});

$('#layer_line_type').change(function(){
    var $this = $(this).val(), value, option;
    if($this == 'Line'){
        option = '_layerDashArray', value=[];
    }else if($this == 'Dashed_1'){
        option = '_layerDashArray', value=[5,10];
    }
    layer_styling(option, value);
});

if($('#start_color_bubble').length){
    $('#start_color_bubble').colpick({
        layout:'rgbhex',
        color:'ff3385',
        onSubmit:function(hsb,hex,rgb,el,bySetColor) {
            var hex_color = '#'+hex;
            $(el).css('background-color', hex_color);
            $(el).colpickHide();
            $('#start_color_bubble_value').val(hex_color);
            var property = $('#bubble_attrs').val();
            bubble_styling(property, 'start_color', hex_color);
        }
    });
}

if($('#end_color_bubble').length){
    $('#end_color_bubble').colpick({
        layout:'rgbhex',
        color:'ff3385',
        onSubmit:function(hsb,hex,rgb,el,bySetColor) {
            var hex_color = '#'+hex;
            $(el).css('background-color', hex_color);
            $(el).colpickHide();

            $('#end_color_bubble_value').val(hex_color);
            var property = $('#bubble_attrs').val();
            bubble_styling(property, 'end_color', hex_color);
        }
    });
}

$('#layer_group_options').change(function(){
    var $this = $(this).val();
    $("#cat_attrs").html('');
    $("#cla_attrs").html('');
    $("#bubble_attrs").html('');
    $("#layergroup_error").html('');

    if($this != ''){
        /* Update Checkbox for hiding Marker in Bubble section  */
        var groupID_visibility = $('#checkbox_'+$this);
        if(groupID_visibility.is(':checked')){
            $('#bubble_marker').prop('checked', false);
        }else{
            $('#bubble_marker').prop('checked', true);
        }
       /* /Update Checkbox for hiding Marker in Bubble section  */

        update_to_style_panel($this);
        add_column_ToSelectInput($this);
    }

    /* Clear properties list list in layer info window panel */
    $("#dis_attr").empty();
    $("#sel_attr").empty();
    $("#attr_table").empty();
    /* /Clear properties list list in layer info window panel */

});

$(document).on('click','#bubble_marker',function(){
    var $this = $(this);
    var layerGroup = $('#layer_group_options').val();
    var groupID_checkbox_left = $('#checkbox_'+layerGroup);
    $('#layergroup_error').html('');

    if(layerGroup != ''){
        if ($this.is(':checked')){
            groupID_checkbox_left.prop('checked', false);
            hide_layergroup(layerGroup, 1);

        }else{
            groupID_checkbox_left.prop('checked', true);
            var layersOrder = $("#sortable").sortable("toArray");
            change_layer_order(layersOrder);
        }
    }else{
        $('#layergroup_error').html('Please select layer style');
        $this.prop('checked', false);
        $this.attr("disabled", true);
    }
});

function get_fill_style(class_type){
    var fill_vale;
    if(class_type == 'categorized'){
        fill_vale = $('#fill_style_categorized').val();
    }else if(class_type == 'classify'){
        fill_vale = $('#fill_style_classify').val();
    }

    if(fill_vale != ''){
        fill_color_range(class_type, fill_vale);
    }
}

/* Categorized */
$('#cat_attrs').change(function(){
    get_fill_style('classify');
});
/* /Categorized */

/* Classify */
$('#cla_attrs').change(function(){
    get_fill_style('classify');
});

$('#classify_num').change(function(){
    get_fill_style('classify');
});

$('#classify_mode').change(function(){
    get_fill_style('classify');
});
/* /Classify */

/* [END] - Layer Styling */


/* [START] - Spatial Analysis */

$('#sp_analysis_type').change(function(){
    var $this = $(this).val();
    $('#sp_error').html('');

    if($this == 'buffering'){
        $('#sp_units_value').fadeIn();
        $('#sp_layerGroup_clip_div').fadeOut();
    }else{
        $('#sp_units_value').fadeOut();
        $('#sp_layerGroup_clip_div').fadeIn();
    }
});

$('#sp_layerGroup_source').change(function(){
    var $this = $(this).val();
    var layerGroups_count = layersGroups.length;
    var sp_layer_clip = '';

    if(layerGroups_count > 1){
        for(l=0 ; l<layerGroups_count; l++){
            var layerGroup = layersGroups[l];

            if($this != layerGroup.group_id){
                sp_layer_clip += '<option value="'+layerGroup.group_id+'">'+layerGroup.group_name+'</option>';
            }
        }
    }
    $('#sp_layerGroup_clip').html(sp_layer_clip);
});

$('#sp_button').click(function(){
    $('#sp_error').html('');
    var sp_process = $('#sp_analysis_type').val();
    var sp_layer_source = $('#sp_layerGroup_source').val();
    var sp_layer_clip = $('#sp_layerGroup_clip').val();
    var sp_new_layer = $('#sp_new_layerGroup').val();
    var sp_layer_status = $("input[name='sp_layer_status']:checked").val();
    var sp_unit = $('#sp_units').val();
    var sp_value = $('#sp_value').val();
    var sp_status = true;

    if(sp_process == 'buffering' && sp_unit == ''){
        $('#sp_error').html('Please select unit');
        sp_status = false;
    }

    if(sp_process == 'buffering' && sp_value == ''){
        $('#sp_error').html('Please enter value');
        sp_status = false;
    }

    if(sp_layer_source == ''){
        $('#sp_error').html('Please select Input Layer');
        sp_status = false;
    }

    if(sp_layer_clip == '' && sp_process != 'buffering'){
        $('#sp_error').html('Please select Clipping Layer');
        sp_status = false;
    }

    if(sp_new_layer == ''){
        $('#sp_error').html('Please enter new layer');
        sp_status = false;
    }

    if(sp_status != false){
        spatial_analysis_process(sp_process, sp_layer_source, sp_layer_clip, sp_unit, sp_value, sp_new_layer);
    }
});

/* [END] - Spatial Analysis */

/* [START] - Info Window */
$('#layers_info_window').change(function(){
    var $this = $(this).val();
    $("#dis_attr").empty();
    $("#sel_attr").empty();
    $(".list-right ul").html('');
    $("#attr_table").html('');
    $('#info_window_error').html('');

    if($this != ''){

       propertiesList_for_infoWindow($this);

       /* Clear select drow list in layer styling panel */
        $("#cat_attrs").html('');
        $("#cla_attrs").html('');
        $("#bubble_attrs").html('');
        /* /Clear selec tdrow list in layer styling panel */
    }
});

$(document).on('click','.list-group-item',function(){
    $(this).toggleClass('active');
});

$('.list-arrows button').click(function () {
    var $button = $(this), actives = '';
    if ($button.hasClass('move-left')) {
        actives = $('.list-right ul li.active');
        actives.clone().appendTo('.list-left ul');
        actives.remove();
        change_info_window_list(actives, false);
    } else if ($button.hasClass('move-right')) {
        actives = $('.list-left ul li.active');
        actives.clone().appendTo('.list-right ul');
        actives.remove();
        change_info_window_list(actives, true);
    }
});

$('#info_window_button').click(function(){
    var layer_name = $('#layers_info_window').val();
    var info_window = true;

    if(layer_name == ''){
        $('#info_window_error').html('Please select layer');
        info_window = false;
    }

    if(info_window != false){
        $('#attr_table>tbody tr').each(function (a, b){

            /* Update property array */
            var old_property = $(".old_property", b).text();
            var new_property = $("input[name='new_property[]']", b).val();

            if(old_property != ''){
                var propertyArr = getPropertieyArr(old_property);
                if(propertyArr != null){
                    propertyArr.given_name = new_property;
                }
            }
            /* /Update property array */
        });

        /* Update Properties of current layer */
        var getLayerGroup = getLayerGroupArr(layer_name);

        if(getLayerGroup != null){
            var geoJSON = getLayerGroup.geoJson;

            window[layer_name].clearLayers();
            window[layer_name].addLayer(geoJSON);
            window[layer_name].addTo(map);

            var getLayer = window[layer_name].toGeoJSON();
            var layer_temp = getLayer;

            window[layer_name].clearLayers();

            var color = '', fillcolor = '', fill = true, stroke = true, dashArray = [], opacity = 1, fillOpacity=0.8, weight = 2;

            color = getLayerGroup._layerColor;
            fillcolor = getLayerGroup._layerFillColor;
            fill = (!getLayerGroup._layerFill)?true:getLayerGroup._layerFill;
            stroke = (!getLayerGroup._layerStroke)?true:getLayerGroup._layerStroke;
            opacity = (!getLayerGroup._layerOpacity)?1:getLayerGroup._layerOpacity;
            fillOpacity = (!getLayerGroup._layerFillOpacity)?0.8:getLayerGroup._layerFillOpacity;
            dashArray = (!getLayerGroup._layerDashArray)?[]:getLayerGroup._layerDashArray;
            weight = (!getLayerGroup._layerWeight)?2:getLayerGroup._layerWeight;

            var newGeoJson = L.geoJson(layer_temp, {
                    onEachFeature: onFeatureUpdate,
                    style: {
                            color:color,
                            fillColor:fillcolor,
                            opacity: opacity,
                            fillOpacity: fillOpacity,
                            fill: fill,
                            stroke: stroke,
                            dashArray: dashArray,
                            weight:weight,
                        }
                });

            window[layer_name].addLayer(newGeoJson).addTo(map);

            /* Sortable Order */
            var layersOrder = $("#sortable").sortable("toArray");
            change_layer_order(layersOrder);
            /* /Sortable Order */
        }

        /* /Update Properties of current layer */
    }
});

function change_info_window_list(actives, is_selected){
    $('#attr_table').empty();
    var sel_attrs = $('.list-right ul li');
    var sel_layer = $('#layers_info_window').val();

    for(var i=0; i<actives.length; i++)
    {
        var attr_value = actives[i].innerHTML;
        /* Update property array */
        if(attr_value != ''){
            var propertyArr = getPropertieyArr(attr_value);

            if(propertyArr != null){
                propertyArr.visibility = false;
            }
        }
        /* /Update property array */
    }

    for(var i=0; i<sel_attrs.length; i++)
    {
        var attr_value = sel_attrs[i].innerHTML;
        /* Update property array */
        if(attr_value != ''){
            var propertyArr = getPropertieyArr(attr_value);

            if(propertyArr != null){
                propertyArr.visibility = true;
            }
        }

        var column_value = (propertyArr.given_name != '')?propertyArr.given_name : ''
        /* /Update property array */

        $('#attr_table').append("<tr><td class='old_property'>"+attr_value+"</td><td class='tdp'><input name='new_property[]' value='"+column_value+"' type='text' class='form-control input-md'></td></tr>");
    }
}
/* [END] - Info Window */


/*[START] - Chart */

/* Step Wizard*/
$(document).ready(function () {
    var navListItems = $('div.setup-panel div a'),
          allWells = $('.setup-content'),
          allNextBtn = $('.nextBtn');

    allWells.hide();

    navListItems.click(function (e) {
      e.preventDefault();
        var $target = $($(this).attr('href')), $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(function(){
        var curStep = $(this).closest(".setup-content"),
        curStepBtn = curStep.attr("id"),
        nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
        curInputs = curStep.find("input[type='text'],input[type='url'], select"),
        isValid = true;

        $(".form-group").removeClass("has-error");
        for(var i=0; i<curInputs.length; i++){
            if (!curInputs[i].validity.valid){
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }

        if (isValid)
          nextStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a.btn-primary').trigger('click');
});
/* /Step Wizard*/


$('#layers_chart').change(function(){
    var $this = $(this).val();
    if($this != ''){
        add_column_ToSelectInput($this);
    }

    var first_column=$('#chart_x_axis').val();
    if(first_column != ''){
        if($this != '' && first_column !=''){
        var options = add_othersColumnList($this, first_column);
        $('#chart_y_axis').html(options);
        }
    }
});

$('#chart_x_axis').change(function(){
    var groupID = $('#layers_chart').val();
    var column = $(this).val();
    if(groupID != '' && column !=''){
        var options = add_othersColumnList(groupID, column);
        $('#chart_y_axis').html(options);
    }
});

if($('#chart_color').length){

    $('#chart_color').colpick({
        layout:'rgbhex',
        color: '#b800e6',
        onSubmit:function(hsb,hex,rgb,el,bySetColor) {
            var hex_color = '#'+hex;
            $('#chart_color_hidden').val(hex_color);
            $(el).css('background-color', hex_color);
            $(el).colpickHide();
        }
    });
}

$('#chart_button, #chart_refresh').click(function(){
    chart_values('#chart_map');
});

$('#chart_display_button').click(function(){
    $("#chart_display").toggle('slide', { direction: 'right'}, 500);
    chart_values('#chart_display_map');
});

$('#chart_display_close').click(function(){
    $("#chart_display").toggle('slide', { direction: 'right'}, 500);
});

$("#chart_display").draggable({
   handle: ".chart_display_head"
});

/*[END] - Chart */

/* [START] - Filter */
$('#filter_layers').change(function(){
    $('#filter_error').html('');
    var $this = $(this).val();
    if($this != ''){
        add_column_ToSelectInput($this);
    }
});

$('#filter_columns').change(function(){
    $('#filter_error').html('');
    var column = $(this).val();
    var groupName = $('#filter_layers').val();
    $('#filter_table').empty('');

    if(column != '' && groupName != ''){
        $('#filter_table').append('<tr style="color:black"><th>properties</th><th>Filter Property</th></tr>');
        layer_filter_list(groupName, column);
    }
});

$(document).on('click','#layerFilterButton',function(){
    filterValueChecked = [];
    var layerName = $('#filter_layers').val();
    var column = $('#filter_columns').val();
    var filter_status = true;

    if(layerName == ''){
        $('#filter_error').html('Please select layer');
        filter_status = false;
    }

    if(column == ''){
        $('#filter_error').html('Please select column');
        filter_status = false;
    }

    if(filter_status != false){
        $("input[name='filter_value[]']:checked").each(function(){
            var $this = $(this).val();
            filterValueChecked.push($this);
        });

        filter(layerName, column);
    }
});
/* [END] - Filter */

/* [START] - Labelling  */
$(document).on('click','#label_add',function(){
     var property = $("input[name='label_property']:checked");
     var groupID = $('#labelling_layers').val();
    if(property.length > 0){
        if(property.val() !== ''){
            labelling(groupID, property.val());
        }
    }
});

$(document).on('click','#label_remove',function(){
    var layerGroupSelected = $('#labelling_layers').val();
    if(layerGroupSelected != ''){
        $(".label_values").prop( "checked", false );
        var layerGroup = window[layerGroupSelected];
        layerGroup.eachLayer(function(layer){
            var layers = layer._layers;
            var layers_id = layer._leaflet_id;
            if(layers == null){
                layerGroup.removeLayer(layers_id);
            }
        });
    }else{
        $('#labelling_error').html("Please select layer");
    }
});

$('#labelling_layers').change(function(){
    $('#labelling_error').html('');
    var $this = $(this).val();
    $('#label_table').empty();

    if($this != ''){
        add_column_ToSelectInput($this);
    }
});
/* [END] - Labelling */

});


//////////// JavaScrip ///////////////////

var map;
var layersGroups = [];
var layersFeatureGroup = [];
var gid = null; // Group Map
var defaultLayer;
var geojsonMap;
var marker;
var drawnItems;
var drawnLayerName;
var measureItems;
var drawControl;
var polygonDrawer;
var polylineDrawer;
var draw_popup = false;
var measureLayerID = [];
var measureLayers = [];
var getGeoJsonData
var LastSavedDrawLayerId = null;
var drawLayersId = [];
var addLayerBySearching = [];
var baseLayer;
var property_add_fields = [];
var properties_arr = [];
var layerCount = 0;
var map_title = 'Untitled Map';
var bubble_default_geojson;
var randomColorArray = [];
var layerGroupList = [];
var layerGroupStyle = [];
var popup_enable = true;
var propertyUpdate = [];
var filterValues = [];
var filterValueChecked = [];
var overlay;
var graphicScale;
var sheet_grid;
var sheet_grid_status = 1;
var temp_sheet_grid_status = 0;

var map_print;
var mapPrintLayers;
var tileLayer_print;

var projectLayerId;
var projectLayerName;


function init(layer_status, mapID, layerfile_type, filename, map_type, layerName){

    map = new L.Map('map', {center: new L.LatLng(0, 0), zoom: 2, minZoom: 2, maxZoom: 20});
    defaultLayer = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);

    graphicScale = L.control.graphicScale({doubleLine: true, fill: 'hollow'}).addTo(map);

    var current_center = map.getCenter();
    var current_zoom =  map.getZoom();
    var lat = current_center.lat;
    var lng = current_center.lng

/* For printout */
    if($('#map_print').length){
        map_print = new L.Map('map_print', {center: new L.LatLng(lat, lng), zoom: current_zoom, zoomControl: false});
        tileLayer_print = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map_print);
        mapPrintLayers = L.layerGroup();
    }
    /* /For printout */

    /* Layer Load */
    if(layer_status == 1){

        if(map_type == 'map'){
//            layer_to_map(mapID, gid, layerfile_type, filename, true, layerName, 1);
            layer_to_map_new(mapID, gid, layerfile_type, filename, true, layerName, 1);
        }

        if(map_type == 'layer'){ // GeoJson Data
            geojsons_to_map(mapID, gid, true, layerName);
        }
    }
    /* /Layer Load */

    /* Draw control*/
    draw_control();
    /* /Draw control*/
}

/*[START] - Swipe Control */
function clip() {
    var nw = map.containerPointToLayerPoint([0, 0]),
    se = map.containerPointToLayerPoint(map.getSize()),
    clipX = nw.x + (se.x - nw.x) * range.value;
    overlay.getContainer().style.clip = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)';
}

function swipeControl(){
    overlay = L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    var range = document.getElementById('range');
    range['oninput' in range ? 'oninput' : 'onchange'] = clip;
    map.on('move', clip);
    clip();
}

function swipeControlOut(){
    map.removeLayer(overlay)
}
/*[END] - Swipe Control */


function changeBaseLayer(baseLayer_type){
    map.removeLayer(defaultLayer);

    if(baseLayer){
        map.removeLayer(baseLayer);
    }

    if(baseLayer_type == 'osm'){
        baseLayer = L.tileLayer.provider('OpenStreetMap.Mapnik');
    }else if(baseLayer_type == 'googleSatellite'){
        baseLayer = L.gridLayer.googleMutant({type:'satellite'});
    }else if(baseLayer_type == 'googleTerrain'){
        baseLayer = L.gridLayer.googleMutant({type:'terrain'});
    }else if(baseLayer_type == 'googleTerrain'){
        baseLayer = L.gridLayer.googleMutant({type:'terrain'});
    }else if(baseLayer_type == 'googleHybrid'){
        baseLayer = L.gridLayer.googleMutant({type:'hybrid'});
    }else if(baseLayer_type == 'osm_german_style'){
        baseLayer = L.tileLayer.provider('OpenStreetMap.DE');
    }else if(baseLayer_type == 'osm_BlackAndWhite'){
        baseLayer = L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
    }else if(baseLayer_type == 'osm_hot'){
        baseLayer = L.tileLayer.provider('OpenStreetMap.HOT');
    }else if(baseLayer_type == 'Thunderforest_OpenCycleMap'){
        baseLayer = L.tileLayer.provider('Thunderforest.OpenCycleMap');
    }else if(baseLayer_type == 'Thunderforest_Transport'){
        baseLayer = L.tileLayer.provider('Thunderforest.Transport');
    }else if(baseLayer_type == 'Thunderforest_Landscape'){
       baseLayer = L.tileLayer.provider('Thunderforest.Landscape');
    }else if(baseLayer_type == 'Hydda_full'){
        baseLayer = L.tileLayer.provider('Hydda.Full');
    }else if(baseLayer_type == 'Stamen_toner'){
        baseLayer = L.tileLayer.provider('Stamen.Toner');
    }else if(baseLayer_type == 'Stamen_terrain'){
       baseLayer = L.tileLayer.provider('Stamen.Terrain');
    }else if(baseLayer_type == 'Stamen_watercolor'){
        baseLayer = L.tileLayer.provider('Stamen.Watercolor');
    }else if(baseLayer_type == 'Esri_worldStreetMap'){
        baseLayer = L.tileLayer.provider('Esri.WorldStreetMap');
    }else if(baseLayer_type == 'Esri_DeLorme'){
       baseLayer = L.tileLayer.provider('Esri.DeLorme');
    }else if(baseLayer_type == 'Esri_WorldTopoMap'){
        baseLayer = L.tileLayer.provider('Esri.WorldTopoMap');
    }else if(baseLayer_type == 'Esri_worldImagery'){
        baseLayer = L.tileLayer.provider('Esri.WorldImagery');
    }else if(baseLayer_type == 'Esri_WorldTerrain'){
        baseLayer = L.tileLayer.provider('Esri.WorldTerrain');
    }else if(baseLayer_type == 'Esri_WorldShadedRelief'){
        baseLayer = L.tileLayer.provider('Esri.WorldShadedRelief');
    }else if(baseLayer_type == 'Esri_WorldPhysical'){
        baseLayer = L.tileLayer.provider('Esri.WorldPhysical');
    }else if(baseLayer_type == 'Esri_OceanBasemap'){
        baseLayer = L.tileLayer.provider('Esri.OceanBasemap');
    }else if(baseLayer_type == 'Esri_NatGeoWorldMap'){
        baseLayer = L.tileLayer.provider('Esri.NatGeoWorldMap');
    }else if(baseLayer_type == 'Esri_WorldGrayCanvas'){
        baseLayer = L.tileLayer.provider('Esri.WorldGrayCanvas');
    }else if(baseLayer_type == 'GeoportailFrance'){
        baseLayer = L.tileLayer.provider('GeoportailFrance');
    }else if(baseLayer_type == 'GeoportailFrance_orthos'){
        baseLayer = L.tileLayer.provider('GeoportailFrance.orthos');
    }else if(baseLayer_type == 'GeoportailFrance_ignMaps'){
        baseLayer = L.tileLayer.provider('GeoportailFrance.ignMaps');
    }else if(baseLayer_type == 'bing_map'){
        var BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
        baseLayer = L.tileLayer.bing(BING_KEY);
    }else if(baseLayer_type == 'mapbox'){
        baseLayer = L.mapboxGL({
                    accessToken: 'no-token',
                    style: 'http://127.0.0.1:8000/static/css/bright-v9-cdn.json'
                    });
    }else{
        baseLayer = defaultLayer;
    }

    baseLayer.addTo(map);
}

/*[START] - Load from SHP or KML data to Map */
function layer_to_map(layer_id, group_id, layer_type, layer_file, fitBound, layer_name, layer_status){

       if(layer_id != '' || layer_type != ''){

            if(layer_type == 'SHP'){
                preloader_in();

                var getGeojson = $.ajax({
                      url:subdivision+"/map/layer_data/"+layer_id+"/"+group_id+"/",
                      dataType: "json",
                      error: function (xhr) {
                            alert_notification_popup('fail', 3);
                      }
                    })

                var groupId =  'm'+layer_id+'_map';

                $.when(getGeojson).done(function() {
                    var to_json = jQuery.parseJSON(getGeojson.responseText);
                    var geojsonMap = L.geoJSON(to_json);

                    /* Add Layer Group */
                    var layer_group_status = 0;
                    for(g in layersGroups){
                        if(layersGroups[g].group_id == groupId){
                            layer_group_status = 1;
                        }
                    }

                    if(layer_group_status != 1){

                        var layerGroup = {group_id:groupId, geoJson:geojsonMap, group_name:layer_name, fileType:'shp', fileID:'', groupFileId:''};
                        layerGroup_add(layerGroup);
                        var addToSortableList = layer_li_to_sortable(groupId, layer_name, layer_status,1);

                        $('#sortable').prepend(addToSortableList);

                        $('.layerGroup_opacity_slider').slider({
                            slide: function(event, ui ) {
                                        var $this = $(this);
                                        var value = (ui.value/100);
                                        var groupIdSlider = $this.attr('id');
                                        var group_id = groupIdSlider.substring(7);

                                        layerGroup_opacity(group_id, value);
                                }
                        });

                        layer_group_status = 0;
                    }
                    /* / Add Layer Group */

                    preloader_out();

                    if(fitBound === true){
                        //alert_notification_popup('success', 6);
                        map.fitBounds(geojsonMap.getBounds(), {padding: [30, 30]});
                    }
                });
            }

            if(layer_type == 'KML' && layer_file != ''){

                var kml_url = subdivision+"/media/layers/"+layer_id+"/"+layer_file;
                var kmlLoad = new L.KML(kml_url, {async: true});
                var groupId =  'm'+layer_id+'_map';

                    var kml_load = kmlLoad.on("loaded", function(e) {
                        preloader_out();

                        if(fitBound === true){
                            //alert_notification_popup('success', 6);
                            map.fitBounds(e.target.getBounds(), {padding: [30, 30]});
                        }
                    });

                    /* Add Layer Group */
                        var layer_group_status = 0;
                        for(g in layersGroups){
                            if(layersGroups[g].group_id == groupId){
                                layer_group_status = 1;
                            }
                        }

                        if(layer_group_status != 1){

                            var layerGroup = {group_id:groupId, geoJson:kml_load, group_name:layer_name, fileType:'kml', fileID:'', groupFileId:''};
                            layerGroup_add(layerGroup);
                            var addToSortableList = layer_li_to_sortable(groupId, layer_name, 1);

                            $('#sortable').prepend(addToSortableList);

                            $('.layerGroup_opacity_slider').slider({
                                slide: function(event, ui ) {
                                            var $this = $(this);
                                            var value = (ui.value/100);
                                            var groupIdSlider = $this.attr('id');
                                            var group_id = groupIdSlider.substring(7);

                                            layerGroup_opacity(group_id, value);
                                    }
                            });

                            layer_group_status = 0;
                        }
                        /* / Add Layer Group */
            }
       }else{
            alert_notification_popup('fail', 8);
       }
}
/*[END] - Load from SHP or KML data to Map */


/*[START] - Load from SHP or KML data to Map - NEW*/
function layer_to_map_new(layer_id, group_id, layer_type, layer_file, fitBound, layer_name, layer_status){

       if(layer_id != '' || layer_type != ''){

            if(layer_type == 'SHP'){
                preloader_in();

                var getGeojson = $.ajax({
                      url:subdivision+"/map/layer_data/"+layer_id+"/"+group_id+"/",
                      dataType: "json",
                      error: function (xhr) {
                            alert_notification_popup('fail', 3);
                      }
                    })

                var groupId =  'm'+layer_id+'_map';

                $.when(getGeojson).done(function() {
                    var response = jQuery.parseJSON(getGeojson.responseText);
                    if(response['status'] == 1){
                        //   deleteData(layer_id, 'map');
                          geojsonToMap(layer_id, group_id, true, layer_name, response['geojson_file'], response['file_path'], layer_type);
                    }else{
                        alert_notification_popup('fail', 3);

                        deleteData(layer_id, 'map');
                    }

                });
            }

            if(layer_type == 'KML' && layer_file != ''){

                var kml_url = subdivision+"/media/layers/"+layer_id+"/"+layer_file;
                var kmlLoad = new L.KML(kml_url, {async: true});
                var groupId =  'm'+layer_id+'_map';

                    var kml_load = kmlLoad.on("loaded", function(e) {
                        preloader_out();

                        if(fitBound === true){
                            //alert_notification_popup('success', 6);
                            map.fitBounds(e.target.getBounds(), {padding: [30, 30]});
                        }


                       //Modal
                        if($('#modal-container-87694').length){
                            //Progress bar
                            $("#progess_bar_text").html("Loaded...");
                            $("#progess_bar_text").fadeIn();
                            var strProgress =100 + "%";
                            $(".progress-bar").css({"width": strProgress});
                            $(".progress-bar").text(strProgress);
                            $(".progress-bar-success").css({"background-color": "#3399ff"});

                            setTimeout(function() {
                                $("#modal-container-87694").delay(2000).modal("hide");
                            }, 2000);

                        }

                    });

                    /* Add Layer Group */
                        var layer_group_status = 0;
                        for(g in layersGroups){
                            if(layersGroups[g].group_id == groupId){
                                layer_group_status = 1;
                            }
                        }

                        if(layer_group_status != 1){

                            var layerGroup = {group_id:groupId, geoJson:kml_load, group_name:layer_name, fileType:'kml', fileID:'', groupFileId:''};
                            layerGroup_add(layerGroup);
                            var addToSortableList = layer_li_to_sortable(groupId, layer_name, 1);

                            $('#sortable').prepend(addToSortableList);

                            $('.layerGroup_opacity_slider').slider({
                                slide: function(event, ui ) {
                                            var $this = $(this);
                                            var value = (ui.value/100);
                                            var groupIdSlider = $this.attr('id');
                                            var group_id = groupIdSlider.substring(7);

                                            layerGroup_opacity(group_id, value);
                                    }
                            });

                            layer_group_status = 0;
                        }
                        /* / Add Layer Group */
            }

            if(layer_type == 'JSON' && layer_file != ''){
                var file_path = "media/layers/"+layer_id+"/"
                geojsonToMap(layer_id, group_id, true, layer_name, layer_file, file_path, layer_type);
            }

       }else{
            alert_notification_popup('fail', 8);
       }
}

/*[END] - Load from SHP or KML data to Map - NEW*/


function onEachFeature(feature, layer) {
    if (feature.properties) {
            var properties = feature.properties;

            (function($) {

                if(Object.keys(properties).length > 0){
                    var table = '<table class="table table-bordered table-striped"><tbody>';
                    $.each(properties, function(column, value){
                          if(column != '_layerColor' && column != '_layerFillColor' && column != '_layerOpacity' && column != '_layerFillOpacity' && column != '_layerWeight' && column != '_layerDashArray' && column != '_layerFill' && column != '_layerStroke' && column != '_infoWindoVisibility'){
                                table += '<tr><td>'+column+'</td><td>'+value+'</td></tr>';
                          }
                    });

                    table += '</tbody></table>';
                    layer.bindPopup(table, {
                                  maxHeight: "auto",
                                  maxWidth: "auto"
                                }).on('click', onClickPopup);
                 }
            })(jQuery);
    }
}

function onFeatureUpdate(feature, layer) {
    if (feature.properties) {
            var properties = feature.properties;
            var infoWindoArr = properties._infoWindoVisibility = properties._infoWindoVisibility || {};

            (function($) {

                if(Object.keys(properties).length > 0){
                    var table = '<table class="table table-bordered table-striped"><tbody>', table_tr = '';

                    $.each(properties, function(column, value){
                            var columns = getPropertieyArr(column);

                            if(columns != null){
                                if(column == columns.column_name && columns.visibility != false && column != '_layerColor' && column != '_layerFillColor' && column != '_layerOpacity' && column != '_layerFillOpacity' && column != '_layerWeight' && column != '_layerDashArray' && column != '_layerFill' && column != '_layerStroke' && column != '_layerRadius' && column != '_infoWindoVisibility'){
                                    var newColumn = (columns.given_name != '')? columns.given_name : columns.column_name;
                                    table_tr += '<tr><td>'+newColumn+'</td><td>'+value+'</td></tr>';
                                    infoWindoArr[column] = {status : true, Change : newColumn};
                                }else{
                                    infoWindoArr[column] = {status : false, Change : ''};
                                }
                            }
                    });

                    if(table_tr != ''){
                        table += table_tr+'</tbody></table>';

                        layer.bindPopup(table, {
                              maxHeight: "auto",
                              maxWidth: "auto"
                            }).on('click', onClickPopup);
                    }

                 }
            })(jQuery);
    }
}


/* [START] - Load geojson file to Map*/
function geojsons_to_map(layer_id, group_id, fitBound, layer_name){

    preloader_in();
    var groupID = 0

    if(group_id !='' && group_id != null){
        groupID = group_id;
    }

    var get_data = $.ajax({
                  url:subdivision+"/map/layersdata/"+layer_id+"/"+groupID+"/",
                  type:'GET',
                  dataType: "json",
                  success: alert_notification_popup('success', 11),
                  error: function (xhr) {
                    alert_notification_popup('fail', 7);
                  }
                });

    $.when(get_data).done(function(){
        var response = jQuery.parseJSON(get_data.responseText);

        if(response['status'] == 1){

            var filesData = response['rows'];
            var filesCount = filesData.length;
            var promises = [];

            if(LastSavedDrawLayerId != ''){
                SetDrawLayerId(response['map_id']);
            }

            for(f=0; f<filesCount; f++){

                var filename = filesData[f].layerFile;
                var changeStr = filename.replace(".json", "");
                var rechangeStr = changeStr.replace(".", "_");
                var group_Id = rechangeStr;

                var layer_name = filesData[f].layerName;
                var fileID = filesData[f].fileId;
                var layerStatus = filesData[f].layerStatus;

                var file_url = subdivision+"/media/draw_layers/"+filename;

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
                    var geojsonFileMap = L.geoJson(promises[i].getJson,{onEachFeature: onEachFeature});
                    var layerGroup = {group_id:promises[i].group_id, geoJson:geojsonFileMap, group_name:promises[i].group_name, fileType:'geojson', fileID:promises[i].fileID, layer_status:promises[i].layer_status};

                    layerGroup_add(layerGroup);

                    var addToSortableList = layer_li_to_sortable(promises[i].group_id, promises[i].group_name, promises[i].layer_status, promises[i].fileID);
                    $('#sortable').prepend(addToSortableList);

                    $('.layerGroup_opacity_slider').slider({
                            slide: function(event, ui ) {
                                        var $this = $(this);
                                        var value = (ui.value/100);
                                        var groupIdSlider = $this.attr('id');
                                        var group_id = groupIdSlider.substring(7);

                                        layerGroup_opacity(group_id, value);
                                }
                        });

                    if(fitBound === true){
                        //alert_notification_popup('success', 6);
                        map.fitBounds(geojsonFileMap.getBounds(),{padding: [30, 30]});
                    }
                }
            });
        }
    });
    preloader_out();
}

function geojson_to_map(fileID, group_id, fitBound, layer_name, filename){

    preloader_in();

    var file_url = subdivision+"/media/draw_layers/"+filename;

    var changeStr = filename.replace(".json", "");
    var rechangeStr = changeStr.replace(".", "_");
    var groupId = rechangeStr+'_oneLayer';

        $.getJSON(file_url,function(geojsonData){
            var geojsonFileMap = L.geoJson(geojsonData,{onEachFeature: onEachFeature});

            /* Add Layer Group */
                        var layer_group_status = 0;
                        for(g in layersGroups){
                            if(layersGroups[g].group_id == groupId){
                                layer_group_status = 1;
                            }
                        }

                        if(layer_group_status != 1){

                            var layerGroup = {group_id:groupId, geoJson:geojsonFileMap, group_name:layer_name, fileType:'geojson', fileID:fileID, layer_status:1};
                            layerGroup_add(layerGroup);

                            var addToSortableList = layer_li_to_sortable(groupId, layer_name, 1);

                            $('#sortable').prepend(addToSortableList);

                            $('.layerGroup_opacity_slider').slider({
                                slide: function(event, ui ) {
                                            var $this = $(this);
                                            var value = (ui.value/100);
                                            var groupIdSlider = $this.attr('id');
                                            var group_id = groupIdSlider.substring(7);

                                            layerGroup_opacity(group_id, value);
                                    }
                            });

                            layer_group_status = 0;
                        }
                        /* / Add Layer Group */

            preloader_out();

            if(fitBound === true){
                //alert_notification_popup('success', 6);
                map.fitBounds(geojsonFileMap.getBounds(),{padding: [30, 30]});
            }
        });
}
/* [END]- Load geojson file to Map*/


/* [START]- Load geojson file to Map & Remove - New*/
function geojsonToMap(layerID, group_id, fitBound, layer_name, filename, fileDir, layer_type){
    var file_url = subdivision+"/"+fileDir+filename;

    var groupId =  'm'+layerID+'_map';

    var geoJsonData = $.ajax({
                            url: file_url,
                            dataType: "json",
                            success: console.log("County data successfully loaded."),
                            error: function(xhr) {
                                alert(xhr.statusText)
                            }
                        });

    $.when(geoJsonData).done(function() {

        var geoData = geoJsonData.responseJSON;
        var geojsonFileMap = L.geoJson(geoData,{onEachFeature: onEachFeature});

        /* Add Layer Group */
        var layer_group_status = 0;
        for(g in layersGroups){
            if(layersGroups[g].group_id == groupId){
                layer_group_status = 1;
            }
        }

        if(layer_group_status != 1){

            var layerGroup = {group_id:groupId, geoJson:geojsonFileMap, group_name:layer_name, fileType:'geojson', fileID:'', layer_status:1};
            layerGroup_add(layerGroup);

            var addToSortableList = layer_li_to_sortable(groupId, layer_name, 1);

            $('#sortable').prepend(addToSortableList);

            $('.layerGroup_opacity_slider').slider({
                slide: function(event, ui ) {
                            var $this = $(this);
                            var value = (ui.value/100);
                            var groupIdSlider = $this.attr('id');
                            var group_id = groupIdSlider.substring(7);

                            layerGroup_opacity(groupId, value);
                    }
            });

            layer_group_status = 0;
        }
        /* / Add Layer Group */

        preloader_out();

        if(fitBound === true){
            //alert_notification_popup('success', 6);
            map.fitBounds(geojsonFileMap.getBounds(),{padding: [30, 30]});

            /*Remove Geojson file */
            if(layer_type == 'SHP'){
                remove_geojsonFile(fileDir, filename);
            }

        }


        //Modal
        if($('#modal-container-87694').length){
            //Progress bar
            $("#progess_bar_text").html("Loaded...");
            $("#progess_bar_text").fadeIn();
            var strProgress =100 + "%";
            $(".progress-bar").css({"width": strProgress});
            $(".progress-bar").text(strProgress);
            $(".progress-bar-success").css({"background-color": "#3399ff"});

            setTimeout(function() {
                $("#modal-container-87694").delay(2000).modal("hide");
            }, 2000);

        }




    });

}

function remove_geojsonFile(fileDir, filename){

        setTimeout(function() {
            var data = {'fileDir':fileDir, 'filename':filename}
            $.ajax({
                  url: subdivision+"/map/remove_file/",
                  data: data,
                  type: 'POST',
                  dataType: 'json',
                  success: function(data){
                        //
                    }
                });

        }, 120000);

}
/* [END]- Load geojson file to Map & Remove  - New*/

/* [START]- Add layer to sortable panel*/
function layer_li_to_sortable(groupId, layer_name, layer_status, fileId){

    var sub_layer_name = layer_name.substring(0,25);
    var layerChecked = (layer_status == 1)? 'checked':'';

    var addToSortableList = '<li style="width:210px;height:auto;min-height:50px; position: relative;" class="ui-state-default" data-fileid="'+fileId+'" id="'+groupId+'">'
                            +'<span id="'+groupId+'_layerName" style="height:auto;width:70px;word-wrap:break-word; font-size: 10px;"><small>'+sub_layer_name+' </small></span>'
                            +'<span style="margin-left:40%;width:38%;margin-top:0px;">'
                                +'<i class="glyphicon glyphicon-sound-stereo layerGroup_opacity_button" id="slide" style="cursor:pointer;"> </i>'
                                +'<span class="layerGroup_opacity_slider" id="slider_'+groupId+'" style="position:absolute;top:25px;left:5px;width:80%; z-index:1000000000; display:none;"></span>'
                            +'</span>'
                            +'<span style="margin-left:48%;margin-top:-12px;">'
                                +'<div class="checkbox">'
                                    +'<input class="layerGroup_checkbox" id="checkbox_'+groupId+'" type="checkbox" '+layerChecked+' />'
                                    +'<span class="toggle"></span>'
                                +'</div>'
                                +'<span style="margin-left:99%;margin-top:12px;" class="glyphicon glyphicon-remove-circle layergroup_order_remove"></span>'
                            +'</span>'
                       +'</li>';

    return addToSortableList;
}
/* [END]- Add layer to sortable panel*/

/* [START] - Layer opacity in style panel */
function layerGroup_opacity(groupId, value){

    var getLayer = window[groupId].toGeoJSON();
    var layer_temp = getLayer;

    window[groupId].clearLayers();

    var getGroupStyle = getLayerGroupArr(groupId);
    var color = '', fillcolor = '', fill = true, stroke = true, dashArray = [];

    if(getGroupStyle != null){
        color = getGroupStyle._layerColor;
        fillcolor = getGroupStyle._layerFillColor;
        fill = getGroupStyle._layerFill;
        stroke = getGroupStyle._layerStroke;
    }

    var updateLayer = L.geoJson(layer_temp, {
                        onEachFeature: onEachFeature,
                        style: {
                            color:color,
                            fillColor:fillcolor,
                            opacity: value,
                            fillOpacity: value,
                            fill: fill,
                            stroke: stroke,
                            dashArray: dashArray,
                        }
                    });
    window[groupId].addLayer(updateLayer).addTo(map);

    /* store style of layer group */
    getGroupStyle.opacity = value;
    getGroupStyle.fillOpacity = value;
    /* store style of layer group */
}
/* [END] - Layer opacity in style panel */

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
                    onEachFeature: onEachFeature,
                    pointToLayer: function(feature, latlng) {
                        var geometry = feature.geometry;
                        var properties = feature.properties;
                         var table, popup, propertiesArr = {};
                         var popup_status = 0;

                        (function($) {
                            if(Object.keys(properties).length > 0){
                                table = '<table class="table table-bordered table-striped"><tbody>';
                                $.each(properties, function(column, value){
                                      if(column != '_layerColor' && column != '_layerFillColor' && column != '_layerOpacity' && column != '_layerFillOpacity' && column != '_layerWeight' && column != '_layerDashArray' && column != '_layerFill' && column != '_layerStroke' && column != '_layerRadius' && column != '_infoWindoVisibility'){
                                            table += '<tr><td>'+column+'</td><td>'+value+'</td></tr>';
                                            popup_status = 1;
                                      }

                                      propertiesArr[column] = value;
                                });

                                table += '</tbody></table>';
                             }
                        })(jQuery);

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

    create_layers_list_to_legend(layer_group, layer_name, get_fillColor);

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

    /* Add layer group to list */
    var layerGroup_selectInput = '<option></option>';
    for (r in layersGroups){
        var layerGroupID = layersGroups[r].group_id;
        var layerGroup_status = layersGroups[r].layer_status;
        var bubbleLayer = layerGroupID.substr(layerGroupID.length - 10);

        if(bubbleLayer != '_Lybubble_' && layerGroup_status !=0){
            layerGroup_selectInput +='<option value="'+layerGroupID+'">'+layersGroups[r].group_name+'</option>';
        }
    }
    $('#layer_group_options').html(layerGroup_selectInput);
    $('#sp_layerGroup_source').html(layerGroup_selectInput);
    $('#layers_info_window').html(layerGroup_selectInput);
    $('#filter_layers').html(layerGroup_selectInput);
    $('#labelling_layers').html(layerGroup_selectInput);
    $('#layers_chart').html(layerGroup_selectInput);
    /* /Add layer group to list */
}
/* [END] - Add Layer to Map */

/* [START] Remove Layer group */
function layerGroup_remove(groupID){

    var LayerGroupsCount = layersGroups.length;
    if(LayerGroupsCount > 0){
        for(i=0; i<LayerGroupsCount; i++){
            if (layersGroups[i].group_id == groupID) {
                delete layersGroups[i];

                /* Remove row from legend */
                $('#legend_'+groupID).remove();
            }
        }
    }

    layersGroups = layersGroups.filter(function(x){
                        return (x !== (undefined || null || ''));
                    });

    /* Remove from search array*/
    if(addLayerBySearching.length > 0){
        for(i=0; i<addLayerBySearching.length; i++){
            if (addLayerBySearching[i][2] == groupID) {
                delete addLayerBySearching[i];
            }
        }

    addLayerBySearching = addLayerBySearching.filter(function(x){
                    return (x !== (undefined || null || ''));
                });
    }

    window[groupID].clearLayers();

    /* Update layer group list */
        var layerGroup_selectInput = '<option></option>';
        for (r in layersGroups){

            var layerGroupID = layersGroups[r].group_id;
            var layerGroup_status = layersGroups[r].layer_status;
            var bubbleLayer = layerGroupID.substr(layerGroupID.length - 10);

            if(bubbleLayer != '_Lybubble_' && layerGroup_status != 0){
                layerGroup_selectInput +='<option value="'+layerGroupID+'">'+layersGroups[r].group_name+'</option>';
            }
        }
        $('#layer_group_options').html(layerGroup_selectInput);
        $('#sp_layerGroup_source').html(layerGroup_selectInput);
        $('#layers_info_window').html(layerGroup_selectInput);
        $('#filter_layers').html(layerGroup_selectInput);
        $('#labelling_layers').html(layerGroup_selectInput);
        $('#layers_chart').html(layerGroup_selectInput);
    /* /Update layer group list */
}
/* [END] Remove Layer group */

/* [START] - Hide Layer Group */
function hide_layergroup(groupID, status){
    var getLayer = getLayerGroupArr(groupID);
    if(status == 1){

        if(getLayer != null){
            getLayer.layer_status = 0;
        }

        map.removeLayer(window[groupID]);
    }else{
        if(getLayer != null){
            getLayer.layer_status = 1;
        }
        var layersOrder = $("#sortable").sortable("toArray");
        change_layer_order(layersOrder);
    }

    /* Add layer group to list */
    var current_layerGroup = $('#layer_group_options').val();
    var current_layerGroup_name = $('#layer_group_options option:selected').text();

    var layerGroup_selectInput = '<option></option>';
    var layerGroup_selectInput_just = '<option></option>';
    for (r in layersGroups){
        var layerGroupID = layersGroups[r].group_id;
        var layerGroup_status = layersGroups[r].layer_status;
        var bubbleLayer = layerGroupID.substr(layerGroupID.length - 10);

        if(current_layerGroup != ''){
        }

        if(bubbleLayer != '_Lybubble_' && layerGroup_status !=0){
            layerGroup_selectInput +='<option value="'+layerGroupID+'">'+layersGroups[r].group_name+'</option>';
            layerGroup_selectInput_just +='<option value="'+layerGroupID+'">'+layersGroups[r].group_name+'</option>';

        }else if(bubbleLayer != '_Lybubble_' && layerGroupID ==current_layerGroup && layerGroup_status ==0){
            layerGroup_selectInput_just +='<option value="'+layerGroupID+'" selected>'+layersGroups[r].group_name+'</option>';
        }
    }
    $('#layer_group_options').html(layerGroup_selectInput_just);
    $('#sp_layerGroup_source').html(layerGroup_selectInput);
    $('#layers_info_window').html(layerGroup_selectInput);
    $('#filter_layers').html(layerGroup_selectInput);
    $('#labelling_layers').html(layerGroup_selectInput);
    $('#layers_chart').html(layerGroup_selectInput);
    /* /Add layer group to list */
}
/* [END] - Hide Layer Group */

/* [START] - Get LayerGroup detail from array */
function getLayerGroupArr(groupId){
    var LayerGroupsCount = layersGroups.length;
    if(LayerGroupsCount > 0){
        for(i=0; i<LayerGroupsCount; i++){
            if (layersGroups[i].group_id == groupId) {
                return layersGroups[i];
            }
        }
    }
}
/* [END] - Get LayerGroup detail from array */

/* [START] - Get property of current layer from array */
function getPropertieyArr(column_name){
    var propertiesCount = propertyUpdate.length;
    if(propertiesCount > 0){
        for(i=0; i<propertiesCount; i++){
            if (propertyUpdate[i].column_name == column_name) {
                return propertyUpdate[i];
            }
        }
    }
}
/* [END] - Get property of current layer from array */

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

/* [START] - Change Layers Order */
function change_layer_order(groupOrder){
    var count = groupOrder.length;
    if(count > 0){
        for(l=count-1; l>=0; l--){
            var groupID_visibility = $('#checkbox_'+groupOrder[l]);
            if (groupID_visibility.is(':checked')){
                map.removeLayer(window[groupOrder[l]]);
                map.addLayer(window[groupOrder[l]]);
            }
        }
    }
}
/* [END] - Change Layers Order */

/* [START] - Update Style of layer group to style for view */
function update_to_style_panel(groupId){

    var getGroupStyle = getLayerGroupArr(groupId);
    if(getGroupStyle != null){

        var layer_name = getGroupStyle.group_name;
        var color = getGroupStyle._layerColor;
        var fillcolor = getGroupStyle._layerFillColor;
        var opacity = getGroupStyle._layerOpacity;
        var fillOpacity = getGroupStyle._layerFillOpacity;
        var weight = getGroupStyle._layerWeight;
        var fillOpacity_text = Math.round(fillOpacity*100);
        var opacity_text = Math.round(opacity*100);
        var weight_slider = Math.round(weight*10);

        var fillcolorPick = fillcolor.substring(1,7);
        var colorPick = color.substring(1,7);

        $('#fill_color').css({'background-color':fillcolor});
        $('#border_color').css({'background-color':color});
        $('#fill_color_fillOpacity_text').html(fillOpacity_text);
        $('#border_color_Opacity_text').html(opacity_text);
        $('#line_weight_text').html(weight);

        $('#fill_color').colpick({
            layout:'rgbhex',
            color: fillcolorPick,
            onSubmit:function(hsb,hex,rgb,el,bySetColor) {
                var hex_color = '#'+hex;
                $(el).css('background-color', hex_color);
                $(el).colpickHide();

                layer_styling('_layerFillColor', hex_color);
                create_layers_list_to_legend(groupId, layer_name, hex_color);
            }
        });

        $('#border_color').colpick({
            layout:'rgbhex',
            color: colorPick,
            onSubmit:function(hsb,hex,rgb,el,bySetColor) {
                var hex_color = '#'+hex;
                $(el).css('background-color', hex_color);
                $(el).colpickHide();
                layer_styling('_layerColor', hex_color);
            }
        });

        jQuery("#border_color_Opacity").slider({
                value: opacity_text
        });

        jQuery("#line_weight").slider({
                value: weight_slider
        });
    }
}
/* [END] - Update Style of layer group to style for view */

/* [START] - Current Location */
function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        alert_notification_popup('fail', 9);
    }
}


function showPosition(position) {
    var lat = position.coords.latitude;
    var lag = position.coords.longitude;
    var currentIcon = L.icon({
            iconUrl: "/static/img/location.png",
            iconSize:     [46, 46],
            iconAnchor:   [23, 46]
        });
    marker  = L.marker([lat,lag], {icon: currentIcon}).addTo(map);
}

function removeLocation(){
    if(marker != null){
        marker.remove();
    }

}
/* [END] - Current Location */

/* [START] - Draw control */
function draw_control(){

        drawnItems = '_drawLayerGroup';
        window[drawnItems] = new L.FeatureGroup();
        map.addLayer(window[drawnItems]);

        drawControl = new L.Control.Draw({
                        draw:{
                                circle: false,
                                circlemarker: false
//                                polygon: { repeatMode: true },
//                                polyline: { repeatMode: true },
//                                rectangle: { repeatMode: true },
//                                marker: { repeatMode: true }
                            },
                        edit: {
                                 featureGroup: window[drawnItems]
                            }
                        });

        map.addControl(drawControl);

        drawControl.setDrawingOptions({
                rectangle: {
                    shapeOptions: {
                        stroke: true,
                        color: '#0086FF',
                        fillColor:'#ffffff',
                        weight: 2,
                        fillOpacity: 0.4,
//                        opacity: 0.5,
                        fill: true,
                    }
                },
                polygon: {
                    shapeOptions: {
                        stroke: true,
                        color: '#0086FF',
                        fillColor:'#ffffff',
                        weight: 2,
                        fillOpacity: 0.4,
//                        opacity: 0.5,
                        fill: true,
                    }
                },
                polyline: {
                    shapeOptions: {
                        stroke: true,
                        color: '#0086FF',
//                        fillColor:'#ffffff',
                        weight: 2,
                        fillOpacity: 0.4,
//                        opacity: 0.5,
//                        fill: true,
                    }
                },
            });

         map.on('draw:drawstart', function (e) {
            draw_popup = false;

            setTimeout(function(){
                if(draw_popup == false){

                    var groupId = drawnItems;
                    var isExistGroup = getLayerGroupArr(groupId);
                    if(isExistGroup == null){
                        $('#modal_container_add_layer_name').modal({backdrop: 'static', keyboard: false});
                        $('#modal_container_add_layer_name').modal('show');
                    }
                }
             }, 1000);
         });

        map.on('draw:drawvertex', function (e) {
                $(".leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.leaflet-zoom-animated.leaflet-interactive")
                .css({
                'background-color': '#ffffff',
                'border-radius': '50%',
                'border': '3px solid #0086FF',
                'width':'15px',
                'height':'15px'
                })

                $(".leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.leaflet-zoom-animated.leaflet-interactive:first")
                .css({
                'background-color': '#ffffff',
                'border-radius': '50%',
                'border': '3px solid #0086FF',
                'width':'15px',
                'height':'15px'
                });
            });

        map.on('draw:editstart', function (e) {
            setTimeout(function(){
                shapes_vertexs_style();
             }, 10);
            });

        map.on('draw:editvertex', function (e) {
                shapes_vertexs_style();
            });

        map.on('draw:deleted', function(e){
                var layers = e.layers;
                var deleted_layers = layers._layers;
                var count = Object.keys(deleted_layers).length;

                /* Remove drawn layer Id from array */
                var countDrawIds = drawLayersId.length;

                if(count > 0 && countDrawIds > 0){
                    for(d=0; d<count; d++){
                        var deletedLayer = Object.keys(deleted_layers);

                        for(i=0; i<countDrawIds; i++){
                            if ( drawLayersId[i] == deletedLayer[d]) {
                                drawLayersId.splice(i, 1);
                            }
                        }
                    }
                }
                /* /Remove drawn layer Id from array */
        });

/* [START] - Measurement - Calculate  */

        // Truncate value based on number of decimals
        var _round = function(num, len) {
            return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
        };

        // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
        var strLatLng = function(latlng) {
            return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
        };

        var getMeasurement = function(layer) {

            // Marker - add lat/long
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                return strLatLng(layer.getLatLng());

            // Circle - lat/long, radius
            } else if (layer instanceof L.Circle) {

                var center = layer.getLatLng(),
                    radius = layer.getRadius();
                return "Center: "+strLatLng(center)+"<br />"
                      +"Radius: "+_round(radius, 2)+" m";

            // Rectangle/Polygon - area
            } else if (layer instanceof L.Polygon) {

                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    area = L.GeometryUtil.geodesicArea(latlngs);
                    area_km2 = area/1000000;
                   return "Area: "+ area_km2.toFixed(2)+" km<sup>2</sup>";

            // Polyline - distance
            } else if (layer instanceof L.Polyline) {

                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    distance = 0;

                if (latlngs.length < 2) {
                    return "Distance: N/A";

                }else{
                    for (var i = 0; i < latlngs.length-1; i++) {
                        distance += latlngs[i].distanceTo(latlngs[i+1]);
                    }
                    distance_km = distance/1000;
                    return "Distance: "+_round(distance_km, 2)+" km";
                }
            }
            return null;
        };

/* [END] - Measurement - Calculate */

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                window[drawnItems].addLayer(layer);

                 var layerID = layer._leaflet_id;

                if (draw_popup === true){

                    shapes_vertexs_style();

                    var measure = getMeasurement(layer);

                    measureLayerID.push(layerID);
                    measureLayers.push(window[drawnItems].getLayer(layerID));

                    if (measure !== null) {

                        var layer_bound = layer._bounds;
                        var northEast = layer_bound._northEast;
                        var southWest = layer_bound._southWest;

                        var boundJson = {'northEast':[northEast.lat, northEast.lng], 'southWest':[southWest.lat, southWest.lng]};
                        var bound_str = encodeURIComponent(JSON.stringify(boundJson));

                        var content= '<div style="padding:10px;"><p>'+measure+'</p>'
                                +'<div style="text-align:center;" class="button_div">'
                                +'<button type="button" class="btn btn-info btn-xs measure_popup_center" data-bound="'+bound_str+'" onclick="fit_bound(this)">Center</button>'
                                +'<span style="padding-left: 10px;"></span>'
                                +'<button type="button" class="btn btn-info btn-xs measure_delete_popup">Delete</button>'
                                +'<input type="hidden" class="measure_popup_id" value="'+layerID+'"/>'
                                +'</div>'
                                +'</div>';

                        var popup = layer.bindPopup(content, {
                                    // closeButton: false,
                                    keepInView: true
                                }).openPopup();
                    }

                }else{

                        var property_content = propertyContent(layerID, type);
                        var popup = layer.bindPopup(property_content, {
                                    maxWidth: "auto",
                                    maxHeight: "auto",
                                    //closeButton: false,
                                    keepInView: true
                                    }).openPopup();

                        drawLayersId.push(layer._leaflet_id);

                        /* Add to Layer group */
                        var groupId = drawnItems;
                        var isExistGroup = getLayerGroupArr(groupId);
                        if(isExistGroup == null){

                            var layer_name = (!drawnLayerName)?'Untitled Drawn':drawnLayerName;
                            var drawnItemsGroup = {group_id:groupId, geoJson:'', group_name:layer_name, fileType:'drawn', _layerColor:'#ffffff', _layerFillColor:'#0086FF', _layerWeight:2, _layerOpacity:1, _layerFillOpacity:0.8, _layerFill:true, _layerStroke:true, _layerDashArray:[]};
                            layersGroups.push(drawnItemsGroup);

                            var addToSortableList = layer_li_to_sortable(groupId, layer_name,1);
                            $('#sortable').prepend(addToSortableList);

                            create_layers_list_to_legend(groupId, layer_name, '#ffffff');
                        }
                        /* /Add to Layer group */

                        /* Add layer group to list */
                        var layerGroup_selectInput = '<option></option>';
                        for (r in layersGroups){
                            var layerGroupID = layersGroups[r].group_id;
                            var layerGroup_status = layersGroups[r].layer_status;
                            var bubbleLayer = layerGroupID.substr(layerGroupID.length - 10);
                            var groupID_visibility = $('#checkbox_'+layerGroupID);

                            if(bubbleLayer != '_Lybubble_' && layerGroup_status != 0){
                                layerGroup_selectInput +='<option value="'+layerGroupID+'">'+layersGroups[r].group_name+'</option>';
                            }
                        }
                        $('#layer_group_options').html(layerGroup_selectInput);
                        $('#sp_layerGroup_source').html(layerGroup_selectInput);
                        $('#layers_info_window').html(layerGroup_selectInput);
                        $('#filter_layers').html(layerGroup_selectInput);
                        $('#labelling_layers').html(layerGroup_selectInput);
                        $('#layers_chart').html(layerGroup_selectInput);
                        /* /Add layer group to list */
                }
            });
}

function draw_editstop(){
    map.on('draw:editstop', function (e){
        console.log("Test2");
    });
}

function measure(input){

    if(input == 'Line'){
        if(polygonDrawer){
            polygonDrawer.disable();
        }

        polylineDrawer = new L.Draw.Polyline(map);
        polylineDrawer.enable();

        draw_popup = true;

    }else if(input == 'Area'){

        if(polylineDrawer){
            polylineDrawer.disable();
        }
        polygonDrawer = new L.Draw.Polygon(map);
        polygonDrawer.enable();
        draw_popup = true;

    }else if(input == 'SetMap'){
        map.setView([0,0], 2);
    }else if(input == 'DeleteAll'){

        var LayerIdCount = measureLayerID.length;
        if(LayerIdCount > 0){
            for(i=0; i<LayerIdCount; i++){
                window[drawnItems].removeLayer(measureLayerID[i]);
            }
        }

        measureLayers = [];
        measureLayerID = [];

    }else{
        if(polylineDrawer){
            polylineDrawer.disable();
        }

        if(polygonDrawer){
            polygonDrawer.disable();
        }
    }
}

function measure_layersId(active){

    var LayerIdCount = measureLayerID.length;
    var LayersCount = measureLayers.length;

    if(active == "remove"){
        if(LayerIdCount > 0){
            for(i=0; i<LayerIdCount; i++){
                window[drawnItems].removeLayer(measureLayerID[i]);
            }
        }
    }

    if(active == "add"){
        if(LayersCount > 0){
            for(a = 0; a<LayersCount; a++){
                window[drawnItems].addLayer(measureLayers[a]);
            }
        }
    }
}

/* [START] When Click on button in popup, Shape will be removed */
$(document).on('click','.measure_delete_popup',function(){
        var $this = $(this);
        var div_section = $this.parent();
        var layer_id = div_section.children(".measure_popup_id").val();
        window[drawnItems].removeLayer(layer_id);

       /* Remove layer from array */
        var LayerIdCount = measureLayerID.length;
        var LayersCount = measureLayers.length;

        for(i=0; i<LayerIdCount; i++){
            if ( measureLayerID[i] == layer_id) {
                measureLayerID.splice(i, 1);
            }
        }

        for(a=0; a<LayersCount; a++){
            var LayerData = measureLayers[a];
            if (LayerData._leaflet_id == layer_id) {
                delete measureLayers[a];
            }
        }

        measureLayers = measureLayers.filter(function(x){
                            return (x !== (undefined || null || ''));
                        });
      /* /Remove layer from array */
});
/* [END] When Click on button in popup, Shape will be removed */

/* [START] Bound of Shape will be center */
function fit_bound(bound) {
    var bound_data = bound.getAttribute("data-bound");
    var bound_json = JSON.parse(decodeURIComponent(bound_data));

    var southWest = new L.LatLng(bound_json.southWest[0], bound_json.southWest[1]);
    var northEast = new L.LatLng(bound_json.northEast[0], bound_json.northEast[1]);
    var bounds = new L.LatLngBounds(southWest, northEast);

	map.fitBounds(bounds, {padding: [30, 30]});
}
/* [END] Bound of Shape will be center */

/* [START] Add Layer Name to layer list*/
function add_layer_name(){
    $('#layer_name_add').css({'background-color': '',});
    var layerName = $('#layer_name_add').val();
    if(layerName != ''){
        drawnLayerName = layerName;
        $('#modal_container_add_layer_name').modal('hide');
    }else{
        $('#layer_name_add').css({'background-color': '#ffb3b3',});
    }
}
/* [END] Add Layer Name to layer list */

/* Drawing Shapes's vertex style*/
function shapes_vertexs_style(){
    $(".leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.leaflet-zoom-animated.leaflet-interactive.leaflet-marker-draggable")
                .css({
                'background-color': '#ffffff',
                'border-radius': '50%',
                'border': '3px solid #0086FF',
                'width':'15px',
                'height':'15px'
                });
}
/* /*Drawing Shapes's vertex style*/
/* [END] - Draw control */

function preloader_out(){
        jQuery("#status").delay(1000).fadeOut();
        jQuery("#preloader").delay(1000).fadeOut("slow");
}

function preloader_in(){
    jQuery("#preloader").fadeIn();
    jQuery("#status").fadeIn();
}

/* [START] - Navigative */
function digitizing_tool(){
    var checkBox = document.getElementById("digitizing_tool");
    if (checkBox.checked == false){
        if(map){
            draw_editstop();
        }
    }
}

function saveAsMap(save_type){

    var layersOrder = $("#sortable").sortable("toArray");
    var layersOrderCount = layersOrder.length;

    if(save_type == 'save' && layersOrderCount > 0){

        if(LastSavedDrawLayerId > 0){

            for(var l=0; l<layersOrderCount; l++){
                    var groupID = layersOrder[l];
                    var fileId = $('#'+groupID).data("fileid");
                    var groupID_visibility = $('#checkbox_'+groupID);
                    var layer_status = 0;

                    if (groupID_visibility.is(':checked')){
                        layer_status = 1;
                    }

                    var layerData = toGeojson_generation(groupID);

                    if(layerData != null){
                        var convertedData = JSON.stringify(layerData);
                        var data = {'fileId':fileId, 'dataGeojson':convertedData, 'layer_status':layer_status, 'group_id':gid, 'layer_order':(l+1)}

                        measure_layersId("add");

                        $.ajax({
                            url: subdivision+"/map/save_layers/",
                            data: data,
                            type: 'POST',
                            dataType: 'json',
                            beforeSend: function(){
                               // $("#overlay_product_list").show();
                            },
                            success: function(data){
//                                if(data.status ==1){
//                                    SetDrawLayerId(data.drawLayerId);
//                                }else{
//                                    $("#layer_error_save_as").html(data.error);
//                                }
                            }
                        });
                    }
            }
        }else{
            $('#modal_container_save_as').modal('show');
        }

    }else if(save_type == 'save_as' && layersOrderCount > 0){
        $('#modal_container_save_as').modal('show');
    }else if(save_type == 'save_as_map' && layersOrderCount > 0){
        $('#modal_container_save_as_map').modal('show');
    }else{
        console.log("Cannot save. Empty drawn layer");
    }
}

function geojson_data(){
    measure_layersId("remove");

    var multi_geojson = [];
    var layersGroupCount = layersGroups.length;

    if(layersGroupCount > 0){
        for(l=0; l<layersGroupCount; l++){
            var groupID = layersGroups[l].group_id;
            var groupID_visibility = $('#checkbox_'+groupID);

            if (groupID_visibility.is(':checked')){

                    var layerData = toGeojson_generation(groupID);

                    if(layerData != null){
                        multi_geojson.push(layerData);
                    }
        }
    }

    var all_layers = L.geoJson(multi_geojson);
    var allGeojson = all_layers.toGeoJSON();
    var convertedData = JSON.stringify(allGeojson);
    return convertedData;
   }
}

function toGeojson_generation(group_layerID){
    var layerData = window[group_layerID];
    var getGeoJsonData = null;
    var createGeojson = {type: "FeatureCollection", features: []};

    layerData.eachLayer(function(layer){
        var all_layers = layer._layers;


        if(typeof all_layers == null){
            var coordinate = layer._latlng;
            var feature = layer.feature;

            var addProperties = feature.properties;
            var radius = layer._mRadius;
            var option = layer.options;
            var new_feature = createGeojson.features;
            var updateProperties = {};

            (function($) {
                    if(addProperties._infoWindoVisibility == null){
                        updateProperties = addProperties;
                    }else{
                        var infoWindo = addProperties._infoWindoVisibility;

                        $.each(addProperties, function(column, value){
                            if(column != '_layerColor' && column != '_layerFillColor' && column != '_layerOpacity' && column != '_layerFillOpacity' && column != '_layerWeight' && column != '_layerDashArray' && column != '_layerFill' && column != '_layerStroke' && column != '_layerRadius' && column != '_infoWindoVisibility'){
                                var columnChange = infoWindo[column];

                                if(columnChange.status == true && columnChange.Change !=''){
                                    updateProperties[columnChange.Change] = value;
                                }
                            }
                        });
                    }
                })(jQuery);

            updateProperties._layerRadius = radius;
            updateProperties._layerColor = option.color;
            updateProperties._layerFillColor = option.fillColor;
            updateProperties._layerFillOpacity = option.fillOpacity;
            updateProperties._layerOpacity = option.opacity;
            updateProperties._layerWeight = option.weight;
            updateProperties._layerDashArray = [];
            updateProperties._layerFill = true;
            updateProperties._layerStroke = true;

            var AddFeature = {type: "Feature", geometry:{type: "Point", coordinates: [coordinate.lng, coordinate.lat]}, properties:updateProperties};
            new_feature.push(AddFeature);


        }else{

            for(ar in all_layers){
                var each_layer = all_layers[ar];
                var feature = each_layer.feature
                var properties = feature.properties;
                var option = each_layer.options;
                var new_feature = createGeojson.features;
                var updateProperties = {};

                (function($) {

                    if(properties._infoWindoVisibility == null){
                        updateProperties = properties;
                    }else{
                        var infoWindo = properties._infoWindoVisibility;

                        $.each(properties, function(column, value){
                            if(column != '_layerColor' && column != '_layerFillColor' && column != '_layerOpacity' && column != '_layerFillOpacity' && column != '_layerWeight' && column != '_layerDashArray' && column != '_layerFill' && column != '_layerStroke' && column != '_layerRadius' && column != '_infoWindoVisibility'){
                                var columnChange = infoWindo[column];

                                if(columnChange.status == true && columnChange.Change !=''){
                                    updateProperties[columnChange.Change] = value;
                                }
                            }
                        });
                    }
                })(jQuery);

                updateProperties._layerColor = option.color;
                updateProperties._layerFillColor = option.fillColor;
                updateProperties._layerFillOpacity = option.fillOpacity;
                updateProperties._layerOpacity = option.opacity;
                updateProperties._layerWeight = option.weight;
                updateProperties._layerDashArray = option.dashArray;
                updateProperties._layerFill = option.fill;
                updateProperties._layerStroke = option.stroke;

                properties = updateProperties;

                var AddFeature = {type: "Feature", geometry:feature.geometry, properties:updateProperties};
                new_feature.push(AddFeature);
            }
        }
    });

        if(createGeojson.features.length <= 0){
            getGeoJsonData = layerData.toGeoJSON();
        }else{
            getGeoJsonData = createGeojson;
        }

    return getGeoJsonData;
}

function shareMap(){
    var countDrawIds = drawLayersId.length;

    if(LastSavedDrawLayerId > 0){
        save_data = {dataGeojson :geojson_data(), 'last_saved_id':LastSavedDrawLayerId};

        var shareURL = server_url+subdivision+'/map/share_map/'+LastSavedDrawLayerId+'/layer';
        var share_url = '<a href="'+shareURL+'">'+shareURL+'</a>';

        $('#share_url').html(share_url);
        $('#share_iframe_url').html(urlify(share_url));
        $('#modal_container_share').modal('show');
    }else{
        alert("Please save the map before proceeding.");
    }
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return url;
    })
}
/* [END] - Navigative */

/* [START] - Searching Panel*/
/* Add layer to map from the stored layers list */
function add_layer_button(layerType, layerId,  file_type, fileName, layer_name, group_id){

    var val = layerType+'_^_'+layerId+'_^_'+file_type+'_^_'+fileName+'_^_'+group_id;

    var groupID = (!group_id)?0:group_id;
    var IsExistVal = 0;
    for (item in addLayerBySearching){
        if (addLayerBySearching[item][0] == val) {
            IsExistVal = 1;
        }
    }

    if(IsExistVal != 1){

        if(layerType == 'map'){

            var layerGourd_ID = 'm'+layerId+'_map';
            var val_arr = [val, layer_name, layerGourd_ID];
            addLayerBySearching.push(val_arr);
//            layer_to_map(layerId, groupID, file_type, fileName, true, layer_name,1);
            layer_to_map_new(layerId, groupID, file_type, fileName, true, layer_name,1);
        }

        if(layerType == 'layer'){ // GeoJson Data

            var changeStr = fileName.replace(".json", "");
            var rechangeStr = changeStr.replace(".", "_");
            var layerGourd_ID = rechangeStr+'_oneLayer';
            var val_arr = [val, layer_name, layerGourd_ID];
            addLayerBySearching.push(val_arr);

            geojson_to_map(layerId, groupID, true, layer_name, fileName)
        }
    }else{
        console.log("This layer has added already!");
    }
}


$(document).on('click','.add_layer_checkbox',function(){
    var $this = $(this);
    var val = $this.val();
    var layer_name = $this.attr("data-name");

    if ($this.is(':checked')){
        var val_arr = [val, layer_name];
        addLayerBySearching.push(val_arr);
    }else{

        var LayersCount = addLayerBySearching.length;
        if(LayersCount > 0){
            for(i=0; i<LayersCount; i++){
                if (addLayerBySearching[i][0] == val) {
                    delete addLayerBySearching[i];
                }
            }

            addLayerBySearching = addLayerBySearching.filter(function(x){
                                    return (x !== (undefined || null || ''));
                                });
        }
    }
});

function allSelectedLayers(){

        var LayersCount = addLayerBySearching.length;
        if(LayersCount > 0){
            for(i=0; i<LayersCount; i++){
                var val = addLayerBySearching[i][0];
                var arr = val.split("_^_");
                var layer_name = addLayerBySearching[i][1];

                var groupID = (!arr[4])?0:arr[4];

                /* pass to function for Loading SHP, KML */
                if(arr[0] == 'map'){ //
//                    layer_to_map(arr[1], groupID, arr[2], arr[3], false, layer_name,1);
                    layer_to_map_new(arr[1], groupID, arr[2], arr[3], false, layer_name,1);
                }

                /* pass to function for Loading GeoJson */
                if(arr[0] == 'layer'){
                    geojson_to_map(arr[1], groupID, false, addLayerBySearching[i][1], arr[3]);
                }
            }
        }
}
/* /Add layer to map from the stored layers list */
/* [END] - Searching Panel*/


/* [START] - Layer Styling */
function layer_styling(options, value){

    var option;
    var layergroup_status = true;
    $('#layergroup_error').html('');
    var selected_layer_group = $('#layer_group_options').val();

    if(selected_layer_group == ''){
        $('#layergroup_error').html('Please select layer style');
        layergroup_status = false;
    }

    if(layergroup_status != false){

        var getLayer = window[selected_layer_group].toGeoJSON();
        var layer_temp = getLayer;

        window[selected_layer_group].clearLayers();

        var getGroupStyle = getLayerGroupArr(selected_layer_group);

        if(getGroupStyle != null){

            if(options == '_layerColor'){
                getGroupStyle._layerColor = value;
            }else if(options == '_layerOpacity'){
                getGroupStyle._layerOpacity = value;
            }else if(options == '_layerFill'){
                getGroupStyle._layerFill = value;
            }else if(options == '_layerFillColor'){
                getGroupStyle._layerFillColor = value;
            }else if(options == '_layerFillOpacity'){
                getGroupStyle._layerFillOpacity = value;
            }else if(options == '_layerStroke'){
                getGroupStyle._layerStroke = value;
            }else if(options == '_layerWeight'){
                getGroupStyle._layerWeight = value;
            }else if(options == '_layerDashArray'){
                getGroupStyle._layerDashArray = value;
            }
        }

         var updateLayer = L.geoJson(layer_temp, {
                    onEachFeature: onEachFeature,
                    style: function(feature){
                        var properties = feature.properties;
                        properties[options] = value
                        getGroupStyle[options] = value

                        var fillcolor = (!feature.properties['_layerFillColor'])? getGroupStyle._layerFillColor : feature.properties['_layerFillColor'];
                        var color = (!feature.properties['_layerColor'])? getGroupStyle._layerColor : feature.properties['_layerColor'];
                        var fillOpacity = (!feature.properties['_layerFillOpacity'])? getGroupStyle._layerFillOpacity : feature.properties['_layerFillOpacity'];
                        var opacity = (!feature.properties['_layerOpacity'])? getGroupStyle._layerOpacity : feature.properties['_layerOpacity'];
                        var fill = (!feature.properties['_layerFill'])? getGroupStyle._layerFill : feature.properties['_layerFill'];
                        var weight = (!feature.properties['_layerWeight'])? getGroupStyle._layerWeight : feature.properties['_layerWeight'];
                        var stroke = (!feature.properties['_layerStroke'])? getGroupStyle._layerStroke : feature.properties['_layerStroke'];
                        var dashArray = (!feature.properties['_layerDashArray'])? getGroupStyle._layerDashArray : feature.properties['_layerDashArray'];

                        return {
                                color:color,
                                fillColor:fillcolor,
                                opacity: opacity,
                                fillOpacity: fillOpacity,
                                weight:weight,
                                fill: fill,
                                stroke: stroke,
                                dashArray: dashArray,
                            };
                    }
                });

        window[selected_layer_group].addLayer(updateLayer).addTo(map);

        /* Sortable Order */
        var layersOrder = $("#sortable").sortable("toArray");
        change_layer_order(layersOrder);
        /* /Sortable Order */
    }
}

function fill_color_range(style_type, value){
    var maxColor, minColor;
    if(value == 'colRang1'){
        maxColor = '#0F569F';
        minColor = '#eef1fe';
    }else if(value == 'colRang2'){
        maxColor = '#087132';
        minColor = '#e9fae9';
    }else if(value == 'colRang3'){
        maxColor = '#B50808';
        minColor = '#fff1d8';
    }else if(value == 'colRang4'){
        maxColor = '#2B2B2B';
        minColor = '#f7f7f7';
    }else if(value == 'colRang5'){
        maxColor = '#9B0848';
        minColor = '#f1ecf5';
    }

    if(style_type == 'categorized'){
        var value_Property = $('#cat_attrs').val();
        choropleth_layer(style_type, value_Property, minColor, maxColor);
    }

    if(style_type == 'classify'){
        var value_Property = $('#cla_attrs').val();
        choropleth_layer(style_type, value_Property, minColor, maxColor);
    }
}
/* [END] - Layer Styling */

/* [START] - Alert Popup */
function alert_notification_popup(alert_status, message_no){

    if(alert_status == 'success'){
        alert_class = 'alert-success';
    }else if (alert_status == 'fail'){
        var alert_class = 'alert-danger';
    }else{
        var alert_class = 'alert-warning';
    }

    (function($) {

        if($('#notification_buttom_popup').length){
            $('#notification_buttom_popup').remove();
        }

        var popup_box = '<div id="notification_buttom_popup" class="alert '+alert_class+' alert-dismissable" style="z-index:10000000000000000000000000000000;position:fixed;right:3px;bottom:0;border-radius:5px;font-size:14px;">'
                +'<button type="button" class="close close_popup">×</button>'
	            +'<strong >'+notification_text(message_no)+'</strong>'
                +'</div>';

        $('#st-container').append(popup_box);

        setTimeout(function(){
            $('#notification_buttom_popup').fadeOut();
         }, 5000);

    })(jQuery);
}

function notification_text(index){
    switch (index) {
        case 1:
            text = "Layer added successfully.";
            break;
        case 2:
            text = "Data saved successfully.";
            break;
        case 3:
            text = "Layers not loaded successfully.";
            break;
        case 4:
            text = "Layers not uploaded successfully.";
            break;
        case 5:
            text = "Layer uploaded successfully.";
            break;
        case 6:
            text = "Layers loaded successfully.";
            break;
        case 7:
            text = "Layer not added successfully.";
            break;
        case 8:
            text = "Layer not found.";
            break;
        case 9:
            text = "Geolocation is not supported by this browser.";
            break;
        case 10:
            text = "AAIB data not found";
            break;
		case 11:
            text = "Loading..";
            break;
        default:
            text = "Try Again Later";
            break
    }
    return text;
}

$(document).on('click','.close_popup',function(){
    var $this = $(this).parent();
    $this.fadeOut();
});
/* [END] - Alert Popup */

/* [START] - format size */
function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
};
/* [END] - format size */

function SetDrawLayerId(last_draw_layer_id){
    LastSavedDrawLayerId = last_draw_layer_id;
}

/* [START] - Add & Remove Filed for Property of Layer */
function add_field_for_property(){

    (function($) {

        var last_row = $('#property_add_table tr:last');
        var field_input = last_row.find("input[name='field_name[]']");
        var property_input = last_row.find("input[name='property_name[]']");

        if(field_input.val() == ''){
            $(field_input).css({'background-color': '#ffe6e6'});
        }

        if(property_input.val() == ''){
            $(property_input).css({'background-color': '#ffe6e6'});
        }

        if(field_input.val() != '' && property_input.val() != ''){

            field_input.css({'background-color': ''});
            property_input.css({'background-color': ''});

            var new_row = '<tr>'
                          +'<td width="48%">'
                          +'<input name="field_name[]" type="text" class="form-control">'
                          +'</td>'
                          +'<td width="48%">'
                          +'<input name="property_name[]" type="text" class="form-control">'
                          +'</td>'
                          +'<td width="4%">'
                          +'<span class="glyphicon glyphicon-remove-circle property_field_remove">'
                          +'</span>'
                          +'</td>'
                          +'</tr>';

             $(last_row).after(new_row);
        }

    })(jQuery);
}

/* [START] - Load from my panel */
function my_layer_load(layerID, layer_type, layer_file, layer_name){
    var group_id = (!gid)?0:gid;
    layer_to_map_new(layerID, group_id, layer_type, layer_file, false, layer_name, 1);
}

function popup_project_open(layerID, layer_name){
        projectLayerId = layerID;
        projectLayerName = layer_name;

        if(layersGroups.length > 0){
            $("#confirm_to_open_project_content").html("Are you sure you want to close current project & open "+layer_name+" project");
            $('#modal_confirm_to_open_my_project').modal('show');
        }else{
            my_project_load(projectLayerId, projectLayerName);
        }
}

function cancle_open_project(){
    $("#confirm_to_open_project_content").html('');
    $('#modal_confirm_to_open_my_project').modal('hide');
    projectLayerId = null;
    projectLayerName = null;
}

function open_project(){
    $("#confirm_to_open_project_content").html('');
    $('#modal_confirm_to_open_my_project').modal('hide');

    if(projectLayerId!="" && projectLayerName!=""){
        my_project_load(projectLayerId, projectLayerName);
        projectLayerId = null;
        projectLayerName = null;
    }
}

function my_project_load(layerID, layer_name){
    var group_id = (!gid)?0:gid;

    if(layersGroups.length > 0){
        for(i=0; i<layersGroups.length; i++){
            var layer_group = layersGroups[i].group_id;
            window[layer_group].clearLayers();
        }
        $("#sortable").empty();
        $("#map_description").empty();
        layersGroups = [];
    }

    $("#layer_name_save").val('');
    $("#layer_descri_save").val('');
    $("#layer_name_save_map").val('');
    $("#layer_descri_save_map").val('');

    layersFeatureGroup = [];
    measureLayerID = [];
    measureLayers = [];
    drawLayersId = [];
    addLayerBySearching = [];
    property_add_fields = [];
    properties_arr = [];
    randomColorArray = [];
    layerGroupList = [];
    layerGroupStyle = [];
    propertyUpdate = [];
    filterValueChecked = [];

    $("#map_title").html(layer_name);
    geojsons_to_map(layerID, gid, true, layer_name);
}


/* [START] - Load from my panel */
$(document).on('click','.property_field_remove',function(){
    var $this = $(this).parent();
    var row = $this.parent();

    $('#propertyContent_error').fadeOut();
    var rowCount = $('#property_add_table>tbody tr').length - 1;

    if(rowCount > 1){
        row.remove();
    }else{
        $('#propertyContent_error').html("At least one field is required.");
        $('#propertyContent_error').fadeIn();
    }
});

function propertyContent(layer_id, layer_type){

    var layerType_name = layer_type;
    var property_already = '';
    var new_property_status = 0;
    var new_property = '';

    var property_add_fields_count = property_add_fields.length;
        if(property_add_fields_count > 0){

            for (var prop in property_add_fields){
                if(property_add_fields[prop]['type'] == layerType_name){

                new_property_status = 1;

                    var fields = property_add_fields[prop]['property'];
                    for (var field in fields){

                        property_already +='<tr>'
                                    +'<td width="48%">'
                                        +'<input name="field_name[]" type="text" class="form-control" value="'+fields[field]+'" readonly>'
                                    +'</td>'
                                    +'<td width="48%">'
                                        +'<input name="property_name[]" type="text" class="form-control">'
                                    +'</td>'
                                    +'<td width="4%">'
                                        +'<span class="glyphicon glyphicon-remove-circle property_field_remove">'
                                        +'</span>'
                                    +'</td>'
                                +'</tr>';
                    }
                }
            }
        }

        if(new_property_status == 0){
            new_property = '<tr>'
                            +'<td width="48%">'
                                +'<input name="field_name[]" type="text" class="form-control">'
                            +'</td>'
                            +'<td width="48%">'
                                +'<input name="property_name[]" type="text" class="form-control">'
                            +'</td>'
                            +'<td width="4%">'
                                +'<span class="glyphicon glyphicon-remove-circle property_field_remove">'
                                +'</span>'
                            +'</td>'
                        +'</tr>';
        }

    var content = '<div class="tab-content mCustomScrollbar" style="width:400px; overflow-y:auto;overflow-x:hidden; max-height:350px;">'
							+'<div class="row">'
								+'<div class="col-md-12 text-center" style="padding-bottom:10px;"><strong>Add Property</strong></div>'
								+'<div class="clearfix"></div>'
							+'</div>'
							+'<div class="row">'
							+'<div class="col-md-12"><div class="alert alert-danger text-center" id="propertyContent_error" style="display:none;"></div></div>'
								+'<div class="col-md-12">'
									+'<table class="table table-bordered" id="property_add_table">'
										+'<thead>'
										+'<tr>'
											+'<th class="text-center">Field</th>'
											+'<th colspan="2" class="text-center">Name</th>'
										+'</tr>'
										+'</thead>'
										+'<tbody id="property_add_table_body">'
										+property_already
										+new_property
										+'</tbody>'
									+'</table>'
								+'</div>'
							+'</div>'
							+'<div class="row">'
								+'<center>'
									+'<div class="form-group">'
										+'<div class="col-md-12">'
											+'<button id="add_filed_input" class="btn btn-success" style="margin-right:5px;" onclick="add_field_for_property()">Add Field</button>'
											+'<button id="layer_submit_add_property" class="btn btn-primary" onClick="save_layer_property('+layer_id+', `'+layer_type+'`)">Save</button>'
										+'</div>'
									+'</div>'
								+'</center>'
								+'<div class="row" style="padding-bottom:15px;"></div>'
							+'</div>'
						+'</div>';

	return content;
}

function save_layer_property(layerID, layer_type){

    var layer = window[drawnItems].getLayer(layerID);
    var pop_fields = [];
    var type_exist = 0;
    var property_add_fields_count = property_add_fields.length;

    var replace_content = '<div class="tab-content mCustomScrollbar" style="width:400px; overflow-y:auto;overflow-x:hidden; max-height:350px;">'
                        +'<div class="row">'
                            +'<div class="col-md-12 text-center" style="padding-bottom:10px;"><strong>Add Property</strong></div>'
                            +'<div class="clearfix"></div>'
                        +'</div>'
                        +'<div class="row">'
                        +'<div class="col-md-12"><div class="alert alert-danger text-center" id="propertyContent_error" style="display:none;"></div></div>'
                            +'<div class="col-md-12">'
                                +'<table class="table table-bordered" id="property_add_table">'
                                    +'<thead>'
                                    +'<tr>'
                                        +'<th class="text-center">Field</th>'
                                        +'<th colspan="2" class="text-center">Name</th>'
                                    +'</tr>'
                                    +'</thead>'
                                    +'<tbody id="property_add_table_body">';

    $('#property_add_table>tbody tr').each(function (a, b) {

        var field_name = $("input[name='field_name[]']", b).val();
        var property_name = $("input[name='property_name[]']", b).val();

        if(field_name != ''){
             replace_content +='<tr>'
                                +'<td width="48%">'
                                    +'<input name="field_name[]" type="text" class="form-control" value="'+field_name+'" readonly>'
                                +'</td>'
                                +'<td width="48%">'
                                    +'<input name="property_name[]" type="text" class="form-control" value="'+property_name+'">'
                                +'</td>'
                                +'<td width="4%">'
                                    +'<span class="glyphicon glyphicon-remove-circle property_field_remove">'
                                    +'</span>'
                                +'</td>'
                            +'</tr>';
              var property_group = [field_name, property_name];
              pop_fields.push(property_group);
        }
    });

    replace_content +='</tbody>'
                            +'</table>'
                        +'</div>'
                    +'</div>'
                    +'<div class="row">'
                        +'<center>'
                            +'<div class="form-group">'
                                +'<div class="col-md-12">'
                                    +'<button id="add_filed_input" class="btn btn-success" style="margin-right:5px;" onclick="add_field_for_property()">Add Field</button>'
                                    +'<button id="layer_submit_add_property" class="btn btn-primary" onClick="save_layer_property('+layerID+', `'+layer_type+'`)">Save</button>'
                                +'</div>'
                            +'</div>'
                        +'</center>'
                        +'<div class="row" style="padding-bottom:15px;"></div>'
                    +'</div>'
                +'</div>';

    var popup = layer.bindPopup(replace_content, {
                    maxWidth: "auto",
                    maxHeight: "auto",
                    //closeButton: false,
                    keepInView: true
                    }).openPopup();

        /* /Add Popup to Layer Control */

        /* Add Property to array for drawing future  */
        var new_pop_field = [];

        for (var new_pop in pop_fields){
            new_pop_field.push(pop_fields[new_pop][0]);
        }

        var property_add_fields_count = property_add_fields.length;
        if(property_add_fields_count > 0 && property_add_fields_count <=4){

            for (var pop in property_add_fields){
                if(property_add_fields[pop]['type'] == layer_type){
                    type_exist = 1;

                    var fields = property_add_fields[pop]['property'];
                    var notFieldsExist = $(new_pop_field).not(fields).get();

                    if(notFieldsExist.length > 0){
                        for(var new_field in notFieldsExist){
                            fields.push(notFieldsExist[new_field]);
                        }
                    }
                }
            }
        }

        if(type_exist == 0){
                var property = { type: layer_type, property : new_pop_field};
                property_add_fields.push(property);
        }
        /* /Add Property to array for drawing future  */

        /* Save Property to feature Control */
        var feature = layer.feature = layer.feature || {};
        feature.type = feature.type || "Feature"; // Intialize feature.type

        var prop_obj = '{';
        var pop_fields_count = pop_fields.length;

        if (pop_fields_count > 1){
            for(i=0; i< pop_fields_count - 1;i++){
                var field = pop_fields[i];
                var fieldName = field[0];
                var propName = field[1];
                prop_obj += '"'+fieldName+'":"'+propName+'", ';
            }
        }

        if (pop_fields_count > 0){
            prop_obj += '"'+pop_fields[pop_fields_count-1][0]+'":"'+pop_fields[pop_fields_count-1][1]+'"';
        }

        prop_obj += '}';
        var prop_obj_json = JSON.parse(prop_obj);
        feature.properties = prop_obj_json;
        window[drawnItems].addLayer(layer);
        /* /Save Property to feature Control */
}
/* [END] - Add Filed & Remove for Property of Layer */

/* [START] - Classify Layers - (choropleth) */
function choropleth_layer(class_type,value_Property, minColor, maxColor){

    var layerGroup = $('#layer_group_options').val();
    var geojsonMap;

    if(layerGroup != ''){
        var current_geojson = window[layerGroup].toGeoJSON();
        var feature = current_geojson.features;
        var layers_count = (feature.length > 0)?feature.length:1;

        if(class_type == 'categorized'){

             var categorized_status = true;

            if(value_Property == ''){
                categorized_status = false;
                $('#cat_error').html('Please select column field.');
            }

            if(categorized_status != false){
                $('#cat_error').html('');
                var temp_geoJSON = current_geojson;
                window[layerGroup].clearLayers();

                    geojsonMap = L.choropleth(temp_geoJSON, {
                        valueProperty: value_Property,
                        scale: [maxColor, minColor],
                        steps: layers_count,
        //                mode: 'q',
                        style: function(feature){
                            return {
                                color: feature.properties['_layerColor'],
                                weight: feature.properties['_layerWeight'],
                                fillOpacity: 1,
                            };
                        },
                        onEachFeature: onEachFeature
                    });

                var limits = geojsonMap.options.limits
                var colors = geojsonMap.options.colors

                /* add list to Legend */
                create_list_to_legend(class_type, limits,colors);
                /* /add list to Legend */

            }
          }

          if(class_type == 'classify'){

            var classify_status = true;
            var steps_val = $('#classify_num').val();
            var mode = $('#classify_mode').val();

            if(value_Property == ''){
                classify_status = false;
                $('#cla_error').html('Please select column field.');
            }

            if(steps_val <= 0 ){
                classify_status = false;
                $('#cla_error').html('Please enter number in classes field');
            }

            if(mode == ''){
                classify_status = false;
                $('#cla_error').html('Please select mode field.');
            }

            if(classify_status != false){

                $('#cla_error').html('');
                var temp_geoJSON = current_geojson;
                window[layerGroup].clearLayers();
                var steps = parseInt(steps_val);

                geojsonMap = L.choropleth(temp_geoJSON, {
                    valueProperty: value_Property,
                    scale: [maxColor, minColor],
                    steps: steps,
                    mode: mode,
                    style: {
                    color: '#737373',
                    weight: 2,
                    fillOpacity: 0.8
                    },
                    onEachFeature: onEachFeature
                });

                var limits = geojsonMap.options.limits
                var colors = geojsonMap.options.colors

                /* add list to Legend */
                create_list_to_legend(class_type, limits,colors, mode);
                /* /add list to Legend */

            }
          }

          /* Update Layer properties & Save to Map*/
            if(geojsonMap != null){

                var getGeoJsonData = null;

                geojsonMap.eachLayer(function(layer){
                    var option = layer.options;
                    var feature = layer.feature;
                    var properties = feature.properties;
                    properties._layerFillColor = option.fillColor;
                    properties._layerColor = '#ffcc00';
                    properties._layerFillOpacity = 1;
                });

                var Lgeo = geojsonMap.toGeoJSON();

                var updateGeoJson = L.geoJson(Lgeo, {
                    onEachFeature: onEachFeature,
                    style: function(feature){

                        var fillcolor = (!feature.properties['_layerFillColor'])? '#ffffff' : feature.properties['_layerFillColor'];
                        var color = (!feature.properties['_layerColor'])? '#ffcc00' : feature.properties['_layerColor'];
                        var fillOpacity = (!feature.properties['_layerFillOpacity'])? 1 : feature.properties['_layerFillOpacity'];
                        var opacity = (!feature.properties['_layerOpacity'])? 1 : feature.properties['_layerOpacity'];
                        var fill = (!feature.properties['_layerFill'])? true : feature.properties['_layerFill'];
                        var weight = (!feature.properties['_layerWeight'])? 2 : feature.properties['_layerWeight'];
                        var stroke = (!feature.properties['_layerStroke'])? true : feature.properties['_layerStroke'];
                        var dashArray = (!feature.properties['_layerDashArray'])? [] : feature.properties['_layerDashArray'];

                        return {
                            fillColor: fillcolor,
                            color: color,
                            fillOpacity:1,
                            opacity:opacity,
                            weight:weight,
                            fill:fill,
                            stroke:stroke
                        };
                    },
                });

                window[layerGroup].clearLayers();
                window[layerGroup].addLayer(updateGeoJson).addTo(map);
            }
                /* /Update Layer properties & Save to Map*/

          /* Sortable Order */
            var layersOrder = $("#sortable").sortable("toArray");
            change_layer_order(layersOrder);
        /* /Sortable Order */
    }
}


/* Append to Legend */
function create_list_to_legend(legend_type,limits, colors, mode){
    var table = '';
    var legend = '';
    var map_title = '';

    if(limits.length > 0){

        if(legend_type == "categorized"){

            table += '<table class="table"><tbody><tr style="color:black"><th>Symbol</th><th>Value</th></tr>';
            legend+= '<div class="legend_subcontent"><div class="legend-title"><b>'+map_title+'</b></div>';

            for(l=0; l<limits.length; l++){
                table += '<tr style="color:black"><td><i class="fa fa-square" style="color:'+colors[l]+'"></i></td><td>'+limits[l]+'</td></tr>';
                legend+= '<div class="legend_row"><i class="fa fa-square legend_text" style="color:'+colors[l]+';"></i><small> '+limits[l]+'</small></div>';
            }

            table += '</table>';
            legend+= '</div>';

            $("#categorized_grid").html(table);
        }

        if(legend_type == "classify"){

            table += '<table class="table"><tbody><tr style="color:black"><th>Symbol</th><th>Value</th></tr>';
            legend+= '<div class="legend_subcontent"><div class="legend-title"><b>'+map_title+'</b></div>';

            for(r=0; r<limits.length-1; r++){

                table += '<tr style="color:black"><td><i class="fa fa-square" style="color:'+colors[r]+'"></i></td><td>'+limits[r]+' - '+limits[r+1]+'</td></tr>';
                legend+= '<div class="legend_row"><i class="fa fa-square legend_text" style="color:'+colors[r]+';"></i><small> '+limits[r]+' - '+limits[r+1]+'</small></div>';
            }

            table += '<tr style="color:black"><td><i class="fa fa-square" style="color:'+colors[limits.length-1]+'"></i></td><td>'+limits[limits.length-1]+'+ </td></tr>';
            table += '</table>';

            legend+= '<div class="legend_row"><i class="fa fa-square legend_text" style="color:'+colors[limits.length-1]+';"></i><small> '+limits[limits.length-1]+'+ </small></div>';
            legend+= '</div>';

            $("#classify_grid").html(table);

        }

        $("#legend_content_analysis").html(legend);
    }
}
/* /Append to Legend */
/* [END] - Classify Layers - (choropleth) */

/* [START] - Append to Legend for layer groups*/
function create_layers_list_to_legend(groupId, layer_name, color){

    var legend = '';

    if($('#legend_'+groupId).length>0){
        var legend_text = '<i class="fa fa-square legend_text" style="color:'+color+';"></i>  '+layer_name+'';
        $('#legend_'+groupId).html(legend_text);
    }else{
        if(groupId !='' && layer_name !=''){
            legend+= '<div class="legend_row" id="legend_'+groupId+'"><i class="fa fa-square legend_text" style="color:'+color+';"></i>  '+layer_name+'</div>';
            $("#legend_content_layer").prepend(legend);
        }
    }

}
/* [END] - Append to Legend for layer groups*/

/* Add properties column list to select input */
function add_column_ToSelectInput(groupId){
    var getLayer = window[groupId].toGeoJSON();
    var feature = L.geoJson(getLayer,{onEachFeature:onEachProperties});
}


function propertiesList_for_infoWindow(groupId){

    var getLayer = getLayerGroupArr(groupId);

    if(getLayer != null){
        var layerData = getLayer.geoJson;
        var propertiesArr = [];

        layerData.eachLayer(function(layer){

            var feature = layer.feature;
            var properties = feature.properties;

            (function($) {

                if(Object.keys(properties).length > 0){

                    $.each(properties, function(property, value){


                        if(property != '_layerColor' && property != '_layerFillColor' && property != '_layerOpacity' && property != '_layerFillOpacity' && property != '_layerWeight' && property != '_layerDashArray' && property != '_layerFill' && property != '_layerStroke' && property != '_layerRadius' && property != '_infoWindoVisibility'){

                            var isExistPropertie = propertiesArr.includes(property);
                            if(isExistPropertie !=true){
                                propertiesArr.push(property);
                                var propertyArr = {column_name:property, given_name:'', visibility:true};
                                propertyUpdate.push(propertyArr);
                                $(".list-right ul").append('<li class="list-group-item">'+property+'</li>');
                                $('#attr_table').append("<tr><td class='old_property'>"+property+"</td><td class='tdp'><input name='new_property[]' value='' type='text' class='form-control input-md'></td></tr>");
                            }
                        }
                    });
                }
            })(jQuery);
        });

    }
}


function onEachProperties(feature, layer){
    propertyUpdate = [];
    $('#attr_table').empty();
    $('#filter_table').empty();

    if (feature.properties) {
            var properties = feature.properties;
            var geometry = feature.geometry;

            (function($) {
                var select_option ='<option></option>';
                var select_option_ForBubble ='<option></option>';
                var label_list ='';
                if(Object.keys(properties).length > 0){

                    label_list += '<thead><tr style="color:black"><th>properties</th><th>Label Property</th></tr></thead><tbody>';

                    $.each(properties, function(property, value){

                        if(property != '_layerColor' && property != '_layerFillColor' && property != '_layerOpacity' && property != '_layerFillOpacity' && property != '_layerWeight' && property != '_layerDashArray' && property != '_layerFill' && property != '_layerStroke' && property != '_layerRadius' && property != '_infoWindoVisibility'){
                               select_option +='<option value="'+property+'">'+property+'</option>';

                               if(geometry.type == "Point"){
                                    select_option_ForBubble +='<option value="'+property+'">'+property+'</option>';
                               }


                               /* Labelling */
                               label_list += "<tr><td class='label_property'>"+property+"</td><td class='tdp'><input name='label_property' value='"+property+"' type='radio' class='label_values' class='form-control input-md'></td></tr>";
                               /* /Labelling */
                           }
                    });

                    label_list += '</tbody>'

                    $("#cat_attrs").html(select_option);
                    $("#cla_attrs").html(select_option);
                    $(".list-right ul").html('');
                    $("#filter_columns").html(select_option);
                    $("#label_table").html(label_list);
                    $("#chart_x_axis").html(select_option);

                    $("#bubble_attrs").html(select_option_ForBubble);
                 }
            })(jQuery);
    }
}
/* /Add properties column list to select input */
/* [END] - Make properties array */

/*[START] - Bubble Style*/
function bubble_styling(property, options, value){

     var propertyName = (!property)?$('#bubble_attrs').val() : property;
     var bubble_status = true;
     var property = $('#bubble_attrs').val();
     var fillColor = $('#start_color_bubble_value').val();
     var color = $('#end_color_bubble_value').val();
     var opacity = parseInt($('#border_color_opacity_bubble_text').text())/100;
     var fillOpacity = parseInt($('#fill_color_fillOpacity_bubble_text').text())/100;
     var radius = parseInt($('#radius_bubble_text').text());
     var weight = parseInt($('#weight_bubble_text').text());

    if(options == 'start_color'){
        start_color = value;
    }else if(options == 'end_color'){
        end_color = value;
    }else if(options == '_layerOpacity'){
        opacity = value;
    }else if(options == '_layerFillOpacity'){
        fillOpacity = value;
    }else if(options == '_layerRadius'){
        radius = value;
    }else if(options == '_layerWeight'){
        weight = value;
    }

    if(propertyName == ''){
       bubble_status = false;
       $('#bubble_error').html('Please select column field.');
    }

    if(bubble_status != false){

        $('#bubble_error').html('');

        var layerGroup = $('#layer_group_options').val();
         var layerGroup_name = $( "#layer_group_options option:selected" ).text();

        if(layerGroup != ''){
            var current_geojson = window[layerGroup].toGeoJSON();
            var layerGroup_bubble = layerGroup+'_Lybubble_';

            if(window[layerGroup_bubble]){
                window[layerGroup_bubble].clearLayers();
            }else{
                window[layerGroup_bubble] = L.featureGroup().addTo(map);
            }

            var copyGeoJson = L.geoJson(current_geojson,{onEachFeature: onEachFeature});
            window[layerGroup_bubble].addLayer(copyGeoJson).addTo(map);

            var bubble_geoJSON = window[layerGroup_bubble].toGeoJSON();
            var features = bubble_geoJSON.features;

            if(features.length > 0){

                var sum_value = 0;
                for(var v=0; v<features.length; v++){
                    var properties_v = features[v].properties;
                    var geometry = features[v].geometry;
                    var type = geometry['type'];
                    var set_radius = 0;


                    if(type=='Point'){
                        var property_v = parseFloat(properties_v[propertyName]);
                        var value = (property_v>0 && isNaN(property_v) != true)?property_v:1;
                        sum_value +=value;
                    }
                }

                var final_sum_value = (sum_value<=0)?1:sum_value;

                window[layerGroup_bubble].clearLayers();

                var updateGeoJson = L.geoJson(bubble_geoJSON, {
                                pointToLayer: function(feature, latlng) {
                                    var geometry = feature.geometry;
                                    var properties = feature.properties;
                                    var popup, propertiesArr = {};

                                    if(geometry['type'] == 'Point'){

                                        var getProperty = properties[propertyName];
                                        var property = parseFloat(getProperty);
                                        var value = (property>0 && isNaN(property) != true)?property:1;
                                        var default_radius = 100; // 0.1km
                                        var radius_rate = (value/final_sum_value) * 100;
                                        set_radius = parseInt(default_radius * radius * radius_rate);

                                        popup = '<table class="table table-bordered table-striped"><tbody><tr><td>'+propertyName+'</td><td>'+getProperty+'</td></tr></tbody></table>';
                                        propertiesArr[propertyName] = getProperty;

                                        var circle = L.circle([latlng.lat, latlng.lng],{radius: set_radius, color:color,weight:weight, opacity:opacity,fillColor: fillColor,fillOpacity:fillOpacity}).addTo(window[layerGroup_bubble]);
                                        circle.feature = {
                                                   type: 'Feature',
                                                   geometry:{type: "Point", coordinates: [latlng.lng, latlng.lat]},
                                                   properties:propertiesArr
                                                  };
                                        if(popup !=null){
                                            circle.bindPopup(popup);
                                        }
                                        circle.addTo(window[layerGroup_bubble]);

                                    }
                                }
                            })
                /* Add to Legend & Order layers */

                $('#'+layerGroup_bubble).remove();
                $('#legend_'+layerGroup_bubble).remove();

                var new_layer_name ='Bubble - '+layerGroup_name

                create_layers_list_to_legend(layerGroup_bubble, new_layer_name, fillColor);
                var addToSortableList = layer_li_to_sortable(layerGroup_bubble, new_layer_name,1);
                $('#sortable').prepend(addToSortableList);

                $('.layerGroup_opacity_slider').slider({
                slide: function(event, ui ) {
                            var $this = $(this);
                            var value = (ui.value/100);
                            var groupIdSlider = $this.attr('id');
                            var group_id = groupIdSlider.substring(7);

                            layerGroup_opacity(group_id, value);
                    }
                });
                /*/ Add to Legend & Order layers */

                /* store style of layer group */
                var isLayerGroup = getLayerGroupArr(layerGroup_bubble);
                if(isLayerGroup != null){
                    isLayerGroup._layercColor = color;
                    isLayerGroup._layerFillColor = fillColor;

                }else{
                    var newLayerGroup = {group_id:layerGroup_bubble, geoJson: window[layerGroup_bubble], group_name:new_layer_name, fileType:'bubble_style'};
                        newLayerGroup._layerColor = color;
                        newLayerGroup._layerFillColor = fillColor;
                        newLayerGroup._layerWeight = weight;
                        newLayerGroup._layerOpacity = opacity;
                        newLayerGroup._layerFillOpacity = fillOpacity;
                        newLayerGroup._layerFill= true;
                        newLayerGroup._layerStroke= true;
                        newLayerGroup._layerDashArray= [];

                    layersGroups.push(newLayerGroup);
                }
                /* /store style of layer group */
            }
        }
    }
}
/*[END] - Bubble Style*/

/*[START] - Filter*/
function layer_filter_list(groupId, column){
    if(groupId != '' && column != ''){
        filterValues = [];
        var getLayer = window[groupId].toGeoJSON();
        var feature = L.geoJson(getLayer,{onEachFeature:onFilterFeatureList});
    }
}

function onFilterFeatureList(feature, layer) {

    var filterColumn = $('#filter_columns').val();

    if (feature.properties && filterColumn != '') {
            var properties = feature.properties;

            (function($) {

                if(Object.keys(properties).length > 0){
                    $.each(properties, function(column, value){
                        if(column == filterColumn && column != '_layerColor' && column != '_layerFillColor' && column != '_layerOpacity' && column != '_layerFillOpacity' && column != '_layerWeight' && column != '_layerDashArray' && column != '_layerFill' && column != '_layerStroke' && column != '_layerRadius' && column != '_infoWindoVisibility'){

                            var isExistValue = filterValues.includes(value);

                            if(isExistValue !=true){
                                filterValues.push(value);
                                var row = '<tr style="color:black"><td>'+value+'</td><td><input type="checkbox" class="my_f_values" value="'+value+'" name="filter_value[]"></td></tr>';
                                $('#filter_table').append(row);
                            }
                        }
                    });
                 }
            })(jQuery);
    }
}

function getFilterColor(value, filterValueChecked) {

    var isExitFilter = filterValueChecked.includes(value);
    var color = '#3399ff';
    if(isExitFilter != false){
        color = '#009900'
    }
    return color;
}

function filterStyle(feature){

    var column = $('#filter_columns').val();

    return {
        fillColor: getFilterColor(feature.properties[column], filterValueChecked),
        color: 'white',
        weight: 2,
        opacity: 1,
//        dashArray: '3',
        fillOpacity: 0.9
    };
}

function filter(groupId, column){

    if(groupId != '' && column != ''){
        var filter_layer = window[groupId].toGeoJSON();
        var layer_temp = filter_layer;

        window[groupId].clearLayers();

        var filterGeoJson = L.geoJson(layer_temp, {
                            onEachFeature: onEachFeature,
                            style: filterStyle
                            });

        window[groupId].addLayer(filterGeoJson).addTo(map);

        /* Sortable Order */
            var layersOrder = $("#sortable").sortable("toArray");
            change_layer_order(layersOrder);
        /* /Sortable Order */

    }
}
/*[END] - Filter*/

/* [START] - Info Window Control */
function onClickPopup(event){
    if(popup_enable != false){
        event.target.openPopup();
    }else{
        event.target.closePopup();
    }
}

function onPopupDisable(feature, layer) {
    layer.closePopup();
}

function onPopupEnable(feature, layer) {
    layer.openPopup();
}
/* [END] - Info Window Control */

/* [START] - Chart */
function add_othersColumnList(groupId, column){
    var columns = [];
    var select_option = '';

    if(groupId != '' && column != ''){
        var getLayer = window[groupId].toGeoJSON();

        var feature = L.geoJson(getLayer,{
            onEachFeature:function(feature, layer){

                if (feature.properties) {
                    var properties = feature.properties;
                    (function($) {
                        if(Object.keys(properties).length > 0){
                            $.each(properties, function(property, value){

                                if(property != '_layerColor' && property != '_layerFillColor' && property != '_layerOpacity' && property != '_layerFillOpacity' && property != '_layerWeight' && property != '_layerDashArray' && property != '_layerFill' && property != '_layerStroke' && property != '_layerRadius' && property != '_infoWindoVisibility'){
                                    var isExitColumn = columns.includes(property);
                                    if(isExitColumn == false){
                                        columns.push(property);
                                    }
                                }
                            });
                        }
                    })(jQuery);
                }

                }
            }
        );
    }

    columns.sort();
    if(columns.length > 0){
        for(c=0; c<columns.length; c++){
                if(columns[c] != column){
                     select_option +='<option value="'+columns[c]+'">'+columns[c]+'</option>';
                }
        }
    }
    return select_option;
}

function chart_labels_data(groupId, x_column, y_column){
    var labels = [];
    var data = [];

    if(groupId != '' && x_column != '' && y_column !=''){
        var getLayer = window[groupId].toGeoJSON();

        var feature = L.geoJson(getLayer,{
            onEachFeature:function(feature, layer){

                if (feature.properties) {
                    var properties = feature.properties;
                    (function($) {
                        if(Object.keys(properties).length > 0){
                            $.each(properties, function(property, value){
                                if(property == x_column){
                                    labels.push(value);
                                }else if(property == y_column){
                                    if(isNaN(value)){
                                        var val = '';
                                     }else{
                                        var val = Number(value);
                                     }
                                    data.push(value);
                                }
                            });
                        }
                    })(jQuery);
                }

                }
            }
        );
    }
    var chart_data = [labels, data];
    return chart_data;
}

function chart_values(div_id){

    var layerGroup = $('#layers_chart').val();
    var x_axis = $('#chart_x_axis').val();
    var y_axis = $('#chart_y_axis').val();
    var x_label = $('#chart_x_label').val();
    var y_label= $('#chart_y_label').val();
    var chart_color = $('#chart_color_hidden').val();
    var bar_size = $('#bar_size').val();
    var show_border = $('#chart_show_border');
    var border = (show_border.is(':checked'))?1:0;

    if(layerGroup!='' && x_axis!='' && y_axis!= '' && x_label!='' && bar_size !=''){

        var chart_data = chart_labels_data(layerGroup, x_axis, y_axis);

        if(chart_data != null){
            chart_map(div_id ,x_label, y_label, chart_data[0], chart_data[1], chart_color, bar_size, border);
        }
    }
}

function chart_map( div_id, label_x, label_y, labels, data, bar_color, bar_size, bar_border){
    var ctx = $(div_id);
    var min_value = $('#chart_min_value').val();
    var max_value = $('#chart_max_value').val();

    if(min_value == '' || min_value == null){
        min_value = Math.min.apply(null, data)
    }

    if(max_value == '' || max_value == null){
        max_value = Math.max.apply(null, data)
    }

    var myChart = new Chart(ctx, {
		    type: 'bar',
             data: {
                    labels: labels,
                    datasets: [{
                        backgroundColor: bar_color,
                        data: data,
                        borderColor:'#595959',
                        borderWidth: bar_border
                    }]
            },
		    options: {
                legend: {
                          display: false,
                          position: 'top',
                          labels: {
                            fontColor: "#404040",
                          }
                        },
		        scales: {
		            xAxes: [{
		                gridLines: {
                            display:false
                            },
		                ticks: {
		                    beginAtZero:true,
		                    stacked: true,
		                },
		                scaleLabel:{
		                    display: true,
		                    labelString: label_x,
		                    fontColor: '#404040',
		                },
		                barThickness: Number(bar_size)
		            }],
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true,
		                    stacked: true,
		                    min: Number(min_value),
		                    max: Number(max_value)
		                },
		                scaleLabel:{
		                    display: true,
		                    labelString: label_y,
		                    fontColor: '#404040',
		                },
		                barPercentage: 0.8,
                        categoryPercentage: 0.4,
		            }]
		        }
		    }
		});
}

function chartPrint(){

    var groupId = $('#layers_chart').val();
    var layerName = $( "#layers_chart option:selected" ).text();
    var x_column = $('#chart_x_axis').val();
    var y_column = $('#chart_y_axis').val();
    var chartData;

    var table_columnValue = '<table style="width:80%;" class="table table-bordered">';
    if(groupId != '' && x_column !='' && y_column !=''){

        table_columnValue += '<thead><tr><th>'+x_column+'</th><th>'+y_column+'</th></tr></thead>';

        chartData = chart_labels_data(groupId, x_column, y_column);
        var labels =  chartData[0];
        for(i in labels){
            table_columnValue += '<tr><td>'+labels[i]+'</td><td>'+chartData[1][i]+'</td></tr>';
        }

    }
    table_columnValue += '<table>';

    var mywindow = window.open('','','left=0,top=0,toolbar=0,scrollbars=0,status=0');

	mywindow.document.open();
    mywindow.document.write('<html><head>');
    mywindow.document.write('<link href="/static/css/bootstrap.css" rel="stylesheet">');
    mywindow.document.write('<script type="text/javascript" src="/static/js/Chart.min.js"></script>');
    mywindow.document.write('<script type="text/javascript" src="/static/js/jquery.autocomplete.js"></script>');
    mywindow.document.write('</head><body>');
    mywindow.document.write('<center>');
    mywindow.document.write('<h1 id="chartContentPrint" style=padding:20px;">'+layerName+'</h1>');
    mywindow.document.write('<div id="chartContentPrint" style="width:80%; padding:20px;">');
    mywindow.document.write('<canvas id="chart_print_map"></canvas>');
    mywindow.document.write('</div>');
    mywindow.document.write(table_columnValue);
    mywindow.document.write('</center>');

    $(mywindow).load(function() {
        var chartDiv = mywindow.document.getElementById('chart_print_map');
        chart_values(chartDiv);
    });

    mywindow.document.close();
    mywindow.focus();

    setTimeout(function(){
            mywindow.print();
            mywindow.close();
        }, 1000);
 }
/* [END] - Chart */

/*[START] - Labelling */
function labelling(groupId, column){
    if(groupId != '' && column != ''){

        /* Remove label already*/
        var layerGroup = window[groupId];
        layerGroup.eachLayer(function(layer){
            var layers = layer._layers;
            var layers_id = layer._leaflet_id;
            if(layers == null){
                layerGroup.removeLayer(layers_id);
            }
        });
        /* /Remove label already*/

        var filter_layer = window[groupId].toGeoJSON();
        var filterGeoJson = L.geoJson(filter_layer, {
                            onEachFeature: onLabelFeature
                            });
    }
}

function onLabelFeature(feature, layer) {

    var geometry_type = feature.geometry['type'];
    var center;

    if(geometry_type == 'Point'){
        center = layer.getLatLng();
    }else{
       center = layer.getBounds().getCenter();
    }

    var column = $("input[name='label_property']:checked").val();
    var layerGroup = $('#labelling_layers').val();
    label = L.marker(center, {
      icon: L.divIcon({
        iconSize: null,
        className: 'label',
        html: '<div class="label_appearing" style="font-size: 11px; font-weight:bold; color:#000000; width:20px; height:auto;">'+feature.properties[column]+'</div>'
      })
    });

    window[layerGroup].addLayer(label).addTo(map);

}
/*[END] - Labelling */

/*[START] - Spatial Analysis */
function spatial_analysis_process(sp_process, sp_layer_source, sp_layer_clip, sp_unit, sp_value, sp_new_layer){

    $("#preloader").show();
    $("#status").show();

    setTimeout(function(){

    /* Buffer */
    if(sp_process == 'buffering'){

        var color, fillColor;
        if(sp_layer_source != '' && sp_unit != '' && sp_value > 0){

            /* Generate Color & add color to layer*/
            color = getRandomColor();
            fillColor = getRandomColor();
            /* /Generate Color & add color to layer*/

            var layer_source = window[sp_layer_source].toGeoJSON();

            var layerGroup_buffer = sp_layer_source+'_buffer';

            if(window[layerGroup_buffer]){
                window[layerGroup_buffer].clearLayers();
            }else{
                window[layerGroup_buffer] = new L.layerGroup();
            }

            var buffered = turf.buffer(layer_source, sp_value, sp_unit);
            window[layerGroup_buffer] = L.geoJson(buffered,{
                                            style: function(feature){
                                                return {
                                                        fillColor: fillColor,
                                                        color: color,
                                                        fillOpacity:0.8,
                                                        opacity:1,
                                                        weight:2
                                                        };
                                                }
                                        }).addTo(map);

            /* Add to Legend & Order layers */

            $('#'+layerGroup_buffer).remove();
            $('#legend_'+layerGroup_buffer).remove();

            create_layers_list_to_legend(layerGroup_buffer, sp_new_layer, fillColor);

            var addToSortableList = layer_li_to_sortable(layerGroup_buffer, sp_new_layer,1);
            $('#sortable').prepend(addToSortableList);

            $('.layerGroup_opacity_slider').slider({
                slide: function(event, ui ) {
                            var $this = $(this);
                            var value = (ui.value/100);
                            var groupIdSlider = $this.attr('id');
                            var group_id = groupIdSlider.substring(7);

                            layerGroup_opacity(group_id, value);
                    }
            });
            /* /Add to Legend & Order layers */

            /* store style of layer group */
            var isLayerGroup = getLayerGroupArr(layerGroup_buffer);
            if(isLayerGroup != null){
                isLayerGroup._layercColor = color;
                isLayerGroup._layerFillColor = fillColor;

            }else{
                var newLayerGroup = {group_id:layerGroup_buffer, geoJson: window[layerGroup_buffer], group_name:sp_new_layer, fileType:'spatial_analysis'};
                    newLayerGroup._layerColor = color;
                    newLayerGroup._layerFillColor = fillColor;
                    newLayerGroup._layerWeight = 2;
                    newLayerGroup._layerOpacity = 1;
                    newLayerGroup._layerFillOpacity = 0.8;
                    newLayerGroup._layerFill= true;
                    newLayerGroup._layerStroke= true;
                    newLayerGroup._layerDashArray= [];

                layersGroups.push(newLayerGroup);
            }
            /* /store style of layer group */
        }
    }
    /* /Buffer */

    /* intersection */
    if(sp_process == 'intersection'){

        if(sp_layer_source != '' && sp_layer_clip != ''){

            var layer_source = window[sp_layer_source].toGeoJSON();
            var layer_clip = window[sp_layer_clip].toGeoJSON();
            var source_featureArr = [], clip_featureArr = [];

            var layerGroup_intersection = sp_layer_source+'_'+sp_layer_clip+'_intersection';

            if(window[layerGroup_intersection]){
                window[layerGroup_intersection].clearLayers();
            }else{
                window[layerGroup_intersection] = new L.layerGroup();
            }

            var source_features = layer_source.features;
            var clip_features = layer_clip.features;

            if(source_features.length > 0 && clip_features.length > 0){

                for(var s=0; s<source_features.length; s++){
                    var source_feature = source_features[s];
                    source_featureArr.push(source_feature);
                }

                for(var c=0; c<clip_features.length; c++){
                    var clip_feature = clip_features[c];
                    clip_featureArr.push(clip_feature);
                }

            }else{
                console.log('Empty features');
            }

            var color, fillColor;

            if(clip_featureArr.length > 0 && source_featureArr.length > 0){

                /* Generate Color & add color to layer*/
                color = getRandomColor();
                fillColor = getRandomColor();
                /* /Generate Color & add color to layer*/

                for(var i=0; i<clip_featureArr.length; i++){
                    var ploy_1 = clip_featureArr[i];

                    for(var l=0; l<source_featureArr.length; l++){
                        var ploy_2 = source_featureArr[l];
                        var intersection = turf.intersect(ploy_1, ploy_2);

                        if(intersection != null){
                            var intersectedLayer = L.geoJson(intersection,{
                                                style: function(feature){
                                                    return {
                                                            fillColor: fillColor,
                                                            color: color,
                                                            fillOpacity:0.8,
                                                            opacity:1,
                                                            weight:2
                                                            };
                                                    }
                                            });

                            window[layerGroup_intersection].addLayer(intersectedLayer);
                        }
                    }
                }
                window[layerGroup_intersection].addTo(map);

            /* Add to Legend & Order layers */

            $('#'+layerGroup_intersection).remove();
            $('#legend_'+layerGroup_intersection).remove();

            create_layers_list_to_legend(layerGroup_intersection, sp_new_layer, fillColor);

            var addToSortableList = layer_li_to_sortable(layerGroup_intersection, sp_new_layer,1);
            $('#sortable').prepend(addToSortableList);

            $('.layerGroup_opacity_slider').slider({
                slide: function(event, ui ) {
                            var $this = $(this);
                            var value = (ui.value/100);
                            var groupIdSlider = $this.attr('id');
                            var group_id = groupIdSlider.substring(7);

                            layerGroup_opacity(group_id, value);
                    }
            });
            /* /Add to Legend & Order layers */

            /* store style of layer group */
            var isLayerGroup = getLayerGroupArr(layerGroup_intersection);
            if(isLayerGroup != null){
                isLayerGroup._layercColor = color;
                isLayerGroup._layerFillColor = fillColor;
            }else{
                var newLayerGroup = {group_id:layerGroup_intersection, geoJson: window[layerGroup_intersection], group_name:sp_new_layer, fileType:'spatial_analysis'};
                    newLayerGroup._layerColor = color;
                    newLayerGroup._layerFillColor = fillColor;
                    newLayerGroup._layerWeight = 2;
                    newLayerGroup._layerOpacity = 1;
                    newLayerGroup._layerFillOpacity = 0.8;
                    newLayerGroup._layerFill= true;
                    newLayerGroup._layerStroke= true;
                    newLayerGroup._layerDashArray= [];
                layersGroups.push(newLayerGroup);
            }
            /* /store style of layer group */
            }
        }
    }
    /* /intersection */

    /* Clipping  */
        if(sp_process == 'clipping'){

            if(sp_layer_source != '' && sp_layer_clip != ''){

                var layer_source = window[sp_layer_source].toGeoJSON();
                var layer_clip = window[sp_layer_clip].toGeoJSON();
                var source_featureArr = [], clip_featureArr = [], allCoordArr = [];

                var layerGroup_clipping = sp_layer_source+'_'+sp_layer_clip+'_clipping';

                if(window[layerGroup_clipping]){
                    window[layerGroup_clipping].clearLayers();
                }else{
                    window[layerGroup_clipping] = new L.layerGroup();
                }

            var source_features = layer_source.features;
            var clip_features = layer_clip.features;
            var color, fillColor;

            if(source_features.length > 0 && clip_features.length > 0){

                for(var s=0; s<source_features.length; s++){
                    var source_feature = source_features[s];
                    source_featureArr.push(source_feature);
                }

                for(var c=0; c<clip_features.length; c++){
                    var clip_feature = clip_features[c];
                    clip_featureArr.push(clip_feature);
                }

            }else{
                console.log('Empty features');
            }

            if(clip_featureArr.length > 0 && source_featureArr.length > 0){

                /* Generate Color & add color to layer*/
                color = getRandomColor();
                fillColor = getRandomColor();
                /* /Generate Color & add color to layer*/

                var source_Layer = L.geoJson(layer_source,{
                                                style: function(feature){
                                                    return {
                                                            fillColor: fillColor,
                                                            color: color,
                                                            fillOpacity:0.8,
                                                            opacity:1,
                                                            weight:2
                                                            };
                                                    }
                                            });

                window[layerGroup_clipping].addLayer(source_Layer);

                var clipping_Layer = L.geoJson(layer_clip,{
                                                style: function(feature){
                                                    return {
                                                            fillColor: fillColor,
                                                            color: color,
                                                            fillOpacity:0.8,
                                                            opacity:1,
                                                            weight:2
                                                            };
                                                    }
                                            });

                window[layerGroup_clipping].addLayer(clipping_Layer);

                for(var i=0; i<clip_featureArr.length; i++){
                    var ploy_1 = clip_featureArr[i];

                    for(var l=0; l<source_featureArr.length; l++){
                        var ploy_2 = source_featureArr[l];
                        var clipping = turf.intersect(ploy_1, ploy_2);

                        if(clipping != null){
                            var clippedLayer = L.geoJson(clipping,{
                                                style: function(feature){
                                                    return {
                                                            fillColor: fillColor,
                                                            color: color,
                                                            fillOpacity:0.8,
                                                            opacity:1,
                                                            weight:2
                                                            };
                                                    }
                                            });
                            window[layerGroup_clipping].addLayer(clippedLayer);
                        }
                    }
                }
                window[layerGroup_clipping].addTo(map);

            /* Add to Legend & Order layers */
            $('#'+layerGroup_clipping).remove();
            $('#legend_'+layerGroup_clipping).remove();

            create_layers_list_to_legend(layerGroup_clipping, sp_new_layer, fillColor);

            var addToSortableList = layer_li_to_sortable(layerGroup_clipping, sp_new_layer,1);
            $('#sortable').prepend(addToSortableList);

            $('.layerGroup_opacity_slider').slider({
                slide: function(event, ui ) {
                            var $this = $(this);
                            var value = (ui.value/100);
                            var groupIdSlider = $this.attr('id');
                            var group_id = groupIdSlider.substring(7);

                            layerGroup_opacity(group_id, value);
                    }
            });
            /* /Add to Legend & Order layers */

            /* store style of layer group */
            var isLayerGroup = getLayerGroupArr(layerGroup_clipping);
            if(isLayerGroup != null){
                isLayerGroup._layercColor = color;
                isLayerGroup._layerFillColor = fillColor;

            }else{
                var newLayerGroup = {group_id:layerGroup_clipping, geoJson: window[layerGroup_clipping], group_name:sp_new_layer, fileType:'spatial_analysis'};
                    newLayerGroup._layerColor = color;
                    newLayerGroup._layerFillColor = fillColor;
                    newLayerGroup._layerWeight = 2;
                    newLayerGroup._layerOpacity = 1;
                    newLayerGroup._layerFillOpacity = 0.8;
                    newLayerGroup._layerFill= true;
                    newLayerGroup._layerStroke= true;
                    newLayerGroup._layerDashArray= [];
                layersGroups.push(newLayerGroup);
            }
            /* /store style of layer group */
            }
        }
    }
    /* /Clipping  */
    jQuery("#status").delay(1000).fadeOut();
	jQuery("#preloader").delay(1000).fadeOut("slow");
     }, 2000);
}
/*[END] - Spatial Analysis */

/* [STAR] - Print Map*/
function printMap(){

    (function($) {
        if($("#page_area").is(":hidden")) {
            console.log("Test");
            $('#mapTool_on_sheet').hide();
            setTimeout(function(){
                window.print();
             }, 1000);
        }else{

            $('#mapTool').hide();
            $('#map').hide();

            var nA_count = 0;
            $('#north_arrow_content_on_sheet').each(function(index){
                var $this = $(this);
                if($this.is(":visible")) {
                    nA_count +=1;
                    $this.hide();
                }
            });


            var title_count = 0;
            $('.map_tool_title_block_sheet').each(function(index){
                var $this = $(this);
                if($this.is(":visible")) {
                    title_count +=1;
                    $this.hide();
                }
            });

            var scale_count = 0;
            $('#scale_bar_content_sheet').each(function(index){
                var $this = $(this);
                if($this.is(":visible")) {
                    scale_count +=1;
                    $this.hide();
                }
            });

            var citation_count = 0;
            $('.map_tool_citation_block_sheet').each(function(index){
                var $this = $(this);
                if($this.is(":visible")) {
                    citation_count +=1;
                    $this.hide();
                }
            });

            var discription_count = 0;
            $('.description_content_sheet').each(function(index){
                var $this = $(this);
                if($this.is(":visible")) {
                    discription_count +=1;
                    $this.hide();
                }
            });

            var legend_count = 0;
            $('.legend_contain_sheet').each(function(index){
                var $this = $(this);
                if($this.is(":visible")) {
                    legend_count +=1;
                    $this.hide();
                }
            });

            setTimeout(function(){
                window.print();
                $('#mapTool').show();
                $('#map').show();

                if(nA_count>0){
                     $('#north_arrow_content_on_sheet').each(function(index){
                        $(this).show();
                     });
                }

                if(title_count>0){
                     $('.map_tool_title_block_sheet').each(function(index){
                        $(this).show();
                     });
                }

                if(scale_count>0){
                     $('#scale_bar_content_sheet').each(function(index){
                        $(this).show();
                     });
                }

                if(citation_count>0){
                     $('.map_tool_citation_block_sheet').each(function(index){
                        $(this).show();
                     });
                }

                if(discription_count>0){
                     $('.description_content_sheet').each(function(index){
                        $(this).show();
                     });
                }

                if(legend_count>0){
                     $('.legend_contain_sheet').each(function(index){
                        $(this).show();
                     });
                }

             }, 1000);
        }
    })(jQuery);

}
/* [END] - Print Map*/


/*[START] - Save as Map*/

function save_as_map(){
    var current_center = map.getCenter();
    var current_zoom =  map.getZoom();
    var lat = current_center.lat;
    var lng = current_center.lng;
    var map_center = lat+','+lng;

    (function($) {

        var layerStatus = false;
        var layer_name = $('#layer_name_save_map').val();
        var layer_status = $("input[name='layer_status_map']:checked").val();
        var layer_descri = $('#layer_descri_save_map').val();
        var map_type = 'HTML';

        var mapTool_data_frame = ($('#mapTool_data_frame').is(':checked'))? 1:0;
        var mapTool_legend = ($('#mapTool_legend').is(':checked'))? 1:0;
        var mapTool_title = ($('#mapTool_title').is(':checked'))? 1:0;
        var mapTool_north_arrow = ($('#mapTool_north_arrow').is(':checked'))? 1:0;
        var mapTool_scale = ($('#mapTool_scale').is(':checked'))? 1:0;
        var mapTool_citation = ($('#mapTool_citation').is(':checked'))? 1:0;
        var mapTool_grid = ($('#mapTool_grid').is(':checked'))? 1:0;
        var mapTool_data = ($('#mapTool_data').is(':checked'))? 1:0;
        var mapTool_insert_map = ($('#mapTool_insert_map').is(':checked'))? 1:0;

        var save_data;

        $("#layer_error_save_as").empty();

        if(layer_name != ''){
            layerStatus = true;
        }else{
            $("#layer_error_save_as_map").html("Field required");
        }

        if(layerStatus == true){

            // Legend
//            var legendArr = [];
            var legend_text = '';
            if(mapTool_legend == 1){
                var lagendMain = [], legendSub = [];

                $.each($("#legend_content_layer .legend_row"), function(){
                    var $this = $(this);
                    var $color = $(this).find('.legend_text').css("color");
                    var $text = $.trim($this.text());
                    var legend_row = {color:$color, text:$text};
                    lagendMain.push(legend_row);
                });

                $.each($(".legend_subcontent .legend_row"), function(){
                    var $this = $(this);
                    var $color = $(this).find('.legend_text').css("color");
                    var $text = $.trim($this.text());
                    var legend_row = {color:$color, text:$text};
                    legendSub.push(legend_row);
                });

                var legned_all = {main_legend : lagendMain, sub_legend: legendSub}
                  legend_text = JSON.stringify(legned_all);
            }
            // /Legend

            save_data = {'layer_name':layer_name, 'layer_status':layer_status, 'layer_descri':layer_descri, 'group_id':gid, 'map_type':map_type, 'map_center':map_center, 'map_zoom':current_zoom, 'mapTool_data_frame':mapTool_data_frame, 'mapTool_legend':mapTool_legend,'mapTool_title':mapTool_title, 'mapTool_north_arrow':mapTool_north_arrow, 'mapTool_scale':mapTool_scale, 'mapTool_citation':mapTool_citation, 'mapTool_grid':mapTool_grid, 'mapTool_data':mapTool_data, 'mapTool_insert_map':mapTool_insert_map, 'legend':legend_text};

            var layersOrder = $("#sortable").sortable("toArray");
            var layersOrderCount = layersOrder.length;
            if(layersOrderCount > 0){
                var tosave = $.ajax({
                              url:subdivision+"/map/save_as_map/",
                              data: save_data,
                              type: 'POST',
                              dataType: "json",
                              success: alert_notification_popup('success', 2),
                              error: function (xhr) {
                                alert_notification_popup('fail', 7);
                              }
                            });

                $.when(tosave).done(function() {

                    var response = jQuery.parseJSON(tosave.responseText);
                    if(response['status'] == 1){

                        var layerFileID = response['mapLayerId']
                        var group_file_id = response['group_mapLayerId'];
                        SetDrawLayerId(layerFileID);
                        measure_layersId("remove");

                        for(l=0; l<layersOrderCount; l++){
                            var groupID = layersOrder[l];
                            var getLayerGroup = getLayerGroupArr(groupID);
                            var groupID_visibility = $('#checkbox_'+groupID);
                            var layer_status = 0;

                            if (groupID_visibility.is(':checked')){
                                layer_status = 1;
                            }

                            var layerData = toGeojson_generation(groupID);
                            if(layerData != null){
                                var convertedData = JSON.stringify(layerData);
                                var data = {'layer_name':getLayerGroup.group_name, 'dataGeojson':convertedData, 'layerfileID':layerFileID, 'layer_status':layer_status, 'group_id':gid, 'group_file_id':group_file_id, 'layer_order':(l+1)}

                                $.ajax({
                                      url:subdivision+"/map/save_map_file/",
                                      data: data,
                                      type: 'POST',
                                      dataType: "json",
                                      beforeSend: function(){
                                    //                $("#overlay_product_list").show();
                                                  },
                                      success: function(data){
                                                // console.log(data);
                                                },
                                      error: function (xhr) {
                                        alert_notification_popup('fail', 7);
                                      }
                                    });
                            }
                        }

                    }
                });
            }

    //        measure_layersId("add");
            $('#modal_container_save_as_map').modal('hide');

        }


        })(jQuery);


}


/*[END] - Save as Map*/


/* [STAR] - Loyout Panel*/
function loyout_panel(){
    var current_center = map.getCenter();
    var current_zoom =  map.getZoom();
    var lat_lng = current_center.lat+','+current_center.lng;

    loyout_map_panel(current_zoom, lat_lng, 'OSM');
}
/* [END] - Loyout Panel*/


/*[START] - Download */
function downloadFile(file){

    var layersOrder = $("#sortable").sortable("toArray");
    var layersOrderCount = layersOrder.length;
    var layerAvaiCount = 0;
    var featureArr = [];
    var finalGeoJson = null;

    for(var l=0; l<layersOrderCount; l++){
        var groupID = layersOrder[l];
        var fileId = $('#'+groupID).data("fileid");
        var groupID_visibility = $('#checkbox_'+groupID);

        if (groupID_visibility.is(':checked')){

            var getLayer = window[groupID].toGeoJSON();
            layerAvaiCount++;

            var features = getLayer.features;

            for(var f =0; f<features.length; f++){

                var properties = features[f].properties;

                delete properties['_layerColor'];
                delete properties['_layerFillColor'];
                delete properties['_layerFillOpacity'];
                delete properties['_layerOpacity'];
                delete properties['_layerDashArray'];
                delete properties['_layerFill'];
                delete properties['_layerStroke'];
                delete properties['_layerWeight'];

                featureArr.push(features[f]);
            }
        }
    }

    if(layerAvaiCount>0){
        finalGeoJson = {type: "FeatureCollection", features: featureArr }
        var map_tile = $('#map_title').text(), mapName;

        if(map_tile!= "Untitled Map" && map_tile!=""){
            var rep = map_tile.replace(" ", "_");
            mapName = rep;
        }else{
            mapName = "geoedge_download";
        }

        var convertedData = JSON.stringify(finalGeoJson);

        if(file == 'SHP' || file == 'GEOJSON'){

            var data = {'dataGeojson':convertedData, 'map_title':mapName, 'download_type':file}
            var shp_download = $.ajax({
                              url: subdivision+"/map/download_shp/",
                              data: data,
                              type: 'POST',
                              dataType: 'json',
                              async: true,
                              //success: console.log("success");
                            });

            $.when(shp_download).done(function() {
                        var data = shp_download.responseJSON;
                        if(data.status == 1){
                            var url = server_url+"/"+data.filepath;
                            var file = data.file;
                            var dir = data.dir;
                            downloadRequest(file, url, dir);
                         }
                    });

        }else if(file == 'KML'){
            var kmlData = tokml(finalGeoJson);
            var convertedData = 'application/xml;charset=utf-8,' + encodeURIComponent(kmlData);
            var a = document.createElement('a');
    		a.setAttribute('href', 'data:' + convertedData);
    		a.setAttribute('download', mapName+'.kml');
    		a.click();
//            window.URL.revokeObjectURL(_OBJECT_URL);
        }else{
            Console.log("Empty Layer");
        }
    }
}

function downloadRequest(file, url, download_dir){
    var _OBJECT_URL;
    var request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function(e) {
    	if(request.readyState == 2 && request.status == 200) {
            //success
    	}
    	else if(request.readyState == 3) {
            //progress
    	}
    	else if(request.readyState == 4) {
    		_OBJECT_URL = URL.createObjectURL(request.response);
    		var a = document.createElement('a');
    		a.setAttribute('href', _OBJECT_URL);
    		a.setAttribute('download', file);
    		a.click();
            window.URL.revokeObjectURL(_OBJECT_URL);

            if(download_dir != null && download_dir !=''){
                setTimeout(function() {

                    var data = {'downloadedDir':download_dir}
                    $.ajax({
                          url: subdivision+"/map/remove_downloaded/",
                          data: data,
                          type: 'POST',
                          dataType: 'json',
                          success: function(data){
                                //
                            }
                        });

                }, 5000);
            }
    	}
    });

    request.responseType = 'blob';
    request.open('get', url);
    request.send();
}
/*[END] - Download */


function deleteData(id, type){

    var layerDetails = $.ajax({
                  url:subdivision+"/map/get_layer_details/"+id+"/"+type+"/",
                  dataType: "json",
                  success: "Got Deatials",
                  error: function (xhr) {
                    //
                  }
                });

    $.when(layerDetails).done(function() {

        var response = jQuery.parseJSON(layerDetails.responseText);
        if(response['status'] == 1){

/*
		if(type == 'map'){
            var post_data = {sub_proj_page:"my_map", id:id};
            var layerDelete =  $.ajax({
                              url: subdivision+"/map/data_delete/",
                              data: post_data,
                              type: 'POST',
                              dataType: 'json',
                              success: function(data){
                                //   if(data.status == 1 ){}
                                }
                            });

                if(response['gourpID'] > 0){
                    console.log("ID3 :"+id+" , Type :"+type);
                    var post_data = {sub_proj_page:"my_group", id:response['gourpID']};
                    var layerDelete =  $.ajax({
                                      url: subdivision+"/map/data_delete/",
                                      data: post_data,
                                      type: 'POST',
                                      dataType: 'json',
                                      success: function(data){
                                        //   if(data.status == 1 ){}
                                        }
                                    });
                }

             }
*/
/*
             if(type == 'layer'){
                var post_data = {sub_proj_page:"my_layer", id:id};
                var layerDelete =  $.ajax({
                                  url: subdivision+"/map/data_delete/",
                                  data: post_data,
                                  type: 'POST',
                                  dataType: 'json',
                                  success: function(data){
                                    //   if(data.status == 1 ){}
                                    }
                                });

                if(response['gourpID'] > 0){
                    var post_data = {sub_proj_page:"group_layer", id:response['gourpID']};
                    var layerDelete =  $.ajax({
                                      url: subdivision+"/map/data_delete/",
                                      data: post_data,
                                      type: 'POST',
                                      dataType: 'json',
                                      success: function(data){
                                        //   if(data.status == 1 ){}
                                        }
                                    });
                }

             }
*/
        }
    });

    preloader_out();
}


/*[START] - Map Tool - Grid*/
function map_tool_grid_on_sheet(){

    if(sheet_grid_status == 1){
        sheet_grid = L.grid().addTo(map);
    }else{
        map.removeLayer(sheet_grid);
    }

    var temp = sheet_grid_status;
    var temp_new = temp_sheet_grid_status;
    sheet_grid_status = temp_new;
    temp_sheet_grid_status = temp;

}
/*[END] - Map Tool - Grid*/

/*[START] - Map Tool - Indicator*/
function map_indicator_sheet(indicator_status){
    let current_center = map.getCenter();
    let current_zoom =  map.getZoom();
    let lat = current_center.lat;
    let lng = current_center.lng;

    if(indicator_status == 1){
        var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var miniOsm_sheet = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: current_zoom});
        var miniMap_sheet = new L.Control.MiniMap(miniOsm_sheet, { centerFixed: [lat, lng],  toggleDisplay: true, width: 200, height: 130 }).addTo(map);
    }

    (function($) {
        $('#map .leaflet-control-minimap').show();
    })(jQuery);
}
/*[END] - Map Tool - Indicator*/


/*[START] - AAIB */
$(document).ready(function() {

    $('#aaib_tab').click(function(){
        aaib_tab_province();
    });

    function aaib_tab_province(){
        var url = subdivision+"/map/province/";
        $.ajax({
            url: url,
            dataType: 'json',
            //data:values,
            beforeSend: function(){
                //preloader_in();
            },
            success: function(response){
                var provinces = response['province'];

                var select = '<option value="">Province</option>';

                $.each(provinces[0], function (index, value) {
                        select +='<option value="'+index+'">'+value+'</option>'
                });

                $("#aaib_province").html(select);

                $("#aaib_district").html(select_option("District"));
                $("#aaib_asc").html(select_option("ASC"));
                $("#aaib_ds").html(select_option("DS"));
                $("#aaib_gn").html(select_option("GN"));
            }
        });
    }

    $('#aaib_province').change(function(){
            var $this = $(this).val();
            if($this != ''){

               $.ajax({
                    url: subdivision+"/map/district/"+$this+"/",
                    dataType: 'json',
                    //data:values,
                    beforeSend: function(){
                        //preloader_in();
                    },
                    success: function(response){
                        var district = response['district'];

                        var select = '<option value="">District</option>';

                        $.each(district[0], function (index, value) {
                                select +='<option value="'+index+'">'+value+'</option>'
                        });

                        $("#aaib_district").html(select);

                        $("#aaib_asc").html(select_option("ASC"));
                        $("#aaib_ds").html(select_option("DS"));
                        $("#aaib_gn").html(select_option("GN"));
                    }
                });

            }
    });


    $('#aaib_district').change(function(){
            var $this = $(this).val();
            var province = $("#aaib_province").val();

            if($this != '' && province !=''){

              //ASC
               $.ajax({
                    url: subdivision+"/map/asc/"+$this+"/",
                    dataType: 'json',
                    //data:values,
                    beforeSend: function(){
                        //preloader_in();
                    },
                    success: function(response){
                        var asc = response['asc'];

                        var select = '<option value="">ASC</option>';

                        $.each(asc[0], function (index, value) {
                                select +='<option value="'+index+'">'+value+'</option>'
                        });

                        $("#aaib_asc").html(select);
                    }
                });

                //DS
               $.ajax({
                    url: subdivision+"/map/ds/"+province+"/"+$this+"/",
                    dataType: 'json',
                    //data:values,
                    beforeSend: function(){
                        //preloader_in();
                    },
                    success: function(response){
                        var ds = response['ds'];

                        var select = '<option value="">DS</option>';

                        $.each(ds[0], function (index, value) {
                                select +='<option value="'+index+'">'+value+'</option>'
                        });

                        $("#aaib_ds").html(select);

                        $("#aaib_gn").html(select_option("GN"));
                    }
                });

            }
    });

    $('#aaib_ds').change(function(){
            var $this = $(this).val();
            var province = $("#aaib_province").val();
            var district = $("#aaib_district").val();
            if($this != '' && province !='' && district !=''){

               $.ajax({
                    url: subdivision+"/map/gn/"+province+"/"+district+"/"+$this+"/",
                    dataType: 'json',
                    //data:values,
                    beforeSend: function(){
                        //preloader_in();
                    },
                    success: function(response){
                        var gn = response['gn'];

                        var select = '<option value="">GN</option>';

                        $.each(gn[0], function (index, value) {
                                select +='<option value="'+index+'">'+value+'</option>'
                        });

                        $("#aaib_gn").html(select);
                    }
                });

            }
    });


    $('#aaib_search').click(function(){
        aaib_data();
    });


    function select_option(name){
        var select_null = '<option value="">'+name+'</option>';
        return select_null;
    }

});


function aaib_data(){
    (function($) {

        var section = $("#aaib_section").val();
        var province = $("#aaib_province").val();
        var district = $("#aaib_district").val();
        var asc = $("#aaib_asc").val();
        var ds = $("#aaib_ds").val();
        var gn = $("#aaib_gn").val();

        if(section != ''){
            var data = {section:section, province:province, district:district, asc:asc, ds:ds, gn:gn};

            $.ajax({
                url: subdivision+"/map/aaib_data/",
                type:'POST',
                async:true,
                data:data,
                dataType: 'json',
                beforeSend: function(){
                    preloader_in();
                },
                success: function(response){
                    var $response = response['response'];

                    if($response['status'] == 1){
                        var geojson = JSON.parse($response['geojson']);
                        var group = $response['map_group'];

                        if(geojson['features'] !== null){
                            aaib_geojson_to_map(group, true, group, geojson,1);
                        }else{
                            alert_notification_popup('fail', 10);
                            preloader_out();
                        }
                    }
                }
            });

        }

    })(jQuery);
}

$(document).on('click', '.aaib_all_checkbox', function(){
    var $this = $(this);
    var isChecked = false;

    if ($this.prop('checked')==true){
        isChecked = true;
    }

    $(".aaib_checkbox").each(function(){
        var oneThis = $(this);
        oneThis.prop("checked", isChecked );
    });
});


function aaib_geojson_to_map(fileID, fitBound, lang_reg_no, geojson_data, preloader_status){

    preloader_in();

    var geojsonFileMap = L.geoJson(geojson_data,{onEachFeature: onEachFeature});
    var groupId = lang_reg_no;

    /* Add Layer Group */
        var layerGroup = {group_id:groupId, geoJson:geojsonFileMap, group_name:lang_reg_no, fileType:'geojson', fileID:fileID, layer_status:1};
        layerGroup_add(layerGroup);

        var addToSortableList = layer_li_to_sortable(groupId, lang_reg_no, 1);

        $('#sortable').prepend(addToSortableList);

        $('.layerGroup_opacity_slider').slider({
            slide: function(event, ui ) {
                        var $this = $(this);
                        var value = (ui.value/100);
                        var groupIdSlider = $this.attr('id');
                        var group_id = groupIdSlider.substring(7);

                        layerGroup_opacity(group_id, value);
                }
        });

        /* / Add Layer Group */

        if(preloader_status == 1){
            preloader_out();
        }


        if(fitBound === true){
            //alert_notification_popup('success', 6);
            map.fitBounds(geojsonFileMap.getBounds(),{padding: [30, 30]});
        }
}

/*[END] - AAIB */
