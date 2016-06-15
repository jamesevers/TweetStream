'use strict';

var socket = io();
var Ajax = require('superagent');
socket.heartbeatTimeout = 20000;

var App = (function() {

	var ajax;

	var initialize = function() {
		Ajax
		.get('http://api.imgflip.com/get_memes')
		.end(function(err, res) {
			console.log('what the fuck', err, res);
		});
	};

	return {
		init: function() {
			console.log('we init');
			initialize();
			//socket.emit('tweet button clicked');
		}
	}

}());

App.init();