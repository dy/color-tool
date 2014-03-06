//TODO connect custom color model, sync with value


(function(){
	Component.register("Picky", {
		options: {
			//Mode to turn on in
			//Default is photoshop one
			mode: {
				default: [],
				get: function(){

				},
				set: function(){
					//TODO: create list of pickers according to the mode passed
				}
			},

			//possible color model to connect. By default - rgba array
			color: {
				default: [0,0,0,0],
				set: function(){

				},
				get: function(){

				}
			},

			//serialized color. Always in sync with this.color
			value: {
				default: '#000'
			}
		},


		states:{
			init: {
				after: {

				}
			},
			ready: {

			}
		}



		//---------API
	})
})()