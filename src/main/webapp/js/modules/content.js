define([
    // Libs
	"namespace",
	"text!templates/content.html",
	"text!templates/todoitem.html",
	"modules/todos",
	"backbone", 
    "marionette",
	"jquery",
	"underscore"
],

function(namespace, contentTemplate, todoItemTemplate, TodosModule, Backbone, Marionette, $, _) {
	
	// Shorthand the application namespace
    var app = namespace.app;

	// Create a module to hide our private implementation details 
	app.module("Content", function(Content, app, Backbone, Marionette, $, _, namespace, contentTemplate, todoItemTemplate, TodosModule){ 

		// Private Data And Functions
		// --------------------------
		
		// Compile our header template 
		var contentTemplate = _.template(contentTemplate);
		var todoItemTemplate = _.template(todoItemTemplate);
		
		// Public Data And Functions
		// -------------------------
		
		// Item view for each item in the collection. This handled the
		// interaction of each individual item, as well as the checking
		// and un-checking of the box, css class for strike-through / done, etc
		Content.TodoItemView = Marionette.ItemView.extend({
		
			template: todoItemTemplate,
			
			//... is a list tag.
			tagName: "li",
			
			// The DOM events specific to an item.
			events: {
				"click .toggle"   : "toggleCompleted",
				"dblclick .view"  : "edit",
				"click .destroy"  : "clear",
				"click .editor"   : "edit",
				"keypress .edit"  : "updateOnEnter",
				"blur .edit"      : "update"
			},
			
			ui: {
				input: ".edit"
			},
			
		    initialize: function(){
		    	// Is this really needed? for what?
		        //_.bindAll(this, "render");
		    	this.bindTo(this.model, "change", this.render, this);
		    },			

			onRender: function() {
				var $el = $(this.el);
				$el.toggleClass('completed', this.model.get('completed'));
			},

			// Toggle the `"completed"` state of the model.
			toggleCompleted: function() {
				this.model.toggleCompleted();
			},

			// Switch this view into `"editing"` mode, displaying the input field.
			edit: function() {
				$(this.el).addClass("editing");
				this.ui.input.focus();
			},

			// Close the `"editing"` mode, saving changes to the todo.
			update: function() {
				var value = this.ui.input.val().trim();

				if ( !value ){
					this.clear();
				}

				this.model.save({title: value});
				$(this.el).removeClass("editing");
			},

			// If you hit `enter`, we're through editing the item.
			updateOnEnter: function(e) {
				if ( e.keyCode === namespace.ENTER_KEY ){
					this.update();
				}
			},

			// Remove the item, destroy the model.
			clear: function() {
				this.model.destroy();
			}
		}); 	

		// Collection view for the list of items. This is a wrapper
		// view that renders each of the individual Todo items, using
		// the defined TodoItemView.	
		Content.ContentView = Marionette.CompositeView.extend({
			template: contentTemplate,
			itemView: Content.TodoItemView,
			itemViewContainer: "#todo-list",
			
			events: {
				"click #toggle-all": "toggleAllComplete"
			},
			
			ui: {
				toggleAllCheckbox: "#toggle-all"
			},
			
			initialize: function() {				
				this.bindTo(this, "item:added", this.showHide, this);
				this.bindTo(this, "item:removed", this.showHide, this);
			},
			
			onRender: function(){
				this.showHide();
			},
			
			showHide: function(){
				var $content = $("#content");
				if(this.collection.length) {
					if(!$content.is(":visible")) {
						$content.show();
					}
				} else {
					$content.hide();
				}
			},			
			
			toggleAllComplete: function () {
				var completed = this.ui.toggleAllCheckbox.is(':checked');
				app.vent.trigger("todos:toggleAllComplete", completed);
			}			
		});
		
		// Helpers
		// -------

		// The primary object to get the actual header of the ground 
		// and running.
		var content = {

			initialize: function(todoCollection){
				var contentView = this.getContentView(todoCollection);
				app.content.show(contentView);
			},

			getContentView: function(todoCollection){
				var contentView = new Content.ContentView({
					collection: todoCollection
				});
				return contentView;
			}
		};

		// Initializer
		// -----------
		
		// Initializers run when the `app.start()` method is called
		app.addInitializer(function(){
			var filteredTodoCollection = TodosModule.getFilteredTodoCollection();
			content.initialize(filteredTodoCollection);
		});
	
 	}, namespace, contentTemplate, todoItemTemplate, TodosModule);
	
	// Required, return the module for AMD compliance
	return app.Content;

});
