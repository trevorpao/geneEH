(function($){
    if (typeof($.fn.geH)=="undefined") {
        $.fn.geH = {
            goback: function (me){
                history.go(-1);
            },

            stdSubmit: function (me){
                var f = me.data("ta") ? $("#"+ me.data("ta")) : me.closest("form");

                $("#loading").show(); //need some loading animation

                f.find("input").each(function () { if (me.val() == me.attr("placeholder")) me.val(""); });

                $.ajax({
                    "url": buri+"/",
                    "type": "POST",
                    "data": f.serialize(),
                    "success": function (j) {
                        if (j.error == "0") {
                            f[0].reset();

                            if ( typeof(j.rData.uri) != "undefined" ) {
                                location.href = j.rData.uri;
                            }
                            if ( typeof(j.rData.fun) != "undefined" ) {
                                window[j.rData.fun];
                            }
                            if ( typeof(j.rData.goback) != "undefined" ) {
                                history.go(-1);
                            }
                        }else{
                            this.err(j);
                        }
                        $("#loading").hide();  //need some loading animation
                    },
                    "dataType": "json",
                    "cache": false
                });
            },

            resetForm: function (me){
                var f = me.data("ta") ? $("#"+ me.data("ta")) : me.closest("form");
                f[0].reset();
            },

            getChainOption: function (me){
                var ta = me.data('ta'), uri = me.data('uri'), v = me.val();
                $.get(
                    uri+ '&pid='+ v,
                    function(data) {
                        $('#'+ ta).html(data);
                    }
                );
            },

            test: function (me){
                var ta = me.data('ta'), v = me.val();
                this.clog(me);
            },

            debug: 0,
            tags: [],
            taClass: 'initGEH',

            exe: function (func, args ) {
                var fun = (!this.check(func))?this['404']:this[func];

                return fun.call(this, args);
            },

            load: function (functionName){
                if(typeof this[functionName] == "undefined"){
                    if(typeof importScripts == "function") {
                        importScripts(window.location.pathname +'src/'+ functionName +'.js');
                    }
                    else {
                    }
                }
            },

            "404": function (me){
                this.err({ message: 'command not found!!' });
            },

            err: function (me) {
                if (me.message != "")
                    this.clog("Error::"+ me.message);
                else
                    this.clog('Error::unknown error!!');
            },

            check: function (obj){
                if(typeof this[obj] == "undefined"){
                    return false;
                }else{
                    return true;
                }
            },

            clog: function (txt){
                if(typeof console != "undefined" && this.debug == 1) {
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
                if(!this.check(newTagName)){
                    this.tags.push(newTagName);
                    this.hook(newTagName, func);
                }else{
                    this.clog(functionName + " overwrite?");
                }
            },

            hook: function (functionName , fun) {
                if(!this.check(functionName)){
                    this[functionName] = fun;
                }else{
                    this.clog(functionName + " overwrite?");
                }
            },

            unset: function (functionName , fun) {
                if(this.check(functionName)){
                    delete this[functionName];
                }else{
                    this.clog(functionName + " exist?");
                }
            },

            init: function (){
                var geh = this;

                for(var tk in geh.tags){
                    geh.exe(geh.tags[tk], $(geh.tags[tk]));
                }

                $('.'+ geh.taClass).each(function(){
                    var me = $(this),
                        e = me.data('event'),
                        b = me.data('behavior');

                    if(typeof e == "undefined"){
                        e = "click";
                    }
                    geh.clog("event::"+ e);

                    if(typeof b == "undefined"){
                        b = "404";
                    }
                    geh.clog("behavior::"+ b);

                    if (!geh.check(b)) {
                        geh.load(b);
                    }

                    if(e=="init"){
                        geh.exe(b, me);
                    }else{
                        me.unbind().bind(e, function(evt){
                            evt.preventDefault();
                            geh.exe(b, me);
                        });
                    }
                }).removeClass(geh.taClass);
            }
        };

        $.fn.applyGEH = function (ta, obj) {
            if(typeof(ta)!="undefined"){
                $.fn.geH.exe(ta, obj);
            }else{
                var b = this.data("behavior");
                $.fn.geH.exe(b, this);
            }

            return this;
        };
    }
})(jQuery);

// just a sample for customer tag
$.fn.geH.hookTag('gehTag\\:loginbtn', function(me) {
    var uniqid = "login"+ Math.floor(Math.random()*999+1),
        parentUri = decodeURIComponent( document.location.href );

    me.replaceWith('<div id="loginDiv"></div>');
});

$.fn.geH.hook("autoNext", function (me){
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
});

// if need to create new event(sync)?
$.fn.geH.hook("syncAll", function (me){
    var $ta = $("." + me.data("ta")),
        v = me.val()
        $s = $("." + me.data("source"));
    // 1vs1 clone?
});

$(document).ready(function(){
    $.fn.geH.debug = 1;
    $.fn.geH.init();
});