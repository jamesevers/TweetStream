var jetpack = require('fs-jetpack');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Twit = require('twit');
var fs = require('node-fs');

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

	var postTweet = function(data) {
		var STORED_DATA = data;
		var b64content = fs.readFileSync(STORED_DATA.image_path, { encoding: 'base64' });
		Tweet.post('media/upload', { media_data: b64content }, function (err, data, response) {
			if (!err) {
				// now we can assign alt text to the media, for use by screen readers and
				// other text-based presentations and interpreters
				var mediaIdStr = data.media_id_string
				var altText = "Alt Text Hello World"
				var meta_params = { status: STORED_DATA.meme_text, media_id: mediaIdStr, alt_text: { text: altText } }

				Tweet.post('media/metadata/create', meta_params, function (err, data, response) {
					if (!err) {
						// now we can reference the media and post a tweet (media will attach to the tweet)
						var params = { status: STORED_DATA.meme_text, media_ids: [mediaIdStr] }
						Tweet.post('statuses/update', params, function (err, data, response) {
							console.log(data)
						});
					}
					else {
						console.log('fail at second media/metadata/create', err);
					}
				});
			}
			else {
				console.log('fail at first media/upload', err);
			}
		})
	};

	var onIO = function() {
		io.on('connection', function(socket) {
			socket.on('tweet button clicked', function(data) {
				try {
					postTweet(data);
				}
				catch (e) {
					console.log(e);
				}
				io.emit('new tweet', {
					tweet: tweetSentence
				});
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