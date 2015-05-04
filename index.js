/**
 * Picky - color picker component
 * @module  picky
 */

var Color = require('color');
var Emitter = require('events');
var getWorker = require('color-ranger/worker');
var renderRange = require('color-ranger');
var extend = require('xtend/mutable');
var on = require('emmy/on');
var throttle = require('emmy/throttle');
var getUid = require('get-uid');
var spaces = require('color-space');
var Slidy = require('slidy');


module.exports = Picker;



/** Virtual canvas for painting color ranges */
var cnv = document.createElement('canvas');
var ctx = cnv.getContext('2d');

/** 37 is a good balance between performance/quality. You can set 101 or 13 though. */
cnv.width = 37;
cnv.height = 37;

var isWorkerAvailable = typeof Worker !== 'undefined';


/**
 * Create a web-worker
 * @link see references in color-ranger tests
 */
if (isWorkerAvailable) {
	worker = getWorker(spaces);
}


/**
 * @abstract
 *
 * This is a main picker class.
 * It provides an abstract interface for any color picker.
 */
function Picker(element, options){
	var self = this;

	this.element = element;

	//parse attributes of a targret
	// var prop, parseResult;
	// for (var propName in constr.options){
	// 	//parse attribute, if no option passed
	// 	if (options[propName] === undefined){
	// 		prop = constr.options[propName];
	// 		options[propName] = parse.attribute(element, propName, prop && prop.init !== undefined ? prop.init : prop);
	// 	}

	// 	//declare initial value
	// 	if (options[propName] !== undefined) {
	// 		this[propName] = options[propName];
	// 	}
	// }

	//add class
	this.element.classList.add('picky');

	//take over options
	extend(this, options);


	//generate uid for worker
	this.id = getUid();

	//create color instance
	this.color = new Color(this.color);

	//make self a slidy
	this.slidy = new Slidy(element, {
		pickerClass: 'picky-picker'
	});


	//Events
	//listen to bg update events for the specifically this picker
	if (isWorkerAvailable && this.worker) {
		on(worker, 'message', function(e){
			if (e.data.id === self.id) self.renderData(e.data.data);
		});
	}

	//rerender on color change - loosely calling
	//50 is the most appropriate interval for bg
	//10 is the interval for picker movement
	// throttle(this.color, 'change', 50, function(e){
	// 	self.colorChanged.call(self, e);
	// });

	//change color on self slidy change
	// on(this.element, 'change', function(e){
	// 	self.valueChanged.call(self, e);
	// 	self.emit('change');
	// });


	//force update
	self.update();
}


var proto = Picker.prototype = Object.create(Emitter.prototype);


/** Basic color for pickers */
proto.color = new Color();


/** Use web-worker to render range */
proto.worker = true;


/** A space to pick value in */
proto.space = 'rgb';


/** Color component to pick */
proto.channel = {
	init: 'hue',
	hue: {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 360;
			this.slidy.repeat = true;

			this.space = 'hsl';
			this.cIdx = [0];
			this.cMax = [360];
		}
	},
	saturation: {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 100;
			this.slidy.repeat = false;

			this.space = 'hsl';
			this.cIdx = [1];
			this.cMax = [100];
		}
	},
	lightness: {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 100;
			this.slidy.repeat = false;

			this.space = 'hsl';
			this.cIdx = [2];
			this.cMax = [100];
		}
	},
	'value, brightness': {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 100;
			this.slidy.repeat = false;

			this.space = 'hsv';
			this.cIdx = [2];
			this.cMax = [100];
		}
	},
	red: {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 255;
			this.slidy.repeat = false;

			this.space = 'rgb';
			this.cIdx = [0];
			this.cMax = [255];
		}
	},
	green: {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 255;
			this.slidy.repeat = false;

			this.space = 'rgb';
			this.cIdx = [1];
			this.cMax = [255];
		}
	},
	blue: {
		before: function(){
			this.slidy.min = 0;
			this.slidy.max = 255;
			this.slidy.repeat = false;

			this.space = 'rgb';
			this.cIdx = [2];
			this.cMax = [255];
		}
	},
	alpha: {
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
};


/**
 * Render picker background
 * according to the current color value
 */
proto.update = function(){
	var self = this;

	var imgData = ctx.getImageData(0, 0, cnv.width, cnv.height);
	var space = spaces[this.space];
	var opts = {
		space: this.space,
		channel: [0,1],
		max: space.max.slice(0,2),
		min: space.min.slice(0,2),
	};

	//render range for a new color value in worker
	if (isWorkerAvailable && this.worker && false) {
		worker.postMessage(extend(opts, {
			rgb: this.color.rgbArray(),
			data: imgData.data,
			id: this.id
		}));
		//response is handled by `message` event
	}

	//render single-flow
	else {
		renderRange(
			this.color.rgbArray(),
			imgData.data,
			opts
		);
		this.renderData(imgData);
	}
};


/** Just show image data passed in self */
proto.renderData = function (imgData) {
	ctx.putImageData(imgData, 0, 0);
	this.element.style.backgroundImage =  'url(' + cnv.toDataURL() + ')';
};


/** Set color */
proto.valueChanged = function(){
	//update color value
	//FIXME: color change here affects in some way other pickers
	this.color[this.channel](this.slidy.value);
	// console.log(this.channel);
	//TODO: make change event color-dependent. User should not emit color change manually.
	emit(this.color, 'change', {channel: this.channel});
};


/** Update bg */
proto.colorChanged = function(e){
	//TODO: make this muting picker-independent. User should not implement muting in his own pickers
	if (e.detail && e.detail.channel !== this.channel){
		this.slidy.mute = true;
	}

	//update self value so to correspond to the color
	this.slidy.value = this.color[this.channel]();

	this.slidy.mute = false;

	this.render();
};