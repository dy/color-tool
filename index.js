var parse = require('muparse');
var Picker = require('src/Picker');
var HPicker = require('src/HuePicker');
var SPicker = require('src/SaturationPicker');
var LPicker = require('src/LightnessPicker');
var HSPicker = require('src/HSPicker');
var HLPicker = require('src/HLPicker');
var SLPicker = require('src/SLPicker');
var AlphaPicker = require('src/AlphaPicker');


module.exports = CompoundPicker;


/**
 * Compound picker.
 * It’s found more useful to be the main module rather than abstract Picker.
 *
 * @module Picky
 * @constructor
 */
function CompoundPicker(target, options){
	Picker.call(this, target, options);

	//set of inner pickers
	this.pickers = [];

	//create elements according to the mode
	for (var i = 0, l = this.mode.length, el; i < l; i++){
		el = document.createElement('div');
		this.pickers.push(new Picker.pickers[this.mode[i]](el, options));
		this.element.appendChild(el);
	}
}


/** Register picker */
Picker.register('hsl', CompoundPicker);
Picker.register('hsla', CompoundPicker);


/** Settable initial defaults */
CompoundPicker.options = {
	/** Set of pickers to render */
	mode: ['sl','h'],

	/** Default color - shared between inner pickers */
	color: undefined
};



var proto = CompoundPicker.prototype = Object.create(Picker.prototype);


/** Color changed - rerender bg */
proto.valueChanged = function(){
	//TODO:go by all inner pickers, update their’s bg
	// for (var i = 0, l = this.pickers.length; i < l; i++){
	// 	this.pickers[i].valueChanged();
	// }
};


/** Value changed - change color */
proto.colorChanged = function(){
	//Color is usually changed
};