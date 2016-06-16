(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (process){
(function () {
  'use strict';

  var fs = require('fs'),
      mkdirOrig = fs.mkdir,
      mkdirSyncOrig = fs.mkdirSync,
      osSep = process.platform === 'win32' ? '\\' : '/';
  
  /**
   * Offers functionality similar to mkdir -p
   *
   * Asynchronous operation. No arguments other than a possible exception
   * are given to the completion callback.
   */
  function mkdir_p (path, mode, callback, position) {
    var parts = require('path').normalize(path).split(osSep);

    mode = mode || process.umask();
    position = position || 0;
  
    if (position >= parts.length) {
      return callback();
    }
  
    var directory = parts.slice(0, position + 1).join(osSep) || osSep;
    fs.stat(directory, function(err) {    
      if (err === null) {
        mkdir_p(path, mode, callback, position + 1);
      } else {
        mkdirOrig(directory, mode, function (err) {
          if (err && err.code != 'EEXIST') {
            return callback(err);
          } else {
            mkdir_p(path, mode, callback, position + 1);
          }
        });
      }
    });
  }
  
  function mkdirSync_p(path, mode, position) {
    var parts = require('path').normalize(path).split(osSep);

    mode = mode || process.umask();
    position = position || 0;
  
    if (position >= parts.length) {
      return true;
    }
  
    var directory = parts.slice(0, position + 1).join(osSep) || osSep;
    try {
      fs.statSync(directory);
      mkdirSync_p(path, mode, position + 1);
    } catch (e) {
      try {
        mkdirSyncOrig(directory, mode);
        mkdirSync_p(path, mode, position + 1);
      } catch (e) {
        if (e.code != 'EEXIST') {
          throw e;
        }
        mkdirSync_p(path, mode, position + 1);
      }
    }
  }
  
  /**
   * Polymorphic approach to fs.mkdir()
   *
   * If the third parameter is boolean and true assume that
   * caller wants recursive operation.
   */
  fs.mkdir = function (path, mode, recursive, callback) {
    if (typeof recursive !== 'boolean') {
      callback = recursive;
      recursive = false;
    }
  
    if (typeof callback !== 'function') {
      callback = function () {};
    }
  
    if (!recursive) {
      mkdirOrig(path, mode, callback);
    } else {
      mkdir_p(path, mode, callback);
    }
  }
  
  /**
   * Polymorphic approach to fs.mkdirSync()
   *
   * If the third parameter is boolean and true assume that
   * caller wants recursive operation.
   */
  fs.mkdirSync = function (path, mode, recursive) {
    if (typeof recursive !== 'boolean') {
      recursive = false;
    }
  
    if (!recursive) {
      mkdirSyncOrig(path, mode);
    } else {
      mkdirSync_p(path, mode);
    }
  }

  module.exports = fs;
}());

}).call(this,require('_process'))
},{"_process":3,"fs":1,"path":2}],5:[function(require,module,exports){
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
},{"./../soylent-faq":6,"./../twitter-credentials.json":7,"node-fs":4}],6:[function(require,module,exports){
module.exports = {
	faq: [
		'Soylent is a simple, efficient and affordable drink that possesses what a body needs to be healthy.',
		'Soylent is a new option for maintaining a balanced state of ideal nutrition, just like traditional food.',
		'Soylent’s nutritional makeup includes protein, carbohydrates, fats, fiber, and vitamins and minerals such as potassium, iron and calcium.',
		'It includes all of the elements of a healthy diet, without excess amounts of sugars, saturated fats, or cholesterol.',
		'Soylent is a convenient powder that is mixed with water.',
		'Healthy food can be expensive and takes time to prepare. At around $3/meal, Soylent is affordable.',
		'Soylent is designed as a simple staple food, and people incorporate it into their lives to varying degrees.',
		'Some people use it almost exclusively, while others use it 2-3 times per week.',
		'As a nutritionally complete food source, Soylent should be considered a food product just like any other.',
		'You can include Soylent in your diet for as long as you’d like, in any amount that suits your needs.',
		'There is no right or wrong amount of Soylent to eat - the whole idea is to find a balance that works for you.',
		'The average adult requires 2,000 calories per day, which is equivalent to one pouch of Soylent Powder',
		'Please feel free to consult our nutrition facts for Soylent Powder, and Soylent Drink for more information.',
		'When preparing Soylent Powder, you may adjust the size of each serving to your liking.',
		'You are free to consume your Soylent in whatever amount works for you.',
		'Most people consume fewer than 2000 calories of Soylent daily.  This means that a pouch of Soylent Powder often lasts for two or more days.',
		'At this time Soylent has not been evaluated specifically for weight loss purposes.',
		'Soylent contains plenty of insoluble fiber so bowel movements are more or less unchanged.',
		'Soylent products are currently sold exclusively through Soylent.com and Amazon.com.',
		'Soylent is made using ingredients that you probably already have in your kitchen.',
		'Soylent 2.0 is designed to have a low environmental impact and comes in a recyclable bottle.',
		'A one-year shelf life gives you the freedom to enjoy Soylent 2.0 whenever is convenient.',
		'Soylent™ was developed from a need for a simpler food source.',
		'Soylent is a food product (classified as a food, not a supplement, by the FDA) designed for use as a staple meal by all adults.',
		'The question we hear most often is, “What is Soylent?”.',
		'we recognize that the idea of a nutritionally complete meal-in-a-bottle is still an unfamiliar concept to most of the larger population',
		'Today we are pleased to announce that we have reached a new milestone, a point where we can cut the price of Soylent powder for everyone.',
		'Our goal at Soylent is to engineer nutritionally-complete food products that are optimized for modern consumers’ lifestyles and budgets',
		'Soylent’s nutritional makeup is comprehensive.',
		'The Soylent recipe... is regulated as a food by the Food and Drug Administration (FDA).',
		'Soylent contains ingredients from countries that may include but are not limited to: United States of America, China.'
	]
}
},{}],7:[function(require,module,exports){
module.exports={
	"consumer_key": "vEkziUe02sgpqWjyiHFHqOpQy",
	"consumer_secret": "sTAJbGWKDXueoC5TNu0H8Q63JxF8cvgpKjIUJDWQYKytxvJZzo",
	"access_token": "743262589136805888-y0Ar7ByFu02CGRhXC4fSIQERxjKiPig",
	"access_token_secret": "o4pyv9cU1oJCvsXHP4yPowu9jCtOXDgsDrFGDJkSgc8WL"
}
},{}]},{},[5]);
