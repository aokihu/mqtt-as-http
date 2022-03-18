const Mqtt = require('mqtt');
const {Client, Server} = require('../dist/index')
const expect = require('chai').expect;

const forkMqtt = () => Mqtt.connect("mqtt://127.0.0.1")

const mqtt_client = forkMqtt();
const mqtt_server = forkMqtt();

const client = new Client(mqtt_client);
const server = new Server(mqtt_server)

describe('Mqtt GET method test', function() {

  this.timeout(1000)

  this.afterAll(function() {
    mqtt_client.end();
    mqtt_server.end();
    process.exit(0);
  })
  
  /* Set server */
  this.beforeAll((done) => {
    console.log('setup server')
    
    let param = 0;
    server.get("hello", () => 'world')
    server.get("hello/world", () => "peace")
    server.get("param", () => param)
    server.post("param", (topic, data) => {
      param = data
    })
    server.del("param", (topic, data) => {
      param = 0
    })

    console.log('server ready...')
    done();
  }) 

  /* Client test cases */
  it("should return world", function(done){
    client.get("hello").then(response => {
      const {data} = response;
      expect(data).to.equal('world');
      done();
    })
  })

  it("longer topic, should return world", (done) => {
    client.get("hello/world").then(response => {
      const {data} = response;
      expect(data).to.equal('peace');
      done()
    })
  })

  it("get param, it should is 0", function(done){
    client.get('param').then(response => {
      const {data} = response;
      expect(data).to.eq(0);
      done();
    })
  })

  it("set param", function(done){
    client.post("param", 100).then(response => {
      done();
    })
  })

  it("get param, it should be 100", function(done){
    client.get("param").then(response => {
      const {data} = response;
      expect(data).to.eq(100);
      done();
    })
  })

  it("reset param, it should be 0", function(done){
    client.del("param").then(() => {
      client.get("param").then(response => {
        const {data} = response;
        expect(data).to.eq(0);
        done();
      })
    })
  })

})
