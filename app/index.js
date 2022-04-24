import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { today } from "user-activity";
import { Barometer } from "barometer";
import { display } from "display";
import { peerSocket } from "messaging";
import { gettext } from "i18n";
import { battery } from "power";
import { charger } from "power";
import { locale } from "user-settings";
// Update the clock every minute
clock.granularity = "seconds";
// Get a handle on the <text> element
const clockLabel = document.getElementById("clock");
const stepsLabel = document.getElementById("steps");
const hrLabel = document.getElementById("hr");
const heightLabel = document.getElementById("height");
const tempLabel = document.getElementById("temp");
const locLabel = document.getElementById("loc");
const condLabel = document.getElementById("cond");
const battLabel = document.getElementById("batt");
const battLabel2 = document.getElementById("batt2");
const dateLabel = document.getElementById("date");
let simple = false;

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let minsPrev = -1;
  let today = evt.date;
  let hours = today.getHours();
  let secs = util.zeroPad(today.getSeconds());
  let currentTimestamp = new Date(today).getTime();
  let mins;
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  minsPrev = mins;
  let mins = util.zeroPad(today.getMinutes());
  clockLabel.text = `${hours}:${mins}:${secs}`;
  dateLabel.text = today.toLocaleString(locale.language);
  if(mins != minsPrev)
    {
      if (peerSocket.readyState === peerSocket.OPEN) {
       peerSocket.send("UPD");
      }
    }
}

//HRM init and mapping <--->
const hrm = new HeartRateSensor();
   hrm.addEventListener("reading", () => {
     hrLabel.text = hrm.heartRate+" BPM";
   });


//Steps init and mapping <--->
if (appbit.permissions.granted("access_activity")) {
   stepsLabel.text = today.adjusted.steps+" "+gettext("steps");
}


const wConds = ["klar","wolkig","kalt","Flurries","Nebel","SchneeRegen","Nebel(N)","Nebel(T)","heiß","Eis","Wolken(T)","Wolken(N)","meist klar","meist wolkig","Gewitter","meist wolkig + Flurries","meist wolkig + Flurries","meist wolkig + Schauer","meist wolkig + Schauer","meist wolkig + Schnee","meist wolkig + Schnee","meist wolkig + Gewitter","meist wolkig + Gewitter","meist sonnig","bedeckt","teils wolkig","teils wolkig + Schauer","teils wolkig + Gewitter","sonnig","Sonne+Flurries","Sonne+Schauer","Sonne+Gewitter","Regen","Regen+Schnee","Schauer","Schneeregen","Schnee","sonnig","meist wolkig","windig"];
//Barometer init and reading <--->
battLabel2.style.display = "none";
battLabel.style.display = "inline";
dateLabel.style.display = "none";
battLabel.text = Math.floor(battery.chargeLevel) + "%"+(charger.connected ? "+" : "")+(charger.powerIsGood ? "+" : "");
battLabel2.text = Math.floor(battery.chargeLevel) + "%"+(charger.connected ? "+" : "")+(charger.powerIsGood ? "+" : "");
const barometer = new Barometer({ frequency: 1 });
barometer.addEventListener("reading", () => {
  if(simple==false)
    {
   heightLabel.text = Math.round(util.altitudeFromPressure(barometer.pressure / 100)/3.281)-61 + " m";
    }
});
hrm.start();
barometer.start();
  // Begin monitoring the sensor
display.addEventListener("change", () => {
   if (display.on) {
     hrm.start();
     barometer.start();
     if (peerSocket.readyState === peerSocket.OPEN) {
        peerSocket.send("UPD");
     }
   } else {
      hrm.stop();
     barometer.stop();
   }
});
peerSocket.onmessage = evt => {
  let data = evt.data;
  const dParse = JSON.parse(data);
  if(!simple)
    {
      tempLabel.text = dParse.temp + " °C";
      locLabel.text = dParse.loc;
      condLabel.text = gettext(dParse.cond);
    }
};
clockLabel.addEventListener("click", (evt) => {
  console.log("click");
  simple = !simple;
  if(simple)
    {  
      tempLabel.text = "";
      locLabel.text = "";
      condLabel.text = "";
      heightLabel.text = "";
      battLabel2.style.display = "inline";
      battLabel.style.display = "none";
      dateLabel.style.display = "inline";
      clock.granularity = "minutes";
    }
  else
    {
      if (peerSocket.readyState == peerSocket.OPEN) {
              peerSocket.send("UPD")
          }
      battLabel2.style.display = "none";
      battLabel.style.display = "inline";
      dateLabel.style.display = "none";
      clock.granularity = "seconds";
    }
});
battery.addEventListener("change", () => {
  battLabel.text = Math.floor(battery.chargeLevel) + "%"+(charger.connected ? "+" : "")+(charger.powerIsGood ? "+" : "");
  battLabel2.text = Math.floor(battery.chargeLevel) + "%"+(charger.connected ? "+" : "")+(charger.powerIsGood ? "+" : "");
});
peerSocket.onopen = function() {
    if (peerSocket.readyState === peerSocket.OPEN) {
       peerSocket.send("UPD");
    }
}
