# jQuery.color-picker
<small>&alpha; release</small>

Generic color picker thing, supplies basic color picking areas.
Cpicker is color picker jQuery plugin that helps to pick colors in a convenient way due to the HSL color system and tracking of used colors.
Look & feel on <a href="http://dmitry-ivanov.me/playground/cpickr">demo page</a>.<br/>
<img src="http://img-fotki.yandex.ru/get/6511/51833996.0/0_996d3_7b5acfda_orig"/>

## Notes
* Popupping moved to the jquery.popupper.js

* Generalized to accept any kind of dragging areas.
	* Areas could be of any form: triangle, circular, plot, line
	* Thumbs easily can be biger than areas itself
	* Cpickr is just a mediator between Color model and Areas regulators. 

* Picker targets can be set up right on target elements: it allows init them with no js at all.


## Features
* Convenient way of picking
* Multitude of targets
* Flexible picking areas

## How to use
1. Put 
```html
		<script src='js/Color.js'></script>
		<script src='js/jquery.cpickr.js'></script>
```
2. Add class `cpickr` on any desired element which should become a color picker; or you can call it like `$(".element").cpickr({/*options*/})`, passing options via data-attributes or straight to the constructor.

## Options


## Methods of API
Cpickr object with methods could be retrieved by `var cpickrInstance = $('.element').data("cpickr")`