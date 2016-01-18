define([], function() {
    /**
     * StringBundle is a utility class that centralizes access to all the various localized strings
     * in fusion and its supporting libraries
     */
    var StringBundle = {
        i18n: function(key) {
            var str = null; //TODO: Replace stub
            if (str == key)
                console.warn("Could not find translated string for key: " + key);
            return str || key;
        }
    };
    return StringBundle;
});