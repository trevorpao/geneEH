/**
 * 自動切換至指定欄位
 */
'use strict';

;(function(gee, $) {
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
