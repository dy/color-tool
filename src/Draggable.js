//TODO: make ghost insteadof moving self
var Draggable = Mod.extend({
	init: function(){
	},

	created: function(){
		disableSelection(this);
		// console.log("draggable created")
	},

	attached: function(){
		//ensure pin correctness
		// console.log("draggable attached")
		if (this.pin[2] === 0){
			// console.log("draggable attached")
			// this.pin = [0,0,this.offsetWidth, this.offsetHeight];
		}
	},

	//how many pixels to omit before switching to drag state
	threshold: {
		//Number/Array[w,h]/Array[x,y,x,y]/function (custom shape)
		value: 12
	},

	//whether to autoscroll on reaching the border of the screen
	autoscroll: false,

	//null is no restrictions
	within: {
		value: root,
		change: function(within){
			// console.log("within change", within )
			// console.log(within, this.within, this.parentNode)
			if (within instanceof Element){
				this.within = within
			} else if (typeof within === "string"){
				this.within = parseTarget(this,within)
			} else {
				this.within = root
			}
		},
		order: 0
	},

	//which area of draggable should not be outside the restriction area
	//by default it’s whole draggable rect
	pin: {
		value: [],
		change: function(value){
			// console.log("pin changed", value)
			try {
				if (value.length === 2){
					value = [value[0], value[1], value[0], value[1]];
				} else if (value.length === 4){
				} else {
					throw new Error
				}
			} catch (e){
				value = [0,0,this.offsetWidth, this.offsetHeight]
			}
			// console.log(value)

			this.pin = value;

			this.updateLimits();
		}
	},

	//TODO: draggable/droppable match identifier
	group: null,

	//TODO: clone object for dragging
	ghost: false,

	//TODO: use translate3d method or position displacement
	translate3d: true,

	//to what extent round position
	precision: {
		value: 1,
		order: 0
	},

	//slow down movement by pressing ctrl
	sniper: true,

	//how much slower sniper drag is
	sniperSpeed: .15,

	//false, 'x', 'y'
	axis: {
		value: null,
		values: {
			x: 'x',
			y: 'y',
			null: null,
			_: null
		}
	},

	//repeat position by one of axis
	repeat: {
		values: {
			undefined: null,
			both: null,
			x: null,
			y: null,
			_: function(){
				//TODO
				//vector passed
				if (this.repeat instanceof Array){
					if (this.repeat.length){
						if (this.repeat[0] && this.repeat[1])
							return "both";
						else if (this.repeat[0])
							return "x";
						else if (this.repeat[1])
							return "y";
					}

				//just repeat any possible way
				} else if (this.repeat === true){
					return this.axis

				//unrecognized value passed
				} else {
					return undefined;
				}
			}
		}
	},

	//position
	x: {
		value: 0,
		change: function(value, old){
			// console.log("set x", value, old)
			if (this.repeat === 'both' || this.repeat === 'x'){
				//mind repeat
				if (value < this._limits.left){
					value += this._limits.right - this._limits.left;
				} else if (value > this._limits.right){
					value -= this._limits.right - this._limits.left;
				}
			} else if (!this.axis || this.axis === "x"){
				//mind axis
				value = between(value,
					this._limits.left,
					this._limits.right);
			} else {
				//ignore change
				return 0;
			}
			this.x = round(value, this.precision)

			updatePosition(this)
		},
		order: 1
	},
	y: {
		value: 0,
		change: function(value, old){
			// console.log("set y", value, this._limits)
			if (this.repeat === 'both' || this.repeat === 'y'){
				//mind repeat
				if (value < this._limits.top){
					value += this._limits.bottom - this._limits.top;
				} else if (value > this._limits.bottom){
					value -= this._limits.bottom - this._limits.top;
				}
			} else if (!this.axis || this.axis === "y"){
				// console.log("axis", this._limits)
				//mind axis
				value = between(value,
					this._limits.top,
					this._limits.bottom);
			} else {
				//ignore change
				return 0;
			}

			this.y = round(value, this.precision)

			updatePosition(this);
		},
		order: 1
	},

	//use native drag
	native: {
		//is native drag supported
		value: (function(){
			var div = document.createElement("div")
			var isNativeSupported = ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
			return isNativeSupported
		})() && false,
		change: function(value, oldValue){
			// console.log("set native to", value, oldValue)
			if (value === false && this.dragstate === "native"){
				this.dragstate = "idle";
			} else if (value === true && this.dragstate !== "init") {
				this.dragstate = "native";
			}
		},
		order: 8
	},


	//main draggable state reflector
	dragstate: {
		value: "idle",
		values: {
			//non-native drag
			idle: {
				before: function(){
					//go native
					if (this.native) this.dragstate = "native";
				},

				mousedown: function(e){
					// console.log("ready click")
					this.updateLimits();
					initDragparams(this, e);
					this.dragstate = "threshold";
				}
			},

			//when element clicked but drag threshold hasn’t passed yet
			threshold: {
				before: function(){
					// console.log("ts before")
					fire(this, "threshold")
				},
				after: function(){
					//console.log("ts after")
				},
				'document mousemove': function(e){
					// console.log("move in", this.threshold)
					var difX = (e.clientX - this._dragparams.initX);
					var difY = (e.clientY - this._dragparams.initY);

					//if threshold passed - go drag
					if (thresholdPassed(difX, difY, this.threshold)) {
						fire(this, 'dragstart', null, true)
						this.startDrag(e);
					}
				},
				'document mouseup, document mouseleave': function(e){
					this.dragstate = "idle";
				},
				'document selectstart': preventDefault
			},

			drag: {
				before: function(){
					//handle CSSs
					disableSelection(this.within)
					// console.log("drag before")
				},
				after: function(){
					enableSelection(this.within)
				},
				'document selectstart': preventDefault,
				'document mousemove': function(e){
					this.doDrag(e)
					fire(this, 'drag', null, true)
				},
				'document mouseup, document mouseleave': function(e){
					this.stopDrag(e);
					fire(this, 'dragend', null, true);
					this.dragstate = "idle"
				}
			},

			//when scrolled to the edge of the screen
			scroll: {

			},
			//when hovered on technical elements
			tech: {

			},
			out: {

			},

			//native drag
			native: {
				before: function(){
					// console.log("draggable before native")
					//hang proper styles
					css(this, {
						"user-drag": "element",
						"cursor": "pointer!important"
					})

					//make restricting area allowable to drop
					on(this.within, 'dragover', setDropEffect)
				},
				after: function(){
					//console.log("after native")
					css(this, "user-drag", "none");
					off(this.within, 'dragover', setDropEffect)
				},

				dragstart:  function(e){
					//console.log("native dragstart")
					this.startDrag(e);
					e.dataTransfer.effectAllowed = 'all';

					//hook drag image stub (native image is invisible)
					this.$dragImageStub = document.createElement('div');
					this.parentNode.insertBefore(this.$dragImageStub, this);
					e.dataTransfer.setDragImage(this.$dragImageStub, 0, 0);
				},
				dragend:  function(e){
					this.stopDrag(e);

					//remove drag image stub
					this.$dragImageStub.parentNode.removeChild(this.$dragImageStub);
					delete this.$dragImageStub;
				},
				drag:  function(e){
					//ignore final native drag event
					if (e.x === 0 && e.y === 0) return;

					//ignore zero-movement
					if (this._dragparams.clientX === e.clientX && this._dragparams.clientY === e.clientY) return e.stopImmediatePropagation();

					this.doDrag(e);
					//this.ondrag && this.ondrag.call(this);
				},
				dragover: setDropEffect
			}
		}
	},

	//starts drag from event passed
	startDrag: function(e){
		//define limits
		this.updateLimits();

		var d = this._dragparams;

		var offsetX, offsetY,
			//event absolute coords
			eAbsoluteX = e.clientX + window.pageXOffset,
			eAbsoluteY = e.clientY + window.pageYOffset;

		//if drag started outside self area - move self to that place
		if (
			!isBetween(eAbsoluteX, this._offsets.left, this._offsets.right) ||
			!isBetween(eAbsoluteY, this._offsets.top, this._offsets.bottom)
		) {
			//d is not always undefined here
			if (d) {
				//if threshold crossed outside self
				offsetX = d.offsetX + e.clientX - d.initX
				offsetY = d.offsetY + e.clientY - d.initY
			} else {
				//no threshold state (drag started from outside)
				//pretend as if offsets within self are ideal
				offsetX = this._offsets.width * .5;
				offsetY = this._offsets.height * .5;
			}
			//console.log("outside")

			//move to that new place
			if (!this.axis || this.axis === "x")
				this.x = eAbsoluteX - this.oX - offsetX;
			if (!this.axis || this.axis === "y")
				this.y = eAbsoluteY - this.oY - offsetY;

			//pretend as if drag has happened
			d = initDragparams(this, {
				offsetX: offsetX,
				offsetY: offsetY,
				clientX: e.clientX,
				clientY: e.clientY
			})
			fire(this, 'dragstart', null, true)

			fire(this, 'drag', null, true)
		} else {
			// console.log("inside")
			if (!d) d = initDragparams(this, e);
			offsetX = e.pageX - this._offsets.left;
			offsetY = e.pageY - this._offsets.top;
		}

		//previous mouse vp coords
		d.clientX = e.clientX;
		d.clientY = e.clientY;

		//offset within self
		d.offsetX = offsetX;
		d.offsetY = offsetY;

		//relative coords (from initial(zero) position)
		d.x = eAbsoluteX - this.oX;
		d.y = eAbsoluteY - this.oY;
		// console.log(d.x)

		//sniper run distances
		d.sniperRunX = 0;
		d.sniperRunY = 0;

		if (this.dragstate !== "native") {
			this.dragstate = "drag";
		}
	},

	doDrag: function(e) {
		//console.log("drag", e)
		var d = this._dragparams;

		var difX = e.clientX - d.clientX;
		var difY = e.clientY - d.clientY;

		d.clientX = e.clientX;
		d.clientY = e.clientY;

		//capture dragstate
		d.isCtrl = e.ctrlKey;
		if (e.ctrlKey && this.sniper) {
			if (isBetween(this.x, this._limits.left, this._limits.right))
				d.sniperRunX += difX * (1 - this.sniperSpeed)
			if (isBetween(this.y, this._limits.top, this._limits.bottom))
				d.sniperRunY += difY * (1 - this.sniperSpeed)
		}
		d.x = e.clientX + window.pageXOffset - this.oX;
		d.y = e.clientY + window.pageYOffset - this.oY;

		//move according to dragstate
		this.x = d.x - d.offsetX - d.sniperRunX;
		this.y = d.y - d.offsetY - d.sniperRunY;
		// console.log(this.x, d.x - d.offsetX - d.sniperRunX)

		//if within limits - move buy difX
		// this.x += difX;
		// this.y += difY;
	},

	stopDrag: function(e){
		// console.log("stopDrag")
		delete this._dragparams;
	},


	//updates movement restrictions
	updateLimits: function(){

		if (!this.isAttached) return;

		//it is here because not always element is in DOM when constructor inits
		var limOffsets = offsets(this.within);
		// console.log("upd limits", limOffsets)

		this._offsets = offsets(this);

		var selfPads = paddings(this.within);

		//save relative coord system offsets
		this.oX = this._offsets.left - this.x;
		this.oY = this._offsets.top - this.y
		var pin = this.pin;

		//pinArea-including version
		this._limits.top = limOffsets.top - this.oY + selfPads.top - pin[1];

		this._limits.bottom = limOffsets.bottom - this.oY - this._offsets.height - selfPads.bottom + (this._offsets.height - pin[3]);

		this._limits.left = limOffsets.left - this.oX + selfPads.left - pin[0];

		this._limits.right = limOffsets.right - this.oX - this._offsets.width - selfPads.right + (this._offsets.width - pin[2]);

	},

	//movement restrictions
	_limits: {
		top: 0,
		left: 0,
		bottom: 0,
		right: 0
	},

	_offsets: {
		top: 0,
		left: 0,
		bottom: 0,
		right: 0
	},

	'window resize': function(){
		this.updateLimits();
	}
}).register("draggable");






//set displacement according to the x & y
function updatePosition($el){
	css($el, "transform", ["translate3d(", $el.x, "px,", $el.y, "px, 0)"].join(""));
	// console.log(["translate3d(", $el.x, "px,", $el.y, "px, 0)"].join(""))
}

//native-drag helper
function setDropEffect(e){
	e.preventDefault()
	e.dataTransfer.dropEffect = "move"
	return false;
}

//threshold passing checker
function thresholdPassed(difX, difY, threshold){
	if (typeof threshold === "number"){
		//straight number
		if (Math.abs(difX) > threshold *.5 || Math.abs(difY) > threshold*.5){
			return true
		}
	} else if (threshold.length === 2){
		//Array(w,h)
		if (Math.abs(difX) > threshold[0]*.5 || Math.abs(difY) > threshold[1]*.5) return true;
	} else if(threshold.length === 4){
		//Array(x1,y1,x2,y2)
		if (!isBetween(difX, threshold[0], threshold[2]) || !isBetween(difX, threshold[1], threshold[3]))
			return true;
	} else if (typeof threshold === "function"){
		//custom threshold funciton
		return threshold(difX, difY);
	}
	return false;
}

//dragstate init
function initDragparams($el, e){
	if (!$el._dragparams) $el._dragparams = {};
	$el._dragparams.initX = e.clientX
	$el._dragparams.initY = e.clientY
	$el._dragparams.offsetX = e.pageX - $el._offsets.left
	$el._dragparams.offsetY = e.pageY - $el._offsets.top;
	return $el._dragparams;
}