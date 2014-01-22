/*
Javascript Atlas Parser

Copyright © 2014, Alaa-eddine KADDOURI / Ezelia.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  


*/

var AtlasParser = (function() {
function parse(atlasTxt) {
	
	var parentAttributes = ['format', 'filter', 'repeat'];
	var childAttributes = ['rotate', 'xy', 'size', 'split', 'orig', 'offset', 'index'];

	//identify parent nodes
	var str = atlasTxt.replace(/\n([^\:\n]+)\n([a-z0-9\\_]+)\:(.+)\n{0,1}/gm, function () {
		var ret = '###' + arguments[1] + '###:{\n';   //use ### to discriminate parent node
		ret += arguments[2] + ':' + arguments[3] + '\n';                
		return ret;
	});

	//identify children nodes
	var str = str.replace(/\n([^\:#]+)\n/g, function () {
		var ret = '\n';
		ret += '##' + arguments[1].replace(/[\n\s]+/g, '') + '## : {\n'; //use ## to discriminate child node
		return ret;
	});
	
	//parse couples  
	str = str.replace(/([a-z0-9\\_]+)\:(.+)\n{0,1}/g, function (match, left, right) {

		var numMatch = right.match(/[0-9\,\-\.]+/g);
		var boolMatch = right.match(/(true|false)+/gi);
		var strMatch = right.match(/([a-z_\\\/])+/gi);

		right = right.replace(/\s+/, ''); //clean spaces
		
		if (strMatch && !boolMatch) {
			return '"' + left + '":"' + right + '",\n';
		}

		if (boolMatch || (numMatch && numMatch.length == 1)) {
			return '"' + left + '":' + right + ',\n';
		}

		if (numMatch && numMatch.length > 1) {
			return '"' + left + '": [' + right + '],\n';
		}
		return '"' + left + '":"' + right + '",\n';

	});

	//back to parent nodes
	var first = true;
	var str = str.replace(/(###[^\:]+###)/g, function () {

		var ret = first ? '' : '}\n}\n},\n';
		ret += '"' + arguments[1].replace(/#{3}/g, '') +'"';

		first = false;
		return ret;
	});

	//back to child nodes
	var str = str.replace(/([^\:,]+):([^\:]+),\n+(##[^\:]+##)/gm, function () {                
		var left = arguments[1].replace(/[\"\n\s]+/g, '');
		var ret = arguments[0];


		//are we switching from a parent node attributes to frames definition ?
		if (parentAttributes.indexOf(left) > -1) {
			ret = arguments[1] + ':' + arguments[2] + ',\n';
			ret += '"frames" : {\n' + arguments[3];
		}
		else {
			ret = arguments[1] + ':' + arguments[2] + '},\n';
			ret += arguments[3];
		}
		return ret;
	});

	
	str += '\n}\n}}';

	str = str.replace(/,([\s\n\t\r])+}/g, "$1}");
	str = str.replace(/"[\s\n\t\r]+(.+)/g, "\"$1");
	str = str.replace(/#{2}/g, '"'); //fix children

	str = "{" + str + "}"; //wrap JSON
	
	//return str;
	return JSON.parse(str);
}
return {
	parse:parse
}
})();