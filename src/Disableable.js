//TODO: make this innate component property
/**
* Enable element turning off listening oneself
* as well as add useful callbacks
*/
(function(){
	var Disableable = Behaviour.register({
		methods: {
			disable: function(){
				this._lastState = this.state;
				this.state = "disabled";
				this.fire('disable');
			},
			enable: function(){
				this.state = this._lastState;
				this.fire('enable');
			}
		},

		states: {
			enabled:{
				before: function(){
					this._observer.observe(this, this._observeConfig);
				}
			},

			disabled: {
				before: function(){
					this._observer.disconnect();
				}
			}
		}
	})
})(window)