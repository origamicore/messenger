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
var WebSocketServer = require('websocket').server;
var http = require('http');
var tempObject = {};
var connections = {};
var users = new Map();
class MessengerServer {
    constructor() {
        this.counter = 1;
    }
    // async removeValue(key:string)
    // {
    //     if(tempObject[key])
    //         delete tempObject[key]
    //     for(let a in connections)
    //     {
    //         connections[a].sendUTF(JSON.stringify({ 
    //             key,
    //             type:SharedType.Remove, 
    //         })); 
    //     }
    // }
    // async setValue(key:string,data:string)
    // { 
    //     tempObject[key]=data;
    //     for(let a in connections)
    //     {
    //         connections[a].sendUTF(JSON.stringify({ 
    //             type:SharedType.Changed,
    //             data,
    //             key
    //         })); 
    //     }
    // }
    sendMessage(userid, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let servers = users.get(userid);
            for (let server of servers !== null && servers !== void 0 ? servers : []) {
                connections[server].sendUTF(JSON.stringify({
                    type: MessageType_1.MessageType.Message,
                    userid,
                    data: message
                }));
            }
        });
    }
    open(conKey) {
        return __awaiter(this, void 0, void 0, function* () {
            connections[conKey].sendUTF(JSON.stringify({
                type: MessageType_1.MessageType.SetId,
                data: conKey
            }));
        });
    }
    addConnection(request) {
        let key = request.key;
        var connection = {};
        try {
            connection = request.accept('echo-protocol', request.origin);
            connections[key] = connection;
            this.open(key);
            connection.on('message', (message) => {
                console.log();
                let data = JSON.parse(message.utf8Data);
                try {
                    if (data.type == MessageType_1.MessageType.NewConnection) {
                        let userid = data.userid;
                        if (!users.has(userid))
                            users.set(userid, []);
                        let tmp = users.get(userid);
                        if (tmp.indexOf(key) == -1) {
                            tmp.push(key);
                        }
                    }
                    if (data.type == MessageType_1.MessageType.Disconnect) {
                        let userid = data.userid;
                        let tmp = users.get(userid);
                        if (tmp) {
                            let index = tmp.indexOf(key);
                            if (index > -1)
                                tmp.splice(index, 1);
                        }
                    }
                }
                catch (exp) {
                    return;
                }
            });
            connection.on('close', (message) => {
                users.delete(key);
                delete connections[key];
            });
        }
        catch (exp) {
            console.log('Error>>>', exp);
        }
    }
    init(port) {
        return __awaiter(this, void 0, void 0, function* () {
            var server = {};
            server = http.createServer((request, response) => {
                response.writeHead(404);
                response.end();
            });
            server.listen(port, () => {
                console.log("\x1b[32m%s\x1b[0m", ' Socket run at port ' + port);
            });
            var wsServer = new WebSocketServer({
                httpServer: server,
                autoAcceptConnections: false
            });
            wsServer.on('connection', (request) => {
                console.log('11>>>>>>>>>>>>>');
            });
            wsServer.on('request', (request) => {
                this.addConnection(request);
            });
        });
    }
}
exports.default = MessengerServer;
//# sourceMappingURL=MessengerServer.js.map