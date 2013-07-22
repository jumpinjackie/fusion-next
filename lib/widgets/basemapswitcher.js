define([
    "fusion/core",
    "fusion/widget",
    "dojo/_base/declare",
    "dijit/form/DropDownButton",
    "fusion/map",
    "openlayers/OpenLayers",
    "dojo/topic",
    "dijit/RadioMenuItem",
    "dijit/Menu",
    "dojo/on"
], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];
    var DropDownButton = arguments[3];
    var Map = arguments[4];
    var OpenLayers = arguments[5];
    var topic = arguments[6];
    var RadioMenuItem = arguments[7];
    var Menu = arguments[8];
    var on = arguments[9];

    var Func = OpenLayers.Function;

    var BasemapSwitcher = declare(Widget, {
        initializeWidget: function(widgetTag) {
            topic.subscribe(Map.Events.ACTIVE_MAP_CHANGED, Func.bind(this.onMapChanged, this));
        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return DropDownButton;
            } else if (containerType == "menu") {
                return MenuItem;
            }
        },
        getItemUiOptions: function(widgetDef, containerType) {
            var opts = {
                label: (widgetDef.Label ? widgetDef.Label[0] : ""), // + " (" + wgtName + ")",
                iconClass: widgetDef.ImageClass != null ? ("fusion-icon fusion-" + widgetDef.ImageClass[0]) : null
            };
            if (containerType == "toolbar") {
                opts.dropDown = new Menu();
            }
            return opts;
        },
        setUiObject: function(uiObj) {
            this.uiObj = uiObj;
        },
        getMenu: function() {
            return this.uiObj.dropDown;
        },
        onMapChanged: function() {
            var mapWidget = this.getMap();
            var olMap = mapWidget.oMapOL;
            var menu = this.getMenu();
            for (var i = 0; i < olMap.layers.length; i++) {
                var layer = olMap.layers[i];
                if (layer.isBaseLayer) {
                    var layerName = layer.name;
                    var item = new RadioMenuItem({ group: "basemap", label: layerName, checked: layer.visibility });
                    menu.addChild(item);
                }
            }
        },
        onBaseMapChange: function(layerName, e) {
            var mapWidget = this.getMap();
            var olMap = mapWidget.oMapOL;
            var menu = this.getMenu();
            for (var i = 0; i < olMap.layers.length; i++) {
                var layer = olMap.layers[i];
                if (layer.name == layerName) {
                    console.log("Switch base map to: " + layerName);
                    layer.setVisibility(e); //Should be baselayer, meaning others will turn off
                }
            }
        }
    });
    return BasemapSwitcher;
});