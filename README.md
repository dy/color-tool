<img src="https://raw.githubusercontent.com/dfcreative/picky/design/logo.png" alt="picky.js"/>

<small>WIP</small>

Universal color-picker.
Built using [slidy]() and [mod]().

[Look and feel](http://dmitry-ivanov.me/playground/cpickr)
<img src="http://img-fotki.yandex.ru/get/6511/51833996.0/0_996d3_7b5acfda_orig"/>


## Use

### Add script

```html
<script src='picky.min.js'></script>
```

### No-JS

```html
	<div class="picky" mode="hl,s,a" />
```

### Vanilla

```js
	var colorPicky = new Picky({
		mode: ["hs","l", "a"]
	})
	document.body.appendChild(colorPicky)
```

### jQuery/Zepto/[$](list of jQuery substitutors)

```js
	$("<div/>").picky({ mode: "r,g,b" }).after("#element");
```


## Options

#### `mode`

Defines which color pickers to create.

Array/comma-separated string.
Default is photoshop-like `['sl', 'h', 'a']`.

Possible values:
Any primary color component: `h, s, l, a, r, g, b`
Any combination of a couple of components: `hs, hl, sl, rg, rb, rb`
Other pickers: `palette, web`

You can easily implement your own pickers, look [how]().

#### `color`

Color object to use as a basis for retrieving data. By default no color object is used.


## API

Use API just as if you would use native input element:

```js
	var picky = document.getElementById("picky");
	picky.value = '#fff'; //serialized/deserialized color object value
	picky.value = 'white';
	picky.color //color object representing color picked
```