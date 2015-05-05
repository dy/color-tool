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
var isArray = require('is-array');
var isNumber = require('is-number');


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
function Picker (element, options) {
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

	//bind options change listener
	on(self, 'change', self.change);

	//rerender on color change - loosely calling
	//50 is the most appropriate interval for bg
	//10 is the interval for picker movement
	// throttle(this.color, 'change', 50, function(e){
	// 	self.colorChanged.call(self, e);
	// });

	//change color on self slidy change
	on(this.slidy, 'change', function (e) {
		self.emit('change');
	});


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


/** Default channel */
proto.channel = 'red';


/**
 * Render picker background
 * according to the current color value
 */
proto.update = function () {
	var self = this;

	var imgData = ctx.getImageData(0, 0, cnv.width, cnv.height);
	var space = spaces[this.space];

	//form channels
	var channels = self.channel;
	if (!isArray(self.channel)) {
		channels = [self.channel];
	}
	channels = channels.map(function (channel) {
		if (isNumber(channel)) return channel;
		var idx = space.channel.indexOf(channel);
		if (idx < 0) throw Error('Space ' + self.space + ' has no channel ' + channel);
		return idx;
	});

	//form mins, maxes
	var mins = [], maxes = [];
	channels.forEach(function (chNum, i) {
		mins[i] = space.min[chNum];
		maxes[i] = space.max[chNum];
	});

	//form options
	var opts = {
		space: this.space,
		channel: channels,
		max: mins,
		min: maxes,
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