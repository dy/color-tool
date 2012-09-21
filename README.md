Cpicker &mdash; Neat & lite jQuery color picker with color stack & visual helpers
===============================
<small>&alpha; release</small>
TODO:
minimal working version:
-minification
<p>
Cpicker is color picker jQuery plugin that helps to pick colors quickly in a natural way due to the HSL color system and tracking of used colors.
Primarily intended to use in <a href="https://github.com/dfcreative/typer">Typer</a> - typographic prototyping in-browser application, but grown to the sterling jquery plugin. Based on <a href="https://github.com/jquery/jquery-color">jquery-color</a>.
Look & feel on <a href="http://dmitry-ivanov.me/playground/cpickr">demo page</a>.<br/>
<img src="http://img-fotki.yandex.ru/get/6511/51833996.0/0_996d3_7b5acfda_orig"/>
</p>
<p>
You can use shortcuts to drive color picker:
</p>
<ul>
	<li>↑/↓ to change value of selected color component</li>
	<li>↲ accept color</li>
</ul>

<h2>Features</h2>
<ul class="features">
<li class="feature">Substitute of <code/>&lt;input type="color"></code> element</li>
<li class="feature">Increase/decrease color components in input field</li>
</ul>

<h2>How to use</h2>
<ol>
	<li>Put <code>
		<script src='js/jquery.color.js'></script>
		<script src='js/jquery.cpickr.js'></script>
	</code> to</li>
	<li>Call <code>$('.some-element').cpickr();</code> somewhere in your code</li>
	<li>Enjoy!</li>
</ol>


<h2>Options</h2>
<p>You can customize picker by passing <code>options</code> object to the constructor, like so: <br/>
	<code>$('.some-element').cpickr({/*options*/})</code>
	Let's see what options are useful.
</p>
<dl>
	<dt><dfn>placementStrategy</dfn></dt>
	<dd> - intended to change way of color picker to appear [image] [examples] [demo]</dd>
</dl>

<h2>Events</h2>
<p>Event callback obtains color picker controller as only argument.
</p>
<dl>
	<dt><dfn>show(cp)</dfn></dt>
	<dd>Called when color picker showed.</dd>

	<dt><dfn>hide(cp)</dfn></dt>
	<dd>Called when color picker hided.</dd>

	<dt><dfn>dragStart(cp)</dfn></dt>
	<dd>Called when some of pickers started to drag.</dd>

	<dt><dfn>drag(cp)</dfn></dt>
	<dd>Called on each step of dragging one of pickers.</dd>

	<dt><dfn>dragStop(cp)</dfn></dt>
	<dd>Called when dragging stopped.</dd>

	<dt><dfn>resize(cp)</dfn></dt>
	<dd>Called on each step of resizing.</dd>

	<dt><dfn>change(cp)</dfn></dt>
	<dd>Called on every changing of value in model, i.e. in target input.</dd>

</dl>

<h2>Methods</h2>