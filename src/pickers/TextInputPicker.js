/*
Picker for the simple kinds of inputs:
textarea, input[type=text]
*/
function TextInputPicker(){
	this.create.apply(this, arguments);
}

pickers.TextInputPicker = TextInputPicker;

TextInputPicker.prototype = extend({}, Picker.prototype, {
	options: {
		threshold: 3, //minimal number of symbols to ignore raising events
		format: "hsla", //format used to [de]serialize color model

		//returns array from the value
		parseValue: function(value){
			var res = value.split(",");
			return res;
		},

		//converts color to the string
		toValue: function(color){

		},

		//callback when picker updated
		change: null
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

		this.el.addEventListener("keyup", function(e){
			//var value = el.value;
			//if (value.length >= o.threshold) {
			//	self.change(value);
			//}
		})

		this.el.addEventListener("change", function(e){
			self.change(self.get());
		})
	},

	keyPressed: function(){

	},

	//Picker interface
	//sets up representation based on the color passed
	set: function(color){
		var o = this.options;
		this.el.value = color[this.options.format]();
	},

	//returns color based on the current state
	get: function(){
		var o = this.options;
		return this.color[o.format](o.parseValue(this.el.value))
	}
})