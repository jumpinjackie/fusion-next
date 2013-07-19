define(["fusion/widget", "dojo/_base/declare"], function() {
    var Widget = arguments[0];
    var declare = arguments[1];

    var Legend = declare(Widget, {
        domElId: "Legend",
        initializeWidget: function(widgetTag) {

        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; }
    });
    return Legend;
});