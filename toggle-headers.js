/* A button on the main menubar to toggle at the same time the header and
   the toolbar
   Paulo Villegas, 2015
*/

define( [
  'base/js/namespace',
  'jquery',
  'require'
], function(IPython, $, require) {

  "use strict";

  /**
   * Show/hide header + toolbar
   */
  var toggle_headers = function() {
    var btn = $('#toggle_headers').find('i');
    if( btn.hasClass('fa-minus-square') )
      btn.removeClass('fa-minus-square').addClass('fa-plus-square');
    else
      btn.removeClass('fa-plus-square').addClass('fa-minus-square');
    // taken from static/notebook/js/menubar.js
    $('#header-container').toggle();
    $('.header-bar').toggle();
    $('div#maintoolbar').toggle();
    // taken from static/base/js/page.js
    $('div#site').height(window.innerHeight - $('#header').height());
  };

  // Create the menubar button
  var menubar_button = function() {
    //alert( "parent: " + el.parentNode.className );
    var b2 = $("<i/>").addClass('fa-minus-square fa');
    var btn = $('<button/>').addClass("btn btn-default").attr('id','toggle_headers').attr('title','toggle headers').click(toggle_headers).append(b2);
    btn.insertAfter( $("#kernel_indicator") );
  };


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

  // A keyboard shortcut
  var kbd_shortcuts = {
    'Shift-t' : {
      help    : 'Toggle headers',
      help_index : 'th',
      handler : toggle_headers
    }
  };

  /**
   * Initialize extension
   */
  var load_ipython_extension = function() {
    load_css('./toggle-headers.css');
    menubar_button();
    IPython.keyboard_manager.command_shortcuts.add_shortcuts(kbd_shortcuts);
  };

  return {
    load_ipython_extension : load_ipython_extension
  };
});
