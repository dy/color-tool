var Color = require('color');
var state = require('st8');
var Emitter = require('Emmy');
var type = require('mutypes');

module.exports = Picker;


/**
 * @abstract
 *
 * @todo Transfer delta-stream
 * @todo It is duplex-stream btw
 * @todo raise change events
 * @todo  Able to be piped
 *
 * This is a main picker class.
 * It provides an abstract interface for any picker you can create.
 */
function Picker(target, options){
	var self = this, constr = self.constructor;

	this.element = target;

	options = options || {};

	//parse attributes of targret
	var prop, parseResult;
	for (var propName in constr.options){
		//parse attribute, if no option passed
		if (options[propName] === undefined){
			prop = constr.options[propName];
			options[propName] = parse.attribute(target, propName, prop && prop.init !== undefined ? prop.init : prop);
		}

		//declare initial value
		if (options[propName] !== undefined) {
			this[propName] = options[propName];
		}
	}

	//add class
	this.element.classList.add('picker');


	//apply options
	state(this, constr.options);


	//FIXME: create color
	if (type.isString(this.color)) {
		this.color = new Color(this.color);
	}

	//rerender on color change - loosely calling
	//50 is the most appropriate interval for bg
	//10 is the interval for picker movement
	Enot.on(this, '@color change:throttle(15)', function(e){
		self.colorChanged.call(self, e);
	});


	//change color on self slidy change
	this.element.addEventListener('change', function(e){
		// console.group('change')
		self.valueChanged.call(self, e);
		self.emit('change');
		// console.groupEnd();
	});
}


/** Set options in descendants */
Picker.options = {
	/** callbacks */
	change: null,

	/** parse color from the options */
	color: null
};


/** Registered pickers (shortcuts) */
Picker.pickers = {};
Picker.register = function(names, pickerClass){
	names.split(/\s?,\s?/).forEach(function(name){
		Picker.pickers[name] = pickerClass;
	});
};


var PickerProto = Emitter(Picker.prototype);


/** Redefine these methods in descendants */
PickerProto.valueChanged = function(){
	//set color/component
};
PickerProto.colorChanged = function(){
	//set self value
};