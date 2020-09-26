const requestOptions = require('./request-options');
const request = require('request');
const is = require('type-is');
const _ = require('lodash');
const tr = require('./tr');


module.exports = (onionAddress, options) => {
    if (typeof options !== 'object') options = {};

    // Allow discarding response headers to be configurable
    var discardApiResponseHeaders = options.discardApiResponseHeaders || ['set-cookie', 'content-length'];

    options = _.defaults(options || {}, {
        ensureAuthenticated: false,
        cache: null,
        cacheMaxAge: 0,
        userAgent: 'express-request-proxy',
        cacheHttpHeader: 'Express-Request-Proxy-Cache',
        cacheKeyFn: null,
        timeout: 5000,
        maxRedirects: 5,
        gzip: true,
        originalQuery: false
    });

    return function (req, res, next) {
        var method = req.method.toUpperCase();

        options.url = onionAddress + req.url;
        console.log(options.url)

        if (!req.ext) req.ext = {};

        req.ext.requestHandler = 'express-request-proxy';

        return makeApiCall(req, res, next);
    };

    function makeApiCall(req, res, next) {
        var apiRequestOptions;
        try {
            apiRequestOptions = requestOptions(req, options);
        } catch (err) {
            console.log('error building request options %s', err.stack);
            return next(Error.http(400, err.message));
        }

        apiRequestOptions.agent = tr.createAgent();

        console.log('making %s call to %s', apiRequestOptions.method, apiRequestOptions.url);

        // If the req has a body, pipe it into the proxy request
        var apiRequest;
        var originalApiRequest;
        if (is.hasBody(req)) {
            console.log('piping req body to remote http endpoint');
            originalApiRequest = request(apiRequestOptions);
            apiRequest = req.pipe(originalApiRequest);
        } else {
            apiRequest = request(apiRequestOptions);
            originalApiRequest = apiRequest;
        }

        // Abort api request if client close its connection
        req.on('close', function () {
            originalApiRequest.abort();
        });

        apiRequest.on('error', function (err) {
            throw err;
        });

        // Defer piping the response until the response event so we can
        // check the status code.
        apiRequest.on('response', function (resp) {

            // Do not attempt to apply transforms to error responses
            if (resp.statusCode >= 400) {
                console.log('Received error %s from %s', resp.statusCode, apiRequestOptions.url);
                return apiRequest.pipe(res);
            }

            // Need to explicitly passthrough headers, otherwise they will get lost
            // in the transforms pipe.
            for (var key in resp.headers) {
                if (_.includes(discardApiResponseHeaders, key) === false) {
                    res.set(key, resp.headers[key]);
                }
            }

            apiRequest.pipe(res);
        });
    }
}