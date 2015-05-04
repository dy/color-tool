<img src="https://raw.githubusercontent.com/dfcreative/picky/design/logo.png" alt="picky.js"/>

[logo - grid of pickers/space ranges]

# Picky

Color picker component.

[badges]

[DEMO page (use case of web color-picker)]

## Use

`$ npm install picky`

```js
	var Picky = require('picky');
	var Color = require('color');

	var c = new Color('red');

	var picker = new Picky({
		color: color,
		space: 'rgb',
		channel: ['red']
	});

	document.body.appendChild(picker.element);
```

## Options

| Name | Description |
|---|---|
| color | Color instance to use as a model. |
| space | Color space to render. |
| channel | Color channel or channels to render in color space. Whether string or array. |
| type | Type of color picker to set up: `horizontal`, `vertical`, `rectangular`, `radial`, `polar` or other. |




[![NPM](https://nodei.co/npm/slidy.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/slidy/)