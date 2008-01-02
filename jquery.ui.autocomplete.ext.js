/*
 * UI Autocomplete - jQuery plugin 0.0.1
 *
 * Copyright (c) 2007 Yehuda Katz, Rein Henrichs
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {
  $.ui = $.ui || {};
  $.ui.autocomplete = $.ui.autocomplete || {};
  $.ui.autocomplete.ext = $.ui.autocomplete.ext || {};
  
  $.ui.autocomplete.ext.ajax = function(opt) {
    var ajax = opt.ajax;
    return { getList: function(input) { 
      $.getJSON(ajax, "val=" + input.val(), function(json) { input.trigger("updateList", [json]); }); 
    } };
  };
  
  $.ui.autocomplete.ext.templateText = function(opt) {
    var template = $.makeTemplate(opt.templateText, "<%", "%>");
    return { template: function(obj) { return template(obj); } };
  };
  
})(jQuery);
