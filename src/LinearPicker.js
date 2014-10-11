//TODO: refactor all specific pickers so that just to implement this interface

var Picker = require('Picker');
var Slidy = require('slidy');


module.exports = LinearPicker;


/**
 * Alpha linear picker
 *
 * @module
 * @constructor
 */
function LinearPicker(target, options){
	Picker.call(this, target, options);

	//make self a slidy
	this.slidy = new Slidy(this.element);
}


LinearPicker.options = {
	/** Shared color object */
	color: undefined,

	/** direction to show picker */
	direction: {
		init: 'right',

		'top, bottom': {
			before: function(){
				this.slidy.orientation = 'vertical';
			}
		},
		'left, right': {
			before: function(){
				this.slidy.orientation = 'horizontal';
			}
		},

		top: {
			min: 0,
			max: 100
		},
		right: {
			min: 0,
			max: 100,
		},
		bottom: {
			min: 100,
			max: 0
		},
		left: {
			min: 100,
			max: 0
		}
	},

	/** color component to pick */
	component: {
		init: 'hue',
		hue: {
			render: function(){
				//render
				var color = this.color;
				var s = color.lightness + "%",
					h = color.lightness,
					b = color.lightness + "%";

				//lightness
				var bg = ["linear-gradient(to " + direction + ",",
					"hsl(0," + s + "," + b + "%) 0%,",
					"hsl(60," + s + "," + b + "%) 16.666%,",
					"hsl(120," + s + "," + b + "%) 33.333%,",
					"hsl(180," + s + "," + b + "%) 50%,",
					"hsl(240," + s + "," + b + "%) 66.666%,",
					"hsl(300," + s + "," + b + "%) 83.333%,",
					"hsl(360," + s + "," + b + "%) 100%)"].join("");

				this.style.background = bg;
			}
		},
		saturation: {

		},
		lightness: {

		},
		red: {

		},
		green: {

		},
		blue: {

		},
		alpha: {

		}
	},

	/** whether to repeat */
	repeat: true
};


var proto = LinearPicker.prototype = Object.create(Picker.prototype);


/** Set color */
proto.valueChanged = function(){
	//update color value
	this.color[this.component] = value;
};


/** Update bg */
proto.colorChanged = function(){
	//update self value so to correspond to the color
	this.value = this.color[this.component];

	this.render();
};