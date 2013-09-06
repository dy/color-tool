/*
Generic picker interface
Each picker may have own color model (set of colors saved).
That way it  is decoupled from manager.
*/

//set of known pickers
pickers = {
	Picker: Picker
}

function Picker(){
	this.create.apply(this, arguments);
}

Picker.prototype = {
	options: {

		//callback when picker updated
		change: null
	},

	create: function(el, manager, color){
		this.el = el;
		this.manager = manager;
		this.color = color;	

		this.readOptions();
	},

	//creates options, extends from the element’s attributes
	makeOptions: function(){
		this.options = extend({}, this.options, JSON.parse(this.el.getAttribute("data-picker-options")));		
	},

	//sets up representation based on the color passed
	set: function(color){

	},

	//returns color based on the current state
	get: function(color){

	},

	//simple change event trigger
	change: function(newColor){
		//notify manager
		this.manager.color = newColor;

		//Trigger		
		var evt = new CustomEvent("changeColor");
		//TODO: find out how to pass correct options to the browser event

		if (this.options.change) this.options.change(newColor, this);
		this.el.dispatchEvent(evt);
	}
}