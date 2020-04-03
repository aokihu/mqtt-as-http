# mqtt-as-http
**Version 1.0.8**

The old project [mqtt-request](https://www.npmjs.com/package/mqtt-request) is abandoned, it was designed very bad.

So I start the new project *mqtt-as-http*, it is more like http now.

## Goal

Sometimes when we use MQTT communication protocols, we also want to be able to have HTTP-like communication methods to simplify non-asynchronous communication mechanisms, 
so that we do not need to use multiple communication protocols.

Therefore, the use of this module will bring the HTTP experience into the MQTT communication, 
reduce the handling of asynchronous communication back-off operations, simplify communication processing logic


## Install
You could install the module easily use `npm` or `yarn`, *mqtt* is necessary module, so we also install it.

Install with `npm`

```shell
npm install mqtt-as-http mqtt
```

Or you can also install with `yarn`

```shell
yarn add mqtt-as-http mqtt
```

## How to work
I've optimized the way modules are used, and now I can handle requests in an HTTP-like way

### Server

```javascript

const Mqtt = require('mqtt') 
const {Server} = require('mqtt-as-http');

// create new mqtt connect
const mqtt = Mqtt.connec('mqtt://127.0.0.1');

// For server
const server = new Server(mqtt);

// Register routes
// You can use get(), post(), put() or del() methods
let param = 0;

// GET
server.get('hello', (topic, data) => {return 'world'});
server.get('param', (topic, data) => {return param});

// POST
server.post('param', (topic, data) => {
  param = data;
  return true;
});

// DELETE
server.del('param', (topic, data) => {
  param = 0;
  return true;
});
```

**In fact, whichever method you use is the same, so the design is designed to mimic the HTTP request style as much as possible.**

### Client

```javascript
const Mqtt = require('mqtt') 
const {Client} = require('mqtt-as-http');

// create new mqtt connect
const mqtt = Mqtt.connec('mqtt://127.0.0.1');

// For server
const client = new Client(mqtt);

// GET
client.get("hello").then((response) => {
  const {data} = response;
  console.log(data); // output will be 'world'
});

// POST
client.post('param', 100).then((response) => {
  const {data} = response;
  console.log(data) // output will be true
});

// GET
client.get('param').then((response) => {
  const {data} = response;
  console.log(data); // output will be 100
});

// DELETE
client.del('param').then((response) => {
  const {data} = response;
  console.log(data); // output will be true
})

// GET
client.get('param').then((response) => {
  const {data} = response;
  console.log(data); // output will be 0
});
```

It's very easy to use it like HTTP, but you can't send binary data now, because the transfer data will encode to UTF-8 string.

## Methods

### Server::constructor(mqtt)

    This is constructor method return server instance.

### Server#get(topic:string, (topic:string, data:any) => any)
### Server#post(topic:string, (topic:string, data:any) => any)
### Server#put(topic:string, (topic:string, data:any) => any)
### Server#del(topic:string, (topic:string, data:any) => any)

    All of methods above is same, they register a route to listen incoming message, `topic` is received from client which without extra strings.


### Client::constructor(mqtt)
    This is constructor method return client instance.

### Client#get(topic:string) => Promise<response:{data}>
### Client#post(topic:string) => Promise<response:{data}>
### Client#put(topic:string) => Promise<response:{data}>
### Client#del(topic:string) => Promise<response:{data}>

    All of methods above is same

## Source

For reduce the size of module, so I only upload files which is needly. You can find the source code from [this github link](https://github.com/aokihu/mqtt-as-http).

And I would love to hear your improve suggestions.
