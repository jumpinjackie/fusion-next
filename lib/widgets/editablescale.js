define(["fusion/core", "fusion/widget", "dojo/_base/declare", "dijit/layout/ContentPane"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var ContentPane = arguments[3];

    var EditableScale = declare(Widget, {
        precision: 4,
        initializeWidget: function(widgetTag) {

        },
        getItemUiClass: function(containerType) {
            if (containerType === "splitterbar") {
                return ContentPane;
            }
            return null;
        },
        getItemUiOptions: function(widgetDef, containerType) {
            return {
                content: "<span class='inputEditableScalePrefix'>1: </span><input class='inputEditableScale' />"
            };
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; }
    });
    return EditableScale;
});