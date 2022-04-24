import { me as companion } from "companion";
import weather from "weather";
import { peerSocket } from "messaging";
const MILLISECONDS_PER_MINUTE = 1000 * 60;

peerSocket.onopen = function() {
  getWeather(true);
}
peerSocket.onmessage = evt => {
  getWeather(true);
};
companion.onunload=function(){
  getWeather(true);
}
companion.wakeInterval = 5 * MILLISECONDS_PER_MINUTE;
companion.addEventListener("wakeinterval", getWeather(true));
// Event happens if the companion is launched and has been asleep
if (companion.launchReasons.wokenUp) {
  getWeather(true);
}
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
         if(temp != tempPrev || ign == true)
          if (peerSocket.readyState === peerSocket.OPEN) {
              peerSocket.send('{"temp":'+'"'+temp+'"'+',"loc":'+'"'+loc+'","cond":'+'"'+cond+'"'+"}");
           }
         }

       });
}}