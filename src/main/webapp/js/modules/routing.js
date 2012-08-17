define([
	"namespace",
	"modules/todos",
	"backbone", 
    "marionette",
	"jquery",
	"underscore"
],

function(namespace, TodosModule, Backbone, Marionette, $, _){

	// Shorthand the application namespace
    var app = namespace.app;

	// Create a module to hide our private implementation details 
	app.module("Routing", function(Routing, app, Backbone, Marionette, $, _, namespace, TodosModule){ 
		// Private Data And Functions
		// --------------------------
		var appRouter;
		
		// Public Data And Functions
		// -------------------------	
		Routing.AppRouter = Marionette.AppRouter.extend({
		
			routes:{
				'*filter': 'setFilter',
			},

			setFilter: function(filter){
				// Set the current filter to be used
				namespace.todoFilter = filter.trim() || "";
				var filteredTodoCollection = TodosModule.getFilteredTodoCollection();
				switch(namespace.todoFilter){
					case "active":
						filteredTodoCollection.applyFilter({completed: false});
					break;
					case "completed":
						filteredTodoCollection.applyFilter({completed: true});
					break;
					default:
						filteredTodoCollection.applyFilter({});
					break;
				}
				
				// Inform footer to style its filter links
				app.vent.trigger("todos:filterChanged");
			}

		});
		
		// Public API
		// ----------		
		
		// The public API that should be called when you
		// need to get the application router
		Routing.getAppRouter = function(){
			return appRouter;
		};			

		// Initialization
		// --------------

		// Initialize the router when the application starts
		app.addInitializer(function(){
			appRouter = new Routing.AppRouter();
		});
		
 	}, namespace, TodosModule);
	
});