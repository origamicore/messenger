"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@origamicore/core");
const Index_1 = require("../Index");
exports.default = new core_1.ConfigModel({
    packageConfig: [
        new Index_1.MessengerConfig({ port: 3213 })
    ]
});
//# sourceMappingURL=Configs.js.map