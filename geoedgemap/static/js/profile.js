var userRegisteredDate = null;
var noOfMaps = null;
var layerCount1 = null;
var today_added = false;
var week_added = false;
var month_added = false;
var all_added = false;

function mapCount(id){
 
 $.ajax({
             type: "POST",
             url: "dbQueries.php",
             data: {'query': 2, 'userId': id},
             cache: false,
            success: function(result){
			  var results = JSON.parse(result);
			  var maps = JSON.parse(results.maps);
			  noOfMaps = parseInt(results.mapCount[0].count);
			  
			  layerCount1 = parseInt(results.layerCount[0].count);
			  
			  $('#map_count').text(noOfMaps);
			  $('#layer_count').text(layerCount1);			  
			  
			   var today = moment();
			   
			  $.each(maps , function( key, value ) {
   
				var id = value.id;
				var diff = dateDiff(value.lmd, today);
				
				if(searchUser != null){
				var cate_date = categ_by_date(moment(value.lmd), today);
				if(cate_date)
				$('#map_list').append('<li style="margin-left:10px;">'+cate_date+'</li>');
				
			    $('#map_list').append('<li style="margin-left:10px;" id="'+"list"+value.id+'" class="list-group-item"><a id='+"map"+ value.id +' href="mapShare.php?id='+id+'" target="_blank"></a><small id="'+"time"+value.id+'" class="block text-muted"><i class="fa fa-clock-o"></i>'+diff+'</small></li>');
				}
				else{
				var cate_date = categ_by_date(moment(value.lmd), today);
				if(cate_date)
				$('#map_list').append('<li  style="margin-left:10px;">'+cate_date+'</li>');
				
				$('#map_list').append('<li style="margin-left:10px;" id="'+"list"+value.id+'" class="list-group-item"><a id='+"map"+ value.id +' href="map.php?umid='+id+'" target="_blank"></a><small id="'+"time"+value.id+'" class="block text-muted"><i class="fa fa-clock-o"></i>'+diff+'</small></li>');
                }
				var id = '#' + 'map' + value.id;
				$(id).text(value.name);
			  })
			  
			  if(noOfMaps == 0){
			   jQuery("#status").delay(1000).fadeOut(); 
                 jQuery("#preloader").delay(1000).fadeOut("slow");
			  }
			  
			  
            }
  })

}

function dateDiff(a, b){
 var no_of_days_ago = moment(a).startOf('day').diff(moment(Date.now()).startOf('day'), 'days');
 if(no_of_days_ago == 0)
 return ' Today';
 else
 return no_of_days_ago*(-1)+ ' days ago';
 //return moment(a).fromNow();
}

function categ_by_date(a, b){
var days = a.diff(b, 'days');
var weeks = (a.diff(b, 'weeks'))*(-1);
var months = (a.diff(b, 'months'))*(-1);
var cat = null;

if(days == 0){
if(!today_added)
cat = 'Today';
today_added = true;
}
else if(weeks < 1){
if(!week_added)
cat = 'Last Week';
week_added = true;
}
else if(months < 1){
if(!month_added)
cat = 'Last Month';
month_added = true;
}
else{
if(!all_added)
cat = 'Other';
all_added = true;
}

return cat;
}

$.fn.safeUrl=function(args){
  var that=this;
  if($(that).attr('data-safeurl') && $(that).attr('data-safeurl') === 'found'){
        return that;
  }else{
       $.ajax({
    url:args.wanted,
    type:'HEAD',
    error:
        function(){
            $(that).attr('src',args.rm)
        },
    success:
        function(){
             $(that).attr('src',args.wanted)
             $(that).attr('data-safeurl','found');
        }
      });
   }


 return that;
};

var user = null;
function fetchUser(id){
  
  $.ajax({
             type: "POST",
             url: "dbQueries.php",
             data: {'query': 3, 'userId': id},
             cache: false,
            success: function(result){
			  //alert(result);
			  var data = user = JSON.parse(result);
			  user = data.user;
			  var lname = data.lname[0];
			  $('#login_uname').text(lname.first_name);
			  console.log('my user', lname);
			  
			  if(user){
			  var userName = firstToUpperCase(user[0].first_name);
			  var email = user[0].email;
			  var date = user[0].registered_date;
			  var desc = user[0].description;
			  var photo = user[0].image;
			  userRegisteredDate = user[0].registered_date;

			  $('#username').text(userName);
			  $('#email').text(email);
			  $('#registered_date').text("Since " + date);
			  $('#user_description').text(desc);
			  if(searchUser != null){
			  $('#u_search').val(userName);
			  $('#chart_heading').text('Layers and Maps Summary of '+ userName);
			  $('#recent_mheading').text('Recent Map of '+ userName);
			  $('#map_name').text(userName + '\'s Maps');
			  $('#layer_name').text(userName + '\'s Layers');
			  $('#g_name').text(userName + '\'s Groups');
			  }
			  if(photo){
			  $('#user_photo').append('<img style="" class="img-circle" id="user_image">');
			  //$('#user_photo').append('<img src="uploads/photos/'+photo+'" style="" class="img-circle" id="user_image">');
			  $('#user_image').safeUrl({wanted:"uploads/photos/"+photo,rm:"images/1601481.jpg"});

			  //if(searchUser == null)
			  //$('#settings_img').append('<img src="uploads/photos/'+photo+'" class="img-circle" style="width:23px;">');
			  }
              else{
			  $('#user_photo').append('<img src="images/1601481.jpg" class="img-circle">');
			  //if(searchUser == null)
			  //$('#settings_img').append('<img src="images/1601481.jpg" class="img-circle" style="width:23px;" >');
			  }
			  if(user_photo != 'null'){			  
			  //$('#settings_img').append('<img src="uploads/photos/'+user_photo+'" class="img-circle" style="width:23px;">');
			  $('#settings_img').append('<img  class="img-circle" style="width:23px;" id="set_image">');
			  $('#set_image').safeUrl({wanted:"uploads/photos/"+user_photo,rm:"images/1601481.jpg"});
			  
              }
			  else
			  $('#settings_img').append('<img src="images/1601481.jpg" class="img-circle" style="width:23px;" >');
			  }
			}
  })  
}
var mapCounts = [];
var chartDates = [];
var layerCounts = [];

function mapLayerCount(id){
    $.ajax({
             type: "POST",
             url: "dbQueries.php",
             data: {'query': 146, 'userId': id},
             cache: false,
             success: function(result){
			 
			  var results = JSON.parse(result);
			  mapCounts = results.map;
			  layerCounts = results.layer;
              chartDates = results.xarr;
			  console.log('map count', mapCounts);
			  console.log('layer count', layerCounts);
			  drawChart();
                 
			 }
	})
}

function drawChart(){
            var new_mapCount = [];
            var new_layerCount = [];
		   
			  _.map(mapCounts, function(num) {
			    
                 var my_num = (num == 0) ?  null : num;
                 if(num == 0)				 
				 new_mapCount.push(null);
				 else
				 new_mapCount.push(num);
              });
			  _.map(layerCounts, function(num) {
			    
                 var my_num = (num == 0) ?  null : num;
                 if(num == 0)				 
				 new_layerCount.push(null);
				 else
				 new_layerCount.push(num);
              });		  
			  console.log('layers ', chartDates);
            var ctx = document.getElementById('flot-bar').getContext("2d");
						
            var data = {
                
                labels : chartDates,
                datasets : [
                            {
                                fillColor : "#CC33FF",
                                strokeColor : "#CC33FF",
                                data : new_mapCount,
                                title: "Maps"
                            },
							{
                                fillColor : "#FFCC66",
                                strokeColor : "#FFCC66",
                                data : new_layerCount,
                                title: "Layers"
                            }
                            
                           ]
                      };
            var step  = 5;
            var max   = 6;
            var start = 0;
			var options = null;
			
            options = {
                barDatasetSpacing : 5,
                barValueSpacing: 5,
            };
            //Create the chart
            ctx = new Chart(ctx).Bar(data, options);
            legend(document.getElementById("lineLegend_div"), data);
}

function userSearch(){
 var skeyword = $('#search_keyword').val();
 
    $.ajax({
             type: "POST",
             url: "dbQueries.php",
             data: {'query': 56, 's_user': skeyword},
             cache: false,
             success: function(result){
			 
			 location.reload();
			 
			}
	})
}
