/**
 * @file frames.js
 * @brief update software on nand flash
 * @copyright Copyright (C) 2017 Elphel Inc.
 * @author Oleg Dzhimiev <oleg@elphel.com>
 *
 * @licstart  The following is the entire license notice for the
 * JavaScript code in this page.
 *
 *   The JavaScript code in this page is free software: you can
 *   redistribute it and/or modify it under the terms of the GNU
 *   General Public License (GNU GPL) as published by the Free Software
 *   Foundation, either version 3 of the License, or (at your option)
 *   any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or FITNESS
 *   FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *   As additional permission under GNU GPL version 3 section 7, you
 *   may distribute non-source (e.g., minimized or compacted) forms of
 *   that code without the copy of the GNU GPL normally required by
 *   section 4, provided you include this license notice and a URL
 *   through which recipients can access the Corresponding Source.
 *
 *  @licend  The above is the entire license notice
 *  for the JavaScript code in this page.
 */

var selected_i = 0;

//var custom_url = "";

//var iframetrue = "?iframe=true";
var iframetrue = "";

var window_width;
var window_height;

var initial_focus = 0;

var global_init = true;

$(function(){

  console.log("init");
  inithelp();

  parseURL();

  if (custom_url!=""){
    custom_url = decodeURIComponent(custom_url);
    for(var i=0;i<targets.length;i++){
      if (custom_url.indexOf(targets[i].href)!=-1) {
        targets[i].href = custom_url;
        initial_focus = i;
      }
    }
  }

  if (cols<1)
    cols = 1;
  else if (cols>targets.length)
    cols = targets.length;

  rows = Math.ceil(targets.length/cols);

  reorder_targets();

  window_width = $(window).width();
  window_height = $(window).height();

  init();

  $(window).on("click",function(){
    //console.log("you clicked");
    $("iframe").each(function(){
      //console.log($(this).attr("src"));
    });
  });

  ElphelMessenger.init(function(e){

    //emergency
    if (window.self!=window.top){
      window.location.href=window.location.href+"?iframe=true";
    }

    //e.data.href - link
    //e.data.name - targets[i].name
    var tmp_index = get_index_by_name(e.data.name);

    if (global_init){
      if (tmp_index==initial_focus){
        global_init = false;
        set_focus(initial_focus);
      }
    }

    if (tmp_index!=-1){

      if (e.data.mode=="init"){
        $(".content_header").each(function(){
          if ($(this).attr("index")==tmp_index){
            var tmp_str = e.data.href;
            if ((tmp_str.substr(-iframetrue.length)==iframetrue)&&(iframetrue!="")){
              tmp_str = tmp_str.substr(0,tmp_str.length-iframetrue.length);
            }
            $(this).find("a").attr("href",tmp_str).attr("title","Open in a new window: "+tmp_str);
          }
        });

      }else if(e.data.mode=="click"){
        //e.data.host
        var target_found = false;
        if (e.data.host==e.data.target){
          $("#iframe_"+tmp_index).attr("src",e.data.href+iframetrue);
        }else{
          for(var i=0;i<targets.length;i++){
            if (targets[i].href.indexOf(e.data.host)!=-1){
              console.log("accessing "+e.data.href+" vs "+e.data.host);
              if ($("#iframe_"+i).attr("src").replace(/\/$/,"")!=e.data.href.replace(/\/$/,"")){
                $("#iframe_"+i).attr("src",e.data.href+iframetrue);
                $("#iframe_"+i).on("load",function(){
                  set_focus($(this).attr("index"));
                  $(this).off("load");
                });
              }else{
                set_focus(i);
              }
              target_found = true;
            }
          }
          if (!target_found){
            var newtab = window.open(e.data.href, '_blank');
            if (newtab) {
              //Browser has allowed it to be opened
              newtab.focus();
            } else {
              //Browser has blocked it
              alert('Please allow popups for this website');
            }
          }
        }
      }
    }

  });

  setTimeout(initial_timeout_focus,3000);

});

function initial_timeout_focus(){
  if (global_init){
    global_init = false;
    set_focus(initial_focus);
  }
}

function get_index_by_name(name){
  for(var i=0;i<targets.length;i++){
    if (name==targets[i].name) return i;
  }
  return -1;
}

function reorder_targets(){
  var tmp_arr = targets.slice(0);
  for(var i=0;i<targets.length;i++){
    if(i<order.length){
      targets[i] = tmp_arr[order[i]];
    }
  }
}

function resize(){

  window_width = $(window).width();
  window_height = $(window).height();

  $("#panel").height($("#subpanel").height());

  $(".content_wrapper").attr("initialized",0);

  update_frames();

}

function update_frames(){
  var width = window_width;
  var height = window_height;

  var tmp_width=0;

  parseURL();

  if (width>=(width_base+(cols-1)*min_col_width)){
    if (cols==1){
      base_width = width;
      base_hstep = 0;
      base_vstep = 25;
    }else{
      base_width = width_base;
      base_hstep = (width-base_width)/(cols-1);
    }
  }else{
    cols=1;
    base_width = width;
    base_hstep = 0;
    base_vstep = 25;
  }

  //console.log(window_width+"x"+window_height+" vs "+$(window).width()+"x"+$(window).height());
  //console.log("delta: "+(width-base_width)+" hstep: "+base_hstep);

  rows = Math.ceil(targets.length/cols);

  var header_visible_width = (width-base_width)/(cols-1);
  var force_header_text_align = ((width-base_width)/(cols-1) <= base_width/2);

  //base_vstep = 150;//height/Math.floor(targets.length/cols+3);

  //convert selected_i to table row and col

  var selected_row = Math.floor(selected_i/cols);

  var selected_col = selected_i%cols;
  // shift the last col
  if (selected_row==(rows-1)) {
    if ((targets.length!=cols)&&(cols!=1)){
      selected_col = selected_col+(cols-targets.length%cols);
    }
  }

  $(".content_wrapper").each(function(){

    var iframe_adjustment_value = iframe_adjustment_base_value;

    var tmp_index = +$(this).attr("index");
    var row_index = Math.floor(tmp_index/cols);
    var col_index = tmp_index%cols;

    var lowest_row = rows - 1;

    if (row_index==(rows-1)){
      if ((targets.length!=cols)&&(cols!=1)){
        col_index = col_index+(cols-targets.length%cols);
      }
    }

    if ((targets.length!=cols)&&(cols!=1)){
      if (col_index<(cols-targets.length%cols)){
        lowest_row = lowest_row - 1;
      }
    }

    var tmp_height;
    var tmp_top;
    var tmp_left;

    //common
    tmp_width = base_width;
    tmp_left = col_index*(base_hstep);

    var zindex = cols-Math.abs(col_index-selected_col)-Math.abs(row_index-selected_row);

    //console.log(tmp_index+" "+lowest_row);

    $(this).css({"z-index":zindex});

    if (col_index==selected_col){

      if(tmp_index==selected_i){
        iframe_adjustment_value = iframe_adjustment_selected_value;
        tmp_height = height-(lowest_row)*base_vstep;
        tmp_top = row_index*base_vstep;
      }else{
        if (tmp_index<selected_i){
          tmp_height = base_vstep;
          tmp_top = row_index*base_vstep;
        }else{
          tmp_height = base_vstep;
          tmp_top = height-(lowest_row)*base_vstep + (row_index-1)*base_vstep;
        }
      }

    }else{
      if ($(this).attr("initialized")==0){
        //if (row_index==lowest_row){
        if (row_index==0){
          tmp_height = height-(lowest_row)*base_vstep;
          tmp_top = row_index*base_vstep;
        }else{
          tmp_height = base_vstep;
          tmp_top = height-(lowest_row)*base_vstep + (row_index-1)*base_vstep;
        }
      }else{
        tmp_height = $(this).height();
        tmp_top = $(this).offset.top;
        iframe_adjustment_value = 0;
      }

    }

    var header_text_align = "center";

    if (force_header_text_align){
      if (selected_col>col_index){
        header_text_align = "left";
      }else if(selected_col<col_index){
        header_text_align = "right";
      }
    }

    $(this).find(".content_header").css({
      "text-align":header_text_align,
      "padding-left": (header_visible_width/2),
      "padding-right": (header_visible_width/2),
    });

    $(this).attr("initialized",1);

    var tmp_height_adjusted = (tmp_height-iframe_adjustment_value);

    //console.log(tmp_index+": "+targets[tmp_index]['name']+" : "+tmp_top+" : "+iframe_adjustment_value+" : "+tmp_height_adjusted);

    $(this).css({
      top: tmp_top+"px",
      left: tmp_left+"px",
      width: tmp_width+"px",
      height: tmp_height_adjusted+"px"
    });

    $(this).find(".content_cover").css({
      width: tmp_width+"px",
      height: tmp_height_adjusted+"px"
    });

    $(this).find("iframe").css({
      width: (tmp_width-2)+"px",
      height: (tmp_height_adjusted-$(this).find(".content_header").height())+"px"
    });

  });
}

function init(){

  $("#panel").css({
    position:"absolute",
    top:"0px",
    left:"0px",
    "z-index": 1,
  });

  var subpanel = $("<table>",{id:"subpanel"}).css({
    position:"absolute",
    width:"100%"
  });

  var subsubpanel = $("<div id='home' style='float:left;padding:5px 20px 0px 5px;'><img title='Home' style='cursor:pointer;' width=45 height=45 src='images/elphel-logo-wb.png'></div>");

  $("#panel").append(subpanel);

  subpanel_td = $("<td>").css({
    //border: "2px solid green"
  });

  //subpanel.append($("<tr>").append(subsubpanel).append(subpanel_td));
  subpanel.append($("<tr>").append(subpanel_td));

  //subpanel_td.append();
  var search_title = "Search across Elphel websites. Results will be displayed in the frames below";
  var search_icon = "<img title='"+search_title+"' width=30 src='images/icon_search.png'>";

  //add search here
  var search_div = $("<div>",{class:"search"}).css({
    padding:"5px",
    float:"right",
  });

  search_div.html("<input type='text' placeholder='combined search...' class='combined_search' id='combined_search' title='"+search_title+"'> <div id='search_button' style='position:relative;top:5px;display:inline-block;'>"+search_icon+"</div>");

  subpanel_td.append(search_div);

  for(var i=0;i<targets.length;i++){
    var tmp_div = $("<div>",{id:"target_"+i,class:"target_wrapper"});

    var tmp_div_content = $("<div>",{class:"target_contents"}).html(targets[i].name);

    tmp_div_content.attr("index",i);

    tmp_div.html(tmp_div_content);

    subpanel_td.append(tmp_div);

    tmp_div.css({
      float:"right",
      "padding-top":"10px",
    });

  }

  subpanel_td.append(subsubpanel);

  var icon_help = $("<div id='help' style='float:left;padding:10px 20px 0px 5px;'><img title='Help' style='cursor:pointer;' height=35 src='images/icon_help.png'></div>");

  subpanel_td.append(icon_help);

  $("#home").on("click",function(){
    home();
  });

  $("#help").on("click",function(){
    $("#help-text").show();
  });

  search_div.on("click",function(e){
    e.stopPropagation();
  });

  $(".target_contents").click(function(e){
    set_center_panel($(this).attr("index"));
    set_focus($(this).attr("index"));
    //e.preventDefault();
    e.stopPropagation();
  });

  set_center_panel(0);

  var menu = $("<div>",{id:"search",class:"search"}).html(search_icon).css({
    position:"absolute",
    right:"2px",
    top:"2px",
    "z-index":"10"
  });
  $("body").append(menu);

  subpanel.css({
    top:"-1px",
    right: "3px"
//    left:"0px"
//     left:($(window).width()-subpanel.width())/2+"px"
  });

  $("#combined_search").css({
    width: (2*base_vstep)+"px"
  });

  menu.on("click",function(){
    show_panel();
  });

  $("#panel").on("click",function(){
    $("#panel").hide();
    $("#search").show();
  });

  $("#search_button").on("click",function(){
    $("#panel").hide();
    $("#search").show();
  });

  $("#combined_search").change(function(){

    var tmp_rq = $(this).val();

    if (tmp_rq!=""){
      $(".content_wrapper").each(function(){
        var tmp_index = +$(this).attr("index");

        if (targets[tmp_index].search!=""){
          $(this).find("iframe").attr("src",targets[tmp_index].search+tmp_rq);

          $.ajax({
            url: "search.php?i="+targets[tmp_index].search_index+"&q="+tmp_rq,
            success: function(data){
              if (data.trim().length<100){
                $("#target_"+tmp_index).find(".target_contents").html(targets[tmp_index].name+" <span style='font-size:0.8em;'>("+data.trim()+")</span>");
              }
            },
            error: function(){
              console.log("request failed");
            }
          });


        }


      });

    }else{
      home();
    }

  });

  $("#panel").hide();
  $("#search").show();
  ///////////////////////////////////////////////////////////////////////////////////////////

  $("#content").css({
    position:"absolute",
    top: "0px",
    left: "0px",
    "z-index": 0
  });

  for(var i=0;i<targets.length;i++){

    var tmp_div = $("<div>",{id:"content_"+i,class:"content_wrapper"}).css({
      position:"absolute",
      top:"0px",
      height:"100%"
    });
    tmp_div.attr("index",i);
    tmp_div.attr("initialized",0);

    init_content(tmp_div,targets[i],i);

    $("#content").append(tmp_div);
  }

}

function inithelp(){

  var helpdiv = $("#help-text");
  //var helpdiv = $("<div>",{id:"help-text"}).html(helptext);
  //$("body").append(helpdiv);

  helpdiv.hide();

  helpdiv.on("click",function(){
    $(this).hide();
  });

}

function home(){
  $(".content_wrapper").each(function(){
    var tmp_index = +$(this).attr("index");
    $(this).find("iframe").attr("src",targets[tmp_index].href+iframetrue);
    $("#target_"+tmp_index).find(".target_contents").html(targets[tmp_index].name);
  });
}

function show_panel(){
  $("#search").hide();
  $("#panel").show();
  $("#panel").height($("#subpanel").height());
}

function highlightsearch(needle){
  console.log("Highlightling "+needle);
  if (window.find(needle, true)) {
    document.execCommand("hiliteColor", false, "Red");
    while (window.find(needle, true)) {
        document.execCommand("hiliteColor", false, "Yellow");
    }
  }
}

function init_content(element,content,i){

  var tmp_div_content = $("<div>",{class:"content_contents"}).css({
    width:"100%",
    height:"100%"
  });

  var tmp_div_header = $("<div>",{class:"content_header"}).html("<a title='Open in a new window:  "+targets[i].href+"' target='_blank' href='"+targets[i].href+"'>"+targets[i].name+"</a>");

  tmp_div_header.attr("index",i);

  tmp_div_content.append(tmp_div_header);

  var tmp_div_iframe = $("<iframe>",{id: "iframe_"+i, name:targets[i].name}).css({
  //var tmp_div_iframe = $("<div>").css({
    width:"100%",
    height:(window_height-tmp_div_header.height())+"px",
    background: "white"
  });

  tmp_div_iframe.attr("index",i);
  tmp_div_iframe.attr("src",content.href+iframetrue);

  tmp_div_content.append(tmp_div_iframe);


  var tmp_div_cover = $("<div>",{class:"content_cover"}).css({
    position:"absolute",
    top:"0px",
    left:"0px",
    background:"rgba(0,0,0,0.2)"
  });

  tmp_div_cover.attr("index",i);

  tmp_div_cover.click(function(){
    //console.log("clicked on "+$(this).attr("index"));
    set_focus($(this).attr("index"));
    set_center_panel($(this).attr("index"));
    $("#panel").hide();
    $("#search").show();
  });

  element.append(tmp_div_content).append(tmp_div_cover);

}

function set_focus(i){

  selected_i = i;

  $(".content_wrapper").each(function(){
      if ($(this).attr("index")==i){
        $(this).find(".content_cover").hide();
        $(this).find(".content_header").css({
          //background: "rgba(0,0,0,0.7)"
          background: targets[$(this).attr("index")].color
        });
      }else{
        $(this).find(".content_cover").show();
        $(this).find(".content_header").css({
          //background: "rgba(0,0,0,0.3)"
          background: targets[$(this).attr("index")].color
        });
      }
  });

  update_frames();

  document.getElementById("iframe_"+i).contentWindow.postMessage({loadsubiframes:true},"*");

}

function set_center_panel(i){
  $(".target_contents").fadeTo(0,0.5);

  $(".target_contents").each(function(){
    if ($(this).attr("index")==i){
      $(this).fadeTo("fast",1);
    }
  });
}

function parseURL(){

  cols = 5;
  //custom_url = "";

  var parameters=location.href.replace(/\?/ig,"&").split("&");
  for (var i=0;i<parameters.length;i++) parameters[i]=parameters[i].split("=");

  for (var i=1;i<parameters.length;i++) {
    switch (parameters[i][0]) {
      case "columns": cols = parseInt(parameters[i][1]);break;
      case "order"  : order = parameters[i][1].split(",");break;
      case "vstep"  : base_vstep = parseInt(parameters[i][1]);break;
      case "url"    : custom_url = parameters[i][1];break;
    }
  }
}
