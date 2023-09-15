"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const MessageType_1 = require("../models/MessageType");
var WebSocketClient = require('websocket').client;
const uuid = require('uuid');
var users = new Map();
class MessengerClient {
    constructor(port, timeout) {
        this.temp = new Map();
        this.init(port, timeout);
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => {
                this.init(this.port);
            }, 3000);
        });
    }
    close(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConneting)
                throw 'lost connection';
            return new Promise((res, rej) => {
                let id = uuid.v4();
                this.temp.set(id, { res, rej });
                this.connection.sendUTF(JSON.stringify({
                    type: MessageType_1.MessageType.Disconnect,
                    userid
                }));
            });
        });
    }
    open(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConneting)
                throw 'lost connection';
            return new Promise((res, rej) => {
                let id = uuid.v4();
                this.temp.set(id, { res, rej });
                this.connection.sendUTF(JSON.stringify({
                    type: MessageType_1.MessageType.NewConnection,
                    userid
                }));
            });
        });
    }
    deleteConnection(connectionKey, userid) {
        return __awaiter(this, void 0, void 0, function* () {
            let connections = users.get(userid);
            if (connections) {
                let index = connections.findIndex(p => p.key == connectionKey);
                if (index > -1)
                    connections.splice(index, 1);
                if (connections.length == 0) {
                    users.delete(userid);
                    this.close(userid);
                }
            }
        });
    }
    addConnection(connectionKey, userid, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let exist = users.has(userid);
            if (!exist)
                users.set(userid, []);
            let list = users.get(userid);
            if (list.filter(p => p.key == connectionKey)[0])
                return;
            list.push({
                callback,
                key: connectionKey
            });
            if (!exist) {
                this.open(userid);
            }
        });
    }
    init(port, timeout) {
        this.port = port;
        this.timeout = timeout;
        this.client = new WebSocketClient();
        this.client.on('connect', (connection) => {
            this.isConneting = true;
            this.connection = connection;
            connection.on('error', (error) => {
                console.log("Connection Error: " + error.toString());
                this.isConneting = false;
                this.reconnect();
            });
            connection.on('close', () => {
                console.log('closed');
                this.isConneting = false;
                this.reconnect();
            });
            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    let msg = JSON.parse(message.utf8Data);
                    let id = msg.id;
                    if (this.temp.has(id)) {
                        if (msg.type == MessageType_1.MessageType.Message) {
                            let connections = users.get(msg.userid);
                            if (connections) {
                                for (let con of connections) {
                                    con.callback(msg.data);
                                }
                            }
                        }
                    }
                }
            });
        });
        this.client.on('connectFailed', () => {
            console.log('closed');
            this.isConneting = false;
            this.reconnect();
        });
        this.client.connect('ws://localhost:' + port, 'echo-protocol');
    }
}
exports.default = MessengerClient;
//# sourceMappingURL=MessengerClient.js.map