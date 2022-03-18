import BaseHttp from "./base";
import { MqttClient } from "mqtt";

export type ResponseQueueItem = {
  [topic: string]: (topic: string, data: any) => [number, any];
};

export default class Server extends BaseHttp {

  /* ---------------------------------- */
  /*      static constant variables     */
  /* ---------------------------------- */

  private static REQUEST_REGEXP = /^(\S+)\/@_mqtt_as_http_\/req\/(GET|POST|PUT|DELETE)\/(\S+)$/;
  
  /* ---------------------------------- */
  /*          Private variables         */
  /* ---------------------------------- */
  private _queue: ResponseQueueItem = new Object() as ResponseQueueItem;

  /**
   * @constructor
   * @param mqtt MQTT client adpater object
   */
  constructor(mqtt: MqttClient) {
    super(mqtt);
    this._mqtt?.on("message", this._handleRequest.bind(this));
  }

  public get queue() {
    return this._queue;
  }

  /* ---------------------------------- */
  /*           Public methods           */
  /* ---------------------------------- */

  public route(
    method: RequestMethods,
    topic: string,
    callback: (topic: string, data?: any) => any
  ) {
    const requestedTopic: string = this._makeRequestedTopic(topic, method);
    const key = topic + "@" + method;
    this._queue[key] = callback;
    this._mqtt?.subscribe(requestedTopic);
  }

  public get(topic: string, callback: (topic: string, data?: any) => any) {
    this.route("GET", topic, callback);
  }

  public post(topic: string, callback: (topic: string, data?: any) => any) {
    this.route("POST", topic, callback);
  }

  public put(topic: string, callback: (topic: string, data?: any) => any) {
    this.route("PUT", topic, callback);
  }

  public del(topic: string, callback: (topic: string, data?: any) => any) {
    this.route("DELETE", topic, callback);
  }

  /* ---------------------------------- */
  /*           Private methods          */
  /* ---------------------------------- */

  private async _handleRequest(topic: string, payload: Buffer) {
    const result = Server.REQUEST_REGEXP.exec(topic);
    if (result) {
      const _topic = result[1]
      const method = result[2] as RequestMethods;
      const _uuid = result[3];

      const key = _topic + "@" + method;
      const _callback = this._queue[key];

      const data = this._validate(payload);
      const _data = await _callback(topic, data);
      const _payload: ResponseMessage = { data: _data, time: Date.now() };

      const responseTopic = this._makeResponseTopic(_topic, method, _uuid);
      const responsePayload = JSON.stringify(_payload);
      this._mqtt?.publish(responseTopic, responsePayload, { qos: 2 });
    }
  }

  private _makeRequestedTopic(topic: string, method: RequestMethods): string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@_mqtt_as_http_/req/${method}/#`;
  }

  private _makeResponseTopic(
    topic: string,
    method: RequestMethods,
    uuid: string
  ): string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@_mqtt_as_http_/res/${method}/${uuid}`;
  }

  private _validate(payload: Buffer): any {
    const stringPayload = payload.toString();
    const block = JSON.parse(stringPayload);

    return block.data ? block.data : block;
  }
}