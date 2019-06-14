const matrix = require("@matrix-io/matrix-lite");

var methods = {}; //methods object
var relayPin1 = 0;
var relayPin2 = 1;
//initialize the global variables//
var currentTemperature = 20; //store the current temperature
//create the offset temperatures (usually 1 degree above and below the desired temperature)
var temperatureOffset1 = 0;
var temperatureOffset2 = 0;
//create variables that hold the humidity and pressure temperature sensor readings
var humidityTemperature = 0;
var pressureTemperature = 0;
var waitingToggle = false;
var lowestTemperature = 10; //holds the lowest temperature wanted (be mindful of farenheit /celsius conversions)
var highestTemperature = 30; //holds the highest temperature wanted (be mindful of farenheit /celsius conversions)
var list = ['blue'];
matrix.gpio.setFunction(0, "DIGITAL");
matrix.gpio.setFunction(1, "DIGITAL");
matrix.gpio.setMode(0, "output");
matrix.gpio.setMode(1, "output");


setInterval(function(){
    humidityTemperature = matrix.humidity.read().temperature;
    pressureTemperature = matrix.pressure.read().temperature;

    currentTemperature = (humidityTemperature + pressureTemperature)/2 - 13;
    console.log(currentTemperature);
},50);

methods.sleep = function(milliseconds) {
    var start = new Date().getTime();
    while ((new Date().getTime() - start) < milliseconds){
        

    }
  }
  
setInterval(function(){
    if (!waitingToggle) {
        matrix.led.set({});
        list = ['blue'];
    };
    // matrix.led('green').render();
    // Creates pulsing LED effect
    if (waitingToggle) {
        if(list.length < 35){
        for (var i = 0; i < 35; ++i) {
            // Set individual LED value
        
            matrix.led.set(list);
           methods.sleep(10);
           list.push('blue');
        }
    }
}
},50);
methods.startWaiting = function() {
    waitingToggle = true;
  };
  methods.stopWaiting = function() {
    waitingToggle = false;
  };
methods.makeTemp = function(temp1, temp2){
    //set the first and second temperature offsets to a degree greater and less than the desired temperature
   temperatureOffset1 = temp1;
   temperatureOffset2 = temp2;
   if(currentTemperature < temperatureOffset1)
   {
           //set the first relay on and turn off the other
           matrix.gpio.setDigital(0, "OFF");
           matrix.gpio.setDigital(1, "ON");
           
           //log the current temperature and the offsets
           console.log(currentTemperature);
           console.log(temperatureOffset1);
           console.log(temperatureOffset2);
           //wait a second and then call the makeTemp function again to check the temperature
           setTimeout(function(){
              methods.makeTemp(temperatureOffset1,temperatureOffset2);
           }, 1000);
   }
   else if(currentTemperature > temperatureOffset2)
   {
           //set the second relay on and turn off the other
           matrix.gpio.setDigital(0, "ON");
           matrix.gpio.setDigital(1, "OFF");
           //log the current temperature and the offsets
           console.log(currentTemperature);
           console.log(temperatureOffset1);
           console.log(temperatureOffset2);
           //wait a second and then call the makeTemp function again to check the temperature
           setTimeout(function(){
              methods.makeTemp(temperatureOffset1,temperatureOffset2);
           }, 1000);
   }
   else{
       //log the current temperature
       console.log(currentTemperature);
       //turn off both relays
        matrix.gpio.setDigital(0, "ON");
        matrix.gpio.setDigital(1, "ON");
       //after a second check the temperature again for any changes
       setTimeout(function(){
           methods.makeTemp(temperatureOffset1,temperatureOffset2);
        }, 1000);
   }
};
methods.currentTemperature = function(){
   return currentTemperature;
}
methods.tellTemp = function(){
    var list = ["blue"];    
    for (var i = 0; i < 35; ++i){
        if((currentTemperature <= highestTemperature && currentTemperature >= lowestTemperature))
        {
            if(i <= ((currentTemperature-lowestTemperature)*(35/(highestTemperature-lowestTemperature)))) //represent temperature through leds
            {
                matrix.led.set(list);
                list.push({
                    r: (255)/(Math.exp(-0.3*i+5)+1) - 1,
                    g: 0,
                    b: -255/(Math.exp(-0.3*i +5) +1) +255,
                    w: 0
                    });
            }
            else{
                //make the rest of the leds blank
                matrix.led.set(list);
                list.push({});
            }
        }
    }
        if(currentTemperature > highestTemperature)
        {
            //change all leds to red
            matrix.led.set("red");
        }
        else if(currentTemperature < lowestTemperature)
        {
            //change all leds to blue
            matrix.led.set("blue");
        }
  
     
 };
 module.exports = methods;
 // Export methods in order to make them avaialble to other files 
 
