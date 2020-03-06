'use strict';
let {CEC, CECMonitor} = require('./node_modules/@senzil/cec-monitor/index.js');

//All config options are optionals
//the values are the deafults
let monitor = new CECMonitor('custom-osdname', {
  com_port: 'RPI',            //set com port to use (see cec-client -l)
  debug: false,           // enable/disabled debug events from cec-client
  hdmiport: 1,            // set inital hdmi port
  processManaged: false,  // set/unset handlers to avoid unclear process exit.
  recorder: true,         //enable cec-client as recorder device
  player: false,          //enable cec-client as player device
  tuner: false,           //enable cec-client as tuner device
  audio: false,           //enable cec-client as audio system device
  autorestart: true,      //enable autrestart cec-client to avoid some wierd conditions
  no_serial: {            //controls if the monitor restart cec-client when that stop after the usb was unplugged
    reconnect: false,       //enable reconnection attempts when usb is unplugged
    wait_time: 30,          //in seconds - time to do the attempt
    trigger_stop: false     //false to avoid trigger stop event
  },
  cache: {
    enable: true,  //treats the state like a cache, and enable _EXPIREDCACHE event.
    autorefresh: true, //enable the cache refresh (currently only power status), and enable _UPDATEDCACHE event.
    timeout: 30  //value greater than 0 (in seconds) enable cache invalidation timeout and request new values if autorefresh is enabled
  },
  command_timeout: 3,       //An value greater than 0 (in secconds) meaning the timeout time for SendCommand function
  user_control_hold_interval: 1000 //An value greater than 0 (in miliseconds) meaning the interval for emit the special _USERCONTROLHOLD event
});


monitor.once(CECMonitor.EVENTS._READY, function() {
  console.log( ' -- READY -- ' );
  // Low-level
  monitor.WriteMessage(CEC.LogicalAddress.BROADCAST, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
  // High-level
  monitor.SendMessage(null,null,CEC.Opcode.SET_OSD_NAME,'Plex'); // Broadcast my OSD Name
  monitor.SendMessage(null, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_OSD_NAME); // Ask TV for OSD Name
});

monitor.on(CECMonitor.EVENTS.REPORT_POWER_STATUS, function (packet) {
  console.log('POWER STATUS CODE:',packet.data.val);
  console.log('POWER STATUS:',packet.data.str);
});

monitor.on(CECMonitor.EVENTS.ROUTING_CHANGE, function(packet) {
  console.log( 'Routing changed from ' + packet.data.from.str + ' to ' + packet.data.to.str + '.' );
});

monitor.on(CECMonitor.EVENTS.SET_OSD_NAME, function(packet) {
  console.log( 'Logical address ' + packet.source + 'has OSD name ' + packet.data.str);
});

// Any packet with an opcode (excludes debug, notify and other message types from cec-client
monitor.on(CECMonitor.EVENTS._OPCODE, function(packet) {
  console.log(packet);
});


const chromecast = require('./modules/chromecast.js');

const express = require('express');
const app = express();

// keep a list of all the connected chromecast devices
const devices = [];

var deviceTemp = null;

app.get('/api/status', (req, res) => {
	res.json(devices);
});

app.get('/api/refresh', (req, res) => {
	res.json(devices);
});

app.get('/', (req, res) => {
	for (let i = 0; i < deviceTemp.messages.length; i += 1) {
		let message = deviceTemp.messages[i];
		console.log(message.data.status);
	}
	res.json({"status":"OK"});
});

app.listen(80, () => console.log('starting chromecast manager...'))

chromecast.refresh();

chromecast.on('connected', function (device) {
	deviceTemp = device;
	console.log(`connected [${device.friendlyName}]`);
});

chromecast.on('added', function (device) {
	console.log(`added [${device.friendlyName}]`);
});

chromecast.on('removed', function (device) {
	console.log(`removed [${device.friendlyName}]`);
});

chromecast.on('status', function (device) {
	console.log(`status [${device.friendlyName}]`, device.lastStatus);
});

process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
});
