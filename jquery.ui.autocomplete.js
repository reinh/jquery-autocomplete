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
    var self = this;
    $.data(document.body, "autocompleteMode", true);
  
    var autocompleteModeOff = function(reset) {
      if(reset) input.val(original);
      container.remove();
      $.data(document.body, "autocompleteMode", false);
      $.data(document.body, "suppressKey", true);
      input.unbind("blur.autocomplete").unbind("keydown.autocomplete");
    };
    
    input
      .bind("blur.autocomplete", function() { autocompleteModeOff(true); })
      .bind("keydown.autocomplete", function(e) {
        if(e.which == 27) {  autocompleteModeOff(true); }
        else if(e.which == 13) { autocompleteModeOff(); }
        else if(e.which == 40 || e.which == 9 || e.which == 38) {
          switch(e.which) {
            case 40: 
            case 9:
              selected = selected >= size - 1 ? 0 : selected + 1; break;
            case 38:
              selected = selected <= 0 ? size - 1 : selected - 1;
          }
          var active = $("> *", container).removeClass("active")
            .slice(selected, selected + 1).addClass("active");
          input.val(active.html());
        }
        if(e.which == 9) $.data(document.body, "suppressKey", true);
      });
  };
  
  $.fn.autocomplete = function(opt) {
    
    opt = $.extend({}, {
      timeout: 1000,
      getList: function() { return opt.list; },
      template: function(str) { return "<li>" + str + "</li>"; },
      match: function(typed) { return !!this.match(new RegExp(typed)); },
      wrapper: "<ul class='jq-ui-autocomplete'></ul>"
    }, opt);
  
    return this.each(function() {
  
      $(this)
        .keypress(function(e) {
          var typingTimeout = $.data(this, "typingTimeout");
          if(typingTimeout) window.clearInterval(typingTimeout);
          
          if($.data(document.body, "suppressKey"))
            return $.data(document.body, "suppressKey", false);
          else if($.data(document.body, "autocompleteMode")) return;          
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
          
          if(!list.length) return false;
          
          var container = $(list.join("")).wrapAll(opt.wrapper).parents(":last").children();
            
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