import { MessageType } from "../models/MessageType";

var WebSocketServer = require('websocket').server;
var http = require('http');
var tempObject:any={};
var connections:any={};
var users:Map<string,string[]>=new Map<string,string[]>();
export default class MessengerServer
{
    counter:number=1;
    constructor()
    {

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
    async sendMessage(userid:string,message:any)
    {
        let servers=users.get(userid);
        for(let server of servers??[])
        {
            connections[server].sendUTF(JSON.stringify({
                type:MessageType.Message,
                userid,
                data:message
            }));

        }
    }
    async open(conKey:string)
    {
        connections[conKey].sendUTF(JSON.stringify({
            type:MessageType.SetId,
            data:conKey
        }));
    }
    addConnection(request:any)
    {
        let key=request.key 
        var connection:any ={}              
        try{
            connection = request.accept('echo-protocol', request.origin); 
            connections[key]=connection;
            this.open(key)
            connection.on('message', (message)=> {
                console.log();
                
                let data=JSON.parse(message.utf8Data) ;
                try{ 
                    if(data.type==MessageType.NewConnection)
                    {
                        let userid=data.userid;
                        if(!users.has(userid))users.set(userid,[]);
                        let tmp=users.get(userid);
                        if(tmp.indexOf(key)==-1)
                        {
                            tmp.push(key)
                        }
                    }
                    if(data.type==MessageType.Disconnect)
                    {
                        let userid=data.userid;
                        let tmp=users.get(userid);
                        if(tmp)
                        {
                            let index=tmp.indexOf(key);
                            if(index>-1) tmp.splice(index,1)
                        }

                    }


                }catch(exp)
                { 
                    return;
                }
            }) 
            connection.on('close', (message)=> {
                users.delete(key);
                delete connections[key] 
            }) 
            
        }catch(exp){
            console.log('Error>>>',exp)
        }

    }
    async init(port:number)
    { 
        var server:any={};
        server=http.createServer((request, response)=> {
            response.writeHead(404);
            response.end();    
        })      
        server.listen(port, ()=> {
            console.log( "\x1b[32m%s\x1b[0m",  ' Socket run at port '+port);
        });         
        var wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });
        
        wsServer.on('connection',(request)=> { 
            console.log('11>>>>>>>>>>>>>');
            
        });
        wsServer.on('request', (request)=> {
            this.addConnection(request)
        }) 
    }
}