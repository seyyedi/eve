import io from 'socket.io';

import log from './../log';

export default class RealtimeServer {
    constructor(httpsServer) {
        this.io = io;

        this.users = [];
    	this.lastUserId = 0;
    	this.messages = [];

        this.io = io(httpsServer, { serveClient: false, transports: ['websocket'] });
        this.io.on('connection', this.newConnection.bind(this));
    }

    newConnection(socket) {
        var user = {
            id: this.lastUserId + 1,
            socket: socket,
            active: false
        };

        this.lastUserId = user.id;
        this.users.push(user);

        log.info('User #' + user.id + ' connected');

        socket.on('disconnect', () => {
            log.info('User #' + user.id + ' disconnected');
            this.users.splice(this.users.indexOf(user), 1);

            if (user.active) {
                this.broadcast(user.name + ' left');
            }
        });

        socket.on('login', name => {
            user.name = name;
            user.active = true;

            log.info('User #' + user.id + ' logged in as ' + user.name);
            socket.emit('logged-in');

            for (var i = 0; i < this.messages.length; i++) {
                socket.emit('chat-message', this.messages[i]);
            }

            this.broadcast(user.name + ' joined');
        });

        socket.on('chat-message', function (msg) {
            if (!user.active) {
                log.info('Anonymous user wants to send a chat message');
                return;
            }

            if (user.name !== msg.from) {
                log.info('Receiving message from ' + msg.from + ' in context of user ' + user.name);
                return;
            }

            this.messages.push(msg);
            socket.broadcast.emit('chat-message', msg);
        });
    }

    broadcast(text) {
		var msg = {
			from: 'Server',
			text: text
		};

		this.messages.push(msg);
		this.io.emit('chat-message', msg);
	}
}
