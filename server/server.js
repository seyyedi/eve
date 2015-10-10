import path from 'path';
import fs from 'fs';
import http2 from 'http2';
import https from 'https';
import minimist from 'minimist';
import express from 'express';

import log from './../log';
import WebServer from './webServer';
import RealtimeServer from './realtimeServer';

export default class Server {
    constructor() {
        this.args = minimist(process.argv.slice(2));
    }

    listen(port, realtimePort) {
        port = port || parseInt(this.args.port, 10) || 3000;
        realtimePort = realtimePort || parseInt(this.args.realtimePort, 10) || 3001;

        var httpsOptions = {
            key: fs.readFileSync(this.args.sslKey || 'D:\\Seyyedi\\Certificates\\localhost.key'),
            cert: fs.readFileSync(this.args.sslCert ||'D:\\Seyyedi\\Certificates\\localhost.crt')
        };

        // this.webServer = new WebServer()
        //     .static('^/$', 'app/index.html')
        //     .static('^/(.+)$', 'app');
        //
        // this.http2 = http2.createServer(httpsOptions, this.webServer.respond);

        this.express = express();

        this.express.get('/', (req, res) =>
            res.sendFile(path.resolve('app/index.html'))
        );

        this.express.use(
            express.static('app')
        );

        this.https = https.createServer(httpsOptions, this.express);

        this.httpsRealtime = https.createServer(httpsOptions);
        this.realtimeServer = new RealtimeServer(this.httpsRealtime);

        // this.http2.listen(port);
        // log.info('Http2 server is online @*:' + port);

        this.https.listen(port);
        log.info('Https server is online @*:' + port);

        this.httpsRealtime.listen(realtimePort);
        log.info('Https realtime server is online @*:' + realtimePort);
    }

    close() {
        if (this.http2) {
            this.http2.close(() => {
                log.info('Http2 server is offline')
            });
        }

        if (this.https) {
            this.https.close(() => {
                log.info('Https server is offline')
            });
        }

        if (this.realtimeServer) {
            this.realtimeServer.close();
        }

        if (this.httpsRealtime) {
            this.httpsRealtime.close(() => {
                log.info('Https realtime server is offline');
            });
        }
    }
}
