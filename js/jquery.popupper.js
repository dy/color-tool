;(function ($){
	var pluginName = "popupper",
		containerClass = "popuppee",
		$doc = $(document),
		$body = $(document.body),
		$wnd = $(window)


	//Popupper class
	var P = $[pluginName] = function (el, opts){
		this.target = $(el);
		this.create(opts);
	}


	//Static
	$.extend(P, {
		nextTargetId: 0,

		types: {
			//some_type: { "event [target|container|close|outside|selector] delay": "method" | ["method", ..] | function(){return methName} }
			//TODO: handle list of methods
			tooltip: {
				position: "top",
				tip: true,
				tipalign: .5,
				align: "center",
				states: {
					"inactive":{
						"mouseenter target 1000": "show"
					},
					"active":{
						"mouseleave target 1000": "hide"
					}
				}
			},
			popover: {
				position: "top",
				tip: true,
				states: {//TODO
					/*"mouseenter target 50": "show",
					"click target 0": "show",
					"mouseenter container 0": "show",
					"mouseleave target 200": "hide",
					"mouseleave container 200": "hide"*/
				}			
			},
			overlay: {
				position: "center",
				close: "✕",
				overlay: true,
				tip: false,
				autolaunch: true,
				preventDefault: true,
				states: {
					"inactive": {
						"click target 50": "show",
						"click target 0": "showOverlay"
					},
					"active": {
						"click outside 0": "hide",
						"click outside 50": "hideOverlay",
						"click close 0": "hide",
						"click close 50": "hideOverlay",
						"keyup escape 0": "hide",
						"keyup escape 50": "hideOverlay"
					}
				}			
			},
			dropdown: {
				position: "bottom",
				tip: true,
				align: 0,
				preventDefault: true,
				states: {
					"inactive": {
						"mouseenter container": "show",
						"click target": "show",
					},
					"active": {
						"mouseenter container": "show",
						"mouseenter target": "show",
						"click outside": "hide",
						"click target": "hide",
						"mouseleave container 1500": "hide",
						"mouseleave target 1500": "hide",
						"keyup escape": "hide"
					},
				}
			},
			sideMenu: {
				//TODO
			},
			dialog: {
				//TODO
			},
			modal: {
				//TODO
			},
			zoomer: {
				//TODO
			},
			imageZoomer: {
				//TODO
				position: "over",
				states: {
					/*"click target": "show",
					"click container": "hide",
					"mouseleave container 2500": "hide"*/
				}
			}
		},

		defaults: {
			animDuration: null,
			animInClass: "in",
			animOutClass: "out",
			animClass: "animated",

			overlayInClass: "in",
			overlayOutClass: "out",

			activeClass: "active",
			containerClass: "", //TODO: additional container class

			content: null, //Selector, element, jquery-object, html-string, function atc			
			container: $body, //Where to place in popupped content-container
			targets: null, //selector, array of objects etc. Synonims of current target. Each target shares container
			cloneContent: false, //Whether to clone or replace content element
			lazyContent: false, //defer loading of content

			autolaunch: false, //whether to start on init

			type: "tooltip", //tooltip, popover, overlay, dropdown, custom
			states: null, //custom behaviour could be redefined

			close: false, //false (don’t show close) or string with text
			overlay: false, //Just indicates need to create overlay
			preventDefault: false,

			position: "top", //top, left, bottom, right, center (for overlays), over (hiding element)
			align: "center", //0 - by left, 1 - by right, .5 - by center, "left", "top", "right", "bottom", "center"
			tip: true,
			tipAlign: "center",

			avoid: null, //selector of elements to avoid overlapping with
			single: false, //instantly close other dropdowns when one shows

			//Callbacks
			show: null, //before show
			hide: null //after hide
		},

		CENTER: 0,
		TOP: 1,
		RIGHT: 2,
		BOTTOM: 3,
		LEFT: 4,
		OVER: 5,

		//Just generates unique id
		getTargetId: function(target){
			return ++P.nextTargetId;
		},

		//Cache of targets: id ~ popupper-controller
		targets: {},

		//Calls method of target
		//TODO: make arguments support
		targetMethod: function(targetId, methName){
			var target = P.targets[targetId];
			target[methName].apply(target, []);
		},

		//Should automatically be shown?
		isAutolaunchPlanned: false,

		//Key aliases
		keyMap: {
			"esc": 27,
			"escape": 27,
			"up": 38,
			"down": 40,
			"left": 37,
			"right": 39,
			"enter": 13
			//TODO: make full keymap
		}
	})


	//Instance
	$.extend(P.prototype, {
		create: function (opts) {
			var self = this;

			self.options = $.extend({}, P.defaults);
			$.extend(self.options, P.types[opts.type || self.options.type]);
			$.extend(self.options, opts);

			var o = self.options;

			if (o.off) return; //TODO: fix to work correctly

			self.timeouts = {}; //Cache of keyed timeouts of delayed functions

			self.active = false; //true only when visible and no any animations are in progress. Not the same as activeClass

			self.outsideDelays = {}; //for dropdowns (list of delays for outside click)

			self.position = P.TOP; //current position of container

			//Remove title from target
			self.title = self.target.attr("title");
			self.target.removeAttr("title");

			//Hook href or for as content, if possible
			var href = self.target.attr("href"),
				forAttr = self.target.attr("for"),
				dataFor = o['for'],
				extContent = (href || forAttr || dataFor);
			if (!o.content && extContent){
				if (extContent[0] === "#") {
					o.content = $(extContent);
				} else {
					//TODO: test if img
					//TODO: test if external document
					//TODO: test if font?
				}
			}

			self.target.addClass(pluginName + "-target");
			self.targetId = P.getTargetId(self.target);
			self.target.addClass(pluginName + "-target-" + self.targetId); //make unique id for each target

			self.eventClass = ".target" + self.targetId; //to differentiate events

			//Initial content comprehension
			if (!o.content){
				if (self.title) {
					o.content = self.title;
				} else {
					o.content = "No content defined for target " + self.targetId
				}
			} else {
				//Is content a selector?
				if (o.content[0] == '.' || o.content[0] == '#' || o.content.nodeType === 1 || o.content instanceof $.fn.constructor) {
					o.content = $(o.content).last();
				}

				if (o.cloneContent){
					o.content = o.content.clone(true, true);
				} else if (typeof o.content !== "string") { //ensure content is evaled as $-set
					//If content is already taken — share it
					if (o.content.parent().hasClass(containerClass)){
						self.sharedContent = true;
						var p = o.content.parent();
						//Notify first target about sharing content
						if (!p.hasClass(containerClass + "-shared")) {
							p.addClass(containerClass + "-shared");
							P.targets[p.data("target-id")].sharedContent = true;
						}
					} else {
						o.content.detach();
					}
					o.content.removeAttr("hidden");
				} else if (typeof o.content === "string") { //content is still string - probably, http or something like
					//if (/^http:\/\//.test(o.content))
				}
			}

			//keep cache of created targets
			P.targets[self.targetId] = self;

			//sort out shared content
			if (!self.container) {
				self.container = $(self.containerTpl()).appendTo(o.container);
				if (!self.sharedContent) { //prevent withdrawal from the first owner
					self.container.append(o.content);
				}
			}

			//create overlay blind
			if (o.overlay){
				if (!P.overlay) {
					P.overlay = $('<div class="' + pluginName + '-overlay-blind" hidden/>').appendTo($body)
				}
				self.overlay = P.overlay;
			}

			//create tip
			if (o.tip) {
				self.tipContainer = $('<div class="' + containerClass + '-tip-container"></div>').appendTo(self.container);
				self.tip = $('<div class="' + containerClass + '-tip " data-tip="top"/>').appendTo(self.tipContainer);
			}

			//Set alignment of contianer
			self.align = self.getAlignValue(o.align);			

			if (o.tipAlign) {
				self.tipAlign = self.getAlignValue(o.tipAlign);
			}

			//correct anim duration, if passed one
			if (o.animDuration || o.animDuration === 0){ //set duration through options
				self.setAnimDuration(o.animDuration);
			} else { //get duration from css
				o.animDuration = self.getAnimDuration();
			}

			//set state
			self.changeState("inactive");

			//keep links clear
			if (o.preventDefault) {
				self.target.click(function(){return false;})
			}

			//Make autostart, if needed
			if (o.autolaunch
				&& o.content instanceof $.fn.constructor
				&& window.location.hash == "#" + o.content.attr("id") 
				&& !P.activeTargetId
				&& !P.isAutolaunchPlanned){
				P.isAutolaunchPlanned = true;
				self.target.click();
				setTimeout(function(){
					$wnd.scrollTop(0);
				})
			}

			return self;
		},

		changeState: function(state){
			var self = this, o = self.options;

			self.unbindEvents();
			self.state && o.states[self.state].leave && o.states[self.state].leave();

			self.state = state;

			o.states[self.state].enter && o.states[self.state].enter();
			self.bindEvents();
		},

		bindEvents: function(){
			var self = this, o = self.options;

			var bindings = o.states[self.state];

			for (var bindStr in bindings){
				self.bindString(bindStr, bindings[bindStr])
			}

			return self;
		},

		unbindEvents: function () {
			var self = this, o = self.options;

			if (!self.state) return;

			var bindings = o.states[self.state];

			for (var bindStr in bindings){
				self.unbindString(bindStr, bindings[bindStr])
			}
			
			return self;
		},

		bindString: function(bindStr, methName){
			var self = this, o = self.options;
			var props = bindStr.split(" "),
				evt = props[0], selector = props[1], delay = ~~(props[2]), meth, whichKey,
				evtPostfix = "." + self.state + "-" + self.targetId, 
				group = "container" //group is keyword to mutually suppress methods called within one
				//TODO: fix wrong kbd bindings

			//define method
			if ($.isFunction(methName)){
				meth = methName;
			} else {
				meth = self[methName].bind(self);
				group = self[methName].group;
			}

			//bind kbd
			if (evt == "keypress" || evt == "keydown" || evt == "keyup") {
				whichKey = (P.keyMap[selector] || selector);
				$doc.on(evt + evtPostfix, function(e){
					if (!whichKey || e.which === whichKey){
						self.delayedCall( function() {meth.call(self, e)}, delay, group)
					}
				})
				return;
			}

			switch (selector) {
				case "outside":
					//only click outside supported
					//special case that blocks any other events while it lasts 
					//e.g. do not return dropdown on hover if clicked outside
					self.outsideDelays[methName] = delay || 0;
					return;
				case "target":
					selector = self.target;
					break;
				case "container":
					selector = self.container;
					break;
				case "close":
					selector = $("." + containerClass + "-close", self.container);
					break;
				default:
					selector = $(selector);
			}

			selector.on(evt + evtPostfix, function(e){
				//console.log(time() + evt + " on " + e.currentTarget.classList[0] + "-" + self.targetId + " → " + methName + " after " + delay)
				//TODO: case when mouseenter on tip-container   
				//if (e.target != e.currentTarget) return true; //if event is inside of container/target
				//if (self.tipContainer[0] == e.target) return true;
				self.delayedCall( function() { meth.call(self, e) }, delay, group);				
			});
		},

		unbindString: function(bindStr, methName){
			var self = this, o = self.options;
			var props = bindStr.split(" "),
				evt = props[0], selector = props[1],
				evtPostfix = "." + self.state + "-" + self.targetId;

			//bind kbd
			if (evt == "keypress" || evt == "keydown" || evt == "keyup") {
				$doc.off(evt + evtPostfix)
				return;
			}

			switch (selector) {
				case "outside":
					delete self.outsideDelays[methName];
					return;
				case "target":
					selector = self.target;
					break;
				case "container":
					selector = self.container;
					break;
				case "close":
					selector = $("." + containerClass + "-close", self.container);
					break;
				default:
					selector = $(selector);
			}

			selector.off(evt + evtPostfix);
		},

		//Call method after @delay ms. @key is a group of other delayed calls to deny.
		delayedCall: function(fn, delay, key){
			var self = this;

			key == null && (key = 'none');
			self.clearDelayedCalls(key);

			if (delay) {
				self.timeouts[key] = setTimeout(fn, delay)
			} else {
				fn();
			}
		},

		//Clears delayed calls
		clearDelayedCalls: function(key){
			var self = this;
			if (typeof key == "string"){
				clearInterval(self.timeouts[key]);
			} else if (key instanceof Array) {
				for (var i = key.length; i--;){
					clearInterval(self.timeouts[key[i]]);	
				}
			} else {
				for (var k in self.timeouts){
					clearInterval(self.timeouts[k]);
				}
			}
		},


		//Returns numeric align value
		getAlignValue: function(align){
			var result = 0;
			switch (align){
				case "top":
				case "left":
					return 0;
					break;
				case "bottom":
				case "right":
					return 1;
					break;
				case "center":
				case "middle":
					return .5;
					break;
				default:
					return parseInt(align) || result;
			}
		},

		setAnimDuration: function(dur){
			var self = this, o = self.options;
			dur == null && (dur = o.animDuration);
			dur += "ms";
			self.container.css({
				'-webkit-animation-duration': dur,
				'-khtml-animation-duration': dur,
				'-moz-animation-duration': dur,
				'-o-animation-duration': dur,
				'animation-duration': dur
			})

			return self;
		},

		getAnimDuration: function(){
			var self = this, o = self.options;

			var dur = self.container.css("animation-duration") ||
			self.container.css("-webkit-animation-duration") ||
			self.container.css("-moz-animation-duration") ||
			self.container.css("-o-animation-duration") ||
			self.container.css("-khtml-animation-duration");

			var unit = dur.slice(-2);
			if (unit == "ms"){
				dur = parseInt(dur)
			} else {
				dur = parseFloat(dur) * 1000
			}
			return dur;
		},

		//Intent action: make it next after the current action
		clearIntents: function(){
			var self = this, o = self.options;
			//console.log(time() + "clearIntents " + o.type + "-"+self.targetId)
			this.clearShowIntent();
			this.clearHideIntent();
		},

		clearShowIntent: function(){
			var self = this;
			self.container.off("hide." + containerClass + self.eventClass);
			if (self.externalBind) {
				//console.log("OFF " + self.externalBind + "hide." + containerClass + self.eventClass)
				P.targets[self.externalBind].container.off("hide." + containerClass + self.eventClass)
			}
		},

		clearHideIntent: function(){
			this.container.off("afterShow." + containerClass + self.eventClass);
		},

		showAfterHide: function(){
			var self = this, o = self.options;
			//console.log(time() + "showAfterHide")
			self.clearIntents();

			self.container.one("hide." + containerClass + self.eventClass, self.show.bind(self));

			return self;
		},

		hideAfterShow: function(){
			var self = this, o = self.options;
			//console.log(time() + "hideAfterShow")
			self.clearIntents();

			self.container.one("afterShow." + containerClass + self.eventClass, self.hide.bind(self))

			return self;
		},

		//API
		show: function(){
			var self = this, o = self.options;
			//console.log(time() + "show " + o.type + "-" + self.targetId)
			if (!self.checkShowConditions()) {
				return self;
			}

			if (o.single) {
				self.closeSiblings();
			}

			self.container.removeAttr('hidden');
			
			//evts & callbacks
			self.target.trigger("show");
			self.container.trigger("show");
			o.show && o.show.apply(this);			

			self.move();

			//Active class used for styles
			//shows whether element is showing/intending to show or hiding/intending to hide.
			self.target.addClass(o.activeClass);
			self.changeState("active");
			self.container.removeClass(o.animOutClass).addClass(o.animClass + " " + o.animInClass);			
			
			self.delayedCall(function(){
				self.container.removeClass(o.animClass + " " + o.animInClass);

				self.active = true; //only period of complete visibility

				self.target.trigger("afterShow");
				self.container.trigger("afterShow");
			}, o.animDuration, "anim");

			//Handle outside click
			if (self.outsideDelays.hide || self.outsideDelays.hide === 0){
				$doc.on("click.outside."+pluginName + self.eventClass, self.callOnClickOutside("hide", self.outsideDelays.hide));
			}

			return self;
		},

		hide: function(){
			var self = this, o = self.options;
			//console.log(time() + "hide " + o.type + "-" + self.targetId)
			if (!self.checkHideConditions()){
				return self;
			}

			self.container.addClass(o.animClass + " " + o.animOutClass).removeClass(o.animInClass);	

			self.active = false;

			self.delayedCall(function(){
				self.container.removeClass(o.animClass + " " + o.animOutClass).attr('hidden', true);
				self.changeState("inactive");

				P.activeTargetId = null;				

				//console.log(time() + "hide " + o.type + "-" + self.targetId + " ok")

				//evts & callbacks
				self.target.trigger("hide");
				self.container.trigger("hide");
				o.hide && o.hide();

			}, o.animDuration, "anim");

			//Remove active class at once
			self.target.removeClass(o.activeClass);

			//Off outside clicks
			$doc.off("click.outside." + pluginName + self.eventClass);

			//evts & callbacks
			self.target.trigger("beforeHide");
			self.container.trigger("beforeHide");

			return self;
		},

		//Helping event that detects if click happened outside container and target
		callOnClickOutside: function(methName, delay){			
			var self = this, o = self.options;
			//console.log(time() + "callOnClickOutside " + o.type + "-" + self.targetId + " " + methName + "~" + delay);
			return function(e){
				//console.log(time() + "clickOutside " + o.type + "-" + self.targetId + " → " + methName + "~" + delay)
				if (e.target === self.container[0]
					|| e.target === self.target[0]
					|| self.isInside(e.clientX, e.clientY, self.container)
					|| self.isInside(e.clientX, e.clientY, self.target)) {
					return;
				}
				//clicked outside — ignore everything till @method finishes
				self.delayedCall(self[methName].bind(self), delay, self[methName].group);
			}.bind(self)
		},

		//Is show possible right now and if not arrange show 
		checkShowConditions: function(){
			var self = this, o = self.options;
			//If content is busy — appoint show after hide
			if (P.activeTargetId && self.targetId != P.activeTargetId) {
				//console.log(time() + "---show different: " + self.targetId + " insteadof " + P.activeTargetId +  ". plan clearIntents, hide, hideOverlay")
				var tId = P.activeTargetId;
				P.targetMethod(tId, "clearIntents");
				P.targetMethod(tId, "hide");
				P.targetMethod(tId, "hideOverlay");
				P.targets[tId].container.one("hide." + containerClass + self.eventClass, function(){
					self.externalBind = null;
					self.show.bind(self)();
				});
				self.externalBind = tId;
				//console.log(time() + "---bound to hide " + o.type + "-" + P.activeTargetId)
				return false;
			}

			//Busy content by itself
			if (self.sharedContent) {
				self.container.append(o.content)
			}
			P.activeTargetId = self.targetId;

			//Already visible - clear any intents (won’t work in constans state)
			if (self.target.hasClass(o.activeClass)){
				//console.log(time() + 3)
				self.clearIntents();
				return false;
			}

			//Is fading out — intent show
			if (self.container.hasClass(o.animOutClass)){
				self.showAfterHide();
				return false;
			}

			return true;
		},

		//Is hide possible right now and if not arrange hide
		checkHideConditions: function(){
			var self = this, o = self.options;
			//console.log(time() + "hideConditions " + o.type + "-"+self.targetId)
			//Is hiding on other(any) target - clear any intents, let it hide
			if (self.container.hasClass(o.animOutClass)) {
				self.clearShowIntent(); //let it hide with no show
				//P.targetMethod(P.activeTargetId, "clearHideIntent"); //TODO: what is this for?
				return false;
			}

			//Already hidden - clear hide intents
			if (self.container.attr("hidden")){
				self.clearIntents();
				return false;
			}

			//Is fading in — intent show
			if (self.container.hasClass(o.animInClass)){
				self.hideAfterShow();
				return false;
			}
			//console.log(time() + "hideConditions " + o.type + "-" + self.targetId + " ok")

			return true;
		},

		showOverlay: function(){
			var self = this, o = self.options;
			
			//console.log(time() + "showOverlay " + o.type + "-" + self.targetId)
			self.overlay.removeAttr('hidden');
			self.overlay.removeClass(o.overlayOutClass).addClass(o.animClass + " " + o.overlayInClass);

			self.changeState("active")

			self.delayedCall(function(){
				self.overlay.removeClass(o.animClass + " " + o.overlayInClass);
			}, o.animDuration, "animOverlay");

			//Handle outside click
			if (self.outsideDelays.hideOverlay || self.outsideDelays.hideOverlay === 0){
				$doc.on("click.outside."+pluginName + self.eventClass, self.callOnClickOutside("hideOverlay", self.outsideDelays.hideOverlay));
				$doc.on("click.outside."+pluginName + self.eventClass, self.callOnClickOutside("hide", self.outsideDelays.hide));			
				
			}

			return self;
		},

		hideOverlay: function(){
			var self = this, o = self.options;
			//console.log(time() + "hideOverlay " + o.type + "-" + self.targetId)

			//false call
			if (!o.overlay) return false; 

			self.overlay.addClass(o.animClass + " " + o.overlayOutClass).removeClass(o.overlayInClass);

			self.delayedCall(function(){

				//console.log(time() + "hideOverlay " + o.type + "-" + self.targetId + " ok")
				self.overlay.removeClass(o.animClass + " " + o.overlayOutClass).attr('hidden', true);
			}, o.animDuration, "animOverlay");

			$doc.off("click.outside."+pluginName + self.eventClass)

			return self;
		},

		trigger: function(){
			var self = this, o = self.options;

			if (self.target.hasClass(o.activeClass)) {
				self.hide();
			} else {
				self.show();
			}

			return self;
		},

		isInside: function(x, y, el){
			var rect = $(el)[0].getBoundingClientRect();
			return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
		},

		move: function(){
			var self = this, o = self.options;

			var c = {
					height: self.container.height(),
					width: self.container.width(),
					left: 0,
					top: 0
				},
				d = {
					width: $doc.width(),
					height: $doc.height()
				},
				//target
				t = self.target.offset(), //relative to the doc, not viewport
				//viewport
				v = {
					width: $wnd.width(),
					height: $wnd.height(),
					top: window.pageYOffset,//$doc.scrollTop(),
					left: window.pageXOffset//$doc.scrollLeft()
				},
				//TODO: count on tip size: tip = self.tip.
				tip = self.tip ? self.tipContainer.height()/2 : 0;

				v.bottom = v.top + v.height;
				v.right = v.left + v.width;

				t.width = self.target.outerWidth();
				t.height = self.target.outerHeight();
				t.bottom = t.top + t.height;
				t.right = t.left + t.width;

			//Decide where to place popup
			switch (o.position){
				case "top":
					if (t.top - c.height - tip < v.top && c.height + tip + t.bottom < v.bottom) {
						self.position = P.BOTTOM;
					} else {
						self.position = P.TOP;
					}
					break;
				case "bottom":
					if (t.bottom + c.height + tip > v.bottom && t.top - c.height - tip > v.top) {
						self.position = P.TOP;
					} else {
						self.position = P.BOTTOM;
					}
					break;
				case "left":
					if (t.left - c.width - tip < v.left && t.right + c.width + tip < v.right) {
						self.position = P.RIGHT;
					} else {
						self.position = P.LEFT;
					}
					break;
				case "right":
					if (t.right + c.width + tip > v.right && t.left - c.width - tip > v.left) {
						self.position = P.LEFT;
					} else {
						self.position = P.RIGHT;
					}
					break;
				case "center":
					self.position = P.CENTER;
					break;
				case "over":
					self.position = P.OVER;
					throw("position over: unimplemented")
					break;
				default:
					self.position = P.TOP;
					throw("Unknown position: `" + o.position + "`. Casted to top.");
			}

			//Count position
			if (self.position == P.TOP || self.position == P.BOTTOM){
				c.left = t.left + t.width * self.align - c.width * self.align;
				c.left = Math.max(Math.min(c.left, v.width + v.left - c.width),0);
			} else 	if (self.position == P.LEFT || self.position == P.RIGHT){
				c.top = t.top + t.height * self.align - c.height * self.align;
				c.top = Math.max(Math.min(c.top, v.height + v.top - c.height),0);
			}

			if (self.position == P.TOP){
				c.top = t.top - c.height - tip;
			} else if (self.position == P.BOTTOM){
				c.top = t.bottom + tip;
			} else if (self.position == P.RIGHT){
				c.left = t.right + tip
			} else if (self.position == P.LEFT){
				c.left = t.left - c.width - tip;
			} else if (self.position == P.CENTER){
				if (self.container.css("position") === "fixed"){
					c.left = v.width/2 - c.width/2
					c.top = v.height/2 - c.height/2
				} else {		
					c.left = v.width/2 - c.width/2 + v.left
					c.top = v.height/2 - c.height/2 + v.top
				}
			} else {
				//TODO
				throw("Position OVER is unimplemented")
			}

			self.tip && self.moveTip(t, c);

			//NOTE: ZEPTO fucks up animations when style set through css().
			self.container[0].style.left = c.left + 'px';
			self.container[0].style.top = c.top + 'px';

			return self;
		},

		//Move tip based on position and ratio. @target, @container — sizes and position
		moveTip: function(target, container){
			var self = this, o = self.options;
			var tch = self.tipContainer.height();
			var tcw = self.tipContainer.width();
			//Set tip position
			switch (self.position) {
				case P.BOTTOM:
					self.tipContainer.attr("data-tip", "top");				
					break;
				case P.LEFT:
					self.tipContainer.attr("data-tip", "right");
					break;
				case P.TOP:
					self.tipContainer.attr("data-tip", "bottom");					
					break;
				case P.RIGHT:
					self.tipContainer.attr("data-tip", "left");
					break;
				default: //TODO: what if no position for tip passed?
			}

			switch (self.position) {
				case P.BOTTOM:
				case P.TOP:
					var offset = Math.max(target.left - container.left, 0);
					var left = offset + (Math.min(target.width, container.width) - tcw ) * self.tipAlign;
					left = Math.min(left, container.width - tcw);
					self.tipContainer.css({
						left: left,
					})
					break;
				case P.LEFT:
				case P.RIGHT:
					var offset = Math.max(target.top - container.top, 0);
					var top = offset + (Math.min(target.height, container.height) - tch ) * self.tipAlign;
					top = Math.min(top, container.height - tch);
					self.tipContainer.css({
						top: top,
					})
					break;
				default:
					break;
			}
			return self;
		},

		//closes all the popuppers except this one
		closeSiblings: function() {
			var self = this, o = self.options;
			for (var id in P.targets){
				if (id == self.targetId) continue;
				var instance = P.targets[id];
				instance.hide();
			}
			return self;
		},

		//Rendering
		containerTpl: function () {
			var self = this, o = self.options;
			
			var result = '<div class="' + containerClass + ' ' + containerClass + '-' + o.type +
			(self.sharedContent ? (" " + containerClass + '-shared') : '') +
			'" data-target-id="' + self.targetId + '" hidden>';

			if (o.close) result += '<div class="' + containerClass + '-close">' + o.close + '</div>';			

			result += '</div>';

			return result;
		}
	})

	//Function groups: functions in one group are mutually blocked
	P.prototype.hide.group = "container"
	P.prototype.show.group = "container"
	P.prototype.hideOverlay.group = "overlay"
	P.prototype.showOverlay.group = "overlay"


	//Plugin
	$.fn[pluginName] = function (arg, arg2) {
		if (typeof arg == "string") {//Call API method
			return $(this).each(function (i, el) {
				//$(el).data(pluginName)[arg](arg2);
				P.targetMethod($(el).data('target-id'), arg2)
			})
		} else {//Init this
			return $(this).each(function (i, el) {
				var instance = new P(el, $.extend(arg || {}, $.parseDataAttributes(el)));
				if (!$(el).data(pluginName)) $(el).data(pluginName, instance);
			})
		}
	}


	//Simple options parser. The same as $.fn.data(), or element.dataset but for zepto	
	if (!$.parseDataAttributes) {		
		$.parseDataAttributes = function(el) {
			var data = {}, v;
			if (el.dataset) {
				for (var prop in el.dataset) {
					if (el.dataset[prop] === "true" || el.dataset[prop] === "") {
						data[prop] = true;
					} else if (el.dataset[prop] === "false") {
						data[prop] = false;
					} else if (v = parseInt(el.dataset[prop])) {
						data[prop] = v;
					} else {
						data[prop] = el.dataset[prop];
					}
				}
			} else {
				[].forEach.call(el.attributes, function(attr) {
					if (/^data-/.test(attr.name)) {
						var camelCaseName = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {
						    return $1.toUpperCase();
						});
						data[camelCaseName] = attr.value;
					}
				});
			}
			return data;
		}
	}


	//Autolaunch
	//Possible options location: preinit [Popover] object of the window, data-attributes, passed options.
	$(function () {
		//Override defaults
		if (window[pluginName]) {
			$.extend(P.defaults, window[pluginName]);
		}
		$("[class*=" + pluginName + "]").each(function (i, e){
			var type, classList = e.classList || e.className.split(" ");

			//TODO: parse type from the class
			for (var i = classList.length; i--; ){
				var className = e.classList[i];
				var match = className.match(new RegExp("popupper\\-([a-z]+)", "i"));
				if (match && match[1]) {
					type = match[1];
					break;
				}
			}

			var $e = $(e),
				opts = $.extend({}, {type: type});
			$e[pluginName](opts);
		});
	});


	//Zepto crutches
	//TODO: think of removal
	var outerH = $.fn.outerHeight;
	$.fn.outerHeight = function(){
		if (outerH) {
			return outerH.apply(this, arguments)
		} else {
			var h = $.fn.height.apply(this),
				pt = parseInt($.fn.css.apply(this, ["padding-top"])),
				pb = parseInt($.fn.css.apply(this, ["padding-bottom"]));
			return (h + pt + pb);
		}
	}
	var outerW = $.fn.outerWidth;
	$.fn.outerWidth = function(){
		if (outerW) {
			return outerW.apply(this, arguments)
		} else {
			var h = $.fn.width.apply(this),
				pl = parseInt($.fn.css.apply(this, ["padding-left"])),
				pr = parseInt($.fn.css.apply(this, ["padding-right"]));
			return (h + pl + pr);
		}
	}

})(window.jQuery || window.Zepto);


//Logging shit
var tStart = new Date().getTime();

function time(){
	return ((new Date().getTime() - tStart)/1000) + "s ";
}