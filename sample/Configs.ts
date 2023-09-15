
import {ConfigModel} from "@origamicore/core";  
import {MessengerConfig} from '../Index'
export default new ConfigModel({
    packageConfig:[
         new MessengerConfig({port:3213})
    ]
});