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
package weave.utils
{
	import flash.display.Graphics;
	import flash.geom.Point;
	
	/**
	 * A set of static functions for drawing to Graphics objects.
	 */
	public class DrawUtils
	{
		/**
		 * Similar to lineTo() and curveTo(), this will draw an arc on a Graphics object.
		 * @param graphics The Graphics where the arc will be drawn
		 * @param continueLine If this is true, lineTo() will be used on the first coordinate instead of moveTo()
		 * @param xCenter The x center coord of the arc
		 * @param yCenter The y center coord of the arc
		 * @param startAngle The angle where the arc starts
		 * @param endAngle The angle where the arc ends
		 * @param radius The radius of the circle that contains the arc
		 * @param yRadius Optional y radius for an elliptical arc instead of a circular one
		 * @param outputStartCoords A Point object used to output the starting coordinates of the arc.
		 * @author adufilie
		 */		
		public static function arcTo(graphics:Graphics, continueLine:Boolean, xCenter:Number, yCenter:Number, startAngle:Number, endAngle:Number, radius:Number, yRadius:Number = NaN, outputStartCoords:Point = null):void
		{
			if (isNaN(yRadius))
				yRadius = radius;
			
			// Calculate the span of each segment in radians based on a radius and a segmentLength.
			// argLength = arcSpan * radius
			// numSegs = arcLength / segLength
			// segSpan = arcSpan / numSegs
			//         = arcSpan / (arcLength / segLength)
			//         = arcSpan / (arcSpan * radius / segLength)
			//         = segLength / radius
			var maxRadius:Number = Math.max(Math.abs(radius), Math.abs(yRadius));
			var segmentLength:Number = 4; // pixels
			var segmentSpan:Number = segmentLength / maxRadius; // radians
			segmentSpan = Math.min(Math.PI / 4, segmentSpan); // maximum 45 degrees per segment
			// make sure we iterate in the right direction
			if (startAngle > endAngle)
				segmentSpan = -segmentSpan;
			// draw the segments
			var segmentCount:int = Math.ceil((endAngle - startAngle) / segmentSpan);
			for (var i:int = 0; i <= segmentCount; i++)
			{
				// make sure last coord is at specified endAngle
				if (i == segmentCount)
					startAngle = endAngle;
				
				var x:Number = xCenter + Math.cos(startAngle) * radius;
				var y:Number = yCenter + Math.sin(startAngle) * yRadius;
				if (i == 0 && outputStartCoords)
				{
					outputStartCoords.x = x;
					outputStartCoords.y = y;
				}
				if (i == 0 && !continueLine)
					graphics.moveTo(x, y);
				else
					graphics.lineTo(x, y);
				
				// prepare for next iteration
				startAngle += segmentSpan;
			}
		}

		/**
		 * @param horizontalEndPoints When true, the curve starts and ends horizontal. When false, vertical.
		 * @param curveNormValue Values that produce nice curves range from 0 to 1, 0 being a straight line. 
		 */
		public static function drawDoubleCurve(graphics:Graphics, startX:Number, startY:Number, endX:Number, endY:Number, horizontalEndPoints:Boolean, curveNormValue:Number = 1):void
		{
			graphics.moveTo(startX, startY);
			
			var dx:Number = (endX - startX);
			var dy:Number = (endY - startY);
			var centerX:Number = startX + dx / 2;
			var centerY:Number = startY + dy / 2;
			if (horizontalEndPoints)
			{
				graphics.curveTo(startX + dx / 4 * curveNormValue, startY, centerX, centerY);
				graphics.curveTo(endX - dx / 4 * curveNormValue, endY, endX, endY);
			}
			else
			{
				graphics.curveTo(startX, startY + dy / 4 * curveNormValue, centerX, centerY);
				graphics.curveTo(endX, endY - dy / 4 * curveNormValue, endX, endY);
			}
		}
		
		public static function drawCurvedLine(graphics:Graphics, startX:Number, startY:Number, endX:Number, endY:Number, curvature:Number):void
		{
			graphics.moveTo(startX, startY);
			
			if(curvature == 0)
				graphics.lineTo(endX, endY);
			else
				graphics.curveTo(startX + (endX - startX)/2, startY + (1 - curvature)/2*(endY - startY), endX, endY);
		}
	}
}