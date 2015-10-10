import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

export default class WebServer {
    constructor() {
        this.routes = {};
        this.respond = this.respond.bind(this);
    }

    respond(req, res) {
        for (var route of this.routes[req.method.toLowerCase()]) {
            var match = req.url.match(route.url);

            if (match !== null) {
                try {
                    route.handler(req, res, match);
                } catch (e) {
                    console.warn(e);
                    res.writeHead(500);
                    res.end();
                }

                return;
            }
        }

        res.writeHead(404);
        res.end();
    }

    registerRoute(method, url, handler) {
        var routes = this.routes[method];

        if (!routes) {
            routes = this.routes[method] = [];
        }

        routes.push({
            url: url,
            handler: handler
        });

        return this;
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

    get(url, handler) {
        return this.registerRoute('get', url, handler);
    }

    post(url, handler) {
        return this.registerRoute('post', url, handler);
    }

    put(url, handler) {
        return this.registerRoute('put', url, handler);
    }

    delete(url, handler) {
        return this.registerRoute('delete', url, handler);
    }

    patch(url, handler) {
        return this.registerRoute('patch', url, handler);
    }
}
