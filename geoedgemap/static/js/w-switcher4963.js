(function(e){e.fn.wSwitcher=
function(t){var n={},r=e.extend(n,t);
return this.each(
function(){var t=e(this),n=t.find(
".w-switcher-control"),r=e(".l-body");n.click(
function(){t.css("right")=="0"||t.css("right")=="0px"?t.animate({right:"-425px"},250):t.animate({right:"0"},250)}),window.color_scheme!==""?e(".w-switcher-section.for_color .w-switcher-section-item."+window.color_scheme).addClass("active"):e(".w-switcher-section.for_color .w-switcher-section-item.color_0").addClass("active");var i=e("<link>",{rel:"stylesheet",href:""}).appendTo("body");t.find(".w-switcher-section.for_color .w-switcher-section-item").each(
function(){e(this).click(
function(){if(!e(this).hasClass("active")){e("#us_colors_inline").remove();var n=e(this).attr("data-color"),r="css/colors/color_"+n+".css?ver=1.1";e(".w-logo-img").attr("src","img/logo_"+n+".png"),t.find(".w-switcher-section.for_color .w-switcher-section-item.active").removeClass("active"),e(this).addClass("active"),i.attr("href",r)}})})})}})(jQuery),jQuery(document).ready(
function(){jQuery(".w-switcher").wSwitcher()});