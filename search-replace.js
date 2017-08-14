/* Search & replace box for the Jupyter notebook
   
   Adds a search box to the notebook toolbar; it can search (or search and 
   replace) over all cells of the notebook.
   Search initializes with the current selection, and in the current cell.
   Search can be case-sensitive or insensitive, and it can optionally wrap
   around the notebook.

   Originally based on the Search&Replace extension at:
    https://github.com/ipython-contrib/IPython-notebook-extensions/wiki/Search-&-Replace
*/

define([
  'base/js/namespace',
  'jquery',
  'require',
  'codemirror/addon/search/search',
  'codemirror/addon/search/searchcursor'
],   function(IPython, $, require) {
  "use strict";

  /**
   * The function carrying out the search loop across all cells
   * @returns {boolean}
   */
  var search_loop = function( findString, replace, caseInsensitive, do_wrap ) {

    // See which cell is currently selected
    var ncells = IPython.notebook.ncells();
    var cindex = IPython.notebook.get_selected_index();
    var cell = IPython.notebook.get_cell( cindex );
    var is_rendered = (cell.cell_type == "markdown") && (cell.rendered == true);

    // If we're replacing, and there's already a selected match, replace it
    if( replace ) {
	var s = cell.code_mirror.getSelection();
	if( s &&
	    ( (!caseInsensitive && s==findString) ||
	      (caseInsensitive && s.toUpperCase()==findString.toUpperCase())) )
	    cell.code_mirror.replaceSelection(replace,'around');
    }

    // Search across all cells in the notebook, starting from the current one
    for( var i=1; i<=ncells; i++ ) {

      // Unrender Markdown cells
      if( is_rendered )
	cell.unrender();

      // Search inside this cell, from the cursor current position
      var cur = cell.code_mirror.getCursor();
      var find = cell.code_mirror.getSearchCursor(findString,cur,caseInsensitive);
      if( find.find() == true ) {
	// found! Select it and return
	IPython.notebook.scroll_cell_percent( cindex, 50 );
	cell.code_mirror.setSelection(find.pos.from,find.pos.to);
	cell.code_mirror.focus();
	return true;
      }
      // Not found in this cell. Go to the next one

      // Erase the current selection
      if( cell.code_mirror.somethingSelected() )
	cell.code_mirror.setCursor( {line:0, ch:0} );

      // Render Markdown cells again
      if( is_rendered )
	cell.render();

      // Find the next cell
      if( cindex < ncells-1 )
	cindex++;
      else if( do_wrap )
	cindex = 0;
      else
	break; // Not found in the whole notebook. We're done

      // Prepare the next cell for searching
      cell = IPython.notebook.get_cell( cindex );
      is_rendered = (cell.cell_type == "markdown") && (cell.rendered == true);
      IPython.notebook.select( cindex );
      IPython.notebook.edit_mode();
      cell.code_mirror.setCursor( {line:0, ch:0} );
    }

    cell.code_mirror.setCursor( {line:0, ch:0} );
    cell.code_mirror.focus();
    return false;
  };


  /**
   * Search/replace a string within the complete notebook, starting at 
   * current cell or CodeMirror selection. 
   * This is the function to be called when the user clicks on the search/replace 
   * icon, or presses Return on the search box
   * @param hotkey {integer}
   * @param replace {boolean}
   * @returns {boolean}
   */
  var search = function(hotkey,replace) {
    /* execute search operation only after button click or Return key  */
    if (hotkey != null && hotkey != 13) {
      return false;
    }

    // Get form fields
    var box = $('#searchbar-wrapper');
    var button1 = $('#searchbar_search');
    var button2 = $('#searchbar_replace');
    if( replace )
      replace = $('#searchbar_replace_text').val();
    var findString = $('#searchbar_search_text').val();
    var caseInsensitive = ! $('#searchbar_case_sensitive').hasClass('active');
    var do_wrap = $('#searchbar_wrap').hasClass('active');

    // Signal the start of the search
    box.removeClass( 'notfound' ).addClass( 'searching' );
    button1.removeClass( 'notfound searching' );
    button2.removeClass( 'notfound searching' );
    var button = $( replace ? button2 : button1 )
    button.addClass( 'searching' );

    // We use setTimeout to add the search process to the event loop, and therefore
    // leave time for the main thread to render the CSS class changes in the DOM
    setTimeout( function() {
      // Search across all cells in the notebook, starting from the current one
      var found = search_loop(findString, replace, caseInsensitive, do_wrap);
      // Signal the end of the search
      box.removeClass( 'searching' );
      button.removeClass( 'searching' );
      if( !found ) {
	button.addClass( 'notfound' );
	box.addClass('notfound');
      }
    }, 50 );

  };


  /**
   * Create floating toolbar
   */
  var create_searchbar_div = function () {
    var btn = '<div class="btn-toolbar">\
                    <div class="btn-group">\
                    <label for="usr">Search text:</label>\
                     <input id="searchbar_search_text" type="text" class="form-control searchbar_input">\
                     <button id="searchbar_wrap" class="btn btn-primary fa fa-level-up searchbar_buttons" data-toggle="button" value="OFF" title="wrap search"></button>\
                     <button id="searchbar_case_sensitive" class="btn btn-primary searchbar_buttons" data-toggle="button" value="OFF" title="case sensitive search">aA</button>\
                     <button id="searchbar_search" class="btn btn-primary fa fa-search searchbar_buittons" title="find next"></button>\
                   </div>\
                    <div class="btn-group">\
                    <label for="usr">Replace text:</label>\
                     <input id="searchbar_replace_text" type="text" class="form-control searchbar_input">\
                     <button type="button" id="searchbar_replace" class="btn btn-primary fa fa-search-plus searchbar_buttons" title="replace and find next"></button>\
                   </div>\
                 </div>';

    var searchbar_wrapper = $('<div id="searchbar-wrapper"/>')
    //.text("Searchbar")
      .append(btn)
      .draggable()
      .css( {'position' : 'absolute'} );
      //.append("</div>");

    $("#header").append(searchbar_wrapper);
    //$("#searchbar-wrapper").css({'position' : 'absolute'});

    // Click events
    $('#searchbar_search').on('click', function() { search(null,false); this.blur(); })
      .tooltip( {show: 500, hide: 100} );
    $('#searchbar_case_sensitive').on('click', function() {  this.blur(); })
      .tooltip( {show: 500, hide: 100} );
    $('#searchbar_wrap').on('click', function() {  this.blur(); })
      .tooltip( {show: 500, hide: 100} );
    $('#searchbar_replace').on('click', function() { search(null,true); this.blur(); })
      .tooltip( {show: 500, hide: 100} );

    // Key events
    $('#searchbar_search_text').on('keyup', 
				   function(event) { 
				     $('#searchbar_search').removeClass('notfound searching');
				     search(event.keyCode,false); 
				   }
				  );
    $('#searchbar_replace_text').on('keyup', 
				    function(event) { 
				      search(event.keyCode,true);
				    } 
				   );
    IPython.notebook.keyboard_manager.register_events($('#searchbar_search_text'));
    IPython.notebook.keyboard_manager.register_events($('#searchbar_replace_text'));
    return searchbar_wrapper;
  };


  /**
   * Show/hide toolbar
   */
  var toggle_toolbar = function() {
    // Show/hide the search toolbar
    var dom = $("#searchbar-wrapper");
    if( dom.length === 0 ) {
      dom = create_searchbar_div()
    } else if( dom.is(':visible') ) {
      $('#toggle_searchbar').removeClass('active').blur();
      dom.hide();
    } else {
      $('#toggle_searchbar').addClass('active');
      $('#searchbar_replace').removeClass( 'notfound' );
      $('#searchbar_search').removeClass( 'notfound' );
      dom.removeClass('searching notfound');
      dom.show();
    }

    // If there is a selection, add it as an initial search string
    var sel =  IPython.notebook.get_selected_cell().code_mirror.getSelection();
    if( sel.length ) {
      $('#searchbar_search_text').val( sel );
      $('#searchbar_replace').removeClass( 'notfound' );
      $('#searchbar_search').removeClass( 'notfound' );
    }
  };


  // Add the toggle button to the Notebook toolbar
  IPython.toolbar.add_buttons_group([
     {
       id : 'toggle_searchbar',
       label : 'Toggle Search Toolbar',
       icon : 'fa-search',
       callback : function () {
         toggle_toolbar();
         $('#searchbar_search_text')
       }
     }
  ]);
  $("#toggle_searchbar").css( {'outline' : 'none'} );


  /**
   * Add a CSS file
   * @param name filename
   */
  var load_css = function (name) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = require.toUrl(name);
    document.getElementsByTagName("head")[0].appendChild(link);
  };


  /**
   * Initialize extension
   */
  var load_ipython_extension = function() {
    load_css('./search-replace.css');

    /* Add keyboard shortcuts for search and replace.
     * Hardcoded for now, should be configurable
     */
    var shortcuts = {
      'f' : {
        help    : 'search',
        help_index : 'se',
        handler : function() {
          if (!$('#toggle_searchbar').hasClass('active')) {
            toggle_toolbar();
          }
          $('#searchbar_search_text').focus();
          return false;
        }
      },
      'Shift-f' : {
        help    : 'replace',
        help_index : 're',
        handler : function() {
          if (!$('#toggle_searchbar').hasClass('active')) {
            toggle_toolbar();
          }
          $('#searchbar_replace_text').focus();
          return false;
        }
      }
    };

    //IPython.keyboard_manager.command_shortcuts.add_shortcuts(shortcuts);
    var action = 
      IPython.keyboard_manager.actions.register(shortcuts['Shift-f'],
						'search-and-replace',
						'notebook-extensions');
    IPython.keyboard_manager.command_shortcuts.add_shortcut('Shift-f', action);
    var action = 
      IPython.keyboard_manager.actions.register(shortcuts['f'],
						'search',
						'notebook-extensions');
    IPython.keyboard_manager.command_shortcuts.add_shortcut('f', action);

  };

  return {
    load_ipython_extension : load_ipython_extension
  };
});
