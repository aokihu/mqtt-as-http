import { EventEmitter } from "events";
import { MqttClient } from "mqtt";

export type ResponseMessage = {
  time: number,
  data: any,
}

export type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

export type RequestMessage = {
  data: any
}

export default class BaseHttp extends EventEmitter {
  protected _mqtt:MqttClient | undefined;

  constructor(mqtt:MqttClient) {
    super();
    this._mqtt = mqtt;
  }

}
