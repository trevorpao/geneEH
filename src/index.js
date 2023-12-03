import gene from './gene.js';

gene.apiUri = 'http://demo.aiocms.sense-info.co' + '/api';
gene.debug = 1;

document.addEventListener('DOMContentLoaded', function() {
    gene.init();
});
