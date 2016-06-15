'use strict';

var socket = io();
socket.heartbeatTimeout = 20000;

var App = (function() {

	return {
		init: function() {
			console.log('we init');
			//socket.emit('tweet button clicked');
		}
	}

}());

App.init();