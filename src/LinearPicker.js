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
		instant: true,
		step: 1
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
		/** @alias brightness */
		//TODO: update color model
		value: {
			min: 0,
			max: 100,
			render: function(){
				// console.log('render')

				//render
				var color = this.color.clone();
				var s = color.saturation(),
					h = color.hue(),
					l = color.lightness();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ','];
				color.value(0);
				bg.push(color.hslString() + ' 0%, ');
				color.value(50);
				bg.push(color.hslString() + ' 50%, ');
				color.value(100);
				bg.push(color.hslString() + ' 100%) 100%)');
				console.log(bg.join(''))

				this.element.style.background = bg.join('');
			}
		},
		red: {
			min: 0,
			max: 255,
			render: function(){
				// console.log('render')

				//render
				var color = this.color;
				var r = color.red(),
					g = color.green(),
					b = color.blue();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ',',
					'rgb(0,' + g + ',' + b +') 0%,',
					'rgb(255,' + g + ',' + b + ') 100%)'].join('');

				this.element.style.background = bg;
			}
		},
		green: {
			min: 0,
			max: 255,
			render: function(){
				// console.log('render')

				//render
				var color = this.color;
				var r = color.red(),
					g = color.green(),
					b = color.blue();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ',',
					'rgb(' + r + ',0,' + b +') 0%,',
					'rgb(' + r + ',255,' + b + ') 100%)'].join('');

				this.element.style.background = bg;
			}
		},
		blue: {
			min: 0,
			max: 255,
			render: function(){
				// console.log('render')

				//render
				var color = this.color;
				var r = color.red(),
					g = color.green(),
					b = color.blue();

				//lightness
				var bg = ['linear-gradient(to ' + this.direction + ',',
					'rgb(' + r + ',' + g + ',0) 0%,',
					'rgb(' + r + ',' + g + ',255) 100%)'].join('');

				this.element.style.background = bg;
			}
		},
		alpha: {
			min: 0,
			max: 1,
			before: function(){
				this.slidy.step = 0.01;
			},
			after: function(){
				this.slidy.step = 1;
			},
			render: function(){
				var color = this.color.clone();

				var gc = this.alphaGridColor;
				var bg = [
				'linear-gradient(to ' + this.direction + ', ' + color.alpha(0).rgbaString() + ' 0%, ' + color.alpha(1).rgbaString() + ' 100%),',
				'linear-gradient(45deg, ' + gc + ' 25%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, ' + gc + ' 75%),',
				'linear-gradient(45deg, ' + gc + ' 25%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, ' + gc + ' 75%)'
				];

				var s = this.alphaGridSize;
				this.element.style.backgroundImage = bg.join('');
				this.element.style.backgroundSize = '100%, ' + s + 'px ' + s + 'px, ' + s + 'px ' + s + 'px';
				this.element.style.backgroundPosition = '0 0, ' + s/2 + 'px ' + s/2 + 'px, 0 0';
			},
			/** transparent grid settings */
			alphaGridColor: 'rgba(0,0,0,.4)',
			alphaGridSize: 14,
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
	//FIXME: color change here affects in some way other pickers
	this.color[this.component](this.slidy.value);
	// console.log(this.component);
	Emitter.emit(this.color, 'change', {component: this.component});
};


/** Update bg */
proto.colorChanged = function(e){
	if (e.detail && e.detail.component !== this.component){
		this.slidy.mute = true;
	}

	//update self value so to correspond to the color
	this.slidy.value = this.color[this.component]();

	this.slidy.mute = false;

	this.render();
};