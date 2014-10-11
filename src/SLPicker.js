var Picker = require('Picker');
var Slidy = require('slidy');


module.exports = SLPicker;


/**
 * SL linear picker
 *
 * @module
 * @constructor
 */
function SLPicker(target, options){
	Picker.call(this, target, options);

	//make self a slidy
	this.slidy = new Slidy(this.element, options);
}


SLPicker.options = {
	/** direction to show picker */
	orientation: 'vertical',

	/** whether to repeat */
	repeat: true
};


/** Register shortcuts */
Picker.register('sl', SLPicker);



var proto = SLPicker.prototype = Object.create(Picker.prototype);


/** Set color */
proto.valueChanged = function(){
	//update color value
	this.color.lightness = value;
};


/** Update bg */
proto.colorChanged = function(){
	//update self value so to correspond to the color
	this.value = this.color.lightness;

	//rerender
	var color = this.color;
	var s = color.lightness + "%",
		h = color.lightness,
		b = color.lightness + "%";

	var bg = [
	"linear-gradient(to bottom,",
	"hsla(0,0%,100%,1) 0%,",
	"hsla(0,0%,100%,0) 50%,",
	"hsla(0,0%,0%,0) 50%,",
	"hsla(0,0%,0%,1) 100%),",

	"linear-gradient(to right,",
	"hsl(", h , ", 0%, 50%) 0%,",
	"hsl(", h , ", 100%, 50%) 100%)"].join('');

	this.style.background = bg;
};