define([
    "fusion/core",
    "fusion/widget", 
    "dijit/layout/ContentPane",
    "dojo/_base/declare",
    "openlayers/OpenLayers",
    "dojo/query",
    "dojo/topic",
    "fusion/map"
], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var ContentPane = arguments[2];
    var declare = arguments[3];
    var OpenLayers = arguments[4];
    var query = arguments[5];
    var topic = arguments[6];
    var Map = arguments[7];

    var ViewSize = declare(Widget, {
        defaultTemplate: 'x: {x}, y: {y}',
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};

            this.template = json.Template ? json.Template[0] : this.defaultTemplate;
            this.precision = json.Precision ? parseInt(json.Precision[0]) : -1;
            this.units = json.Units ? Fusion.unitFromName(json.Units[0]) : Fusion.Unit.UNKNOWN;

            topic.subscribe(Map.Events.ACTIVE_MAP_CHANGED, OpenLayers.Function.bind(this.updateViewSize, this));
        },
        getItemUiClass: function(containerType) {
            if (containerType === "splitterbar") {
                return ContentPane;
            }
            return null;
        },
        getItemUiOptions: function(widgetDef, containerType) {
            return {
                content: "<span class='spanViewSize'></span>"
            };
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; },
        /**
         * Called when the widget and its UI representation has been initialized
         */
        onAttachInit: function() {
            this.updateViewSize();
        },
        updateViewSize: function(e) {
            var map = this.getMap();
            var p = map.getSize();
            if (this.units != Fusion.Unit.PIXELS) {
                var gw = map.pixToGeoMeasure(p.w);
                var gh = map.pixToGeoMeasure(p.h);
                if (this.units != Fusion.Unit.UNKNOWN) {
                    var convFactor = map.getMetersPerUnit();
                    gw = Fusion.fromMeter(this.units, gw * convFactor);
                    gh = Fusion.fromMeter(this.units, gh * convFactor);
                }
                if (this.precision >= 0) {
                    var factor = Math.pow(10,this.precision);
                    gw = Math.round(gw * factor)/factor;
                    gh = Math.round(gh * factor)/factor;
                }
            }
            var unitAbbr = Fusion.unitAbbr(this.units);
            var el = query("span.spanViewSize");
            el[0].innerHTML = this.template.replace('{w}',gw).replace('{h}',gh).replace('{units}', unitAbbr).replace('{units}', unitAbbr);
        }
    });
    return ViewSize;
});