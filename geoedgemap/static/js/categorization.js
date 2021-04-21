
var catAttrName = $('#cat_attrs').val();
var catColorRange = {'min': '#0F569F', 'max': '#ffffff'};
var selectedCatLayer = $('#layer_options').val();

function addCatColumns(dropdownId){
  //$('#cat_attrs option').remove();
  $('#'+dropdownId+' option').remove();
  var layerId = null;
  if(dropdownId == 'cat_attrs')
  layerId = 'layer_options';
  else if(dropdownId == 'f_columns')
  layerId = 'f_layers';
  
  var attrs = layerColumns[$('#'+layerId+'').val()];
  //var attrs = layerColumns[$('#layer_options').val()];
  //$('#cat_attrs').append($('<option>').text('Select').val(-1));
  $('#'+dropdownId+'').append($('<option>').text('Select').val(-1));
  //if($('#layer_options').val()){
  if($('#'+layerId+'').val()){
  for(var i=0; i<attrs.length; i++){
  
  //$('#cat_attrs').append($('<option>').text(attrs[i]).val(attrs[i]));
  $('#'+dropdownId+'').append($('<option>').text(attrs[i]).val(attrs[i]));
  }
  }
}

function categorize(attr){

 catAttrName = $('#cat_attrs').val();
 selectedCatLayer = $('#layer_options').val();
 
 if(jQuery.type(attr) == 'object'){
   catColorRange = attr;
 }
 else if(jQuery.type(attr) == 'string'){
   catAttrName = attr;
 }

 categorizeStyleDetailsUpdate();
 getCatSeries();
}

function getCatSeries(feature, selCatLayer, isMap){
      var series = null;
	  if(!isMap)
	   isMoified = true;
	 
	  if(feature){
	  selectedCatLayer = selCatLayer;
	  catAttrName = dbLayers[selectedCatLayer].property_name;
	  catColorRange = selectCatColorRange(dbLayers[selectedCatLayer].color_pallet_value);
	  if(dbLayers[selectedCatLayer].invert_color == 't')
	  switch_color();
	  }
	  console.log('color range ', catColorRange);
	  series = new geostats(columnValues[selectedCatLayer][catAttrName]);
	  //series.setPrecision(6);
	  var a = series.getClassUniqueValues();	  
	  var noOfValues = a.length;
	  var color_x  = getColors(noOfValues, catColorRange.min, catColorRange.max);
	  
	  if(!feature){
	  catDatagridUpdate(a, color_x)
	  //$('#tt').datagrid({
	  //data: catDatagridUpdate(a, color_x)
	  //})
	  }
	  
	  series.setColors(color_x);
	  var class_x = a;
	  //var leg = series.getHtmlLegend(null, selectedCatLayer, 1);	  	  
	  var leg = series.getHtmlLegend(null, dbLayers[selectedCatLayer].lname, 1);	  	  
	  legend_arr[selectedCatLayer] = leg;
	  addLegend();
	  
	  dbLayers[selectedCatLayer].ranges = a; 
	  dbLayers[selectedCatLayer].colors = color_x;
      console.log(dbLayers[selectedCatLayer]);	  
      
	  
      return catLayerStyle(color_x, class_x);	  
	  
}

function chg_cat_order(order){
//alert(order);
update_cp(order);
addCatColors();
var color_ww = get_color();
var layer_name = $('#layer_options').val();
if(order == 'asc'){
catColorRange['max'] = color_ww;
catColorRange['min'] = '#ffffff';
dbLayers[layer_name].invert_color = true;
}
else if(order == 'desc'){
catColorRange['max'] = '#ffffff';
catColorRange['min'] = color_ww;
dbLayers[layer_name].invert_color = 0;
}
if($('#cat_attrs').val() != -1 && $('#fruitList3').val() != -1)
categorize();
}

function update_cp(order){
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
$('#fruitList3').ddlist('setItemsSource', jsonItemsSource);
//$('#fruitList3').ddlist('select', { index: -1 });
addCatColors();
}

function get_color(){
if(catColorRange['min'] == '#ffffff')
return catColorRange['max'];
else
return catColorRange['min'];
}

function switch_color(){
var color_ww = get_color();
catColorRange['max'] = color_ww;
catColorRange['min'] = '#ffffff';
}

function selectCatColorRange(value){
console.log('coorr ', value);
 if(value == 1){  
  catColorRange = {'min': '#0F569F', 'max': '#ffffff'};
 }
 else if(value == 2){
  catColorRange = {'min': '#087132', 'max': '#ffffff'};
 }
 else if(value == 3){
  catColorRange = {'min': '#B50808', 'max': '#ffffff'};
 }
 else if(value == 4){
  catColorRange = {'min': '#2B2B2B', 'max': '#ffffff'};
 }
 else if(value == 5){
  catColorRange = {'min': '#9B0848', 'max': '#ffffff'};
 }
 return catColorRange;
}

/*function catDatagridUpdate(values, colors){
     var data = [];
	 $.each(values, function(key, value){
	    
	    var row = {cat_symbol:'<center><i class="fa fa-square" style="color:'+colors[key]+'"></i></center>', cat_value:value, cat_label:'l1'};
		data.push(row);
	 })
	 return data;
}*/

function catDatagridUpdate(values, colors){
    $('#grid').empty();
    
     var data = [];	 
	 
	 var table = '<table class="table table-bordered"><tr style="color:black"><th>Symbol</th><th>Value</th></tr>';
	 var table = '<table class="table"><tr style="color:black"><th>Symbol</th><th>Value</th></tr>';
	 $.each(values, function(key, value){
	    table += '<tr style="color:black"><td><i class="fa fa-square" style="color:'+colors[key]+'"></i></td><td>'+value+'</td></tr>';
	 })
	 table += '</table>';
	 $('#grid').append(table);
	
}

function catPointPolygonStyle(geometryType, color, feature, resolution){
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
	 text: createTextStyle(feature, resolution, dbLayers[selectedCatLayer].label_prop)
     })];
	 
	 return style;
	}
	else if(geometryType == 'Point'){
	 var style = [new ol.style.Style({
      image: new ol.style.Circle({
         radius: 5,
         fill: new ol.style.Fill({color: color })
        }),
		text: createTextStyle(feature, resolution, dbLayers[selectedCatLayer].label_prop)
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
		  text: createTextStyle(feature, resolution, dbLayers[selectedCatLayer].label_prop)
         })];
	 return style;
	}
}


function fPointPolygonStyle(geometryType, color, feature, resolution, sel_layer){
   
   
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
	 text: createTextStyle(feature, resolution, dbLayers[sel_layer].label_prop)
     })];
	 
	 return style;
	}
	else if(geometryType == 'Point'){
	 var style = [new ol.style.Style({
      image: new ol.style.Circle({
         radius: 5,
         fill: new ol.style.Fill({color: color })
        }),
		text: createTextStyle(feature, resolution, dbLayers[sel_layer].label_prop)
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
		  text: createTextStyle(feature, resolution, dbLayers[sel_layer].label_prop)
         })];
	 return style;
	}
}
 
function savedCatLayerStyle(color_x, class_x, feature){
      var geometryType = feature.getGeometry().getType();
	  
      color = color_x[getCatClass(feature.get(catAttrName), class_x)];
	  //console.log(getCatClass(feature.get(catAttrName), class_x));
	  var featureStyle = catPointPolygonStyle(geometryType, color);
      return featureStyle;
}
 
function catLayerStyle(color_x, class_x){
   
    var vectorStyle = (function() {
    var color = null;
    
    return function(feature, resolution) {
	  var geometryType = feature.getGeometry().getType();
	  /*if(!isNaN(feature.get(catAttrName))){
	  console.log('cat color', color);
      color = color_x[getCatClass(parseFloat(feature.get(catAttrName)), class_x)];
	  }
	  else{
	  color = color_x[getCatClass(feature.get(catAttrName), class_x)];
	  }*/
	  color = color_x[getCatClass(feature.get(catAttrName), class_x)];
      //console.log('attr value ', feature.get(catAttrName));
	  var featureStyle = catPointPolygonStyle(geometryType, color, feature, resolution);
	  
      return featureStyle;
     
    };
    }())
	layers[selectedCatLayer].setStyle(vectorStyle);
    //return vectorStyle;
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

function getCatClass(val, a) {
	var separator = ' - ';
	
    for(var i= 0; i < a.length; i++) {
	    
			if(val == a[i]) {
			    //console.log(i);
				return i;
			}
		
     }
   }
   //layer filtering
   function layerFilter(dblayername, isMap){
    var sel_layer = null;
	var sel_col = null;
	var sel_value = null;
	var checked_values = [];
	var db_cstr = "";
	$('#filter_error').text('');
	
	if(!isMap)
	 isMoified = true;
	
	if(dblayername){
	sel_col = dbLayers[dblayername].filter_property;
	sel_value = dbLayers[dblayername].filter_value;
	checked_values = dbLayers[dblayername].filter_value.split(",");
	sel_layer = dblayername;
	}
	else{
	sel_col = $('#f_columns').val();
	sel_value = $('input[name=sel_value]:checked').val();
	sel_layer = $('#f_layers').val();
	}
	//alert(sel_col);
	if(sel_col != -1){
	if(!dblayername){
	var count = $("input[name=sel_value]:checked").length;
	$('input[name=sel_value]:checked').each(function(i){
	     
         var value = $(this).val();
		 checked_values.push(value);
		 if(i == (count-1))
		 db_cstr += (value);
		 else
		 db_cstr += (value+',');
    });
	}
   var vectorStyle = (function() {
    var color = null;
    return function(feature, resolution) {
	  var geometryType = feature.getGeometry().getType();
	 
	  var isExist = _.contains(checked_values, feature.get(sel_col));
	  if(isExist){
	  color = 'yellow';
	  }
	  else{
	  color = 'green';
	  }
	  
      //console.log('attr value ', feature.get(catAttrName));
	  var featureStyle = fPointPolygonStyle(geometryType, color, feature, resolution, sel_layer);
      return featureStyle;
     
    };
    }())
	layers[sel_layer].setStyle(vectorStyle);
	if(!dblayername)
	filterDetailsUpdate(sel_layer, db_cstr);
	}
	else{
	 $('#filter_error').text('Please select a column');
	}
   }
   
   function labelLayers(isRemoved){
    var layername = null;
	
	layername = $('#label_layers').val();
	
	if(isRemoved == 'true'){
	dbLayers[layername].label_prop = null;
	$('input[name=label_value]').prop('checked', false);
	}
	else
	dbLayers[layername].label_prop = labelAttr = $('input[name=label_value]:checked').val();
	
	  
	  if(dbLayers[layername].mode){
       getSeries(1, layername);
	  }
	  else if(!dbLayers[layername].mode && dbLayers[layername].property_name){
	   getCatSeries(1, layername);
	  }
	  else if(dbLayers[layername].filter_property){
	   layerFilter(layername);
	  }
	  else if(!dbLayers[layername].property_name && (dbLayers[layername].layerType == 'Polygon' || dbLayers[layername].layerType == 'MultiPolygon')){
	   layerStyle = setLayerStyle(dbLayers[layername].fillColor, dbLayers[layername].lineColor, dbLayers[layername].lineType, layername);
	   layers[layername].setStyle(layerStyle);
	  }
      else if(!dbLayers[layername].property_name && dbLayers[layername].layerType == 'Point'){
	   layerStyle = setBubbleStyle(dbLayers[layername].size, dbLayers[layername].fillColor, dbLayers[layername].lineWidth, dbLayers[layername].lineColor, layername);
       layers[layername].setStyle(layerStyle);
	  }
	  else if(!dbLayers[layername].property_name && dbLayers[layername].layerType == 'Line'){	    
		 lineStyle = setLayerStyle(dbLayers[layername].lineColor, dbLayers[layername].lineColor, dbLayers[layername].lineType, layername);
	     layers[layername].setStyle(lineStyle);
	  }
   
      
   }
  
var createTextStyle = function(feature, resolution, property) {
  var align = 'center';
  var baseline = 'alphabetic';
  var size = '12px';
  var offsetX = parseInt(0, 10);
  var offsetY = parseInt(0, 10);
  var weight = 'bold';
  var rotation = parseFloat(0);
  var font = weight + ' ' + size + ' ' + 'Arial';
  var fillColor = 'black';
  var outlineColor = 'white';
  var outlineWidth = parseInt(3, 10);

  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, property),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    rotation: rotation
  });
};

var getText = function(feature, resolution, property) {
  var type = 'normal';
  var maxResolution = 19200;
  var text = feature.get(property);

  /*if (resolution > maxResolution) {
    text = '';
  }*/ 
  if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  } else if (type == 'wrap') {
    text = stringDivider(text, 16, '\n');
  }

  return text;
};

function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    for (; p > 0 && (str[p] != ' ' && str[p] != '-'); p--) {
    }
    if (p > 0) {
      var left;
      if (str.substring(p, p + 1) == '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      var right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}

