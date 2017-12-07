/* Table of Contents box for Jupyter Notebook

   Generates automatically a ToC box from the Notebook Markdown headings.
   Will provide automatic numbering for ToC items in nested form
   (X.Y.Z) *except* if the headings already contain numbering, in
   which case it will simply use that. All headings must be numbered
   as X.Y.Z for autonumbering to be switched off, except level 1
   headings, which are ignored (so that a Document-level heading need
   not be numbered).

   Modified from https://github.com/minrk/ipython_extensions (which in turn is
   adapted from https://gist.github.com/magican/5574556)
*/   

define( [
  "base/js/namespace",
  "jquery", 
  "require", 
], function (Jupyter, $, require) {

  "use strict";

  // Create the ToC box
  var create_toc_div = function () {
    var toc_wrapper = $('<div id="toc-wrapper"/>')
    .append(
      $("<div/>")
      .addClass("header")
      .text("Contents ")
      .click( function(){
        $('#toc').slideToggle();
        $('#toc-wrapper').toggleClass('closed');
        if ($('#toc-wrapper').hasClass('closed')){
          $('#toc-wrapper .hide-btn')
          .text('[+]')
          .attr('title', 'Show ToC');
        } else {
          $('#toc-wrapper .hide-btn')
          .text('[-]')
          .attr('title', 'Hide ToC');
        }
        return false;
      }).append(
        $("<a/>")
        .attr("href", "#")
        .addClass("hide-btn")
        .attr('title', 'Hide ToC')
        .text("[-]")
      ).append(
        $("<a/>")
        .attr("href", "#")
        .addClass("reload-btn")
        .text("  \u21BB")
        .attr('title', 'Reload ToC')
        .click( function(){
          table_of_contents();
          return false;
        })
      )
    ).append(
        $("<div/>").attr("id", "toc")
    );
    //toc_wrapper.hide();
    $("#site").append(toc_wrapper);
  };

  // Compute the ToC
  var table_of_contents = function (threshold) {
    if (threshold === undefined)
      threshold = 4;
    var toc_wrapper = $("#toc-wrapper");
    if (toc_wrapper.length === 0)
      create_toc_div();
  
    // Traverse all headings, check if they are numbered and collect data
    var numreg = /^\d[.\d]*\s/;
    var hasNumbers = true;
    var hdrList = new Array();
    $("#notebook").find(":header").map( function(i,h) {
      var hLevel = parseInt( h.nodeName.substring(1) );
      var hTitle = $(h).contents().filter( function() {return this.nodeType==3;} ).text();
      if( hLevel > 1 )	// we ignore if <H1> has numbers or not
	hasNumbers &= numreg.test( hTitle );
      hdrList.push( [ hLevel, h.id, hTitle ] );
      //alert( [i,hLevel,h.tagName,h.id,hTitle,numreg.test(hTitle)].join('|') );
    } );
    //alert( hdrList.toString() + " : " +  hasNumbers );

    // Decide if we will use numbered or number-less lists
    var listClass = hasNumbers ? 'toc-item-noc' : 'toc-item';

    // Initialize the container with the first level
    var ol = $("<ol/>");
    ol.addClass( listClass );
    $("#toc").empty().append(ol);

    // Loop through all the collected headers and create the ToC
    var depth = 1;
    var li;
    for( var idx=0; idx<hdrList.length; idx++ ) {
      var hdr = hdrList[idx];
      var level = hdr[0];
      // skip below threshold, or headings with no ID to link to
      if (level > threshold || !hdr[1])
	continue;
      // walk down levels
      for (; depth < level; depth++) {
        if( !li ) // a missing 1st level
	    li = ol.add("<li/>");
	ol = $("<ol/>").addClass(listClass).appendTo(li);
      }
      // walk up levels
      for (; depth > level; depth--) {
	// up twice: the enclosing <ol> and the <li> it was inserted in
        ol = ol.parent().parent();
      }
      // insert the ToC element
      var a = $("<a/>").attr( "href", '#'+hdr[1] ).text( hdr[2] );
      li = $("<li/>").append( a ).appendTo( ol );
    }

    $(window).resize( function(){
      $('#toc').css({maxHeight: $(window).height() - 200});
    } );
    $(window).trigger('resize');
  };
    
  // Toggle ToC box on/off
  var toggle_toc = function () {
    // toggle draw (first because of first-click behavior)
    $("#toc-wrapper").toggle();
    // recompute:
    table_of_contents();
  };
  
  // Load a CSS file
  var load_css = function ( filename  ) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = require.toUrl(filename);
    document.getElementsByTagName("head")[0].appendChild(link);
  };

  var action = {
      'help'       : 'Table of contents',
      'help_index' : 'toc',
      'icon'       : 'fa-list',
      'id'         : 'toc_button',
      'handler'    : toggle_toc
  };

  // Define the keyboard shortcut
  var kb_shortcuts = { 't' : action };

  // Install the extension
  var load_extension = function () {
    load_css("./toc.css");
    $([Jupyter.events]).on("notebook_saved.Notebook", table_of_contents);

    var full_action = Jupyter.notebook.keyboard_manager.actions.register(action,
           'table-of-contents', 'toc');
    Jupyter.toolbar.add_buttons_group([full_action]);
    Jupyter.keyboard_manager.command_shortcuts.add_shortcut('t', full_action);
  };

  return {
    load_ipython_extension : load_extension,
    load_jupyter_extension : load_extension,
    toggle_toc : toggle_toc,
    table_of_contents : table_of_contents,    
  };

});
