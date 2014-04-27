Component.register("SaturationPicker", {
	extends: "Picker",

	options: {
		min: 0,
		max: 100,
		value: 50
	},

	states: {
		'ready, input': {
			change: function(){
				console.log("saturation picker change", this.value)
				this.picky.color.saturation = this.value;
			},

			'$.picky change': function(){
				this.value = this.picky.color.saturation
			}
		}
	},

	methods: {
		render: function(){
			if (this.state !== "ready" ) return;


			this.updatePosition();
		}
	}
})