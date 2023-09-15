import { AddedResponse, OriInjectable, OriService, PackageIndex, ResponseDataModel, RouteResponse } from "@origamicore/core";  
import MessengerConfig from "./models/MessengerConfig";
import MessengerServer from "./services/MessengerServer";
 
@OriInjectable({domain:'messenger'})
export default class TsOriMessenger implements PackageIndex
{ 
    name: string='messenger';
    config:MessengerConfig;   
    async jsonConfig(config: MessengerConfig): Promise<void> {
        let messenger=new MessengerServer();
        messenger.init(config.port)
        this.config=config;   
    }
    async start(): Promise<void> {
    }
    async restart(): Promise<void> { 
    }
    async stop(): Promise<void> { 
    } 
}