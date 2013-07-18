define(["fusion/core", "fusion/widget", "dojo/_base/declare"], function() {
    var Fusion = arguments[0];
    var Widget = arguments[1];
    var declare = arguments[2];

    var _defaultUrl = "widgets/About/About.html";

    var About = declare(Widget, {
        aboutUrl: null,
        nWidth: 500,
        nHeight: 400,
        initializeWidget: function(widgetTag) {
            var json = widgetTag.Extension ? widgetTag.Extension[0] : {};
            this.aboutUrl = (json.AboutURL) ? json.AboutURL[0] : _defaultUrl;
            if (this.aboutUrl == _defaultUrl) {
                this.aboutUrl = Fusion.getLibPath() + _defaultUrl;
            }
        },
        activate: function() {
            var sFeatures = 'menubar=no,location=no,resizable=no,status=no';
            sFeatures += ',width=' + this.nWidth;
            sFeatures += ',height=' + this.nHeight;
            window.open(this.aboutUrl, 'AboutPopup', sFeatures);
        }
    });
    return About;
});