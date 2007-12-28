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
  
  $.fn.autocomplete = function(opt) {
    
    opt = $.extend({}, {
      timeout: 1000,
      getList: function() { return opt.list; },
      template: function(str) { return "<li>" + str + "</li>"; },
      match: function(typed) { return !!this.match(new RegExp(typed)); },
      wrapper: "<ul class='jq-ui-autocomplete'></ul>",
      emptyList: "None"
    }, opt);
  
    return this.each(function() {
  
      $(this)
        .keypress(function(e) {
          var typingTimeout = $.data(this, "typingTimeout");
          if(typingTimeout) window.clearInterval(typingTimeout);
          $.data(this, "typingTimeout", setTimeout(function() { 
            $(e.target).trigger("autocomplete"); 
          }, opt.timeout));
        })
        .bind("autocomplete", function() {
          var self = $(this);
          var list = $(opt.getList())
            .filter(function() { return opt.match.call(this, self.val()); })
            .map(function() { return opt.template(this); }).get().join("");
            
          var container = $(list || opt.template(opt.emptyList))
            .wrapAll(opt.wrapper).parents(":last").children();
            
          var offset = self.offset();
          if(opt.container) opt.container.remove();
          
          opt.container = container.css({
            top: offset.top + self.outerHeight(),
            left: offset.left,
            width: self.width()
          }).appendTo("body");
        });

    });
  };
  
})(jQuery);