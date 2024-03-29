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
   * Qos
   */
  protected _qos: MqttOptionQos
  
  /**
   * Domain sign string 
   * @default "@_mqtt_as_http_"
   * @example 
   * 'hello/[@_mqtt_as_http_]/req/balabala...'
   * "@_mqtt_as_http_" is the domain sign string
   */
  protected _domain: string;
  
  /**
   * Request and response support methods
   * these methods is apart of HTTP methods
   * I choose 4 methods for most popular
   * ----------------------------------------
   * "GET", "POST", "PUT", "DELETE"
   * ---------------------------------------- 
   * Actually, the difference is the meaning of methods
   * 
   */
  protected _supportMethods: string[];

  /* ---------------------------------- */
  /*          Private functions         */
  /* ---------------------------------- */

  /**
   * @constructor
   * @param mqtt MQTT client adapter object
   */
  constructor(...args: any[]) {
    super();
  
    /* Default options */
    let opts = {
      domain :'@_mqtt_as_http_',
      supportMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      qos: 0
    }

    /**
     * constructor(MqttClient, Options)
     */
    if(args.length === 2) {
      const [_mqtt_, _opts_] = args
      this._mqtt = _mqtt_ as MqttClient
      opts = {...opts, ..._opts_}
    }

    if(args.length === 1) {
      const [arg] = args;

      if('mqtt' in arg) {
        this._mqtt = arg['mqtt'];
        const {mqtt, ..._opts_} = arg;
        opts = {...opts, ..._opts_};
      } else {
        this._mqtt = arg as MqttClient
      }
    }

    /* Set instance properties */
    this._domain = opts.domain
    this._supportMethods = opts.supportMethods
    this._qos = opts.qos as MqttOptionQos
  }
  

  /* ---------------------------------- */
  /*             Get and Set            */
  /* ---------------------------------- */

  /**
   * @property domain
   */
  get domain() {return this._domain}


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

  /**
   * Generate topic regexp partten
   * @param flow 'res' or 'req'
   * @returns regexp partten
   */
  protected generateTopicRegexp(flow: 'req' | 'res'): RegExp{
    return new RegExp(`^(\\S+)/${this._domain}/${flow}/(${this._supportMethods.join('|')})/(\\S+)$`)
  }
}


