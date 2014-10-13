//TODO: refactor all specific pickers so that just to implement this interface

var Picker = require('Picker');
var Slidy = require('slidy');
var Emitter = require('Emmy');
var css = require('mucss');
var extend = require('extend');


module.exports = LinearPicker;


/**
 * Alpha linear picker
 *
 * @module
 * @constructor
 */
function LinearPicker(target, options){

	//make self a slidy
	//goes after self init because fires first change
	this.slidy = new Slidy(target, {
		step: 1,
		instant: true
	});

	//call picker constructor
	Picker.call(this, target, options);

	//force update
	Emitter.emit(this.color, 'change');
	this.emit('change');
}


LinearPicker.options = extend({}, Picker.options, {
	/** Shared color object */
	color: undefined,

	/** direction to show picker */
	direction: {
		init: 'right',
		//set up orientation
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

		//set up proper min/maxes
		'bottom, right': {
			before: function(){
				this.slidy.min = this.min;
				this.slidy.max = this.max;
			}
		},
		'top, left': {
			before: function(){
				this.slidy.max = this.min;
				this.slidy.min = this.max;
			}
		}
	},

	/** color component to pick */
	component: {
		init: 'hue',
		hue: {
			min: 0,
			max: 360,
			render: function(){
				// console.log('render')

				//render
				var color = this.color;
				var s = color.saturation(),
					h = color.hue(),
					l = color.lightness();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ',',
					'hsl(0,' + s + '%,' + l + '%) 0%,',
					'hsl(60,' + s + '%,' + l + '%) 16.666%,',
					'hsl(120,' + s + '%,' + l + '%) 33.333%,',
					'hsl(180,' + s + '%,' + l + '%) 50%,',
					'hsl(240,' + s + '%,' + l + '%) 66.666%,',
					'hsl(300,' + s + '%,' + l + '%) 83.333%,',
					'hsl(360,' + s + '%,' + l + '%) 100%)'].join('');

				this.element.style.background = bg;
			}
		},
		saturation: {
			min: 0,
			max: 100,
			render: function(){
				// console.log('render')

				//render
				var color = this.color;
				var s = color.saturation(),
					h = color.hue(),
					l = color.lightness();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ',',
					'hsl(' + h + ',0%,' + l + '%) 0%,',
					'hsl(' + h + ',100%,' + l + '%) 100%)'].join('');

				this.element.style.background = bg;
			}
		},
		lightness: {
			min: 0,
			max: 100,
			render: function(){
				// console.log('render')

				//render
				var color = this.color;
				var s = color.saturation(),
					h = color.hue(),
					l = color.lightness();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ',',
					'hsl(' + h + ',' + s + '%,0%) 0%,',
					'hsl(' + h + ',' + s + '%,50%) 50%,',
					'hsl(' + h + ',' + s + '%,100%) 100%)'].join('');

				this.element.style.background = bg;
			}
		},
		red: {
			min: 0,
			max: 255
		},
		green: {
			min: 0,
			max: 255
		},
		blue: {
			min: 0,
			max: 255
		},
		alpha: {
			min: 0,
			max: 255
		}
	},

	/** whether to repeat */
	repeat: true
});


var proto = LinearPicker.prototype = Object.create(Picker.prototype);
proto.constructor = LinearPicker;


/** Set color */
proto.valueChanged = function(){
	//update color value
	this.color[this.component](this.slidy.value);
	Emitter.emit(this.color, 'change');
};


/** Update bg */
proto.colorChanged = function(){
	//update self value so to correspond to the color
	this.slidy.value = this.color[this.component]();

	this.render();
};