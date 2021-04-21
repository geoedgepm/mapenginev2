var attrName = $('#cla_attrs').val();
var colorRange = {'min': '#ffffff', 'max': '#0F569F'};
var selectedLayer = $('#layer_options').val();
var noofClasses = 5;
var mode = 'eqInterval';
var range = null;
var rangeClasses = null;

function addColumns(dropDownId){
  $(dropDownId + ' option').remove();
  var layerId = null;
  if(dropDownId == '#cla_attrs')
  layerId = '#layer_options';
  else if(dropDownId == '#chart_attrs')
  layerId = '#chart_layer';
  
  var attrs = numericColumns[$(layerId).val()];
  console.log('numeric', attrs);
  if(dropDownId == '#cla_attrs')
  $(dropDownId).append($('<option>').text(' Select').val(-1));
  
  if($(layerId).val()){
  for(var i=0; i<attrs.length; i++){
  
  $(dropDownId).append($('<option>').text(attrs[i]).val(attrs[i]));
  }
  }
}

function getSeriesMode(mode, series, noofClasses){
   if(mode == 'eqInterval'){
     return series.getClassEqInterval(noofClasses);
   }
   else if(mode == 'quantile'){
     return series.getClassQuantile(noofClasses);
   }
   else if(mode == 'standard_deviation'){
     return series.getClassStdDeviation(noofClasses);
   }
   else if(mode == 'jenks'){
     return series.getClassJenks(noofClasses);
   }
   else if(mode == 'arithmetic_progression'){
     return series.getClassArithmeticProgression(noofClasses);
   }
}

function classify(attr){

 attrName = $('#cla_attrs').val();
 noofClasses = $('#classes').val();
 mode = $('#mode').val();
 selectedLayer = $('#layer_options').val();
 
 if(jQuery.type(attr) == 'object'){
   colorRange = attr;
 }
 
 classifyStyleDetailsUpdate();
 getSeries();
   
}

function getSeries(feature, selLayer, isMap){
     
      var series = null;
	  if(!isMap)
	   isMoified = true;
	  
	  if(feature){
	  selectedLayer = selLayer;
	  attrName = dbLayers[selectedLayer].property_name;
	  mode = dbLayers[selectedLayer].mode;
	  noofClasses = dbLayers[selectedLayer].no_of_classes;
	  colorRange = selectColorRange(dbLayers[selectedLayer].color_pallet_value);
	  if(dbLayers[selectedLayer].invert_color == 't')
	  switch_cla_color();
	  }
	  series = new geostats(columnValues[selectedLayer][attrName]);
	  //series.setPrecision(6);
	  //var a = series.getClassEqInterval(noofClasses);

	  console.log('color range ', dbLayers[selectedLayer].color_pallet_value);
	  var a = getSeriesMode(mode, series, noofClasses);	  
	  var ranges = series.ranges;
	  claRange = ranges;	  
	  var color_x  = getColors(noofClasses, colorRange.max, colorRange.min);
	  rangeClasses = color_x;
	  if(!feature){
	  //$('#ttt').datagrid({
	  //data: datagridUpdate(ranges, color_x)
	  //})
	  datagridUpdate(ranges, color_x);
	  }
	  
	  var asl = series.setColors(color_x);
	  var class_x = ranges;
	  //var leg = series.getHtmlLegend(null, selectedLayer, 1);
	  var leg = series.getHtmlLegend(null, dbLayers[selectedLayer].lname, 1);
      legend_arr[selectedLayer] = leg;
      addLegend();	  
	  
	  dbLayers[selectedLayer].ranges = ranges; 
	  dbLayers[selectedLayer].colors = color_x; 
      
	  clalayerStyle(color_x, class_x);
      
}

function chg_cla_order(order){
//alert(order);
update_cla_cp(order);
addClaColor();
var color_ww = get_cla_color();
var layer_name = $('#layer_options').val();
if(order == 'asc'){
colorRange['min'] = color_ww;
colorRange['max'] = '#ffffff';
dbLayers[layer_name].invert_color = true;
}
else if(order == 'desc'){
colorRange['min'] = '#ffffff';
colorRange['max'] = color_ww;
dbLayers[layer_name].invert_color = 0;
}
console.log(colorRange);
if($('#mode').val() != -1 && $('#fruitList4').val() != -1 && $('#cla_attrs').val() != -1)
classify();
}

function get_cla_color(){
if(colorRange['min'] == '#ffffff')
return colorRange['max'];
else
return colorRange['min'];
}

function switch_cla_color(){
var color_ww = get_cla_color();
colorRange['min'] = color_ww;
colorRange['max'] = '#ffffff';
}

function update_cla_cp(order){
var jsonItemsSource = null;
if(order == 'asc'){
jsonItemsSource = [
       {
	    text: " Select ",
		value: "-1",
		selected: true,
		//description: "optional string",
		},
	    {
		value: "1",
		selected: false,
		imageSrc: "images/col1_inv.png"
		},
		{
		value: "2",
		selected: false,
		imageSrc: "images/col2_inv.png"
		},
		{
		value: "3",
		selected: false,
		imageSrc: "images/col3_inv.png"
		},
		{
		value: "4",
		selected: false,
		imageSrc: "images/col4_inv.png"
		},{
		value: "5",
		selected: false,
		imageSrc: "images/col5_inv.png"
		},
	  
	];
}
else if(order == 'desc'){
jsonItemsSource = [
       {
	    text: " Select ",
		value: "-1",
		selected: true,
		//description: "optional string",
		},
	    {
		value: "1",
		selected: false,
		imageSrc: "images/col1.png"
		},
		{
		value: "2",
		selected: false,
		imageSrc: "images/col2.png"
		},
		{
		value: "3",
		selected: false,
		imageSrc: "images/col3.png"
		},
		{
		value: "4",
		selected: false,
		imageSrc: "images/col4.png"
		},{
		value: "5",
		selected: false,
		imageSrc: "images/col5.png"
		},
	  
	];
}
$('#fruitList4').ddlist('setItemsSource', jsonItemsSource);
addClaColor();
}

function selectColorRange(value){
 console.log(value);
 if(value == 1){
  colorRange = {'min': '#ffffff', 'max': '#0F569F'};
 }
 else if(value == 2){
  colorRange = {'min': '#ffffff', 'max': '#087132'};
 }
 else if(value == 3){
  colorRange = {'min': '#ffffff', 'max': '#B50808'};
 }
 else if(value == 4){
  colorRange = {'min': '#ffffff', 'max': '#2B2B2B'};
 }
 else if(value == 5){
  colorRange = {'min': '#ffffff', 'max': '#9B0848'};
 }
 return colorRange;
}

/*function datagridUpdate(ranges, colors){
     var data = [];
	 
	 $.each(ranges, function(key, value){
	    var minOfRange = value.split(/ - /)[1];
		var rangeColor = colors[getClass(minOfRange, ranges)];
	
	    var row = {symbol:'<center><i class="fa fa-square" style="color:'+rangeColor+'"></i></center>', value:value, label:'l1'};
		data.push(row);
	 })
	 return data;
}*/
function datagridUpdate(ranges, colors){
    $('#gridc').empty();

     var data = [];
	 $('#gridc').empty();
	 
	 var table = '<table class="table"><tr style="color:black"><th>Symbol</th><th>Value</th></tr>';
	 $.each(ranges, function(key, value){
	    var minOfRange = value.split(/ - /)[1];
		var rangeColor = colors[getClass(minOfRange, ranges)];
		
		table += '<tr style="color:black"><td><i class="fa fa-square" style="color:'+rangeColor+'"></i></td><td>'+value+'</td></tr>';
		
	 })
	 table += '</table>';
	 $('#gridc').append(table);	
	 
}

function pointOrPolygonStyle(geometryType, color, feature, resolution){

    if(geometryType == 'MultiPolygon' || geometryType == 'Polygon'){
	 var style = [new ol.style.Style({
      stroke: new ol.style.Stroke({
      color: 'yellow',
      solid: [4],
      width: 1
     }),
     fill: new ol.style.Fill({
      color: color
     }),
	 text: createTextStyle(feature, resolution, dbLayers[selectedLayer].label_prop)
     })];
	 
	 return style;
	}
	else if(geometryType == 'Point'){
	 var style = [new ol.style.Style({
      image: new ol.style.Circle({
         radius: 5,
         fill: new ol.style.Fill({color: color })
        }),
		text: createTextStyle(feature, resolution, dbLayers[selectedLayer].label_prop)
      })];
	  
	 return style;
	}
	else if(geometryType == 'Line' || geometryType == 'MultiLineString' || geometryType == 'LineString'){
	 var style = [new ol.style.Style({
          fill: new ol.style.Fill({
          color: color
          }),
          stroke: new ol.style.Stroke({
          color: color,
          width: 3,
          solid: [4]
          }),
		  text: createTextStyle(feature, resolution, dbLayers[selectedLayer].label_prop)
         })];
	 return style;
	}
}

function savedLayerStyle(color_x, class_x, feature){
      
      var geometryType = feature.getGeometry().getType();
      color = color_x[getClass(feature.get(attrName), class_x)];
	  
	  var featureStyle = pointOrPolygonStyle(geometryType, color);
	  
      return featureStyle;
}

function clalayerStyle(color_x, class_x){
    console.log(color_x);
    var vectorStyle = (function() {

    var color = null;
    return function(feature, resolution) {
	  var geometryType = feature.getGeometry().getType();

      color = color_x[getClass(feature.get(attrName), class_x)];

	  var featureStyle = pointOrPolygonStyle(geometryType, color, feature, resolution);
	  
      return featureStyle;
     
    };
    }())
	
    layers[selectedLayer].setStyle(vectorStyle);
}

function getColors(range, min, max){
      var colorArray = [];
	  
	  var scale = chroma.scale([min, max])
     .domain([0, range], range);
	 
	  for(var i=0; i<range; i++){
	   colorArray.push(scale(i).toString());
	   
	  }
	  
	  return colorArray;
}	

function getClass(val, a) {
	var separator = ' - ';
	
    for(var i= 0; i < a.length; i++) {
	    // all classification except uniqueValues
		if(a[i].indexOf(separator) != -1) {
			var item = a[i].split(separator);
			if(val <= parseFloat(item[1])) {return i;}
		} else {
			// uniqueValues classification
			if(val == a[i]) {
				return i;
			}
		}
     }
   }
