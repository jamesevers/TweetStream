var jetpack = require('fs-jetpack');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Twit = require('twit');

var TwitterFantasyBot = (function() {

	var Tweet,
		consumerKey,
		consumerSecret,
		accessToken,
		accessTokenSecret,
		tweetSentence = '';

	var setupPorts = function() {
		app.set('port', (process.env.PORT || 5000));
		app.use(express.static(__dirname + '/'));
	};

	var storeCredentials = function() {
		var jsonFile = jetpack.read('twitter-credentials.json', 'json');
		consumerKey = jsonFile["consumer_key"];
		consumerSecret = jsonFile["consumer_secret"];
		accessToken = jsonFile["access_token"];
		accessTokenSecret = jsonFile["access_token_secret"];
	};

	var createTwitterConnection = function() {
		Tweet = new Twit({
			consumer_key: consumerKey,
			consumer_secret: consumerSecret,
			access_token: accessToken,
			access_token_secret: accessTokenSecret
		});
	};

	var listenToPort = function() {
		http.listen(app.get('port'), function() {
			console.log("Node app is running at localhost:" + app.get('port'));
		});
	};

	var setupListener = function() {
		app.get('/', function(req, res) {
			res.sendfile('public/index.html');
		});
	};

	var constructTweet = function() {
		tweetSentence = 'Hello World!';
	};

	var postTweet = function() {
		Tweet.post('statuses/update', { status: tweetSentence}, function(err, reply) {
			console.log("error: " + err);
			console.log("reply: " + reply);
		});
	};

	var onIO = function() {
		io.on('connection', function(socket) {
			console.log('hello world');
			socket.on('tweet button clicked', function() {
				constructTweet();
				try {
					postTweet();
				}
				catch (e) {
					console.log(e);
				}
				console.log(tweetSentence);
				io.emit('new tweet', {
					tweet: tweetSentence
				})
			});
		});
	};

	return {
		init: function() {
			setupPorts();
			storeCredentials();
			createTwitterConnection();
			listenToPort();
			setupListener();
			onIO();
		}
	}

}());

TwitterFantasyBot.init();