'use strict';

// Requires and needs
var socket = io();
var d3 = require('d3');
var topojson = require('topojson');

socket.heartbeatTimeout = 20000;

var App = (function() {

	var tweets = [];
	var searchField;

	var initialize = function() {
		drawMap();
		runStream();

	};

	var runStream = function() {
		socket.emit('start streaming')
		socket.on('incoming tweet', placeCoords);
		socket.on('trending hashtags', topWordCounts)
	};

	var placeCoords = function(e) {

		var tweet = e.tweet;
		tweets.push(tweet);

    var svg = d3.select("svg");
    var projection = d3.geoAlbersUsa();
    projection.scale([1300])

    const div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)

		svg.append("circle")
			.data([tweet])
			.attr('cx', function(tweet) {
				var coord = tweet.place.bounding_box.coordinates[0][0];
				return projection(coord)[0] - 5;
			})
			.attr('cy', function(tweet) {
				var coord = tweet.place.bounding_box.coordinates[0][0];
				return projection(coord)[1] + 50;
			})

      .attr("r", "1px")
      .attr("class", "tweet-initial")
      .style("opacity", .8)
      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", .9)
          .style("fill", "yellow");
        div	.html(d.text)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("background", "white")
          .style("color", "#1D2951");
      })
      .on("mouseout", function(d) {
        div.transition()
        .duration(500)
        .style("opacity", 0);
      })
			.transition()
				.duration(500)
				.style("fill", "orange")
				.attr("r", "6px")
			.transition()
				.duration(500)
				.style("fill", "yellow")
				.attr("r", "3px");

  }

	var clearCoords = function(){
    const svg = d3.select("svg");
    svg.selectAll("circle")
    .remove();
		tweets = [];
  }


	var runWaiting = function() {
		waitingScreen.style.visibility = 'visible';
	};

	var stopWaiting = function(didPublish, text) {
		var p = notificationScreen.querySelector('p');
		p.innerText = text;
		waitingScreen.style.visibility = 'hidden';
		notificationScreen.style.visibility = 'visible';
		setTimeout(function() {
			notificationScreen.style.visibility = 'hidden';
		}, 3000);
	};

	var drawMap = function(){
		console.log('draw map?');
		var svg = d3.select("svg");

		var path = d3.geoPath();

		d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
			if (error) throw error;

			svg.append("g")
				.attr("class", "states")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.states).features)
				.enter().append("path")
					.attr("d", path)
					.attr("fill", "rgb(56, 80, 160)")
					.attr("opacity", .8)

			svg.append("path")
					.attr("class", "border")
					.attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
		});
	};

	var topWordCounts = function(e){
		var data = e.trending;
		var spamKeywords = ['job', 'jobs', 'hiring']

		if (Object.keys(data).length > 0 ){
			var items = Object.keys(data).map(function(key) {
				if (!spamKeywords.includes(key.slice(1).toLowerCase())){
					return [key, data[key]];
				}
			});
		items.sort(function(first, second) {
			return second[1] - first[1];
		});

		var objects = items.slice(0,10);
		var tags = ""
		objects.forEach(function(item) {
			tags += "<li>"+item[0] + " : " + item[1] + "</li>";
		});

		document.getElementById("word-counts").innerHTML="<ul class='hashtags'>" + tags + "</ul>";
		}
	};

	var searchTweets = function(e){
		e.preventDefault();
		var searchTerm = e.currentTarget.value;
		return tweets.filter(searchText(searchTerm));
 	};

 	var searchText = function(searchTerm) {
		 	return (tweet) => {
				 return tweet.includes(searchTerm);
		 }
 };


	return {
		init: function() {
			initialize();
		}
	}

}());

App.init();
