var mqtt = require('mqtt')

var options = {
    host: 'e5547786a1c644639b5584dd5bebea46.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'testCreds',
    password: 'cualquierCosa551'
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe('my/test/topic');

// publish message 'Hello' to topic 'my/test/topic'
client.publish('my/test/topic', 'Hello');