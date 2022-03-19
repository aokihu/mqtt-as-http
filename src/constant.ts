/**
 * @package mqtt-as-http
 * @module constant
 * @author aokihu <aokihu@gmail.com>
 * @version $VERSION
 * @description
 * Constant variables defintion
 */


/* ---------------------------------- */
/*        Topic Regexp Partten        */
/* ---------------------------------- */


export const MQTT_AS_HTTP_SIGN = '@_mqtt_as_http_'
export const MQTT_AS_HTTP_FLOWS = ["res", "req"]
export const MQTT_AS_HTTP_METHODS = ["GET","POST","PUT","DELETE"]
export const FULL_TOPIC_PARTTEN = /(\w)+\/@_mqtt_as_http\/[res|req]\/[GET|POST|PUT|DELETE]\/(\w+)/

export const MQTT_AS_HTTP_FULL_TOPIC_PARTTEN = new RegExp(`(\s+)/${MQTT_AS_HTTP_SIGN}/(${MQTT_AS_HTTP_FLOWS.join('|')})/(${MQTT_AS_HTTP_METHODS.join("|")})/(\s+)`)
export const MQTT_AS_HTTP_REQUEST_PARTTEN = /^(\S+)\/@_mqtt_as_http_\/req\/(GET|POST|PUT|DELETE)\/(\S+)$/