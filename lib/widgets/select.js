define([
    "fusion/core",
    "fusion/widget",
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/form/ToggleButton"
], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var topic = arguments[3];
    var ToggleButton = arguments[4];

    var Select = declare(Widget, {
        initializeWidget: function(widgetTag) {
            
        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return ToggleButton;
            } 
            return this.inherited(arguments);
        },
        setUiObject: function(uiObj) {
            this.inherited(arguments);
            Fusion.runtime.registerMutexWidget(this.getMutexWidgetSet(), this);
        },
        getMutexWidgetSet: function() {
            return Fusion.MutexWidgetSets.MAP_CONTROLS;
        },
        activate: function() {
            topic.publish(Widget.Events.ACTIVATED, this);
        }
    });
    return Select;
});