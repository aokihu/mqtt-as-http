/* ---------------------------------- */
/*    MQTT-AS-HTTP Base Interfaces    */
/* ---------------------------------- */

declare const enum BaseHttpTopicFlow {
    REQUEST = 'req',
    RESPONSE = 'res'
}


/* ---------------------------------- */
/*   MQTT-AS-HTTP Request Interface   */
/* ---------------------------------- */

/**
 * Request methods enum
 * @member GET get method
 * @member POST post method
 * @member PUT put method
 * @member DELETE delete method
 * @member DEL delete method
 */
declare type RequestMethods = "GET" | "POST" | "PUT" | "DELETE" | "DEL"

/**
 * Response message type
 * @property time
 * @property data
 */
declare interface ResponseMessage {
    time: number
    data?: unknown
}

/**
 * Response queue item type
 */
declare interface ResponseQueueItem {
    [topic: string]: (topic: string, data: unknown) => [time:number, data:unknown]
}

/**
 * Request message type
 * @property time
 * @property data
 */
declare interface RequestMessage {
    time?: number
    data?: unknown
}

/**
 * Request queue item type
 * @property uuid
 * @property expires
 * @property resolve
 * @property reject
 * @property topic
 */
declare interface RequestQueueItem {
    uuid: string
    expires: number
    resolve: <T>(value: T | PromiseLike<T>) => void
    reject: (reason?: any) => void
    topic: string
}


/* ---------------------------------- */
/*            MQTT Interfce           */
/* ---------------------------------- */

declare type MqttOptionQos = 0 | 1 | 2
declare type MqttOptionTopic = string
declare type MqttOptionTopics = MqttOptionTopic[]

declare interface MqttOptionTopicObject {
    [key: string]: {
        qos: MqttOptionQos
    }
}

declare interface MqttSubscribeOptions {
    qos: MqttOptionQos
}

declare interface MqttSubscribeCallback {
    (err: string, granted?: {topic: MqttOptionTopic, qos: MqttOptionQos}[]): void
}

declare interface MqttUnsubscribeCallback {
    (err: string): void
}

/**
 * MQTT Client class interface
 */
declare interface MqttAdapter {
    subscribe: (topic: MqttOptionTopic | MqttOptionTopic| MqttOptionTopicObject, options?: MqttSubscribeOptions, callback? :MqttSubscribeCallback) => void
    unsubscribe: (topic: MqttOptionTopic | MqttOptionTopics, options?: any, callback?: MqttUnsubscribeCallback) => void
}