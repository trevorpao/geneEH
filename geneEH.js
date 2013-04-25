(function($){
    if (typeof($.fn.geH)=="undefined") {
        $.fn.geH = {
            goback: function (me){
                history.go(-1);
            },

            getChainOption: function (me){
                var ta = me.data('ta'), v = me.val();
                $.get(
                    'index.php?action=get'+ ta +'Option&pid='+ v,
                    function(data) {
                        $('#'+ ta).html(data);
                    }
                );
            },

            test: function (me){
                var ta = me.data('ta'), v = me.val();
                clog(this);
            },

            "default": function (me){
                create("error", { title:'Error!', text:'沒有收到正確的行為指令!!'});
            },

            err: function (me) {
                if (me.message != "")
                    create("error", { title:'Error!', text:me.message});
                else
                    create("error", { title:'Error!', text:'不明原因的失败'});
            },

            exe: function (func, args ) {
                var fun = (!this.check(func))?this['default']:this[func];

                return fun.call(this, args);
            },

            check: function (functionName){
                if(typeof(this[functionName])=="undefined"){
                    return false;
                }else{
                    return true;
                }
            },

            hook: function (functionName , fun) {
                if(!this.check(functionName)){
                    this[functionName] = fun;
                }else{
                    alert(functionName + " overwrite?");
                }
            },

            unset: function (functionName , fun) {
                if(this.check(functionName)){
                    delete this[functionName];
                }else{
                    alert(functionName + " exist?");
                }
            },

            init: function (){ //一般性的按鈕初始化
                var ehThis = this;
                $('.initGEH').each(function(){
                    var me = $(this), e = me.data('event'); //多事件模式
                    if(e==""){
                        e = "click";
                    }
                    if(e=="init"){
                        var a = me.data('action'); //多 action 模式
                        if(a!=""){
                            aa = a.split(",");
                            for(var ai = 0; ai < aa.length; ai++){
                                ehThis.exe(aa[ai], me);
                            }
                        }
                    }else{
                        me.unbind().bind(e, function(){
                            var a = me.data('action'); //多 action 模式
                            if(a!=""){
                                aa = a.split(",");
                                for(var ai = 0; ai < aa.length; ai++){
                                    ehThis.exe(aa[ai], me);
                                }
                            }
                        });
                    }
                }).removeClass('initGEH');
            }
        };

        $.fn.applyGEH = function (ta, obj) {
            if(typeof(ta)!="undefined"){
                $.fn.geH.exe(ta, obj);
            }else{
                var a = this.data("action");
                $.fn.geH.exe(a, this);
            }

            return this;
        };
    }
})(jQuery);