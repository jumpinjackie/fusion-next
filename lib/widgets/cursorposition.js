define([
    "fusion/widget", 
    "dijit/layout/ContentPane",
    "dojo/_base/declare",
    "openlayers/OpenLayers",
    "dojo/query"
], function() {
    var Widget = arguments[0];
    var ContentPane = arguments[1];
    var declare = arguments[2];
    var OpenLayers = arguments[3];
    var query = arguments[4];

    var Func = OpenLayers.Function;
    var Fusion = null;

    var CursorPosition = declare(Widget, {
        defaultTemplate: 'x: {x}, y: {y}',
        initializeWidget: function(widgetTag, fusionInst) {
            Fusion = fusionInst;
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};

            this.template = json.Template ? json.Template[0] : this.defaultTemplate;
            this.precision = json.Precision ? parseInt(json.Precision[0]) : -1;
            this.units = json.Units ? Fusion.unitFromName(json.Units[0]) : Fusion.Unit.UNKNOWN;
            this.emptyText = json.EmptyText ? json.EmptyText[0] : "";
            this.displayProjection = json.DisplayProjection ? new OpenLayers.Projection(json.DisplayProjection[0]) : null;
        },
        getItemUiClass: function(containerType) {
            if (containerType === "splitterbar") {
                return ContentPane;
            }
            return null;
        },
        getItemUiOptions: function(widgetDef, containerType) {
            return {
                content: "<span class='spanCursorPosition'></span>"
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
            this.control = new OpenLayers.Control.MousePosition({
                div: query("span.spanCursorPosition")[0],
                formatOutput: Func.bind(this.formatHTML, this),
                emptyString: this.emptyText,
                displayProjection: this.displayProjection
            });
            this.getMap().oMapOL.addControl(this.control);
        },
        formatHTML: function(p) {
            if (!this.displayProjection) {
                var mapProj = this.getMap().oMapOL.projection;
                var mapUnit = mapProj.getUnits();

                // convertion from linear units to degree unit.
                if(this.units == Fusion.Unit.DEGREES && mapUnit != 'dd' && mapUnit != 'degrees' ) {
                    // coordinate transformation from map CS to EPSG:4326.
                    var dest = new OpenLayers.Projection("GEOGCS[\"LL84\",DATUM[\"WGS84\",SPHEROID[\"WGS84\",6378137.000,298.25722293]],PRIMEM[\"Greenwich\",0],UNIT[\"Degree\",0.01745329251994]]");
                    p = p.transform(mapProj, dest);
                }
                //else
                //{
                    // TODO: convertion from degree unit to linear units
                //}
                
                /* old code for converting between units */
                else if (this.units != Fusion.Unit.UNKNOWN) {
                    var convFactor = this.getMap().getMetersPerUnit();
                    p.lon = Fusion.fromMeter(this.units, p.lon * convFactor);
                    p.lat = Fusion.fromMeter(this.units, p.lat * convFactor);
                }
                
                if (this.precision >= 0) {
                    var factor = Math.pow(10,this.precision);
                    p.lon = Math.round(p.lon * factor)/factor;
                    p.lat = Math.round(p.lat * factor)/factor;
                }
            }
            var unitAbbr = Fusion.unitAbbr(this.units);
            var innerHTML = this.template.replace('{x}',p.lon.toFixed(this.precision));
            innerHTML = innerHTML.replace('{y}',p.lat.toFixed(this.precision));
            innerHTML = innerHTML.replace('{units}', unitAbbr).replace('{units}', unitAbbr);
            return innerHTML;
        }
    });
    return CursorPosition;
});