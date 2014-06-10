/* Hue picker */
Picker = Picker.extend({
	component: {
		values: {
			'hue': {
				min: 0,
				max: 360,

				before: function(){
					// console.log("before hue")
				},

				setColor: function(value){
					// console.log("huepicker setColor", value)
					this.color.hue = value;
				},
				setValue: function(color){
					// console.log("huepicker setValue", color)
					this.value = color.hue
				},

				//API
				render: function(){
					console.log("hue render", this.color)

					//model
					var color = this.color;
					var s = color.saturation + "%",
						h = color.hue,
						b = color.lightness + "%";

					//TODO: direction
					//var direction = this.

					//hue
					var direction = this.type === "vertical" ? "top" : "right";
					var bg = ["linear-gradient(to " + direction + ",",
						"hsl(0," + s + "," + b + "%) 0%,",
						"hsl(60," + s + "," + b + "%) 16.666%,",
						"hsl(120," + s + "," + b + "%) 33.333%,",
						"hsl(180," + s + "," + b + "%) 50%,",
						"hsl(240," + s + "," + b + "%) 66.666%,",
						"hsl(300," + s + "," + b + "%) 83.333%,",
						"hsl(360," + s + "," + b + "%) 100%)"].join("");

					this.style.background = bg;
				}
			}
		}
	}
});