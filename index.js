var jetpack = require('fs-jetpack');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Twitter = require('twitter');
var fs = require('node-fs');

var TwitterStream = (function() {

	var Tweet,
		consumerKey,
		consumerSecret,
		accessToken,
		accessTokenSecret,
		tweets = [],
		trending = {}

	var setupPorts = function() {
		app.set('port', (process.env.PORT || 5000));
		app.use(express.static(__dirname + '/'));
	};

	var storeCredentials = function() {
		var jsonFile = jetpack.read('twitter-credentials.json', 'json');
		consumerKey = jsonFile["consumer_key"];
		consumerSecret = jsonFile["consumer_secret"];
		accessToken = jsonFile["access_token_key"];
		accessTokenSecret = jsonFile["access_token_secret"];
	};

	var createTwitterConnection = function() {
		client = new Twitter({
			consumer_key: consumerKey,
			consumer_secret: consumerSecret,
			access_token_key: accessToken,
			access_token_secret: accessTokenSecret
		});
	};

	var listenToPort = function() {
		http.listen(app.get('port'), function() {
			console.log("Node app is a'runnin at localhost:" + app.get('port'));
		});
	};

	var setupListener = function() {
		app.get('/', function(req, res) {
			res.sendfile('public/index.html');
		});
	};

	var parseTweet = function(text) {

    var hashTags = text.match(/#[a-z]+/gi);
    if (hashTags !== null){
      hashTags.forEach( function(word) {
        if (trending.hasOwnProperty(word)) {
          trending[word] += 1;
        } else {
          trending[word] = 1;
        }
      });
    }
 	};


	var streamTweets = function() {

		client.stream('statuses/sample',  function(stream) {
			stream.on('data', function(tweet) {
				if (tweet.place){
					if (tweet.place.country_code === 'US'){
						var tweetText = tweet.text;
						tweets.push(tweetText);
						parseTweet(tweetText)
						if (tweets.length > 200){
							io.emit('clear coordinates')
						}
						io.emit('incoming tweet', {
							tweet: tweet,
						});
						io.emit('trending hashtags', {
							trending: trending,
						});
					}
				}
			});
			stream.on('error', function(error) {
				console.log(error);
			});
		});
	};


	var onIO = function() {
		console.log('socket io');
		io.on('connection', function(socket) {
			socket.on('start streaming', function(data) {
				try {
					streamTweets();
				}
				catch (e) {
					console.log(e);
				}
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

TwitterStream.init();
