(function() {
    'use strict';

    let gene = {
        debug: 0,
        tags: [],
        evts: {},
        funcs: {},
        scriptName: 'gee',
        subFolder: 'scripts/plugins',
        taClass: 'gee',
        apiUri: '/',

        stdSubmit: function(me) {

            var form = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form'),
                dAction = function() {

                    me.removeAttr('disabled').find('i').remove();

                    if (this.code == '1') {
                        if (me.attr('reset') === '1') {
                            form[0].reset();
                        }

                        if (gene.isset(this.data.msg)) {
                            gene.alert({
                                title: 'Alert!',
                                txt: this.data.msg
                            });
                        }

                        if (gene.isset(this.data.uri)) {
                            location.href = (this.data.uri === '') ? gene.apiUri : this.data.uri;
                        }

                        if (gene.isset(this.data.goback)) {
                            history.go(-1);
                        }

                        if (gene.isset(this.data.reset)) {
                            form[0].reset();
                        }

                        if (gene.check(this.data.func)) {
                            gene.clog(this.data.func);
                            gene.exe(this.data.func, me);
                        }
                    } else {
                        if (gene.isset(this.data) && gene.isset(this.data.msg)) {
                            gene.alert({
                                title: 'Alert!',
                                txt: this.data.msg
                            });
                        } else {
                            gene.alert({
                                title: 'Error!',
                                txt: 'Server Error, Plaese Try Later(' + this.code + ')'
                            });
                        }
                    }
                };

            form.find('input').each(function() {
                if ($(this).val() == $(this).attr('placeholder')) $(this).val('');
            });

            if (!$.validatr.validateForm(form)) {
                return false;
            } else {
                me.attr('disabled', 'disabled').append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');

                gene.yell(me.data('uri'), form.serialize(), dAction, dAction);
            }

        },

        yell: function(uri, postData, successCB, errorCB, type, hideLoadAnim) {

            var g = window.gene;
            var json = (uri.indexOf('://') == -1) ? 'json' : 'jsonp';
            type = type || 'POST';
            uri = (uri.indexOf('://') == -1) ? gene.apiUri + uri : uri;

            if (!hideLoadAnim) {
                gene.loadAnim('show');
            }

            $.ajax({
                    'url': uri,
                    'type': type,
                    'data': postData,
                    'dataType': json,
                    'cache': false
                })
                .done(function(j) {
                    if (j) {
                        gene.clog(j);
                        if (gene.isset(j.errorCode)) {
                            if (typeof errorCB == 'function') {
                                errorCB.call(j);
                            } else {
                                gene.alert({
                                    title: 'Error!',
                                    txt: 'Server Error, Plaese Try Later(' + j.errorCode + ')'
                                });
                            }
                        } else {
                            if (typeof successCB == 'function') {
                                successCB.call(j);
                            }
                        }
                    } else {
                        gene.alert({
                            title: 'Error!',
                            txt: 'Server Error, Plaese Try Later(2)'
                        });
                    }
                })
                .fail(function(o, s) {
                    gene.err('ajax fail(' + o.status + ')!!');
                })
                .always(function() {
                    gene.clog('ajax complete');
                    if (!hideLoadAnim) {
                        gene.loadAnim('hide');
                    }
                });
        },

        test: function(me) {
            gene.clog(me);
        },

        exe: function(func, args) {
            var fun = (!gene.check(func)) ? gene.funcs['notfound'] : gene.funcs[func];

            gene.clog('exe::' + func);

            return fun.call(this, args);
        },

        load: function(functionName) {
            var loc = window.location.pathname;

            gene.clog('script::' + gene.subFolder + '/' + functionName + '.js');

            if (!gene.check(functionName)) {
                if (typeof importScripts == 'function') {
                    gene.clog('start importScripts::');
                    importScripts(gene.subFolder + '/' + functionName + '.js');
                } else {
                    gene.clog('start scripttag::');
                    $('body').append('<script src="' + gene.subFolder + '/' + functionName + '.js">\x3C/script>');
                }
            }
        },

        notfound: function(me) {
            gene.err('command not found!!');
        },

        err: function(txt) {
            if (txt !== '')
                this.clog('Error::' + txt);
            else
                this.clog('Error::unknown error!!');
        },

        check: function(functionName) {
            return gene.isset(gene.funcs[functionName]);
        },

        clog: function(txt) {
            if (typeof console != 'undefined' && gene.debug == 1) {
                if (typeof txt == 'string' || typeof txt == 'number') {
                    console.log('gene::' + txt);
                } else {
                    console.log('gene::' + typeof(txt));
                    console.log(txt);
                }
            }
        },

        hookTag: function(newTagName, func) {
            if (!gene.check(newTagName)) {
                gene.tags.push(newTagName);
                gene.hook(newTagName, func);
            } else {
                gene.clog(newTagName + ' overwrite?');
            }
        },

        hook: function(functionName, fun, evt) {
            if (!gene.check(functionName)) {
                gene.funcs[functionName] = fun;
                gene.evts[functionName] = (evt != 'undefined') ? evt : 'click';
            } else {
                gene.clog(functionName + ' overwrite?');
            }
        },

        unhook: function(functionName, fun) {
            if (gene.check(functionName)) {
                delete gene.funcs[functionName];
            } else {
                gene.clog(functionName + ' exist?');
            }
        },

        isset: function(obj) {
            if (obj !== void 0 || obj === null) {
                return false;
            } else {
                return true;
            }
        },

        bindToEvt: function(evt) {
            var me = $(this);

            if (me.data('nopde') != 1) {
                evt.preventDefault();
                gene.clog('nopde');
            }

            me.event = evt;
            gene.clog('start');
            gene.exe(me.data('meb')[evt.type], me);
        },

        init: function() {
            for (var tk in gene.tags) {
                gene.exe(gene.tags[tk], $(gene.tags[tk]));
            }

            $('.' + gene.taClass).each(function() {
                var me = $(this),
                    e = me.data('event'),
                    b = me.data('behavior'),
                    ebi = me.data('gene'),
                    meb = {};

                if (!gene.isset(b)) {
                    b = 'notfound';
                }

                if (!gene.isset(e)) {
                    e = (!gene.isset(gene.evts[b])) ? 'click' : gene.evts[b];
                }

                if (!gene.isset(ebi)) {
                    meb[e] = b;
                } else {
                    var eba = ebi.replace(' ', '').split(',');
                    for (var ai = 0; ai < eba.length; ai++) {
                        var ebo = eba[ai].split(':');
                        if (!gene.isset(ebo[1])) {
                            ebo[1] = ebo[0];
                            ebo[0] = 'click';
                        }
                        meb[ebo[0]] = ebo[1];
                    }
                }

                gene.clog(meb);

                me.data('meb', meb).unbind();

                for (var ei in meb) {
                    if (!gene.check(meb[ei])) {
                        gene.clog('load:::' + meb[ei]);
                        gene.load(meb[ei]);
                    }

                    if (!gene.check(meb[ei])) {
                        gene.clog('load fail:::' + meb[ei]);
                    }

                    if (ei == 'init') {
                        gene.exe(meb[ei], me);
                    } else {
                        me.on(ei, gene.bindToEvt);
                    }
                }
            }).removeClass(gene.taClass);
        }
    };

    if (typeof window.gene == 'undefined') {
        window.gene = gene;
    }

})();

if (typeof importScripts !== 'function') {
    var importScripts = (function(globalEval) {
        var xhr = new XMLHttpRequest();
        return function importScripts() {
            var args = Array.prototype.slice.call(arguments),
                len = args.length,
                i = 0,
                meta, data, content;
            for (; i < len; i++) {
                if (args[i].substr(0, 5).toLowerCase() === 'data:') {
                    data = args[i];
                    content = data.indexOf(',');
                    meta = data.substr(5, content).toLowerCase();
                    data = decodeURIComponent(data.substr(content + 1));
                    if (/;\s*base64\s*[;,]/.test(meta)) {
                        data = atob(data);
                    }
                    if (/;\s*charset=[uU][tT][fF]-?8\s*[;,]/.test(meta)) {
                        data = decodeURIComponent(escape(data));
                    }
                } else {
                    xhr.open('GET', args[i], false);
                    xhr.send(null);
                    data = xhr.responseText;
                }
                globalEval(data);
            }
        };
    }(eval));
}
