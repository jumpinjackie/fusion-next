define([
    "dojo/_base/declare",
    "dijit/registry",
    "fusion/stringbundle"
], function() {
    var declare = arguments[0];
    var registry = arguments[1];
    var StringBundle = arguments[2];

    var StatusBarBuilder = declare(null, {
        constructor: function(container) {
            this.container = container;
        },
        buildItems: function(runtime, parentContainer) {
            var tb = null;
            var cnt = null;
            if (parentContainer) {
                cnt = parentContainer;
                tb = parentUiObj;
            } else {
                cnt = this.container;
                tb = registry.byId(this.container.Name[0]);
                if (tb == null)
                    console.warn("Could not find DOM element (" + this.container.Name[0] + ") to attach widgets to");
            }
            if (tb != null) {
                for (var i = 0; i < cnt.Item.length; i++) {
                    var item = cnt.Item[i];
                    var func = item.Function[0];
                    if (func === "Widget") {
                        var wgtName = item.Widget[0];
                        var wgtDef = runtime.widgetDefinitions[wgtName];
                        var wgtInst = runtime.widgetInstances[wgtName];
                        if (!wgtInst.isTemplateResident()) {
                            throw new Error(StringBundle.i18n("E_CANNOT_PUT_NON_TEMPLATE_RESIDENT_WIDGET_IN_STATUSBAR"));
                        }

                        var klazz = wgtInst.getItemUiClass("splitterbar");
                        if (klazz) {
                            var opts = wgtInst.getItemUiOptions(wgtDef, "splitterbar");
                            var uiobj = new klazz(opts);
                            wgtInst.setUiObject(uiobj);
                            tb.addChild(uiobj);
                        } else {
                            console.warn("Widget (" + wgtName + ", " + wgtDef.Type[0] + ") has no UI representation or it did not implement getItemUIClass() properly");
                        }
                        
                    } else {
                        console.warn("Unknown container item function (" + func + ")");
                    }
                }
            }
        }
    });
    return StatusBarBuilder;
});