/**
 * @package mqtt-as-http
 * @module utils
 * @author aokihu <aokihu@gmail.com>
 * @version $VERSION
 * @description some tools for this package
 */
 
 import {randomBytes} from 'crypto'
 
/**
 * @function fmid
 * @param length for random string length
 * @description
 * Get random string for id
 */
export const fmid = (length: number):string => {
    const _now = Buffer.from(Date.now().toString(16));
    const _rand = randomBytes(128);
    for(let i = 0; i < _now.byteLength; i++) {
        _rand[i] = _now[i] + _rand[i]
    }
    return _rand.toString("hex").substring(0, length)
}