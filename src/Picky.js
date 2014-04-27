//TODO connect custom color model, sync with value

var Picky = Component.register("Picky", {
	options: {
		//Mode to turn on in
		//Default is photoshop one
		mode: {
			//whether array of pickers, array of strings or comma-separated string of picker names
			value: [],
			get: function(){

			},
			set: function(mode){
				//TODO: create list of pickers according to the mode passed
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
		}
	},

	methods: {
		//Appends/inits new picker
		addPicker: function(name, $picker){
			//check whether anything passed
			if (!name && !$picker)
				throw new Error("Whether picker name or element should be passed");

			//detect picker type, if no picker type defined
			else if (!name && $picker){
				//input
				if ($picker.tagName === "INPUT"){
					name = "input"
				} else {
					name = "text"
				}
			}

			//check whether passed picker exists
			if (name && !this.constructor.pickers[name])
				throw new Error("Unknown picker: `" + name + "`");

			//init picker
			//picker may be empty - then new picker will be added to self
			if (!this.pickers[name]) this.pickers[name] = [];

			this.pickers[name].push(new this.constructor.pickers[name]($picker, {
				picky: this
			}));

			//insert it, if it isn’t in DOM already
			if (!$picker){
				this.appendChild(this.pickers[name]);
			}
		}
	},

	states:{
		init: {
			before: function(){
				//create set of pickers keyed by name
				this.pickers = {};
				//console.log("init picky", this.color)

			},

			after: function(){
				//init all declared pickers within self
				//console.log("init", this.constructor.pickers)
				for (var pickerName in this.constructor.pickers){
					var name = pickerName + "-picker";
					var childPickers = queryComponents(name, this);
					for (var i = 0; i < childPickers.length; i++){
						var $picker = childPickers[i];

						//init picker element
						this.addPicker(pickerName, $picker);
					}
				}

				//Create rest pickers according to the mode passed
				//TODO: move this to mode set/get
				for (var name in this.mode){
					//ignore existing pickers
					if (this.pickers[name]) continue;

					//create absent pickers
					this.addPicker(type);
				}
			}
		},

		ready: {
			before: function(){
				this.fire("change")
			},

			change: function(){
				console.log("picky changed", this.color)
				this.value = this.color;
			}
		}
	},

	pickers: {
		// "r": RedPicker,
		// "g": GreenPicker,
		// "b": BluePicker,
		// "h": HuePicker,
		"hue": Component.registry.HuePicker,
		"saturation": Component.registry.SaturationPicker,
		//"l": Component.registry.LightnessPicker,
		"lightness": Component.registry.LightnessPicker,
		// "a": AlphaPicker,
		"sl": Component.registry.SLPicker,
		// "plt": PalettePicker,
		// "input": InputPicker
	}
});

//default color model is an Array
// Picky.colorModel = [];