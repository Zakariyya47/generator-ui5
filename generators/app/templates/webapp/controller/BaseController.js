sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/UIComponent",
  "<%= NAMESPACE_SLASH %>/model/formatter"
], function(Controller, History, UIComponent, formatter) {
  "use strict";

  return Controller.extend("<%= NAMESPACE %>.controller.BaseController", {

    formatter: formatter,

    /**
    * Convenience method for getting the router.
    * @public
    * @returns {sap.ui.core.routing.Router} the router for this component
    */
    getRouter: function() {
      return UIComponent.getRouterFor(this);
    },

    /**
    * Convenience method for getting a view model by name.
    * @public
    * @param {string} [sName] the model name
    * @returns {sap.ui.model.Model} the model instance
    */
    getModel: function(sName) {
      return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
    },

    /**
    * Convenience method for setting the view model.
    * @public
    * @param {sap.ui.model.Model} oModel the model instance
    * @param {string} sName the model name
    * @returns {sap.ui.mvc.View} the view instance
    */
    setModel: function(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
    * Convenience method for getting the i18n resource bundle.
    * @public
    * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
    */
    getResourceBundle: function() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    onNavBack: function() {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home", {}, true /*no history*/);
			}
		}

  });

}
);
