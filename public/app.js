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
		memeImageElem,
		MEME_IMAGE_URL,
		MEME_TEXT,
		MEME_TEXT_COMPOSED;

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
				composeMemeText();
			}
		});
	};

	var setMemeText = function() {
		var randomInt = Math.floor(Math.random() * memesTextArrayLen);
		MEME_TEXT = memesTextArray[randomInt];
		memeTextElem.innerText = MEME_TEXT;
	};

	var setMemeImage = function() {
		var randomInt = Math.floor(Math.random() * memesArrayLen);
		MEME_IMAGE_URL = memesArray[randomInt]['url'];
		memeImageElem.setAttribute('src', MEME_IMAGE_URL);
	};

	var composeMemeText = function() {
		MEME_TEXT_COMPOSED = MEME_TEXT + ' ' + MEME_IMAGE_URL;
		socket.emit('tweet button clicked', MEME_TEXT_COMPOSED);
	};

	return {
		init: function() {
			console.log('we init');
			initialize();
		}
	}

}());

App.init();