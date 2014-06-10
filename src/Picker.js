/**
* Generic picker class
* Picky.js creates such elements in bulk
*
* Custom pickers extend possible mode values by extension and redefinition `mode`.
*/
var Picker = Slidy.extend({
	//color model to reflect value in
	color: null,
	picky: null,

	threshold: 0,

	//component[s] to pick
	component:{
		value: null,
		values: {
			_: {

			}
		},

		order: 2
	},

	//input/slidy mode of picking
	mode: {
		init: function(){
			if(this.tagName === "INPUT") return "input";
		},

		values: {
			//text-input mode
			"input": {
				before: function(){
					console.log("to input mode")
				},

				// change: function(){

				// }
			},

			//slidy mode
			_: {
				before: function(){
					// console.log("before default mode")
				},

				change: function(){
					// console.log("picker change", this.value)
					this.setColor(this.value);

					this.colorChanged();
				},

				'@picky change, colorChanged': function(){
					// console.log("colorChanged")
					this.setValue(this.color);

					this.render();
				}
			}
		},

		order: 3
	}

})

Picker.register("picker")