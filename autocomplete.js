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


      var birds_list = ["Barred Antshrike", "Bananaquit", "Copper Rumped Hummingbird", "Whimbrel"];
      $("input.autocomplete.birds").autocomplete({
        list: birds_list,
        timeout: 100
      });

      $("input.autocomplete.big-cats").autocomplete({
        ajax: "list",
        timeout: 500,
        threshold: 2,
        match: function(typed) { return this.text.match(new RegExp(typed, "i")); },
        insertText: function(obj) { return obj.text; },
        templateText: "<li>Available cats: <%= text %></li>"
      });

      var weird_names_list = [{text: 'Curious George'}, {text: 'George of the Jungle'}, {text: 'Felix the Cat'}];
      $("input.autocomplete.weird-names").autocomplete({
        list: weird_names_list,
        timeout: 0,
        match: function(typed) {
          this.typed = typed;
          this.pre_match = this.text;
          this.match = this.post_match = '';
          if (!this.ajax && !typed || typed.length == 0) { return true; }
          var match_at = this.text.search(new RegExp("\\b" + typed, "i"));
          if (match_at != -1) {
            this.pre_match = this.text.slice(0,match_at);
            this.match = this.text.slice(match_at,match_at + typed.length);
            this.post_match = this.text.slice(match_at + typed.length);
            return true;
          }
          return false;
        },
        insertText: function(obj) { return obj.text; },
        templateText: "<li><%= pre_match %><span class='matching' ><%= match %></span><%= post_match %></li>"
      });

      $("input.autocomplete")
        .bind("activated.autocomplete", function(e, d) { console.log(d); })
        .bind("cancelled.autocomplete", function(e) { console.log("Cancelled"); });
        
      prettyPrint();
});
