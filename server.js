/**
 * 测试用例
 */
const {Server} = require('./build/index');
const Mqtt = require('mqtt');

const mqtt = Mqtt.connect("mqtt://127.0.0.1");
const server = new Server(mqtt);

let param = 0;

server.get("hello", (topic) => {
  return 'world'
})

server.post('param', (topic, data) => {
  param = data;
})

server.get('param', (topic) => {
  return param;
})

server.del('param', () =>{param = 0})

console.log(server.queue);

