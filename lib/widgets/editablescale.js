define([
    "fusion/widget",
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "dojo/query",
    "openlayers/OpenLayers",
    "dojo/topic",
    "fusion/map"
], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var ContentPane = arguments[2];
    var query = arguments[3];
    var OpenLayers = arguments[4];
    var topic = arguments[5];
    var Map = arguments[6];

    var EditableScale = declare(Widget, {
        precision: 4,
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension[0] || {};
            this.precision = json.Precision ? parseInt(json.Precision[0]) : this.precision;
        },
        getItemUiClass: function(containerType) {
            if (containerType === "splitterbar") {
                return ContentPane;
            }
            return null;
        },
        getItemUiOptions: function(widgetDef, containerType) {
            return {
                content: "<span class='inputEditableScalePrefix'>1: </span><input class='inputEditableScale' />"
            };
        },
        onAttachInit: function() {
            if (!this.domScale) {
                this.domScale = query("input.inputEditableScale")[0];
                OpenLayers.Event.observe(this.domScale, 'keypress', OpenLayers.Function.bindAsEventListener(this.keyPressHandler, this));
                topic.subscribe(Map.Events.EXTENTS_CHANGED, OpenLayers.Function.bind(this.scaleChanged, this));
            }
            this.scaleChanged();
        },
        scaleChanged: function() {
            this.domScale.value = this.scaleToString(this.getMap().oMapOL.getScale());
        },
        scaleToString: function(scale) {
            scale = Math.abs(parseFloat(scale));
            return "" + Math.round(scale * Math.pow(10,this.precision))/Math.pow(10,this.precision);
        },
        keyPressHandler: function(e) {
            if (e.keyCode == OpenLayers.Event.KEY_RETURN) {
                this.zoomToScale();
            }
        },
        zoomToScale: function(e) {
            var scale = parseFloat(this.domScale.value);
            if (scale) {
                this.getMap().zoomToScale(scale);
            }
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         * @ignore
         */
        isTemplateResident: function() { return true; }
    });
    return EditableScale;
});