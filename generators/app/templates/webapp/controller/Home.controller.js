sap.ui.define([
	"<%= NAMESPACE_SLASH %>/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("<%= NAMESPACE %>.controller.Home", {

		// --- CONTROLLER-WIDE VARIABLES NOT NEEDED IN VIEW ---
		// Do not use window / global scope
		// For variables needed in view, use the "view" model

		//  _sSomeString: "";

		// --- UI5 CONTROLLER LIFECYCLE HOOKS ---

		/**
    * This method is called upon initialization of the View.
		* The controller can perform its internal setup in this hook.
		* It is only called once per View instance, unlike the onBeforeRendering and onAfterRendering hooks.
    */
		onInit: function() {
			this.setModel(new JSONModel(), "view");
		},

		/**
    * This method is called every time the View is rendered, before the Renderer is called and the HTML is placed in the DOM-Tree.
		* It can be used to perform clean-up-tasks before re-rendering.
    */
		// onBeforeRendering: function() {},

		/**
    * This method is called every time the View is rendered, after the HTML is placed in the DOM-Tree.
		* It can be used to apply additional changes to the DOM after the Renderer has finished.
    */
		// onAfterRendering: function() {},

		/**
    * This method is called upon desctuction of the View.
		* The controller should perform its internal destruction in this hook.
		* It is only called once per View instance, unlike the onBeforeRendering and onAfterRendering hooks.
    */
		// onExit: function() {},

		// --- EVENT HANDLERS (on-) ---

		// onSomething: function(oEvent) {},

		// --- PRIVATE METHODS (_-) ---

		// _something: function(oEvent) {}

	});

});
