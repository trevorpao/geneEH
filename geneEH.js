var geneEH;
(function($){
    if (typeof($.fn.geneEH)=="undefined") {
        $.fn.geneEH = {
            goback: function (me){
                history.go(-1);
            },

            stdSubmit: function (me){
                var g = $.fn.geneEH,
                    f = me.data("ta") ? $("#"+ me.data("ta")) : me.closest("form")
                    uri = me.data('uri');

                if (me.data("busy") != 1) {
                    me.data("busy", 1);
                    //$("#loading").show(); //need some loading animation

                    f.find("input").each(function () { if (me.val() == me.attr("placeholder")) me.val(""); });

                    $.ajax({
                        "url": uri,
                        "type": "POST",
                        "data": f.serialize(),
                        "dataType": "json",
                        "cache": false
                    })
                    .done(function(j) {
                            if (j.error == "0") {
                                f[0].reset();

                                if ( g.isset(j.rData.uri) ) {
                                    location.href = j.rData.uri;
                                }
                                if ( g.isset(j.rData.func) ) {
                                    window[j.rData.fun];
                                }
                                if ( g.isset(j.rData.goback) ) {
                                    history.go(-1);
                                }
                            }else{
                                g.err(j.message);
                            }
                    })
                    .fail(function(o, s) {
                        g.err('ajax fail('+ o.status +')!!');
                    })
                    .always(function() {
                        g.clog("ajax complete");
                        me.data("busy", 0);
                        //$("#loading").hide();  //need some loading animation
                    });
                }
                else {
                    g.clog("busy now");
                }
            },

            resetForm: function (me){
                var f = me.data("ta") ? $("#"+ me.data("ta")) : me.closest("form");
                f[0].reset();
            },

            getChainOption: function (me){
                var g = $.fn.geneEH,
                    ta = me.data('ta'),
                    uri = me.data('uri'),
                    v = me.val();

                $.get(
                    uri+ '&pid='+ v,
                    function(data) {
                        $('#'+ ta).html(data);
                    }
                );
            },

            alert: function (me){
                var g = $.fn.geneEH;

                alert(me.data("txt"));
            },

            test: function (me){
                var g = $.fn.geneEH;

                g.clog(me);
            },

            debug: 0,
            tags: [],
            evts: {},
            taClass: 'initGEH',

            exe: function (func, args ) {
                var g = $.fn.geneEH,
                    fun = (!g.check(func))?g['404']:g[func];

                return fun.call(this, args);
            },

            load: function (functionName){
                var g = $.fn.geneEH,
                    loc = window.location.pathname
                    dir = loc.substring(0, loc.lastIndexOf('/')) + "/";

                dir += (g.isset($("script[src$='geneEH.js']"))) ?
                    $("script[src$='geneEH.js']").attr("src").replace("geneEH.js", "") : "";

                if (!g.check(functionName)) {
                    g.clog("start loading");
                    if(typeof importScripts == "function") {
                        g.clog("start importScripts");
                        importScripts(dir +'src/'+ functionName +'.js');
                    }
                    else {
                        $("body").append("<script src='"+ dir +"src/"+ functionName +".js'>\x3C/script>");
                    }
                }
            },

            "404": function (me){
                var g = $.fn.geneEH;
                g.err('command not found!!');
            },

            err: function (txt) {
                if (txt != "")
                    this.clog("Error::"+ txt);
                else
                    this.clog('Error::unknown error!!');
            },

            check: function (functionName){
                var g = $.fn.geneEH;
                return g.isset(g[functionName]);
            },

            clog: function (txt){
                var g = $.fn.geneEH;
                if(g.isset( console ) && g.debug == 1) {
                    if (typeof txt == "string" || typeof txt == "number") {
                        console.log("geneEH::" + txt);
                    }
                    else {
                        console.log("geneEH::" + typeof(txt));
                        console.log(txt);
                    }
                }
            },

            hookTag: function(newTagName, func) {
                var g = $.fn.geneEH;
                if(!g.check(newTagName)){
                    g.tags.push(newTagName);
                    g.hook(newTagName, func);
                }else{
                    g.clog(functionName + " overwrite?");
                }
            },

            hook: function (functionName , fun, evt) {
                var g = $.fn.geneEH;
                if(!g.check(functionName)){
                    g[functionName] = fun;
                    g.evts[functionName] = (evt != "undefined") ? evt : "click";
                }else{
                    g.clog(functionName + " overwrite?");
                }
            },

            unhook: function (functionName , fun) {
                var g = $.fn.geneEH;
                if(g.check(functionName)){
                    delete g[functionName];
                }else{
                    g.clog(functionName + " exist?");
                }
            },

            isset: function (obj) {
                if(typeof obj == "undefined"){
                    return false;
                }else{
                    return true;
                }
            },

            init: function (){
                var g = $.fn.geneEH;

                for(var tk in g.tags){
                    g.exe(g.tags[tk], $(g.tags[tk]));
                }

                $('.'+ g.taClass).each(function(){
                    var me = $(this),
                        e = me.data('event'),
                        b = me.data('behavior'),
                        ebi = me.data('gene'),
                        meb = {};

                    if(!g.isset(b)){
                        b = "404";
                    }

                    if(!g.isset(e)){
                        e = (!g.isset(g.evts[b])) ? "click" : g.evts[b];
                    }

                    if (!g.isset(ebi)) {
                        meb[e] = b;
                    }
                    else {
                        eba = ebi.replace(" ", "").split(",");
                        for(var ai = 0; ai < eba.length; ai++){
                            ebo = eba[ai].split(":");
                            meb[ebo[0]] = ebo[1];
                        }
                    }
                    g.clog(meb);

                    me.data("meb", meb).unbind();

                    for(var e in meb){
                        if (!g.check(meb[e])) {
                            g.clog("undefined::"+ meb[e]);
                            g.load(meb[e]);
                        }

                        if(e=="init"){
                            g.exe(meb[e], me);
                        }else{
                            me.on(e, function(evt){
                                evt.preventDefault();
                                g.exe(me.data("meb")[evt.type], me);
                            });
                        }
                    }
                }).removeClass(g.taClass);
            }
        };

        $.fn.applyGEH = function (ta, obj) {
            var g = $.fn.geneEH;
            if(g.isset(ta)){
                g.exe(ta, obj);
            }else{
                var b = this.data("behavior");
                g.exe(b, this);
            }

            return this;
        };
    }
})(jQuery);

geneEH = $.fn.geneEH;

// just a sample for customer tag
geneEH.hookTag('geneEH\\:loginbtn', function(me) {
    var uniqid = "login"+ Math.floor(Math.random()*999+1),
        parentUri = decodeURIComponent( document.location.href );

    me.replaceWith('<div id="loginDiv"></div>');
});

geneEH.hook("autoNext", function (me){
    var $ta = $("#" + me.data("ta")),
        v = me.val();

    if( v.length == me.attr('maxlength')){
        if ($ta.length) {
            $ta.focus().select();
        }
        else {
            me.next("input").focus().select();
        }
    }
}, 'keyup');

$(document).ready(function(){
    geneEH.debug = 1;
    geneEH.init();
});