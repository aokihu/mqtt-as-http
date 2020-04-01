import BaseHttp, { ResponseMessage, RequestMessage, RequestMethods } from './base';
import { MqttClient } from 'mqtt';

export type ResponseQueueItem = {
  [topic:string]:(topic: string, data: any) => [number, any]
}

export default class Server extends BaseHttp {
  private static RequestRegexp = /@request\/(GET|PUT|DELETE|POST)\/(\w+)$/;
  private _queue:ResponseQueueItem = new Object() as ResponseQueueItem;

  constructor(mqtt:MqttClient){
    super(mqtt);
    this._mqtt?.on('message', this._handleRequest.bind(this));
  }

  public get queue() {return this._queue}

  public route(method:RequestMethods,topic:string, callback: (topic: string, data?:any) => any) {
    const requestedTopic:string = this._makeRequestedTopic(topic, method);
    const key = topic + "@" + method;
    this._queue[key] = callback;
    this._mqtt?.subscribe(requestedTopic);
  }

  public get(topic:string, callback:(topic: string, data?:any) => any) {
    this.route("GET", topic, callback);
  }

  public post(topic:string, callback:(topic: string, data?:any) => any) {
    this.route("POST", topic, callback);
  }

  public put(topic:string, callback:(topic: string, data?:any) => any) {
    this.route("PUT", topic, callback);
  }

  public del(topic:string, callback:(topic: string, data?:any) => any) {
    this.route("DELETE", topic, callback);
  }

  private _handleRequest(topic:string, payload: Buffer) {
    // const idx = topic.search("@request");
    const result = Server.RequestRegexp.exec(topic);
    console.log(topic)
    console.log(result);
    if(result) {
      const _uuid = result[2];
      const method = result[1] as RequestMethods;
      const idx = result['index'];
      const _topic = topic.substring(0, idx - 1);

      const key = _topic + "@" + method;
      const _callback = this._queue[key];

      const {data} = JSON.parse(payload.toString()) as RequestMessage;
      const _data = _callback(topic, data);
      const _payload:ResponseMessage = {data: _data, time: Date.now()};

      const responseTopic = this._makeResponseTopic(_topic, method,_uuid)
      const responsePayload = JSON.stringify(_payload);
      this._mqtt?.publish(responseTopic, responsePayload);
    }
  }

  private _makeRequestedTopic(topic:string, method:RequestMethods):string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@request/#`;
  }

  private _makeResponseTopic(topic:string, method:RequestMethods, uuid:string):string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@response/${method}/${uuid}`;
  }
}
