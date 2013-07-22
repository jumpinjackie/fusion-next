define(["fusion/widget", "dojo/_base/declare", "dojo/topic", "dijit/form/ToggleButton"], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var topic = arguments[2];
    var ToggleButton = arguments[3];
    var Fusion = null;

    var Zoom = declare(Widget, {
        initializeWidget: function(widgetTag, fusionInst) {
            Fusion = fusionInst;
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
            topic.publish(this.Events.ACTIVATED, this);
        }
    });
    return Zoom;
});