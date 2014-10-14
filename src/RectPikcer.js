//TODO: set up slidy options in a way (type)

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
function RectPicker(target, options){
	//make self a slidy
	//goes after self init because fires first change
	this.slidy = new Slidy(target, {
		instant: true,
		step: 1,
		dimensions: 2
	});

	//call picker constructor
	Picker.call(this, target, options);

	//force update
	Emitter.emit(this.color, 'change');
	this.emit('change');
}


RectPicker.options = extend({}, Picker.options, {

});


/** Components renderers */
RectPicker.render = {
	hue: {
		saturation: function(){

		},

		lightness: function(){

		}
	},

	saturation: {
		lightness: function(){

		}
	},


	red: {
		green: function(){

		},

		blue: function(){

		}
	},

	green: function(){
		blue: function(){

		}
	}
}