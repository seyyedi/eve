import fs from 'fs';
import path from 'path';
import http2 from 'http2';
import minimist from 'minimist';
import mime from 'mime-types';

import log from './../log';

export default class HttpServer {
    constructor() {
        this.args = minimist(process.argv.slice(2));
        this.routes = {
            get: [],
            post: [],
            put: [],
            delete: [],
            patch: []
        };
    }

    route(method, url, handler) {
        this.routes[method.toLowerCase()].push({
            url: url,
            handler: handler
        });

        return this;
    }

    get(url, handler) {
        return this.route('get', url, handler);
    }

    post(url, handler) {
        return this.route('post', url, handler);
    }

    put(url, handler) {
        return this.route('put', url, handler);
    }

    delete(url, handler) {
        return this.route('delete', url, handler);
    }

    patch(url, handler) {
        return this.route('patch', url, handler);
    }

    static(url, basePath) {
        basePath = path.resolve(basePath || '');

        return this.get(url, (req, res, match) => {
            let file = basePath;

            if (match.length === 1) {
                file = path.join(file, match[0]);
            } else {
                for (var i = 1; i < match.length; i++) {
                    file = path.join(file, match[i]);
                }
            }

            fs.access(file, fs.R_OK, err => {
                if (err) {
                    res.writeHead(404);
                    res.end(err.toString());
                    return;
                }

                var mimeType = mime.lookup(file);

                if (mimeType) {
                    res.setHeader('Content-Type', mimeType);
                }

                fs
                    .createReadStream(file)
                    .pipe(res);
            });
        });
    }

    run(port) {
        port = port || parseInt(this.args.port, 10) || 3000;
        log.info('Running https server on *:' + port);

        this.http = http2
            .createServer(
                {
                    key: fs.readFileSync('D:\\Seyyedi\\Certificates\\localhost.key'),
                    cert: fs.readFileSync('D:\\Seyyedi\\Certificates\\localhost.crt')
                },
                this.onRequest.bind(this)
            )
            .listen(port);
    }

    onRequest(req, res) {
        var routes = this.routes[req.method.toLowerCase()];

        for (var route of routes) {
            var match = req.url.match(route.url);
            if (match !== null) {
                try {
                    route.handler(req, res, match);
                } catch (e) {
                    log.info(e);
                    res.writeHead(500);
                    res.end();
                }
                return;
            }
        }

        res.writeHead(404);
        res.end();
    }
}
