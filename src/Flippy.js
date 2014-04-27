var imgExtensions = "jpg,png,gif,svg".split(",");

function getSlide(url){
	var img = new Image();
	img.src = url;

	on(img, "load", function(e){
		if (!e.currentTarget.complete) e.currentTarget.complete = true;
	})

	return img;
}

Component.register("Flippy", {
	options: {
		//img urls
		slides: [],

		current: {
			value: 0,
			set: function(value){
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
				return value;
			},
			change: function(value){
				this.state = "animating";
			}
		},

		repeat: true,

		slideshow: {
			value: false
		},

		delay: 2000,
		animationDelay: 300,

		//TODO: place slides as images/divs
		placingType: "img"
	},

	states: {
		init: {
			before: function(){
				this._slideshowTimeout = undefined;
				this._animateTimeout = undefined;
				this.$nextSlide = document.createElement("img");
				this.$currentSlide = document.createElement("img");
				this.appendChild(this.$currentSlide);
				this.appendChild(this.$nextSlide);
			},

			after: function(){
				//remove invalid image urls
				var i = 0;
				while (i < this.slides.length){
					var slideUrl = this.slides[i];
					if (imgExtensions.indexOf(slideUrl.slice(-3)) < 0 ) {
						this.slides.splice(i, 1)
					} else {
						i++
					}
				}

				//load first image
				this.slides[this.current] = getSlide(this.slides[this.current]);
				this.$currentSlide.src = this.slides[this.current].src;
			}
		},

		// mouseenter: function(){console.log("in")},
		// mouseleave: function(){console.log("out")}
		//rests
		ready: {
			before: function(){
				//console.log("ready")
				clearTimeout(this._slideshowTimeout);

				this.current = 0;
			},

			mouseenter: function(){
				this.state = "show";
			}
		},

		//waiting for a new slide
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
				this.state = "ready";
			}
		},

		//animating slides
		animating: {
			before: function(fromState){
				//console.log("before animating ←", fromState)

				clearTimeout(this._slideshowTimeout);

				var self = this, currentSlide = this.slides[this.current];

				//insert new slide
				this.$nextSlide.src = currentSlide.src;

				this.classList.add("animating")

				//wait for loading, change to state "show"
				this._animateTimeout = setTimeout(function(){
					if (currentSlide.complete){
						self.state = fromState;
					} else {
						self._backToState = function(){
							self.state = fromState;
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
				this.state = "ready";
			}
		}
	},

	methods: {
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
			this.state = "ready";
		},

		start: function(){
			this.state = "show";
		}
	}
})