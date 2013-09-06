/*
Generic picker interface
*/

function InputPicker(){
	this.create.apply(this, arguments);
}

InputPicker.prototype = {
	options: {
		threshold: 3, //minimal number of symbols to ignore raising events
		format: "hsla", //format used to [de]serialize color model
		//TODO: are these two below really needed?
		toValue: function(){
			var o = this.options;
			return o.color[o.format]();
		},
		//
		fromValue: function(value){
			var o = this.options;
			o.color = o.color[o.format](value)
		},


		//callback when picker updated
		change: null
	},

	create: function(el, options){
		this.el = el;
	},

	_bindEvents: function(){
		var o = this.options,
			el = this.el,
			self = this;

		this.el.addEventListener("keyup", function(e){
			var value = el.value;
			if (value.length >= o.threshold) {
				self.change(value);
			}
		})
	},

	keyPressed: function(){

	},

	//Picker interface
	//sets up representation based on the color passed
	set: function(color){
		var o = this.options;
		this.el.value = o.toValue();
	},

	//returns color based on the current state
	get: function(){
		var o = this.options;
		o.fromValue();
	}
}