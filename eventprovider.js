let EventEmitter = require("events");

let eventHandler = new EventEmitter();
let dbEventHandler = new EventEmitter();

class EventProvider {

    static on(eventName, callBack) {
        eventHandler.on(eventName, callBack);
    }

    static emit(eventName, data) {
        eventHandler.emit(eventName, data);
    }

    static DatabaseEvents() {
        return dbEventHandler;
    }
}

module.exports = EventProvider;