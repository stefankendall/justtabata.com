function collapseNavbar(){$(".navbar").offset().top>50?$(".navbar-fixed-top").addClass("top-nav-collapse"):$(".navbar-fixed-top").removeClass("top-nav-collapse")}$(window).scroll(collapseNavbar),$(document).ready(collapseNavbar),$(function(){$("a.page-scroll").bind("click",function(a){var b=$(this);$("html, body").stop().animate({scrollTop:$(b.attr("href")).offset().top},500,"easeInOutQuad"),a.preventDefault()})}),$(".navbar-collapse ul li a").click(function(){"dropdown-toggle active"!=$(this).attr("class")&&"dropdown-toggle"!=$(this).attr("class")&&$(".navbar-toggle:visible").click()}),angular.module("app").run(["$templateCache",function(a){"use strict";a.put("views/main.html","<h1>hello</h1>")}]);