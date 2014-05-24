/**
* Generic picker class
* Picky.js creates such elements in bulk
*
* Custom pickers extend possible mode values by extension and redefinition `mode`.
*/
//TODO: get rid of or use in full strength
var Picker = Slidy.extend({
	picky: null,
	threshold: 0,
	mode: {
		values: {
			_: {
				change: function(){
					console.log("picker change", this.value)
					// this.picky.fire("change");
				},

				'@picky change': 'render',

				render: function(){
					console.log("undeifned picker render")
				}
			}
		}
	}

})

Picker.register("picker")