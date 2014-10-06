var Color = require('color');

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
		if (options[propName] !== undefined) {
			prop = props[propName];
			options[propName] = parse.attribute(target, propName, prop);
		}
		else {
			options[propName] = constr.options[propName];
		}

		//declare initial value
		this[propName] = options[propName];
	}


	//create color
	this.color = new Color(this.color);


	//rerender on color change
	Color.on('change', this.colorChanged);


	//change color on self slidy change
	this.element.addEventListener('change', this.valueChanged);
}


/** Set options in descendants */
Picker.options = {};


/** Registered pickers (shortcuts) */
Picker.pickers = {};
Picker.register = function(name, pickerClass){
	if (Picker.pickers[name]) throw Error('Bad picker shortcut: ' + name + '. Already registered.');

	Picker.pickers[name] = pickerClass;
};


var PickerProto = Picker.prototype;


/** Redefine these methods in descendants */
PickerProto.valueChanged = function(){
	//set color [component]
};
PickerProto.colorChanged = function(){
	//set self value
};