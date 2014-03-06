function ColorSpace(obj) {
	G.extend(this, obj); //any of class instances can be redefined
};

//Default behaviour is normalized rgb format
ColorSpace.prototype = {
	components: {
		'red': {
			id: 0,
			type: 'normal', //propType which settings to adopt
			name: ['red','r'] //alias is used to form API of class. Every alias will form due method.
		},
		'green': {
			id: 1,
			type: 'normal',
			name: ['green','g']
		},
		'blue': {
			id: 2,
			type: 'normal',
			name: ['blue','b']
		}
	},
	to: {
		hsb: function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var	max = Math.max(r, g, b), min = Math.min(r, g, b),
				h=0, s=0, br = max,
				d = max - min,
				s = max === 0 ? 0 : d / max;

			if(max != min) { //achromatic
			    switch(max) {
			        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			        case g: h = (b - r) / d + 2; break;
			        case b: h = (r - g) / d + 4; break;
			    }
			    h /= 6;
			}
			return [G.denormalize(h, 'degrees'), 
					G.denormalize(s, 'percent'), 
					G.denormalize(br, 'percent')];
			
		},
		xyz: function (rgb) {						
			var r = rgb[0], g = rgb[1], b = rgb[2];
			if ( r > 0.04045 ) r = Math.pow( ( r + 0.055 ) / 1.055 , 2.4);
			else r = r / 12.92
			if ( g > 0.04045 ) g = Math.pow( ( g + 0.055 ) / 1.055 , 2.4);
			else g = g / 12.92
			if ( b > 0.04045 ) b = Math.pow( ( b + 0.055 ) / 1.055 , 2.4);
			else b = b / 12.92
			r = r * 100
			g = g * 100
			b = b * 100
			//Observer. = 2°, Illuminant = D65
			return [r * 0.4124 + g * 0.3576 + b * 0.1805,
					r * 0.2126 + g * 0.7152 + b * 0.0722,
					r * 0.0193 + g * 0.1192 + b * 0.9505]
		},
		lab: function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var xyz = Color.spaces.rgb.to.xyz(src);
			//console.log(xyz)
			var lab = Color.spaces.xyz.to.lab(xyz);
			//console.log(lab)

			return lab;
		},
		cmyk: function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var self = this, o = self.options;

			return self;
		},
		name: function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var minDist = 999, //map of distances to the colornames
				dist = 999,
				closest = "black",
				dr = 0, dg = 0, db = 0,
				name;
			for (name in Color.names) {
				dr = (Color.names[name][0] - r * 255);
				dg = (Color.names[name][1] - g * 255);
				db = (Color.names[name][2] - b * 255);
				dist = Math.sqrt(dr * dr + dg * dg + db * db);
				if (dist < minDist) {
					closest = name;
					minDist = dist;
				}
			}
			return {name: closest};
		}
	}
};

//==================Custom spaces
Color.spaces.rgb = new ColorSpace();

Color.spaces.hsl = new ColorSpace({
	components: {
		'hue':{
			id: 0,
			type: 'degrees',
			name: ['hue', 'h']
		},
		'saturation': {
			id: 1,
			type: 'percent',
			name: ['saturation', 'sat', 's']
		},
		'lightness': {
			id: 2,
			type: 'percent',
			name: ['lightness','l']
		}
	},
	from: {
		rgb: function (rgb) { //passed normalized rgb’s	
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var	min = Math.min(r, g, b),//Min. value of RGB
				max = Math.max(r, g, b),//Max. value of RGB
				d = max - min,//Delta RGB value
				l = (max + min) / 2,
				h = 0, s = 0, //by default no chroma
				del_R, del_G, del_B;

			if (d !== 0) {//chroma
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

				switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
				}

				h /= 6;
			}

			return [G.denormalize(h, 'degrees'),
					G.denormalize(s, 'percent'),
					G.denormalize(l, 'percent')];//normalized hsl returned?
		}
	},
	to: {
		rgb: function (hsl) {
			var h = hsl[0], s = hsl[1], l=hsl[2]
			if ( s == 0 ) return {
				   red: l * 2.55,
				   green: l * 2.55,
				   blue: l * 2.55,
				};
			var t2 = l < 0.5 ? (l * ( 1 + s )) : (( l + s ) - ( s * l )),
				t1 = 2 * l - t2;

			function Hue_2_RGB( v1, v2, vH ){
			   if ( vH < 0 ) vH += 1
			   if ( vH > 1 ) vH -= 1
			   if ( ( 6 * vH ) < 1 ) return ( v1 + ( v2 - v1 ) * 6 * vH )
			   if ( ( 2 * vH ) < 1 ) return ( v2 )
			   if ( ( 3 * vH ) < 2 ) return ( v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6 )
			   return ( v1 )
			}

			return [255 * Hue_2_RGB( t1, t2, h + ( 1 / 3 )),
					255 * Hue_2_RGB( t1, t2, h ),
					255 * Hue_2_RGB( t1, t2, h - ( 1 / 3 ))]
		},
	}
});

Color.spaces.hsb = new ColorSpace({
	components: {
		'hue': {
			id: 0,
			type: 'degrees'
		},
		'saturation': {
			id: 1,
			type: 'percent'
		},
		'brightness': {
			id: 2,
			type: 'percent',
			name: ['brightness']
		}
	},
	from: {
		rgb: function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var	max = Math.max(r, g, b), min = Math.min(r, g, b),
				h=0, s=0, br = max,
				d = max - min,
				s = max === 0 ? 0 : d / max;

			if(max != min) { //achromatic
			    switch(max) {
			        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			        case g: h = (b - r) / d + 2; break;
			        case b: h = (r - g) / d + 4; break;
			    }
			    h /= 6;
			}
			return [G.denormalize(h, 'degrees'), 
					G.denormalize(s, 'percent'), 
					G.denormalize(br, 'percent')];
			
		}
	}
});

Color.spaces.xyz = new ColorSpace({
	components:{
		'x': {
			id:0,					
			type:'float',
			max:95.047,
			name: ['x','X'],
		},
		'y': {
			id:1,
			type: 'float',
			max:100,
			name:['y','Y']
		},
		'z':{
			id:2,
			type: 'float',
			max:108.883,
			name:['z','Z']
		}
	},
	to:{
		rgb: function (xyz) {
			var x = src.x / 100,       //X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
				y = src.y / 100,       //Y from 0 to 100.000
				z = src.z / 100,        //Z from 0 to 108.883

				r = x *  3.2406 + y * -1.5372 + z * -0.4986,
				g = x * -0.9689 + y *  1.8758 + z *  0.0415,
				b = x *  0.0557 + y * -0.2040 + z *  1.0570

			if ( r > 0.0031308 ) r = 1.055 * Math.pow( r , ( 1 / 2.4 ) ) - 0.055;
			else r = 12.92 * r;
			if ( g > 0.0031308 ) g = 1.055 * Math.pow( g , ( 1 / 2.4 ) ) - 0.055;
			else g = 12.92 * g;
			if ( b > 0.0031308 ) b = 1.055 * Math.pow( b , ( 1 / 2.4 ) ) - 0.055;
			else b = 12.92 * b;

			return [r * 255,
					g * 255,
					b * 255]
		},
		lab: function (src) {
			var x = src.x / Color.spaces.xyz.components.x.max, //ref_X =  95.047   Observer= 2°, Illuminant= D65
				y = src.y / Color.spaces.xyz.components.y.max, //ref_Y = 100.000
				z = src.z / Color.spaces.xyz.components.z.max  //ref_Z = 108.883

			if ( x > 0.008856 ) x = Math.pow(x , 1/3 );
			else x = ( 7.787 * x ) + ( 16 / 116 );
			if ( y > 0.008856 ) y = Math.pow(y , 1/3 );
			else y = ( 7.787 * y ) + ( 16 / 116 );
			if ( z > 0.008856 ) z = Math.pow(z , 1/3 );
			else z = ( 7.787 * z ) + ( 16 / 116 );

			return { L: ( 116 * y ) - 16,
					a: 500 * ( x - y ),
					b: 200 * ( y - z )}
		}
	},
	from: {
		rgb: function (rgb) {						
			var r = rgb[0], g = rgb[1], b = rgb[2];
			if ( r > 0.04045 ) r = Math.pow( ( r + 0.055 ) / 1.055 , 2.4);
			else r = r / 12.92
			if ( g > 0.04045 ) g = Math.pow( ( g + 0.055 ) / 1.055 , 2.4);
			else g = g / 12.92
			if ( b > 0.04045 ) b = Math.pow( ( b + 0.055 ) / 1.055 , 2.4);
			else b = b / 12.92
			r = r * 100
			g = g * 100
			b = b * 100
			//Observer. = 2°, Illuminant = D65
			return [r * 0.4124 + g * 0.3576 + b * 0.1805,
					r * 0.2126 + g * 0.7152 + b * 0.0722,
					r * 0.0193 + g * 0.1192 + b * 0.9505]
		}
	}
});

Color.spaces.lab = new ColorSpace({
	components: {
		'Lightness':{
			id: 0,
			type : 'float',
			max : 100,
			name: ['L', 'Lightness', 'lchannel', 'lChannel'],
		},
		'A':{
			id: 1,
			type: 'float',
			max : 100,
			min: -100,
			name: ['A','achannel', 'aChannel']
		},
		'B':{
			id: 2,
			type: 'float',
			max : 100,
			min : -100,
			name: ['B','bchannel', 'bChannel']
		}
	},
	to: {
		rgb: function (src) {
			console.log("torgb:")
			console.log(src)
			var xyz = Color.spaces.lab.to.xyz(src);
			console.log(xyz)
			var rgb = Color.spaces.xyz.to.rgb(xyz);
			console.log(rgb)
			return rgb;
		},
		xyz: function (src) {
			var y = ( src.l + 16 ) / 116,
				x = src.a / 500 + y,
				z = y - src.b / 200;

			if ( y^3 > 0.008856 ) y = y*y*y;
			else y = ( y - 16 / 116 ) / 7.787;
			if ( x^3 > 0.008856 ) x = x*x*x;
			else x = ( x - 16 / 116 ) / 7.787;
			if ( z^3 > 0.008856 ) z = z*z*z;
			else z = ( z - 16 / 116 ) / 7.787;

			return {x: Color.spaces.xyz.components.x.max * x,    //ref_X =  95.047     Observer= 2°, Illuminant= D65
					y: Color.spaces.xyz.components.y.max * y,    //ref_Y = 100.000
					z: Color.spaces.xyz.components.z.max * z};   //ref_Z = 108.883
		}
	},
	form: {
		rgb: function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			var xyz = Color.spaces.rgb.to.xyz(src);
			//console.log(xyz)
			var lab = Color.spaces.xyz.to.lab(xyz);
			//console.log(lab)

			return lab;
		}
	}
});

Color.spaces.cmyk = new ColorSpace({
	components: {
		'cyan':{
			id: 0,
			type: 'percent',
			name:['cyan', 'c'],
			round: true,
		},
		'magenta':{
			id: 1,
			type: 'percent',
			round: true,
			name:['magenta', 'm']
		},
		'yellow':{
			id: 2,
			type: 'percent',
			round: true,
			name:['yallow', 'yel']
		},
		'kyan':{
			id: 3,
			type: 'percent',
			round: true,
			name:['kyan', 'black', 'b']
		}
	}
});

Color.spaces.grayscale = new ColorSpace({
	components: {
		'gray':{
			id: 0,
			name: ['gray','grey'],
			type: 'percent'
		}
	}
});

Color.spaces.name = new ColorSpace({
	components: {
		'name' : {
			id: 0,
			//special types of components just has method of getting value
			clamp: function (value) {
				if (Color.names[value]) return value;
				throw "Cannot clamp color name \"" + value + "\".";
			}
		}
	},
	to: {
		rgb: function (name) {
			return {red: Color.names[name][0],
					green: Color.names[name][1],
					blue: Color.names[name][2]};
		}
	}
});

Color.spaces.hsb = new ColorSpace({
	components: {

	},
	to: {
		rgb: function () {
			
		}
	}	
});