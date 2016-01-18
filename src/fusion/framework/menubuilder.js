define([
    "dojo/_base/declare",
    "dijit/registry",
    "dijit/MenuSeparator",
    "dijit/form/DropDownButton",
    "dijit/DropDownMenu"
], function() {
    var declare = arguments[0];
    var registry = arguments[1];
    var MenuSeparator = arguments[2];
    var DropDownButton = arguments[3];
    var DropDownMenu = arguments[4];

    var MenuBuilder = declare(null, {
        constructor: function(container) {
            this.container = container;
        },
        buildItems: function(runtime, parentContainer, parentUiObj) {
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
                        var klazz = wgtInst.getItemUiClass("menu");
                        if (klazz) {
                            var opts = wgtInst.getItemUiOptions(wgtDef, "menu");
                            var uiobj = new klazz(opts);
                            wgtInst.setUiObject(uiobj);
                            tb.addChild(uiobj);
                        } else {
                            console.warn("Widget (" + wgtName + ") has no UI representation or it did not implement getItemUIClass() properly");
                        }
                    } else if (func === "Separator") {
                        var sep = new MenuSeparator();
                        tb.addChild(sep);
                    } else if (func === "Flyout") {
                        if (item.Item) {
                            var btn = new DropDownButton({
                                label: cnt.Label != null ? cnt.Label[0] : "",
                                dropDown: new DropDownMenu({ style: "display:none" })
                            });
                            tb.addChild(btn);
                            //this.buildItems(runtime, btn.dropDown);
                            var menuBuilder = new MenuBuilder(null);
                            menuBuilder.buildItems(runtime, item, btn.dropDown);
                        } else {
                            console.warn("Skipping flyout item as it has no child items");
                        }
                    } else {
                        console.warn("Unknown container item function (" + func + ")");
                    }
                }
            }
        }
    });
    return MenuBuilder;
});