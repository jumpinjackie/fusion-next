define([
    "fusion/widget",
    "dojo/_base/declare",
    "dijit/Tree",
    "dojo/topic",
    "fusion/map",
    "openlayers/OpenLayers"
], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var Tree = arguments[2];
    var topic = arguments[3];
    var Map = arguments[4];
    var OpenLayers = arguments[5];

    var FusionLegendTree = declare(Tree, {
        
    });

    var Legend = declare(Widget, {
        domElId: "Legend",
        tree: null,
        initializeWidget: function(widgetTag) {
            topic.subscribe(Map.Events.ACTIVE_MAP_CHANGED, OpenLayers.Function.bind(this.onMapChanged, this));
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; },
        onMapChanged: function() {
            var map = this.getMap();
            var layerModel = map.activeLayerModel;
            if (!this.tree) {
                var that = this;
                layerModel.getObjectModel(function(objModel) {
                    that.tree = new FusionLegendTree({ 
                        model: objModel,
                        getIconStyle: function(item, bExpanded) {
                            return item.getIconStyle(bExpanded)
                        },
                        getIconClass: function(item, bExpanded) {
                            return item.getIconClass(item, bExpanded);
                        }
                    });
                    that.tree.placeAt(that.domElId);
                    that.tree.startup();
                });
            }
        }
    });
    return Legend;
});