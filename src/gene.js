import utils from './utils.js';
import $ from 'cash-dom';

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

    stdSubmit: function (me) {
        let form = me.dataset.ta ? document.getElementById(me.dataset.ta) : $(me).closest('form');
        let dAction = function () {
            me.removeAttribute('disabled');
            me.querySelector('i').remove();

            if (this.code == '1') {
                if (me.attr('reset') === '1') {
                    form.reset();
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
                    form.reset();
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

        let inputs = $(me).find('input');
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].value == inputs[i].placeholder) {
                inputs[i].value = '';
            }
        }

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            me.disabled = 'disabled';
            $(me).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
            gene.yell(me.dataset.uri, $(me).serialize(form), dAction, dAction);
        }
    },

    yell: function (uri, postData, successCB, errorCB, type, hideLoadAnim) {
        let json = (uri.indexOf('://') == -1) ? 'json' : 'jsonp';
        type = type || 'POST';
        uri = (uri.indexOf('://') == -1) ? gene.apiUri + uri : uri;

        if (!hideLoadAnim) {
            gene.loadAnim('show');
        }

        fetch(uri, {
            method: type, // or 'POST'
            body: postData, // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(j => {
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

        }).catch(error => {
            gene.err('ajax fail(' + o.status + ')!!');
        }).finally(() => {
            gene.clog('ajax complete');
            if (!hideLoadAnim) {
                gene.loadAnim('hide');
            }
        });
    },

    test: function (me) {
        gene.clog(me);
    },

    exe: function (func, args) {
        let fun = (!gene.check(func)) ? gene.funcs['notfound'] : gene.funcs[func];
        gene.clog('exe::' + func);
        return fun.call(this, args);
    },

    load: function (functionName) {
        gene.clog('importScripts::' + gene.subFolder + '/' + functionName + '.js');
        import(gene.subFolder + '/' + functionName + '.js')
    },

    notfound: function (me) {
        gene.err('command not found!!');
    },

    err: function (txt) {
        if (txt !== '')
            this.clog('Error::' + txt);
        else
            this.clog('Error::unknown error!!');
    },

    check: function (functionName) {
        return gene.isset(gene.funcs[functionName]);
    },

    clog: function (txt) {
        if (typeof console != 'undefined' && gene.debug == 1) {
            if (typeof txt == 'string' || typeof txt == 'number') {
                console.log('gene::' + txt);
            } else {
                console.log('gene::' + typeof (txt));
                console.log(txt);
            }
        }
    },

    hookTag: function (newTagName, func) {
        if (!gene.check(newTagName)) {
            gene.tags.push(newTagName);
            gene.hook(newTagName, func);
        } else {
            gene.clog(newTagName + ' overwrite?');
        }
    },

    hook: function (functionName, fun, evt) {
        if (!gene.check(functionName)) {
            gene.funcs[functionName] = fun;
            gene.evts[functionName] = (evt != 'undefined') ? evt : 'click';
        } else {
            gene.clog(functionName + ' overwrite?');
        }
    },

    unhook: function (functionName, fun) {
        if (gene.check(functionName)) {
            delete gene.funcs[functionName];
        } else {
            gene.clog(functionName + ' exist?');
        }
    },

    isset: function (obj) {
        if (obj === void 0 || obj === null) {
            return false;
        } else {
            return true;
        }
    },

    bindToEvt: function (evt) {
        let me = this;

        if (me.dataset.nopde !== '1') {
            evt.preventDefault();
            gene.clog('nopde');
        }

        me.event = evt;
        gene.clog('start');
        gene.exe(me.dataset.meb[evt.type], me);
    },

    init: function (element) {
        for (let tk in gene.tags) {
            gene.exe(gene.tags[tk], $(gene.tags[tk]));
        }

        if (element === void 0) {
            element = 'body';
        }

        $(element).find('.' + gene.taClass).each(function () {
            let me = this,
                evt = me.dataset.event,
                behavior = me.dataset.behavior,
                ebi = me.dataset.gene,
                meb = {};

            if (!gene.isset(behavior)) {
                behavior = 'notfound';
            }

            if (!gene.isset(evt)) {
                evt = (!gene.isset(gene.evts[behavior])) ? 'click' : gene.evts[behavior];
            }

            if (!gene.isset(ebi)) {

                console.log(ebi);

                meb[evt] = behavior;
            } else {
                let eba = ebi.replace(' ', '').split(',');

                for (let ai = 0; ai < eba.length; ai++) {
                    let ebo = eba[ai].split(':');
                    if (!gene.isset(ebo[1])) {
                        ebo[1] = ebo[0];
                        ebo[0] = 'click';
                    }
                    meb[ebo[0]] = ebo[1];
                }
            }

            gene.clog(meb);
            me.dataset.meb = meb;
            $(me).off();

            for (let ei in meb) {
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
                    $(me).on(ei, gene.bindToEvt);
                }
            }
        }).removeClass(gene.taClass);
    }
};

if (window.gene === void 0) {
    window.gene = gene;
}


export default gene;

