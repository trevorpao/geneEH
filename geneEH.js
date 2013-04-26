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

            test: function (me){
                var g = $.fn.geneEH,
                    ta = me.data('ta'),
                    v = me.val();

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
                var g = $.fn.geneEH;
                if (g.check(functionName)) {
                    if(typeof importScripts == "function") {
                        importScripts(window.location.pathname +'src/'+ functionName +'.js');
                    }
                    else {
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
                        b = me.data('behavior');

                    if(!g.isset(b)){
                        b = "404";
                    }
                    g.clog("behavior::"+ b);

                    if(!g.isset(e)){
                        e = (!g.isset(g.evts[b])) ? "click" : g.evts[b];
                    }
                    g.clog("event::"+ e);

                    if (!g.check(b)) {
                        g.load(b);
                    }

                    if(e=="init"){
                        g.exe(b, me);
                    }else{
                        me.unbind().bind(e, function(evt){
                            evt.preventDefault();
                            g.exe(b, me);
                        });
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
geneEH.hookTag('gehTag\\:loginbtn', function(me) {
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

// if need to create new event(sync)?
geneEH.hook("syncAll", function (me){
    var $ta = $("." + me.data("ta")),
        v = me.val()
        $s = $("." + me.data("source"));
    // 1vs1 clone?
});

$(document).ready(function(){
    geneEH.debug = 1;
    geneEH.init();
});