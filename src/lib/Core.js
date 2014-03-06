//TODO: make meta-precompiling, creating stub-method for color-spaces

var G = {};

//TODO: fix `c instanceof G.Color`
//TODO: fix setFormat, … setOptionName method
//TODO: drastically optimize to work with ES. It’s outstandingly slow! In ideal is just to have some of basic methods defined preliminary
//TODO: delegate calculations to existing classes in ES
//TODO: think how to get rid of prototype filling on launch and bring these methods to the compiling: _incapsulateOptions, _createAPI and so on.

"use strict";

G.options = {
	CSS_DELIMITER: ""
};

//============================================ Export API
//TODO: get rid of. Move to component.
// CommonJS / Node module
if (typeof module !== 'undefined') {
	namespace = module.exports = G;
}
//AMD
else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
	define(function () {return namespace; });
}
// Browsers and other environments
else {
	// Get the global object. Works in ES3, ES5, and ES5 strict mode.
	namespace = (function () { return this || (1 && eval)('this'); }()); //the same as (1,eval)
}

namespace.G = G;
G.global = namespace;


//========================================================= Utils
//Simple extend func
//TODO: make deep extend, i.e. inner object-properties now are linked, not copied.
G.extend = function (to, from) {
	to = to || {};
	if (!from)
		return to;
	else if (arguments.length > 2)
		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i]) continue;
			G.extend(to,arguments[i])
		}
	else
		for (var name in from) {
			to[name] = from[name];
		};

	return to;
};

G.extend(G, {
	isFunction: function (obj) {
		return typeof obj === 'function';
	},
	isObject: function(obj){
		return obj instanceof Object;
	},
	isArray : Array.isArray || function(obj){
		return obj instanceof Array;
	},
	isArguments : function (obj) {
		return Object.prototype.toString.call(obj) == '[object Arguments]';
	},
	isString: function(obj){
		return typeof obj === "string";
	},
	isNumber: function(obj){
		return typeof obj === "number";
	},
	isValue : function (obj) {
		return G.isNumber(obj) || G.isString(obj);
	},
	isDate : function (obj) {
		//return Object.prototype.toString.call(obj) == '[object Date]';
		return obj instanceof Date;
	},
	isRegExp : function (obj) {
		//return Object.prototype.toString.call(obj) == '[object RegExp]';
		return obj instanceof RegExp;
	},
	isElement : function (obj) {
		return !!(obj && obj.nodeType === 1);
	},
	//ExtendScript thing
	isActionDescriptor: function (obj) {
		try {
			return obj instanceof ActionDescriptor;
		} catch (err) {
			return false;
		}
	},

	//modified _.bind
	ctor : function () {},

	slice : Array.prototype.slice,
	concat : Array.prototype.concat,

	bind : function (func, context) {
		var args, bound;
		if (Function.prototype.bind) return Function.prototype.bind.apply(func, G.slice.call(arguments, 1));
		if (!isFunction(func)) throw new TypeError();
		args = G.slice.call(arguments, 2);
		bound = function () {
			if (!(this instanceof bound)) return func.apply(context, args.concat(G.slice.call(arguments)));
			ctor.prototype = func.prototype;
			var self = new ctor();
			ctor.prototype = null;
			var result = func.apply(self, args.concat(G.slice.call(arguments)));
			if (Object(result) === result) return result;
			return self;
		};
		return bound;
	},

	//✂------------------
	//returns new func, that invokes method `meth` with `param` specified
	_makeProxyMethod : function(meth, param){
		//TODO: some kind of fuckup is happening there. Debug. Frightly→
		if (G.isString(meth)) {
			return function(){
				//TODO: test is `call` without `this` correct   ↓ ↓ ↓
				return this[meth].apply(this, [param].concat(G.slice.call(arguments))); 
			}
		} else if (G.isFunction(meth)) {
			return function(){
				//TODO: test is `call` without `this` correct   ↓ ↓ ↓
				return meth.apply(this, [param].concat(G.slice.call(arguments))); 
			}
		}
	},
	//-------------------


	//Set of utils to be mixed to new classes
	ClassUtils: {
		//✂ ---------------------------------
		//makes getters/setters for options. Supposed to be called on prototype, outside.
		_incapsulateOptions: function (defaults) {
			var self = this, o = self.options;
			for (var optName in defaults) {
				var name = G.capitalize(optName);
				//TODO: when native getter/setter become up, replace it.
				self["set" + name] = G._makeProxyMethod("setOption", optName);
				self["get" + name] = G._makeProxyMethod("getOption", optName);
				self[optName] = G._makeProxyMethod("getSetOption", optName); //potentially interferes with model’s property. So, be vigilent when create new classes to not overlap properties.
			}
			return self;
		},
		//getset options
		getOption: function (name) {
			return this.options && this.options[name];
		},
		getOptions: function () {
			return this.options;
		},
		setOption: function (name, value) {
			if (G.isString(name)) {
				if (this.options) {this.options[name] = value;}
			}
			else if (G.isObject(name)) {
				extend(this.options, name);
			}
			return this;
		},
		setOptions: function () {
			var self = this, o = self.options;
			if (G.isObject(arguments[0])) {
				extend(this.options, arguments[0]);
			} else {
				//TODO: go through arguments, add odd:even as options
			}
			return self;
		},

		//✂----------
		//make set as well as unset option param
		getSetOption: function () {
			var self = this, o = self.options;
			if (arguments.length > 1) {//set
				return this.setOption.apply(this, arguments);
			}
			return this.getOption(arguments[0]); //get
				return self;
			},
		//--------------

		//✂-------------------------------
		//aliases of methods. Called once while prototype has described, then self-destructed.
		_bindAliases: function () {
			var self = this;
			if (self._alias) {				
				var aliasMap = self._alias;
				for (var methName in aliasMap) {
					self[methName] = self[aliasMap[methName]];
				}
				delete self._alias;
			}
			delete self._bindAliases;
			return self;
		}
	},

	//================================= Calculation utils (bring out to the separate file Utils)

	/*
	Standard types of values to parse, store etc.
	*/
	types: {
		'byte': {
			max: 255,
			round: true,
			re: '(\\d{1,3})',
			//def: 0
			//min: 0,
			//mod: undefined,
			//unit: "",
			//sys: 10
		},
		'float': {
			max: 1,
			re: '(\\d+(?:\\.\\d+)?|\\.\\d+)'
		},
		'percent': {
			max: 100,
			unit: '%',
			re: '(\\d+(?:\\.\\d+)?|\\.\\d+)%'
		},
		'degrees': {
			mod: 360,
			unit: '',//'deg',
			round: false,
			re: '(\\d+(?:\\.\\d+)?|\\.\\d+)(?:deg)?'
		},
		'hex': {
			max: 255,
			round: true,
			sys: 16,
			re: "([a-f0-9]{2})"
		},
		'normal': { //almost the same as float except for 0..1 range
			max: 1,
			min: 0,
			round: false
		}
	},

	capitalize: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	trim: function(val) {
		return val.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},

	//Return value between a & b based on leverage.
	mid: function (a,b,leverage) {
		leverage = (leverage === null ? .5 : leverage);
		leverage = self.limit(leverage, 0, 1);
		return a*leverage + b*(1-leverage);
	},

	//Simple max/min limiter
	maxmin: function (value, high, low) {
		return this.minmax(value, low, high);
	},

	minmax: function (value, low, high) {
		return Math.max(Math.min(value, high), low);
	},

	limit: function () {
		return this.minmax.apply(this, arguments)
	},

	//Simple normalization
	normalize: function (value, min, max) {
		min = min || 0,
		max = max || 100;
		return (value - min) / (max - min)
	},

	//2 types of denormalization: propType based and minmax based
	denormalize: function (val, min, max) {
		var max = max || 100,
			min = min || 0;
		return (val * (max - min)) + min;
	},

	//return hex channel
	hex: function (val){
		//val = Number(val);
		return val > 15 ? val.toString(16) : ("0" + val.toString(16));
	},
	//test passed string on possibility of shortening
	shortenHex: function (str) {
		if (str[0] == str[1] && str[2] == str[3] && str[4] == str[5] && str[6] == str[7]) {
			return str[0] + str[2] + str[4] + (str[6] ? str[6] : '');
		}
		return str
	},

	//✂---
	//Measures performance of some function/code
	perf: function (code, times) {
		var self = this, i = 0, start, measures = [];

		times = times || 1;

		for (var n = times; n--;){
			i = 0;
			start = Date.now();
			while ((Date.now() - start) < 1000 && i < 1000000) {
				code();
				i++;
			}
			measures.push(i)
		}

		var sum = 0;
		for (var i = measures.length; i--;){
			sum += measures[i];
		}
		var res = sum/measures.length;

		return console.log("Performance " + (name ? ("of " + name + " ") : "") + "is " + (res >= 1000000 ? "∞" : res) + " op/sec");
	}
	//---
})