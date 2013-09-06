(function($){
	var $wnd = $(window),
		$doc = $(window.document),
		$body = $(window.document.body);

	var pluginName = "slideArea",
		className = "slide-area",
		cssPrefix = detectCSSPrefix();

	//Main plugin class
	function SlideArea(el, opts){
		this.$el = $(el);
		this.el = this.$el[0];
		this._create(opts)
	}

	SlideArea.prototype = {
		options: {
			pickers: 1, //could be custom pickers passed, each with it’s own settings

			//picker-specific options
			dimensions: 1, //how much values picker will get //TODO: replace with mapping fn
			direction: "right", //keywords or degrees //TODO: replace direction with custom function
			placingFn: null,
			mappingFn: null, //x,y → normalized l (or [l1, l2])
			transferFn: null, ///can pass array of functions for each coordinate
			step: 10,
			min: 0,
			max: 100,
			snap: false, //snap value to the grid
			rigidSnap: false, //whether to snap straightforward or smoother drop effect
			restrict: true, //whether to restrict picker moving area
			grid: false, //or array of grid coords to snap
			repeat: false, //whether to rotate infinity or cycle h/v scroll
			pickerClass: "",

			//shape: "", //triangle, circular, SVG-shape in basic case; 2d/1d is different classifier			
			readonly: false, //no events
			sniperSpeed: .25, //sniper key slowing down amt

			evSuffix: pluginName,
			//callbacks
			create: null,
			dragstart: null,
			drag: null,
			dragstop: null,
			destroy: null,
			change: null //picker callback
		},

		_create: function(opts){
			//init options
			this.options = $.extend({}, this.options);
			$.extend(this.options, this._parseDataAttributes(), opts);
			var o = this.options;

			//treat element
			this.$el = $(this.el);
			this.$el.addClass(className);

			//update element size
			var offset = this.$el.offset();
			this.top= offset.top;
			this.left= offset.left;
			this.height= this.el.clientHeight;
			this.width= this.el.clientWidth;
			this.center= {x: this.el.width * .5, y: this.el.height * .5};

			//create picker(s)
			this.pickers = [];
			var pNum = o.pickers.length || o.pickers; //whether number of pickers or init options
			for (var i = 0; i < pNum; i++){
				this.addPicker(o.pickers[i] || o);
			}

			//init drag state object
			this.dragstate = {
				x:0,
				y:0,
				difX: 0,
				difY: 0,
				pageX: 0,
				pageY: 0,
				picker: this.pickers[0] //current picker to drag				
			}

			//set up events
			this.evSuffix = "." + o.evSuffix;

			this._bindEvents();

			this.$el.trigger("create");
		},

		_parseDataAttributes: function() {
			var data = {}, v, el = this.el;
			if (el.dataset) {
				for (var prop in el.dataset) {
					if (el.dataset[prop] === "true" || el.dataset[prop] === "") {
						data[prop] = true;
					} else if (el.dataset[prop] === "false") {
						data[prop] = false;
					} else if ((v = parseFloat(el.dataset[prop])) !== NaN) {
						data[prop] = v;
					} else {
						data[prop] = el.dataset[prop];
					}
				}
			} else {
				Array.prototype.forEach.call(el.attributes, function(attr) {
					if (/^data-/.test(attr.name)) {
						var camelCaseName = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {
							return $1.toUpperCase();
						});
						data[camelCaseName] = attr.value;
					}
				});
			}
			return data;
		},

		//add new picker
		addPicker: function(opts){
			var el = document.createElement("div"); //TODO
			el.className = this.options.pickerClass;

			this.pickers.push(new Picker(el, this, opts));
			this.el.appendChild(el);
		},

		_bindEvents: function(){
			var o = this.options;
			this.$el.on("mousedown", this._dragstart.bind(this));
		},

		_dragstart: function(e){
			var o = this.options;

			//init dragstate
			this.dragstate.x = e.pageX - this.left,
			this.dragstate.y = e.pageY - this.top,
			this.dragstate.difX = 0;
			this.dragstate.difY = 0;
			this.dragstate.isCtrl = e.ctrlKey
			this.dragstate.pageX = e.pageX; 
			this.dragstate.pageY = e.pageY;
			this.dragstate.picker = this._findClosestPicker(this.dragstate.x, this.dragstate.y);			
			this.dragstate.picker.dragstart(this.dragstate);

			this.$el.addClass("dragging");

			//bind moving
			$doc.on("selectstart" + this.evSuffix, function(){return false})
			.on("mousemove" + this.evSuffix, this._drag.bind(this))
			.on("mouseup" + this.evSuffix, this._dragstop.bind(this))
			.on("mouseleave" + this.evSuffix, this._dragstop.bind(this))
		},

		_drag: function(e){
			//NOTE: try not to find out picker offset throught style/etc, instead, update it’s coords based on event obtained			
			var o = this.options;

			this.dragstate.isCtrl = e.ctrlKey;
			this.dragstate.difX = e.pageX - this.dragstate.pageX;
			this.dragstate.difY = e.pageY - this.dragstate.pageY;
			if (e.ctrlKey) {
				this.dragstate.difX *= o.sniperSpeed;
				this.dragstate.difY *= o.sniperSpeed;
			}
			this.dragstate.x += this.dragstate.difX;
			this.dragstate.y += this.dragstate.difY;
			this.dragstate.pageX = e.pageX; 
			this.dragstate.pageY = e.pageY; 
			
			this.dragstate.picker.drag(this.dragstate);
		},

		_dragstop: function(e){
			//Move picker to the final value (snapped, rounded, limited etc)
			this.dragstate.picker.update();

			this.$el.removeClass("dragging");

			//unbind events
			$doc.off("mousemove" + this.evSuffix)
			.off("selectstart" + this.evSuffix)
			.off("mouseup" + this.evSuffix)
			.off("mouseleave" + this.evSuffix)
		},

		//get picker closest to the passed coords
		_findClosestPicker: function(x, y){
			var minL = 9999, closestPicker;
			for (var i = 0; i < this.pickers.length; i++){
				var picker = this.pickers[i],
					w = x - picker.left,
					h = y - picker.top,
					l = Math.sqrt(w*w + h*h);
				if (l < minL){
					minL = l;
					closestPicker = i;
				}
			}
			return this.pickers[closestPicker];
		},

		//set pickers reflect their’s real values
		updatePickers: function(){
			for (var i = 0; i < this.pickers.length; i++){
				this.pickers[i].update();
			}
		}
	}


	/* Picker class - a picker controller.
	Moved out to the external class because of has too much own properties.
	NOTE: experimental class architecture:
	- parent passed instead of target element
	- options contained right on the element itself, w/o options object 
	*/
	function Picker(el, container, opts){
		this.el = el;
		this.container = container;
		this._create(opts);
	}

	//Static
	$.extend(Picker, {
		//Functions of placing picker based on dragstate
		//Main value-forming function: value is obtained based on new picker coords defined by this function
		//?should return picker coords
		placingFn: {
			circular: function(){

			},
			conical: function(){

			},
			rectangular: function(x,y, picker){
				var to = {},
					container = picker.container,
					o = picker.options;

				//test bounds
				switch (o.direction){
					case "top":
					case "bottom":
						if (y <= 0){
							to.y = 0;
						} else if (y >= container.height){
							to.y = container.height;				
						} else {
							to.y = y;
							to.y = limit(to.y, 0, container.height);
						}
						break;
					case "left":
					case "right":
						if (x <= 0){
							to.x = 0;
						} else if (x >= container.width){
							to.x = container.width;				
						} else {
							to.x = x;
							to.x = limit(to.x, 0, container.width);
						}
						break;
				}

				return to;
			},
			free: function(){

			},
			repeat: function(x, y, picker){
				var to = {},
					container = picker.container,
					o = picker.options,
					tx = x % container.width,
					ty = y % container.height

				tx += (tx < 0 ? container.width : 0)
				ty += (ty < 0 ? container.height : 0)

				switch (o.direction){
					case "top":
					case "bottom":
						to.y = ty;
						break;
					case "left":
					case "right":
						to.x = tx;
						break;
				}

				return to;
			}
		},

		//Transforms picker & element to the l value, or couple of l for multiple dimensions.
		//l is normalized value [0..1] reflecting picker position within the area.
		//Area can be an SVG of any shape or element
		//picker & area - class instances, not DOM-elements
		//out == based on l passed set coords of picker
		//NOTE: 2d can be passed in options
		mappingFn: {
			linear: {
				toL: function(picker){
					var l = 0,
						o = picker.options,
						container = picker.container;
					switch(o.direction){
						case "top":
							l = 1 - picker.top / container.height;
							break
						case "bottom":
							l = picker.top / container.height;
							break;
						case "left":
							l = 1 - picker.left / container.width;
							break;
						case "right":
							l = picker.left / container.width;
							break;
						default: //degrees case
							//TODO: calc degrees
					}
					return l;
				},
				fromL: function(l, picker){
					picker.left = l * picker.container.width;
					picker.top = l * picker.container.height;
				}
			},
			polar: {
				toL: function(picker){
					//TODO
					throw "unimplemented"
				},
				fromL: function(picker){
					//TODO
					throw "unimplemented"
				}
			},
			svg: {
				to: function(){

				},
				from: function(){

				}
			}
		},

		//Transforms normalized l passed to the target value and vice-versa
		//moved out of mappingFn cause to combine with mappingFn and cause 
		transferFn: {
			linear: {
				toValue: function(l, o){
					v = l * (o.max - o.min) + (o.min);
					return v;
				},
				fromValue: function(value, o){
					return (value + o.min) / (o.max - o.min);
				}
			},

			quadratic: {
				toValue: function(){

				},
				fromValue: function(){

				}
			},

			cubic: function(){
				//TODO
			},

			logarithmic: function(){
				//TODO
			}
		}
	})

	//Prototype
	Picker.prototype = {
		options: {
			dimensions: 1, //how much values picker will get //TODO: replace with mapping fn
			direction: "right", //keywords, degrees or array of ones //TODO: replace direction with custom function
			placingFn: null,
			mappingFn: null, //x,y → normalized l (or [l1, l2])
			transferFn: null, //can pass array of functions for each coordinate
			step: 10,
			min: 0,
			max: 100,
			value: 0,
			snap: false, //snap value to the grid
			rigidSnap: false, //whether to snap straightforward or smoother drop effect
			restrict: true, //whether to restrict picker moving area
			grid: false, //or array of grid coords to snap
			repeat: false, //whether to rotate infinity or cycle h/v scroll
			altPicker: null //pickers changing values along with one
		},

		_create: function(opts){
			//make options contained in this
			var o = $.extend({}, this.options);
			this.options = $.extend(o, opts);

			//init picker element
			this.$el = $(this.el);

			//prevent existing picker from appending classes etc second time
			if (this.el.getAttribute("data-sa-picker")){
				//case of adjacent picker
				this.$el.addClass("slide-area-alt-picker");
				this.isAdjacent = true;
			} else {
				this.$el.addClass("slide-area-picker");
				this.el.setAttribute("data-sa-picker", true);
				this.isAdjacent = false;
			}

			//make adjacent pickers
			if (o.altPicker){
				this.altPicker = new Picker(this.el, this.container, o.altPicker);
			}

			//setup placing fn
			if (!o.placingFn){
				if (o.repeat){
					o.placingFn = Picker.placingFn.repeat;
				} else {
					o.placingFn = Picker.placingFn.rectangular;
				}
			}

			//setup mapping fn
			if (!o.mappingFn){
				o.mappingFn = Picker.mappingFn.linear;
			}

			//setup transfer fn
			if (!o.transferFn){
				o.transferFn = Picker.transferFn.linear;
			}

			//init coords based on value passed
			this.top = this.container.height * .5;
			this.left = this.container.width * .5;
			//TODO: better init with default value, not the middle of container 

			//init element
		},

		//move, changevalue and trigger changing
		//x & y are coords relative to sliding area
		to: function(x, y){
			var str = "translate3d(",
				to = this.options.placingFn(x, y, this);

			if (this.altPicker){
				//console.log(to)
				$.extend(to, this.altPicker.options.placingFn(x, y, this.altPicker));
				//console.log(to)
			}

			if (to.y !== undefined) this.top = to.y;
			if (to.x !== undefined) this.left = to.x;

			str += this.left + "px," + this.top + "px, 0)";
			this.el.style[cssPrefix + "transform"] = str;

			this.value = this._calcValue(this.top, this.left);

			if (this.altPicker){
				this.altPicker.top = this.top;
				this.altPicker.left = this.left;
				this.altPicker.value = this.altPicker._calcValue(this.top, this.left);
			}

			this._trigger("change", [{
				value: this.value,
				altValue: this.altPicker && this.altPicker.value,
				picker: this,
				altPicker: this.altPicker,
				container: this.container,
				options: this.o
			}]);

			return to;
		},

		//make position reflect value
		update: function(){

		},

		dragstart: function(dragstate){
			this.to(dragstate.x, dragstate.y)			
		},

		drag: function(dragstate){
			this.to(dragstate.x, dragstate.y)
		},

	
		_trigger: function(evName, args){
			this.$el.trigger(evName, args);
			if (this.options[evName]) this.options[evName].apply(this, args);
			if (this.container.options[evName]) this.container.options[evName].apply(this, args);
		},


		//returns value from current coords
		_calcValue: function(x, y){
			var o = this.options,
				l = .0; //length of the value [0..1]
				//TODDO: calc multiple pickers

			//get normalized(not necessary) value
			l = o.mappingFn.toL(this);

			//apply transfer function
			return o.transferFn.toValue(l, o);
		},

		getValue: function(){
			return this.value;
		},

		setValue: function(value){
			var o = this.options;
			this.value = value;
			this.l = o.transferFn.out(value);
			o.mappingFn.from(l);
		},

		value: function(value){
			if (value !== undefined) this.setValue(value);
			else this.getValue();
		}
	}




	//Plugin
	$.fn[pluginName] = function (arg) {
		var $el = $(this),
			instance = new SlideArea($el, $.extend($el[0], arg));
		$el.data(pluginName, null);
		$el.data(pluginName, instance);
		return instance;
	}

	$.SlideArea = SlideArea;


	//stupid prefix detector
	function detectCSSPrefix(){
		var style = document.defaultView.getComputedStyle(document.body, "");
		if (style["transform"]) return "";
		if (style["-webkit-transform"]) return "-webkit-";
		if (style["-moz-transform"]) return "-moz-";
		if (style["-o-transform"]) return "-o-";
		if (style["-khtml-transform"]) return "-khtml-";
		return "";
	}

	//simple math limiter
	function limit(v, min, max){
		return Math.max(min, Math.min(max, v));
	}


})(window.jQuery || window.Zepto);