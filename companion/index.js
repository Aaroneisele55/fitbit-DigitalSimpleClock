import { me as companion } from "companion";
import weather from "weather";
import { peerSocket } from "messaging";

peerSocket.onopen = function() {
  getWeather(true);
}
peerSocket.onmessage = evt => {
  getWeather(false);
};
function getWeather(ign)
{
if (companion.permissions.granted("access_location")) {
   weather
     .getWeatherData()
     .then((data) => {
       if (data.locations.length > 0) {
         let temp = 111;
         let tempPrev = -222;
         tempPrev = temp;
         temp = Math.floor(data.locations[0].currentWeather.temperature);
         const cond = data.locations[0].currentWeather.weatherCondition;
         const loc = data.locations[0].name;
         const unit = data.temperatureUnit;
         console.log(`It's ${temp}\u00B0 ${unit} and ${cond} in ${loc}`);
         
         console.log("Max message size=" + peerSocket.MAX_MESSAGE_SIZE);
         if(temp != tempPrev || ign == true)
          if (peerSocket.readyState === peerSocket.OPEN) {
              peerSocket.send('{"temp":'+'"'+temp+'"'+',"loc":'+'"'+loc+'","cond":'+'"'+cond+'"'+"}");
           }
         }
       });
}
}
