define(["fusion/widget", "dojo/_base/declare", "dojo/topic", "dijit/form/ToggleButton"], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var topic = arguments[2];
    var ToggleButton = arguments[3];

    var MapTip = declare(Widget, {
        initializeWidget: function(widgetTag) {

        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return ToggleButton;
            } 
            return this.inherited(arguments);
        },
        isAutoActivate: function() { return true; },
        activate: function() {
            this.uiObj.set("checked", true);
        },
        deactivate: function() {
            this.uiObj.set("checked", false);
        }
    });
    return MapTip;
});