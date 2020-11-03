export default  (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var stateStringParser = createCommonjsModule(function (module) {
	module.exports = function (stateString) {
		return stateString.split('.').reduce(function (stateNames, latestNameChunk) {
			stateNames.push(stateNames.length ? stateNames[stateNames.length - 1] + '.' + latestNameChunk : latestNameChunk);

			return stateNames;
		}, []);
	};
});

var stateState = function StateState() {
	var states = {};

	function getHierarchy(name) {
		var names = stateStringParser(name);

		return names.map(function (name) {
			if (!states[name]) {
				throw new Error('State ' + name + ' not found');
			}
			return states[name];
		});
	}

	function getParent(name) {
		var parentName = getParentName(name);

		return parentName && states[parentName];
	}

	function getParentName(name) {
		var names = stateStringParser(name);

		if (names.length > 1) {
			var secondToLast = names.length - 2;

			return names[secondToLast];
		} else {
			return null;
		}
	}

	function guaranteeAllStatesExist(newStateName) {
		var stateNames = stateStringParser(newStateName);
		var statesThatDontExist = stateNames.filter(function (name) {
			return !states[name];
		});

		if (statesThatDontExist.length > 0) {
			throw new Error('State ' + statesThatDontExist[statesThatDontExist.length - 1] + ' does not exist');
		}
	}

	function buildFullStateRoute(stateName) {
		return getHierarchy(stateName).map(function (state) {
			return '/' + (state.route || '');
		}).join('').replace(/\/{2,}/g, '/');
	}

	function applyDefaultChildStates(stateName) {
		var state = states[stateName];

		var defaultChildStateName = state && (typeof state.defaultChild === 'function' ? state.defaultChild() : state.defaultChild);

		if (!defaultChildStateName) {
			return stateName;
		}

		var fullStateName = stateName + '.' + defaultChildStateName;

		return applyDefaultChildStates(fullStateName);
	}

	return {
		add: function add(name, state) {
			states[name] = state;
		},
		get: function get(name) {
			return name && states[name];
		},

		getHierarchy: getHierarchy,
		getParent: getParent,
		getParentName: getParentName,
		guaranteeAllStatesExist: guaranteeAllStatesExist,
		buildFullStateRoute: buildFullStateRoute,
		applyDefaultChildStates: applyDefaultChildStates
	};
};

var extend = function extend() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return Object.assign.apply(Object, [{}].concat(args));
};

var combineArrays = function combineArrays(obj) {
	var keys = Object.keys(obj);

	keys.forEach(function (key) {
		if (!Array.isArray(obj[key])) {
			throw new Error(key + ' is not an array');
		}
	});

	var maxIndex = keys.reduce(function (maxSoFar, key) {
		var len = obj[key].length;
		return maxSoFar > len ? maxSoFar : len;
	}, 0);

	var output = [];

	function getObject(index) {
		var o = {};
		keys.forEach(function (key) {
			o[key] = obj[key][index];
		});
		return o;
	}

	for (var i = 0; i < maxIndex; ++i) {
		output.push(getObject(i));
	}

	return output;
};

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexpWithReversibleKeys = pathToRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
// Match escaped characters that would otherwise appear in future matches.
// This allows the user to escape special characters that won't transform.
'(\\\\.)',
// Match Express-style parameters and un-named parameters with a prefix
// and optional suffixes. Matches appear as:
//
// "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
// "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
'([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
// Match regexp special characters that are always escaped.
'([.+*?=^!:${}()[\\]|\\/])'].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup(group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys(re, keys, allTokens) {
  re.keys = keys;
  re.allTokens = allTokens;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags(options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp(path, keys, allTokens) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        delimiter: null,
        optional: false,
        repeat: false
      });
    }
  }

  return attachKeys(path, keys, allTokens);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp(path, keys, options, allTokens) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options, allTokens).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  return attachKeys(regexp, keys, allTokens);
}

/**
 * Replace the specific tags with regexp strings.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @return {String}
 */
function replacePath(path, keys, allTokens) {
  var index = 0;
  var lastEndIndex = 0;

  function addLastToken(lastToken) {
    if (lastEndIndex === 0 && lastToken[0] !== '/') {
      lastToken = '/' + lastToken;
    }
    allTokens.push({
      string: lastToken
    });
  }

  function replace(match, escaped, prefix, key, capture, group, suffix, escape, offset) {
    if (escaped) {
      return escaped;
    }

    if (escape) {
      return '\\' + escape;
    }

    var repeat = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    if (offset > lastEndIndex) {
      addLastToken(path.substring(lastEndIndex, offset));
    }

    lastEndIndex = offset + match.length;

    var newKey = {
      name: key || index++,
      delimiter: prefix || '/',
      optional: optional,
      repeat: repeat
    };

    keys.push(newKey);
    allTokens.push(newKey);

    prefix = prefix ? '\\' + prefix : '';
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  }

  var newPath = path.replace(PATH_REGEXP, replace);

  if (lastEndIndex < path.length) {
    addLastToken(path.substring(lastEndIndex));
  }

  return newPath;
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp(path, keys, options, allTokens) {
  keys = keys || [];
  allTokens = allTokens || [];

  if (!isarray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options, allTokens);
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options, allTokens);
  }

  var strict = options.strict;
  var end = options.end !== false;
  var route = replacePath(path, keys, allTokens);
  var endsWithSlash = path.charAt(path.length - 1) === '/';

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys, allTokens);
}

var stateComparison_1 = function StateComparison(stateState) {
	var getPathParameters = pathParameters();

	var parametersChanged = function parametersChanged(args) {
		return parametersThatMatterWereChanged(extend(args, { stateState: stateState, getPathParameters: getPathParameters }));
	};

	return function (args) {
		return stateComparison(extend(args, { parametersChanged: parametersChanged }));
	};
};

function pathParameters() {
	var parameters = {};

	return function (path) {
		if (!path) {
			return [];
		}

		if (!parameters[path]) {
			parameters[path] = pathToRegexpWithReversibleKeys(path).keys.map(function (key) {
				return key.name;
			});
		}

		return parameters[path];
	};
}

function parametersThatMatterWereChanged(_ref) {
	var stateState = _ref.stateState,
	    getPathParameters = _ref.getPathParameters,
	    stateName = _ref.stateName,
	    fromParameters = _ref.fromParameters,
	    toParameters = _ref.toParameters;

	var state = stateState.get(stateName);
	var querystringParameters = state.querystringParameters || [];
	var parameters = getPathParameters(state.route).concat(querystringParameters);

	return Array.isArray(parameters) && parameters.some(function (key) {
		return fromParameters[key] !== toParameters[key];
	});
}

function stateComparison(_ref2) {
	var parametersChanged = _ref2.parametersChanged,
	    original = _ref2.original,
	    destination = _ref2.destination;

	var states = combineArrays({
		start: stateStringParser(original.name),
		end: stateStringParser(destination.name)
	});

	return states.map(function (_ref3) {
		var start = _ref3.start,
		    end = _ref3.end;
		return {
			nameBefore: start,
			nameAfter: end,
			stateNameChanged: start !== end,
			stateParametersChanged: start === end && parametersChanged({
				stateName: start,
				fromParameters: original.parameters,
				toParameters: destination.parameters
			})
		};
	});
}

var currentState = function CurrentState() {
	var current = {
		name: '',
		parameters: {}
	};

	return {
		get: function get() {
			return current;
		},
		set: function set(name, parameters) {
			current = {
				name: name,
				parameters: parameters
			};
		}
	};
};

var stateChangeLogic = function stateChangeLogic(stateComparisonResults) {
	var hitChangingState = false;
	var hitDestroyedState = false;

	var output = {
		destroy: [],
		change: [],
		create: []
	};

	stateComparisonResults.forEach(function (state) {
		hitChangingState = hitChangingState || state.stateParametersChanged;
		hitDestroyedState = hitDestroyedState || state.stateNameChanged;

		if (state.nameBefore) {
			if (hitDestroyedState) {
				output.destroy.push(state.nameBefore);
			} else if (hitChangingState) {
				output.change.push(state.nameBefore);
			}
		}

		if (state.nameAfter && hitDestroyedState) {
			output.create.push(state.nameAfter);
		}
	});

	return output;
};

var stateTransitionManager = function stateTransitionManager(emitter) {
	var currentTransitionAttempt = null;
	var nextTransition = null;

	function doneTransitioning() {
		currentTransitionAttempt = null;
		if (nextTransition) {
			beginNextTransitionAttempt();
		}
	}

	var isTransitioning = function isTransitioning() {
		return !!currentTransitionAttempt;
	};

	function beginNextTransitionAttempt() {
		currentTransitionAttempt = nextTransition;
		nextTransition = null;
		currentTransitionAttempt.beginStateChange();
	}

	function cancelCurrentTransition() {
		currentTransitionAttempt.transition.cancelled = true;
		var err = new Error('State transition cancelled by the state transition manager');
		err.wasCancelledBySomeoneElse = true;
		emitter.emit('stateChangeCancelled', err);
	}

	emitter.on('stateChangeAttempt', function (beginStateChange) {
		nextTransition = createStateTransitionAttempt(beginStateChange);

		if (isTransitioning() && currentTransitionAttempt.transition.cancellable) {
			cancelCurrentTransition();
		} else if (!isTransitioning()) {
			beginNextTransitionAttempt();
		}
	});

	emitter.on('stateChangeError', doneTransitioning);
	emitter.on('stateChangeCancelled', doneTransitioning);
	emitter.on('stateChangeEnd', doneTransitioning);

	function createStateTransitionAttempt(_beginStateChange) {
		var transition = {
			cancelled: false,
			cancellable: true
		};
		return {
			transition: transition,
			beginStateChange: function beginStateChange() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				return _beginStateChange.apply(undefined, [transition].concat(args));
			}
		};
	}
};

var defaultRouterOptions = { reverse: false };

// Pulled from https://github.com/joliss/promise-map-series and prettied up a bit

var promiseMapSeries = function sequence(array, iterator) {
	var currentPromise = Promise.resolve();
	return Promise.all(array.map(function (value, i) {
		return currentPromise = currentPromise.then(function () {
			return iterator(value, i, array);
		});
	}));
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var thenDenodeify = function denodeify(fn) {
	return function () {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		return new Promise(function (resolve, reject) {
			args.push(function (err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});

			var res = fn.apply(self, args);

			var isPromise = res && ((typeof res === 'undefined' ? 'undefined' : _typeof(res)) === 'object' || typeof res === 'function') && typeof res.then === 'function';

			if (isPromise) {
				resolve(res);
			}
		});
	};
};

var eventemitter3 = createCommonjsModule(function (module) {
  'use strict';

  var has = Object.prototype.hasOwnProperty,
      prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @api private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {Mixed} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @api private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @api public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @api public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
        events,
        name;

    if (this._eventsCount === 0) return names;

    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Boolean} exists Only check if there are listeners.
   * @returns {Array|Boolean}
   * @api public
   */
  EventEmitter.prototype.listeners = function listeners(event, exists) {
    var evt = prefix ? prefix + event : event,
        available = this._events[evt];

    if (exists) return !!available;
    if (!available) return [];
    if (available.fn) return [available.fn];

    for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
      ee[i] = available[i].fn;
    }

    return ee;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @api public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt],
        len = arguments.length,
        args,
        i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
          j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);break;
          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn The listener function.
   * @param {Mixed} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    var listener = new EE(fn, context || this),
        evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

    return this;
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn The listener function.
   * @param {Mixed} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    var listener = new EE(fn, context || this, true),
        evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

    return this;
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {Mixed} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {String|Symbol} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) {
        if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
      }
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // This function doesn't apply anymore.
  //
  EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    return this;
  };

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
});

'use strict';

var strictUriEncode = function strictUriEncode(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */

var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

'use strict';

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [encode(key, opts), '[', index, ']'].join('') : [encode(key, opts), '[', encode(index, opts), ']=', encode(value, opts)].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [encode(key, opts), '[]=', encode(value, opts)].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [encode(key, opts), '=', encode(value, opts)].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

var extract = function extract(str) {
	return str.split('?')[1] || '';
};

var parse = function parse(str, opts) {
	opts = objectAssign({ arrayFormat: 'none' }, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		formatter(decodeURIComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
};

var stringify = function stringify(obj, opts) {
	var defaults$$1 = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults$$1, opts);

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

var queryString = {
	extract: extract,
	parse: parse,
	stringify: stringify
};

var immutable = extend$3;

var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

function extend$3() {
    var target = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (hasOwnProperty$1.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
}

var hashLocation = function HashLocation(window) {
	var emitter = new eventemitter3();
	var last = '';
	var needToDecode = getNeedToDecode();

	window.addEventListener('hashchange', function () {
		if (last !== emitter.get()) {
			last = emitter.get();
			emitter.emit('hashchange');
		}
	});

	function ifRouteIsDifferent(actualNavigateFunction) {
		return function navigate(newPath) {
			if (newPath !== last) {
				actualNavigateFunction(window, newPath);
			}
		};
	}

	emitter.go = ifRouteIsDifferent(go);
	emitter.replace = ifRouteIsDifferent(replace);
	emitter.get = get$1.bind(null, window, needToDecode);

	return emitter;
};

function replace(window, newPath) {
	window.location.replace(everythingBeforeTheSlash(window.location.href) + '#' + newPath);
}

function everythingBeforeTheSlash(url) {
	var hashIndex = url.indexOf('#');
	return hashIndex === -1 ? url : url.substring(0, hashIndex);
}

function go(window, newPath) {
	window.location.hash = newPath;
}

function get$1(window, needToDecode) {
	var hash = removeHashFromPath(window.location.hash);
	return needToDecode ? decodeURI(hash) : hash;
}

function removeHashFromPath(path) {
	return path && path[0] === '#' ? path.substr(1) : path;
}

function getNeedToDecode() {
	var a = document.createElement('a');
	a.href = '#x x';
	return !/x x/.test(a.hash);
}

var hashBrownRouter = function Router(opts, hashLocation$$1) {
	var emitter = new eventemitter3();
	if (isHashLocation(opts)) {
		hashLocation$$1 = opts;
		opts = null;
	}

	opts = opts || {};

	if (!hashLocation$$1) {
		hashLocation$$1 = hashLocation(window);
	}

	function onNotFound(path, queryStringParameters) {
		emitter.emit('not found', path, queryStringParameters);
	}

	var routes = [];

	var onHashChange = evaluateCurrentPath.bind(null, routes, hashLocation$$1, !!opts.reverse, onNotFound);

	hashLocation$$1.on('hashchange', onHashChange);

	function stop() {
		hashLocation$$1.removeListener('hashchange', onHashChange);
	}

	emitter.add = add.bind(null, routes);
	emitter.stop = stop;
	emitter.evaluateCurrent = evaluateCurrentPathOrGoToDefault.bind(null, routes, hashLocation$$1, !!opts.reverse, onNotFound);
	emitter.replace = hashLocation$$1.replace;
	emitter.go = hashLocation$$1.go;
	emitter.location = hashLocation$$1;

	return emitter;
};

function evaluateCurrentPath(routes, hashLocation$$1, reverse, onNotFound) {
	evaluatePath(routes, stripHashFragment(hashLocation$$1.get()), reverse, onNotFound);
}

function getPathParts(path) {
	var chunks = path.split('?');
	return {
		path: chunks.shift(),
		queryString: queryString.parse(chunks.join(''))
	};
}

function evaluatePath(routes, path, reverse, onNotFound) {
	var pathParts = getPathParts(path);
	path = pathParts.path;
	var queryStringParameters = pathParts.queryString;

	var matchingRoute = find(reverse ? reverseArray(routes) : routes, path);

	if (matchingRoute) {
		var regexResult = matchingRoute.exec(path);
		var routeParameters = makeParametersObjectFromRegexResult(matchingRoute.keys, regexResult);
		var params = immutable(queryStringParameters, routeParameters);
		matchingRoute.fn(params);
	} else {
		onNotFound(path, queryStringParameters);
	}
}

function reverseArray(ary) {
	return ary.slice().reverse();
}

function makeParametersObjectFromRegexResult(keys, regexResult) {
	return keys.reduce(function (memo, urlKey, index) {
		memo[urlKey.name] = regexResult[index + 1];
		return memo;
	}, {});
}

function add(routes, routeString, routeFunction) {
	if (typeof routeFunction !== 'function') {
		throw new Error('The router add function must be passed a callback function');
	}
	var newRoute = pathToRegexpWithReversibleKeys(routeString);
	newRoute.fn = routeFunction;
	routes.push(newRoute);
}

function evaluateCurrentPathOrGoToDefault(routes, hashLocation$$1, reverse, onNotFound, defaultPath) {
	var currentLocation = stripHashFragment(hashLocation$$1.get());
	var canUseCurrentLocation = currentLocation && (currentLocation !== '/' || defaultPath === '/');

	if (canUseCurrentLocation) {
		var routesCopy = routes.slice();
		evaluateCurrentPath(routesCopy, hashLocation$$1, reverse, onNotFound);
	} else {
		hashLocation$$1.go(defaultPath);
	}
}

var urlWithoutHashFragmentRegex = /^([^#]*)(:?#.*)?$/;
function stripHashFragment(url) {
	var match = url.match(urlWithoutHashFragmentRegex);
	return match ? match[1] : '';
}

function isHashLocation(hashLocation$$1) {
	return hashLocation$$1 && hashLocation$$1.go && hashLocation$$1.replace && hashLocation$$1.on;
}

function find(aryOfRegexes, str) {
	for (var i = 0; i < aryOfRegexes.length; ++i) {
		if (str.match(aryOfRegexes[i])) {
			return aryOfRegexes[i];
		}
	}
}

// This file to be replaced with an official implementation maintained by
// the page.js crew if and when that becomes an option


var pathParser = function pathParser(pathString) {
	var parseResults = pathToRegexpWithReversibleKeys(pathString);

	// The only reason I'm returning a new object instead of the results of the pathToRegexp
	// function is so that if the official implementation ends up returning an
	// allTokens-style array via some other mechanism, I may be able to change this file
	// without having to change the rest of the module in index.js
	return {
		regex: parseResults,
		allTokens: parseResults.allTokens
	};
};

var stringifyQuerystring = queryString.stringify;

var pagePathBuilder = function pagePathBuilder(pathStr, parameters) {
	var parsed = typeof pathStr === 'string' ? pathParser(pathStr) : pathStr;
	var allTokens = parsed.allTokens;
	var regex = parsed.regex;

	if (parameters) {
		var path = allTokens.map(function (bit) {
			if (bit.string) {
				return bit.string;
			}

			var defined = typeof parameters[bit.name] !== 'undefined';
			if (!bit.optional && !defined) {
				throw new Error('Must supply argument ' + bit.name + ' for path ' + pathStr);
			}

			return defined ? bit.delimiter + encodeURIComponent(parameters[bit.name]) : '';
		}).join('');

		if (!regex.test(path)) {
			throw new Error('Provided arguments do not match the original arguments');
		}

		return buildPathWithQuerystring(path, parameters, allTokens);
	} else {
		return parsed;
	}
};

function buildPathWithQuerystring(path, parameters, tokenArray) {
	var parametersInQuerystring = getParametersWithoutMatchingToken(parameters, tokenArray);

	if (Object.keys(parametersInQuerystring).length === 0) {
		return path;
	}

	return path + '?' + stringifyQuerystring(parametersInQuerystring);
}

function getParametersWithoutMatchingToken(parameters, tokenArray) {
	var tokenHash = tokenArray.reduce(function (memo, bit) {
		if (!bit.string) {
			memo[bit.name] = bit;
		}
		return memo;
	}, {});

	return Object.keys(parameters).filter(function (param) {
		return !tokenHash[param];
	}).reduce(function (newParameters, param) {
		newParameters[param] = parameters[param];
		return newParameters;
	}, {});
}

var browser = function browser(fn) {
  typeof setImmediate === 'function' ? setImmediate(fn) : setTimeout(fn, 0);
};

var getProperty = function getProperty(name) {
	return function (obj) {
		return obj[name];
	};
};
var reverse = function reverse(ary) {
	return ary.slice().reverse();
};
var isFunction = function isFunction(property) {
	return function (obj) {
		return typeof obj[property] === 'function';
	};
};
var isThenable = function isThenable(object) {
	return object && ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' || typeof object === 'function') && typeof object.then === 'function';
};
var promiseMe = function promiseMe(fn) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return new Promise(function (resolve) {
		return resolve(fn.apply(undefined, args));
	});
};

var expectedPropertiesOfAddState = ['name', 'route', 'defaultChild', 'data', 'template', 'resolve', 'activate', 'querystringParameters', 'defaultQuerystringParameters', 'defaultParameters'];

var abstractStateRouter6_1_0 = function StateProvider(makeRenderer, rootElement) {
	var stateRouterOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var prototypalStateHolder = stateState();
	var lastCompletelyLoadedState = currentState();
	var lastStateStartedActivating = currentState();
	var stateProviderEmitter = new eventemitter3();
	var compareStartAndEndStates = stateComparison_1(prototypalStateHolder);

	var stateNameToArrayofStates = function stateNameToArrayofStates(stateName) {
		return stateStringParser(stateName).map(prototypalStateHolder.get);
	};

	stateTransitionManager(stateProviderEmitter);

	var _extend = extend({
		throwOnError: true,
		pathPrefix: '#'
	}, stateRouterOptions),
	    throwOnError = _extend.throwOnError,
	    pathPrefix = _extend.pathPrefix;

	var router = stateRouterOptions.router || hashBrownRouter(defaultRouterOptions);

	router.on('not found', function (route, parameters) {
		stateProviderEmitter.emit('routeNotFound', route, parameters);
	});

	var destroyDom = null;
	var getDomChild = null;
	var renderDom = null;
	var resetDom = null;

	var activeStateResolveContent = {};
	var activeDomApis = {};
	var activeEmitters = {};

	function handleError(event, err) {
		browser(function () {
			stateProviderEmitter.emit(event, err);
			console.error(event + ' - ' + err.message);
			if (throwOnError) {
				throw err;
			}
		});
	}

	function destroyStateName(stateName) {
		var state = prototypalStateHolder.get(stateName);
		stateProviderEmitter.emit('beforeDestroyState', {
			state: state,
			domApi: activeDomApis[stateName]
		});

		activeEmitters[stateName].emit('destroy');
		activeEmitters[stateName].removeAllListeners();
		delete activeEmitters[stateName];
		delete activeStateResolveContent[stateName];

		return destroyDom(activeDomApis[stateName]).then(function () {
			delete activeDomApis[stateName];
			stateProviderEmitter.emit('afterDestroyState', {
				state: state
			});
		});
	}

	function resetStateName(parameters, stateName) {
		var domApi = activeDomApis[stateName];
		var content = getContentObject(activeStateResolveContent, stateName);
		var state = prototypalStateHolder.get(stateName);

		stateProviderEmitter.emit('beforeResetState', {
			domApi: domApi,
			content: content,
			state: state,
			parameters: parameters
		});

		activeEmitters[stateName].emit('destroy');
		delete activeEmitters[stateName];

		return resetDom({
			domApi: domApi,
			content: content,
			template: state.template,
			parameters: parameters
		}).then(function (newDomApi) {
			if (newDomApi) {
				activeDomApis[stateName] = newDomApi;
			}

			stateProviderEmitter.emit('afterResetState', {
				domApi: activeDomApis[stateName],
				content: content,
				state: state,
				parameters: parameters
			});
		});
	}

	function getChildElementForStateName(stateName) {
		return new Promise(function (resolve) {
			var parent = prototypalStateHolder.getParent(stateName);
			if (parent) {
				var parentDomApi = activeDomApis[parent.name];
				resolve(getDomChild(parentDomApi));
			} else {
				resolve(rootElement);
			}
		});
	}

	function renderStateName(parameters, stateName) {
		return getChildElementForStateName(stateName).then(function (element) {
			var state = prototypalStateHolder.get(stateName);
			var content = getContentObject(activeStateResolveContent, stateName);

			stateProviderEmitter.emit('beforeCreateState', {
				state: state,
				content: content,
				parameters: parameters
			});

			return renderDom({
				template: state.template,
				element: element,
				content: content,
				parameters: parameters
			}).then(function (domApi) {
				activeDomApis[stateName] = domApi;
				stateProviderEmitter.emit('afterCreateState', {
					state: state,
					domApi: domApi,
					content: content,
					parameters: parameters
				});
				return domApi;
			});
		});
	}

	function renderAll(stateNames, parameters) {
		return promiseMapSeries(stateNames, function (stateName) {
			return renderStateName(parameters, stateName);
		});
	}

	function onRouteChange(state, parameters) {
		try {
			var finalDestinationStateName = prototypalStateHolder.applyDefaultChildStates(state.name);

			if (finalDestinationStateName === state.name) {
				emitEventAndAttemptStateChange(finalDestinationStateName, parameters);
			} else {
				// There are default child states that need to be applied

				var theRouteWeNeedToEndUpAt = makePath(finalDestinationStateName, parameters);
				var currentRoute = router.location.get();

				if (theRouteWeNeedToEndUpAt === currentRoute) {
					// the child state has the same route as the current one, just start navigating there
					emitEventAndAttemptStateChange(finalDestinationStateName, parameters);
				} else {
					// change the url to match the full default child state route
					stateProviderEmitter.go(finalDestinationStateName, parameters, { replace: true });
				}
			}
		} catch (err) {
			handleError('stateError', err);
		}
	}

	function addState(state) {
		if (typeof state === 'undefined') {
			throw new Error('Expected \'state\' to be passed in.');
		} else if (typeof state.name === 'undefined') {
			throw new Error('Expected the \'name\' option to be passed in.');
		} else if (typeof state.template === 'undefined') {
			throw new Error('Expected the \'template\' option to be passed in.');
		}
		Object.keys(state).filter(function (key) {
			return expectedPropertiesOfAddState.indexOf(key) === -1;
		}).forEach(function (key) {
			console.warn('Unexpected property passed to addState:', key);
		});

		prototypalStateHolder.add(state.name, state);

		var route = prototypalStateHolder.buildFullStateRoute(state.name);

		router.add(route, function (parameters) {
			return onRouteChange(state, parameters);
		});
	}

	function getStatesToResolve(stateChanges) {
		return stateChanges.change.concat(stateChanges.create).map(prototypalStateHolder.get);
	}

	function emitEventAndAttemptStateChange(newStateName, parameters) {
		stateProviderEmitter.emit('stateChangeAttempt', function stateGo(transition) {
			attemptStateChange(newStateName, parameters, transition);
		});
	}

	function attemptStateChange(newStateName, parameters, transition) {
		function ifNotCancelled(fn) {
			return function () {
				if (transition.cancelled) {
					var err = new Error('The transition to ' + newStateName + ' was cancelled');
					err.wasCancelledBySomeoneElse = true;
					throw err;
				} else {
					return fn.apply(undefined, arguments);
				}
			};
		}

		return promiseMe(prototypalStateHolder.guaranteeAllStatesExist, newStateName).then(function applyDefaultParameters() {
			var state = prototypalStateHolder.get(newStateName);
			var defaultParams = state.defaultParameters || state.defaultQuerystringParameters || {};
			var needToApplyDefaults = Object.keys(defaultParams).some(function missingParameterValue(param) {
				return typeof parameters[param] === 'undefined';
			});

			if (needToApplyDefaults) {
				throw redirector(newStateName, extend(defaultParams, parameters));
			}
			return state;
		}).then(ifNotCancelled(function (state) {
			stateProviderEmitter.emit('stateChangeStart', state, parameters, stateNameToArrayofStates(state.name));
			lastStateStartedActivating.set(state.name, parameters);
		})).then(function getStateChanges() {
			var stateComparisonResults = compareStartAndEndStates({
				original: lastCompletelyLoadedState.get(),
				destination: {
					name: newStateName,
					parameters: parameters
				}
			});
			return stateChangeLogic(stateComparisonResults); // { destroy, change, create }
		}).then(ifNotCancelled(function resolveDestroyAndActivateStates(stateChanges) {
			return resolveStates(getStatesToResolve(stateChanges), extend(parameters)).catch(function onResolveError(e) {
				e.stateChangeError = true;
				throw e;
			}).then(ifNotCancelled(function destroyAndActivate(stateResolveResultsObject) {
				transition.cancellable = false;

				var activateAll = function activateAll() {
					return activateStates(stateChanges.change.concat(stateChanges.create));
				};

				activeStateResolveContent = extend(activeStateResolveContent, stateResolveResultsObject);

				return promiseMapSeries(reverse(stateChanges.destroy), destroyStateName).then(function () {
					return promiseMapSeries(reverse(stateChanges.change), function (stateName) {
						return resetStateName(extend(parameters), stateName);
					});
				}).then(function () {
					return renderAll(stateChanges.create, extend(parameters)).then(activateAll);
				});
			}));

			function activateStates(stateNames) {
				return stateNames.map(prototypalStateHolder.get).forEach(function (state) {
					var emitter = new eventemitter3();
					var context = Object.create(emitter);
					context.domApi = activeDomApis[state.name];
					context.data = state.data;
					context.parameters = parameters;
					context.content = getContentObject(activeStateResolveContent, state.name);
					activeEmitters[state.name] = emitter;

					try {
						state.activate && state.activate(context);
					} catch (e) {
						browser(function () {
							throw e;
						});
					}
				});
			}
		})).then(function stateChangeComplete() {
			lastCompletelyLoadedState.set(newStateName, parameters);
			try {
				stateProviderEmitter.emit('stateChangeEnd', prototypalStateHolder.get(newStateName), parameters, stateNameToArrayofStates(newStateName));
			} catch (e) {
				handleError('stateError', e);
			}
		}).catch(ifNotCancelled(function handleStateChangeError(err) {
			if (err && err.redirectTo) {
				stateProviderEmitter.emit('stateChangeCancelled', err);
				return stateProviderEmitter.go(err.redirectTo.name, err.redirectTo.params, { replace: true });
			} else if (err) {
				handleError('stateChangeError', err);
			}
		})).catch(function handleCancellation(err) {
			if (err && err.wasCancelledBySomeoneElse) {
				// we don't care, the state transition manager has already emitted the stateChangeCancelled for us
			} else {
				throw new Error('This probably shouldn\'t happen, maybe file an issue or something ' + err);
			}
		});
	}

	function makePath(stateName, parameters, options) {
		function getGuaranteedPreviousState() {
			if (!lastStateStartedActivating.get().name) {
				throw new Error('makePath required a previous state to exist, and none was found');
			}
			return lastStateStartedActivating.get();
		}
		if (options && options.inherit) {
			parameters = extend(getGuaranteedPreviousState().parameters, parameters);
		}

		var destinationStateName = stateName === null ? getGuaranteedPreviousState().name : stateName;

		var destinationState = prototypalStateHolder.get(destinationStateName) || {};
		var defaultParams = destinationState.defaultParameters || destinationState.defaultQuerystringParameters;

		parameters = extend(defaultParams, parameters);

		prototypalStateHolder.guaranteeAllStatesExist(destinationStateName);
		var route = prototypalStateHolder.buildFullStateRoute(destinationStateName);
		return pagePathBuilder(route, parameters || {});
	}

	var defaultOptions = {
		replace: false
	};

	stateProviderEmitter.addState = addState;
	stateProviderEmitter.go = function (newStateName, parameters, options) {
		options = extend(defaultOptions, options);
		var goFunction = options.replace ? router.replace : router.go;

		return promiseMe(makePath, newStateName, parameters, options).then(goFunction, function (err) {
			return handleError('stateChangeError', err);
		});
	};
	stateProviderEmitter.evaluateCurrentRoute = function (defaultState, defaultParams) {
		return promiseMe(makePath, defaultState, defaultParams).then(function (defaultPath) {
			router.evaluateCurrent(defaultPath);
		}).catch(function (err) {
			return handleError('stateError', err);
		});
	};
	stateProviderEmitter.makePath = function (stateName, parameters, options) {
		return pathPrefix + makePath(stateName, parameters, options);
	};
	stateProviderEmitter.getActiveState = function () {
		return lastCompletelyLoadedState.get();
	};
	stateProviderEmitter.stateIsActive = function (stateName) {
		var parameters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		var currentState$$1 = lastCompletelyLoadedState.get();
		var stateNameMatches = currentState$$1.name === stateName || currentState$$1.name.indexOf(stateName + '.') === 0;
		var parametersWereNotPassedIn = !parameters;

		return stateNameMatches && (parametersWereNotPassedIn || Object.keys(parameters).every(function (key) {
			return parameters[key] === currentState$$1.parameters[key];
		}));
	};

	var renderer = makeRenderer(stateProviderEmitter);

	destroyDom = thenDenodeify(renderer.destroy);
	getDomChild = thenDenodeify(renderer.getChildElement);
	renderDom = thenDenodeify(renderer.render);
	resetDom = thenDenodeify(renderer.reset);

	return stateProviderEmitter;
};

function getContentObject(stateResolveResultsObject, stateName) {
	var allPossibleResolvedStateNames = stateStringParser(stateName);

	return allPossibleResolvedStateNames.filter(function (stateName) {
		return stateResolveResultsObject[stateName];
	}).reduce(function (obj, stateName) {
		return extend(obj, stateResolveResultsObject[stateName]);
	}, {});
}

function redirector(newStateName, parameters) {
	return {
		redirectTo: {
			name: newStateName,
			params: parameters
		}
	};
}

// { [stateName]: resolveResult }
function resolveStates(states, parameters) {
	var statesWithResolveFunctions = states.filter(isFunction('resolve'));
	var stateNamesWithResolveFunctions = statesWithResolveFunctions.map(getProperty('name'));

	var resolves = Promise.all(statesWithResolveFunctions.map(function (state) {
		return new Promise(function (resolve, reject) {
			var resolveCb = function resolveCb(err, content) {
				return err ? reject(err) : resolve(content);
			};

			resolveCb.redirect = function (newStateName, parameters) {
				reject(redirector(newStateName, parameters));
			};

			var res = state.resolve(state.data, parameters, resolveCb);
			if (isThenable(res)) {
				resolve(res);
			}
		});
	}));

	return resolves.then(function (resolveResults) {
		return combineArrays({
			stateName: stateNamesWithResolveFunctions,
			resolveResult: resolveResults
		}).reduce(function (obj, result) {
			obj[result.stateName] = result.resolveResult;
			return obj;
		}, {});
	});
}

return abstractStateRouter6_1_0;

}());
//# sourceMappingURL=bundle.js.map
