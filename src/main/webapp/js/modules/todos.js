define([
    // Libs
	"namespace",
	"backbone", 
	"localstorage",
    "marionette",
	"jquery",
	"underscore"
],

// Create a module to contain the Todo model and collection, 
// providing encapsulation of these concepts so that they can
// be used throughout the rest of the app.
function(namespace, Backbone, Marionette, $, _) {
	
	// Shorthand the application namespace
    var app = namespace.app;

	// Create a module to hide our private implementation details 
	app.module("Todos", function(Todos, app, Backbone, Marionette, $, _, namespace){ 

		// Private Data And Functions
		// --------------------------
		var allTodoCollection;
		var filteredTodoCollection;
		
		function FilteredCollection(collection){
			var filtered = new collection.constructor();
			filtered.filterCriteria = filtered.filterCriteria || false; 

			filtered.applyFilter = function(criteria){
				this.filterCriteria = criteria || this.filterCriteria; 
				var items;
				if(this.filterCriteria){
					items = _.filter(collection.models, this.matchCriteria, this); 
					//items = collection.where(criteria);
				} else {
					alert("fdffsd");
					items = collection.models;
				}
				filtered.reset(items);
			};
			
			filtered.matchCriteria = function(model) {
				var  criteria = this.filterCriteria, 
					property,
					criterium,
					val;

				// iterate through all criteria. If any of them fail, the model is
				// rejected.
				for(property in criteria){
					criterium = criteria[property];
	
					// custom criterium method
					if (_.isFunction(criterium)	&& !criterium(model)){
						return false;
					}
					// if criterium is not a method, it will be treated as an array of
					// allowed values. This part makes sure that such criteria are
					// represented as an array.
					else if(!_.isArray(criterium)){
						criterium = [criterium];
					}
	
					// criterium fails if the model's property does not exist within
					// the criteriums list of allowed values
					val = model.get(property);
					val = (_.isArray(val)) ? val : [ val ];
					if(_.isArray(criterium) && !_.intersection(criterium, val).length){
						return false;
					}
				}

				return true;
			};		
				
			// update collection if original changes
			collection.on("add", function(model){
				if (filtered.matchCriteria(model)) {
					filtered.add(model);
				}
			});		
			collection.on("change", function(model){	
		        if(!filtered.matchCriteria(model)) {
		        	filtered.remove(model);
			    }	
			});			
			collection.on("remove", function(model){	
				filtered.remove(model);
			});				
			collection.on("reset", function(){
				filtered.reset(collection.models);
				filtered.applyFilter();
			});

			return filtered;
		}		
		
		// Public Data And Functions
		// -------------------------
		Todos.TodoModel = Backbone.Model.extend({
			
			// Default attributes for the todo.
			defaults: {
				title: "empty todo...",
				completed: false
			},

			// Toggle the `completed` state of this todo item.
			toggleCompleted: function() {
				this.save({completed: !this.get("completed")});
			}
					
		});
		
		Todos.TodoCollection = Backbone.Collection.extend({
		
			// Save all of the todo items under the 'todos-marionette' namespace.
			localStorage: new Backbone.LocalStorage("todos-marionette"),

			// Reference to this collection's model.
			model: Todos.TodoModel,

			initialize: function(todos){

				// We are using a closure that will reference the current object via a variable named self.
				// Because self is a variable, it could be named anything else. The use of 'self' as a name
				// is a unwritten convention but it could be whatever you want.
				// Because when using closures within an object, the this in the called function.
				var self = this;

				app.vent.on('todos:clearCompleted', function(){
					_.each(self.completed(), function(todo){ todo.destroy(); });
				});
				app.vent.on('todos:toggleAllComplete', function(completed){
					self.each(function (todo) { todo.save({'completed': completed}); });
				});			
			},

			// Filter down the list of all todo items that are finished.
			completed: function() {
				return this.filter(function(todo){ return todo.get('completed'); });
			},

			// Filter down the list to only todo items that are still not finished.
			remaining: function() {
				return this.without.apply(this, this.completed());
			},

			// Todos are sorted by their original insertion order.
			comparator: function(todo) {
				return todo.get('order');
			}	

		});	
		
		// Public API
		// ----------		
		
		// The public API that should be called when you
		// need to get the current list of todos
		Todos.getAllTodoCollection = function(){
			// We want only one instance of allTodoCollection for the application
			if (typeof allTodoCollection === 'undefined'){
				allTodoCollection = new Todos.TodoCollection();
			}
			return allTodoCollection;
		};
		
		Todos.getFilteredTodoCollection = function(){
			// We want only one instance of allTodoCollection for the application
			if (typeof filteredTodoCollection === 'undefined'){
				filteredTodoCollection = FilteredCollection(Todos.getAllTodoCollection());
			}
			return filteredTodoCollection;
		};		
		
		// We keep the Todos in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		Todos.getNextOrder = function(){
			var order = 1;
			var allTodoCollection = Todos.getAllTodoCollection();
			if (allTodoCollection.length){
				order = allTodoCollection.last().get('order') + 1;
			}

			return order;
		};
	
 	}, namespace);
	
	// Required, return the module for AMD compliance
	return app.Todos;

});
