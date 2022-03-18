/* ---------------------------------- */
/*       MQTT-AS-HTTP Interface       */
/* ---------------------------------- */

/**
 * Response message type
 * @property time
 * @property data
 */
declare interface ResponseMessage {
    time: number
    data: unknown
}

/**
 * Request message type
 * @property time
 * @property data
 */
declare interface RequestMessage {
    time: number
    data: unknown
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
    resolve: (param?: any) => void
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