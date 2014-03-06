/*
Utilizes slide-areas
*/

//Do not change the way of defining picker classes. Extend in Picker won’t give correct name for class.
function HuePicker(){
	this.create.apply(this, arguments);
}

pickers.HuePicker = HuePicker;

HuePicker.prototype = extend({}, AreaPicker.prototype, {
	options: {
		direction: "left", //what direction of hue
	},

	create: function(el, manager, color){
		this.el = el;
		this.manager = manager;

		this.color = color; //model of this picker is the only color

		this.makeOptions();

		this.bindEvents();
	},

	bindEvents: function(){
		var o = this.options,
			el = this.el,
			self = this;
	},

	//Picker interface
	//sets up representation based on the color passed
	set: function(color){
		var o = this.options;
		this.color = color;
		
		//render area
		var grSteps = 6, //6,12,24,36, 72 is optimal. 6 is better.
			gradient = [], 
			hueStep = 360/grSteps,
			sat = (color.saturation()*100) + '%',
			al = color.alpha();

		for (var i = 0; i<= grSteps; i++){
			gradient.push( 'hsla(', 
							(hueStep*i).toFixed(4), ',', 
							sat, ', 50%, ', 
							al, ') ',
							((100/grSteps*i)).toFixed(2), (i == grSteps ? '%' : '%, ')
						)
		};

		this.el.style.background = cssGradient + '(' + o.direction + ', ' + gradient.join('') + ')';
	},

	//returns color based on the current state
	get: function(){
	}
})