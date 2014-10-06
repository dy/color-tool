var Picker = require('Picker');
var Slidy = require('slidy');


module.exports = HuePicker;


/**
 * Hue linear picker
 *
 * @module
 * @constructor
 */
function HuePicker(target, options){
	Picker.call(this, target, options);

	//make self a slidy
	this.slidy = new Slidy(this.element, options);
}


HuePicker.options = {
	/** direction to show picker */
	orientation: 'vertical',

	/** whether to repeat */
	repeat: true
};


/** Register shortcuts */
Picker.register('h', HuePicker);
Picker.register('hue', HuePicker);



var proto = HuePicker.prototype = Object.create(Picker.prototype);


/** Set color */
proto.valueChanged = function(){
	//update color value
	this.color.hue = value;
};


/** Update bg */
proto.colorChanged = function(){
	//update self value so to correspond to the color
	this.value = this.color.hue;

	//rerender
	var color = this.color;
	var s = color.saturation + "%",
		h = color.hue,
		b = color.lightness + "%";

	//TODO: direction of the slidy
	//var direction = this.

	//TODO: get prefix
	//hue
	var bg = ["linear-gradient(to " + direction + ",",
		"hsl(0," + s + "," + b + "%) 0%,",
		"hsl(60," + s + "," + b + "%) 16.666%,",
		"hsl(120," + s + "," + b + "%) 33.333%,",
		"hsl(180," + s + "," + b + "%) 50%,",
		"hsl(240," + s + "," + b + "%) 66.666%,",
		"hsl(300," + s + "," + b + "%) 83.333%,",
		"hsl(360," + s + "," + b + "%) 100%)"].join("");

	this.style.background = bg;
};