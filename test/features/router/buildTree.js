'use strict';

// mocha defines to avoid JSHint breakage
/* global describe, it, before, beforeEach, after, afterEach */

var fs = require('fs');
var yaml = require('js-yaml');

var assert = require('assert');
var Router = require('../../../lib/router');
var router = new Router();

var rootSpec = {
    paths: {
        '/{domain:en.wikipedia.org}/v1': {
            'x-restbase': {
                specs: [
                    {
                        paths: {
                            '/page/{title}/html': {
                                get: {
                                    'x-restbase': {
                                        service: {
                                            uri: '/{domain}/sys/parsoid/html/{title}/latest'
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
};

var faultySpec = {
    paths: {
        '/{domain:en.wikipedia.org}': {
            'x-restbase': {
                specs: ['some/non/existing/spec']
            }
        }
    }
};

var fullSpec = yaml.safeLoad(fs.readFileSync('config.example.yaml'));


module.exports = function () {
    describe('tree building', function() {
        it('should build a simple spec tree', function() {
            return router.loadSpec(rootSpec)
            .then(function() {
                //console.log(JSON.stringify(router.tree, null, 2));
                var handler = router.route('/en.wikipedia.org/v1/page/Foo/html');
                //console.log(handler);
                assert.equal(!!handler.value.methods.get, true);
                assert.equal(handler.params.domain, 'en.wikipedia.org');
                assert.equal(handler.params.title, 'Foo');
            });
        });

        it('should fail loading a faulty spec', function() {
            return router.loadSpec(faultySpec)
            .then(function() {
                throw new Error("Should throw an exception!");
            },
            function(e) {
                // exception thrown as expected
                return;
            });
        });

        it('should build the example config spec tree', function() {
            return router.loadSpec(fullSpec.spec)
            .then(function() {
                //console.log(JSON.stringify(router.tree, null, 2));
                var handler = router.route('/en.wikipedia.org/v1/page/Foo/html');
                //console.log(handler);
                assert.equal(!!handler.value.methods.get, true);
                assert.equal(handler.params.domain, 'en.wikipedia.org');
                assert.equal(handler.params.title, 'Foo');
            });
        });
    });
};