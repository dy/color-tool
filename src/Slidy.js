/**
* Range input on steroids
*/
Mod.extend({
	//HTML5 things
	value: {
		value: 50,
		set: function(value, old){
			// console.log("slidy set value", value, old)
			if (value.length != this.dimensions) err("Value should be", this.dimensions + "-dimensional, passed", value );

			if (value.length === 2){
				var result = [];
				result[0] = round(between(value[0], this.min[0], this.max[0]), this.step)
				result[1] = round(between(value[1], this.min[1], this.max[1]), this.step)
				if (!result[0] && result[0] !== 0) result[0] = old[0];
				if (!result[1] && result[1] !== 0) result[1] = old[1];

				this.value = result;
			}

			var res = round(between(value, this.min, this.max), this.step);

			if (!res && res !== 0) err("Something went wrong in validating value", res)

			this.value = res;

			//console.log("slidy value changed", value, oldValue, this.value)
			this.updatePosition();
			this.fire("change")
		}
	},

	dimensions: {
		value: 1,
		//mutual with vertical/horizontal
		values: {
			1: function(){

			},
			2: function(){
				this.vertical = true;
				this.horizontal = true;
			},

			//TODO: any else - go back to 1/2
			_: function(){
				//TODO: return false prevents entering state
				return false;
			}
		}
	},

	//Orientation
	//? multidimensinal
	//dragdealer way
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

	//TODO: make name work not-interfering with native input
	name: {
		value: "",
		attribute: false
	},

	min: 0,
	max: 100,
	step: {
		//detect step automatically based on min/max range (1/100 by default)
		value: undefined,
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
		}
	},

	//whether to expose self data to document’s scope
	//for declarative bindings
	expose: true,

	//Range
	//jquery-way
	range: true, //min, max

	//Multiple values
	//? multidimensional multivalues?
	//jqueryui
	//NO: use just value as array
	//values: [a,b],

	//snapping function: rigid/loose
	snap: false,
	//?or precision?

	//focusable, controllable
	keyboard: true,

	readonly: false,

	//whether to repeat either by one axis if one dimension or by both axis or one pointed if two dimensions
	//false, true, [bool, bool]
	repeat: {
		value: false,
		change: function(repeat){
			this.picker.repeat = repeat;
		}
	},

	mode: {
		value: 'slider',
		values: {
			slider: {
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

			input: {
				before: function(){
					console.log("input mode")
				},

				change: function(e){
					e.preventDefault()
					console.log("slidy change", this.value)
				}
			}
		}
	},

	init: function(){
		// console.log("init slidy")

		//basic picker init
		var self = this;

		//watch for input element
		if (this.tagName === "INPUT") {
			this.on("change", function(){
				console.log("slidy-input change", this.value)
			})
		}

		this.picker = new Component.registry.Draggable({
			within: this,

			attached: function(e){
				//console.log("picker attached")
				//correct pin (centrize based on width of picker)
				this.pin = [this.offsets.width / 2, this.offsets.height / 2];
				//set initial position
				//console.log("picker ready", this.threshold)
				self.updatePosition();
			},

			//TODO: make it be last listener in listeners stack to be preventable within own component states
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

		if (this.tagName === "INPUT") this.state = "input";

		//additional picker init
		this.picker.axis = (this.dimensions === 2 ? null : (this.vertical ? 'y' : 'x'));
		this.appendChild(this.picker);
		this.picker.updateLimits();
		this.picker.fire("attached");
	},

	//moves picker accordind to the value
	updatePosition: function(){
		var	$el = this,
			//relative coords to move picker to
			x = 0,
			y = 0,
			picker = $el.picker,
			lim = picker.limits,
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
		lim = thumb.limits,
		thumbW = thumb.offsets.width,
		thumbH = thumb.offsets.height,
		//scope sizes
		hScope = (lim.right - lim.left),
		vScope = (lim.bottom - lim.top)

	//TODO: optimize this part
	//calc value based on dragstate
	if ($el.dimensions === 2){
		var normalValue = [(thumb.x - lim.left) / hScope, ( - thumb.y + lim.bottom) / vScope];

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
	$el.fire("change")
};