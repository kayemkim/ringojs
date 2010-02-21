require('core/string');
require('core/array');
include('ringo/webapp/util');

export('middleware');

/**
 * JSGI middleware for conditional HTTP GET request based on
 * response body message digests.
 * @param app the JSGI application
 * @returns the wrapped JSGI app
 */
function middleware(app) {
    return function(env) {
        var res = app(env);
        var {status, headers, body} = res;
        if (status === 200 && typeof body.digest === "function") {
            var etags;
            var header = env.HTTP_IF_NONE_MATCH;
            if (header) {
                etags = header.split(",").map(function(s) s.trim());
            }
            var digest = '"' + body.digest() + '"';
            headers = Headers(headers);
            headers.set("ETag", digest);
            if (etags && etags.contains(digest)) {
                // return not-modified response
                headers.unset('Content-Length');
                return {status: 304, headers: headers, body: []};
            }
        }
        return res;
    };
}