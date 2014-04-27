Component.register("SLPicker", {
	extends: "Picker",

	//TODO: make setting up initial value
	//as well as dimensions
	options: {
		min: [0, 0],
		max: [100,100],
		value: [50, 50],
		dimensions: 2
	},

	states: {
		'ready, input': {
			change: function(){
				this.picky.color.saturation = this.value[0];
				this.picky.color.lightness = this.value[1];
			},
			'$.picky change': function(){
				this.value[0] = this.picky.color.saturation
				this.value[1] = this.picky.color.lightness
			}
		}
	},

	methods: {
		//API
		render: function(){
			//console.log("sl render")

			this.updatePosition();

			//model
			var color = this.picky.color,
				h = color.hue;

			//TODO: direction
			//var direction = this.

			//hue
			var direction = this.vertical ? "bottom" : "right";
			var bg = [
			"linear-gradient(to bottom,",
			"hsla(0,0%,100%,1) 0%,",
			"hsla(0,0%,100%,0) 50%,",
			"hsla(0,0%,0%,0) 50%,",
			"hsla(0,0%,0%,1) 100%),",

			"linear-gradient(to right,",
			"hsl(", h , ", 0%, 50%) 0%,",
			"hsl(", h , ", 100%, 50%) 100%)"].join('');

			this.style.background = bg;
		}
	}
});