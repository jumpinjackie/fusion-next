define(["dojo/_base/declare", "fusion/core", "fusion/widget"], function() {
    var declare = arguments[0];
    var Fusion = arguments[1];
    var Widget = arguments[2];

    var TemplateResidentWidget = declare(Widget, {
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: true,
        /**
         * The DOM element ID this widget will render to
         */
        domElId: null,
        initializeWidget: function(widgetTag) {

        },
        activate: function() {

        },
        deactivate: function() {

        }
    });
    return Widget;
});