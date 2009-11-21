/* jQuery Autocomplete
 * Version 1.1 (07/10/2009)
 * Written by Yehuda Katz (wycats@gmail.com) and Rein Henrichs (reinh@reinh.com)
 * Forked and maintained by Nikos Dimitrakopoulos (os@nikosd.com)
 * Additional contributions from Emmanuel Gomez, Austin King
 * @requires jQuery v1.2, jQuery dimensions plugin
 *
 * Copyright 2007-2009 Yehuda Katz, Rein Henrichs
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * @description Form autocomplete plugin using preloaded or Ajax JSON data source
 *
 * @example $('input#user-name').autocomplete({list: ["quentin", "adam", "admin"]})
 * @desc Simple autocomplete with basic JSON data source
 *
 * @example $('input#user-name').autocomplete({ajax: "/usernames.js"})
 * @desc Simple autocomplete with Ajax loaded JSON data source
 *
 */
(function($) {

  $.ui = $.ui || {};
  $.ui.autocomplete = $.ui.autocomplete || {};
  var active = {};

  var KEY = {
    ESC: 27,
    RETURN: 13,
    TAB: 9,
    BS: 8,
    DEL: 46,
    UP: 38,
    DOWN: 40
  };

  $.fn.autocomplete = function(opt) {

    /* Default options */
    opt = $.extend({}, {
      timeout: 500,
      threshold: 100,
      getList: function(input) { input.triggerHandler("updateList", [opt.list]); },
      filterList: function(list, val) {
        var matcher = opt.matcher(val);
        return $(list).filter(function() {
          return opt.match.call(this, matcher);
        });
      },
      buildList: function(list){
        var listItems = $(list).map(function() {
          var node = $(opt.template(this))[0];
          $.data(node, "originalObject", this);
          return node;
        });
        var container = listItems.wrapAll(opt.wrapper).parents(":last").children();
        // IE seems to wrap the wrapper in a random div wrapper so
        // drill down to the node in opt.wrapper.
        var wrapperTagName = $(opt.wrapper)[0].tagName;
        while (container[0].tagName !== wrapperTagName) {
          container = container.children(':first');
        }
        return container;
      },
      updateList: function(unfilteredList, val) {
        var list = filterList(unfilteredList, val);
        if(list.length == 0 || list.length > opt.threshold) return false;
        return buildList(list);
      },
      displayList: function(input, container) {
        var offset = input.offset();
        container
          .css({
            top: offset.top + input.outerHeight(),
            left: offset.left,
            width: input.width()
          })
          .appendTo("body");
        return container;
      },
      dismissList: function(container) {
        container.remove();
      },
      template: function(str) { return "<li>" + opt.insertText(str) + "</li>"; },
      insertText: function(str) { return str; },
      match: function(regex) { return this.match(regex); },
      matcher: function(typed) { return new RegExp(typed); },
      wrapper: "<ul class='jq-ui-autocomplete'></ul>"
    }, opt);

    /* 
     * Additional options from autocomplete.ext (for example 'ajax', and 'templateText') 
     * if these options where passed in the opt object and the $.ui.autocomplete.ext is present.
    */
    if($.ui.autocomplete.ext) {
      for(var ext in $.ui.autocomplete.ext) {
        if(opt[ext]) {
          opt = $.extend(opt, $.ui.autocomplete.ext[ext](opt));
          delete opt[ext];
        }
    } }

    function preventTabInAutocompleteMode(e) {
      var k = e.which || e.keycode;
      if ($.data(document.body, "autocompleteMode") && k == KEY.TAB) {
        e.preventDefault();
      }
    }
    
    function startTypingTimeout(e, element) {
      $.data(element, "typingTimeout", window.setTimeout(function() {
        $(e.target || e.srcElement).triggerHandler("autocomplete");
      }, opt.timeout));
    }

    return this.each(function() {
      $(this)
        .keydown(function(e) {
          preventTabInAutocompleteMode(e);
        })
        .keyup(function(e) {
          var k = e.which || e.keycode;
          if (!$.data(document.body, "autocompleteMode") &&
              (k == KEY.UP || k == KEY.DOWN) &&
              !$.data(this, "typingTimeout")) {
            startTypingTimeout(e, this);
          } else {
            preventTabInAutocompleteMode(e);
          }
        })
        .keypress(function(e) {
          var typingTimeout = $.data(this, "typingTimeout");
          var k = e.keyCode || e.which; // keyCode == 0 in Gecko/FF on keypress
          if(typingTimeout) window.clearInterval(typingTimeout);

          if($.data(document.body, "suppressKey")) {
            return $.data(document.body, "suppressKey", false);
          } else if($.data(document.body, "autocompleteMode") && k < 32 && k != KEY.BS && k != KEY.DEL) {
            return false;
          } else if (k == KEY.BS || k == KEY.DEL || k > 32) { // more than ESC and RETURN and the like
            startTypingTimeout(e, this);
          }
        })
        .bind("autocomplete", function() {
          var self = $(this);

          self.one("updateList", function(e, list) {
            var container = opt.updateList(list, self.val());
            if (container === false) return false;
            list = container.find("li");

            $("body").triggerHandler("off.autocomplete");
            if(!list.length || list.length > opt.threshold) return false;

            opt.container = opt.displayList(self, container);

            $("body").autocompleteMode(opt.container, self, list.length, opt);
          });

          opt.getList(self);
        });
    });
  };

  $.fn.autocompleteMode = function(container, input, size, opt) {
    var original = input.val();
    var selected = -1;
    var self = this;

    $.data(document.body, "autocompleteMode", true);

    $("body").one("cancel.autocomplete", function() {
      input.triggerHandler("cancel.autocomplete");
      $("body").triggerHandler("off.autocomplete");
      input.val(original);
    });

    $("body").one("activate.autocomplete", function() {
      // Try hitting return to activate autocomplete and then hitting it again on blank input
      // to close it.  w/o checking the active object first this input.triggerHandler() will barf.
      active && input.triggerHandler("activate.autocomplete", [$.data(active[0], "originalObject"), active]);
      $("body").triggerHandler("off.autocomplete");
    });

    $("body").one("off.autocomplete", function(e, reset) {
      opt.dismissList(container);
      $.data(document.body, "autocompleteMode", false);
      input.unbind("keydown.autocomplete");
      $("body").add(window)
        .unbind("click.autocomplete")
        .unbind("cancel.autocomplete")
        .unbind("activate.autocomplete");
    });

    // If a click bubbles all the way up to the window, close the autocomplete
    $(window).bind("click.autocomplete", function() {
      $("body").triggerHandler("cancel.autocomplete");
    });

    var select = function() {
      active = container.find("li")
        .removeClass("active")
        .filter(":visible")
        .slice(selected, selected + 1)
        .addClass("active");
      if (active.length) {
        input.triggerHandler("itemSelected.autocomplete", [$.data(active[0], "originalObject"), active]);
        input.val(opt.inputText($.data(active[0], "originalObject")));
      }
    };

    container
      .mouseover(function(e) {
        // If you hover over the container, but not its children, return
        if(e.target == container[0]) return;
        var selectedItem = $(e.target).is('li') ? $(e.target)[0] : $(e.target).parents('li')[0];
        // Set the selected item to the item hovered over and make it active
        selected = container.find("li").index(selectedItem);
        select();
      })
      .bind("click.autocomplete", function(e) {
        $("body").triggerHandler("activate.autocomplete");
        $.data(document.body, "suppressKey", false);
      });

    input
      .bind("keydown.autocomplete", function(e) {
        var k = e.which || e.keyCode; // in IE e.which is undefined

        switch(k) {
          case KEY.ESC:
            $("body").triggerHandler("cancel.autocomplete");
            break;
          case KEY.TAB:
            if (selected == -1){
              selected = selected >= size - 1 ? 0 : selected + 1;
              select();
            } // fall through to KEY.ENTER case
          case KEY.RETURN:
            $("body").triggerHandler("activate.autocomplete");
            break;
          case KEY.DOWN:
            selected = selected >= size - 1 ? 0 : selected + 1;
            select();
            break;
          case KEY.UP:
            selected = selected <= 0 ? size - 1 : selected - 1;
            select();
            break;
          default:
            return true;
        }

        $.data(document.body, "suppressKey", true);
      });
  };

})(jQuery);
