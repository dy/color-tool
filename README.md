<img src="https://raw.githubusercontent.com/dfcreative/picky/design/logo.png" alt="picky.js"/>

# Picky.js
<small>&alpha; release</small>

Universal color-picker.
Built upon [slidy](), which is built upon [component]().

[Look and feel](http://dmitry-ivanov.me/playground/cpickr)
<img src="http://img-fotki.yandex.ru/get/6511/51833996.0/0_996d3_7b5acfda_orig"/>


## How to use

### Installing

```html
<script src='picky.js'></script>
```

### No-JS

```html
	<div picky mode="hl,s,a" />
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

Defines what color pickers to create.

Array/comma-separated string.
Default is photoshop-like `['sl', 'h', 'a']`.

Possible values:
Any primary color component: `h, s, l, a, r, g, b`
Any combination of a couple of components: `hs, hl, sl, rg, rb, rb`
Other pickers: `palette, web`

You can easily implement your own pickers, look [how]().

#### ✗ `format`

@deprecated - use this in color model

Format to return color in.

Default is `'rgba'`.
Possible values: `hsl, hsla, rgb, rgba, hex`.

Available formats depends on the color library used (no library is used by default). You can connect custom color library (such as [jquery.color](), ...list of libs supported...) by passing it’s constructor to the [`colorLib`]() option.

#### `color`

Color object to use as a basis for retrieving data. By default no color object is used.

#### `keyboard`


## API

Use API just as if you would use native input element:

```js
	var picky = document.getElementById("picky");
	picky.value = '#fff'; //serialized/deserialized color object value
	picky.value = 'white';
	picky.color //color object representing color picked
```

Or if you use jQuery, call

```js
	var picky = $('#picky').data("picky");
	picky.value = '#fff';
	picky.color
```

### Properties

#### `value`

#### Any option value

	Color object representing model of color to pick. All methods are

### Methods

## Events & states
