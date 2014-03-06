/*
Picker for the simple kinds of inputs:
textarea, input[type=text]
*/
function StylePicker(){
	this.create.apply(this, arguments);
}

pickers.StylePicker = StylePicker;

StylePicker.prototype = extend({}, Picker.prototype, {
	options: {
		style: null //set of style-properties to change
	},

	create: function(el, manager, color){
		this.el = el;
		this.manager = manager;

		this.color = color; //model of this picker is the only color

		this.makeOptions();

		//ensure list of properties to change
		if (typeof this.options.style == "string"){
			this.styles = this.options.style.split(",");
		} else if (this.options.style && typeof this.options.style == "object" && this.options.style.length) {
			this.styles = this.options.style;
		}

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
		
		for (var i = 0, l = this.styles.length; i<l; i++){
			this.el.style[this.styles[i]] = color.toRgbaString();
		}
	},

	//returns color based on the current state
	get: function(){
		console.log("why do you need get style method?")
	}
})