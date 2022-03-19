import BaseHttp from "./base";
import { MqttClient } from "mqtt";
import { MQTT_AS_HTTP_REQUEST_PARTTEN } from "./constant";

export type ResponseQueueItem = {
  [topic: string]: (topic: string, data: any) => [number, any];
};

export default class Server extends BaseHttp {

  /* ---------------------------------- */
  /*      static constant variables     */
  /* ---------------------------------- */

  private static REQUEST_REGEXP = MQTT_AS_HTTP_REQUEST_PARTTEN;
  
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
    const key = `${topic}@${method}`
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

  /**
   * Process incoming message
   * @param topic subscribled topic
   * @param payload any data
   */
  private async _handleRequest(topic: string, payload: Buffer) {
    const result = Server.REQUEST_REGEXP.exec(topic);
    if (result) {
      const _topic = result[1]
      const _method = result[2] as RequestMethods;
      const _uuid = result[3];

      const _key = `${_topic}@${_method}`;
      const _callback = this._queue[_key];

      const data = this._validate(payload);
      const _data = await _callback(topic, data);
      const _payload: ResponseMessage = { data: _data, time: Date.now() };

      const responseTopic = this._makeResponseTopic(_topic, _method, _uuid);
      const responsePayload = JSON.stringify(_payload);
      this._mqtt?.publish(responseTopic, responsePayload, { qos: 2 });
    }
  }

  /**
   * Generate full topic for subscribing
   * @param topic topic string
   * @param method method name
   * @returns full request topic for subscribe
   */
  private _makeRequestedTopic(topic: string, method: RequestMethods): string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@_mqtt_as_http_/req/${method}/#`;
  }

  /**
   * Generate full topic for publishing
   * @param topic topic string
   * @param method method name
   * @param uuid incoming message id
   * @returns full response topic for response
   */
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