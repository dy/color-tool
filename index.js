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
var isArray = require('mutype/is-array');
var isNumber = require('mutype/is-number');


module.exports = Picky;



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
	var WORKER = getWorker(spaces);
}


/**
 * @abstract
 *
 * This is a main picker class.
 * It provides an abstract interface for any color picker.
 */
function Picky (target, options) {
	var self = this;

	//force constructor
	if (!(self instanceof Picky)) return new Picky(target, options);

	//ensure target & options
	if (!options) {
		if (target instanceof Element) {
			options = {};
		}
		else {
			options = target;
			target = doc.createElement('div');
		}
	}


	//get preferred element
	self.element = target;

	//add class
	self.element.classList.add('picky');

	//take over options
	extend(self, options);

	//generate uid for worker
	self.id = getUid();

	//save channel indexes
	var space = spaces[self.space];

	self._channels = (isArray(self.channel) ? self.channel : [self.channel] ).map(function (channel) {
		if (isNumber(channel)) return channel;
		var idx = space.channel.indexOf(channel);
		if (idx < 0) throw Error('Space ' + self.space + ' has no channel ' + channel);
		return idx;
	});

	//save channel mins/maxes
	self._min = self._channels.map(function (idx) {
		return space.min[idx];
	});
	self._max = self._channels.map(function (idx) {
		return space.max[idx];
	});

	//create color instance
	self.color = new Color(self.color);
	var values = self.color[self.space + 'Array']();

	//make self a slidy
	self.slidy = new Slidy(target, {
		pickerClass: 'picky-picker',
		point: true,
		min: self._min,
		max: self._max,

		//set initial value as the color
		value: self._channels.map(function (idx) {
			return values[idx];
		})
	});

	//enable events
	self.enable();

	//force update
	self.update();
}


var proto = Picky.prototype = Object.create(Emitter.prototype);


/** Enable interactions */
proto.enable = function () {
	var self = this;

	//emit self change
	self.slidy.on('change', function (value) {
		self.emit('change', self.color);
	});

	//listen to bg update events for the specifically this picker
	if (isWorkerAvailable && self.worker) {
		on(WORKER, 'message', function (e) {
			if (e.data.id === self.id) self.renderData(e.data.data);
		});
	}

	//bind options change listener
	on(self, 'change', self.change);

	//rerender on color change - loosely calling
	//50 is the most appropriate interval for bg
	//10 is the interval for picker movement
	throttle(self.color, 'change', 50, function (e) {
		self.update();
	});

};


/** Basic initial color for pickers */
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
	var space = spaces[self.space];

	//form options
	var opts = {
		space: this.space,
		channel: self._channels,
		max: self._max,
		min: self._min,
	};

	//render range for a new color value in worker
	if (isWorkerAvailable && this.worker && false) {
		WORKER.postMessage(extend(opts, {
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