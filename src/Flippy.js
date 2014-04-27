var imgExtensions = "jpg,png,gif,svg".split(",");

function getSlide(url){
	var img = new Image();
	img.src = url;

	on(img, "load", function(e){
		if (!e.currentTarget.complete) e.currentTarget.complete = true;
	})

	return img;
}

var Flippy = Mod.extend({
	init: function(){
		this._slideshowTimeout = undefined;
		this._animateTimeout = undefined;
		this.$nextSlide = document.createElement("img");
		this.$currentSlide = document.createElement("img");
		this.appendChild(this.$currentSlide);
		this.appendChild(this.$nextSlide);
	},

	created: function(){
		// console.log("created")
	},

	attached: function(){
		// console.log("ready")
		this.current = 0;
		clearTimeout(this._slideshowTimeout);
	},


	//img urls
	slides: {
		value: [],
		change: function(val){
			//remove invalid image urls
			var i = 0;
			while (i < val.length){
				var slideUrl = val[i];
				if (imgExtensions.indexOf(slideUrl.slice(-3)) < 0 ) {
					val.splice(i, 1)
				} else {
					i++
				}
			}
			// console.log(val)
			return val;
		}
	},

	current: {
		value: 0,
		change: function(value){
			//validate value
			try{
				if (typeof value !== "number") throw new Error("Currrent slide must be a number");
			} catch(e){
				return this.current
			}

			//check repeating
			if (value >= this.slides.length) {
				if (!this.repeat) return this.current;
				value = 0;
			}
			if (value < 0){
				if (!this.repeat) return this.current;
				value = this.slides.length - 1;
			}

			//console.log("set current", value)
			var slide = this.slides[value];

			//parse/recognize slide, if it hasn’t been recognized as html
			if (typeof slide === "string"){
				this.slides[value] = getSlide(slide)
			}

			//insert slide to next container
			this.current = value;

			this.slideState = "animating";
		}
	},

	repeat: true,

	slideshow: {
		value: false
	},

	delay: 2000,
	animationDelay: 300,

	//TODO: place slides as images/divs
	placingType: "img",


	slideState: {
		value: 'idle',
		values: {
			//waiting for a new slide
			idle: {
				before: function(){
					console.log("idle")
				},
				'document click': function(){
					console.log(123)
				},
				click: function(){
					console.log(123)
				},
				mouseenter: function(){
					console.log("enter")
					this.slideState = "show";
				},
				'document hello': function(){
					console.log(123)
				},
				after: function(){
					console.log("leave idle")
				}
			},
			show: {
				before: function(fromState){
					//console.log("before show ←", fromState)
					if (fromState === "ready") {
						//instant switch on first entrance
						this.next();
					} else {
						this._slideshowTimeout = setTimeout(this.next, this.delay)
					}
				},

				mouseleave: function(){
					this.slideState = "ready";
				}
			},

			//animating slides
			animating: {
				before: function(fromState){
					console.log("before animating ←", fromState)

					clearTimeout(this._slideshowTimeout);

					var self = this, currentSlide = this.slides[this.current];

					//insert new slide
					this.$nextSlide.src = currentSlide.src;

					this.classList.add("animating")

					//wait for loading, change to state "show"
					this._animateTimeout = setTimeout(function(){
						if (currentSlide.complete){
							self.slideState = fromState;
						} else {
							self._backToState = function(){
								self.slideState = fromState;
							};
							on(currentSlide, "load", self._backToState)
						}
					}, this.animationDelay)
				},

				after: function(){
					this.classList.remove("animating");

					//clean shit
					off(this.slides[this.current], "load", this._backToState)
					delete this._backToState;

					//place new slide
					this.$currentSlide.src = this.$nextSlide.src;
					this.$nextSlide.src = "";
				},

				mouseleave: function(){
					clearTimeout(this._animateTimeout);
					this.slideState = "ready";
				}
			}
		},
		order: 0
	},

	//methods
	next: function(){
		this.current++;
	},

	prev: function(){
		this.current--;
	},

	to: function(number){
		this.current = number;
	},

	stop: function(){
		this.slideState = "ready";
	},

	start: function(){
		this.slideState = "show";
	}

}).register("flippy")