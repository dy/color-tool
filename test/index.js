var Color = require('color');
var Picker = require('../');

var body = document.body;
var color = new Color('green');

describe('1-component pickers', function(){

	it('hue', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: ['hue'],
			change: function () {
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('saturation', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: 'saturation',
			change: function(){
				// console.log('----change')
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
				this.element.setAttribute('data-color', this.color.hslString());
			}
		});

		body.appendChild(el);
	});

	it('brightness', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsv',
			channel: 'value',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('lightness', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: 'lightness',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('red', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			channel: 'red',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('green', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			channel: 'green',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('blue', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			channel: 'blue',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it.skip('alpha', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			channel: 'alpha',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbaString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it.skip('value/brightness', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			channel: 'value',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it('cyan', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'cmyk',
			channel: 'cyan',
			change: function(){
				// console.log('----change')
				this.element.setAttribute('data-color', this.color.rgbString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});

		body.appendChild(el);
	});

	it.skip('magenta', function(){

	});

	it.skip('yellow', function(){

	});

	it.skip('black', function(){

	});

	it.skip('whiteness', function(){

	});

	it.skip('blackness', function(){

	});

	it.skip('L', function(){

	});

	it.skip('a', function(){

	});

	it.skip('b', function(){

	});
});


describe('2-component pickers', function(){
	it('HL', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: ['hue', 'saturation'],
			change: function(){
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});
		el.classList.add('picky-rect');

		body.appendChild(el);
	});

	it('SL', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: ['saturation', 'lightness'],
			change: function(){
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});
		el.classList.add('picky-rect');

		body.appendChild(el);
	});

	it('HS', function(){
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: ['hue', 'saturation'],
			change: function(){
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});
		el.classList.add('picky-rect');

		body.appendChild(el);
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


describe('Cases', function () {
	it('Fullscreen', function () {
		var el = document.createElement('div');
		new Picker(el, {
			color: color,
			space: 'hsl',
			channel: ['saturation'],
			step: 10,
			change: function () {
				this.element.setAttribute('data-color', this.color.hslString());
				this.element.style.color = this.color.rgbString();
				this.element.firstChild.style.color = this.color.rgbString();
			}
		});
		el.classList.add('picky-fullscreen');

		body.appendChild(el);
	});
});