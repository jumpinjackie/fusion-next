define([
    "dojo/_base/declare",
    "dijit/registry",
    "dijit/layout/ContentPane",
    "fusion/stringbundle",
    "dojo/query"
], function() {
    var declare = arguments[0];
    var registry = arguments[1];
    var ContentPane = arguments[2];
    var StringBundle = arguments[3];
    var query = arguments[4];

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
                //Yeah, we're making a table for layout purposes. So sue me :) Not our fault dojo does not provide a status bar widget
                if (tb instanceof ContentPane) {
                    var html = "<table border='0' cellpadding='0' cellspacing='0' class='statusbar-container'><thead>";
                    var row = "<tr>";
                    var pcPerRow = (1 / cnt.Item.length) * 100;
                    for (var i = 0; i < cnt.Item.length; i++) {
                        html += "<th width='" + pcPerRow + "%'></th>";
                        row += "<td class='statusbar-item' data-fusion-for-widget='" + cnt.Item[i].Widget[0] + "'></td>";
                    }
                    row += "</tr>";
                    html += "</thead><tbody>" + row + "</tbody></table>";
                    tb.set("content", html);
                }
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
                            var uiObj = new klazz(opts);
                            wgtInst.setUiObject(uiObj);
                            //cnt.addChild(uiObj);
                            //tb.addChild(uiObj);
                            //uiObj.placeAt(contentPane);

                            var target = query("td[data-fusion-for-widget='" + wgtName + "']")[0];
                            uiObj.placeAt(target);
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