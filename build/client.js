"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const nanoid_1 = require("nanoid");
class Client extends base_1.default {
    constructor(mqtt) {
        var _a;
        super(mqtt);
        this._queue = Array();
        this._nanoid = nanoid_1.customAlphabet(Client.alphabetOfNanoid, Client.lengthOfNanoid);
        (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.on('message', this._handleResponse.bind(this));
        setInterval(this._clearExpireItem.bind(this), Client.timeout * 2);
    }
    request(method, topic, body) {
        var _a, _b;
        const uuid = this._nanoid();
        const expires = Date.now() + Client.timeout;
        const responseTopic = this._makeResponseTopic(topic, method, uuid);
        const requestTopic = this._makeRequestTopic(topic, method, uuid);
        (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.subscribe(responseTopic);
        const payload = this._makeRequestMessage(method, body);
        (_b = this._mqtt) === null || _b === void 0 ? void 0 : _b.publish(requestTopic, JSON.stringify(payload), { qos: 0 });
        return new Promise((resolve, reject) => {
            const item = { uuid, expires, reject, resolve, topic: responseTopic };
            this._queue.push(item);
        });
    }
    get(topic, body) { return this.request("GET", topic, body); }
    post(topic, body) { return this.request("POST", topic, body); }
    put(topic, body) { return this.request("PUT", topic, body); }
    del(topic, body) { return this.request("DELETE", topic, body); }
    _handleResponse(topic, payload) {
        var _a;
        const responseMessage = JSON.parse(payload.toString());
        const _segment = topic.split('/');
        const _uuid = _segment[_segment.length - 1];
        const idx = this._queue.findIndex(it => it.uuid === _uuid);
        if (idx >= 0) {
            const [{ expires, resolve, reject }] = this._queue.splice(idx, 1);
            (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.unsubscribe(topic);
            expires > Date.now() ? resolve(responseMessage) : reject('expires is timeout');
        }
    }
    _clearExpireItem() {
        const now = Date.now();
        this._queue = this._queue.reduce((t, it) => {
            var _a;
            const { expires, reject, topic } = it;
            if (expires < now) {
                return [...t, it];
            }
            else {
                (_a = this._mqtt) === null || _a === void 0 ? void 0 : _a.unsubscribe(topic);
                reject('expires is timeout');
                return t;
            }
        }, []);
    }
    _makeRequestMessage(method, data) {
        return { data };
    }
    _makeResponseTopic(topic, method, uuid) {
        const slash = topic.endsWith("/") ? "" : "/";
        return `${topic}${slash}@response/${method}/${uuid}`;
    }
    _makeRequestTopic(topic, method, uuid) {
        const slash = topic.endsWith("/") ? "" : "/";
        return `${topic}${slash}@request/${method}/${uuid}`;
    }
}
exports.default = Client;
Client.timeout = 500;
Client.lengthOfNanoid = 6;
Client.alphabetOfNanoid = '0123456789abcdefABCDEFG';
//# sourceMappingURL=client.js.map