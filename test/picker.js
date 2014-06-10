describe("1-component pickers", function(){

	var color = {
		hue: 123,
		saturation: 50,
		lightness: 50
	}

	function createPicker(name, options){
		//align options
		options.color = color;
		options.change = function(){
			//change color
			color[this.component] = this.value;

			//update text indicator value
			//TODO
		}

		//create text indicator
		var indicator = document.createElement("input");
		var textPicker = new Picker(indicator, options);
		document.body.appendChild(textPicker)
		//TODO

		//create horizontal picker
		var picker = new Picker(options);
		document.body.appendChild(picker);

		//create vertical picker
		//TODO

		//create circular picker
		//TODO
	}

	it("hue", function(){
		createPicker("hue", {
			component: "hue"
		});

	})

	it("saturation", function(){

	})

	it("brightness", function(){

	})

	it("lightness", function(){

	})

	it("red", function(){

	})

	it("green", function(){

	})

	it("blue", function(){

	})

	it("alpha", function(){

	})

	it("opacity", function(){

	})

	it("luma", function(){
		xxx
	})



})


describe("2-component pickers", function(){
	it("HL", function(){

	})

	it("SL", function(){

	})

	it("HS", function(){

	})

	it("other", function(){
		xxx
	})
})

describe("Special pickers", function(){
	it("input", function(){

	})

	it("palette", function(){

	})

	it("preview", function(){

	})
})