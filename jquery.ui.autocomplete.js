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
    
  $.fn.autocompleteMode = function(container, input, size) {
    var original = input.val();
    var selected = -1;
    var self = this;
    $.data(document.body, "autocompleteMode", true);

    $("body").one("autocompleteModeOff", function(e, reset, dontSuppress) {
      if(reset) input.val(original);
      container.remove();
      $.data(document.body, "autocompleteMode", false);
      if(!dontSuppress) $.data(document.body, "suppressKey", true);
      input.unbind("blur.autocomplete").unbind("keydown.autocomplete");
      $("body").unbind("click.autocomplete");
    });
    
    $(window).bind("click.autocomplete", function() { $("body").trigger("autocompleteModeOff", [true, true]); });
        
    var activate = function() {
      var active = $("> *", container).removeClass("active")
        .slice(selected, selected + 1).addClass("active");
      input.trigger("itemSelected", [$.data(active[0], "originalObject")]);            
      input.val(active.html());
    };
    
    container.mouseover(function(e) {
      if(e.target == container[0]) return;
      selected = $("> *", container).index(e.target);
      activate();
    }).click(function(e) { $("body").trigger("autocompleteModeOff", [false, true]); return false; });
    
    $("body")
      .bind("keydown.autocomplete", function(e) {
        if(e.which == 27) {  $("body").trigger("autocompleteModeOff", [true]); }
        else if(e.which == 13) { $("body").trigger("autocompleteModeOff"); }
        else if(e.which == 40 || e.which == 9 || e.which == 38) {
          switch(e.which) {
            case 40: 
            case 9:
              selected = selected >= size - 1 ? 0 : selected + 1; break;
            case 38:
              selected = selected <= 0 ? size - 1 : selected - 1;
          }
          activate();
        }
        if(e.which == 9) $.data(document.body, "suppressKey", true);
      });
  };
  
  $.fn.autocomplete = function(opt) {
    
    opt = $.extend({}, {
      timeout: 1000,
      getList: function(input) { input.trigger("updateList", [opt.list]); },
      template: function(str) { return "<li>" + str + "</li>"; },
      match: function(typed) { return !!this.match(new RegExp(typed)); },
      wrapper: "<ul class='jq-ui-autocomplete'></ul>"
    }, opt);

    if($.ui.autocomplete.ext)
      for(var ext in $.ui.autocomplete.ext) {
        var opt = $.extend(opt, $.ui.autocomplete.ext[ext](opt));
        delete opt[ext];
      }

    return this.each(function() {
  
      $(this)
        .keypress(function(e) {
          var typingTimeout = $.data(this, "typingTimeout");
          if(typingTimeout) window.clearInterval(typingTimeout);
          
          if($.data(document.body, "suppressKey"))
            return $.data(document.body, "suppressKey", false);
          else if($.data(document.body, "autocompleteMode") && e.which < 32) return;          
          else {
            $.data(this, "typingTimeout", setTimeout(function() { 
              $(e.target).trigger("autocomplete"); 
            }, opt.timeout));
          }
        })
        .bind("autocomplete", function() {
          var self = $(this);

          self.one("updateList", function(e, list) {
            var list = $(list)
              .filter(function() { return opt.match.call(this, self.val()); })
              .map(function() {
                var node = $(opt.template(this))[0];
                $.data(node, "originalObject", this);
                return node; 
              });
          
            if(!list.length) { $("body").trigger("autocompleteModeOff", [false, true]); return false; }
          
            var container = list.wrapAll(opt.wrapper).parents(":last").children();
            
            var offset = self.offset();
            if(opt.container) opt.container.remove();
          
            opt.container = container.css({
              top: offset.top + self.outerHeight(),
              left: offset.left,
              width: self.width()
            }).appendTo("body");
          
            $("body").autocompleteMode(container, self, list.length);
          });

          opt.getList(self);
        });

    });
  };
  
})(jQuery);