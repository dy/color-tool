/* Hue slider */
Picker = Picker.extend({
	mode: {
		values: {
			hue: {
				min: 0,
				max: 360,
				value: 0,
				change: function(){
					this.picky.color.hue = this.value;
				},
				'@picky change': function(){
					//console.log("picky changed")
					this.value = this.picky.color.hue
				}

				//API
				render: function(){
					//console.log("hue render", color)

					//render visuals
					if (this.state !== "ready") return;

					this.updatePosition();

					//model
					var color = this.picky.color;
					var s = color.saturation + "%",
						h = color.hue,
						b = color.lightness + "%";

					//TODO: direction
					//var direction = this.

					//hue
					var direction = this.vertical ? "top" : "right";
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