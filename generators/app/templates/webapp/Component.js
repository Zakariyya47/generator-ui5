sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("<%= NAMESPACE %>.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {

			// Call the init function of the parent component
			UIComponent.prototype.init.apply(this, arguments);

			// Initialize router for hash based navigation
			this.getRouter().initialize();

		}

	});

});
