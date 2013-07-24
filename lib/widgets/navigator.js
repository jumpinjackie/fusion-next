define([
    "fusion/widget", 
    "dojo/_base/declare", 
    "openlayers/OpenLayers",
    "fusion/map",
    "dojo/topic",
    "dojo/query",
    "dojo/dnd/Moveable",
    "fusion/stringbundle"
], function() {
    var Widget = arguments[0];
    var declare = arguments[1];
    var OpenLayers = arguments[2];
    var Map = arguments[3];
    var topic = arguments[4];
    var query = arguments[5];
    var Moveable = arguments[6];
    var StringBundle = arguments[7];

    var Fusion = null;

    var Navigator = declare(Widget, {
        domElId: "Navigator",
        bInternalChange: false,
        zoomInFactor: 4,
        zoomOutFactor: 2,
        panAmount: 50,
        initializeWidget: function(widgetTag, fusionInst) {
            Fusion = fusionInst;
            this.domObj = query("#" + this.domElId)[0];
        },
        /**
         * Indicates whether this widget's UI representation is a particular region of the template
         * and not a toolbar/menu item
         */
        isTemplateResident: function() { return true; },
        onAttachInit: function() {
            this.activeControls = [];

            var m = document.createElement('map');
            m.name = 'Navigator_ImageMap';
            m.id = 'Navigator_ImageMap';

            var a = document.createElement('area');
            a.shape = 'poly';
            a.alt = StringBundle.i18n('L_PAN_EAST');
            a.title = StringBundle.i18n('L_PAN_EAST');
            a.coords = '27,176, 27,177, 40,190, 44,182, 44,159';
            var panEast = OpenLayers.Function.bind(this.pan, this, this.panAmount/100, 0);
            OpenLayers.Event.observe(a, 'mousedown', OpenLayers.Function.bindAsEventListener(panEast, this));
            m.appendChild(a);

            var a = document.createElement('area');
            a.shape = 'poly';
            a.alt = StringBundle.i18n('L_PAN_WEST');
            a.title = StringBundle.i18n('L_PAN_WEST');
            a.coords = '24,177, 24,176, 7,159, 7,182, 11,190';
            var panWest = OpenLayers.Function.bind(this.pan, this, -this.panAmount/100, 0);
            OpenLayers.Event.observe(a, 'mousedown', OpenLayers.Function.bindAsEventListener(panWest, this) );
            m.appendChild(a);

            var a = document.createElement('area');
            a.shape = 'poly';
            a.alt = StringBundle.i18n('L_PAN_SOUTH');
            a.title = StringBundle.i18n('L_PAN_SOUTH');
            a.coords = '25,178, 12,191, 21,197, 30,197, 39,191, 26,178';
            var panSouth = OpenLayers.Function.bind(this.pan, this, 0, -this.panAmount/100 );
            OpenLayers.Event.observe(a, 'mousedown', OpenLayers.Function.bindAsEventListener(panSouth, this) );
            m.appendChild(a);

            var a = document.createElement('area');
            a.shape = 'poly';
            a.alt = StringBundle.i18n('L_PAN_NORTH');
            a.title = StringBundle.i18n('L_PAN_NORTH');
            a.coords = '26,175, 43,158, 8,158, 25,175';
            var panNorth = OpenLayers.Function.bind(this.pan, this, 0, this.panAmount/100 );
            OpenLayers.Event.observe(a, 'mousedown', OpenLayers.Function.bindAsEventListener(panNorth, this) );
            m.appendChild(a);

            var a = document.createElement('area');
            a.shape = 'circle';
            a.alt = StringBundle.i18n('L_ZOOM_OUT');
            a.title = StringBundle.i18n('L_ZOOM_OUT');
            a.coords = '25,142,8';
            var zoomOut = OpenLayers.Function.bind(this.zoom, this, 1/this.zoomOutFactor);
            OpenLayers.Event.observe(a, 'mousedown', OpenLayers.Function.bindAsEventListener(zoomOut, this) );
            m.appendChild(a);

            var a = document.createElement('area');
            a.shape = 'circle';
            a.alt = StringBundle.i18n('L_ZOOM_IN');
            a.title = StringBundle.i18n('L_ZOOM_IN');
            a.coords = '25,34,8';
            var zoomIn = OpenLayers.Function.bind(this.zoom, this, this.zoomInFactor);
            OpenLayers.Event.observe(a, 'mousedown', OpenLayers.Function.bindAsEventListener(zoomIn, this) );
            m.appendChild(a);

            this.domObj.appendChild(m);

            var sliderBg = document.createElement('img');
            sliderBg.src = Fusion.getAssetPathForWidget("Navigator", "sliderscale.png");
            sliderBg.className = 'png24';
            sliderBg.width = 51;
            sliderBg.height = 201;
            sliderBg.style.position = 'absolute';
            sliderBg.style.left = '0px';
            sliderBg.style.top = '0px';
            sliderBg.useMap = '#Navigator_ImageMap';
            this.domObj.appendChild(sliderBg);

            var handleDiv = document.createElement('div');
            handleDiv.style.position = 'absolute';
            handleDiv.style.top = '6px';
            handleDiv.style.left = '6px';
            handleDiv.style.width = '39px';
            handleDiv.style.height = '16px';
            this.domObj.appendChild(handleDiv);

            var sliderDiv = document.createElement('div');
            sliderDiv.style.position = 'absolute';
            sliderDiv.style.top = '44px';
            sliderDiv.style.left = '0px';
            sliderDiv.style.width = '51px';
            sliderDiv.style.height = '85px';
            this.domObj.appendChild(sliderDiv);

            var sliderHandle = document.createElement('img');
            sliderHandle.src = Fusion.getAssetPathForWidget("Navigator", "slider.png");
            sliderHandle.className = 'png24';
            sliderHandle.width = 29;
            sliderHandle.height = 12;
            sliderHandle.style.position = 'absolute';
            sliderHandle.style.left = '11px';
            sliderHandle.style.top = '49px';
            sliderDiv.appendChild(sliderHandle);

            this.activityIndicator = document.createElement('img');
            this.activityIndicator.src = Fusion.getAssetPathForWidget("Navigator", "spinner.gif");
            this.activityIndicator.width = 18;
            this.activityIndicator.height = 6;
            this.activityIndicator.style.position = 'absolute';
            this.activityIndicator.style.top = '3px';
            this.activityIndicator.style.right = '4px';
            handleDiv.appendChild(this.activityIndicator);

            this.domObj.style.position = 'absolute';
            this.domObj.style.zIndex = 1000;
            this.domObj.style.width = '51px';
            this.domObj.style.height = '204px';
            this.domObj.style.cursor = 'pointer';

            new Moveable(this.domObj);

            // need to disable active map controls when the mouse is over the navigator
            /*
            this.domObj.addEvents({
                mouseenter: OpenLayers.Function.bind(this.mouseEnter,this),
                mouseleave: OpenLayers.Function.bind(this.mouseLeave,this)
            });
            */
            /*
            //set up the navigator as draggable
            new Drag(this.domObj, {
                handle: handleDiv,
                onComplete: checkPosition,
                preventDefault: true
            });

            this.slider = new Slider(sliderDiv, sliderHandle, {
                mode: 'vertical',
                steps: 81,
                snap: true,
                onComplete: OpenLayers.Function.bind(this.scaleChanged, this)
            });
            */
            // precompute this for efficiency
            this.LN9 = Math.log(9);

            topic.subscribe(Map.Events.LOADING, OpenLayers.Function.bind(this.onMapLoading, this));
            topic.subscribe(Map.Events.LOADED, OpenLayers.Function.bind(this.onMapLoaded, this));
            //topic.subscribe(Map.Events.RESIZED, OpenLayers.Function.bind(this.checkPosition, this));
            topic.subscribe(Map.Events.EXTENTS_CHANGED, OpenLayers.Function.bind(this.updateSlider, this));
        },
        onMapLoading: function() {
            console.log("Map loading");
            this.activityIndicator.style.visibility = 'visible';
        },
        onMapLoaded: function() {
            console.log("Map loaded");
            this.activityIndicator.style.visibility = 'hidden';
        },
        updateSlider: function() {
            console.log("Map extents changed to: " + this.getMap().getCurrentExtents());
            var map = this.getMap().oMapOL;
            var baseLayer = map.baseLayer
            if (baseLayer.singleTile) {
                //this.slider.steps = 81;
                var resolution = map.getResolution() - baseLayer.minResolution;
                var scale = OpenLayers.Util.getScaleFromResolution(resolution, baseLayer.units);
                var position = 9*Math.log(scale)/this.LN9;
                this.bInternalChange = true;
                //this.slider.set(position);
                this.bInternalChange = false;
            } else {
                //this.slider.steps = map.baseLayer.resolutions.length - 1;
                var position = map.baseLayer.resolutions.length -1 - map.getZoom();
                this.bInternalChange = true;
                //this.slider.set(position);
                this.bInternalChange = false;
            }
        },
        pan: function(x,y,e) {
            //console.log('pan by : ' + x + ', ' + y);
            var map = this.getMap();
            var center = map.getCurrentCenter();
            var res = map.oMapOL.getResolution();
            var size = map.oMapOL.getSize();
            map.zoom(center.x + (x * size.w * res), center.y + (y * size.h * res), 1);
            //new Event(e).stop();
            OpenLayers.Event.stop(e);
            return false;
        },
        zoom: function(factor, e) {
            //console.log('zoom by factor: ' + factor);
            var map = this.getMap();
            var center = map.getCurrentCenter();
            map.zoom(center.x, center.y, factor);
            OpenLayers.Event.stop(e);
            return false;
        },
    });
    return Navigator;
});