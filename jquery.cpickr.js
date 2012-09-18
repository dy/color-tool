/*
 * Jquery lite color picker plugin.
 * Depends on jquery.color.
 * Author: Ivanov Dmitry.
 * Copyright: sep 2012.
 * License: MIT.
 */
/*TODO:
 *- load last used colorlist and init color from local storage
 *- make tip position precisely to the caret
 *- standart replacer for input type=color element.
 *- press-release habrahabr, vkontakte, smashing etc: Own color picker with toys & beauties. List of concurent features.
 *- lab
 *- screen color picker (WTF? HOW?). Behaviour maybe is simple dragging out of picker zone.
 *- color stack is neat & lite, not pesky: just shows last used colors. Maybe group colors by similarity?
 *- read data-attributes additional to options
 */
(function($){
   $.cpickr = $.cpickr || {};

   //Pre-initialization of all cpickrs. Started once if cpicker created.
   $.cpickr.preinit = function(){
      var cp = $.cpickr;
      cp.defaults = {//Default for every picker options.
	 type:'hl',//'sl','sh'
	 alpha:false,
	 bw:true,
	 format:'rgb',//rgba,hsl,hsla,hex,text
	 colorStack:[{
	    'rgba(0,0,0,1)':'permanent', //value is number of usages
	    'rgba(255,255,255,1)':'permanent'
	 }],
	 hideIntentDelay:1000,
	 showTime:100,
	 hideTime:100,
	 placementStrategy:'horizontal',// or 'vertical'
	 snap:false, //Snap to grid
	 showGrid: false //Show visual helpers
      };
      cp.container = $('<div class="cpickr"></div>')
      .css({
	 'z-index':9999,
      	'border-bottom-left-radius':'6px',
      	'border-bottom-right-radius':'6px',
	 'box-shadow':'rgba(0, 20, 40, 0.5) 0px 1px 3px 0px, rgba(0, 20, 40, 0.3) 0px 3px 12px 0px',
	 'position':'absolute',
	 'width':'300px',
	 'height':'200px',
	 'resize':'both',
	 'cursor':'default',
	 'user-select':'none',
	 'font-family':'sans-serif'
      }).appendTo('body').fadeOut(0);
      cp.bigZone = $('<div class="cp-big-zone"></div>')
      .css({
	 'position':'relative',
	 'height':'80%'
      }).appendTo(cp.container);
      cp.layer1 = $('<div class="cp-layer-1"></div>')
      .css({
	 'top':0,
	 'left':0,
	 'height':'100%',
	 'width':'100%',
	 'position':'absolute'
      }).appendTo(cp.bigZone);
      cp.layer2 = $('<div class="cp-layer-2"></div>')
      .css({
	 'top':0,
	 'left':0,
	 'height':'100%',
	 'width':'100%',
	 'position':'absolute'
      }).appendTo(cp.bigZone);
      cp.smallZone = $('<div class="cp-small-zone"></div>')
      .css({
	 'height':'20%',
	 'position':'relative',
      	'border-bottom-left-radius':'6px',
      	'border-bottom-right-radius':'6px'
      }).appendTo(cp.container);
      var pickerCss = {
	 'height':10,
	 'width':10,
	 'margin-left':-5,
	 'margin-top':-5,
	 'position':'absolute',
	 'box-shadow':'inset 0 0 0 1px rgba(255,255,255,.32), 0 0 0 1px rgba(0,0,0,.32)',
	 'pointer-events':'none',
	 'top':'50%',
	 'left':'90%',
	 'border-radius':'100%',
	 'background':'red',
	 'z-index':9999,
      }
      cp.bigPicker = $('<div class="cp-big-picker"></div>')
      .css(pickerCss).appendTo(cp.bigZone);
      cp.smallPicker = $('<div class="cp-small-picker"></div>')
      .css(pickerCss).appendTo(cp.smallZone);
      var pickerInfoCss = {
	 'position':'absolute',
	 'left':'22px',
	 'background':'black',
	 'color':'white',
	 'line-height':'12px',
	 'top':'-5px',
	 'padding':'2px 4px',
	 'font-size':'9px',
	 'border-radius':'3px',
	 'white-space':'nowrap'
      }
      cp.bigPickerInfo = $('<span class="cp-big-picker-info">dsffds</span>').css(pickerInfoCss).appendTo(cp.bigPicker);
      cp.smallPickerInfo = $('<span class="cp-small-picker-info">12</span>').css(pickerInfoCss).appendTo(cp.smallPicker);
      cp.colorList = $('<ul class="cp-color-list"></ul>').appendTo(cp.container);
      cp.tip = $('<div class="cp-tip"></div>')
      .css({
	 'position':'absolute',
	 'top':'-16px',
	 'left':'47%'
      }).appendTo(cp.container);

      document.onselectstart = function(){
	 return false;
      }//Chrome selection cursor bug

      //---------------------------------------------------------------------Events of cpickr
      cp.evSuffix='.cpickr';
      //drag big zone
      cp.bigZone.mousedown(function(e){
	 var caller = cp.container.data('cp-caller');
	 if (!caller) return;
	 caller.bigDragStart(e);
	 $(document)
	 .on('mousemove'+cp.evSuffix, function(e){
	    caller.bigDrag(e);
	 })
	 .on('mouseup'+cp.evSuffix, function(e){
	    $(document).off('mousemove'+cp.evSuffix).off('mouseup'+cp.evSuffix);
	    caller.bigDragStop(e);
	 });
      });

      //drag smallzone
      cp.smallZone.mousedown(function(e){
	 var caller = cp.container.data('cp-caller');
	 if (!caller) return;
	 caller.smallDragStart(e);
	 $(document)
	 .on('mousemove'+cp.evSuffix, function(e){
	    caller.smallDrag(e);
	 })
	 .on('mouseup'+cp.evSuffix, function(e){
	    $(document).off('mousemove'+cp.evSuffix).off('mouseup'+cp.evSuffix);
	    caller.smallDragStop(e);
	 });
      });

      //TODO: Click behaviour

      cp.container.trigger('preinit'+cp.evSuffix);


   };

   //Cpickr class is controller of cpickr example
   function Cpickr(target, opts){
   	var self = this;
      self.element = $(target);
      self.options = {
	 targets:null,//List of targets to apply value
	 colorObj:$.Color('hsla(0,80%,50%,1)'),//Color object
	 show:null,
	 hide:null,
	 dragStart:null,
	 dragging:null,
	 dragStop:null,
	 resize:null,
	 change:null
      }
      self.options = $.extend($.cpickr.defaults, self.options, opts);
      self.options.targets = self.options.targets || self.element;
      self.create().init();
   }

   $.extend(Cpickr.prototype, {
      /*========================================================================TECHNICAL======*/
      create: function() {
	 var self = this, o = self.options, el = self.element;
	 if (el[0].tagName.toLowerCase() == 'input'){
	 	var sp = 4; //gaps
	 	self.colorPreview = $('<div class="cp-color-preview"/>').css({
		 		'height':el.innerHeight() - sp*.5,
		 		'width':el.innerHeight() - sp*.5,
		 		'max-height':40,
		 		'max-width':40,
		 		'background':'transparent',
		 		'position':'absolute',
		 		'top':el.position().top + parseInt(el.css('padding-top')) + parseInt(el.css('margin-top')) + sp*.5,
		 		'left':el.position().left + parseInt(el.css('padding-left')) + parseInt(el.css('margin-left')) + sp*.7
		 	}).insertAfter(el);
	 	o.targets.push(self.colorPreview);
	 	el.css({
	 		'padding-left':self.colorPreview.height() + sp
	 	})
	 }

	 self = $.extend(self, $.cpickr);
	 delete self['defaults'];

	 o.targets = o.targets || el;

	 return self;
      },

      init: function(e) {
	 var self = this, o = self.options, el = self.element;

	 self.tipTo('left');
	 self.refresh();
	 self.container.trigger('cpickr.init');

	 //------------------------------------------------Events
	 el.click(function(e){
	    self.hide().relocate().show();
	 //self._renderBigZone();
	 });
	 el.change(function(){
	    self._renderBigZone();
	 });

	 el.keypress(function(e){
	    console.log(e.which)
	    switch(e.which){
	       case 13://Enter
		  self.toggle();
		  break;
	    }
	 });
	 /*el.blur(function(){
	    self.hide();
	 });*/
	 self.container.data('cp-caller',self);

	 return self;
      },

      destroy: function() {
	 var self = this, o = self.options, el = self.element;

	 return self;
      },
      setOption: function(newOptions) {
	 var self = this, o = self.options, el = self.element;
	 for(var key in newOptions){
	    if (o[key] !== undefined)
	       o[key] = newOptions[key];
	 }
	 return self;
      },
      getOption: function(key) {
	 var self = this, o = self.options, el = self.element;
	 return o[key];
      },
      /*========================================================================Actions====================*/
      bigDragStart: function(e) {
	 var self = this, o = self.options, el = self.element;

	 self.constraints = {
	    top: self.bigZone.offset().top,
	    right: self.bigZone.offset().left + self.bigZone.width(),
	    bottom: self.bigZone.offset().top + self.bigZone.height(),
	    left: self.bigZone.offset().left
	 }

	 self.dragStartPageX = e.pageX;
	 self.dragStartPageY = e.pageY;
	 self.bigPickerTo(e.pageX, e.pageY);

	    if (o.dragStart) o.dragStart(self);
	    self.bigPicker.trigger('dragStart'+self.evSuffix);

	 return self;
      },
      bigDrag: function(e) {
	 var self = this, o = self.options, el = self.element;
	 self.bigPickerTo(e.pageX, e.pageY);
	 if (o.dragging) o.dragging(self);
	    self.bigPicker.trigger('dragging'+self.evSuffix);
	 return self;
      },
      bigDragStop: function(e) {
	 var self = this, o = self.options, el = self.element;
	 self.bigPickerTo(e.pageX,e.pageY);
	 if (o.dragStop) o.dragStop(self);
	    self.bigPicker.trigger('dragStop'+self.evSuffix);
	 return self;
      },
      smallDragStart: function(e) {
	 var self = this, o = self.options, el = self.element;

	 self.constraints = {
	    top: self.smallZone.offset().top,
	    right: self.smallZone.offset().left + self.smallZone.width(),
	    bottom: self.smallZone.offset().top + self.smallZone.height(),
	    left: self.smallZone.offset().left
	 }

	 self.dragStartPageX = e.pageX;
	 self.dragStartPageY = e.pageY;
	 self.smallPickerTo(e.pageX, e.pageY);
	 if (o.dragStart) o.dragStart(self);
	    self.smallPicker.trigger('dragStart'+self.evSuffix);
	 return self;
      },
      smallDrag: function(e) {
	 var self = this, o = self.options, el = self.element;
	 self.smallPickerTo(e.pageX, e.pageY);
	 if (o.dragging) o.dragging(self);
	    self.smallPicker.trigger('dragging'+self.evSuffix);
	 return self;
      },
      smallDragStop: function(e) {
	 var self = this, o = self.options, el = self.element;
	 self.smallPickerTo(e.pageX,e.pageY);
	 if (o.dragStop) o.dragStop(self);
	    self.smallPicker.trigger('dragStop'+self.evSuffix);
	 return self;
      },


      /*=========================================================================API - uncertainly changes model=====*/
      //Move picker & make correct color. x & y are pageX & pageY
      bigPickerTo: function(x, y) {
	 var self = this, o = self.options, el = self.element,

	 leftOffset = Math.max(self.constraints.left, Math.min(self.constraints.right , x))-self.bigZone.offset().left,
	 topOffset = Math.max(self.constraints.top , Math.min(self.constraints.bottom , y))-self.bigZone.offset().top;

	 self.bigPicker.css({
	    left: leftOffset,
	    top: topOffset
	 });

	 switch (o.type){
	    case 'hl':
	       var l = 1-topOffset/self.bigZone.height(),
	       h = leftOffset/self.bigZone.width()*360;
	       o.colorObj = o.colorObj.lightness(l).hue(self.invertedHue?(h+180):h);
	       break;
	    default:
	 }
	 self._renderSmallZone()._renderPickers()._updateTargets()._updateTip();

	 return self;
      },

      //x & y are pageX & pageY
      smallPickerTo: function(x, y) {
	 var self = this, o = self.options, el = self.element,
	 leftOffset = Math.max(self.constraints.left, Math.min(self.constraints.right , x))-self.smallZone.offset().left,
	 topOffset = Math.max(self.constraints.top , Math.min(self.constraints.bottom , y))-self.smallZone.offset().top;
	 self.smallPicker.css({
	    left: leftOffset,
	    top: topOffset
	 });

	 switch (o.type){
	    case 'hl':
	       var s = (leftOffset/self.smallZone.width() - .5) * 2;
	       o.colorObj = o.colorObj.saturation(Math.abs(s));
	       if (s<0 && !self.invertedHue) {
		  o.colorObj = o.colorObj.hue(o.colorObj.hue()+180)
		  self.invertedHue = true;
	       }
	       else if (s>=0 && self.invertedHue) {
		  o.colorObj = o.colorObj.hue(o.colorObj.hue()+180)
		  self.invertedHue = false;
	       }
	       break;
	    default:
	 }

	 self._renderBigZone()._renderPickers()._updateTargets()._updateTip();

	 return self;
      },

      loadColor: function(str) {
	 var self = this, o = self.options, el = self.element;

	 o.colorObj.parse(str);

	 return self;
      },

      //Move to the element
      relocate: function() {
	 var self = this, o = self.options, el = self.element;
	 var $doc = $(document), $w = $(window),
	 top = 0, left = 0;

	 if (o.placementStrategy == 'horizontal'){
	    var tipTop = 0;
	    //Simple method of clipping by height, aligning horizontally.
	    top = Math.max(
	       Math.min(
		  el.offset().top + el.outerHeight()*.5 - self.container.height()*.5,
		  $doc.scrollTop() + $w.height() - self.container.height()),
	       $doc.scrollTop());
	    tipTop = el.offset().top - top + el.outerHeight()*.5 - self.tip.outerHeight()*.5;
	    if (el.offset().left < self.container.width()){//Close to left bound
	       self.tipTo('left', tipTop);
	       left = el.offset().left + el.outerWidth() + self.tip.outerWidth();
	    } else {
	       self.tipTo('right', tipTop);
	       left = el.offset().left - self.container.width() - self.tip.outerWidth();
	    }
	 } else {
	    var tipLeft = 0;
	    //Standard method of vertical dropdown placement
	    left = Math.max(
	       Math.min(
		  el.offset().left + el.outerWidth()*.5 - self.container.width()*.5,
		  $doc.scrollLeft() + $w.width() - self.container.width()),
	       $doc.scrollTop());
	    tipLeft = el.offset().left - left + el.outerWidth()*.5 - self.tip.outerWidth()*.5;
	    if ($doc.scrollTop() + $w.height() - el.offset().top < self.container.height()){//Close to bottom
	       self.tipTo('bottom', tipLeft);
	       top = el.offset().top - self.container.height() - self.tip.outerHeight();
	    } else {
	       self.tipTo('top', tipLeft);
	       top = el.offset().top + el.outerHeight() + self.tip.outerHeight();
	    }
	 }

	 self.container.queue('fx',function(){
	    self.container.css({
	       'left':left + 'px',
	       'top':top + 'px'
	    });
	    $(this).dequeue();
	 })

	 return self;
      },

      //Show as fast as t
      show: function(t) {
	 var self = this, o = self.options, el = self.element;

	 t = t === 0 ? 0 : (t || o.showTime);

	 self.container.removeClass('cp-hidden');
	 self.container.fadeIn(t, function(){
	    self.container.addClass('cp-active');
	    if (o.show) o.show(self);
	    self.container.trigger('show'+self.evSuffix);
	 });

	 return self;
      },

      //Hide after t ms.
      intentHide: function(t) {
	 var self = this, o = self.options, el = self.element;

	 t = t === 0 ? 0 : (t || o.hideIntentDelay);

	 return self;
      },

      //Hide as fast as t
      hide: function(t) {
	 var self = this, o = self.options, el = self.element;

	 t = t === 0 ? 0 : (t || o.hideTime);

	 self.container.removeClass('cp-active')
	 self.container.fadeOut(t, function(){
	    self.container.addClass('cp-hidden');
	    if (o.hide) o.hide(self);
	    self.container.trigger('hide'+self.evSuffix);
	 });

	 return self;
      },

      //Switch to the opposite state
      toggle: function(t) {
	 var self = this, o = self.options, el = self.element;

	 if (self.container.hasClass('cp-active')){
	    self.hide(t);
	 } else {
	    self.show();
	 }
	 return self;
      },

      /*===========================================================================Rendering==================*/
      refresh: function() {
	 var self = this, o = self.options, el = self.element;

	 return self
	 ._renderBigZone()
	 ._renderSmallZone()
	 ._updateTargets();
      },

      _renderBigZone: function() {
	 var self = this, o = self.options, el = self.element;
	 var l1 = self.layer1, l2 = self.layer2;

	 switch(o.type){
	    case 'hl':
	       //Layer 1
	       var grSteps = 12, //6,12,24,36, 72 is optimal. 6 is better.
	       grStr = '', hueStep = 360/grSteps, hueOffset = self.invertedHue?180:0,
	       sat = (o.colorObj.saturation()*100) + '%',
	       al = o.colorObj.alpha();
	       for (var i = 0; i<= grSteps; i++){
		  grStr+='hsla(' + (hueStep*i + hueOffset).toFixed(4) + ',' + sat + ', 50%, ' + al + ') '+((100/grSteps*i)).toFixed(2)+'%, '
	       };
	       grStr = 'linear-gradient(left, ' + grStr.slice(0,-2) + ')';
	       l1.css('background','-webkit-'+grStr)
	       .css('background','-o-'+grStr)
	       .css('background','-moz-'+grStr)
	       .css('background','-ie-'+grStr)
	       .css('background', grStr);
	       //Layer 2
	       var lStr = 'linear-gradient(top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)';
	       l2.css('background','-webkit-'+lStr)
	       .css('background','-o-'+lStr)
	       .css('background','-moz-'+lStr)
	       .css('background','-ie-'+lStr)
	       .css('background',lStr);
	       break;
	    default:
	 }
	 return self;
      },

      _renderSmallZone: function() {
	 var self = this, o = self.options, el = self.element;

	 switch (o.type){
	    case 'hl':
	       var l = (o.colorObj.lightness()*100);
	       var h = o.colorObj.hue() + (self.invertedHue? 180 : 0);
	       var sStr = 'linear-gradient(right, '+
	       'hsla(' + h + ', 100%, ' + l + '%, '+ o.colorObj.alpha()+') 0%, '+
	       'hsla(' + h + ', 0%, ' + l + '%, '+ o.colorObj.alpha()+') 50%, '+
	       'hsla(' + ((h+180) % 360) + ', 100%, ' + l + '%, ' + o.colorObj.alpha() + ') 100%' +')';
	       self.smallZone.css('background', '-webkit-'+sStr)
	       .css('background', '-ie-'+sStr)
	       .css('background', '-o-'+sStr)
	       .css('background', '-moz-'+sStr)
	       .css('background', sStr);
	       break;
	    case 'sl':
	       break;
	    case 'hs':
	       break;
	    default:
	 }
	 return self;
      },

      _renderPickers: function() {
	 var self = this, o = self.options, el = self.element;

	 self.smallPicker.css({
	    'background':o.colorObj.toHslaString()
	 });
	 self.bigPicker.css({
	    'background':o.colorObj.toHslaString()
	 });

	 self.bigPickerInfo.html('H:&thinsp;'+o.colorObj.hue()+'&deg; L:&thinsp;'+(o.colorObj.lightness()*100).toFixed(0)+'%')
	 self.smallPickerInfo.html('S:&thinsp;'+(o.colorObj.saturation()*100).toFixed(0)+'%');

	 return self;
      },

      //Move tip to direction & distance (in percent)
      tipTo: function(direction, distance) {
	 var self = this, o = self.options, el = self.element;
	 var tip = self.tip;
	 distance = distance === 0 ? 0 : (distance || '48%');
	 switch (direction){
	    case 'bottom':
	       tip.css({
		  'bottom':'-10px',
		  'left':distance,
		  'top':'auto',
		  'right':'auto',
		  'border-left':'8px solid transparent',
		  'border-right':'8px solid transparent',
		  'border-top':'10px solid',
		  'border-bottom':'none'
	       });
	       break;
	    case 'left':
	       tip.css({
		  'left':'-10px',
		  'top':distance,
		  'right':'auto',
		  'bottom':'auto',
		  'border-top':'8px solid transparent',
		  'border-bottom':'8px solid transparent',
		  'border-right':'10px solid',
		  'border-left':'none'
	       });
	       break;
	    case 'right':
	       tip.css({
		  'right':'-10px',
		  'top':distance,
		  'left':'auto',
		  'bottom':'auto',
		  'border-top':'8px solid transparent',
		  'border-bottom':'8px solid transparent',
		  'border-left':'10px solid',
		  'border-right':'none'
	       });
	       break;
	    default:
	       tip.css({
		  'top':'-10px',
		  'left':distance,
		  'bottom':'auto',
		  'right':'auto',
		  'border-left':'8px solid transparent',
		  'border-right':'8px solid transparent',
		  'border-bottom':'10px solid',
		  'border-top':'none'
	       });
	 }

	 return self;
      },

      //Just updates color of tip
      _updateTip: function(){
      	var self = this, o = self.options;
      	//TODO: make tip colouring
      	//var top = (self.tip.offset().top - self.container.offset().top) / self.container.outerHeight();
      	//var left = (self.tip.offset().left - self.container.offset.left) / self.container.outerWidth();
      	//var c = $.Color().hsla()
      	//self.tip.css('color','white')
      },

      //Update values of all targets
      _updateTargets: function() {
	 var self = this, o = self.options, el = self.element;

	 	o.targets.each(function(i,e){
	 		var target = $(e);
	 		var props = (target.data('color-change') || 'background').split(',');
			for(var i = props.length; i--;){
				target.css(props[i].trim(), o.colorObj.toHslaString());
			}
	 	})


	 return self;
      },

   /*================================Helpers================================*/


   });

   $.fn.cpickr = function(opts){
      if ($.cpickr.container === undefined)
	 $.cpickr.preinit(); //first time load

      if ($.isEmptyObject(this))
	 return console.log('Cpickr: no elements passed.')
      else
	 return this.each(function(i,e){
	    $(e).data('cpickr', new Cpickr(e, opts));
	 });
   };


/*Auto bg prefixes fix*/


})(jQuery)



