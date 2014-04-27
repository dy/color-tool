Component.register("LightnessPicker", {
	extends: "Picker",

	options: {
		min: 0,
		max: 100,
		value: 50
	},

	states: {
		'ready, input': {
			change: function(){
				this.picky.color.lightness = this.value;
			},

			'$.picky change': function(){
				this.value = this.picky.color.lightness
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