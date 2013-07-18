define([
    "dojo/_base/declare", 
    "fusion/core",
    "dijit/form/Button",
    "dijit/MenuItem"
], function() {
    var declare = arguments[0];
    var Fusion = arguments[1];
    var Button = arguments[2];
    var MenuItem = arguments[3];

    var Widget = declare(null, {
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: false,
        /**
         * The dojo UI class instance
         */
        uiObj: null,
        /**
         * The initialization options for this dojo UI class
         */
        uiInitOptions: null,
        /**
         * Constructs a new instance of this widget
         *
         * Parameters:
         *  args {Object} - The initialization parameters. Must contain the following arguments:
         *      - mapWidget: The Map widget instance
         *      - widgetDef: The widget definition
         */
        constructor: function(options) {
            this.name = options.name;
        },
        initializeWidget: function(widgetTag) {

        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return Button;
            } else if (containerType == "menu") {
                return MenuItem;
            }
        },
        setUiObject: function(uiObj) {
            this.uiObj = uiObj;
        },
        setMap: function(mapWidget) {
            this.mapWidget = mapWidget;
        },
        getMap: function() {
            return this.mapWidget;
        },
        activate: function() {
            console.log("activated widget");
        },
        deactivate: function() {

        }
    });
    return Widget;
});