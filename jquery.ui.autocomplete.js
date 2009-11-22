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
      /**
       * Milliseconds after the last keystroke to (re-)filter the list
       */
      timeout: 500,
      /**
       * How many options are too many?
       * if there are more matches than threshold, the list will not be displayed
       */
      threshold: 100,
      /**
       * Get the complete list of items
       * override this to control how to get the list of potential matches
       * default is to use the 'list' option passed during initialization
       *  and trigger "updateList" event with list as data
       *
       * @param input the text input being autocompleted
       */
      getList: function(input) {
        input.triggerHandler("updateList", [opt.list]);
      },
      /**
       * Called to determine if a given data item matches the user's input
       *
       * @param _this_ data item being tested for match
       * @param _matcher_ regex to test the item with
       * @return boolean true if this data item matches user input
       */
      match: function(text, matcher) {
        return text.match(matcher);
      },
      /**
       * Called to build the matcher
       *
       * @param _typed_ the text entered by user in the text input
       * @return regex used to filter the complete list
       */
      matcher: function(typed) {
        return new RegExp(typed);
      },
      /**
       * Update the list of matching items
       * override this to control how the filtered list is generated from the complete list
       *
       * @param list complete list to be filtered
       * @param val text entered in the text input
       * @return filtered list with items that match _val_ (however matching is defined)
       */
      filterList: function(list, val) {
        var matcher = opt.matcher(val);
        return $.grep(list, function(text, i) {
          return opt.match(text, matcher);
        });
      },
      /**
       * Update the list of matching items
       * override this to control how markup is built from the list of matches
       *
       * @param unfilteredList unfiltered list of potential matches
       * @param val the text in the input field
       *
       * @return container (which should be positioned and visible)
       */
      updateList: function(unfilteredList, val) {
        var list = opt.filterList(unfilteredList, val);
        if(list.length == 0 || list.length > opt.threshold) return false;
        return opt.buildList(list);
      },
      /**
       * Build the list of matches
       * override this to control how markup is built from the list of matches
       * make sure the elements in the list have the matching object
       * in their $.fn.data as "originalObject"
       *
       * @param list list of items matching user input
       * @return container
       */
      buildList: function(list) {
        var listItems = $(list).map(function() {
          var node = $(opt.template(this))[0];
          $.data(node, "originalObject", this);
          return node;
        });
        // IE seems to wrap the wrapper in a random div wrapper so
        // drill down to the node in opt.wrapper.
        var container = $(opt.wrapper).append(listItems);// .parents(":last").children();
        // TODO: need to verify that parents(":last").children really does the below
        var wrapTag = $(opt.wrapper)[0].tagName;
        while (container[0].tagName !== wrapTag) {
          container = container.children(':first');
        }
        return container;
      },
      wrapper: "<ul class='jq-ui-autocomplete'></ul>",
      /**
       * Display the list of matches
       * override this to control the container position or size
       * or to skip appending the list to the html body
       *
       * @param input the text input being autocompleted
       * @param container the container of the list of matches (typically an ol/ul)
       *
       * @return container (which should be positioned and visible)
       */
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
      /**
       * Dismiss the list of matches
       * override this to control how the list container is dismissed
       * default is to remove the element
       *
       * @param container the container of the list of matches (typically an ol/ul)
       */
      dismissList: function(container) {
        container.remove();
      },
      template: function(str) { return "<li>" + opt.insertText(str) + "</li>"; },
      /**
       * Provide a value for the text input from the active object,
       * also used to fill the li element in the default _template_ implementation
       *
       * @param str active item in the list
       */
      insertText: function(item) { return item; }
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

    function  handleKeyDownUp(e) {
      var k = e.which || e.keycode;
      if ((k == KEY.UP || k == KEY.DOWN) && !$.data(this, "typingTimeout")) {
        startTypingTimeout(e, this);
      } else if (k == KEY.BS || k == KEY.DEL) {
        var typingTimeout = $.data(this, "typingTimeout");
        if (typingTimeout) window.clearInterval(typingTimeout);
        startTypingTimeout(e, this);
      } else {
        preventTabInAutocompleteMode(e);
      }
    }

    return this.each(function() {
      $(this)
        .keydown(handleKeyDownUp)
        .keyup(handleKeyDownUp)
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

          self.one("updateList", function(e, completeList) {
            var container = opt.updateList(completeList, self.val());
            // turn off autcomplete mode even if the list is empty (container === false)
            $("body").triggerHandler("off.autocomplete");
            if (container === false) return false;

            opt.container = opt.displayList(self, container);
            $("body").autocompleteMode(opt.container, self, container.find("li").length, opt);
          });

          opt.getList(self);
        });
      if (typeof opt.init == "function") opt.init(self);
    });
  };

  $.fn.autocompleteMode = function(container, input, size, opt) {
    var original = input.val();
    var selected = -1;
    var self = this;

    $.data(document.body, "autocompleteMode", true);

    $("body").one("cancel.autocomplete", function() {
      input.triggerHandler("cancelled.autocomplete");
      $("body").triggerHandler("off.autocomplete");
      input.val(original);
    });

    $("body").one("activate.autocomplete", function(e) {
      // Try hitting return to activate autocomplete and then hitting it again on blank input
      // to close it.  w/o checking the active object first this input.triggerHandler() will barf.
      if (active.length) {
        input.triggerHandler("activated.autocomplete", [$.data(active[0], "originalObject"), active]);
      }
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
        input.val(opt.insertText($.data(active[0], "originalObject")));
      } else {
        input.triggerHandler("noneSelected.autocomplete");
        input.val(original);
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
      // IE8 was triggering spurious activate events when clicking outside
      // the container when a list item was active. I couldn't figure out where
      // the activate events were coming from, so I'm deactivating the list
      .mouseout(function(e) {
        selected = -1;
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
