define([
    "dojo/_base/declare", 
    "fusion/core",
    "dojo/on",
    "dijit/form/Button",
    "dijit/MenuItem"
], function() {
    var declare = arguments[0];
    var Fusion = arguments[1];
    var on = arguments[2];
    var Button = arguments[3];
    var MenuItem = arguments[4];

    var Widget = declare(null, {
        /**
         * The dojo UI class instance
         */
        uiObj: null,
        /**
         * Gets whether this widget is active. Only applies to widgets that are not template resident
         */
        isActive: false,
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
        getItemUiOptions: function(widgetDef, containerType) {
            return {
                label: (widgetDef.Label ? widgetDef.Label[0] : ""), // + " (" + wgtName + ")",
                iconClass: widgetDef.ImageClass != null ? ("fusion-icon fusion-" + widgetDef.ImageClass) : null,
                title: (widgetDef.Tooltip ? widgetDef.Tooltip[0] : ""),
                tooltip: (widgetDef.Tooltip ? widgetDef.Tooltip[0] : "")
            };
        },
        setUiObject: function(uiObj) {
            this.uiObj = uiObj;
            if (!this.isTemplateResident()) {
                var that = this;
                on(that.uiObj, "click", function() {
                    that.activate();
                });
            }
        },
        isAutoActivate: function() { return false; },
        setMap: function(mapWidget) {
            this.mapWidget = mapWidget;
        },
        getMap: function() {
            return this.mapWidget;
        },
        activate: function() {
            console.log("activated widget: " + this.name);
            this.isActive = true;
        },
        deactivate: function() {
            console.log("deactivated widget: " + this.name);
            this.isActive = false;
        },
        getMutexWidgetSet: function() { return null; },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return false; },
        /**
         * Called when the widget and its UI representation has been initialized
         */
        onAttachInit: function() {
            if (!this.isTemplateResident() && this.uiObj != null && this.isAutoActivate()) {
                console.log("Auto-activating widget: " + this.name);
                this.activate();
            }
        }
    });

    Widget.Events = {
        ACTIVATED: "fusion/widget/activated"
    };

    return Widget;
});