
import './bootstrap';
import './validatr';
import './base';

gee.apiUri = 'http://demo.aiocms.sense-info.co' + '/api';
gee.debug = 1;

gee.subFolder = '../../app/scripts/plugins';

document.addEventListener('DOMContentLoaded', function() {
    gee.init();
});
