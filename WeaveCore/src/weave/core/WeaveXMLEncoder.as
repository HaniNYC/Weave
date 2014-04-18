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

package weave.core
{
	import flash.xml.XMLDocument;
	import flash.xml.XMLNode;
	import flash.xml.XMLNodeType;
	
	import mx.rpc.xml.SimpleXMLEncoder;
	import mx.utils.ObjectUtil;
	
	import weave.api.WeaveAPI;
	import weave.api.reportError;
	import weave.compiler.Compiler;
	import weave.compiler.StandardLib;
	
	/**
	 * This extension of SimpleXMLEncoder adds support for encoding TypedSessionState objects, XML values, and null values.
	 * The static encode() method eliminates the need to create an instance of XMLEncoder.
	 * 
	 * @author adufilie
	 */	
	public class WeaveXMLEncoder extends SimpleXMLEncoder
	{
		/**
		 * encoding types
		 */
		public static const JSON_ENCODING:String = "json";
		public static const XML_ENCODING:String = "xml";
		public static const CSV_ENCODING:String = "csv";
		public static const CSVROW_ENCODING:String = "csv-row";
		public static const DYNAMIC_ENCODING:String = "dynamic";
		
		/**
		 * This static function eliminates the need to create an instance of XMLEncoder.
		 * @param object An object to encode in xml.
		 * @return The xml encoding of the object.
		 */
		public static function encode(object:Object, tagName:*, useJSON:Boolean = false):XML
		{
			var result:XMLNode;
			if (useJSON)
				result = _xmlEncoder.encodeJSON(object, QName(tagName), _encodedXML);
			else
				result = _xmlEncoder.encodeValue(object, QName(tagName), _encodedXML);
			result.removeNode();
			return XML(result);
		}

		// reusable objects for static encode() method
		private static const _encodedXML:XMLDocument = new XMLDocument();
		private static const _xmlEncoder:WeaveXMLEncoder = new WeaveXMLEncoder(_encodedXML);


		/**
		 * end of static section
		 */


	    public function WeaveXMLEncoder(myXML:XMLDocument)
	    {
	        super(myXML);
	    }
		
		override public function encodeValue(obj:Object, qname:QName, parentNode:XMLNode):XMLNode
		{
			if (DynamicState.objectHasProperties(obj) && obj[DynamicState.CLASS_NAME])
			{
				var className:String = obj[DynamicState.CLASS_NAME];
				var objectName:String = obj[DynamicState.OBJECT_NAME];
				var sessionState:Object = obj[DynamicState.SESSION_STATE];
				var qualifiedClassName:Array = className.split("::");
				className = qualifiedClassName.pop();
				var packageName:String = qualifiedClassName.length ? qualifiedClassName.pop() : null;
				var typedNode:XMLNode = encodeValue(sessionState, new QName("", className), parentNode);
				if (objectName != null)
					typedNode = setAttributeAndReplaceNode(typedNode, "name", objectName);
				if (packageName && WeaveXMLDecoder.defaultPackages.indexOf(packageName) < 0)
					typedNode = setAttributeAndReplaceNode(typedNode, "package", packageName);
				return typedNode;
			}
			if (obj is Array)
			{
				var array:Array = obj as Array;
				var encoding:String = JSON_ENCODING;
				var arrayType:Class = StandardLib.getArrayType(array);
				var item:Object;
				
				// if there is a nested Array or String item in the Array, encode as CSV or CSVROW
				if (arrayType == Array)
				{
					encoding = CSV_ENCODING;
					for each (item in array)
					{
						if (StandardLib.getArrayType(item as Array) != String)
						{
							encoding = JSON_ENCODING;
							break;
						}
					}
				}
				else if (arrayType == String)
				{
					array = [array];
					encoding = CSVROW_ENCODING;
				}
				else if (array.length == 0 || arrayType == Object || arrayType == DynamicState)
				{
					encoding = DYNAMIC_ENCODING;
					for each (item in array)
					{
						if (!DynamicState.objectHasProperties(item) || !item[DynamicState.CLASS_NAME])
						{
							encoding = JSON_ENCODING;
							break;
						}
					}
				}
				
				if (encoding == JSON_ENCODING)
				{
					var jsonNode:XMLNode = encodeJSON(obj, qname, parentNode);
					if (jsonNode == null)
						reportError("Unable to encode Array as XML: " + ObjectUtil.toString(obj));
					return jsonNode;
				}
				
				var arrayNode:XMLNode = new XMLNode(XMLNodeType.ELEMENT_NODE, qname.localName);
				arrayNode.attributes["encoding"] = encoding;
				
				if (encoding == DYNAMIC_ENCODING)
				{
					for (var i:int = 0; i < array.length; i++)
						encodeValue(array[i], null, arrayNode);
				}
				else // CSV or CSVROW
				{
					var csvString:String = WeaveAPI.CSVParser.createCSV(array);
					var textNode:XMLNode = new XMLNode(XMLNodeType.TEXT_NODE, csvString);
					arrayNode.appendChild(textNode);
				}
				parentNode.appendChild(arrayNode);
				return arrayNode;
			}
			try
			{
				if (obj.hasOwnProperty(LinkableXML.XML_STRING))
					obj = XML(obj[LinkableXML.XML_STRING]);
			}
			catch (e:Error)
			{
				// do nothing if xml parsing fails
			}
			if (obj is XML)
	        {
				// super.encodeValue() does not use the variable name when encoding
				// an XMLDocument, so put the variable name as the tag name here.
				var tag:XML = <tag/>;
				tag["@encoding"] = XML_ENCODING;
				tag.setLocalName(qname.localName);
				tag.appendChild((obj as XML).copy()); // IMPORTANT: append a COPY of the xml.  Do not append the original XML, because that will set its parent!
				obj = new XMLDocument(tag.toXMLString());
	        }
			if (obj == null)
			{
				var nullNode:XMLNode = new XMLNode(XMLNodeType.ELEMENT_NODE, qname.localName);
				parentNode.appendChild(nullNode);
				return nullNode;
			}
			// avoid SimpleXMLEncoder's "INF" representation of Infinity
			if (obj === Number.POSITIVE_INFINITY || obj === Number.NEGATIVE_INFINITY)
				obj = obj.toString();
			
			var node:XMLNode = super.encodeValue(obj, qname, parentNode);
			try
			{
				XML(node);
			}
			catch (e:Error)
			{
				var badNode:XMLNode = node;
				node.removeNode();
				
				node = encodeJSON(obj, qname, parentNode);
				if (node == null)
					reportError("XMLEncoder: Unable to convert XMLNode to XML: " + badNode.toString());
			}
			return node;
		}
		
		private function encodeJSON(obj:Object, qname:QName, parentNode:XMLNode):XMLNode
		{
			var str:String = null;
			
			var json:Object = ClassUtils.getClassDefinition('JSON');
			if (json)
				str = json.stringify(obj, null, 2);
			else
				str = Compiler.stringify(obj);
			
			if (str == null)
				return null;
			
			var node:XMLNode = super.encodeValue(str, qname, parentNode);
			node.attributes["encoding"] = JSON_ENCODING;
			return node;
		}
		
		/**
		 * This function provides a workaround for a bug that occurs when setting an attribute in an XMLNode.
		 * If you try to do node.attributes.attributeName = "value", sometimes node.toString() will
		 * return something like  'attributeName="value" <nodeName />'.
		 * @param node An XMLNode, possibly a child of another XMLNode.  This will be replaced with a new XMLNode.
		 * @param attributeName The name of the attribute to set.
		 * @param attributeValue The new value for the specified attribute.
		 * @return A new XMLNode object containing the new attribute value, made a child of the parent of the given node if applicable.
		 */
		private function setAttributeAndReplaceNode(node:XMLNode, attributeName:String, attributeValue:String):XMLNode
		{
			if (node == null)
				return null;
			var parent:XMLNode = node.parentNode;
			if (parent != null)
				node.removeNode();
			var xml:XML = new XML(node.toString());
			xml["@"+attributeName] = attributeValue;
			node = new XMLDocument(xml.toXMLString()).firstChild;
			if (parent != null)
				parent.appendChild(node);
			return node;
		}
	}
}
