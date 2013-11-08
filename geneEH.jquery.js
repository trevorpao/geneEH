"use strict";

(function($){
    if (typeof $.fn.geneEH == "undefined") {
        $.fn.geneEH = {
            debug:      0,
            tags:       [],
            evts:       {},
            scriptName: 'geneEH.jquery',
            taClass:    'gee',
            apiUri:     '/',
            dAction:    '',

            goback: function (me){
                history.go(-1);
            },

            //表單驗証
            formValidate: function (me) {
                var g   = $.fn.geneEH,
                    chk = 1;

                me.find("input[require], select[require]").each(function () {

                    if (chk==0) {
                        return chk;
                    }

                    var $ci = $(this), label = $ci.attr("title") || $ci.attr("name"), txt = "";

                    if ($ci.is(":visible")){

                        if ($ci.ifEmpty()) {
                            txt = '請输入'+ label;
                            chk = 0;
                        }

                        if( $ci.attr("require") == "password" ){
                            if ($ci.ifErrPasswd()) {
                                txt = label +'：請確認是否符合 4~12 字英文及數字';
                                chk = 0;
                            }
                        }

                        if( $ci.attr("require") == "sameWith" ){
                            var $ta = $('#'+ $ci.data('ta'));
                            if ($ci.val()!= $ta.val()) {
                                txt = label +'不符合'+ $ta.attr("title");
                                chk = 0;
                            }
                        }

                        if( $ci.attr("require") == "email" ){
                            if ($ci.ifErrEmail()) {
                                txt = label +'：請確認是否符合 Email 格式';
                                chk = 0;
                            }
                        }

                        if( $ci.attr("require") == "chinese" ){
                            if ($ci.ifErrChinese()) {
                                txt = label +'：請確認是否為全中文';
                                chk = 0;
                            }
                        }

                        if( $ci.attr("require") == "number" ){
                            if ($ci.ifErrNumber()) {
                                txt = label +'：請確認是否符合數字格式';
                                chk = 0;
                            }

                            if ($ci.data("min") && chk == 1) {
                                if ($ci.data("min") > $ci.val()) {
                                    txt = ''+ label +'：應大於 '+ $ci.data("min");
                                    chk = 0;
                                }
                            }

                            if ($ci.data("max") && chk == 1) {
                                if ($ci.data("max") > $ci.val()) {
                                    txt = ''+ label +'：應小於 '+ $ci.data("max");
                                    chk = 0;
                                }
                            }
                        }

                    }

                    if (chk==0) {
                        g.alert({ title:'Error!', txt: txt });
                    }
                });

                return chk;
            },

            stdSubmit: function (me){
                var g = $.fn.geneEH,
                    f = me.data("ta") ? $("#"+ me.data("ta")) : me.closest("form"),
                    act = me.data('action') || g.dAction,
                    dAction = function(){

                    if ( gee.isset(this.data.msg) ) {
                        gee.alert({ title:'Alert!', txt:this.data.msg });
                    }

                    if ( gee.isset(this.data.uri) ) {
                        location.href = this.data.uri;
                    }

                    if ( gee.isset(this.data.goback) ) {
                        history.go(-1);
                    }

                    if ( gee.check(this.data.func) ) {
                        gee.clog(this.data.func);
                        gee.exe(this.data.func, me);
                    }
                };

                if(!g.formValidate(f)) return false;

                f.find("input").each(function () { if (me.val() == me.attr("placeholder")) me.val(""); });

                g.yell(me.data('uri'), f.serialize() + "&action=" + act, dAction, dAction);

                f[0].reset();
            },

            yell: function(uri, postData, successCB, errorCB, hideLoadAnim){
                var g = $.fn.geneEH;

                if (!hideLoadAnim) {
                    g.loadAnim('show');
                }

                $.ajax({
                    "url": uri || g.apiUri + '/api.php',
                    "type": "POST",
                    "data": postData,
                    "dataType": "json",
                    "cache": false
                })
                .done(function(j) {
                    if (j) {
                        g.clog(j);
                        if (!gee.isset(j.error)) {
                            if (j.success) {
                                if (typeof successCB == 'function') {
                                    successCB.call(j);
                                }
                            }
                            else {
                                if (typeof errorCB == 'function') {
                                    errorCB.call(j);
                                }
                            }
                        }
                        else {
                            g.alert({ title:'Error!', txt:j.error.message });
                        }
                    }
                    else {
                        g.alert({ title:'Error!', txt:"伺服器錯誤，請稍後重試(2)"});
                    }
                })
                .fail(function(o, s) {
                    g.err('ajax fail('+ o.status +')!!');
                })
                .always(function() {
                    g.clog("ajax complete");
                    if (!hideLoadAnim) {
                        g.loadAnim('hide');
                    }
                });
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

            loadAnim: function(command){
                var obj = $('body'),
                    anim = (command == 'show' || obj.hasClass("loadAnim")) ? 'show' : 'hide';

                if (anim == 'hide' || command == 'hide') {
                    obj.removeClass("loadAnim");
                }
                else {
                    obj.addClass("loadAnim");
                }
            },

            alert: function (me){
                var g = $.fn.geneEH, txt = me.txt || me.data("txt");

                alert(txt);
            },

            test: function (me){
                var g = $.fn.geneEH;

                g.clog(me);
            },

            exe: function (func, args ) {
                var g = $.fn.geneEH,
                    fun = (!g.check(func))?g['404']:g[func];

                g.clog("exe::" + func);

                return fun.call(this, args);
            },

            pageController: function(me){
                var g = $.fn.geneEH, func = 'load'+ me.attr('id').capitalize();
                if (!g.check(func)) {
                    g.clog("load:::"+ func);
                    g.load(func, 'controller');
                }

                if (!g.check(func)) {
                    g.clog("load fail:::"+ func);
                }
                else {
                    g.clog("start::"+ me.attr('id').capitalize());
                    g.exe(func, me);
                }
            },

            load: function (functionName, sf){
                var g = $.fn.geneEH,
                    loc         = window.location.pathname,
                    dir         = g.apiUri + '/js/',
                    subfloder   = sf || 'plugins';

                g.clog("script::"+ dir + subfloder +'/'+ functionName +'.js');

                if (!g.check(functionName)) {
                    if(typeof importScripts == "function") {
                        g.clog("start importScripts::");
                        importScripts(dir + subfloder +'/'+ functionName +'.js');
                    }
                    else {
                        g.clog("start scripttag::");
                        $("#body").append("<script src='"+ dir + subfloder +'/'+ functionName +".js'>\x3C/script>");
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
                return g;
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
                if(typeof obj == "undefined" || obj == null){
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
                            g.clog("load:::"+ meb[e]);
                            g.load(meb[e]);
                        }
                        if (!g.check(meb[e])) {
                            g.clog("load fail:::"+ meb[e]);
                        }

                        if(e=="init"){
                            g.exe(meb[e], me);
                        }else{
                            me.on(e, function(evt){
                                if (me.data('nopde') != 1) {
                                    evt.preventDefault();
                                }

                                me.event = evt;

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

var gee = gee || $.fn.geneEH;

/*
base lib
*/
$.fn.ifEmpty = function(){
    if(this.val()=="" || this.val()==this.attr("placeholder"))
        return true;
    else
        return false;
}

$.fn.ifErrEmail = function(){
    var str = this.val(), erp = /[\w-]+@([\w-]+\.)+[\w-]+/;

    if(erp.test(str) != true)
        return true;
    else
        return false;
}

$.fn.ifErrPasswd = function(){
    var str = this.val(), erp = /^(?=.*\d)(?=.*[a-zA-Z]){2,}(?=.*[a-zA-Z])(?!.*\s).{4,12}$/;

    if(erp.test(str) != true)
        return true;
    else
        return false;
}

$.fn.ifErrChinese = function () {
    var str = this.val(), erp = /[^\u4e00-\u9fa5]/;

    gee.clog(erp.test(str));

    if (erp.test(str) == true)
        return true;
    else
        return false;
};

$.fn.ifErrNumber = function () {
    var str = this.val(), erp = /^\d+$/;

    gee.clog("num::" + erp.test(str));

    if (erp.test(str) != true)
        return true;
    else
        return false;
};

if (typeof importScripts != "function") {
    var importScripts = (function (globalEval) {
        var xhr = new XMLHttpRequest;
        return function importScripts() {
            var args = Array.prototype.slice.call(arguments),
                len = args.length,
                i = 0,
                meta, data, content;
            for (; i < len; i++) {
                if (args[i].substr(0, 5).toLowerCase() === "data:") {
                    data = args[i];
                    content = data.indexOf(",");
                    meta = data.substr(5, content).toLowerCase();
                    data = decodeURIComponent(data.substr(content + 1));
                    if (/;\s*base64\s*[;,]/.test(meta)) {
                        data = atob(data);
                    }
                    if (/;\s*charset=[uU][tT][fF]-?8\s*[;,]/.test(meta)) {
                        data = decodeURIComponent(escape(data));
                    }
                } else {
                    xhr.open("GET", args[i], false);
                    xhr.send(null);
                    data = xhr.responseText;
                }
                globalEval(data);
            }
        };
    }(eval));
}