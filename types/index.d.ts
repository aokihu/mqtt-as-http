
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