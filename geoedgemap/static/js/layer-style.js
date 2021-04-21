/*var fillColor = '#ff8800';
var borderColor = '#ff8800';
var borderStyle = 'solid';*/
var fillColor = '#ff8800';
var borderColor = '#ff8800';
var borderStyle = 'solid';
var selectedLayer = $('#layer_options').val();

function getFillColor(color){
  fillColor = color;
  selectedLayer = $('#layer_options').val();
  //setLayerStyle();
  simpleStyleDetailsUpdate();
  if(dbLayers[selectedLayer].layerType == 'Line')
  layers[selectedLayer].setStyle(setLayerStyle(fillColor, fillColor, borderStyle, selectedLayer));
  else
  layers[selectedLayer].setStyle(setLayerStyle(fillColor, borderColor, borderStyle));
}

function getBorderColor(color){
  //alert(color);
  borderColor = color;
  selectedLayer = $('#layer_options').val();
  //setLayerStyle();
  simpleStyleDetailsUpdate();
  layers[selectedLayer].setStyle(setLayerStyle(fillColor, borderColor, borderStyle));
}

function getBorderStyle(style){  
  borderStyle = style;
  selectedLayer = $('#layer_options').val();
  //setLayerStyle();
  simpleStyleDetailsUpdate();
  layers[selectedLayer].setStyle(setLayerStyle(fillColor, borderColor, borderStyle));
}

function setLayerStyle(fc, bc, bs, layerName, isMap){
   //alert(fc + '--'+ bc);
 
   if(!isMap)
	isMoified = true;
   var style = null;
   var fstyle = null;
   var bstyle = null;
   var lwidth = 1;
   if(layerName)
   selectedLayer = layerName;
   else
   selectedLayer = $('#layer_options').val();
   
   if(dbLayers[selectedLayer].layerType == 'Line')
	lwidth = 3;  

   var col = 'blue';
   //var leg = '<div class="geostats-legend"><div class="geostats-legend-title">'+selectedLayer+'</div>'+
   var leg = '<div class="geostats-legend"><div class="geostats-legend-title">'+dbLayers[selectedLayer].lname+'</div>'+
             '<div><div class="geostats-legend-block" style="background-color:'+fc+' !important">'+
			 '</div> <span class="geostats-legend-counter"></span></div></div><br>';
   
   legend_arr[selectedLayer] = leg;
   addLegend();
   
   if(fc){
    
      fstyle = new ol.style.Fill({
               color: fc
               })
      
   }
   if(bc){
     
     bstyle = new ol.style.Stroke({
	          color: bc,
              width: lwidth
	 })
   }
   if(bs){
     
     if(bs == 'solid'){
    	 
     bstyle = new ol.style.Stroke({
	          color: bc, //necessary otherwise does not show border
              solid: [4],
              width: lwidth
	 })
	 }
	 else if(bs == 'lineDash'){	 
     bstyle = new ol.style.Stroke({
	          color: bc, //necessary otherwise does not show border
              lineDash: [4],
              width: lwidth
	 })
	 }
	 /*else if(bs == 'dotted'){	 
     bstyle = new ol.style.Stroke({
	          color: 'green', //necessary otherwise does not show border
              lineJoin: 'round',
              width: 10
	 })
	 }*/
	 
   }
   
    style = new ol.style.Style({
	        fill: fstyle,
			stroke: bstyle			
	       });
		   		   
    if(dbLayers[selectedLayer].label_prop){

	 var vectorStyle = (function() {
	  
      return function(feature, resolution) {
	  var geometryType = feature.getGeometry().getType();
	  
	  //console.log('feature ', dbLayers[layername].label_prop);
	
	 
	  style = [new ol.style.Style({
	          fill: fstyle,
			  stroke: bstyle,
              text: createTextStyle(feature, resolution, dbLayers[selectedLayer].label_prop)			  
	         })];
	  
	  var featureStyle = style;
      return featureStyle;
     
     };
     }())
	 
	 return vectorStyle;
	}
	
	return style;
    //layers[selectedLayer].setStyle(style);
}
/*function setLayerStyle(){
   
   var style = null;
   var fstyle = null;
   var bstyle = null;
   selectedLayer = $('#layer_options').val();

   if(fillColor){
    
      fstyle = new ol.style.Fill({
               color: fillColor
               })
      
   }
   if(borderColor){
     
     bstyle = new ol.style.Stroke({
	          color: borderColor,
              width: 1
	 })
   }
   if(borderStyle){
     
     if(borderStyle == 'solid'){
    	 
     bstyle = new ol.style.Stroke({
	          color: borderColor, //necessary otherwise does not show border
              solid: [4],
              width: 1
	 })
	 }
	 if(borderStyle == 'lineDash'){	 
     bstyle = new ol.style.Stroke({
	          color: borderColor, //necessary otherwise does not show border
              lineDash: [4],
              width: 1
	 })
	 }
	 
   }
   
    style = style = new ol.style.Style({
	        fill: fstyle,
			stroke: bstyle 
	       })
	return style;
    //layers[selectedLayer].setStyle(style);
}
*/




