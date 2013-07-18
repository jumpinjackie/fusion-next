define(["dojo/_base/declare", "dijit/registry", "dijit/form/Button", "dijit/ToolbarSeparator"], function() {
    var declare = arguments[0];
    var registry = arguments[1];
    var Button = arguments[2];
    var ToolbarSeparator = arguments[3];

    var ToolbarBuilder = declare(null, {
        constructor: function(container) {
            this.container = container;
        },
        buildItems: function(runtime) {
            var tb = registry.byId(this.container.Name[0]);
            if (tb != null) {
                for (var i = 0; i < this.container.Item.length; i++) {
                    var item = this.container.Item[i];
                    var func = item.Function[0];
                    if (func === "Widget") {
                        var wgtName = item.Widget[0];
                        var wgtDef = runtime.widgetDefinitions[wgtName];
                        var wgtInst = runtime.widgetInstances[wgtName];
                        var button = new Button({
                            label: wgtDef.Label[0]
                        });
                        wgtInst.setUiObject(button);
                        tb.addChild(button);
                    } else if (func === "Separator") {
                        var sep = new ToolbarSeparator();
                        tb.addChild(sep);
                    } else if (func === "Flyout") {

                    } else {
                        console.warn("Unknown container item function (" + func + ")");
                    }
                }
            }
        }
    });
    return ToolbarBuilder;
});