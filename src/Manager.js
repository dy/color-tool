/*
Manager - glue for pickers.
*/


/* ---------------- utils --------------------*/
//extends a with the tail passed
function extend(a){
	for (var i = 1, l = arguments.length; i<l; i++){
		var b = arguments[i];
		for (var k in b){
			a[k] = b[k]
		}	
	}
	return a
}

var ignoreTags = 'APPLET BASE BASEFONT BODY FRAME FRAMESET HEAD HTML ISINDEX LINK META NOFRAMES NOSCRIPT OBJECT PARAM SCRIPT STYLE TITLE'.split( ' ' )


/* ---------------- Class ----------------------*/
//define Color class - one of the jQuery, Graphics or any other
var Color = jQuery.Color || G.Color || Color;

function Manager(el, options){
	this.create(el, options);
}

Manager.prototype = {
	options: {
		color: null,
		pickers: null
	},

	create: function(el, opts){
		//init element
		if (el) {
			this.el = el;
		} else {
			//create element, if none passed
			this.el = document.createElement("div");
			document.body.appendChild(this.el);
		}

		//init options
		this.options = extend({}, this.options);
		if (opts) {
			this.options = extend(this.options, opts)
		}

		//define color property
		Object.defineProperty(this, "color", {
			get: function(){return color},
			set: function(c){
				color = c;
				this.updatePickers();
			},
			enumerable: true,
			configurable: true
		})

		//init color, update pickers
		this.color = new Color(this.options.color);

		//init pickers
		this.pickers = [];
		var pickers;

		//init external pickers (passed through the options)
		if (opts.pickers){
			if (typeof opts.pickers === "string"){
				//selector
				pickers = document.querySelectorAll(opts.pickers);
			} else if (opts.pickers.length){
				//array (set)
				pickers = opts.pickers;
			}
		} else {
			pickers = [];
		}

		for (var i = 0, l = pickers.length; i < l; i++){
			this.addPicker(pickers[i]);
		}

		//init inner pickers (inside the container)
		var innerPickers = this.el.childNodes;

		for (var i = 0, l = innerPickers.length; i < l; i++ ){
			if (ignoreTags.indexOf(innerPickers[i].tagName) < 0) continue; //ignore unsafe tags
			if (innerPickers[i].nodeType === 1) this.addPicker(innerPickers[i]);
		}

		this.updatePickers();
	},

	//Go through all known pickers, updating each of them with the passed color
	updatePickers: function(color){
		var o = this.options;

		color = color || this.color;

		for (var i = 0, l = this.pickers && this.pickers.length; i < l; i++){
			this.pickers[i].set(color)
		}
	},

	//hooks up new picker
	addPicker: function(el){
		var pickerClass = el.getAttribute("data-picker-type") || this.detectPickerType(el);

		if (!pickerClass || !pickers[pickerClass]) return false;

		this.pickers.push(new pickers[pickerClass](el, this, this.color));
	},

	//returns picker class based on the type of node.
	detectPickerType: function(node){
		//simple text
		if (node.nodeType === 3) {
			return "TextPicker"
		}

		//input
		if (node.tagName === "INPUT"){
			var type = node.getAttribute("type")
			if (node.getAttribute("type") === "color"){
				//special color input
				return "ColorInputPicker"
			} else if (node.getAttribute("type") === "text" || !node.getAttribute("type")) {
				//simple text input
				return "TextInputPicker"
			} else {
				//any other input
				return ""
			}
		} else if (node.tagName === "TEXTAREA"){
			return "TextInputPicker"
		}

		//any other area picker or undefined picker
		if (node.nodeType === 1){
			//TODO: init slide-area
		}
	}
}