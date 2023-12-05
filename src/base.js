
"use strict";

gee.hook('react', function (me) {
    let ta = $(me.event.target);

    if (!ta.attr('func')) {
        ta = ta.parent();
    }

    let func = ta.attr('func');
    let type = ta.data('event') || 'click';

    gee.clog(func);

    if (type === me.event.type && gee.check(func)) {
        ta.event = me.event;
        gee.exe(func, ta);
    }
});

gee.hook('alert', function (me) {
    let title = me.title || me.data('title');
    let content = me.txt || me.data('txt');

    // $('#errorModal')
    // .find('.title').html(title).end()
    // .find('.content').html(content).end()
    // .modal('show');
    alert(content);
});

gee.hook('resetForm', function (me) {
    let form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
    form[0].reset();
});

gee.hook('stdSubmit', function (me) {
    let g = $.fn.gene,
        form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form'),
        dAction = function () {

            me.removeAttr('disabled').find('i').remove();

            if (this.code !== 1) {
                if (gee.isset(this.data) && gee.isset(this.data.msg)) {
                    gee.alert({
                        title: 'Alert!',
                        txt: this.data.msg
                    });
                } else {
                    g.alert({
                        title: 'Error!',
                        txt: 'Server Error, Plaese Try Later(' + this.code + ')'
                    });
                }
            } else {
                if (me.attr('reset') === '1') {
                    form[0].reset();
                }

                if (gee.isset(this.data.msg)) {
                    gee.alert({
                        title: 'Alert!',
                        txt: this.data.msg
                    });
                }

                if (gee.isset(this.data.uri)) {
                    location.href = (this.data.uri === '') ? g.apiUri : this.data.uri;
                }

                if (gee.isset(this.data.goback)) {
                    history.go(-1);
                }

                if (gee.isset(this.data.reset)) {
                    form[0].reset();
                }

                if (gee.check(this.data.func)) {
                    gee.clog(this.data.func);
                    gee.exe(this.data.func, me);
                }
            }
        };

    form.find('input').each(function () {
        if ($(this).val() == $(this).attr('placeholder')) $(this).val('');
    });

    if (!$.validatr.validateForm(form)) {
        return false;
    } else {
        me.attr('disabled', 'disabled').append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');

        g.yell(me.data('uri'), form.serialize(), dAction, dAction);
    }
});

/**
 * 自動切換至指定欄位
 */
gee.hook('autoNext', function (me) {
    let $ta = $(me.data('ta')) || me.next('input'),
        v = me.val();

    if (v.length == me.attr('maxlength')) {
        if ($ta.length) {
            $ta.get(0).focus();
            $ta.get(0).select();
        }
    }
}, 'keyup');


gee.hook('syncAll', function (me) {
    let form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form'),
        source = me.data('source') ? $('#' + me.data('source')) : me.closest('form'),
        prefix = me.data('prefix');

    form.find('input[name|=\'' + prefix + '\']').each(function () {
        let n = $(this).attr('name').replace(prefix + '-', ''),
            v = source.find('input[name=\'' + n + '\']').val()
        $(this).val(v);
    });
});
