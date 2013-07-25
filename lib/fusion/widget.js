define([
    "dojo/_base/declare",
    "dojo/on",
    "dijit/form/Button",
    "dijit/MenuItem"
], function() {
    
    var declare = arguments[0];
    var on = arguments[1];
    var Button = arguments[2];
    var MenuItem = arguments[3];

    /**
     * Widget is the base class of all Fusion widgets.  Widget represents a runtime instance of a particular widget definition in the Application
     * Definition document. The Fusion runtime will create the appropriate instances.
     *
     * Widget initialization is a two-phase process with base initialization (initializeWidget) followed
     * by initialization when all other widgets (except for the map) are initialized (onAttachInit)
     *
     * @class Widget
     * @property {Boolean} isActive - Indicates whether this widget is currently active
     */
    var Widget = declare(null, {
        uiObj: null,
        isActive: false,
        constructor: function(options) {
            this.name = options.name;
            this.type = options.type;
        },
        /** 
         * Called by the Fusion runtime to perform basic initialization of the widget. This method cannot interact
         * with the map or any other widgets as they themselves are also in the process of initializing. Such interaction
         * should be deferred to the onAttachInit() method. For map interaction, it is recommended to subscribe to the
         * Map.Events.ACTIVE_MAP_CHANGED event, where it is safe to interact with the map from that event handler.
         * @memberof Widget
         * @instance
         * @virtual
         */
        initializeWidget: function(widgetTag) {
        },
        /**
         * Returns the appropriate dijit class type for the given container type
         * @memberof Widget
         * @instance
         */
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return Button;
            } else if (containerType == "menu") {
                return MenuItem;
            }
        },
        /**
         * Returns the appropriate dijit class initialization options for the given container type
         * @memberof Widget
         * @instance
         */
        getItemUiOptions: function(widgetDef, containerType) {
            return {
                label: (widgetDef.Label ? widgetDef.Label[0] : ""), // + " (" + wgtName + ")",
                iconClass: widgetDef.ImageClass != null ? ("fusion-icon fusion-" + widgetDef.ImageClass) : null,
                title: (widgetDef.Tooltip ? widgetDef.Tooltip[0] : ""),
                tooltip: (widgetDef.Tooltip ? widgetDef.Tooltip[0] : "")
            };
        },
        /**
         * Sets the dijit UI instance to this widget
         * @memberof Widget
         * @instance
         */
        setUiObject: function(uiObj) {
            this.uiObj = uiObj;
            if (!this.isTemplateResident()) {
                var that = this;
                on(that.uiObj, "click", function() {
                    that.activate();
                });
            }
        },
        /** 
         * Gets whether this widget will auto-activate upon initialization of the Fusion runtime environment
         * @memberof Widget
         * @instance
         */
        isAutoActivate: function() {
            return false;
        },
        /** 
         * Sets the map widget. Internal use only
         * @ignore
         */
        setMap: function(mapWidget) {
            this.mapWidget = mapWidget;
        },
        /**
         * Gets the map widget
         * @memberof Widget
         * @instance
         */
        getMap: function() {
            return this.mapWidget;
        },
        /**
         * Activates this widget. Usually initiated by the user clicking its UI representation (ie. A button)
         * @memberof Widget
         * @instance
         */
        activate: function() {
            console.log("activated widget: " + this.name);
            this.isActive = true;
        },
        /**
         * Deactivates this widget
         * @memberof Widget
         * @instance
         */
        deactivate: function() {
            console.log("deactivated widget: " + this.name);
            this.isActive = false;
        },
        /**
         * Gets the name of the mutually exclusive widget set that this widget belongs to. If this widget
         * is not mutually exclusive with other widgets, null is returned
         * @memberof Widget
         * @instance
         */
        getMutexWidgetSet: function() {
            return null;
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         * @memberof Widget
         * @instance
         */
        isTemplateResident: function() {
            return false;
        },
        /**
         * Called when the Fusion runtime has initialized all the widgets and attached them to their various dijit UI widgets
         * At this point it is safe to interact with other widgets, but may still not be appropriate to interact with the map widget
         * @memberof Widget
         * @instance
         */
        onAttachInit: function() {
            if (!this.isTemplateResident() && this.uiObj != null && this.isAutoActivate()) {
                console.log("Auto-activating widget: " + this.name);
                this.activate();
            }
        }
    });
    
    Widget.Events = {
        /**
         * Raised when a widget has been activated. Only select widgets will raise this event
         */
        ACTIVATED: "fusion/widget/activated"
    };

    return Widget;
});