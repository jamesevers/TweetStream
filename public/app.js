'use strict';

// Requires and needs
var socket = io();
var Soylent = require('./../soylent-faq');
var TwitterCredentials = require('./../twitter-credentials.json');
var fs = require('node-fs');

// The mo' f'in hearbeat
socket.heartbeatTimeout = 20000;

var App = (function() {

	var ajax,
		imgPath = 'public/stock_screaming/',
		memesArrayLen = 42,
		memesTextArray,
		memesTextArrayLen,
		memeTextElem,
		memeImageElem,
		MEME_IMAGE_PATH,
		MEME_TEXT,
		MEME_TEXT_COMPOSED;

	var initialize = function() {
		memeTextElem = document.getElementById('meme-text');
		memeImageElem = document.getElementById('meme-image');
		memesTextArray = Soylent.faq;
		memesTextArrayLen = memesTextArray.length;
		setMemeText();
		setMemeImage();
		composeMemeText();
	};

	var setMemeText = function() {
		var randomInt = Math.floor(Math.random() * memesTextArrayLen);
		MEME_TEXT = memesTextArray[randomInt];
		memeTextElem.innerText = MEME_TEXT;
	};

	var setMemeImage = function() {
		var randomInt = Math.floor(Math.random() * memesArrayLen);
		MEME_IMAGE_PATH = imgPath + randomInt + '.jpg';
		memeImageElem.setAttribute('src', MEME_IMAGE_PATH);
	};

	var composeMemeText = function() {
		console.log('we composing');
		socket.emit('tweet button clicked', {
			image_path: MEME_IMAGE_PATH,
			meme_text: MEME_TEXT
		});
	};

	return {
		init: function() {
			console.log('we init');
			initialize();
		}
	}

}());

App.init();