import BaseHttp, { RequestMessage, RequestMethods, ResponseMessage } from './base'
import {fmid} from 'utils'
import { MqttClient } from 'mqtt';

export default class Client extends BaseHttp {
  static timeout = 500; // Timeout for request wait
  static lengthOfNanoid = 8;
  private _queue:RequestQueueItem[] = Array<RequestQueueItem>();
  private _nanoid:Function;

  constructor(mqtt:MqttClient) {
    super(mqtt);
    try {
      this._nanoid = () => fmid(Client.lengthOfNanoid);
      this._mqtt?.on('message', this._handleResponse.bind(this));
      setInterval(this._clearExpireItem.bind(this), Client.timeout * 2);
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
    const uuid = this._nanoid();
    const expires = Date.now() + Client.timeout;
    const responseTopic = this._makeResponseTopic(topic,method, uuid);
    const requestTopic = this._makeRequestTopic(topic, method, uuid);

    try {
      this._mqtt?.subscribe(responseTopic);
      const payload = this._makeRequestMessage(method, body);
      this._mqtt?.publish(requestTopic, JSON.stringify(payload), {qos:0});
    }
    catch(error) {throw error}
    finally {
      return new Promise((resolve, reject) => {
        const item: RequestQueueItem = {uuid, expires, reject, resolve, topic:responseTopic};
        this._queue.push(item);
      });
    }
  }

  public get(topic:string, body?: any): Promise<any> {return this.request("GET", topic, body);}
  public post(topic:string, body: any): Promise<any> {return this.request("POST", topic, body)}
  public put(topic:string, body: any): Promise<any> {return this.request("PUT", topic, body)}
  public del(topic:string, body?: any): Promise<any> {return this.request("DELETE", topic, body)}

  private _handleResponse(topic:string, payload:Buffer) {
    const responseMessage:ResponseMessage = JSON.parse(payload.toString()) as ResponseMessage;
    const _segment = topic.split('/');
    const _uuid = _segment[_segment.length - 1];
    const idx = this._queue.findIndex( it => it.uuid === _uuid);

    if(idx >= 0) {
      const [{expires, resolve, reject}] = this._queue.splice(idx, 1); // remove this request from queue
      this._mqtt?.unsubscribe(topic);
      expires > Date.now() ? resolve(responseMessage) : reject('expires is timeout');
    } else {
      throw(new Error("event is not register"));
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

  private _makeResponseTopic(topic:string, method:RequestMethods, uuid:string):string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@response/${method}/${uuid}`;
  }

  private _makeRequestTopic(topic:string, method:RequestMethods, uuid:string):string {
    const slash = topic.endsWith("/") ? "" : "/";
    return `${topic}${slash}@request/${method}/${uuid}`;
  }
}
