"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
class Server extends base_1.default {
    constructor(mqtt) {
        var _a;
        super(mqtt);
        this._queue = new Object();
        (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.on('message', this._handleRequest.bind(this));
    }
    get queue() { return this._queue; }
    route(method, topic, callback) {
        var _a;
        const requestedTopic = this._makeRequestedTopic(topic, method);
        const key = topic + "@" + method;
        this._queue[key] = callback;
        (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.subscribe(requestedTopic);
    }
    get(topic, callback) {
        this.route("GET", topic, callback);
    }
    post(topic, callback) {
        this.route("POST", topic, callback);
    }
    put(topic, callback) {
        this.route("PUT", topic, callback);
    }
    del(topic, callback) {
        this.route("DELETE", topic, callback);
    }
    _handleRequest(topic, payload) {
        var _a;
        const result = Server.RequestRegexp.exec(topic);
        console.log(topic);
        console.log(result);
        if (result) {
            const _uuid = result[2];
            const method = result[1];
            const idx = result['index'];
            const _topic = topic.substring(0, idx - 1);
            const key = _topic + "@" + method;
            const _callback = this._queue[key];
            const { data } = JSON.parse(payload.toString());
            const _data = _callback(topic, data);
            const _payload = { data: _data, time: Date.now() };
            const responseTopic = this._makeResponseTopic(_topic, method, _uuid);
            const responsePayload = JSON.stringify(_payload);
            (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.publish(responseTopic, responsePayload);
        }
    }
    _makeRequestedTopic(topic, method) {
        const slash = topic.endsWith("/") ? "" : "/";
        return `${topic}${slash}@request/#`;
    }
    _makeResponseTopic(topic, method, uuid) {
        const slash = topic.endsWith("/") ? "" : "/";
        return `${topic}${slash}@response/${method}/${uuid}`;
    }
}
exports.default = Server;
Server.RequestRegexp = /@request\/(GET|PUT|DELETE|POST)\/(\w+)$/;
//# sourceMappingURL=server.js.map