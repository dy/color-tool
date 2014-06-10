//→
//xtags prefix detector
var win = window, doc = document, root = doc.documentElement;

var prefix = (function () {
	var styles = win.getComputedStyle(root, ''),
		pre = (Array.prototype.slice
			.call(styles)
			.join('')
			.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
		)[1];
	return {
		dom: pre == 'ms' ? 'MS' : pre,
		css: '-' + pre + '-',
		lowercase: pre,
		js: pre == 'ms' ? pre : capfirst(pre)
	};
})();

var MO = win.MutationObserver || win[prefix.js + 'MutationObserver'];

var matchSelector = Element.prototype.matchesSelector || Element.prototype[prefix.lowercase + 'MatchesSelector'];

//jquery guarant
var $ = (typeof $ !== "undefined" && $) || (typeof jQuery !== "undefined" && jQuery) || undefined;

//custom elements
var register = doc.registerElement || doc.register;

var DOMAttributes = {
	'class': true,
	'id': true,
	'style': true,
	'name': true,
	'type': true,
	'src': true,
	'link': true,
	'href': true,
	'disabled': true
};

var keyDict = {
	//kbd keys
	"ENTER": 13,
	"ESCAPE": 27,
	"TAB": 9,
	"ALT": 18,
	"CTRL": 17,
	"SHIFT": 16,
	"SPACE": 32,
	"PAGE_UP": 33,
	"PAGE_DOWN": 34,
	"END": 35,
	"HOME": 36,
	"LEFT": 37,
	"UP": 38,
	"RIGHT": 39,
	"DOWN": 40,

	//mouse keys
	"LEFT_MOUSE": 1,
	"RIGHT_MOUSE": 3,
	"MIDDLE_MOUSE": 2
}

//----------------Utils
//TODO: it shouldnt clone
function extend(a){
	var l = arguments.length;

	for (var i = 1; i<l; i++){
		var b = arguments[i];
		if (isObject(a) && isObject(b)) {
			for (var k in b){
				if (b.hasOwnProperty(k)){
					a[k] = b[k]
				}
			}
		} else if (b !== undefined){
			a = b;
		}
	}

	return a;
}

function deepExtend(a){
	var l = arguments.length;
	if (!isObject(a)) a = {};

	for (var i = 1; i<l; i++){
		var b = arguments[i], clone;

		if (!isObject(b)) continue;

		for (var key in b) {
			if (!b.hasOwnProperty(key)) continue;

			var src = a[key];
			var val = b[key];

			if (!isObject(val)) {
				a[key] = val;
				continue;
			}

			if (isObject(src)) {
				clone = (!Array.isArray(src)) ? src : {};
			} else if (Array.isArray(val)) {
				clone = (Array.isArray(src)) ? src : [];
			} else {
				clone = (Array.isArray(val)) ? [] : {};
			}

			a[key] = deepExtend(clone, val);
		}
	}

	return a;
}

//sinple clone of any value passed (mod instance init)
function clone(a){
	if (a instanceof Array) {
		return a.slice();
	}
	if (isObject(a)){
		return deepExtend({}, a);
	}
	return a;
}

function isObject(a){
	return (a && a !== null && typeof a === "object" && !(a instanceof Array ) && !(a.nodeType))
}

function isFn(a){
	return !!(a && a.apply);
}

//compares 2 values properly: arrays, objects
//TODO: simplify
function isEqual(a, b){
	if (a === b) return true;

	if (a instanceof Array && b instanceof Array){
		var eq = false;
		if (a.length !== b.length) return false;

		for (var i = 0; i < a.length; i++){
			if (!isEqual(a[i], b[i])) {
				return false;
			}
		}

		return true;
	} else if (isObject(a) && isObject(b)){
		for (var key in a){
			if (!isEqual(a[key], b[key])) return false;
		}
		for (var key in b){
			if (!isEqual(a[key], b[key])) return false;
		}

		return true;
	}

	return false;
}

//split every comma-separated element
var _commaSplitRe = /\s*,\s*/;

//match every comma-separated element ignoring 1-level parenthesis, like `1,2(3,4),5`
// var _commaMatchRe = /([^,]*?(?:\([^()]+\))?)(?=,)|,([^,]*?(?:\([^()]+\))?)(?=$)/g
var _commaMatchRe = /(,[^,]*?(?:\([^()]+\)[^,]*)?)(?=,|$)/g

//iterate over every item in string
function each(str, fn){
	var list = ("," + str).match(_commaMatchRe) || [''];
	for (var i = 0; i < list.length; i++) {
		// console.log(matchStr)
		var matchStr = list[i].trim();
		if (matchStr[0] === ",") matchStr = matchStr.slice(1);
		matchStr = matchStr.trim();
		fn(matchStr, i);
	}
}


//returns unique selector for an element
//from https://github.com/rishihahs/domtalk/blob/master/index.js
function selector(element) {
	// Top level elements are body and ones with an id
	if (element === root) {
		return ':root';
	} else if (element.tagName && upper(element.tagName) === 'BODY') {
		return 'body';
	} else if (element.id) {
		return '#' + element.id;
	}

	var parent = element.parentNode;
	var parentLoc = selector(parent);

	// See which index we are in parent. Array#indexOf could also be used here
	var children = parent.childNodes;
	var index = 0;
	for (var i = 0; i < children.length; i++) {
		// nodeType is 1 if ELEMENT_NODE
		if (children[i].nodeType === 1) {
			if (children[i] === element) {
				break;
			}

			index++;
		}
	}

	return parentLoc + ' *:nth-child(' + (index + 1) + ')';
}


//return absolute offsets
function offsets(el){
	if (!el) throw Error("Bad offsets target", el);
	try{
		var rect = el.getBoundingClientRect()
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset,
			width: el.offsetWidth,
			height: el.offsetHeight,
			bottom: rect.top + win.pageYOffset + el.offsetHeight,
			right: rect.left + win.pageXOffset + el.offsetWidth,
			fromRight: win.innerWidth - rect.right,
			fromBottom: (win.innerHeight + win.pageYOffset - rect.bottom)
		}
	} catch(e){
		return {
			top: el.clientTop + win.pageYOffset,
			left: el.clientLeft + win.pageXOffset,
			width: el.offsetWidth,
			height: el.offsetHeight,
			bottom: el.clientTop + win.pageYOffset + el.offsetHeight,
			right: el.clientLeft + win.pageXOffset + el.offsetWidth,
			fromRight: win.innerWidth - el.clientLeft - el.offsetWidth,
			fromBottom: (win.innerHeight + win.pageYOffset - el.clientTop - el.offsetHeight)
		}
	}

}
//return paddings
function paddings($el){
	var style = getComputedStyle($el);

	return {
		top: parseCssValue(style.paddingTop),
		left: parseCssValue(style.paddingLeft),
		bottom: parseCssValue(style.paddingBottom),
		right: parseCssValue(style.paddingRight)
	}
}
//return margins
function margins($el){
	var style = getComputedStyle($el);

	return {
		top: parseCssValue(style.marginTop),
		left: parseCssValue(style.marginLeft),
		bottom: parseCssValue(style.marginBottom),
		right: parseCssValue(style.marginRight)
	}
}
//returns parsed css value
function parseCssValue(str){
	return ~~str.slice(0,-2);
}

//disable any select possibilities for an element
function disableSelection($el){
	css($el, {
		"user-select": "none",
		"user-drag": "none",
		"touch-callout": "none"
	})
	$el.setAttribute("unselectable", "on")
	on($el, 'selectstart', preventDefault)
}
function enableSelection($el){
	css($el, {
		"user-select": null,
		"user-drag": null,
		"touch-callout": null
	})
	$el.removeAttribute("unselectable")
	off($el, 'selectstart', preventDefault)
}


//set of properties to add prefix
var prefixedProps = {
	"user-drag": true,
	"user-select": true,
	"touch-callout": true,
	"transform": true
}
//simple css styler
function css($el, style, value){
	if (value !== undefined) {
		//one property
		if (prefixedProps[style]) style = prefix.css + style;
		$el.style[style] = value;
	} else {
		//obj passed
		var initialDisplay = $el.style.display;
		$el.style.display = "none";
		for (var prop in style){
			if (prefixedProps[prop]) $el.style[prefix.css + prop] = style[prop];
			else $el.style[prop] = style[prop] || "";
		}
		$el.style.display = initialDisplay;
	}
}



//Binds event declaration
//method reference could be passed
var _modifierParamsRe = /\(([^)]*)\)/;
function on($el, evtRefs, fn){
	var methName;

	if (!fn) return false;

	//create method caller for stringy method reference
	if (typeof fn === "string") {
		methName = fn;

		if (!$el.__methodReferenceCallbacks) $el.__methodReferenceCallbacks = {};

		fn = (function($el, fn){
			return function(){
				// console.log(fn)
				if ($el[fn]) return $el[fn].apply($el, arguments)
				else return false;
			}
		})($el, methName);
	}

	each(evtRefs, function(evtRef){
		var evtObj = _parseEvtRef($el, evtRef), targetFn = fn;
		// console.log(evtRef, evtObj)

		//ignore bound method reference
		if (methName && $el.__methodReferenceCallbacks[evtRef + methName]) return;

		evtObj.modifiers.forEach(function(modifier){
			if (/^onc?e/.test(modifier)){
				targetFn = evtModifiers.one(evtObj.evt, targetFn)
			} else if (/^delegate/.test(modifier)){
				//parse params
				var selector = modifier.match(_modifierParamsRe)[1]
				targetFn = evtModifiers.delegate(evtObj.evt, targetFn, selector)
			} else if (/^pass/.test(modifier)){
				var keys = modifier.match(_modifierParamsRe)[1].split(_commaSplitRe).map(upper);
				targetFn = evtModifiers.pass(evtObj.evt, targetFn, keys);
				// console.log("bind", targetFn)
			} else {
				//recognize modifiers as a part of event
				evtObj.evt += ":" + modifier
			}
		})

		//save property event target to bind in a deferred way
		// console.log("on", evtObj)
		if (evtObj.src[0] === "@"){
			var targetEl = $el[evtObj.src.slice(1)];
			// console.log("not existing property event reference", evtObj)
			if (!targetEl) {
				return false;
			} else evtObj.src = targetEl;

			//save evt target to unbind
			targetFn._evtTarget = targetEl;
			// throw Error("Bad event target " + evtRef);
		}

		//bind target fn
		if ($){
			//delegate to jquery
			$(evtObj.src).on(evtObj.evt, targetFn);
		} else {
			//listen element
			evtObj.src.addEventListener(evtObj.evt, targetFn)
		}

		//save method reference
		if (methName) {
			$el.__methodReferenceCallbacks[evtRef + methName] = targetFn;
			// console.log("save ref", evtRef + methName)
		}
	})

	return fn;
}

function off($el, evtRefs, fn){
	if (!fn) return false;

	each(evtRefs, function(evtRef){
		var evtObj = _parseEvtRef($el, evtRef), targetFn;

		//unbind method reference
		if (typeof fn === "string"){
			// console.log("off", $el.__methodReferenceCallbacks)
			if (!$el.__methodReferenceCallbacks) return;
			targetFn = $el.__methodReferenceCallbacks[evtRef + fn]
			$el.__methodReferenceCallbacks[evtRef + fn] = null;
		} else {
			targetFn = fn;
		}

		if (!targetFn) return fn;

		if (evtObj.src[0] === "@") {
			//get saved evt target
			if (targetFn._evtTarget) evtObj.src = targetFn._evtTarget;
			else return false;
		}

		if ($){
			//delegate to jquery
			$(evtObj.src).off(evtObj.evt, targetFn);
		} else {
			//listen element
			evtObj.src.removeEventListener(evtObj.evt, targetFn)
		}
	})

	return fn;
}

//event callbacks modifiers factory
//TODO: automatically identify all these modifiers in `on`
var DENY_EVT_CODE = 1;
var evtModifiers = {
	//call callback once
	one: function(evt, fn){
		var cb = function(){
			// console.log("once cb", fn)
			var result = fn && fn.apply(this, arguments);
			result !== DENY_EVT_CODE && off(this, evt, cb);
			return result;
		}
		return cb;
	},

	//filter keys
	pass: function(evt, fn, keys){
		var cb = function(e){
			var pass = false, key;
			for (var i = keys.length; i--;){
				key = keys[i]
				var which = 'originalEvent' in e ? e.originalEvent.which : e.which;
				if ((key in keyDict && keyDict[key] == which) || which == key){
					pass = true;
					return fn.apply(this, arguments);
				}
			};
			return DENY_EVT_CODE;
		}
		return cb
	},

	//filter target
	delegate: function(evt, fn, selector){
		var cb = function(e){
			// console.log("delegate cb", e.target, selector)
			if (!(e.target instanceof HTMLElement)) return DENY_EVT_CODE;

			var target = e.target;

			while (target && target !== this) {
				if (matchSelector.call(target, selector)) return fn.apply(this, arguments);
				target = target.parentNode;
			}

			return DENY_EVT_CODE;
		}
		return cb;
	}
}

//returns parsed event object from event reference
function _parseEvtRef($el, evtRef){
	// console.group("parse reference", '`' + evtRef + '`')
	var evtDecl = evtRef.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];
	// console.log(evtDecl)
	var evtObj = {};
	evtRef = evtRef.slice(0, -evtDecl.length).trim()
	// console.log("result ref", evtRef)

	evtObj.src = parseTarget($el, evtRef)

	var evtDeclParams = unprefixize(evtDecl, "on").split(":");

	evtObj.evt = evtDeclParams[0];
	evtObj.modifiers = evtDeclParams.slice(1).sort(function(a,b){
			//:once modifier should be the last one
		return /onc?e/.test(a) ? 1 : -1
	});

	// console.log(evtObj)
	// console.groupEnd();
	return evtObj;
}

//detect source element from string
function parseTarget($el, str) {
	if (!str){
		return $el
	} if (/^document/i.test(str)) {
		return doc;
	} else if (/^window/i.test(str)) {
		return win;
	} else if (/^root/i.test(str)) {
		return root
	}  else if (/parent/i.test(str) || '..' === str) {
		return $el.parentNode
	} else if (str[0] === '@') {
		//`this` reference
		// return $el[str.slice(1)]
		return str;
	} else if (/^[.#[]/.test(str)) {
		//custom one-word selector
		return doc.querySelector(str);
	} else {
		return $el
	}
}

function preventDefault(e){
	e.preventDefault()
}

//dispatch event
function fire(el, eventName, data, bubbles){
	if ($){
		//TODO: decide how to pass data
		var event = $.Event( eventName, data );
		event.detail = data;
		bubbles ? $(el).trigger(event) : $(el).triggerHandler(event);
	} else {
		//NOTE: this doesnot bubble in disattached elements
		var event;
		if (!(eventName instanceof Event)) {
			event =  doc.createEvent("CustomEvent");
			event.initCustomEvent(eventName, bubbles, null, data)
		} else {
			event = eventName;
		}
		// var event = new CustomEvent(eventName, { detail: data, bubbles: bubbles })
		el.dispatchEvent(event);
	}
}

/**
* Simple Maths
*/
//limiter
function between(a, min, max){
	return max > min ? Math.max(Math.min(a,max),min) : Math.max(Math.min(a,min),max)
}
function isBetween(a, left, right){
	if (a <= right && a >= left) return true;
	return false;
}

//precision round
function round(value, step) {
	step = parseFloat(step);
	if (step === 0) return value;
	value = Math.round(value / step) * step
	return parseFloat(value.toFixed(getPrecision(step)));
}

//get precision from float: 1.1 → 1, 1234 → 0, .1234 → 4
function getPrecision(n){
	 var s = n + "",
        d = s.indexOf('.') + 1;

    return !d ? 0 : s.length - d;
}


/**
* Simple strings
*/
//returns value from string with correct type except for array
//TODO: write tests for this fn
function parseAttr(str){
	var v;
	if (/true/i.test(str)) {
		return true;
	} else if (/false/i.test(str)) {
		return false;
	} else if (!/[^\d\.\-]/.test(str) && !isNaN(v = parseFloat(str))) {
		return v;
	}
	return str;
}

//parse value according to the type passed
function parseTypedAttr(value, type){
	var res;
	if (type instanceof Array) {
		res = parseArray(value);
	} else if (typeof type === "number") {
		res = parseFloat(value)
	} else if (typeof type === "boolean"){
		res = !/^(false|off|0)$/.test(value);
	} else if (isFn(type)){
		res = new Function(value);
	} else if (typeof type === "string"){
		res = value;
	} else if (isObject(type)) {
		res = parseObject(value)
	} else {
		res = parseAttr(value);
	}

	return res;
}

function parseObject(str){
	if (str[0] !== "{") str = "{" + str + "}";
	try {
		return JSON.parse(str);
	} catch (e) {
		return {}
	}
}

//returns array parsed from string
function parseArray(str){
	if (typeof str !== "string") return [parseAttr(str)]

	//clean str from spaces/array rudiments
	str = str.trim();
	if (str[0] === "[") str = str.slice(1);
	if (str.length > 1 && str[str.length - 1] === "]") str = str.slice(0,-1);

	var result = [];
	each(str, function(value) {
		result.push(parseAttr(value))
	})

	return result;
}

//camel-case → CamelCase
function toCamelCase(str){
	return str && str.replace(/-[a-z]/g, function(match, position){
		return upper(match[1])
	})
}

//CamelCase → camel-case
function toDashedCase(str){
	return str && str.replace(/[A-Z]/g, function(match, position){
		return (position ? "-" : "") + match.toLowerCase()
	})
}

//simple uppercaser
function upper(str){
	return str.toUpperCase();
}

//aaa → Aaa
function capfirst(str){
	str+='';
	if (!str) return str;
	return upper(str[0]) + str.slice(1);
}

// onEvt → envt
function unprefixize(str, pf){
	return (str.slice(0,pf.length) === pf) ? str.slice(pf.length).toLowerCase() : str;
}

//stringify any element passed, useful for attribute setting
function stringify(el){
	if (!el) {
		return '' + el
	} if (el instanceof Array){
		//return comma-separated array
		return el.join(",")
	} else if (el instanceof HTMLElement){
		//return id/name/proper selector
		return el.id

		//that way is too heavy
		// return selector(el)
	} else if (isObject(el)){
		//serialize json
		return JSON.stringify(el);
	} else if (isFn(el)){
		//return function body
		var src = el.toString();
		el.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
	} else {
		return el.toString();
	}
}
//→
/**
* Controller on elements
* Workhorse of mods
*/

//logging needs
var LOG = false;


/**
* Mod constructor
*/
//var max = 0;
function Mod($el, opts){
	var CurrentMod = this.constructor;

	//ensure element/options
	if (!($el instanceof HTMLElement)){
		if ($el && !opts){
			//opts passed as a first argument
			opts = $el;
		}
		$el = doc.createElement('div');
	}

	//check first time init
	if ($el._mod) {
		//prevent double instantiation
		if ($el._mod === CurrentMod || (
			($el._mod.displayName && CurrentMod.displayName) &&
			($el._mod.displayName === CurrentMod.displayName))) {
			return $el;
		}

		//create new anonymous mod merging passed mod
		//NOTE: Can’t find actual useful cases to keep reference to previous mods
		// CurrentMod = CurrentMod.extend($el._mod);
	} else {
		//create anonymous customMod, if straight Mod constructor called

		if (CurrentMod === Mod){
			CurrentMod = Mod.extend();
		}
	}

	//keep track of instances
	$el._id = CurrentMod.instances.length;
	CurrentMod.instances.push($el);

	//treat element
	if (CurrentMod.displayName) {
		$el.classList.add(CurrentMod.displayName);
	}

	//save callbacks
	var initCb = CurrentMod.properties.init && CurrentMod.properties.init.value;
	var createdCb = CurrentMod.properties.created && CurrentMod.properties.created.value;


	//save predefined element properties, as well as other defined properties
	var preinit = {};
	var testElement = $el.cloneNode();

	for (var propName in CurrentMod.properties) {
		if (propName[0] === "_") continue;

		//read element property
		if (propName in $el) {
			//prevent DOM interfering property
			if (!(/^on/.test(propName)) &&
				(($el._mod && $el._mod.properties && propName in $el._mod.properties) ||
					propName in testElement)
				) {
				// console.log("Interfering property `" + propName + "` in creating `" + CurrentMod.displayName + "` over `" + ($el._mod && $el._mod.displayName || $el.tagName) + "`")
				throw Error("Interfering property `" + propName + "` in creating `" + CurrentMod.displayName + "` over `" + ($el._mod && $el._mod.displayName || $el.tagName) + "`")
			} else {
				//save predefined element value
				preinit[propName] = $el[propName];
			}
		}

		//if no preset value defined - read value from attributes
		else {
			var propValue = CurrentMod.properties[propName].value
			var attr = $el.attributes[propName] || $el.attributes["data-" + propName];
			if (attr) {
				if (/^on/.test(propName)) preinit[propName] = new Function(attr.value);
				else preinit[propName] = parseTypedAttr(attr.value, propValue);
			}
		}
	}
	opts = extend(preinit, opts);

	//save current mod class
	$el._mod = CurrentMod;

	//call init
	on($el, "init:one", initCb);
	on($el, "init:one", opts.init)
	fire($el, "init");

	//enter default state (1st level attributes)
	$el.__stateRedirectCount = 0;

	//init passed listeners beforehead
	for (var propName in opts){
		var value = opts[propName];
		if (isFn(value)) {
			// console.log("additional callback", propName)
			on($el, propName, value.bind($el));
			opts[propName] = null
		}
	}

	enterState($el, "create", CurrentMod.properties, opts);

	//init passed values
	for (var propName in opts){
		var value = opts[propName];
		if (value !== undefined && !(propName in $el)) {
			// console.log("additional property", propName)
			$el[propName] = value;
		}
	}

	//call created
	on($el, "created:one", createdCb);
	on($el, "created:one", opts.created)
	fire($el, "created");

	return $el;
};


/**
* define state properties passed on the element
*/
//TODO: optimize after-initialization (now double code)
//TODO: merge methods definition with properties definition (actually they’re very similar)
function enterState($el, stateKey, props, initValues){
	if (!props) return;

	//sort properties
	var orderedProps = sortPropsByOrder(Object.keys(props), props);

	// console.group("enterState:", stateKey, orderedProps)

	//save after method
	if (props.after) $el.__after = props.after.value;

	//TODO: detect native properties
	//for each property in state
	orderedProps.forEach(function(propName){
		var prop = props[propName];
		// console.log(propName, props[propName], $el[propValue])

		//ignore empty props
		if (prop === undefined) return;

		var initValue, propValue = clone(prop.value);

		//set private/defined/non-descriptor property
		if (propName[0] === "_"){
			$el[propName] = prop;
			return;
		}

		//define property, if is not already
		else if(!(propName in $el)){
			// console.log("define prop", propName, 'in state', stateKey)

			var _propName = '_' + propName;

			//define instance getters/setters
			Object.defineProperty($el, propName, {
				configurable: false,
				enumerable: true,
				get: (function(_key){
					return function(){
						return this[_key];
					}
				})(_propName),
				set: (function(key, _key, desc){
					return function(value){
						var self = this;

						// console.log("set value", key, '`' + value + '` from', self[ _key ])

						//save old value
						var oldValue = self[_key];

						//pass initial set, ignore same value
						if (_key in self) {
							if (self[ _key ] === value) return;

							//count redirects
							self.__stateRedirectCount++;
							if (self.__stateRedirectCount >= Mod._maxRedirects) throw Error("Too many redirects in " + key);

							//leave state routines
							if (desc.values) {
								var stateValue = desc.values[oldValue] ? oldValue : '_';

								var oldStateKey = key + capfirst(stateValue);

								if(!self['__after' + oldStateKey]){
									self['__after' + oldStateKey] = true;

									//leave state
									var afterResult = leaveState(self, oldStateKey, desc.values[stateValue]);

									//ignore leaving state
									if (afterResult === false) {
										return;
									}

									//redirect state, if returned any
									if (afterResult !== undefined) {
										self[key] = afterResult;
										return;
									}

									//fire leaving event
									fire(self, "after" + capfirst(key) + capfirst(oldValue))

									self['__after' + oldStateKey] = null;
								}
							}
						} else {
							//NOTE: this is quite low performant: http://jsperf.com/dom-defineproperty
							// Object.defineProperty(self, _key, {
							// 	configurable: false,
							// 	enumerable: false,
							// 	writable: true
							// })
						}

						//prevent redirect happened
						if (self[_key] !== oldValue) return;

						//set new value
						self[ _key ] = value;

						//enter state routines
						var beforeResult;
						if (desc.values) {
							var stateValue = value in desc.values ? value : '_';
							var state = desc.values[stateValue];

							if (stateValue in desc.values){
								//enter state, if there’s any
								beforeResult = enterState(self, key + capfirst(stateValue), state);
							} else {
								//if there’s no state to enter - attempt to reset values

							}

							//fire entering event
							fire(self, key + capfirst(value))

							//check whether state redirect needed
							if (beforeResult !== undefined) {
								//revert state if false returned
								if (beforeResult === false) {
									self[key] = oldValue;
								}
								//redirect state if returned any
								else {
									self[key] = beforeResult;
								}
								return;
							}
						}

						//call change validator, if any
						else if (desc.change && !self['__change' + key]) {
							self['__change' + key] = true;
							try {
								var changedValue = desc.change.call(self, value, oldValue)
							} catch (e) {
								self[_key] = oldValue;
								throw e
							}
							if (changedValue === false) self[_key] = oldValue;
							else if (changedValue !== undefined) self[_key] = changedValue;
							self['__change' + key] = null;
						}

						//update attribute
						desc.attribute && setAttrValue(self, key, value);

						//NOTE: this is going to be deprecated (no use-cases found)
						//notify change
						// fire(self, escape(key) + "Changed", {key: key, value: value, oldValue: oldValue});

						//clean redirect counter
						self.__stateRedirectCount = 0;
					}
				})(propName, _propName, prop)
			});

			//call init prop, if any
			if (prop.init) {
				propValue = prop.init.call($el, (propName in initValues) ? initValues[propName] : prop.value);
				if (propValue === undefined) {
					if (_propName in $el){
						//if property was changed fromwithin init
						initValues[propName] = $el[propName];
					} else {
						//if property hasn’t been changed - get back to value init
						initValues[propName] = (propName in initValues) ? initValues[propName] : prop.value;
					}
				} else {
					//if returned value
					initValues[propName] = propValue;
				}
				// console.log("after init call", propValue)
			}
		}


		//set straigt method callback (always by method reference, not the real fn)
		if (isFn(propValue)) {
			// console.log("on", propName, propName);
			on($el, propName, propName)
		} else {
			//TODO: bind property state-redirector
			// var redirectCb = function(){
			// 	return function(){
			// 		this[stateKey] = ???
			// 	}
			// }
			// $el[_propName + 'RedirectCb'] = redirectCb;
			// on($el, propName, redirectCb)
		}


		//set callback method reference (do not set value then)
		var isRef = false;
		if (isFn($el[propValue])) {
			on($el, propName, propValue)
		}

		//set custom value passed/assign value
		else if (!isFn(propValue) && initValues && (propName in initValues)) {
			// console.log("set init value", propName, propValue, initValues[propName])
			$el[propName] = initValues[propName];
		}

		//just set value
		else {
			// console.log("set custom value", propName, propValue)
			$el[propName] = propValue;
		}

	});

	var beforeResult;
	if (props.before){
		beforeResult = props.before.value.call($el);
	}

	// console.groupEnd()

	return beforeResult
}


/**
* undefine state properties passed with the name passed
*/
function leaveState($el, stateKey, props){
	// console.group("leave state", stateKey, props)
	var afterCbResult;

	//fire leaving state
	if ($el.__after) {
		afterCbResult = $el.__after.call($el);

		//ignore entering state if false returned
		if (afterCbResult === false) return false;
	}

	//unbind all previously bound callbacks/methods
	for(var evtRef in props) {
		if (techCbRe.test(evtRef) || props[evtRef] === undefined) continue;
		if (isFn($el[props[evtRef].value])) {
			// console.log("off ref", evtRef, props[evtRef].value)
			//unbind reference
			off($el, evtRef, props[evtRef].value);
		} else {
			// console.log("off", evtRef)
			//unbind method
			off($el, evtRef, evtRef);
		}
	}

	//discard active events
	$el.__after = null;

	// console.groupEnd()

	return afterCbResult;
}


/**
* Main mod creator
*/
Mod.extend = function(extObj){
	var self = this;

	// console.group('extend', extObj)

	//create new Mod
	function CustomMod() { return Mod.apply(this, arguments); }

	//ensure props list passed
	extObj = extObj || {};

	//handle mod passed
	var props = extObj.properties || extObj;

	//infer extending mod statics
	CustomMod.instances = [];
	CustomMod.extend = Mod.extend;
	CustomMod.register = Mod.register;
	CustomMod.displayName = self.displayName;
	CustomMod.settings = self.settings;
	CustomMod.properties = {};

	//merge passed properties with initial
	// console.log("extend", CustomMod.properties, self.properties, props)
	deepExtend(CustomMod.properties, self.properties, props);

	CustomMod.properties = normalizeProperties(CustomMod.properties)

	// console.groupEnd()

	return CustomMod;
}

//redirects limiter
Mod._maxRedirects = 10;

/**
* Register mod: create jquery plugin, web-mods etc
*/
//Keyed by name set of mods
Mod.registry = {};
Mod.register = function(name, settings){
	var self = this;

	// console.log("register", name)

	if (!name || self === Mod) throw Error("Bad arguments");

	//recognize register options
	settings = extend({
		jQuery: name,
		customElement: name,
		selector: "." + name
	}, settings);

	//save to the registry
	Mod.registry[name] = self;
	self.displayName = name;
	self.settings = settings;

	//provide jQuery plugin
	if ($ && settings.jQuery && !(settings.jQuery in $)) {
		$['fn'][name] = (function(mod){
			return function (arg) {
				return this['each'](function(i,e){
					var $e = $(e);
					var instance = new mod($e[0], arg);
					$e.data(name, instance);
				})
			};
		})(self);
		$[name] = self;
	}

	//provide customelement
	else if(register && settings.customElement){
		//TODO
	}

	//CONSIDER: provide global class?
	else {

	}

	//Autoinit present in DOM elements
	//init children
	var targets = document.querySelectorAll(settings.selector);
	for (var i = 0; i < targets.length; i++) {
		// console.log("autoinit children")

		new self(targets[i]);
		fire(targets[i], "attached");
	}

	return self;
}



//Observe DOM changes
if (MO) {
	var docObserver = new MO(function(mutations) {
		mutations.forEach(function(mutation){
			// LOG && console.log(mutation, mutation.type)
			//TODO: Update list of data-listeners
			if (mutation.type === "attributes"){
				// LOG && console.log("doc", mutation)
				//TODO: check whether classes were added to the elements
			} else if (mutation.type === "childList"){
				//check whether appended elements are Mods

				var l = mutation.addedNodes.length;

				for (var i = 0; i < l; i++){
					var el = mutation.addedNodes[i];

					if (el.nodeType !== 1) continue;

					//check whether element added is noname mod
					if (el._mod && !el._mod.displayName) {
						if (!el.isAttached) {
							el.isAttached = true;
							fire(el, "attached");
						}
					}
					//NOTE: noname mods within elements wont fire `attached`

					//autoinit top-level registered mods
					for (var modName in Mod.registry){
						var mod = Mod.registry[modName];

						if (matchSelector.call(el, mod.settings.selector)){
							// console.log("autoinit parent", modName, el.isAttached)

							new mod(el);

							if (!el.isAttached) {
								el.isAttached = true;
								fire(el, "attached");
							}
						}
					}

					//autoinit low-level registered mods
					for (var modName in Mod.registry){
						var mod = Mod.registry[modName];

						//init children
						var targets = el.querySelectorAll(mod.settings.selector);

						for (var j = 0; j < targets.length; j++){
							var innerEl = targets[j];
							// console.log("autoinit child", modName, el.isAttached)

							new mod(innerEl);

							if (!innerEl.isAttached) {
								innerEl.isAttached = true;
								fire(innerEl, "attached");
							}
						}
					}
				}

				//TODO: engage new data to update
			}
		})
	});

	docObserver.observe(doc, {
		attributes: true,
		childList: true,
		subtree: true,
		characterData: true
	});
}




/**
* helpers
*/


//reflect passed value in attribute
function setAttrValue($el, attrName, value){
	if (!value) {
		//hide falsy attributes
		$el.removeAttribute(attrName);
	} else {
		//avoid $el attr-observer catch this attr changing
		$el.setAttribute(attrName, stringify(value));
	}
	fire($el, "attributeChanged")
}


var techCbRe = /^(?:init|before|after|created)$/;

//return ordered list of properties
function sortPropsByOrder(keys, props){
	return keys.filter(function(a){
		return !(techCbRe.test(a))// && a[0] !== "_"
	}).sort(function(a,b){
		return (getPropOrder(a, props[a]) > getPropOrder(b, props[b]) ? 1 : -1)
	})
}


//property init priority assessor
//TODO: test whether order is ok
function getPropOrder(name, prop){
	var order = 0;

	//private things are non-depending
	if (name[0] === "_") {
		return -10;
	}

	//non-descriptors are first-priority
	if (!prop) {
		return -9;
	}

	//predefined order is out of question
	if (prop.order !== undefined){
		return prop.order;
	}

	//if plain prop (no meta-things) - second priority
	//NOTE: stringy can be fn references
	if (!prop.init && !prop.change && !prop.values){
		//methods - second priority
		if (isFn(prop.value)) {
			return -8;
		}

		//plain values, including stringy fn declarations - second priority
		else if (!isObject(prop.value)) {
			return -7;
		}

		//object descriptors
		else {
			return -6;
		}
	}

	//descriptors with meta-things
	else {
		//methods - before references
		if (isFn(prop.value)) {
			order = 10;
		} else if (typeof prop.value === "string"){
			order = 13;
		} else {
			order = 11;
		}
	}

	//descriptors with init fn
	if (prop.init) {
		order += 1;
	}

	//descriptors with change fn
	if (prop.change) {
		order += 2;
	}

	//stateful descriptors: most dependable
	if (prop.values) {
		order += 4;
	}

	return order;
}

//return ensured property descriptor
function getPropDesc(prop){
	if (!isObject(prop)) return {
		value: prop
	};

	if (prop.hasOwnProperty('values') || 'value' in prop || prop.change || prop.init) return prop

	return {value: prop};
}


function normalizeProperties(props){
	//ensure descriptors
	for (var propName in props){
		if (propName[0] !== "_") props[propName] = getPropDesc(props[propName]);
	}

	//flatten
	props = flattenValues(props);

	//normalize properties quantity
	for (var propName in props){
		var prop = props[propName], subPropName = '';

		//normalize states
		if (prop.values){
			//disentangle listed properties
			prop.values = flattenValues(prop.values);

			//ensure descriptors
			// console.log("before", prop.values)
			for (var value in prop.values) {
				//expand states shortcuts
				if (isFn(prop.values[value])){
					prop.values[value] = {
						before: prop.values[value]
					}
				} else if(!isObject(prop.values[value])){
					prop.values[value] = {
						before: (function(arg){return function(){ return arg }})(prop.values[value])
					}
				}

				//ensure descriptors
				for (subPropName in prop.values[value]) {
					if (subPropName[0] !== "_") {
						prop.values[value][subPropName] = getPropDesc(prop.values[value][subPropName])
					}
				}
			}
			// console.log("after", prop.values)

			//ensure empty state is present
			if (!("_" in prop.values)) prop.values._ = {};

			// console.log(prop.values)

			//collect the complete set of properties for the state
			var mutualProps = {};
			for (var value in prop.values) {
				// console.log("try", value)
				if (value === "_") continue;
				for (subPropName in prop.values[value]) {
					// console.log("subProp", subPropName)
					if (!(subPropName in mutualProps) && !techCbRe.test(subPropName) && !(subPropName in prop.values._)){
						mutualProps[subPropName] = props[subPropName];
					}
				}
			}

			// console.log(prop.values._, mutualProps)

			//TODO: think of simplifying this
			//fulfill rest value state to overlap every property covered with states
			extend(prop.values._, mutualProps);

			//expand collected rest value properties to element (predefine)
			for (var mutualProp in prop.values._){
				if (!(mutualProp in props) && !techCbRe.test(mutualProp)){
					props[mutualProp] = getPropDesc(prop.values._[mutualProp])
				}
			}
			// console.log(props)
		}

		//treat events with self-references
		if (/\@/.test(propName)){
			// var evtObj = _parseEvtRef(null, propName);
			var refTarget = propName.split(/\s/)[0];
			// console.log("@ref found", refTarget)

			//override refering property’s (like @el) `change` method to catch it’s `HTMLElement` value
			var refPropName = refTarget.slice(1);
			var refPropDesc = props[refPropName] || {value: undefined};
			var refPropChangeWrapper = (function(change, propName){
				return function(value, oldValue){
					// console.log("wrapper", value);
					if (!(value instanceof HTMLElement)) {
						// console.log("unbind", value, oldValue)
						off(this, propName, propName)
					}

					var result = change ? change.apply(this, arguments) : value;

					//bind handler each time evt target becomes an HTMLElement
					if (result instanceof HTMLElement) {
						// console.log("bind", value)
						on(this, propName, propName);
					}

					return result;
				}
			})(refPropDesc.change, propName);

			refPropDesc.change = refPropChangeWrapper;
			props[refPropName] = refPropDesc;
		}
	}

	// console.log("ext props", props)

	return props;
}


//disentangle listed values
function flattenValues(values){

	// console.log("before", values)

	for(var valueNameList in values){
		if (/,/.test(valueNameList)){
			var value = values[valueNameList];
			delete values[valueNameList];

			each(valueNameList, function(valueName){
				values[valueName] = value;
			})
		}
	}

	// console.log("after", values);

	return values;
}