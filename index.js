/**
 * Picky - color picker component
 * @module  picky
 */

//TODO: make loose movement

var Emitter = require('events');
var renderRange = require('color-ranger');
var extend = require('xtend/mutable');
var on = require('emmy/on');
var emit = require('emmy/emit');
var throttle = require('emmy/throttle');
var getUid = require('get-uid');
var spaces = require('color-space');
var Slidy = require('slidy');
var isArray = require('mutype/is-array');
var isNumber = require('mutype/is-number');
// var browser = require('detect-browser');


module.exports = Picky;


var doc = document, win = window;


/**
 * Create a web-worker
 * @link see references in color-ranger tests
 */
var isWorkerAvailable = !!window.Worker;
if (isWorkerAvailable) {
	var work = require('webworkify');
	var worker = work(require('color-ranger/worker'));
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

	// Virtual canvas for painting color ranges
	self.cnv = doc.createElement('canvas');
	self.cnv.className = 'picky-bg';
	self.cnv.width = self.canvasWidth;
	self.cnv.height = self.canvasHeight;
	self.ctx = self.cnv.getContext('2d');

	self.element.appendChild(self.cnv);

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

	//make self a slidy
	//detect orientation based on a number of values passed
	self.orientation = isArray(self.channel) && self.channel.length > 1 && 'cartesian';

	//detect repeat based on channel
	self.repeat = false;
	if (space.channel[self._channels[0]] === 'hue') self.repeat = 'x';
	else if (space.channel[self._channels[1]] === 'hue') self.repeat = 'y';

	self.slidy = new Slidy(target, {
		pickerClass: 'picky-picker',
		point: true,
		min: self._min,
		max: self._max,
		orientation: self.orientation,
		repeat: self.repeat,
		step: self.step
	});

	//enable events
	self.enable();
}


var proto = Picky.prototype = Object.create(Emitter.prototype);


/** Enable interactions */
proto.enable = function () {
	var self = this;

	//update color on self user input
	on(self.slidy, 'input', function (value) {
		var values = self.color[self.space + 'Array']();

		self._channels.forEach(function (idx, i) {
			values[idx] = value[i];
		});

		//set updated color
		self.color[self.space](values);

		//trigger change for color
		emit(self.color, 'change');
	});

	//listen to bg update events for the specifically this picker
	if (isWorkerAvailable && self.worker) {
		on(worker, 'message', function (e) {
			var imgData = new ImageData(e.data.data, self.canvasWidth, self.canvasHeight);
			if (e.data.id === self.id) self.renderData(imgData);
		});
	}

	//bind options change listener
	if (self.change) {
		on(self, 'change', self.change);
	}

	//rerender on color change - loosely calling
	//50 is subjectively unnoticed interval for bg rendering
	throttle(self.color, 'change', 50, function (e) {
		self.updateBackground();
	});

	//10 is subjectively unnoticed interval for picker movement
	throttle(self.color, 'change', 10, function (e) {
		//ignore active slidy
		if (self.element.contains(doc.activeElement)) return;

		self.updatePosition();
	});

	//for the rest color change events just redirect callback
	on(self.color, 'change', function () {
		self.emit('change', self.color);
	});

	//update position, bg etc
	self.update();

	//emit first change, as if changed from undefined to anything
	self.emit('change', self.color);
};


/** Basic initial color for pickers */
proto.color = null;


/** Use web-worker to render range */
proto.worker = true;


/** A space to pick value in */
proto.space = 'rgb';


/** Default channel */
proto.channel = 'red';

/** 37 is a good balance between performance/quality. You can set 101 or 13 though. */
proto.canvasHeight = 37;
proto.canvasWidth = 37;

/** Slidy default options */
proto.step = 1;


/**
 * Update bg & position
 */
proto.update = function () {
	this.updateBackground()
		.updatePosition();

	return this;
};


/**
 * Update picker position
 * according to the current color value
 */
proto.updatePosition = function () {
	var self = this;

	var cValues = self.color[self.space + 'Array']();

	var value = self._channels.map(function (idx) {
		return cValues[idx];
	});

	self.slidy.value = value;

	return self;
};


/**
 * Render picker background
 * according to the current color value
 */
proto.updateBackground = function () {
	var self = this;

	var imgData = self.ctx.getImageData(0, 0, self.canvasWidth, self.canvasHeight);
	var space = spaces[self.space];

	//form options
	var opts = {
		space: this.space,
		channel: self._channels,
		max: self._max,
		min: self._min,
	};

	//render range for a new color value in worker
	if (isWorkerAvailable && this.worker) {
		//response is handled by `message` event
		worker.postMessage(extend(opts, {
			color: this.color.hslArray(),
			sourceSpace: 'hsl',
			data: imgData.data,
			id: this.id
		}));
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

	return self;
};


/** Just show image data passed in self */
proto.renderData = function (imgData) {
	var self = this;

	self.ctx.putImageData(imgData, 0, 0);

	//iphone/firefox flickers on rerender, so it needs fake rendering layer first
	// self.bgElement.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';

	//and then update main background in background
	// if (BG_LAYER && !self._renderBgTo) {
	// 	self._renderBgTo = setTimeout(function () {
	// 		self.element.style.backgroundImage = self.bgElement.style.backgroundImage;
	// 		self._renderBgTo = null;
	// 	}, 50);
	// }

	return self;
};