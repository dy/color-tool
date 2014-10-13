var Color = require('color');
var LinearPicker = require('LinearPicker');

var body = document.body;

describe('1-component pickers', function(){
	var color = new Color('green');

	it('hue', function(){
		var el = document.createElement('div');
		new LinearPicker(el, {
			color: color,
			component: 'hue',
			change: function(){
				// console.log('----change cb')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('saturation', function(){
		var el = document.createElement('div');
		new LinearPicker(el, {
			color: color,
			component: 'saturation',
			change: function(){
				// console.log('----change')
				this.element.style.color = this.color.rgbString();
				this.element.setAttribute('data-color', this.color.rgbString());
			}
		});

		body.appendChild(el);
	});

	it('brightness', function(){

	});

	it('lightness', function(){
		var el = document.createElement('div');
		new LinearPicker(el, {
			color: color,
			component: 'lightness',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('red', function(){
		var el = document.createElement('div');
		new LinearPicker(el, {
			color: color,
			component: 'red',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
			}
		});

		body.appendChild(el);
	});

	it('green', function(){

	});

	it('blue', function(){

	});

	it('alpha', function(){

	});

	it('opacity', function(){

	});

	it('luma', function(){
		xxx
	});



});


describe('2-component pickers', function(){
	it('HL', function(){

	});

	it('SL', function(){

	});

	it('HS', function(){

	});

	it('other', function(){
		xxx
	});
});

describe('Special pickers', function(){
	it('input', function(){

	});

	it('palette', function(){

	});

	it('preview', function(){

	});
});



describe('Picky tests', function(){
	it('Simple case', function(){
		var a = document.createElement('div');

		a.innerHTML = '<div data-picker></div>';
	});

	it.skip('Pipes', function(){
		var a = Picky();
		a.pipe(writableLikeAnInputOrEtc);
	});
});