//TODO connect custom color model, sync with value

var Picky = Mod.extend({
	created: function(){
		console.log("init", this.mode)

		//Init all pickers inside
		var targets = this.querySelectorAll(".picker");
		for (var i = 0; i < targets.length; i++){
			var picker = new Picker(targets[i]);

			if (!this.pickers[picker.mode]) this.pickers[picker.mode] = [];

			this.pickers[picker.mode].push(picker);
		}

		//Go by mode params - ensure mode pickers exist
		for (var i = 0; i < this.mode.length; i++){
			var name = this.mode[i];

			//if picker with mode passed has already been created, pass it over
			if(this.pickers[name]) continue;

			//create picker instance, if none found
			var picker = new Picker({
				mode: name,
				picky: this
			});

			if (!this.pickers[name]) this.pickers[name] = [];

			this.pickers[name].push(picker);

			this.appendChild(picker);
		}

	},

	attached: function(){
		console.log("attached")
	},

	//Mode to turn on in
	//Default is photoshop one
	mode: {
		//whether array of pickers, array of strings or comma-separated string of picker names
		value: [],
		change: function(){

		}
	},

	//possible color model to connect. By default - rgba array
	color: {
		saturation: 50,
		hue: 0,
		lightness: 50
	},

	value: {
		value: "#000",
		set: function(value){
			return "hsl(" + value.hue + ", " +
			value.saturation + "%, " +
			value.lightness + "%)"
		}
	},

	pickers: {},

	change: function(){
		console.log("picky changed", this.color)
		this.value = this.color;
	}
});


//default color model is an Array
// Picky.colorModel = [];

Picky.register("picky");