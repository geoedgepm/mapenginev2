(function( $ ){
	$.customSelect2 = function(options){
		if(typeof options.identifier === "undefined" || options.identifier == ""){
			options.identifier = Math.floor((Math.random() * 8645));
		}
	
		$(options.selector).after(
			"<div id='jqcs2_s_"+options.identifier+"' class='jqcs_select "+options.cssClass+"'>"+
				"<div class='jqcs_value'><p class='jqcs_placeholder'>"+options.placeholder+"</p></div>"+
				"<div class='jqcs_arrow'></div>"+
			"</div>"+
			"<div id='jqcs2_o_"+options.identifier+"' class='jqcs_options'></div>"
		);
		
		$('#jqcs2_s_'+options.identifier+' .jqcs_arrow').width($('#jqcs2_s_'+options.identifier).height());


		for(var i = 0; i < options.options.length; i++){
			var currenthtml = $('#jqcs2_o_'+options.identifier).html();
			var template = options.template;

			for(var j = 0; j < options.options[i].length; j++){
				var regex = new RegExp("\\$"+j, "g");
				template = template.replace(regex, options.options[i][j]);
			}

			$('#jqcs2_o_'+options.identifier).html(currenthtml + template);
		}

		$('#jqcs2_s_'+options.identifier).click(function(e){
			e.stopPropagation();
			if($('#jqcs2_o_'+options.identifier).css('display') == "block"){
				$('#jqcs2_o_'+options.identifier).slideUp();
				$($('#jqcs2_s_'+options.identifier+' .jqcs_arrow')[0]).removeClass('rotated');
			}else{
				$('#jqcs2_o_'+options.identifier).slideDown();
				$($('#jqcs2_s_'+options.identifier+' .jqcs_arrow')[0]).addClass('rotated');
			}
		});

		$('#jqcs2_o_'+options.identifier+' .jqcs_option').click(function(e){
			$('input#fill_style_classify')[0].value = $(this).data('select-value');
			$($('#jqcs2_s_'+options.identifier+' .jqcs_value')[0]).html(this.outerHTML);

            /*Change other select input*/
			$($('#jqcs_s_'+options.identifier+' .jqcs_value')[0]).html(this.outerHTML);
			/* /Change other select input*/

            /* Pass to map_mail.js -> Fill color Range */
            var fill_vale = $('input#fill_style_classify')[0].value;
			fill_color_range('classify', fill_vale);
			/* /Pass to map_mail.js -> Fill color Range */
		});

		$(window).click(function(e){
			$('#jqcs2_o_'+options.identifier).slideUp();
			$($('#jqcs2_s_'+options.identifier+' .jqcs_arrow')[0]).removeClass('rotated');
		});
	}
})( jQuery );