/*
 * Jquery color picker plugin.
 * Used as convenient creator of color picker (easy interface for Manager.js).
 * Besides, creates jquery-plugin.
 * Depends on whether jquery.color or jquery.color-like API color object (Color.js form graphics.js)
 * Author: Ivanov Dmitry.
 * Copyright: sep 2012.
 * License: MIT.
 */
 (function($){	
	var $wnd = $(window),
		$doc = $(window.document),
		$body = $(window.document.body);

	var pluginName = "cpicker",
		cssPrefix = detectCSSPrefix("transform"),
		Color = $.Color || G.Color || Color;

	//Color picker itself
	function ColorPicker(el, o){
		this.$el = $(el);
		this.el = this.$el[0];
		return this._create(o);
	}

	//Area renderers — returns fully composed html string
	ColorPicker.areas = {
		//TODO: create layers somewhere else, use only update method;
		"hl": {
			options: {
				min: 0,
				max: 360,
				value: 0,
				step: 1,
				repeat: true,
				direction: "right",
				component: "hue",
				altPicker: {
					min: 0,
					max: 1,
					value: .5,
					direction: "top",
					component: "lightness"
				}
			},
			create: function(el, o){
				var hLayer = document.createElement("div"),
					lLayer = hLayer.cloneNode();

				el.hidden = true;

				//create hue layer
				hLayer.className = pluginName + "-layer h-layer";
				hLayer.setAttribute("data-component", "h");
				ColorPicker.areas["h"].create(hLayer, o);


				//create lightness layer
				lLayer.className = pluginName + "-layer l-layer";
				lLayer.setAttribute("data-component", "l");
				ColorPicker.areas["l"].create(lLayer, o);

				el.appendChild(hLayer);
				el.appendChild(lLayer);

				el.removeAttribute("hidden");

			},
			//rerenders area based on value of component passed
			update: function(el, o){
				ColorPicker.areas["h"].update(el.firstChild, o)
				ColorPicker.areas["l"].update(el.childNodes[1], o)
			},
		},
		"h": {
			options: {
				component: "hue",
				min: 0,
				max: 360,
				repeat: true,
				value: 0
			},
			create: function(el, o){
				this.update(el, o)
			},
			update: function(el, o){
				var grSteps = 6, //6,12,24,36, 72 is optimal. 6 is better.
					grStr = '', 
					hueStep = 360/grSteps,
					sat = (o.color.saturation()*100) + '%',
					al = o.color.alpha();

				for (var i = 0; i<= grSteps; i++){
					grStr+='hsla(' + (hueStep*i).toFixed(4) + ',' + sat + ', 50%, ' + al + ') '+((100/grSteps*i)).toFixed(2)+'%, '
				};

				grStr = 'linear-gradient(left, ' + grStr.slice(0,-2) + ')';
				el.style.background = cssPrefix + grStr;
			}
		},
		"l": {
			options:{
				component: "lightness",
				min: 0,
				max: 1,
				value: .5,
			},
			//TODO: create and update are the same
			create: function(el, o){
				this.update(el, o)
			},
			update: function(el, o){
				var lStr = 'linear-gradient(top, ' + 
					'rgba(255,255,255,' + o.color.alpha() +') 0%, ' +
					'rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, ' + 
					'rgba(0,0,0,' + o.color.alpha() + ') 100%)';
				el.style.background = cssPrefix + lStr
			}
		},
		"s": {
			options: {
				component: "saturation",
				min: 0,
				max: 1,
				value: .5,
				direction: "right"
			},
			create: function(el, o){
				this.update(el, o)
			},

			update: function(el, o){
				var l = (o.color.lightness()*100),
					h = o.color.hue(),
					sStr = cssPrefix;

				sStr += 'linear-gradient(right, ';
				
				sStr += 'hsla(' + h + ', 100%, ' + l.toFixed(2) + '%, '+ o.color.alpha() + ') 0%, '
				sStr += 'hsla(' + h + ', 0%, ' + l.toFixed(2) + '%, '+ o.color.alpha() + ') 100%) ';

				el.style.background = sStr
			}
		},

		"a": {
			options: {
				direction: "top",
				min: 0,
				max: 1,
				value: 1,
				component: "alpha"
			},
			create: function(el, o){
				this.update(el, o)
			},
			update: function(el, o){
				var bgStr = cssPrefix,
					l = (o.color.lightness()*100),
					h = o.color.hue(),
					s = o.color.saturation() * 100

				bgStr += "linear-gradient( bottom, ";
				bgStr += "hsla(" + h + ', ' + s + '%, ' + l + "%, " + "0) 0%," 
				bgStr += "hsla(" + h + ', ' + s + '%, ' + l + "%, " + "1) 100%)"

				el.style.background = bgStr
			}
		}
	}

	ColorPicker.prototype = {		
		options: {
			color:null,//Color object
			colorStack:['none', 'white', 'black', 'rgba(0,0,0,0)'],//TODO - stack of usedColors
			mode: "hl", //simple list of modes to automatically implement
			targets: null, //List of targets to apply value

			//Callbacks
			show:null,
			hide:null,
			dragStart:null,
			drag:null,
			dragStop:null,
			resize:null,
			change:null
		},


		//Create neccessary structure
		_create: function(opts){
			//init options
			this.options = $.extend({}, this.options);
			$.extend(this.options, this._parseDataAttributes(), opts);
			var o = this.options;

			this.$el.addClass(pluginName)

			//init color
			//o.color = new Color(this.$el.val() || this.$el.data('color') || this.el.innerHTML || "hsla");
			o.color = new Color({ hue: 0, saturation: .5, lightness: .5, alpha: 1 })

			//init list of areas
			this.slideAreas = {}; //key-defined
			this._createAreas(o.areas);

			this._bindEvents();

			this.$el.trigger('create');

			return self;
		},

		_createAreas: function(areas){
			var o = this.options,
				areasOptions = areas || o.areas;

			for (var key in areas){
				var areaEl = document.createElement("div"),
					areaObject = ColorPicker.areas[key],
					areaOptions = $.extend({}, areaObject.options); //options to init sliding area with

				$.extend(areaOptions, areasOptions[key].options); //extend with custom options
				
				areaOptions.pickerClass = pluginName + "-picker"
				areaOptions.key = key
				areaOptions.change = this._updateColor.bind(this);

				areaEl.className = key + "-area " + pluginName + "-area";

				areaObject.create.call(areaObject, areaEl, o);

				this.el.appendChild(areaEl);
				
				this.slideAreas[key] = new $.SlideArea(areaEl, areaOptions);
			}

		},

		//set color from the data returned from a picker
		_updateColor: function(data){
			var o = this.options;
			var component = data.picker.options.component,
				value = data.value,
				altComponent = data.altPicker && data.altPicker.options.component,
				altValue = data.altValue;

			this.options.color = this.options.color[component](data.value);
			if (altComponent) this.options.color = this.options.color[altComponent](data.altValue);

			//it should update all areas except the changed one
			for (var key in this.slideAreas){
				if ( key !== data.picker.options.key ) { this.updateArea(key); }
			}
			this.updatePickers()
		},

		//updates only specific area
		updateArea: function(key){
			var o = this.options;
			ColorPicker.areas[key].update.call(ColorPicker.areas[key], this.slideAreas[key].el, o);
		},

		updatePickers: function(){
			var o = this.options,
				bgStr = o.color.toHslaString();
			//console.log(bgStr)
			for (var key in this.slideAreas){
				this.slideAreas[key].pickers[0].el.style.background = bgStr;
			}
		},

		//parse el’s data-attrs
		_parseDataAttributes: function() {
			var data = {}, v, el = this.el;
			if (el.dataset) {
				for (var prop in el.dataset) {
					if (el.dataset[prop] === "true" || el.dataset[prop] === "") {
						data[prop] = true;
					} else if (el.dataset[prop] === "false") {
						data[prop] = false;
					} else if (v = parseFloat(el.dataset[prop])) {
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


		//binds events to target elements
		_bindEvents: function(){
			this.$el.on("change", ".area", function(e, value, picker){
				//console.log(value);
			})
			return self;
		},

		/* API */
		//TODO: make setter
		//Changes model & moves pickers
		set: function(arg) {
			var o = this.options;

			o.color.set(arg);

			return this.refresh();
		},


		/* Rendering */
		refresh: function() {
			var o = this.options;
			return this.updateAreas();
		},

		//
		
	}


	//Plugin
	$.fn[pluginName] = function(opts){
		return this.each(function(i,e){
			var $e = $(e);
			if ($e.data(pluginName)) return;

			$e.data(pluginName, new ColorPicker($e, opts));
		});
	};


	//init all pickers
	$(function(){
		$('.' + pluginName)[pluginName]();
	});


})(window.jQuery || window.Zepto)