define([
    "dojo/_base/declare",
    "dijit/registry",
    "dijit/MenuSeparator"
], function() {
    var declare = arguments[0];
    var registry = arguments[1];
    var MenuSeparator = arguments[2];

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
                        var button = new klazz({
                            label: wgtDef.Label[0],
                            iconClass: wgtDef.ImageClass != null ? ("fusion-icon fusion-" + wgtDef.ImageClass[0]) : null,
                            onClick: function() {
                                wgtInst.activate();
                            }
                        });
                        wgtInst.setUiObject(button);
                        tb.addChild(button);
                    } else if (func === "Separator") {
                        var sep = new MenuSeparator();
                        tb.addChild(sep);
                    } else if (func === "Flyout") {
                        var btn = new DropDownButton({
                            label: cnt.Label != null ? cnt.Label[0] : "",
                            dropDown: new DropDownMenu({ style: "display:none" })
                        });
                        tb.addChild(btn);
                        //this.buildItems(runtime, btn.dropDown);
                        var menuBuilder = new MenuBuilder(null);
                        menuBuilder.buildItems(runtime, item, btn.dropDown);
                    } else {
                        console.warn("Unknown container item function (" + func + ")");
                    }
                }
            }
        }
    });
    return MenuBuilder;
});