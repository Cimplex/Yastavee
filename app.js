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
