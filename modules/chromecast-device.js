

let parseStatus = function (applications) {
	let status = {
		"currentApp": 'unknown',
		"isIdle": false,
		"text": 'unknown'
	}
	for (let i = 0; i < applications.length; i += 1) {
		let app = applications[i];
		if (app.displayName) {
			status.currentApp = app.displayName;
			status.isIdle = app.isIdleScreen;
			status.text = app.statusText;
			break;
		}
	}
	return status;
}

function ChromecastDevice(device) {
	this.__device = device;

	this.nameReady = false;
	this.name = device.friendlyName;

	/* create our event handler and invoker */
	let __events = {};
	this.on = function(event, callback) {
		if (typeof(callback) !== 'function') throw "callback needs to be a function";
		if (!__events[event]) { __events[event] = []; }
		__events[event].push(callback);
	}

	let invoke = function(event, args) {
		if (__events[event]) {
			for (let i = 0; i < __events[event].length; i += 1) {
				__events[event][i](this, args);
			}
		}
	}

	device.on('connect', () => {
		invoke('connect');

		device.status((_, event) => {
			device.status = parseStatus(event.applications);
			invoke('status', device.status);

			device.on('message', (message) => {
				invoke('message', message);
				if (message && message.data && message.data.status && message.data.status.applications &&
					message.data.type === "RECEIVER_STATUS") {
					device.status = parseStatus(message.data.status.applications);
					invoke('status', device.status);
				}
			});
		});
	});
}

module.exports = ChromecastDevice;
