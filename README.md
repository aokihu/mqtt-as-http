# mqtt-as-http
**Version 2.1.1**

## Goal

Sometimes when we use MQTT communication protocols, we also want to be able to have HTTP-like communication methods to simplify non-asynchronous communication mechanisms, 
so that we do not need to use multiple communication protocols.

Therefore, the use of this module will bring the HTTP experience into the MQTT communication, 
reduce the handling of asynchronous communication back-off operations, simplify communication processing logic.

Although MQTT v5 have new protocol to support **request** and **response**, older protocol is not supported. Most client are not supported MQTT v5 now.

`mqtt-as-http` is compatible with new and old protocols. You can use MQTT the same way you use HTTP.

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

## How to achieve

When someone *publish* a topic to MQTT broker, `mqtt-as-http` will trap the topic and extra sign data into the raw topic.

```
RAW TOPIC     = hello/
                  |
                  V
REQUEST TOPIC = hello/@_mqtt_as_http_/req/${method}/${id}
                      --------------- === --------- =====
                            ^          ^      ^       ^
                            |          |      |       |
                Domain name for sign   |      |       |
                                       |      |       |
                Request or Response   -+      |       |
                                              |       |
                Method like HTTP    ----------+       |
                                                      |
                Message id for track   ---------------+
```




## How to work
I've optimized the way modules are used, and now I can handle requests in an HTTP-like way

### Server

```javascript
/* ------------------------------- */
/*             Import              */
/* ------------------------------- */

/* Common JS */
const Mqtt = require('mqtt') 
const {Server} = require('mqtt-as-http');

/* ES Module or Typescript */
import { Server } from 'mqtt-as-http'

/* ------------------------------- */
/*              Usage              */
/* ------------------------------- */

// Create new mqtt instance object
const mqtt = Mqtt.connect('mqtt://127.0.0.1');

// Create server
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

**In fact, whatever method you use is the same, so the design is designed to mimic the HTTP request style as much as possible.**

### Client

```javascript
/* ------------------------------- */
/*             Import              */
/* ------------------------------- */

/* Common JS */
const Mqtt = require('mqtt') 
const {Server} = require('mqtt-as-http');

/* ES Module or Typescript */
import { Server } from 'mqtt-as-http'

/* ------------------------------- */
/*              Usage              */
/* ------------------------------- */

// Create new mqtt instance object
const mqtt = Mqtt.connect('mqtt://127.0.0.1');

// Create client
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

### Server::constructor(mqtt, [options])

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

### Custom domain

You can use `custom domain` to send or receive message, `custom domain` is gerneral string,
but my suggestion is use `@` for first character.

```javascript
/* ------------------------------- */
/*             Import              */
/* ------------------------------- */

/* Common JS */
const Mqtt = require('mqtt') 
const {Server} = require('mqtt-as-http');

/* ES Module or Typescript */
import { Server, Client } from 'mqtt-as-http'

/* --- Create server and client --- */

// Create new mqtt instance object
const mqtt_server = Mqtt.connect('mqtt://127.0.0.1');
// Create server
const server = new Server(mqtt_server, {domain: '@my_custom_domain'});

// Create new mqtt instance object
const mqtt_client = Mqtt.connect('mqtt://127.0.0.1');
// Create client
const client = new Client(mqtt_client, {domain: '@my_custom_domain'});

/* ------ Request listening ------ */
server.get('hello', () => 'world')

/* -------- Send request --------- */
client.get('hello').then(response => {
  const {data} = response
  console.log(data) // 'world'
})

```

## Source

For reduce the size of module, I only upload files which is needly. You can find the source code from [this github link](https://github.com/aokihu/mqtt-as-http).

And I would love to hear your improve suggestions.

## Change Log

**2.1.0**
- Custom domain support

**2.0.4**
- Update README.md

**2.0.0**
- Update README.md
- Complete the Typescript declaration file
- Restructured request and response topic format

**1.0.11** Remove debug information output.
