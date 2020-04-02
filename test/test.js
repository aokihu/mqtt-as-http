const Mqtt = require('mqtt');
const {Client} = require('../dist/index')
const expect = require('chai').expect;

const mqtt = Mqtt.connect("mqtt://127.0.0.1")
const client = new Client(mqtt);

describe('Mqtt GET method test', function() {

  after(function() {

    mqtt.end();
    process.exit(0);

  })

  it("should return world", function(done){
    client.get("hello").then(response => {
      const {data} = response;
      expect(data).to.equal('world');
      done();
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
