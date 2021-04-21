
var pointSize = 5;
var pointColor = '#7bd148';
var selectedPointLayer = $('#layer_options').val();
var borderWidth = '1';
var bubbleBorderColor = '#7bd1f8';

function getSize(size){
  pointSize = size;
  selectedPointLayer = $('#layer_options').val();
  //setBubbleStyle();
  bubbleStyleDetailsUpdate();
  layers[selectedPointLayer].setStyle(setBubbleStyle(pointSize, pointColor, borderWidth, bubbleBorderColor));
}

function getPointColor(color){
 pointColor = color;
 selectedPointLayer = $('#layer_options').val();
 //setBubbleStyle();
 bubbleStyleDetailsUpdate();
 layers[selectedPointLayer].setStyle(setBubbleStyle(pointSize, pointColor, borderWidth, bubbleBorderColor));
}

function getPointBorderColor(color){
 bubbleBorderColor = color;
 selectedPointLayer = $('#layer_options').val();
 //setBubbleStyle();
 bubbleStyleDetailsUpdate();
 layers[selectedPointLayer].setStyle(setBubbleStyle(pointSize, pointColor, borderWidth, bubbleBorderColor));
}
function getBorderWidth(width){
 borderWidth = width;
 selectedPointLayer = $('#layer_options').val();
 //setBubbleStyle();
 bubbleStyleDetailsUpdate();
 layers[selectedPointLayer].setStyle(setBubbleStyle(pointSize, pointColor, borderWidth, bubbleBorderColor));
}

function setBubbleStyle(ps, pc, bw, bc, layer, isMap){
 
 var style;
  if(!isMap)
	isMoified = true;
		
  var pointStyle = null;
  if(layer)
  selectedPointLayer = layer;
  else
  selectedPointLayer = $('#layer_options').val();

  //alert(dbLayers[selectedPointLayer].layerType);
  
  //var leg = '<div class="geostats-legend"><div class="geostats-legend-title">'+selectedPointLayer+'</div>'+
  var leg = '<div class="geostats-legend"><div class="geostats-legend-title">'+dbLayers[selectedPointLayer].lname+'</div>'+
             '<div><div class="geostats-legend-block" style="background-color:'+pc+' !important">'+
			 '</div> <span class="geostats-legend-counter"></span></div></div><br>';
  legend_arr[selectedPointLayer] = leg;
  addLegend();
  
     if(selectedPointLayer == 'cfaincidents' || selectedPointLayer == 'fire_incidents_nsw'){
	  
	  pointStyle = [new ol.style.Style({
        image: new ol.style.Icon({
            src: 'images/fire.png',
            rotateWithView: true,
            anchor: [.5, .5],
            anchorXUnits: 'fraction', anchorYUnits: 'fraction',
            opacity: 1
        })
       })];
	  }
     else{
     pointStyle = new ol.style.Style({
         image: new ol.style.Circle({
         radius: ps,
         fill: new ol.style.Fill({color: pc }),
		 stroke:new ol.style.Stroke({
	          color: bc,
              lineDash: 'solid',
              width: bw
	    })
        })
		
      });
	  }
	  
	  if(dbLayers[selectedPointLayer].label_prop){
	  var vectorStyle = (function() {
      return function(feature, resolution) {
	  var geometryType = feature.getGeometry().getType();
	  
	  var f_style = feature.getStyle();
	  //var set_style = feature.setStyle();
	  console.log('feature ', layers[selectedPointLayer].getStyleFunction());
	  
	  if(layerName == 'cfaincidents' || layerName == 'fire_incidents_nsw'){
	  
	  style = [new ol.style.Style({
        image: new ol.style.Icon({
            src: 'images/location.png',
            rotateWithView: true,
            rotation: angle * Math.PI / 180,
            anchor: [.5, .5],
            anchorXUnits: 'fraction', anchorYUnits: 'fraction',
            opacity: 1
        })
       })];
	  }
	  else{
	  style = [new ol.style.Style({
         image: new ol.style.Circle({
         radius: ps,
         fill: new ol.style.Fill({color: pc }),
		 stroke:new ol.style.Stroke({
	          color: bc,
              lineDash: 'solid',
              width: bw
	    })
        }),
       text: createTextStyle(feature, resolution, dbLayers[selectedPointLayer].label_prop)			  		
      })];
	  }
	  
      return style;
     
     };
     }())
	 
	 return vectorStyle;
	}
	  
	//layers[selectedLayer].setStyle(pointStyle);
	return pointStyle;
	
}
