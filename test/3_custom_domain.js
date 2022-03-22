const Mqtt = require('mqtt');
const { Client, Server } = require('../dist/index')
const expect = require('chai').expect;

const forkMqtt = () => Mqtt.connect("mqtt://127.0.0.1")

const mqtt_client = forkMqtt();
const mqtt_server = forkMqtt();

const client = new Client(mqtt_client);
const server = new Server(mqtt_server);

const CUSTOM_DOMAIN = "@_custom_domain_"


/* Custom domain test case */
describe("Custom domain testcases", function() {
    this.timeout(5000);
    
    this.afterAll(() => {
        mqtt_client.end();
        mqtt_server.end();
    })

    it("Server set custom domain", (done) => {
        done("have not set!")
    })
})
  