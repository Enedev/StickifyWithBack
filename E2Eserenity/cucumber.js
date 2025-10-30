const { rimrafSync } = require('rimraf');
const mkdirp = require('mkdirp');

// Create necessary directories
mkdirp.sync('reports');

module.exports = {
    default: {
        paths: ['features/**/*.feature'],
        require: ['steps/**/*.ts', 'support/**/*.ts'],
        requireModule: ['ts-node/register'],
        format: [
            'progress',
            'json:reports/report.json',
            'html:reports/report.html'
        ],
        formatOptions: {
            snippetInterface: 'async-function'
        },
        worldParameters: {
            baseUrl: 'http://localhost:3000'
        }
    }
};