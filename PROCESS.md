## Name ideas
* colorpicker
* color-picker2
* Cpicker
* Colorizer
* Разноцвет
* Colorific
* Chromatic
* Colorado
* Piccolo
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
* Gay
* Fairy
* ✘ Picky
	* Associates with color-picker
	* Short
	* Other sense (haughty)
	* ✘ picky mode
	- too unclear
	- doesn’t start with color
* ✔ color-pickers
	+ generic name
	+ starts with color
	+ not taken npm-name
	+ reflects a lot of color-picker use-cases
* color-tool
	+ wiky article
	+ starts with color
	+ more generic than picker

## Notes
* Source/Target concept.
	* ✗ Each source, firing change event, causes ColorManager to update all the targets
	* ✘ How to populate target/sources? Should we create any of them? Basically, passing modes and options isn’t that good because it’s the same as inventing own standard of creating elements
	* Minimal reliable prerequisites:
		* ✗ It’s good to pass targets selector, like $.colorite({ targets: $(".color-target")})
		* ✗ It’s good to pass sources selector, like $.colorite({ sources: $(".color-source")})
		* ✘ It’s good to parse source and target’s attributes in order to init them
			* Source tpl: `<div class="color-source" data-color-source="style.background"></div>`
			* Target tpl: `<div class="color-source" data-color-target="style.background, text"></div>`
			* Source/Target tpl: `<input class="color-source" data-color-target="value" data-color-source="value" value="123"></div>`
				* How to parse/output only one component of model?
					* ✔ Alternative notation (Mustache/Ractive/Web-Components-like): `<input value="{{ color.hue }}"></input>`
						* But this requires kind of parser, which isn’t that fast you’d like to (not native one).
					* ✔ What about web-components?
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

* ✔ Popupping moved to the jquery.popupper.js

* Generalized to accept any kind of dragging areas.
	* ✔ Areas could be of any form: triangle, circular, plot, line → Slidy.js
	* Thumbs easily can be biger than areas itself
	* Cpickr is just a mediator between Color model and Area regulators (Pickers).

* Picker targets can be set up right on target elements: it allows init them with no js at all.

* Basic way of launching cpickr `$(el).picky({ mode: "hs"})`
	* So, make container, connect cpickr, viola.
	* That’s why zones have to be rendered separately

* ✔ It should work jquery-independent.
	* And any-lib independent too: if there’re no external libs hooked up (popupper etc), call _own simplistic methods_.

* ✗ How to pass functions to options of a specific picker?

* The concept
	* lots of different pickers for different modes: hs, hl, ls, h, l, etc, each has own behaviour
	* Targets are easily bound component-expose way, by automatic exposing color values to the global (all color values)

* Each picker is a duplex stream;

* ✔ There’s no Picky class. Everything is a picker. Picker can pick the full color and consist of sub-pickers. Picker is the final point.
	* If you want to create custom picker, do it programmatically, it’s easy: just extend class Picker and include sub-pickers you need, that’s all.

* Color object can be programmatically shared between pickers - in that case, pickers are bound;
	* Otherwise, color is parsed from the attributes.


* DO Russian version on a site by the goodui guidelines.

* The product has a very narrow audience and high competitional standards.
You have to implement some exclusive feature to make use exactly this one picker. Which is that?
	* Relative palettes (exists)
	* Lab space (rare, interesting)
	* Real Palette? Like luma etc
	* Multiple pickers, connected by line
	* Inverted picking style (bg is a picker)
	* Triangle picker
	* Any kind of picker (versality)
	* Circular palette pickers (in examples)
	* Image picker
	* Natural colors picker
	* Pantone picker
	*

* Competitors
	* System picker (especially osx)
	* Photoshop picker and alike

* Comparison table: Name | Value | Ideal case
	* SEO | Easy to google | First item
	* Features | Versatility to use | All the common use-cases
	* Speed | UX satisfaction | As native
	* Conventions | Easy to install | jQuery plugin / module / web-coomponent
	* Docs | Easy to solve troubles | FAQed every issue
	* Badges, tests | Subconscious trust | as 6to5
	* Demo page | Engagement | Concise & maximally intuitive