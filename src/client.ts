import BaseHttp from './base'
import {fmid} from './utils'
import { MqttClient } from 'mqtt';


/**
 * @package mqtt-as-http
 * @module client
 * @class Client
 * @author aokihu <aokihu@gmail.com>
 * @version $VERSION
 * @license MIT
 */
export default class Client extends BaseHttp {
  
  /* ---------------------------------- */
  /*      Static constant variables     */
  /* ---------------------------------- */
  
  /* Timeout for request wait */
  static TIMEOUT = 30000; 
  static RESPONSE_REGEXP = /^(\S+)\/@_mqtt_as_http_\/res\/(GET|POST|PUT|DELETE)\/(\S+)$/

  /* ---------------------------------- */
  /*          Private variables         */
  /* ---------------------------------- */
  
  private _queue: RequestQueueItem[] = Array<RequestQueueItem>();
  private _timeout: number;
  private _nanoid:Function;

  /**
   * @constructor
   * @param mqtt MQTT client adpater object
   */
  constructor(mqtt:MqttClient) {
    super(mqtt);
    this._timeout = Client.TIMEOUT

    try {
      this._nanoid = () => fmid(8);
      this._mqtt?.on('message', this._handleResponse.bind(this));
      setInterval(this._clearExpireItem.bind(this), this._timeout * 2);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send request to server
   * @param method Request method, like GET, POST, PUT
   * @param topic Request resource name
   * @param body Attatch payload data
   */
  public request<T=any>(method: RequestMethods, topic:string, body: any): Promise<T> {
    const expires = Date.now() + this._timeout;
    const [uuid, requestTopic, responseTopic] = this.generateFullTopic(method, topic)

    try {
      const payload = this._makeRequestMessage(method, body);
      this._mqtt?.subscribe(responseTopic);
      this._mqtt?.publish(requestTopic, JSON.stringify(payload), {qos:2});
    }
    catch(error) {throw error}
    finally {
      return new Promise<any>((resolve, reject) => {
        const item: RequestQueueItem = {uuid, expires, reject, resolve, topic:responseTopic};
        this._queue.push(item);
      });
    }
  }

  public get(topic:string, body?: any): Promise<any> {return this.request("GET", topic, body);}
  public post(topic:string, body: any): Promise<any> {return this.request("POST", topic, body)}
  public put(topic:string, body: any): Promise<any> {return this.request("PUT", topic, body)}
  public del(topic:string, body?: any): Promise<any> {return this.request("DELETE", topic, body)}


  /* ---------------------------------- */
  /*           Private methods          */
  /* ---------------------------------- */

  private _handleResponse(topic:string, payload:Buffer) {
    const result = Client.RESPONSE_REGEXP.exec(topic);
    
    if(result) {
      const _uuid = result[3]
      const responseMessage:ResponseMessage = JSON.parse(payload.toString()) as ResponseMessage;
      const idx = this._queue.findIndex( it => it.uuid === _uuid);
      
      if(idx >= 0) {
        const [{expires, resolve, reject, topic:_topic}] = this._queue.splice(idx, 1); // remove this request from queue
        this._mqtt?.unsubscribe(topic);
        expires > Date.now() ? resolve(responseMessage) : reject('expires is timeout');
      } else {
        throw(new Error("event is not register"));
      }
    }
  }

  private _clearExpireItem() {
    const now = Date.now();
    this._queue = this._queue.reduce((t:RequestQueueItem[], it:RequestQueueItem) => {
      const {expires, reject, topic} = it;
      if(expires < now) {return [...t, it]}
      else {
        this._mqtt?.unsubscribe(topic)
        reject('expires is timeout')
        return t;
      }
    }, <RequestQueueItem[]>[]);
  }

  private _makeRequestMessage(method:RequestMethods, data: any):RequestMessage {
    return {data}
  }
}
