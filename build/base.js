"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BaseHttp extends events_1.EventEmitter {
    constructor(mqtt) {
        super();
        this._mqtt = mqtt;
    }
}
exports.default = BaseHttp;
//# sourceMappingURL=base.js.map