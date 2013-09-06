# jQuery.color-picker
<small>&alpha; release</small>

Generic color picker thing, supplies basic color picking areas.
Cpicker is color picker jQuery plugin that helps to pick colors in a convenient way due to the HSL color system and tracking of used colors.
Look & feel on <a href="http://dmitry-ivanov.me/playground/cpickr">demo page</a>.<br/>
<img src="http://img-fotki.yandex.ru/get/6511/51833996.0/0_996d3_7b5acfda_orig"/>

## Name ideas
* Cpicker
* Colorizer
* Разноцвет
* Colorific
* Chromatic
* Colorado
* Piccolor
* Colorificator
* ColorMan
* ColorConnector
* Chlor
* Colorite
* Colorful
* Fillco
* Coloring
* Clr
* Color glue


## Notes
* Source/Target concepce. How about classes ColorSource/ColorTarget, which controls proper elements
	* Each source, firing change event, causes ColorManager to update all the targets
		* How to catch the value? We can simply remove slideArea dependency, using them only as event emitters
	* How to populate target/sources? Should we create any of them? Basically, passing modes and options isn’t that good because it’s the same as inventing own standard of creating elements
	* Minimal truthful prerequisites:
		* It’s good to pass targets selector, like $.colorite({ targets: $(".color-target")})
		* It’s good to pass sources selector, like $.colorite({ sources: $(".color-source")})
		* It’s good to parse source and target’s attributes in order to init them
			* Source tpl: `<div class="color-source" data-color-source="style.background"></div>`
			* Target tpl: `<div class="color-source" data-color-target="style.background, text"></div>`
			* Source/Target tpl: `<input class="color-source" data-color-target="value" data-color-source="value" value="123"></div>`
				* How to parse/output only one component of model?
					* Alternative notation (Mustache/Ractive/Web-Components-like): `<input value="{{ color.hue }}"></input>`
						* But this requires kind of parser, which isn’t that fast you’d like to (not native one).
					* What about web-components?
						* The only allow an `<template>` element, which isn’t that convenient to use.
							* Is it?
						* Suppose we use web-components. Then how to init them?
					* What about Ractive?
						* 60 unecessary kb.
						* key features - templating, data-binding
						* We can implement that features ourselves.
							* Source tpl: `<!-- color-source --><div style="background: {{ hsb }}">{{ hex }}</div>`
		* What’s difference bw target/source? Is there a situation when you need target to be updated, but no source picked?
			* Seems that no. So, there’s no difference. Source is automatically target.
			* Wishful notation: `<a href="" data-color-bind='{ "text":"{{red}}", "color":"{{hsl}}" }'></a>`

* Popupping moved to the jquery.popupper.js

* Generalized to accept any kind of dragging areas.
	* Areas could be of any form: triangle, circular, plot, line
	* Thumbs easily can be biger than areas itself
	* Cpickr is just a mediator between Color model and Areas regulators. 

* Picker targets can be set up right on target elements: it allows init them with no js at all.

* Basic way of launching cpickr `$(el).cpickr({ mode: "hs"})`
	* So, make container, connect cpickr, viola.
	* That’s why zones have to be rendered separately 

* It should work jquery-independent.

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