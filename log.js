class Log {
    constructor() {
        this.listeners = {};
    }

    info(msg) {
        this.entry('info', msg);
    }

    warn(msg) {
        this.entry('warn', msg);
    }

    error(msg) {
        this.entry('warn', msg);
    }

    entry(level, msg, params) {
        this.raise('entry', {
            level: level,
            msg: msg
        });
    }

    on(event, callback) {
        var listeners = this.listeners[event];

        if (!listeners) {
            listeners = this.listeners[event] = [];
        }

        listeners.push(callback);
    }

    raise(event, params) {
        var listeners = this.listeners[event];

        if (listeners) {
            for (var listener of listeners) {
                try {
                    listener(params);
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }
}

var log = new Log();
export default log;
