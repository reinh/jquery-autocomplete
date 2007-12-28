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
  
  $.fn.autocompleteMode = function(container, input, size) {
    var original = input.val();
    var selected = -1;
    
    input
      .blur(function() { container.remove(); $("body").unbind("keydown.autocomplete"); })
      .keydown(function(e) {
        if(e.which == 27) { 
          input.val(original); 
          container.remove();
          return false;
        } else if(e.which == 13) { 
          container.remove(); 
          return false;
        } else if(e.which == 40 || e.which == 9 || e.which == 38) {
          switch(e.which) {
            case 40: 
            case 9:
              selected = selected >= size - 1 ? 0 : selected + 1; break;
            case 38:
              selected = selected <= 0 ? size - 1 : selected - 1;
          }
          console.log(selected);
          var active = $("> *", container).removeClass("active")
            .slice(selected, selected + 1).addClass("active");
          input.val(active.html());
        }
        if(e.which == 9) return false;        
      })
      .keypress(function() {
        console.log("Hello");
      });
  };
  
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
          if($.data(this, "justCanceled")) $.data(this, "justCanceled", false);
          else {
            $.data(this, "typingTimeout", setTimeout(function() { 
              $(e.target).trigger("autocomplete"); 
            }, opt.timeout));
          }
        })
        .bind("autocomplete", function() {
          var self = $(this);
          var list = $(opt.getList())
            .filter(function() { return opt.match.call(this, self.val()); })
            .map(function() { return opt.template(this); }).get();
            
          var container = $(list.join("") || opt.template(opt.emptyList))
            .wrapAll(opt.wrapper).parents(":last").children();
            
          var offset = self.offset();
          if(opt.container) opt.container.remove();
          
          opt.container = container.css({
            top: offset.top + self.outerHeight(),
            left: offset.left,
            width: self.width()
          }).appendTo("body");
          
          $("body").autocompleteMode(container, self, list.length);
        });

    });
  };
  
})(jQuery);