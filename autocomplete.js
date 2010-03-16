/**
 * Javascript for autocomplete.html
 */

jQuery(function($) {

	//Fake console in case we don't have a javascript console (firebug)
	if (typeof(window.console) == 'undefined'){
		window.console = { 
			log: function(msg) { 
				$('#log #updates').html(msg + '<br/>\n' + $('#log #updates').html() ); 
			} 
		};
		$("#log").show();
	}

		// Basic example
      var birds_list = ["Barred Antshrike", "Bananaquit", "Copper Rumped Hummingbird", "Whimbrel"];
      $("input.autocomplete.birds").autocomplete({
        list: birds_list
      });
			
		// Width example	
	$("input.autocomplete.birds2").autocomplete({
		list: birds_list,
		adjustWidth:false,
		wrapper: '<ul class="jq-ui-autocomplete mybigbirdlist"></ul>'
	});

		// Simple ajax example
	$("input.autocomplete.big-cats").autocomplete({
		ajax: "list",
		match: function(element, matcher) { 
			return element.text.match(matcher); 
		},
		insertText: function(obj) { 
			return obj.text; 
		},
		templateText: "<li>Available cats: <%= text %></li>"
	});

		// Advanced matching example
      var weird_names_list = [{text: 'Curious George'}, {text: 'George of the Jungle'}, {text: 'Felix the Cat'}];
	$("input.autocomplete.weird-names").autocomplete({
		list: weird_names_list,
		timeout: 0,
		matcher: function(typed) {
			if (!typed || typed.length === 0) {
				return undefined;
			}
			var reg = new RegExp("\\b" + typed, "i");
			reg.typed = typed;
			return reg;
		},
        match: function(element, matcher) {
					if (!matcher) { return false; }
					var typed = matcher.typed;
          element.typed = typed;
          element.pre_match = element.text;
          element.match = element.post_match = '';
          var match_at = element.text.search(matcher);
          if (match_at != -1) {
            element.pre_match = element.text.slice(0,match_at);
            element.match = element.text.slice(match_at,match_at + typed.length);
            element.post_match = element.text.slice(match_at + typed.length);
            return true;
          }
          return false;
        },
        insertText: function(obj) { return obj.text; },
        templateText: "<li><%= pre_match %><span class='matching' ><%= match %></span><%= post_match %></li>"
      });
	// Autocomplete with scrollbar
	$("input.autocomplete.scrollbardemo").autocomplete({
		list: cities,
		timeout: 100,
		threshold: 1000,
		wrapper: '<ul class="jq-ui-autocomplete scrollbardemo"></ul>'
	});
	// Console bindings
	$("input.autocomplete")
		.bind("activated.autocomplete", function(e, d) { console.log("activated.autocomplete: "+d); })
		.bind("cancelled.autocomplete", function(e) { console.log("Cancelled"); });
	
	// Put colors in the <pre><Code> for the code samples        
	prettyPrint();
});


