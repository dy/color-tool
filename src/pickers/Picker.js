/**
* Generic picker class
* Picky.js creates such elements in bulk.
*/
//TODO: get rid of or use in full strength
Component.register("Picker", {
	extends: "Slidy",

	options: {
		picky: null,
		threshold: 0
	},

	states: {
		'ready, input': {
			change: function(){
				console.log("picker change", this.value)
				this.picky.fire("change");
			},

			'$.picky change': 'render'
		}
	},

	autoinit: false
})