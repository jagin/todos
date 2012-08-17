define([
    // Libs
	"underscore",
    "marionette"
],

// Namespace the application to provide a mechanism for having application wide
// code without having to pollute the global namespace
function(_, Marionette) {

    return {
	
	    // Keep active application instances namespaced under an app object.
        app: new Marionette.Application(),
 
        // Create a custom module object
        module: function(additionalProps){
            return _.extend({}, additionalProps );
        },
		
		// Which filter are we using?
		todoFilter: "",  // empty, active, completed

		// What is the enter key constant?
		ENTER_KEY: 13
		
    };
	
});
