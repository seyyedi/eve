import fs from 'fs';
import path from 'path';
import http2 from 'http2';
import https from 'https';
import minimist from 'minimist';
import mime from 'mime-types';

import log from './../log';
import RealtimeServer from './realtimeServer';

export default class Server {
    constructor() {
        this.routes = {};
        this.args = minimist(process.argv.slice(2));
        this.runHttp = this.runHttp.bind(this);
    }

    run(port, realtimePort) {
        port = port || parseInt(this.args.port, 10) || 3000;
        realtimePort = realtimePort || parseInt(this.args.realtimePort, 10) || 3001;

        var httpsOptions = {
            key: fs.readFileSync(this.args.sslKey || 'D:\\Seyyedi\\Certificates\\localhost.key'),
            cert: fs.readFileSync(this.args.sslCert ||'D:\\Seyyedi\\Certificates\\localhost.crt')
        };

        this.http = http2.createServer(httpsOptions, this.runHttp);
        this.realtime = https.createServer(httpsOptions);
        this.realtimeServer = new RealtimeServer(this.realtime);

        this.http.listen(port);
        log.info('Running https server on *:' + port);

        this.realtime.listen(realtimePort);
        log.info('Running https realtime server on *:' + realtimePort);
    }

    runHttp(req, res) {
        for (var route of this.routes[req.method.toLowerCase()]) {
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
