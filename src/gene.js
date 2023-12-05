import utils from './utils.js';

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
        let form = me.dataset.ta ? document.getElementById(me.dataset.ta) : $(me).closest('form');
        let dAction = function() {
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

    yell: function(uri, postData, successCB, errorCB, type, hideLoadAnim) {
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

    exe: function(func, args) {
        gene.clog('exe::' + func);
        let lvl4 = func.split('|');
        let fun = null;

        for (let i4 = 0; i4 < lvl4.length; i4++) {
            fun = (!gene.check(func)) ? gene.funcs['notfound'] : gene.funcs[func];
            
            fun.call(this, args);
        }

        return 1;
    },

    load: function(functionName) {
        let uri = new URL(gene.subFolder + '/' + functionName + '.js', import.meta.url);

        gene.clog(uri);
        import(uri.pathname);
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
        if (obj === void 0 || obj === null) {
            return false;
        } else {
            return true;
        }
    },

    promoter: function(evt) {
        let me = this;

        if (me.dataset.nopde !== '1' || me.dataset.bubble !== '1') {
            evt.preventDefault();
            gene.clog('enable bubble');
        }

        me.event = evt;
        gene.clog('start::' + evt.type);
        gene.exe(me.dna[evt.type], $(me));
    },

    init: function(element) {
        for (let tk in gene.tags) {
            gene.exe(gene.tags[tk], $(gene.tags[tk]));
        }

        if (element === void 0) {
            element = 'body';
        }

        $(element).find('.' + gene.taClass).each(function() {
            let me = this,
                evt = me.dataset.event,
                behavior = me.dataset.behavior,
                clustered = me.dataset.gene,
                promoterMapping = {};

            if (!gene.isset(behavior)) {
                behavior = 'notfound';
            }

            if (!gene.isset(evt)) {
                evt = (!gene.isset(gene.evts[behavior])) ? 'click' : gene.evts[behavior];
            }

            if (!gene.isset(clustered)) {
                promoterMapping[evt] = behavior;
            } else {
                let lvl2 = clustered.replace(' ', '').split(',');

                for (let i2 = 0; i2 < lvl2.length; i2++) {
                    let lvl3 = lvl2[i2].split(':');
                    if (!gene.isset(lvl3[1])) {
                        lvl3[1] = lvl3[0];
                        lvl3[0] = 'click';
                    }
                    promoterMapping[lvl3[0]] = lvl3[1];
                }
            }

            gene.clog(promoterMapping);
            me.dna = promoterMapping;
            $(me).off();

            for (let evt in promoterMapping) {
                let lvl4 = promoterMapping[evt].split('|');
                for (let i4 = 0; i4 < lvl4.length; i4++) {
                    if (!gene.check(lvl4[i4])) {
                        gene.load(lvl4[i4]);
                    }

                    if (!gene.check(lvl4[i4])) {
                        gene.clog('load fail:::' + lvl4[i4]);
                    }
                }

                if (evt == 'init') {
                    gene.exe(promoterMapping[evt], me);
                } else if (evt == 'scroll') {
                    let target = me.dataset.target;
                    let margin = me.dataset.margin || '0px';
                    me.watchdog = new IntersectionObserver(function(entries) {
                        if (entries[0].isIntersecting) {
                            gene.exe(me.dataset.dna['scroll'], $(me));
                        }
                    }, {
                        root: me,
                        rootMargin: margin
                    });

                    me.watchdog.observe(me.querySelector(target));
                    me.watchdog.reset = function () {
                        me.watchdog.unobserve(entries[0].target);
                        me.watchdog.observe(me.querySelector(target));
                    };
                } else {
                    $(me).on(evt, gene.promoter);
                }
            }
        }).removeClass(gene.taClass);
    }
};

export default gene;
