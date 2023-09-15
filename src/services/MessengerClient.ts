import { MessageType } from "../models/MessageType";

var WebSocketClient  = require('websocket').client; 
const uuid=require('uuid');
var users:Map<string,{callback:Function,key:string}[]>=new Map<string,{callback:Function,key:string}[]>();
export default class MessengerClient
{
    connection:any;
    isConneting:boolean;
    port:number;
    timeout:number;
    client:any;
    temp:Map<string,{res:Function,rej:Function}>=new Map<string,{res:Function,rej:Function}>();
    constructor(port:number,timeout?:number)
    {
        this.init(port,timeout)
    }
    async reconnect()
    {
        setTimeout(() => {
            this.init(this.port)
        }, 3000);
    }
    async close(userid:string)
    {
        if(!this.isConneting) throw 'lost connection'
        return new Promise((res,rej)=>{
            let id=uuid.v4();
            this.temp.set(id,{res,rej});
            this.connection.sendUTF(JSON.stringify({
                type:MessageType.Disconnect,
                userid
            }));
        })
    }
    async open(userid:string):Promise<string>
    {

        if(!this.isConneting) throw 'lost connection'
        return new Promise((res,rej)=>{
            let id=uuid.v4();
            this.temp.set(id,{res,rej});
            this.connection.sendUTF(JSON.stringify({
                type:MessageType.NewConnection,
                userid
            }));
        })

    }
    async deleteConnection(connectionKey:string , userid:string)
    {
        let connections=users.get(userid);
        if(connections)
        {
            let index=connections.findIndex(p=>p.key==connectionKey)
            if(index>-1)connections.splice(index,1)
            if(connections.length==0)
            {
                users.delete(userid)
                this.close(userid)
            }
        }
    }
    async addConnection(connectionKey:string , userid:string,callback:Function)
    {
        let exist=users.has(userid)
        if(!exist)users.set(userid,[]);
        let list= users.get(userid);
        if(list.filter(p=>p.key==connectionKey)[0])return;
        list.push({
            callback,
            key:connectionKey
        })
        if(!exist)
        {
            this.open(userid)
        }
    }
    init(port:number,timeout?:number)
    {  
        this.port=port;
        this.timeout=timeout;
        this.client=new WebSocketClient(); 

        this.client.on('connect',  (connection)=> { 
             this.isConneting=true;
             this.connection=connection
             connection.on('error', (error)=> { 
                 console.log("Connection Error: " + error.toString());
                 this.isConneting=false;
                 this.reconnect()
             });
             connection.on('close', ()=> {
                console.log('closed');
                this.isConneting=false;
                this.reconnect()
             });
             connection.on('message', (message)=> {
                 if (message.type === 'utf8') {
                    let msg=JSON.parse(message.utf8Data);
                    let id=msg.id;
                    if(this.temp.has(id))
                    {
                        if(msg.type==MessageType.Message)
                        { 
                            let connections=users.get(msg.userid);
                            if(connections)
                            {
                                for(let con of connections)
                                {
                                    con.callback(msg.data)
                                }
                            }
                        } 
                    }
                 }
             });
        }); 
        this.client.on('connectFailed', ( )=> {
             console.log('closed');
             this.isConneting=false;
             this.reconnect()
        }); 
        this.client.connect('ws://localhost:'+port, 'echo-protocol');
    }
}