define(["fusion/core", "fusion/widget", "dojo/_base/declare"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];

    var InvokeScript = declare(Widget, {
        scriptCode: null,
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            this.script = json.Script ? json.Script[0] : '';
        },
        activate: function() {
            eval(this.script);
        }
    });
    return InvokeScript;
});