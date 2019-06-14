//////////////////
//Everloop Stuff//
//////////////////

/////////////
//VARIABLES//
/////////////
var snipsUserName = "alexisCruz";
const matrix = require('@matrix-io/matrix-lite');
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost', { port: 1883 });
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';
//hermes/intent/account username: intentName
var Reactor = 'hermes/intent/'+snipsUserName+':arcReactor'; 
var waitingToggle = false;

var counter = 0;


setInterval(function(){
	
	if (waitingToggle == false) {
		matrix.led.set({});
	};

	if (waitingToggle == true) {
			// Set individual LED value
			matrix.led.set({
                r: 0,
                b: (Math.round((Math.sin(counter) + 1) * 100) + 10),// Math used to make pulsing effect,
                g: 0,
                w: 0,
            })
	};
	counter = counter + 0.2;
},50);


////////////////////////////
//MQTT Stuff with Everloop//
////////////////////////////

client.on('connect', function() {
	console.log("Connected to localhost");

	client.subscribe(wakeword);

	client.subscribe(sessionEnd);

	client.subscribe(Reactor);

});

client.on('message', function(topic,message) {
    var message = JSON.parse(message);
	switch(topic) {
        // * On Wakeword
        case wakeword:
            console.log('Wakeword Detected');
        break;
        // * On Light State Change
        case Reactor:
            // Turn lights On/Off
            try{
                if (message.slots[0].value.value === 'on'){
                    console.log('Reactor On Detected');
                    waitingToggle = true;
                }
                else if(message.slots[0].value.value === 'off'){
                    console.log('Reactor Off Detected');
                    waitingToggle = false;
                }
            }
            // Expect error if `on` or `off` is not heard
            catch(e){
                console.log('Did not receive an On/Off state')
            }
        break;
        // * On Conversation End
        case sessionEnd:
            console.log('Session Ended\n');
        break;
    }
});