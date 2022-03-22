/**
 * @package mqtt-as-http
 * @module base
 * @author aokihu <aokihu@gmail.com>
 * @version $VERSION
 * @license MIT
 */


import { EventEmitter } from "events";
import type { MqttClient } from "mqtt";
import {MQTT_AS_HTTP_FULL_TOPIC_PARTTEN} from "./constant"
import {endSlash, fmid} from './utils'

/**
 * Serve and client base class
 */
export default class BaseHttp extends EventEmitter {
  
  /* ---------------------------------- */
  /*      Static constant variables     */
  /* ---------------------------------- */

  static FULL_TOPIC_PARTTEN = MQTT_AS_HTTP_FULL_TOPIC_PARTTEN

  /* ---------------------------------- */
  /*         Protected variables        */
  /* ---------------------------------- */

  protected _mqtt: MqttClient | undefined;
  
  /**
   * Domain sign string 
   * @default "@_mqtt_as_http_"
   * @example 
   * 'hello/[@_mqtt_as_http_]/req/balabala...'
   * "@_mqtt_as_http_" is the domain sign string
   */
  protected _domain: string;

  /* ---------------------------------- */
  /*          Private functions         */
  /* ---------------------------------- */

  /**
   * @constructor
   * @param mqtt MQTT client adapter object
   */
  constructor(mqtt: MqttClient) {
    super();
    this._domain = "@_mqtt_as_http_"
    this._mqtt = mqtt;
  }


  /* ---------------------------------- */
  /*         Protected functions        */
  /* ---------------------------------- */

  /**
   * Generate full topic for response or request
   * @param method the method of request
   * @param rawTopic raw topic
   * @returns [uuid, requestTopic, responseTopic] 
   * - uuid: The topic id
   * - requestTopic: Request full topic string
   * - responseTopic: Response full topic string
   */
  protected generateFullTopic( method: RequestMethods, rawTopic: string): [string, string, string]{
    const slash = endSlash(rawTopic)
    const id = fmid(8);
    const domain = this._domain
    const topics = ['req','res'].map(m => `${rawTopic}${slash}${domain}/${m}/${method}/${id}`) as [string, string]
    return [id, ...topics]
  }
}


