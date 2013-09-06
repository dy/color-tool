/*
	Format is existing representation of some color space.
	It has toString and parse methods.
	Parsing returns array of components in proper color space, e.g. [12, 121, 45, 27] in case of success,
	and false in case of fail.
	toString returns exact form of model.
*/
var Color = G.Color;

function ColorFormat(obj) {
	G.extend(this, obj); //any of class instances can be redefined
}

//Default behaviour is of rgb format
ColorFormat.prototype = {
	space: 'rgb', //space that format is referred to
	components : ['red', 'green', 'blue'], //components that format operates. It’s not necessary to be ColorSpace components
	//Parses format values, not space
	parse : function (str) {
		var byteProp = G.types.byte.re,
			percent = G.types.percent.re,
			match, re;

		re = new RegExp("rgb\\(\\s*" + byteProp + "\\s*,\\s*" + byteProp + "\\s*,\\s*" + byteProp + "\\s*\\)"),
		match = re.exec(str);
		if (match) return [
			~~match[1],
			~~match[2],
			~~match[3]
		];

		re = new RegExp("rgb\\(\\s*" + percent + "\\s*,\\s*" + percent + "\\s*,\\s*" + percent + "\\s*\\)");
		match = re.exec(str);
		if (match) return [
			match[1] * 2.55,
			match[2] * 2.55,
			match[3] * 2.55
		];
		
		return false;
	},				
	//Supposed that toString accepts format values, not space
	toString: function (rgb, params) {
		return 'rgb('+rgb[0]+', '+rgb[1]+', '+rgb[2]+')';
	},
	//Transforms space values to format values. Absence of this func means space values == format values
	fromSpace: function(rgb){
		return [rgb[0]*255, rgb[1]*255, rgb[2]*255]
	},
	//Transforms format values to the space values
	toSpace: function(rgb){
		return [rgb[0]/255, rgb[1]/255, rgb[2]/255]
	}
}

//Init known color formats
Color.formats.rgb = new ColorFormat();

Color.formats.rgba = new ColorFormat({
	components: ["red", "green", "blue", "alpha"],
	parse : function (str) {
		var byteProp = G.types.byte.re,
			percent = G.types.percent.re,
			floatProp= G.types.float.re,
			match, re;

		re = new RegExp("rgba\\(\\s*" + byteProp + "\\s*,\\s*" + byteProp + "\\s*,\\s*" + byteProp + "\\s*,\\s*" + floatProp+ "\\s*\\)"),
		match = re.exec(str);
		if (match)
			return [
				~~match[1],
				~~match[2],
				~~match[3],
				~~match[4]
			];

		re = new RegExp("rgba\\(\\s*" + percent + "\\s*,\\s*" + percent + "\\s*,\\s*" + percent + "\\s*,\\s*" + floatProp + "\\s*\\)");
		match = re.exec(str);
		if (match)
			return [
				match[1] * 2.55,
				match[2] * 2.55,
				match[3] * 2.55,
				match[4]
			];
		
		return false;
	},
	toString: function (rgba, param) {
		var omitAlpha = param && param.omitAlpha,
			a;

		if (rgba[3] >= 1 || rgba[3] === undefined) {
			a = 1;
		} else {
			a = rgba[3].toFixed().slice(1);
		}

		if (omitAlpha && a == 1){
			return Color.formats.rgb.toString(rgba);
		} else {
			return 'rgba('+rgba[0]+', '+rgba[1]+', '+rgba[2]+', '+a+')'
		}
	},
})

Color.formats.hsl = new ColorFormat({
	space: 'hsl',
	components : ['hue', 'saturation', 'lightness'],
	parse : function (str) {
		var percent = G.types.percent.re,
			degrees = G.types.degrees.re,
			match, re;

		re = new RegExp("hsl\\(\\s*" + degrees + "\\s*,\\s*" + percent + "\\s*,\\s*" + percent + "\\s*\\)"),
		match = re.exec(str);
		if (match)
			return [
				match[1],
				match[2],
				match[3]
			];
		
		return false;
	},
	toString: function (hsl) {
		return 'hsl('+hsl[0]+', '+hsl[1]+', '+hsl[2]+')';
	},
	fromSpace: function(hsl){
		return hsl
	}
})

Color.formats.hsla = new ColorFormat({
	space: 'hsl',
	components : ['hue', 'saturation', 'lightness', 'alpha'],
	parse : function (str) {
		var percent = G.types.percent.re,
			floatProp= G.types.float.re,
			degrees = G.types.degrees.re,
			match, re;

		re = new RegExp("hsla\\(\\s*" + degrees + "\\s*,\\s*" + percent + "\\s*,\\s*" + percent + "\\s*,\\s*" + floatProp+ "\\s*\\)"),
		match = re.exec(str);
		if (match)
			return [
				match[1],
				match[2],
				match[3],
				match[4]
			];
		
		return false;
	},
	toString: function (hsla) {
		return (hsla[3] >= 1 || hsla[3] === undefined) ? Color.formats.hsl.toString(hsla)
				: ('hsla('+hsla[0]+', '+hsla[1]+', '+hsla[2]+', '+hsla[3].toFixed(2).slice(1)+')');
	},
	toArray: function (hsla) {
		
	}
})

Color.formats.hex = new ColorFormat({
	space: 'rgb',
	components : ['red', 'green', 'blue'],
	parse : function (str) {
		var hex = G.types.hex.re,
			match, re;

		re = new RegExp("#?" + hex + hex + hex + hex),
		match = re.exec(str);
		if (match)
			return [
				parseInt(match[1], 16),
				parseInt(match[2], 16),
				parseInt(match[3], 16),
				parseInt(match[4], 16) / 255
			];

		re = new RegExp("#?" + hex + hex + hex),
		match = re.exec(str);
		if (match)
			return [
				parseInt(match[1], 16),
				parseInt(match[2], 16),
				parseInt(match[3], 16),
				1
			];

		re = new RegExp("#?([a-f0-9])([a-f0-9])([a-f0-9])"),
		match = re.exec(str);
		if (match)
			return [
				parseInt(match[1] + match[1], 16),
				parseInt(match[2] + match[2], 16),
				parseInt(match[3] + match[3], 16),
				1
			];
		
		return false;
	},
	toString: function (rgba, param) {
		var shorten = param ? (param.shorten === undefined ? true : param.shorten ) : true,
			nohash = param && param.nohash || false,
			r = G.hex(rgba[0]),
			g = G.hex(rgba[1]),
			b = G.hex(rgba[2]),
			result = "";
		if (!nohash){
			result = "#"
		}
		if (shorten &&
			r[0] == r[1] && 
			g[0] == g[1] && 
			b[0] == b[1]){
				return result + r[0] + g[0] + b[0]
		}
		return result+ r+g+b;
	},

	toSpace: function (rgb) {
		return [rgb[0]/255,rgb[1]/255,rgb[2]/255]
	},
	fromSpace: function (rgb) {
		return [rgb[0]*255, rgb[1]*255, rgb[2]*255]
	}
})

//TODO: the same as hex except that number representing hex returned
Color.formats.number = new ColorFormat({
	space: 'rgb',
			components : ['red', 'green', 'blue', 'alpha'],
			parse : function (str) {
				var hex = G.types.hex.re,
					match, re;

				re = new RegExp("#?" + hex + hex + hex + hex),
				match = re.exec(str);
				if (match)
					return [
						parseInt(match[1], 16),
						parseInt(match[2], 16),
						parseInt(match[3], 16),
						parseInt(match[4], 16) / 255
					];

				re = new RegExp("#?" + hex + hex + hex),
				match = re.exec(str);
				if (match)
					return [
						parseInt(match[1], 16),
						parseInt(match[2], 16),
						parseInt(match[3], 16),
						1
					];

				re = new RegExp("#?([a-f0-9])([a-f0-9])([a-f0-9])"),
				match = re.exec(str);
				if (match)
					return [
						parseInt(match[1] + match[1], 16),
						parseInt(match[2] + match[2], 16),
						parseInt(match[3] + match[3], 16),
						1
					];
				
				return false;
			},
			toString: function (rgba, param) {
				var shorten = param && param.shorten || true,
					nohash = param && param.nohash || false,
					r = G.hex(rgb[0]),
					g = G.hex(rgb[1]),
					b = G.hex(rgb[2]);
				return '#'+ r+g+b;
			},
			toArray: function (rgba) {
				var self = this, o = self.options;

				return self;
			}
})


Color.formats.name = new ColorFormat({
	space: 'name',
	components: ['name'],
	parse: function (str) {
		if (Color.names[str]) {
			return str;
		}
		return false;
	},
	toString: function () {

	}
})


Color.formats.dataURI = new ColorFormat({
	parse : function (str) {
		//TODO
	}
})