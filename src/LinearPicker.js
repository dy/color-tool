//TODO: set up slidy options in a way (type)

var Picker = require('Picker');
var Slidy = require('slidy');
var Emitter = require('Emmy');
var css = require('mucss');
var extend = require('extend');
var renderRange = require('color-ranger');
var converter = require('color-convert/conversions');


module.exports = LinearPicker;



/** Virtual canvas for painting color ranges */
var cnv = document.createElement('canvas');
var ctx = cnv.getContext('2d');

//37 is a good balance between performance/quality. You can set 101 or 13 though.
cnv.width = 37;
cnv.height = 37;


//TODO: detect worker properly
var isWorkerAvailable = typeof Worker !== 'undefined';


/**
 * Create a web-worker
 * @link see references in color-ranger tests
 */
if (isWorkerAvailable) {
	//inline worker - isn’t slower than file loader
	var blobURL = URL.createObjectURL( new Blob([
		'var renderRange = ',
		renderRange.toString() + '\n',

		(function(c){
			var res = '';
			for (var fn in c) {
				res += c[fn].toString() + '\n';
			}
			res += '\nvar converter = {';
			for (var fn in c) {
				res += fn + ':' + c[fn].toString() + ',\n';
			}
			return res + '}\n';
		})(converter),

		';(',
		function(){
			self.onmessage = function(e){
				var data = e.data;
				// console.log('got request', data.channels);
				if (!data) return postMessage(false);


				var data = renderRange(data.rgb, data.space, data.channels, data.maxes, data.data);

				postMessage({
					data: data,
					id: e.data.id
				});
			};
		}.toString(),
		')();'
	], { type: 'application/javascript' } ) );

	worker = new Worker(blobURL);
}

// URL.revokeObjectURL( blobURL );


/** generate unique id */
var counter = Date.now() % 1e9;


/**
 * Alpha linear picker
 *
 * @module
 * @constructor
 */
function LinearPicker(target, options){
	var self = this;

	//make self a slidy
	//goes after self init because fires first change
	this.slidy = new Slidy(target, {
		instant: true,
		pickerClass: "picky-thumb",
		step: 1
	});

	//get unique id
	this.id = counter++;

	//channel index(es) & max in space
	this.cIdx = [];
	this.cMax = [];

	//call picker constructor
	Picker.call(this, target, options);


	//listen to bg update events for the specifically this picker
	if (this.worker && isWorkerAvailable) {
		Emitter.on(worker, 'message', function(e){
			if (e.data.id === self.id) self.renderRange(e.data.data);
		});
	}


	//force update
	Emitter.emit(this.color, 'change');
	this.emit('change');
}




LinearPicker.options = extend({}, Picker.options, {
	//TODO: add type of picker. Type defines a shape.

	/** Use web-worker to render range */
	worker: true,


	/** direction to show picker */
	direction: {
		init: 'right',
		//set up orientation
		'top, bottom': {
			before: function(){
				// this.slidy.orientation = 'vertical';
			}
		},
		'left, right': {
			before: function(){
				// this.slidy.orientation = 'horizontal';
			}
		},

		//set up proper min/maxes
		'bottom, right': {
			before: function(){
				// this.slidy.min = this.min;
				// this.slidy.max = this.max;
			}
		},
		'top, left': {
			before: function(){
				// this.slidy.max = this.min;
				// this.slidy.min = this.max;
			}
		}
	},

	/** A space to pick value in */
	space: {
		init: 'rgb',
		hsl: {},
		rgb: {},
		'hsv, hsb': {},
		lab: {}
	},

	/** Color component to pick */
	channel: {
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
	}
});


var proto = LinearPicker.prototype = Object.create(Picker.prototype);
proto.constructor = LinearPicker;


/** Render picker background */
proto.render = function(){
	var self = this;

	var imgData = ctx.getImageData(0,0,cnv.width, cnv.height);

	//render range for a new color value in worker
	if (this.worker && isWorkerAvailable) {
		worker.postMessage({rgb: this.color.rgbArray(), space: this.space, channels: this.cIdx, maxes: this.cMax, data: imgData, id: this.id});
	}
	//render single-flow
	else {
		imgData = renderRange(this.color.rgbArray(), this.space, this.cIdx, this.cMax, imgData);
		this.renderRange(imgData);
	}
};

/**
 * Put imgData passed into bg
 */
proto.renderRange = function(imgData){
	ctx.putImageData(imgData, 0, 0);
	this.element.style.backgroundImage =  'url(' + cnv.toDataURL() + ')';
}


/** Set color */
proto.valueChanged = function(){
	//update color value
	//FIXME: color change here affects in some way other pickers
	this.color[this.channel](this.slidy.value);
	// console.log(this.channel);
	//TODO: make change event color-dependent. User should not emit color change manually.
	Emitter.emit(this.color, 'change', {channel: this.channel});
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