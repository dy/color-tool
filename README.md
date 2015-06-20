Multipurpose color picker component.

[![alt](https://travis-ci.org/dfcreative/color-tool.svg?branch=master)](https://travis-ci.org/dfcreative/color-tool)
[![alt](https://codeclimate.com/github/dfcreative/color-tool/badges/gpa.svg)](https://codeclimate.com/github/dfcreative/color-tool)
[![alt](https://david-dm.org/dfcreative/color-tool.svg)](https://david-dm.org/dfcreative/color-tool)
[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

**[Demo](https://dfcreative.github.io/picky)**

## Use

[![NPM](https://nodei.co/npm/color-tool.png?mini=true)](https://nodei.co/npm/color-tool/)

```js
	var ColorPicker = require('color-tool');
	var Color = require('color2');

	var c = new Color('red');

	var picker = new ColorPicker({
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
| space | Color space to render. See [list of available spaces](http://github.com/dfcreative/color-space). |
| channel | Color channel(s) to render in color space. Whether string or array. |
| type | Type of color picker to set up: `horizontal`, `vertical`, `rectangular`, `radial`, `polar` or other. |