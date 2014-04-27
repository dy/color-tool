/**
* Range input mod
*/
Mod.extend({
	init: function(){
		// console.log("init slidy")
	},

	created: function(){
		var self = this;

		//watch for input element
		if (this.tagName === "INPUT") {
			this.isInput = true;
			// on(this, "change", function(){
			// 	console.log("slidy-input change", this.value)
			// })
		}

		//create pickers according to the settings
		this.picker = new Draggable({
			within: this,

			attached: function(e){
				//correct pin (centrize based on width of picker)
				this.pin = [this._offsets.width / 2, this._offsets.height / 2];
				//set initial position
				// console.log("picker ready", this.threshold)
				self.updatePosition();
			},

			dragstart: function(e){
				//console.log("dstart")
				disableSelection(document.documentElement);
				css(document.documentElement, {"cursor": "none"});
			},
			drag: function(e){
				//console.log("drag")
				handleDrag(self, e)
			},
			dragend: function(e){
				//console.log("dend")
				enableSelection(document.documentElement);
				css(document.documentElement, {"cursor": null});
			},

			native: false
		});

		//additional picker init
		this.picker.axis = (this.dimensions === 2 ? null : (this.vertical ? 'y' : 'x'));
		this.appendChild(this.picker);
		this.picker.updateLimits();
	},

	attached: function(){
	},

	//HTML5 things
	value: {
		change: function(value, old){
			var result;
			if (typeof value === "string" && /,/.test(value)) value = parseArray(value);
			// console.log("slidy set value", value, old, this.dimensions)

			if (value && value.length === 2) {
				result = [];
				result[0] = round(between(value[0], this.min[0], this.max[0]), this.step)
				result[1] = round(between(value[1], this.min[1], this.max[1]), this.step)
				if (!result[0] && result[0] !== 0) result[0] = old[0];
				if (!result[1] && result[1] !== 0) result[1] = old[1];
				value = result;
			} else {
				value = parseFloat(value) ? value : 0;
				result = round(between(value, this.min, this.max), this.step);
			}

			if (!result && result !== 0) err("Something went wrong in validating value", result)

			this.value = result;

			//console.log("slidy value changed", value, oldValue, this.value)
			this.updatePosition();
			fire(this, "change")
		},
		order: 3
	},

	dimensions: {
		value: 1,
		//mutual with vertical/horizontal
		values: {
			1: function(){
				// console.log("set 1")
			},
			2: function(){
				// console.log("set 2")
				this.vertical = true;
				this.horizontal = true;
			},

			_: function(){
				return false;
			}
		},
		order: 0
	},

	//Orientation
	//? multidimensinal
	vertical: {
		value: false,
		values: {
			true: function(){
				if (this.dimensions === 1) this.horizontal === false
			},
			false: function(){
				if (this.dimensions === 1) this.horizontal === true
			}
		}
	},
	horizontal: {
		value: true,
		values: {
			true: function(){
				if (this.dimensions === 1) this.vertical === false
			},
			false: function(){
				if (this.dimensions === 1) this.vertical === true
			}
		}
	},

	min: {
		change: function(value){
			// console.log("set min", value)
			if (/,/.test(value)) return parseArray(value);
			// if (this.dimensions == 2)
		},
		order: 0
	},
	max: {
		change: function(value){
			// console.log("set max", value)
			if (/,/.test(value)) return parseArray(value);
		},
		order: 0
	},
	step: {
		//detect step automatically based on min/max range (1/100 by default)
		change: function(value){
			if (value === undefined) {
				//initial call
				var range;
				if (this.max.length == 2) {
					range = Math.abs(this.max[0] - this.min[0]);
				} else {
					range = Math.abs(this.max - this.min);
				}
				value = range <= 100 ? .01 : 1;
			}
			return value;
		},
		order: 2
	},

	//TODO Range
	//jquery-way
	range: true, //min, max

	//TODO Multiple values
	//? multidimensional multivalues?
	//jqueryui
	//NO: use just value as array
	//values: [a,b],

	//TODO snapping function: rigid/loose
	snap: false,
	//?or precision?

	//TODO: focusable, controllable
	keyboard: true,

	//TODO
	readonly: false,

	//TODO whether to repeat either by one axis if one dimension or by both axis or one pointed if two dimensions
	//false, true, [bool, bool]
	repeat: {
		value: false,
		change: function(repeat){
			if (this.picker) this.picker.repeat = repeat;
		}
	},

	isInput: {
		value: false,
		values: {
			false: {
				before: function(){
				},
				mousedown: function(e){
					//console.log("mousedown")
					this.picker.startDrag(e);
				},
				'window resize': function(){
					this.picker.updateLimits();
					this.updatePosition()
				}
			},

			true: {
				before: function(){
					console.log("input mode")
				},

				change: function(e){
					console.log("slidy change", this.value)
					e.preventDefault()
				}
			}
		}
	},

	//moves picker accordind to the value
	updatePosition: function(){
		var	$el = this,
			//relative coords to move picker to
			x = 0,
			y = 0,
			picker = $el.picker;

		if(!picker) return;

		var	lim = picker._limits,
			hScope = (lim.right - lim.left),
			vScope = (lim.bottom - lim.top)

		//console.log("upd position",$el.getAttribute("name"), $el.value)
		if ($el.dimensions == 2){
			var hRange = $el.max[0] - $el.min[0],
				vRange = $el.max[1] - $el.min[1],
				ratioX = ($el.value[0] - $el.min[0]) / hRange,
				ratioY = (- $el.value[1] + $el.max[1]) / vRange
			//console.log("2dim", ratioY, ratioX)
		} else if ($el.vertical){
			var vRange = $el.max - $el.min,
				ratioY = (- $el.value + $el.max) / vRange;
				ratioX = .5;
			//console.log("y", ratioY)
		} else {
			var hRange = $el.max - $el.min,
				ratioX = ($el.value - $el.min) / hRange;
				ratioY = .5;
			//console.log("x", ratioX)
		}
		if (ratioX !== undefined) $el.picker.x = ratioX * hScope - $el.picker.pin[0];
		if (ratioY !== undefined) $el.picker.y = ratioY * vScope - $el.picker.pin[1];
	}
}).register("slidy");


//TODO: <input type="slidy"/>
function handleDrag($el, e){
	//console.log("drag observed", e.target.dragstate);
	var thumb = e.currentTarget,
		d = thumb.dragstate,
		lim = thumb._limits,
		thumbW = thumb._offsets.width,
		thumbH = thumb._offsets.height,
		//scope sizes
		hScope = (lim.right - lim.left),
		vScope = (lim.bottom - lim.top)

	//TODO: optimize this part
	//calc value based on dragstate
	if ($el.dimensions === 2){
		var normalValue = [(thumb.x - lim.left) / hScope, ( - thumb.y + lim.bottom) / vScope];

		// console.log([
		// 	normalValue[0] * ($el.max[0] - $el.min[0]) + $el.min[0],
		// 	normalValue[1] * ($el.max[1] - $el.min[1]) + $el.min[1]
		// ])
		$el.value = [
			normalValue[0] * ($el.max[0] - $el.min[0]) + $el.min[0],
			normalValue[1] * ($el.max[1] - $el.min[1]) + $el.min[1]
		];

	} else if ($el.vertical){
		var normalValue = (- thumb.y + lim.bottom) / vScope;
		$el.value = normalValue * ($el.max - $el.min) + $el.min;
	} else {
		var normalValue = (thumb.x - lim.left) / hScope;
		$el.value = normalValue * ($el.max - $el.min) + $el.min;
	}

	//trigger onchange
	fire($el,"change")
};