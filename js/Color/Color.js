"use strict";

function Color(){
	this._create.apply(this, arguments);
}

G.Color = Color;


//Static
G.extend(Color, {

	//Almost all known color names
	names: {
		aqua: [0, 255, 255],
		black: [0, 0, 0],
		blue: [0, 0, 255],
		fuchsia: [255, 0, 255],
		gray: [128, 128, 128],
		green: [0, 128, 0],
		lime: [0, 255, 0],
		maroon: [128, 0, 0],
		navy: [0, 0, 128],
		olive: [128, 128, 0],
		purple: [128, 0, 128],
		red: [255, 0, 0],
		silver: [192, 192, 192],
		teal: [0, 128, 128],
		white: [255, 255, 255],
		yellow: [255, 255, 0],
		aliceblue: [240, 248, 255],
		antiquewhite: [250, 235, 215],
		aquamarine: [127, 255, 212],
		azure: [240, 255, 255],
		beige: [245, 245, 220],
		bisque: [255, 228, 196],
		blanchedalmond: [255, 235, 205],
		blueviolet: [138, 43, 226],
		brown: [165, 42, 42],
		burlywood: [222, 184, 135],
		cadetblue: [95, 158, 160],
		chartreuse: [127, 255, 0],
		chocolate: [210, 105, 30],
		coral: [255, 127, 80],
		cornflowerblue: [100, 149, 237],
		cornsilk: [255, 248, 220],
		crimson: [220, 20, 60],
		cyan: [0, 255, 255],
		darkblue: [0, 0, 139],
		darkcyan: [0, 139, 139],
		darkgoldenrod: [184, 134, 11],
		darkgray: [169, 169, 169],
		darkgreen: [0, 100, 0],
		darkgrey: [169, 169, 169],
		darkkhaki: [189, 183, 107],
		darkmagenta: [139, 0, 139],
		darkolivegreen: [85, 107, 47],
		darkorange: [255, 140, 0],
		darkorchid: [153, 50, 204],
		darkred: [139, 0, 0],
		darksalmon: [233, 150, 122],
		darkseagreen: [143, 188, 143],
		darkslateblue: [72, 61, 139],
		darkslategray: [47, 79, 79],
		darkslategrey: [47, 79, 79],
		darkturquoise: [0, 206, 209],
		darkviolet: [148, 0, 211],
		deeppink: [255, 20, 147],
		deepskyblue: [0, 191, 255],
		dimgray: [105, 105, 105],
		dimgrey: [105, 105, 105],
		dodgerblue: [30, 144, 255],
		firebrick: [178, 34, 34],
		floralwhite: [255, 250, 240],
		forestgreen: [34, 139, 34],
		gainsboro: [220, 220, 220],
		ghostwhite: [248, 248, 255],
		gold: [255, 215, 0],
		goldenrod: [218, 165, 32],
		greenyellow: [173, 255, 47],
		grey: [128, 128, 128],
		honeydew: [240, 255, 240],
		hotpink: [255, 105, 180],
		indianred: [205, 92, 92],
		indigo: [75, 0, 130],
		ivory: [255, 255, 240],
		khaki: [240, 230, 140],
		lavender: [230, 230, 250],
		lavenderblush: [255, 240, 245],
		lawngreen: [124, 252, 0],
		lemonchiffon: [255, 250, 205],
		lightblue: [173, 216, 230],
		lightcoral: [240, 128, 128],
		lightcyan: [224, 255, 255],
		lightgoldenrodyellow: [250, 250, 210],
		lightgray: [211, 211, 211],
		lightgreen: [144, 238, 144],
		lightgrey: [211, 211, 211],
		lightpink: [255, 182, 193],
		lightsalmon: [255, 160, 122],
		lightseagreen: [32, 178, 170],
		lightskyblue: [135, 206, 250],
		lightslategray: [119, 136, 153],
		lightslategrey: [119, 136, 153],
		lightsteelblue: [176, 196, 222],
		lightyellow: [255, 255, 224],
		limegreen: [50, 205, 50],
		linen: [250, 240, 230],
		mediumaquamarine: [102, 205, 170],
		mediumblue: [0, 0, 205],
		mediumorchid: [186, 85, 211],
		mediumpurple: [147, 112, 219],
		mediumseagreen: [60, 179, 113],
		mediumslateblue: [123, 104, 238],
		mediumspringgreen: [0, 250, 154],
		mediumturquoise: [72, 209, 204],
		mediumvioletred: [199, 21, 133],
		midnightblue: [25, 25, 112],
		mintcream: [245, 255, 250],
		mistyrose: [255, 228, 225],
		moccasin: [255, 228, 181],
		navajowhite: [255, 222, 173],
		oldlace: [253, 245, 230],
		olivedrab: [107, 142, 35],
		orange: [255, 165, 0],
		orangered: [255, 69, 0],
		orchid: [218, 112, 214],
		palegoldenrod: [238, 232, 170],
		palegreen: [152, 251, 152],
		paleturquoise: [175, 238, 238],
		palevioletred: [219, 112, 147],
		papayawhip: [255, 239, 213],
		peachpuff: [255, 218, 185],
		peru: [205, 133, 63],
		pink: [255, 192, 203],
		plum: [221, 160, 221],
		powderblue: [176, 224, 230],
		rosybrown: [188, 143, 143],
		royalblue: [65, 105, 225],
		saddlebrown: [139, 69, 19],
		salmon: [250, 128, 114],
		sandybrown: [244, 164, 96],
		seagreen: [46, 139, 87],
		seashell: [255, 245, 238],
		sienna: [160, 82, 45],
		skyblue: [135, 206, 235],
		slateblue: [106, 90, 205],
		slategray: [112, 128, 144],
		slategrey: [112, 128, 144],
		snow: [255, 250, 250],
		springgreen: [0, 255, 127],
		steelblue: [70, 130, 180],
		tan: [210, 180, 140],
		thistle: [216, 191, 216],
		tomato: [255, 99, 71],
		turquoise: [64, 224, 208],
		violet: [238, 130, 238],
		wheat: [245, 222, 179],
		whitesmoke: [245, 245, 245],
		yellowgreen: [154, 205, 50]
	},

	//Just map of component → space
	components: {
		'red' : 'rgb',
		'green' : 'rgb',
		'blue' : 'rgb',
		'hue' : 'hsl',
		'saturation' : 'hsl',
		'lightness' : 'hsl',
		'brightness' : 'hsb',
		'L' : 'lab',
		'A' : 'lab',
		'B' : 'lab',
		'x' : 'xyz',
		'y' : 'xyz',
		'z' : 'xyz',
		'cyan' : 'cmyk',
		'magents' : 'cmyk',
		'yellow' : 'cmyk',
		'kyan' : 'cmyk',
		'black' : 'cmyk',
		'gray' : 'grayscale',
		'grey' : 'grayscale',
		'name' : 'name'
	},

	formats: {},
	spaces: {},

	//TODO: palettes?

	//Default settings for every color instance
	defaults: {
		blendMode: 'normal',
		format: 'hex', //hsl, rgb, hex
		comment: '', //To insert after color def in css
		shortenHex: true, //I.e. #332211 → #321
		normalized: false, //what form to return by default: normalized or 0..255
		alpha: 1
	}
});


Color.prototype = {
	_create: function (opts) {//TODO: correct init
		var self = this;
		
		self.options = G.extend({}, Color.defaults);
		G.extend(self.options, opts);

		self._rgb = [0,0,0]; //RGB normalized color value

		if (!arguments.length) return self; //Fuse to prevent parsing on simple create case

		self.set.apply(self, arguments);

		return self;
	},

/*----------------------------------------------- Setters
	The point is →rgb sync each time model is set 
*/
	//Is options passed detector
	_isOptions: function(obj){
		for (var optName in Color.defaults) {
			if (obj[optName]) return true;
		}
		return false;
	},

	//✗ Comprehensive setter (recognizes any input stuff, let it be array, JSON or string needed to parse)
	set: function () {
		var self = this, o = self.options,						
			lastArg = arguments[arguments.length - 1];

		//Detect options passed
		if (G.isObject(lastArg) && (arguments.length > 1 || (arguments.length === 1 &&  self._isOptions(lastArg)))) {
			G.extend(self.options, lastArg);
		}

		var args = G.slice.call(arguments, 0, arguments.length);

		if ((o.format == 'rgba' || o.format == 'hsla') && args.length == 3) args.push(1); //conform rgb → rgba, hsl → hsla

		//Detect argtype
		if (args.length >= Color.formats[o.format].components.length) {//Standard argument type has been recognized
			self[o.format](args)
			//TODO: correct this type of off the bat settings. Check before calling _set
			//TODO: make tests like new G.Color(121, 45)			
		} else if (G.isString(args[0]) && self.parse(args[0], o.format)) {//console.log("name parsed")
			//Parsed successfully. What to do here?
		} else if (G.isElement(args[0]) && self.parseCssProperty.apply(self, args)) {
			//css property mastered.
		} else if (G.isActionDescriptor(args[0]) && self.parseActionDescriptor.apply(self, args)) {
			//css property mastered.
		} else {// ≤ 3 arguments or strange ones
			console.log("Unrecognizable arguments passed. Default black color created.");
		}

		return self;
	},

	//✗ sets specific component
	_setComponent: function (component, value) {
		var self = this, o = self.options;
		//TODO
		return self;
	},

	//✗ To set component, you can use setModel with undefined components			
	_setModel: function (r,g,b,a) {
		var self = this;
		if (G.isNumber(r)) self._rgb[0] = self._clamp(r, Color.formats.rgb.components.red.type);
		if (G.isNumber(g)) self._rgb[1] = self._clamp(g, Color.formats.rgb.dim.green.type);
		if (G.isNumber(b)) self._rgb[2] = self._clamp(b, Color.formats.rgb.dim.blue.type);
		if (G.isNumber(a)) self._rgb[3] = self._clamp(a, 'float');
		return self;
	},

	//✗ If components passed are null or undefined – ignore them
	_setSpace: function (space, components) {
		var self = this, o = self.options;

		//set components;
		//set rgb based on components;

		return self;
	},

	//✗ Sets model based on format values passed
	_setFormat: function (format, components) {
		var self = this, o = self.options,
			result,
			space = Color.formats[format].space;

		//If format has values different from space ones (e.g. space is normalized)
		if (Color.formats[format].toSpace){
			components = Color.formats[format].toSpace(components);
		}

		if (space != 'rgb') {
			result = Color.spaces[space].to.rgb(components);
		} else {
			result = components
		}

		//Remove alpha as last component
		if (Color.formats[format].components[Color.formats[format].components.length-1] == "alpha"){
			o.alpha = result.pop();
		}
		self._rgb = result;
		return self;
	},

	//Transform value based on properties passed. If value is null, reset to default value.
	_clamp: function(value, type){
		//Prop may be string, means type name. Ensure prop is object
		if (G.isString(type)) {
			type = G.types[ type ];
			if (!type) throw "Unknown propType " + type;
		}

		//If no value passed – reset to prevValue, default or null
		if ( value == null ) {
			return type.default || null;
		}

		//prop may have special method of clamping value. Use it.
		//Specifically, this is needed for special types of components, like name, pantone and so on
		if (type.clamp) {
			return type.clamp(value);
		}

		value = type.round ? Math.round( value ) : parseFloat( value );

		//Make mod
		if ( type.mod ) {
			return (value + type.mod) % type.mod;
		}

		return G.limit(value, (type.min || 0), type.max );			
	},

	//✗ Universal setter
	_set: function (target) {
		var self = this, o = self.options;

		return self;
	},

/*----------------------------------------------- Parsing		
	Parser decomposes input string on components and inits color model.
	@format is most probably format to parse
*/
	parse: function (string, format) {
		var self = this, o = self.options,
			matchResult;
		//if (!G.isString(string)) throw "Argument isn’t string";
		string = G.trim(string.toLowerCase());
		//if (!string) return false;//throw "String is empty";
		//if (format && !Color.formats[format]) throw "Nonexistent format to parse";

		if (format && (matchResult = Color.formats[format].parse(string))) {
			o.format = format; //set format for current color
			self._setFormat(format, matchResult);
			return true;
		} else {
			for (var formatN in Color.formats) {//console.log(formatN)
				if (format === formatN) continue;
				if (matchResult = Color.formats[formatN].parse(string)) {
					o.format = format; //set format for current color
					self._setFormat(format, matchResult);
					return true;
				}
			}
		}

		console.log("Couldn’t parse \"" + string + "\". Teach me, how → https://github.com/dfcreative/graphics/blob/master/src/Color.js");
		return false;
	},

	//When creating based on css property of element
	parseCssProperty: function (element, cssProp) {
		var self = this, o = self.options;
		//TODO jQuery.Color( element, cssProperty );
		console.log("TODO: attempt to parse css property");
		return false;
	},

	parseActionDescriptor: function (ActDesc) {
		console.log("TODO: parse action descriptor");
	},

	//API-methods creator.
	//✂------------------
	//Called once just after prototype has been created, deletes itself.
	//Example of API created based on formats: h(2), hue(2), … , hsb(24,56,2)…
	_createGetSetAPI: function(){
		var self = this;

		//Extend standard formats, like hsla(), rgb(), hex()
		//Bind whole formats
		for (var format in Color.formats){
			if (Color.formats[format].components) {self[format] = G._makeProxyMethod("_getSet", format);
			} else {
				//TODO: correct absence of components in format
			}
		}

		//Bind separate components
		for (var space in Color.spaces){
			//Bind space
			if (!self[space]) {
				self[space] = G._makeProxyMethod("_getSet", space);	
			}

			for (var component in Color.spaces[space].components){
				if (!self[component]) {//avoid identical names
					self[component] = G._makeProxyMethod('_getSet', component);
				}
				//Bind component aliases
				var alias = Color.spaces[space].components[component].alias;
				if (alias) {
					if (G.isString(alias)) {
						//Single alias
						self[alias] = G._makeProxyMethod('_getSet',component);
					} else if (G.isArray(alias)) {
						//Multiple alias
						for (var j = 0; j < alias.length; j++){
							self[alias[j]] = G._makeProxyMethod('_getSet',component);
						}
					}
				}
			}
		}			

		delete self._createGetSetAPI;
		return self;
	},


/*----------------------------------------------- Getters
*/
	//universal target getter
	_getTarget: function(target, options){
		var self = this, o = self.options, result;

		target = target || o.format;

		if (Color.formats[target]) {
			result = self._getFormat(target);
		} else if (Color.spaces[target]) {
			result = self._getSpace(target);
		} else if (Color.components[target]) {
			result = self._getComponent(target)
		} else {
			result = self._getFormat(o.format);
		}

		return result;
	},

	//✔
	_getComponent: function (comp) {
		var self = this, o = self.options, space = Color.components[comp];
		if (space) {
			if (space == 'rgb'){
				return self._rgb[Color.spaces.rgb.components[comp].id]*255 //rgb space components are returned denormalized
			} else {
				return Color.spaces[space].from["rgb"][Color.spaces[space].components[comp].id]
			}
		}
		return undefined;
	},
	//✔ returns array of values
	_getFormat: function (format, params) {
		var self = this, o = self.options, result;
		format = format || o.format;

		//Get fresh space values
		var space = Color.formats[format].space,
			spaceModel = (space == "rgb") ? self._rgb : Color.spaces.rgb.to[space](self._rgb);
			spaceModel = spaceModel.concat(o.alpha);

		//Return format components
		if (Color.formats[format].fromSpace) {
			//If format has special handler of components
			result = Color.formats[format].fromSpace(spaceModel);
		} else {
			//If format simply returns spaceModel
			result = spaceModel
		}

		//Transform to the intended data type
		if (params && params.dataType) {
			switch(params.dataType){
				case "json":
					var jsonResult = {};
					for (var i = 0; i < Color.formats[format].components.length; i++){
						jsonResult[Color.formats[format].components[i]] = result[i];
					}
					return jsonResult;
					break;
				default:
					return result;
					break;
			}
		}
		return result;
	},
	//✔ Returns array of component values of model
	_getSpace: function (space) {
		var self = this, o = self.options, result;

		if (space == 'rgb'){
			return self.model;
		}

		result = Color.spaces.rgb.to[space](self.model);

		return result;
	},

	//Comprehensive getter
	get: function(params){
		var self = this, o = self.options, result;
		switch (params && params.dataType) {
			case "json":
				return self.toJSON(params);
				break;
			case "array":
				return self.toArray(params);
				break;
			default:
				return self.toString(params);
				break;
		}
	},

	//TODO: questionable thing
	//2-side single & multiple setter/getter. For example, _getSet('hsla', 10, 20, 30, .3)
	_getSet : function(){
		if (arguments.length > 1) {//set
			return this.set.apply(this, arguments );
		}
		return this.get(arguments[0]); //get
	},

/*----------------------------------------------- Actions
*/
	//TODO: all LESS methods
	negate: function () {
		var self = this;
		for (var comp in Color.spaces.rgb.components) {
			self._setComponent(comp, 255 - self._getComponent(comp));
		}
		return self;
	},

	lighten: function(ratio) {
		this.values.hsl[2] += this.values.hsl[2] * ratio;
		this.setValues("hsl", this.values.hsl);
		return this;
	},

	darken: function(ratio) {
		this.values.hsl[2] -= this.values.hsl[2] * ratio;
		this.setValues("hsl", this.values.hsl);
		return this;         
	},

	saturate: function(ratio) {
		this.values.hsl[1] += this.values.hsl[1] * ratio;
		this.setValues("hsl", this.values.hsl);
		return this;
	},

	desaturate: function(ratio) {
		this.values.hsl[1] -= this.values.hsl[1] * ratio;
		this.setValues("hsl", this.values.hsl);
		return this;         
	},    

	greyscale: function() {
		var rgb = this.values.rgb;
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		this.setValues("rgb", [val, val, val]);
		return this;
	},

	clearer: function(ratio) {
		this.setValues("alpha", this.values.alpha - (this.values.alpha * ratio));
		return this;
	},

	opaquer: function(ratio) {
		this.setValues("alpha", this.values.alpha + (this.values.alpha * ratio));
		return this;
	},

	rotate: function(degrees) {
		var hue = this.values.hsl[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		this.values.hsl[0] = hue;
		this.setValues("hsl", this.values.hsl);
		return this;
	},

	warmer: function (degree) {
		var self = this, o = self.options;

		return self;
	},

	cooler: function (degree) {
		var self = this, o = self.options;

		return self;
	},

	mix: function(color2, weight) {
		weight = 1 - (weight || 0.5);

		// algorithm from Sass's mix(). Ratio of first color in mix is
		// determined by the alphas of both colors and the weight
		var t1 = weight * 2 - 1,
			d = this.alpha() - color2.alpha();

		var weight1 = (((t1 * d == -1) ? t1 : (t1 + d) / (1 + t1 * d)) + 1) / 2;
		var weight2 = 1 - weight1;

		var rgb = this.rgbArray();
		var rgb2 = color2.rgbArray();

		for (var i = 0; i < rgb.length; i++) {
			rgb[i] = rgb[i] * weight1 + rgb2[i] * weight2;
		}
		this.setValues("rgb", rgb);

		var alpha = this.alpha() * weight + color2.alpha() * (1 - weight);
		this.setValues("alpha", alpha);

		return this;
	},

	//Returns new color object with color between self & colorB
	getMix : function(colorB, midpoint){
		var self = this, colorA = self.options.color,
		colorObj = new Color();
		if (colorB instanceof Color) {colorB = colorB.get("color");}
		midpoint = midpoint || 0.5;
		midpoint = Math.max(Math.min(midpoint, 1), 0);
		colorObj.rgb.red = G.mid( colorA.rgb.red, colorB.rgb.red, midpoint );
		colorObj.rgb.green = G.mid( colorA.rgb.green, colorB.rgb.green, midpoint );
		colorObj.rgb.blue = G.mid( colorA.rgb.blue, colorB.rgb.blue, midpoint );
		return Color.create(colorObj);
	},

	//Makes color opacity
	applyOpacity: function(opacity){
		var self = this, o = self.options;
		o.opacity = 0.01*o.opacity*opacity;
		return self;
	},


/*--------------------------------------- Printing out
*/
	//TODO: get rid of this plenty of methods
	//jQuery.Color-compartible API
	// returns a css string "rgba(255, 255, 255, 0.4)"
	toRgbaString: function () {
		return this.toString('rgba');		
	},
	// returns a css string "hsla(330, 75%, 25%, 0.4)"
	toHslaString: function () {
		return this.toString('rgba');
	},
	// returns a css string "#abcdef", with "includeAlpha" uses "#rrggbbaa" (alpha *= 255)
	toHexString: function (params) {
		return this.toString('hex', G.extend({shorten: this.options.shortenHex, alpha: false}, params));
	},

	//Simple target printer
	toString: function (params) {
		var self = this, o = self.options,
			result;

		var target = params && params.target || o.format;
		
		//.toString()
		if (!params){
			result = Color.formats[o.format].toString(self._getFormat(o.format));
		}

		//.toString({format: 'hsl', …})
		else if (params.format && Color.formats[params.format]) {
			result = Color.formats[params.format].toString(self._getFormat(params.format), params);
		}

		//.toString({model: 'lab', …})
		else if (params.model && Color.spaces[params.model]) {
			result = self._getSpace(params.model)
		}

		//.toString({target: 'lab', …})
		else if (params.target && (Color.spaces[params.target] || Color.formats[params.target] || Color.components[params.target])) {
			result = self._getTarget(params.target, params)
		}

		//.toString(any_trash)
		else {
			result = Color.formats[o.format].toString(self._getFormat(o.format), params);
		}

		return result;
	},

	//Return JSON-representation of model
	//Possible options passed: {format, target, …extend it later, if needed}
	toJSON: function(params){
		var self = this, o = self.options, components, result;
		
		//.toJSON()
		if (!params){ 
			result = self._getFormat(o.format, {dataType: 'json'});			
		} 

		//.toJSON({format: 'hsl', …})
		else if (params.format && Color.formats[params.format]) { 
			result = self._getTarget(params.format, {dataType:'json'})
		}

		//.toJSON({model: 'lab', …})
		else if (params.model && Color.spaces[params.model]) {
			result = self._getSpace(params.model, {dataType:'json'})
		}

		//.toJSON(any_trash)
		else {
			result = self._getFormat(o.format, {dataType: 'json'});
		}

		result.alpha = o.alpha;

		return result;
	},

	//return array representing values according to format
	toArray: function (target) {
		var self = this, o = self.options, result;
		
		if (target) {
			result = self.get(target);
		} else {
			result = self._getFormat(o.format);
		}

		return result;
	},

	//Return one-pixel data-URI filled with that color
	toDataURI: function(){
		var self = this, o = self.options;
		//TODO
		return self;
	},

	//Return corresponding CSS-string with format passed through param
	toCSS:function(param){
		var self = this, o = self.options;
		var colorVal = "",
		opacity = o.opacity === 0 ? 0 : (o.opacity || 100),
		colorObj = o.color;  
	},

	//Universal printer
	to:function(format, param){
		var self = this, o = self.options;
	}
}

//========================= Export Color class
//TODO: escape action there if it’s ExtendScript
G.extend(Color.prototype, G.ClassUtils);

Color.prototype
._incapsulateOptions(Color.defaults) //single method on every option
._bindAliases()	//Alternate names for methods
._createGetSetAPI() //Straightforward names for model	