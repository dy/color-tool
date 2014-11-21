//TODO: set up slidy options in a way (type)

var Picker = require('Picker');
var Slidy = require('slidy');
var Emitter = require('Emmy');
var css = require('mucss');
var extend = require('extend');
var renderRange = require('color-ranger');


module.exports = LinearPicker;



/** Virtual canvas for painting color ranges */
var cnv = document.createElement('canvas');
cnv.width = 37;
cnv.height = 37;
var ctx = cnv.getContext('2d');
var imgData = ctx.getImageData(0,0,cnv.width,cnv.height);



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
		pickerClass: "picky-thumb",
		step: 1
	});

	//call picker constructor
	Picker.call(this, target, options);

	//force update
	Emitter.emit(this.color, 'change');
	this.emit('change');
}


LinearPicker.options = extend({}, Picker.options, {
	//TODO: add type of picker. Type defines a shape.

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
	channel: {
		init: 'hue',
		hue: {
			min: 0,
			max: 360,
			repeat: true

		},
		saturation: {
			min: 0,
			max: 100
		},
		lightness: {
			min: 0,
			max: 100
		},
		/** @alias brightness */
		//TODO: update color model
		value: {
			min: 0,
			max: 100
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
			max: 1,
			before: function(){
				this.slidy.step = 0.01;
			},
			after: function(){
				this.slidy.step = 1;
			},
			/** transparent grid settings */
			alphaGridColor: 'rgba(0,0,0,.4)',
			alphaGridSize: 14,
		},
		cyan: function(){
			this.slidy.min = 0;
			this.slidy.max = 100;
			this.step = 1;
		}
	}
});


var LinearPickerProto = LinearPicker.prototype = Object.create(Picker.prototype);
LinearPickerProto.constructor = LinearPicker;


/** Render picker background */
LinearPickerProto.render = function(){
	//request bg worker to render a new bg
	// css(this.element.style.background, range.linear[this.channel](this.color));
	this.element.style.backgroundImage = this.renderRange();
};


/** Return range bg URL */
LinearPickerProto.renderRange = function(){
	imgData = renderRange(this.color.rgbArray(), 'hsl', [0], [360], imgData);
	ctx.putImageData(imgData, 0, 0);
	return 'url(' + cnv.toDataURL() + ')';
};



/** Set color */
LinearPickerProto.valueChanged = function(){
	//update color value
	//FIXME: color change here affects in some way other pickers
	this.color[this.channel](this.slidy.value);
	// console.log(this.channel);
	//TODO: make change event color-dependent. User should not emit color change manually.
	Emitter.emit(this.color, 'change', {channel: this.channel});
};


/** Update bg */
LinearPickerProto.colorChanged = function(e){
	//TODO: make this muting picker-independent. User should not implement muting in his own pickers
	if (e.detail && e.detail.channel !== this.channel){
		this.slidy.mute = true;
	}

	//update self value so to correspond to the color
	this.slidy.value = this.color[this.channel]();

	this.slidy.mute = false;

	this.render();
};