define(["fusion/core", "fusion/widget", "dojo/_base/declare", "dijit/form/DropDownButton"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var DropDownButton = arguments[3];

    var BasemapSwitcher = declare(Widget, {
        initializeWidget: function(widgetTag) {

        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return DropDownButton;
            } else if (containerType == "menu") {
                return MenuItem;
            }
        }
    });
    return BasemapSwitcher;
});