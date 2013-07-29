/**
 * The MapMessage module exports the MapMessage class, a floating message bar for the {@link Map} widget. See: {@link MapMessage}
 * @module fusion/mapmessage
 */
define([
    "fusion/core",
    "dojo/dom",
    "dojo/_base/declare",
    "dojo/_base/fx",
    "dojo/dom-style",
], function(Fusion, dom, declare, fx, domStyle) {
    
    /**
     * The MapMessage class provides a floating message bar for passive notification messages
     *
     * Do not call this constructor, require() this module or create new MapMessage widget instances directly! 
     * The {@link Map} widget will create one as part of its initialization
     *
     * @class MapMessage
     */
    var MapMessage = declare(null, {
        parentNode : null,
        domObj : null,
        leadingIcon : null,
        textCell : null,
        message : "",
        
        infoIconName : "icons/info.png",
        warningIconName : "icons/warning.png",
        errorIconName : "icons/error.png",
        
        containerCssText : "position:absolute; z-index:900; padding:10px; border:solid 2px #ECECEC; background:#FFFFBB",
        iconCssText : "margin-right:10px",
        textCellCssText : "width:100%; vertical-align:top; font: 8pt Tahoma",

        opacity: 0.95,
        
        constructor : function(args)
        {
            this.parentNode = args.parent;
        },
        
        createBar : function()
        {
            try {
                if (!this.container)
                {
                    // Create the div container
                    var container   = document.createElement("div");
                    container.style.visibility = "hidden";
                    this.container  = container;
                    this.parentNode.appendChild(container);
                }

                this.container.style.cssText = this.containerCssText;
                var offset = {left:10, top:10};
                this.container.style.left = offset.left + "px";
                this.container.style.top  = offset.top  + "px";
                
                this.container.innerHTML = "";
                
                // Create the inner table
                var table = document.createElement("table");
                this.container.appendChild(table);
                table.style.width = "100%";
                table.cellSpacing = "0";
                table.cellPadding = "0";
                table.border      = "0";
                // Create the table row
                var row   = table.insertRow(0);
                // The icon cell
                var cell  = row.insertCell(0);
                // Add the info icon by default
                var icon  = document.createElement("img");
                icon.src  = Fusion.getAssetPath() + this.infoIconName;
                cell.appendChild(icon);
                icon.style.cssText = this.iconCssText;
                this.leadingIcon   = icon;
                // Create the text cell
                cell      = row.insertCell(1);
                cell.style.cssText = this.textCellCssText;
                this.textCell = cell;
                this.textCell.innerHTML = this.message;
                
                this.refreshLayout();
                // Hide message bar by default
                domStyle.set(this.container, "opacity", "0");
                this.container.style.visibility = "visible";
            } catch (e) {
                Fusion.reportError(e);
            }
        },
        
        removeBar : function()
        {
            if (typeof (this.container) != "undefined" && this.container != null)
            {
                //this.container.fade(0);
                window.setTimeout((function()
                {
                    if (typeof (this.container) != "undefined" && this.container != null)
                    {
                        this.container.parentNode.removeChild(this.container);
                        this.container = null;
                    }
                    
                }).bind(this), 500);
            }
        },
        
        /**
         * Displays an informational message on the Map Message notification bar
         * 
         * @param {String} message The message to display
         * @memberof MapMessage
         * @instance
         */
        info : function(message)
        {
            this.message = message;
            this.show();
            this.leadingIcon.src = Fusion.getAssetPath() + this.infoIconName;
        },
        
        /**
         * Displays a warning message on the Map Message notification bar
         * 
         * @param {String} message The message to display
         * @memberof MapMessage
         * @instance
         */
        warn : function(message)
        {
            this.message = message;
            this.show();
            this.leadingIcon.src = Fusion.getAssetPath() + this.warningIconName;
        },
        
        /**
         * Displays an error message on the Map Message notification bar
         * 
         * @param {String} message The message to display
         * @memberof MapMessage
         * @instance
         */
        error : function(message)
        {
            this.message = message;
            this.show();
            this.leadingIcon.src = Fusion.getAssetPath() + this.errorIconName;
        },
        
        /**
         * Hides the notification bar and clears all content
         * @memberof MapMessage
         * @instance
         */
        clear : function()
        {
            this.message = "";
            this.textCell.innerHTML = "";
            this.hide();
        },
        
        /**
         * Displays the notification bar
         * @memberof MapMessage
         * @instance
         */
        show : function()
        {
            this.createBar();
            this.textCell.innerHTML = this.message;
            //this.container.fade(this.opacity);
            domStyle.set(this.container, "opacity", this.opacity);
        },
        
        /**
         * Hides the notification bar
         * @memberof MapMessage
         * @instance
         */
        hide : function()
        {
            this.removeBar();
        },
        
        hideDesignatedMessage: function(message)
        {
            if(message == this.message)
            {
                this.removeBar();
            }
        },
        
        refreshLayout: function()
        {
            if (typeof (this.container) != "undefined" && this.container != null)
            {
                // 44 = 2 * padding (10) + 2 * offset(10) + 2 * border (2)
                var newWidth = this.parentNode.offsetWidth - 44;
                if (newWidth >= 0)
                    this.container.style.width  = this.parentNode.offsetWidth - 44 + "px";
            }
        }
    });

    return MapMessage;
});