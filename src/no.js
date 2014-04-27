/**
* Provide data-bindings for elements so you don’t have to write js at all
* Interface is simple:
* make bindings with moustache-like notation
* use `name` attribute to expose value with that name
* fire `change` event to update data-bindings
* use `bind-` prefixed properties for native attributes, like `<div bind-style="background:{{ color }}"/>`
*
* Example:
* <div>{{ prop }}</div>
* <input name="prop" value="123"/>
*/


//TODO: merge this with imagine.js parser & data-source



/**
* keyed by prop name particles to update
{
	prop1: [
		{dataRequired: ["a", "b", "c"], target: node, text: "original tpl {{ with data }}"}, ...
	],
	prop2: [...]
}
*/
var dataListeners = {};

//most actual data
//`{prop1: data1, prop2: data2}`
var	dataSource = {};

//parser regexps
var propRe = /\{\{\s*([a-zA-Z_$]\w*)\s*\}\}/;
var propsRe = /\{\{\s*[a-zA-Z_$]\w*\s*\}\}/g;



/**
* Init
*/
//parse initial document bindings
parseElementBindings(document.documentElement, dataListeners);

//expose elements with name attribute
var dataTargets = document.querySelectorAll("[name]");
var l = dataTargets.length;
for (var i = l; i--;){
	expose(dataTargets[i]);
}



/**
* helpers
*/
//Look up for all possible bindings within target, add found particles to dataListeners
function parseElementBindings(target, listeners){
	// console.group("parse elemnt", target)
	//look through attributes
	for (var i = 0; i < target.attributes.length; i++){
		var attr = target.attributes[i];
		parseAttributeBindings(target, attr, listeners);
	}

	//Gather children
	var children = target.childNodes,
		l = children.length;

	for (var i = 0; i < l; i++){
		var child = children[i];
		if (child.nodeType === 3){
			//Text nodes
			parseTextNodeBindings(child, listeners)
		} else if (child.nodeType === 1){
			//Elements
			parseElementBindings(child, listeners);
		}
	}
	// console.groupEnd()
}

//find data to bind within attribute node
function parseAttributeBindings(target, srcAttr, listeners){
	// console.group("parse attr")
	var text = srcAttr.textContent,
		attrName = srcAttr.name,
		match,
		propName,
		attr = srcAttr;

	//correct name
	if (attrName.slice(0,5) === "bind-"){
		target.removeAttribute(attrName);
		attrName = attrName.slice(5);
		target.setAttribute(attrName, text);
		attr = target.attributes[attrName];
	}

	//Find properties list
	var propList = text.match(propsRe),
		propNames = [];
		// console.log("mathc", text, propsRe, propList)
	if (!propList) return;

	//Normalize props tpl
	for (var i = 0; i < propList.length; i++){
		var propName = propList[i].match(propRe)[1];
		propNames[i] = propName;

		text = text.replace(propList[i], "{{" + propName + "}}");
	}
	attr.textContent = text;

	//Add every property found to listeners
	addDataListener(attr, text, propNames, listeners)
	// console.groupEnd()
}

//Find data within text node, split it on parts
function parseTextNodeBindings(node, listeners){
	// console.group("parse text", node)
	var text = node.textContent,
		match,
		propName;

	//Find properties list
	var propList = text.match(propsRe),
		propNames = [];
		// console.log(text, propList, propList.length)
	if (!propList || !propList.length) return;

	//Get prop names
	for (var i = 0; i < propList.length; i++){
		var propName = propList[i].match(propRe)[1];
		propNames[i] = propName;
	}

	//Seal text fragments with data
	var dataNode, rest = node, text;
	for (var i = 0; i < propList.length; i++){
		dataNode = rest.splitText(rest.textContent.indexOf(propList[i]));
		rest = dataNode.splitText(propList[i].length);

		//normalize datanode value
		var text = "{{" + propNames[i] + "}}";
		dataNode.textContent = text;

		//add listener for every sealed fragment
		addDataListener(dataNode, text, [propNames[i]], listeners);
	}
	// console.groupEnd()
}

//add data listener to the set
//e.g. addDataListener(listenersList, attributeNode, initialTextContent, ["a", "b", "c"])
function addDataListener(node, tpl, dataRequired, listeners){
	// console.log("add listener", node, tpl, dataRequired, listeners)
	for (var i = dataRequired.length; i--;){
		var prop = dataRequired[i];
		if (!listeners[prop]) listeners[prop] = [];
		listeners[prop].push({
			target: node,
			text: tpl,
			dataRequired: dataRequired
		})
	}
}


//TODO: listen to the attribute bindings changing




//Observe exposed data-changes
//update every binding depending on name passed, if any, and update all, if none.
//TODO: throttle properly
var _dataSourceChangeTimeout = undefined;
function dataSourceChanged(name){
	// LOG && console.log("Data source changed", name)

	var listeners = dataListeners[name];
	if (!listeners) return;
	// LOG && console.log(dataSource)

	//for name changed update listener depending on that name
	for (var i = 0; i < listeners.length; i++){
		var listener = listeners[i];
		var result = listener.text;

		//render resulting textContent
		for (var j = 0; j < listener.dataRequired.length; j++){
			result = result.replace("{{" + listener.dataRequired[j] + "}}",
				dataSource[listener.dataRequired[j]]);
		}

		listener.target.textContent = result;
		//TODO: trouble in dataResult
		// LOG && console.log(dataSource)
	}
}


//expose element data
function expose($el){
	_valueChanged( $el );
	$el.addEventListener("change", function(e){_valueChanged(e.currentTarget)});
}
//exposable element value changing callback
function _valueChanged($el){
	var name = parseArray($el.getAttribute("name"))
	// console.log("valueChanged", name, $el.value)
	for (var i = 0; i < name.length; i++){
		if ($el.value instanceof Array) {
			dataSource[name[i]] = $el.value[i];
		} else {
			dataSource[name[i]] = $el.value;
		}
		dataSourceChanged(name[i]);
	}
}
//returns array parsed from string
function parseArray(str){
	if (typeof str !== "string") return [parseAttr(str)]

	//clean str from spaces/array rudiments
	str = str.trim();
	if (str[0] === "[") str = str.slice(1);
	if (str.length > 1 && str[str.length - 1] === "]") str = str.slice(0,-1);

	var result = [];
	str.split(/\s*,\s*/).forEach(function(value){
		result.push(value)
	})
	return result
}