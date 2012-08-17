// Set the require.js configuration
require.config({

	// If no baseUrl is explicitly set in the configuration, the default value
    // will be the location of the HTML page that loads require.js.
    // If a data-main attribute is used, that path will become the baseUrl.

    // Path mappings for module names not found directly under baseUrl.
    // The path settings are assumed to be relative to baseUrl, unless the paths
    // setting starts with a "/" or has a URL protocol in it ("like http:").
    // In those cases, the path is determined relative to baseUrl.
	paths: {
        // JavaScript folders
        libs: "libs",
        
        // Templates folder
        templates: "../templates",
        
		// Libraries
		jquery: "libs/jquery/jquery-1.8.0",
		underscore: "libs/underscore/underscore-1.3.3",
		backbone: "libs/backbone/backbone-0.9.2",
		marionette: "libs/backbone.marionette/backbone.marionette-0.9.10",
		localstorage: "libs/backbone.localstorage/backbone.localstorage-1.0",
		
		// Require plugins
		text: "libs/require/text-2.0.3"
	},
	
	// Configure the dependencies and exports for older, traditional "browser globals"
    // scripts that do not use define() to declare the dependencies and set a module value.
	shim: {
	    "underscore": {
	        exports: "_"
	    },

	    "backbone": {
        	// These script dependencies should be loaded before loading backbone.js
        	deps: ["underscore", "jquery"],
        	// Once loaded, use the global "Backbone" as the module value.
            exports: "Backbone"
	    },
	    
	    "localstorage": {
        	deps: ["backbone"]
	    }	    

	}
});

require([
	"namespace",
	"modules/todos", 
	"modules/header", 
	"modules/content",
	"modules/footer",
	"modules/routing",
	"jquery",
	"backbone"
],

function(namespace, TodosModule, HeaderModule, ContentModule, FooterModule, RoutingModule, $, Backbone){

    // Shorthand the application namespace
    var app = namespace.app;
	
	// Regions are visual areas of the DOM, where specific views
	// will be displayed.	
	app.addRegions({
		header: "#header",	// here we put an add todo form
		content: "#content",		// here we put list items
		footer: "#footer"	// here we put stats and filter links
	});
	
	// Add application initailization part.
	// Remember that the downloaded modules also can add its own initialization part
	app.addInitializer(function(){
		var allTodoCollection = TodosModule.getAllTodoCollection();
		allTodoCollection.fetch();
	});	
	
	// After application initialization kick off our route handlers.
    app.on("initialize:after", function () {
		Backbone.history.start();
    });
	
    // This is the part where the application start
	//$(document).ready(function(){
	$(function(){ // this is an alias to jQuery's DOMReady function
		app.start();
	});

});
