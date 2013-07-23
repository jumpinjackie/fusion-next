define(["fusion/widget", "dojo/_base/declare", "dojo/topic", "dijit/form/ToggleButton", "openlayers/OpenLayers"], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var topic = arguments[2];
    var ToggleButton = arguments[3];
    var OpenLayers = arguments[4];
    var Fusion = null;

    var Pan = declare(Widget, {
        olControl: null,
        initializeWidget: function(widgetTag, fusionInst) {
            Fusion = fusionInst;
        },
        onAttachInit: function() {
            this.olControl = new OpenLayers.Control.DragPan();
            this.getMap().oMapOL.addControl(this.olControl);
            this.olControl.handler.keyMask = 0;

            var assetPath = Fusion.getAssetPath();
            var grabpath= "url(" + assetPath + "cursors/grab.cur" + "), move";
            var grabbingpath = "url(" + assetPath + "cursors/grabbing.cur" + "), move";
            
            this.cursorNormal = [grabpath, 'grab', '-moz-grab', 'move'];
            this.cursorDrag = [grabbingpath, 'grabbing', '-moz-grabbing', 'move'];

            //This contains auto-activate logic
            this.inherited(arguments);
        },
        getItemUiClass: function(containerType) {
            if (containerType == "toolbar") {
                return ToggleButton;
            } 
            return this.inherited(arguments);
        },
        isAutoActivate: function() { return true; },
        setUiObject: function(uiObj) {
            this.inherited(arguments);
            Fusion.runtime.registerMutexWidget(this.getMutexWidgetSet(), this);
        },
        getMutexWidgetSet: function() {
            return Fusion.MutexWidgetSets.MAP_CONTROLS;
        },
        activate: function() {
            this.inherited(arguments);
            this.olControl.activate();
            this.getMap().setCursor(this.cursorNormal);
            topic.publish(Widget.Events.ACTIVATED, this);
        },
        deactivate: function() {
            this.inherited(arguments);
            this.olControl.deactivate();
            //this.getMap().setCursor('auto');
        }
    });
    return Pan;
});