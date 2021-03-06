/*
    Weave (Web-based Analysis and Visualization Environment)
    Copyright (C) 2008-2011 University of Massachusetts Lowell

    This file is a part of Weave.

    Weave is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License, Version 3,
    as published by the Free Software Foundation.

    Weave is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Weave.  If not, see <http://www.gnu.org/licenses/>.
*/

package weave.primitives
{
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.utils.ByteArray;
	
	import weave.api.WeaveAPI;
	import weave.compiler.StandardLib;
	import weave.core.LinkableString;
	
	/**
	 * Makes a colorRamp xml definition useful through a getColorFromNorm() function.
	 * 
	 * @author adufilie
	 * @author abaumann
	 */
	public class ColorRamp extends LinkableString
	{
		public function ColorRamp(sessionState:Object = null)
		{
			if (!sessionState)
				sessionState = getColorRampXMLByName("Blues").toString();
			
			if (sessionState is XML)
				sessionState = (sessionState as XML).toXMLString();
			
			super(sessionState as String);
		}
		
		private var _isXML:Boolean = false;
		
		private var _validateTriggerCount:uint = 0;
		
		private function validate():void
		{
			if (_validateTriggerCount == triggerCounter)
				return;
			
			_validateTriggerCount = triggerCounter;
			
			var i:int;
			var pos:Number;
			var color:Number;
			var positions:Array = [];
			var reversed:Boolean = false;
			var string:String = value || '';
			var xml:XML = null;
			if (string.charAt(0) == '<' && string.substr(-1) == '>')
			{
				try // try parsing as xml
				{
					xml = XML(string);
					reversed = String(xml.@reverse) == 'true';
					
					var text:String = xml.text();
					if (text)
					{
						// treat a single text node as a list of color values
						string = text;
						xml = null;
					}
					else
					{
						// handle a list of colorNode tags containing position and color attributes
						var xmlNodes:XMLList = xml.children();
						_colorNodes.length = xmlNodes.length();
						for (i = 0; i < xmlNodes.length(); i++)
						{
							var position:String = xmlNodes[i].@position;
							pos = position == '' ? i / (_colorNodes.length - 1) : Number(position);
							color = Number(xmlNodes[i].@color);
							_colorNodes[i] = new ColorNode(pos, color);
							positions[i] = pos;
						}
					}
				}
				catch (e:Error) { } // not an xml
			}
			_isXML = (xml != null);
			
			if (!_isXML)
			{
				var colors:Array = WeaveAPI.CSVParser.parseCSVRow(string) || [];
				_colorNodes.length = colors.length;
				for (i = 0; i < colors.length; i++)
				{
					pos = i / (colors.length - 1);
					color = StandardLib.asNumber(colors[i]);
					_colorNodes[i] = new ColorNode(pos, color);
					positions[i] = pos;
				}
			}
			
			// if min,max positions are not 0,1, normalize all positions between 0 and 1
			var minPos:Number = Math.min.apply(null, positions);
			var maxPos:Number = Math.max.apply(null, positions);
			for each (var node:ColorNode in _colorNodes)
			{
				node.position = StandardLib.normalize(node.position, minPos, maxPos);
				if (reversed)
					node.position = 1 - node.position;
			}
			
			_colorNodes.sortOn("position");
		}
		
		public function reverse():void
		{
			validate();
			
			if (_isXML)
			{
				var xml:XML = XML(value);
				var str:String = xml.@reverse;
				xml.@reverse = (str == 'true' ? 'false' : 'true');
				value = xml.toXMLString();
			}
			else
			{
				var colors:Array = WeaveAPI.CSVParser.parseCSVRow(value) || [];
				colors.reverse();
				value = WeaveAPI.CSVParser.createCSVRow(colors);
			}
		}

		public function get name():String
		{
			validate();
			
			if (_isXML)
				return XML(value).@name;
			else
				return null;
		}
		public function set name(newName:String):void
		{
			validate();
			
			if (_isXML)
			{
				var xml:XML = XML(value);
				xml.@name = newName;
				value = xml.toXMLString();
			}
		}
		
		/**
		 * An array of ColorNode objects, each having "color" and "position" properties, sorted by position.
		 * This Array should be kept private.
		 */
		private const _colorNodes:Array = [];
		
		public function getColors():Array
		{
			validate();
			
			var colors:Array = [];
			
			for(var i:int =0;i< _colorNodes.length;i++)
			{
				colors.push((_colorNodes[i] as ColorNode).color);
			}
			
			return colors;
		}
		
		/**
		 * getColorFromNorm
		 * @param normValue A value between 0 and 1.
		 * @return A color.
		 */
		public function getColorFromNorm(normValue:Number):Number
		{
			validate();
			
			if (isNaN(normValue) || normValue < 0 || normValue > 1 || _colorNodes.length == 0)
				return NaN;
			
			// find index to the right of normValue
			var rightIndex:int = 0;
			while (rightIndex < _colorNodes.length && normValue >= (_colorNodes[rightIndex] as ColorNode).position)
				rightIndex++;
			var leftIndex:int = Math.max(0, rightIndex - 1);
			var leftNode:ColorNode = _colorNodes[leftIndex] as ColorNode;
			var rightNode:ColorNode = _colorNodes[rightIndex] as ColorNode;

			// handle boundary conditions
			if (rightIndex == 0)
				return rightNode.color;
			if (rightIndex == _colorNodes.length)
				return leftNode.color;

			var interpolationValue:Number = (normValue - leftNode.position) / (rightNode.position - leftNode.position);
			return StandardLib.interpolateColor(interpolationValue, leftNode.color, rightNode.color);
		}
		
		/**
		 * This will draw the color ramp.
		 * @param destination The sprite where the ramp should be drawn.
		 * @param trueForVertical_falseForHorizontal Specifies vertical or horizontal direction
		 * @param bounds Optional bounds for the ramp graphics.
		 */
		public function draw(destination:Sprite, trueForVertical_falseForHorizontal:Boolean, bounds:Bounds2D = null):void
		{
			validate();
			
			var g:Graphics = destination.graphics;
			var vertical:Boolean = trueForVertical_falseForHorizontal;
			var x:Number = bounds ? bounds.getXMin() : 0;
			var y:Number = bounds ? bounds.getYMin() : 0;
			var w:Number = bounds ? bounds.getWidth() : destination.width;
			var h:Number = bounds ? bounds.getHeight() : destination.height;
			var offset:Number = bounds ? (vertical ? bounds.getXDirection() : bounds.getYDirection()) : 1;
			
			g.clear();
			var n:int = Math.abs(vertical ? h : w);
			for (var i:int = 0; i < n; i++)
			{
				var color:Number = getColorFromNorm(i / (n - 1));
				if (isNaN(color))
					continue;
				g.lineStyle(1, color, 1, true);
				if (vertical)
				{
					g.moveTo(x, y + i);
					g.lineTo(x + w - offset, y + i);
				}
				else
				{
					g.moveTo(x + i, y);
					g.lineTo(x + i, y + h - offset);
				}
			}
		}

		/************************
		 * begin static section *
		 ************************/
		
		[Embed(source="/weave/resources/ColorRampPresets.xml", mimeType="application/octet-stream")]
		private static const ColorRampPresetsXML:Class;
		private static var _allColorRamps:XML = null;
		public static function get allColorRamps():XML
		{
			if (_allColorRamps == null)
			{
				var ba:ByteArray = (new ColorRampPresetsXML()) as ByteArray;
				_allColorRamps = new XML( ba.readUTFBytes( ba.length ) );
				_allColorRamps.ignoreWhitespace = true;
			}
			return _allColorRamps;
		}
		public static function getColorRampXMLByName(rampName:String):XML
		{
			try
			{
				return (allColorRamps.colorRamp.(@name == rampName)[0] as XML).copy();
			}
			catch (e:Error) { }
			return null;
		}
		public static function getColorRampXMLByColorString(colors:String):XML
		{
			for each (var xml:XML in allColorRamps.colorRamp)
				if (xml.toString().toUpperCase() == colors.toUpperCase())
					return xml;
			return null;
		}
	}
	
}

// for private use
internal class ColorNode
{
	public function ColorNode(position:Number, color:Number)
	{
		this.position = position;
		this.color = color;
	}
	
	public var position:Number;
	public var color:Number;
}
