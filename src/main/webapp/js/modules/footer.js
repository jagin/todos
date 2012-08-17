define([
    // Libs
	"namespace",
	"text!templates/footer.html",
	"modules/todos",
	"backbone", 
    "marionette",
	"jquery",
	"underscore"
],

function(namespace, footerTemplate, TodosModule, Backbone, Marionette, $, _) {
	
	// Shorthand the application namespace
    var app = namespace.app;

	// Create a module to hide our private implementation details 
	app.module("Footer", function(Footer, app, Backbone, Marionette, $, _, namespace, footerTemplate, TodosModule){ 

		// Private Data And Functions
		// --------------------------
		
		// Compile our header template 
		var footerTemplate = _.template(footerTemplate);

		
		// Public Data And Functions
		// -------------------------
		
		// Stats view. This is the stats at the bottom of the todo list,
		// where you can see how many are lef to be done, and clear the
		// list of completed items.		
		Footer.FooterView = Marionette.ItemView.extend({
			template: footerTemplate,
			
			events: {
				"click #clear-completed": "clearCompleted"
			},
			
		    initialEvents: function(){
				this.bindTo(this.collection, "change", this.render);
				this.bindTo(this.collection, "remove", this.render);
				this.bindTo(this.collection, "reset", this.render);
			},
			
			initialize: function() {				
				app.vent.on("todos:filterChanged", this.render, this);
			},
			
			// Providing custom serialization for our stats view data.
			serializeData: function(){
				return {
					completed:  this.collection.completed().length,
					remaining:  this.collection.remaining().length,
				}
			},
			
			onRender: function(){
				var $footer = $("#footer");
				if(this.collection.length) {
					if(!$footer.is(":visible")) {
						$footer.show();
					}
				    this.$('#filters li a')
						.removeClass('selected')
						.filter("[href='#/" + (namespace.todoFilter || "") + "']")
						.addClass('selected');					
				} else {
					$footer.hide();
				}
			},

			// Clear all completed todo items, destroying their models.
			clearCompleted: function() {
				app.vent.trigger("todos:clearCompleted");
			}			
		});
		
		// Helpers
		// -------

		// The primary object to get the actual header of the ground 
		// and running.
		var footer = {	

			initialize: function(todoCollection){
				var footerView = this.getFooterView(todoCollection);
				app.footer.show(footerView);
			},

			getFooterView: function(todoCollection){
				var footerView = new Footer.FooterView({
					collection: todoCollection
				});
				return footerView;
			}
		};

		// Initializer
		// -----------
		
		// Initializers run when the `app.start()` method is called
		app.addInitializer(function(){
			var todoCollection = TodosModule.getAllTodoCollection();
			footer.initialize(todoCollection);
		});
	
 	}, namespace, footerTemplate, TodosModule);
	
	// Required, return the module for AMD compliance
	return app.Footer;

});
