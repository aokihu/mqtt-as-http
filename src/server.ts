import BaseHttp from "./base";
import type { MqttClient } from "mqtt";
import { MQTT_AS_HTTP_REQUEST_PARTTEN, MQTT_AS_HTTP_SIGN } from "./constant";
import {endSlash} from './utils'

/**
 * MQTT Server class
 */
export default class Server extends BaseHttp {

  /* ---------------------------------- */
  /*      static constant variables     */
  /* ---------------------------------- */

  private static REQUEST_REGEXP = MQTT_AS_HTTP_REQUEST_PARTTEN;
  
  /* ---------------------------------- */
  /*          Private variables         */
  /* ---------------------------------- */
  
  private _queue: ResponseQueueItem = new Object() as ResponseQueueItem;
  
  /* ------------- Options ------------ */
  
  private _options:Partial<ServerOptions> = {
    qos: 0,
    sign: MQTT_AS_HTTP_SIGN
  }

  /**
   * @constructor
   * @param mqtt MQTT client adpater object
   */
  constructor(...args: any) {
    super(...args);
    this._mqtt?.on("message", this._handleRequest.bind(this));
  }

  /**
   * @get queue
   */
  public get queue() {
    return this._queue;
  }

  /* ---------------------------------- */
  /*           Public methods           */
  /* ---------------------------------- */

  public route(
    method: RequestMethods,
    topic: string,
    callback: ResponseRouteCallback
  ) {
    const key = `${topic}@${method}`
    this._queue[key] = callback;
    this._mqtt?.subscribe(this._makeRequestedTopic(topic, method));
    return this;
  }

  /**
   * Shortcut method for route()
   */
  public get  = (...args: ResponseShortcutParam) => this.route.apply(this,["GET", ...args])
  public post = (...args: ResponseShortcutParam) => this.route.apply(this,["POST", ...args])
  public put  = (...args: ResponseShortcutParam) => this.route.apply(this,["PUT", ...args])
  public del  = (...args: ResponseShortcutParam) => this.route.apply(this,["DELETE", ...args])

  /* ---------------------------------- */
  /*           Private methods          */
  /* ---------------------------------- */

  /**
   * Process incoming message
   * @param topic subscribled topic
   * @param payload any data
   */
  private async _handleRequest(topic: string, payload: Buffer) {
    const regexp = this.generateTopicRegexp("req")
    const result = regexp.exec(topic) as unknown as [unknown, string, RequestMethods, string]

    if (result) {
      const [_, _topic, _method, _uuid] = result;

      const _key = `${_topic}@${_method}`;
      const _callback = this._queue[_key];
      const data = this._validate(payload);
      const _data = await _callback(topic, data);
      const _payload: ResponseMessage = { data: _data, time: Date.now() };

      const responseTopic = this._makeResponseTopic(_topic, _method, _uuid);
      const responsePayload = JSON.stringify(_payload);
      this._mqtt?.publish(responseTopic, responsePayload, { qos: this._options.qos });
    }
  }

  /**
   * Generate full topic for subscribing
   * @param topic topic string
   * @param method method name
   * @returns full request topic for subscribe
   */
  private _makeRequestedTopic(topic: string, method: RequestMethods): string {
    const slash = endSlash(topic);
    return `${topic}${slash}${this._domain}/req/${method}/#`;
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
    const slash = endSlash(topic);
    return `${topic}${slash}${this._domain}/res/${method}/${uuid}`;
  }

  private _validate(payload: Buffer): any {
    const stringPayload = payload.toString();
    const block = JSON.parse(stringPayload);
    return block.data ? block.data : block;
  }
}