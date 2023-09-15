import OrigamiCore from '@origamicore/core'  
import config from './Configs'; 
import { MessengerClient } from '../Index';
export default class OriIndex
{
    constructor()
    {   
        this.init();
    }
    async init()
    {
        var origamicore = new OrigamiCore(config);
        await origamicore.start()   

        let messanger=new MessengerClient(3213)
    }
}

new OriIndex()