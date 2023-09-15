import { ModuleConfig, PackageIndex } from "@origamicore/core"; 
import TsOriMessenger from "../Index";

export default class MessengerConfig extends ModuleConfig
{
    async createInstance(): Promise<PackageIndex> {
        var instance =new TsOriMessenger();
        await instance.jsonConfig(this);
        return instance;
    } 
    port:number;
    public constructor(
        
        fields: {
            id?: string  
            port:number
        }) {
        super(fields);
        if (fields) Object.assign(this, fields); 
    }

}