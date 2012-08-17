define([
    // Libs
	"namespace",
	"text!templates/header.html",
	"modules/todos",
	"backbone", 
    "marionette",
	"jquery",
	"underscore"
],

// Create a module to contain the Todo model and collection, 
// providing encapsulation of these concepts so that they can
// be used throughout the rest of the app.
function(namespace, headerTemplate, TodosModule, Backbone, Marionette, $, _) {
	
	// Shorthand the application namespace
    var app = namespace.app;

	// Create a module to hide our private implementation details 
	app.module("Header", function(Header, app, Backbone, Marionette, $, _, namespace, headerTemplate, TodosModule){ 

		// Private Data And Functions
		// --------------------------
		
		// Compile our header template 
		var headerTemplate = _.template(headerTemplate);

		
		// Public Data And Functions
		// -------------------------
		
		Header.HeaderView = Marionette.ItemView.extend({
			template: headerTemplate,
			
			// Delegated events for creating new items, and clearing completed ones.
			events: {
				"keypress #new-todo":  "createOnEnter",
			},
			
			ui: {
				input: "#new-todo"
			},

			// At initialization we bind to the relevant events on the `Todos`
			// collection, when items are added or changed. Kick things off by
			// loading any preexisting todos that might be saved in *localStorage*.
			initialize: function() {				
				this.on("create:todo", this.collection.create, this.collection);
			},

			// Generate the attributes for a new Todo item.
			newTodo: function() {
				return {
					title: this.ui.input.val().trim(),
					completed: false,
					order: TodosModule.getNextOrder()
				};
			},
			
			// If you hit return in the main input field, create new **Todo** model,
			// persisting it to *localStorage*.
			createOnEnter: function(e) {
			
				if ( e.keyCode !== namespace.ENTER_KEY ){
					return;
				}

				if ( !this.ui.input.val().trim() ){
					return;
				}

				this.trigger("create:todo", this.newTodo());

				this.ui.input.val('');
			},			
		});
		
		// Helpers
		// -------

		// The primary object to get the actual header of the ground 
		// and running.
		var header = {

			initialize: function(todoCollection){
				var headerView = this.getHeaderView(todoCollection);
				app.header.show(headerView);
			},

			getHeaderView: function(todoCollection){
				var headerView = new Header.HeaderView({
					collection: todoCollection
				});
				return headerView;
			}
		};

		// Initializer
		// -----------
		
		// Initializers run when the `app.start()` method is called
		app.addInitializer(function(){
			var todoCollection = TodosModule.getAllTodoCollection();
			header.initialize(todoCollection);
		});
	
 	}, namespace, headerTemplate, TodosModule);
	
	// Required, return the module for AMD compliance
	return app.Header;

});
