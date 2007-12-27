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
  $.ui.autocomplete = {};
  
  $.fn.autocomplete = function(options) {
  
    $.extend({
      timeout: 1000,
      list: []
    }, options);
  
    return this.each(function() {
  
      $(this)
        .keypress(function(e) {
          var typingTimeout = $.data(this, "typingTimeout");
          if(typingTimeout) window.clearInterval(typingTimeout);
          $.data(this, "typingTimeout", setTimeout(function() { 
            $(e.target).trigger("autocomplete"); 
          }), options.timeout);
        })
        .bind("autocomplete", function() {
          // autocomplete code here
        });

    });
  };
  
})(jQuery);