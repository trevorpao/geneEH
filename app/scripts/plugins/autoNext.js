
/**
 * 多語系切換按鈕
 */
;(function(gee, $) {
    'use strict';
    gee.hook('autoNext', function (me){
        var $ta = $(me.data('ta')),
            v = me.val();

        if( v.length == me.attr('maxlength')){
            if ($ta.length) {
                $ta.focus().select();
            }
            else {
                me.next('input').focus().select();
            }
        }
    }, 'keyup');
}(gee, jQuery));
