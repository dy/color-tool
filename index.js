var Picker = require('color-picky');
var q = require('queried');

/** Init first big demo picker */

var demoPickerEl = q('.section-demo-picker');

new Picker(demoPickerEl, {
	space: 'lab',
	channel: ['lightness', 'a']
});
