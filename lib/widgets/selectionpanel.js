define(["fusion/core", "fusion/templateresidentwidget", "dojo/_base/declare"], function() {
    var Fusion = arguments[0];
    var TemplateResidentWidget = arguments[1];
    var declare = arguments[2];

    var SelectionPanel = declare(TemplateResidentWidget, {
        initializeWidget: function(widgetTag) {

        }
    });
    return SelectionPanel;
});