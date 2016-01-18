define([
    "dojo/request",
    "fusion/framework/core"
], function(request, Fusion) {
    return {
        createSession: function(user, pass) {
            return request.post(Fusion.config.webtier.url + "/session.json", {
                handleAs: "json",
                user: (user || "Anonymous"),
                password: (pass || "")
            });
        },
        getJson: function(path, params) {
            return request.get(Fusion.config.webtier.url + path, {
                handleAs: "json",
                query: params
            });
        },
        postJson: function(path, params) {
            return request.post(Fusion.config.webtier.url + path, {
                handleAs: "json",
                data: params
            });
        },
        putJson: function(path, params) {
            return request.put(Fusion.config.webtier.url + path, {
                handleAs: "json",
                data: params
            });
        },
        delJson: function(path, params) {
            return request.del(Fusion.config.webtier.url + path, {
                handleAs: "json",
                data: params
            });
        }
    };
});