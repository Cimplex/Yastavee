const util = require('util');
const nodecastor = require('nodecastor');

const CCDevice = require('./chromecast-device.js');

const __callbacks = {};
const devices = {};

function invoke(events, arg) {
	if (__callbacks[events] && __callbacks[events].length && __callbacks[events].length > 0) {
		for (let i = 0; i < __callbacks[events].length; i += 1) {
			__callbacks[events][i](arg);
		}
	}
}

const scanner = nodecastor.scan();

scanner.on('online', device => {
	let ccDev = new CCDevice(device);

	ccDev.on("status", function (device, status) { console.log("Status", ccDev.name, status); });
	ccDev.on("connect", function (device) { console.log("Connected to", ccDev.name); });

	//ccDev.on("message", function (device, event) { console.log("==> MESSAGE:", event.data.status); });
});

scanner.on('offline', device => {
	invoke("removed", device);
});

const chromecast = {
	on: function(events, callback) {
		if (typeof(callback) !== 'function')
			throw error("'callback' has to be function");
		if (!__callbacks[events]) { __callbacks[events] = []; }
		__callbacks[events].push(callback);
	},
	refresh: function() {
		scanner.start();
	},
};


module.exports = chromecast;
