const assert = require('assert');
const Mqtt = require('mqtt');
const { Client, Server } = require('../dist/index')
const expect = require('chai').expect;

const forkMqtt = () => Mqtt.connect("mqtt://127.0.0.1")

const mqtt_client = forkMqtt();
const mqtt_server = forkMqtt();

const CUSTOM_DOMAIN = "@_custom_domain_"


/* Custom domain test case */
describe("Custom domain testcases", function(done) {
    this.timeout(5000);

    const client = new Client(mqtt_client, {domain: CUSTOM_DOMAIN});
    let server = new Server(mqtt_server, {domain: CUSTOM_DOMAIN});
    
    this.afterAll(function() {
        mqtt_client.end();
        mqtt_server.end();
        process.exit(0)
    })

    it("Server set custom domain", (done) => {
        server = new Server(mqtt_server, {
            domain: CUSTOM_DOMAIN
        })

        assert.equal(server.domain, CUSTOM_DOMAIN)
        done()
    })

    it("Server register message", (done) => {
        server.get("hello", () => 'world')
        done();
    })

    it("Client request 'hello'", (done) => {
        client.get("hello", (response) => {
            const {data} = response
            assert.strictEqual(data, "world")
        })
    })
})
  