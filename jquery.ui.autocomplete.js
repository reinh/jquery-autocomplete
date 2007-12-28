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
    
    options = $.extend({}, {
      timeout: 1000,
      getList: function() { return options.list; },
      template: function(str) { return "<li>" + str + "</li>"; },
      match: function(typed) { return !!this.match(new RegExp(typed)); },
      wrapper: "<ul></ul>"
    }, options);
  
    return this.each(function() {
  
      $(this)
        .keypress(function(e) {
          var typingTimeout = $.data(this, "typingTimeout");
          if(typingTimeout) window.clearInterval(typingTimeout);
          $.data(this, "typingTimeout", setTimeout(function() { 
            $(e.target).trigger("autocomplete"); 
          }, options.timeout));
        })
        .bind("autocomplete", function() {
          var self = this;
          var container = $(options.getList())
            .filter(function() { return options.match.call(this, $(self).val()); })
            .map(function() { return options.template(this); }).get();
          console.log(container);
        });

    });
  };
  
})(jQuery);