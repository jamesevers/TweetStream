'use strict';

// Requires and needs
var socket = io();
var Ajax = require('superagent');
var Soylent = require('./../soylent-faq');
var TwitterCredentials = require('./../twitter-credentials.json');

// The mo' f'in hearbeat
socket.heartbeatTimeout = 20000;

var App = (function() {

	var ajax,
		memesArray,
		memesArrayLen,
		memesTextArray,
		memesTextArrayLen,
		memeTextElem,
		memeImageElem;

	var initialize = function() {
		memeTextElem = document.getElementById('meme-text');
		memeImageElem = document.getElementById('meme-image');
		// Make the Ajax call to get the meme images
		Ajax
		.get('http://api.imgflip.com/get_memes')
		.end(function(err, res) {
			var JSONresponse = JSON.parse(res.text);
			if (JSONresponse) {
				memesArray = JSONresponse.data.memes;
				memesArrayLen = memesArray.length;
				memesTextArray = Soylent.faq;
				memesTextArrayLen = memesTextArray.length;
				console.log(memesTextArray);
				setMemeText();
				setMemeImage();
			}
		});
	};

	var setMemeText = function() {
		var randomInt = Math.floor(Math.random() * memesTextArrayLen);
		memeTextElem.innerText = memesTextArray[randomInt];
	};

	var setMemeImage = function() {
		var randomInt = Math.floor(Math.random() * memesArrayLen);
		memeImageElem.setAttribute('src', memesArray[randomInt]['url']);
	};

	return {
		init: function() {
			console.log('we init');
			initialize();
			socket.emit('tweet button clicked');
		}
	}

}());

App.init();