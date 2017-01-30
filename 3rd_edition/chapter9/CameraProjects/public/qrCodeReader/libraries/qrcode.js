/*
  Ported to ES6 by @iagolast 2016
  www.github.com/iagolast
*/
(function() {
    // Sorry for this :(
    var exports = {};

/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


GridSampler = {};

GridSampler.checkAndNudgePoints=function( image,  points)
		{
			var width = qrcode.width;
			var height = qrcode.height;
			// Check and nudge points from start until we see some that are OK:
			var nudged = true;
			for (var offset = 0; offset < points.length && nudged; offset += 2)
			{
				var x = Math.floor (points[offset]);
				var y = Math.floor( points[offset + 1]);
				if (x < - 1 || x > width || y < - 1 || y > height)
				{
					throw "Error.checkAndNudgePoints ";
				}
				nudged = false;
				if (x == - 1)
				{
					points[offset] = 0.0;
					nudged = true;
				}
				else if (x == width)
				{
					points[offset] = width - 1;
					nudged = true;
				}
				if (y == - 1)
				{
					points[offset + 1] = 0.0;
					nudged = true;
				}
				else if (y == height)
				{
					points[offset + 1] = height - 1;
					nudged = true;
				}
			}
			// Check and nudge points from end:
			nudged = true;
			for (var offset = points.length - 2; offset >= 0 && nudged; offset -= 2)
			{
				var x = Math.floor( points[offset]);
				var y = Math.floor( points[offset + 1]);
				if (x < - 1 || x > width || y < - 1 || y > height)
				{
					throw "Error.checkAndNudgePoints ";
				}
				nudged = false;
				if (x == - 1)
				{
					points[offset] = 0.0;
					nudged = true;
				}
				else if (x == width)
				{
					points[offset] = width - 1;
					nudged = true;
				}
				if (y == - 1)
				{
					points[offset + 1] = 0.0;
					nudged = true;
				}
				else if (y == height)
				{
					points[offset + 1] = height - 1;
					nudged = true;
				}
			}
		}
	


GridSampler.sampleGrid3=function( image,  dimension,  transform)
		{
			var bits = new BitMatrix(dimension);
			var points = new Array(dimension << 1);
			for (var y = 0; y < dimension; y++)
			{
				var max = points.length;
				var iValue =  y + 0.5;
				for (var x = 0; x < max; x += 2)
				{
					points[x] =  (x >> 1) + 0.5;
					points[x + 1] = iValue;
				}
				transform.transformPoints1(points);
				// Quick check to see if points transformed to something inside the image;
				// sufficient to check the endpoints
				GridSampler.checkAndNudgePoints(image, points);
				try
				{
					for (var x = 0; x < max; x += 2)
					{
						var xpoint = (Math.floor( points[x]) * 4) + (Math.floor( points[x + 1]) * qrcode.width * 4);
                        var bit = image[Math.floor( points[x])+ qrcode.width* Math.floor( points[x + 1])];
						qrcode.imagedata.data[xpoint] = bit?255:0;
						qrcode.imagedata.data[xpoint+1] = bit?255:0;
						qrcode.imagedata.data[xpoint+2] = 0;
						qrcode.imagedata.data[xpoint+3] = 255;
						//bits[x >> 1][ y]=bit;
						if(bit)
							bits.set_Renamed(x >> 1, y);
					}
				}
				catch ( aioobe)
				{
					// This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
					// transform gets "twisted" such that it maps a straight line of points to a set of points
					// whose endpoints are in bounds, but others are not. There is probably some mathematical
					// way to detect this about the transformation that I don't know yet.
					// This results in an ugly runtime exception despite our clever checks above -- can't have
					// that. We could check each point's coordinates but that feels duplicative. We settle for
					// catching and wrapping ArrayIndexOutOfBoundsException.
					throw "Error.checkAndNudgePoints";
				}
			}
			return bits;
		}

GridSampler.sampleGridx=function( image,  dimension,  p1ToX,  p1ToY,  p2ToX,  p2ToY,  p3ToX,  p3ToY,  p4ToX,  p4ToY,  p1FromX,  p1FromY,  p2FromX,  p2FromY,  p3FromX,  p3FromY,  p4FromX,  p4FromY)
{
	var transform = PerspectiveTransform.quadrilateralToQuadrilateral(p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);
			
	return GridSampler.sampleGrid3(image, dimension, transform);
}

/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/



function ECB(count,  dataCodewords)
{
	this.count = count;
	this.dataCodewords = dataCodewords;
	
	this.__defineGetter__("Count", function()
	{
		return this.count;
	});
	this.__defineGetter__("DataCodewords", function()
	{
		return this.dataCodewords;
	});
}

function ECBlocks( ecCodewordsPerBlock,  ecBlocks1,  ecBlocks2)
{
	this.ecCodewordsPerBlock = ecCodewordsPerBlock;
	if(ecBlocks2)
		this.ecBlocks = new Array(ecBlocks1, ecBlocks2);
	else
		this.ecBlocks = new Array(ecBlocks1);
	
	this.__defineGetter__("ECCodewordsPerBlock", function()
	{
		return this.ecCodewordsPerBlock;
	});
	
	this.__defineGetter__("TotalECCodewords", function()
	{
		return  this.ecCodewordsPerBlock * this.NumBlocks;
	});
	
	this.__defineGetter__("NumBlocks", function()
	{
		var total = 0;
		for (var i = 0; i < this.ecBlocks.length; i++)
		{
			total += this.ecBlocks[i].length;
		}
		return total;
	});
	
	this.getECBlocks=function()
			{
				return this.ecBlocks;
			}
}

function Version( versionNumber,  alignmentPatternCenters,  ecBlocks1,  ecBlocks2,  ecBlocks3,  ecBlocks4)
{
	this.versionNumber = versionNumber;
	this.alignmentPatternCenters = alignmentPatternCenters;
	this.ecBlocks = new Array(ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4);
	
	var total = 0;
	var ecCodewords = ecBlocks1.ECCodewordsPerBlock;
	var ecbArray = ecBlocks1.getECBlocks();
	for (var i = 0; i < ecbArray.length; i++)
	{
		var ecBlock = ecbArray[i];
		total += ecBlock.Count * (ecBlock.DataCodewords + ecCodewords);
	}
	this.totalCodewords = total;
	
	this.__defineGetter__("VersionNumber", function()
	{
		return  this.versionNumber;
	});
	
	this.__defineGetter__("AlignmentPatternCenters", function()
	{
		return  this.alignmentPatternCenters;
	});
	this.__defineGetter__("TotalCodewords", function()
	{
		return  this.totalCodewords;
	});
	this.__defineGetter__("DimensionForVersion", function()
	{
		return  17 + 4 * this.versionNumber;
	});
	
	this.buildFunctionPattern=function()
		{
			var dimension = this.DimensionForVersion;
			var bitMatrix = new BitMatrix(dimension);
			
			// Top left finder pattern + separator + format
			bitMatrix.setRegion(0, 0, 9, 9);
			// Top right finder pattern + separator + format
			bitMatrix.setRegion(dimension - 8, 0, 8, 9);
			// Bottom left finder pattern + separator + format
			bitMatrix.setRegion(0, dimension - 8, 9, 8);
			
			// Alignment patterns
			var max = this.alignmentPatternCenters.length;
			for (var x = 0; x < max; x++)
			{
				var i = this.alignmentPatternCenters[x] - 2;
				for (var y = 0; y < max; y++)
				{
					if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0))
					{
						// No alignment patterns near the three finder paterns
						continue;
					}
					bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
				}
			}
			
			// Vertical timing pattern
			bitMatrix.setRegion(6, 9, 1, dimension - 17);
			// Horizontal timing pattern
			bitMatrix.setRegion(9, 6, dimension - 17, 1);
			
			if (this.versionNumber > 6)
			{
				// Version info, top right
				bitMatrix.setRegion(dimension - 11, 0, 3, 6);
				// Version info, bottom left
				bitMatrix.setRegion(0, dimension - 11, 6, 3);
			}
			
			return bitMatrix;
		}
	this.getECBlocksForLevel=function( ecLevel)
	{
		return this.ecBlocks[ecLevel.ordinal()];
	}
}

Version.VERSION_DECODE_INFO = new Array(0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78, 0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB, 0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B, 0x2542E, 0x26A64, 0x27541, 0x28C69);

Version.VERSIONS = buildVersions();

Version.getVersionForNumber=function( versionNumber)
{
	if (versionNumber < 1 || versionNumber > 40)
	{
		throw "ArgumentException";
	}
	return Version.VERSIONS[versionNumber - 1];
}

Version.getProvisionalVersionForDimension=function(dimension)
{
	if (dimension % 4 != 1)
	{
		throw "Error getProvisionalVersionForDimension";
	}
	try
	{
		return Version.getVersionForNumber((dimension - 17) >> 2);
	}
	catch ( iae)
	{
		throw "Error getVersionForNumber";
	}
}

Version.decodeVersionInformation=function( versionBits)
{
	var bestDifference = 0xffffffff;
	var bestVersion = 0;
	for (var i = 0; i < Version.VERSION_DECODE_INFO.length; i++)
	{
		var targetVersion = Version.VERSION_DECODE_INFO[i];
		// Do the version info bits match exactly? done.
		if (targetVersion == versionBits)
		{
			return this.getVersionForNumber(i + 7);
		}
		// Otherwise see if this is the closest to a real version info bit string
		// we have seen so far
		var bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);
		if (bitsDifference < bestDifference)
		{
			bestVersion = i + 7;
			bestDifference = bitsDifference;
		}
	}
	// We can tolerate up to 3 bits of error since no two version info codewords will
	// differ in less than 4 bits.
	if (bestDifference <= 3)
	{
		return this.getVersionForNumber(bestVersion);
	}
	// If we didn't find a close enough match, fail
	return null;
}

function buildVersions()
{
	return new Array(new Version(1, new Array(), new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))), 
	new Version(2, new Array(6, 18), new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))), 
	new Version(3, new Array(6, 22), new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))), 
	new Version(4, new Array(6, 26), new ECBlocks(20, new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))), 
	new Version(5, new Array(6, 30), new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))), 
	new Version(6, new Array(6, 34), new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))), 
	new Version(7, new Array(6, 22, 38), new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4, 31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))), 
	new Version(8, new Array(6, 24, 42), new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))), 
	new Version(9, new Array(6, 26, 46), new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))), 
	new Version(10, new Array(6, 28, 50), new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))), 
	new Version(11, new Array(6, 30, 54), new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))), 
	new Version(12, new Array(6, 32, 58), new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))), 
	new Version(13, new Array(6, 34, 62), new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))), 
	new Version(14, new Array(6, 26, 46, 66), new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))), 
	new Version(15, new Array(6, 26, 48, 70), new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))), 
	new Version(16, new Array(6, 26, 50, 74), new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))), 
	new Version(17, new Array(6, 30, 54, 78), new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))), 
	new Version(18, new Array(6, 30, 56, 82), new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))), 
	new Version(19, new Array(6, 30, 58, 86), new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))), 
	new Version(20, new Array(6, 34, 62, 90), new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))), 
	new Version(21, new Array(6, 28, 50, 72, 94), new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))), 
	new Version(22, new Array(6, 26, 50, 74, 98), new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))), 
	new Version(23, new Array(6, 30, 54, 74, 102), new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))), 
	new Version(24, new Array(6, 28, 54, 80, 106), new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))), 
	new Version(25, new Array(6, 32, 58, 84, 110), new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))), 
	new Version(26, new Array(6, 30, 58, 86, 114), new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))), 
	new Version(27, new Array(6, 34, 62, 90, 118), new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15), 		new ECB(28, 16))),
	new Version(28, new Array(6, 26, 50, 74, 98, 122), new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))), 
	new Version(29, new Array(6, 30, 54, 78, 102, 126), new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))), 
	new Version(30, new Array(6, 26, 52, 78, 104, 130), new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))), 
	new Version(31, new Array(6, 30, 56, 82, 108, 134), new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))), 
	new Version(32, new Array(6, 34, 60, 86, 112, 138), new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))), 
	new Version(33, new Array(6, 30, 58, 86, 114, 142), new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))), 
	new Version(34, new Array(6, 34, 62, 90, 118, 146), new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))), 
	new Version(35, new Array(6, 30, 54, 78, 102, 126, 150), new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))), 
	new Version(36, new Array(6, 24, 50, 76, 102, 128, 154), new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))), 
	new Version(37, new Array(6, 28, 54, 80, 106, 132, 158), new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))), 
	new Version(38, new Array(6, 32, 58, 84, 110, 136, 162), new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))), 
	new Version(39, new Array(6, 26, 54, 82, 110, 138, 166), new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))), 
	new Version(40, new Array(6, 30, 58, 86, 114, 142, 170), new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))));
}
function PerspectiveTransform(a11, a21, a31, a12, a22, a32, a13, a23, a33) {
  this.a11 = a11;
  this.a12 = a12;
  this.a13 = a13;
  this.a21 = a21;
  this.a22 = a22;
  this.a23 = a23;
  this.a31 = a31;
  this.a32 = a32;
  this.a33 = a33;
  this.transformPoints1 = function(points) {
    var max = points.length;
    var a11 = this.a11;
    var a12 = this.a12;
    var a13 = this.a13;
    var a21 = this.a21;
    var a22 = this.a22;
    var a23 = this.a23;
    var a31 = this.a31;
    var a32 = this.a32;
    var a33 = this.a33;
    for (var i = 0; i < max; i += 2) {
      var x = points[i];
      var y = points[i + 1];
      var denominator = a13 * x + a23 * y + a33;
      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  }
  this.transformPoints2 = function(xValues, yValues) {
    var n = xValues.length;
    for (var i = 0; i < n; i++) {
      var x = xValues[i];
      var y = yValues[i];
      var denominator = this.a13 * x + this.a23 * y + this.a33;
      xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
      yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
    }
  }

  this.buildAdjoint = function() {
    // Adjoint is the transpose of the cofactor matrix:
    return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21);
  }
  this.times = function(other) {
    return new PerspectiveTransform(this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13, this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23, this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33, this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13, this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23, this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33, this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13, this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23, this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
  }

}

PerspectiveTransform.quadrilateralToQuadrilateral = function(x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {

  var qToS = this.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
  var sToQ = this.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
  return sToQ.times(qToS);
}

PerspectiveTransform.squareToQuadrilateral = function(x0, y0, x1, y1, x2, y2, x3, y3) {
  dy2 = y3 - y2;
  dy3 = y0 - y1 + y2 - y3;
  if (dy2 == 0.0 && dy3 == 0.0) {
    return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
  } else {
    dx1 = x1 - x2;
    dx2 = x3 - x2;
    dx3 = x0 - x1 + x2 - x3;
    dy1 = y1 - y2;
    denominator = dx1 * dy2 - dx2 * dy1;
    a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
    a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
    return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
  }
}

PerspectiveTransform.quadrilateralToSquare = function(x0, y0, x1, y1, x2, y2, x3, y3) {
  // Here, the adjoint serves as the inverse:
  return this.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */







function Detector(image) {
  function DetectorResult(bits, points) {
    this.bits = bits;
    this.points = points;
  }
  this.image = image;
  this.resultPointCallback = null;

  this.sizeOfBlackWhiteBlackRun = function(fromX, fromY, toX, toY) {
    // Mild variant of Bresenham's algorithm;
    // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
    if (steep) {
      var temp = fromX;
      fromX = fromY;
      fromY = temp;
      temp = toX;
      toX = toY;
      toY = temp;
    }

    var dx = Math.abs(toX - fromX);
    var dy = Math.abs(toY - fromY);
    var error = -dx >> 1;
    var ystep = fromY < toY ? 1 : -1;
    var xstep = fromX < toX ? 1 : -1;
    var state = 0; // In black pixels, looking for white, first or second time
    for (var x = fromX, y = fromY; x != toX; x += xstep) {

      var realX = steep ? y : x;
      var realY = steep ? x : y;
      if (state == 1) {
        // In white pixels, looking for black
        if (this.image[realX + realY * qrcode.width]) {
          state++;
        }
      } else {
        if (!this.image[realX + realY * qrcode.width]) {
          state++;
        }
      }

      if (state == 3) {
        // Found black, white, black, and stumbled back onto white; done
        var diffX = x - fromX;
        var diffY = y - fromY;
        return Math.sqrt((diffX * diffX + diffY * diffY));
      }
      error += dy;
      if (error > 0) {
        if (y == toY) {
          break;
        }
        y += ystep;
        error -= dx;
      }
    }
    var diffX2 = toX - fromX;
    var diffY2 = toY - fromY;
    return Math.sqrt((diffX2 * diffX2 + diffY2 * diffY2));
  }


  this.sizeOfBlackWhiteBlackRunBothWays = function(fromX, fromY, toX, toY) {

    var result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

    // Now count other way -- don't run off image though of course
    var scale = 1.0;
    var otherToX = fromX - (toX - fromX);
    if (otherToX < 0) {
      scale = fromX / (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= qrcode.width) {
      scale = (qrcode.width - 1 - fromX) / (otherToX - fromX);
      otherToX = qrcode.width - 1;
    }
    var otherToY = Math.floor(fromY - (toY - fromY) * scale);

    scale = 1.0;
    if (otherToY < 0) {
      scale = fromY / (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= qrcode.height) {
      scale = (qrcode.height - 1 - fromY) / (otherToY - fromY);
      otherToY = qrcode.height - 1;
    }
    otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

    result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
    return result - 1.0; // -1 because we counted the middle pixel twice
  }



  this.calculateModuleSizeOneWay = function(pattern, otherPattern) {
    var moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(pattern.X), Math.floor(pattern.Y), Math.floor(otherPattern.X), Math.floor(otherPattern.Y));
    var moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor(pattern.X), Math.floor(pattern.Y));
    if (isNaN(moduleSizeEst1)) {
      return moduleSizeEst2 / 7.0;
    }
    if (isNaN(moduleSizeEst2)) {
      return moduleSizeEst1 / 7.0;
    }
    // Average them, and divide by 7 since we've counted the width of 3 black modules,
    // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
    return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
  }


  this.calculateModuleSize = function(topLeft, topRight, bottomLeft) {
    // Take the average
    return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
  }

  this.distance = function(pattern1, pattern2) {
    xDiff = pattern1.X - pattern2.X;
    yDiff = pattern1.Y - pattern2.Y;
    return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
  }
  this.computeDimension = function(topLeft, topRight, bottomLeft, moduleSize) {

    var tltrCentersDimension = Math.round(this.distance(topLeft, topRight) / moduleSize);
    var tlblCentersDimension = Math.round(this.distance(topLeft, bottomLeft) / moduleSize);
    var dimension = ((tltrCentersDimension + tlblCentersDimension) >> 1) + 7;
    switch (dimension & 0x03) {

      // mod 4
      case 0:
        dimension++;
        break;
        // 1? do nothing

      case 2:
        dimension--;
        break;

      case 3:
        throw "Error";
    }
    return dimension;
  }

  this.findAlignmentInRegion = function(overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
    // Look for an alignment pattern (3 modules in size) around where it
    // should be
    var allowance = Math.floor(allowanceFactor * overallEstModuleSize);
    var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
    var alignmentAreaRightX = Math.min(qrcode.width - 1, estAlignmentX + allowance);
    if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
      throw "Error";
    }

    var alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
    var alignmentAreaBottomY = Math.min(qrcode.height - 1, estAlignmentY + allowance);

    var alignmentFinder = new AlignmentPatternFinder(this.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, this.resultPointCallback);
    return alignmentFinder.find();
  }

  this.createTransform = function(topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
    var dimMinusThree = dimension - 3.5;
    var bottomRightX;
    var bottomRightY;
    var sourceBottomRightX;
    var sourceBottomRightY;
    if (alignmentPattern != null) {
      bottomRightX = alignmentPattern.X;
      bottomRightY = alignmentPattern.Y;
      sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
    } else {
      // Don't have an alignment pattern, just make up the bottom-right point
      bottomRightX = (topRight.X - topLeft.X) + bottomLeft.X;
      bottomRightY = (topRight.Y - topLeft.Y) + bottomLeft.Y;
      sourceBottomRightX = sourceBottomRightY = dimMinusThree;
    }

    var transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);

    return transform;
  }

  this.sampleGrid = function(image, transform, dimension) {

    var sampler = GridSampler;
    return sampler.sampleGrid3(image, dimension, transform);
  }

  this.processFinderPatternInfo = function(info) {

    var topLeft = info.TopLeft;
    var topRight = info.TopRight;
    var bottomLeft = info.BottomLeft;

    var moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
    if (moduleSize < 1.0) {
      throw "Error";
    }
    var dimension = this.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
    var provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
    var modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7;

    var alignmentPattern = null;
    // Anything above version 1 has an alignment pattern
    if (provisionalVersion.AlignmentPatternCenters.length > 0) {

      // Guess where a "bottom right" finder pattern would have been
      var bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
      var bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y;

      // Estimate that alignment pattern is closer by 3 modules
      // from "bottom right" to known top left location
      var correctionToTopLeft = 1.0 - 3.0 / modulesBetweenFPCenters;
      var estAlignmentX = Math.floor(topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X));
      var estAlignmentY = Math.floor(topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y));

      // Kind of arbitrary -- expand search radius before giving up
      for (var i = 4; i <= 16; i <<= 1) {
        //try
        //{
        alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
        break;
        //}
        //catch (re)
        //{
        // try next round
        //}
      }
      // If we didn't find alignment pattern... well try anyway without it
    }

    var transform = this.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);

    var bits = this.sampleGrid(this.image, transform, dimension);

    var points;
    if (alignmentPattern == null) {
      points = new Array(bottomLeft, topLeft, topRight);
    } else {
      points = new Array(bottomLeft, topLeft, topRight, alignmentPattern);
    }
    return new DetectorResult(bits, points);
  }



  this.detect = function() {
    var info = new FinderPatternFinder().findFinderPattern(this.image);

    return this.processFinderPatternInfo(info);
  }
}

/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var FORMAT_INFO_MASK_QR = 0x5412;
var FORMAT_INFO_DECODE_LOOKUP = new Array(new Array(0x5412, 0x00), new Array(0x5125, 0x01), new Array(0x5E7C, 0x02), new Array(0x5B4B, 0x03), new Array(0x45F9, 0x04), new Array(0x40CE, 0x05), new Array(0x4F97, 0x06), new Array(0x4AA0, 0x07), new Array(0x77C4, 0x08), new Array(0x72F3, 0x09), new Array(0x7DAA, 0x0A), new Array(0x789D, 0x0B), new Array(0x662F, 0x0C), new Array(0x6318, 0x0D), new Array(0x6C41, 0x0E), new Array(0x6976, 0x0F), new Array(0x1689, 0x10), new Array(0x13BE, 0x11), new Array(0x1CE7, 0x12), new Array(0x19D0, 0x13), new Array(0x0762, 0x14), new Array(0x0255, 0x15), new Array(0x0D0C, 0x16), new Array(0x083B, 0x17), new Array(0x355F, 0x18), new Array(0x3068, 0x19), new Array(0x3F31, 0x1A), new Array(0x3A06, 0x1B), new Array(0x24B4, 0x1C), new Array(0x2183, 0x1D), new Array(0x2EDA, 0x1E), new Array(0x2BED, 0x1F));
var BITS_SET_IN_HALF_BYTE = new Array(0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4);


function FormatInformation(formatInfo)
{
	this.errorCorrectionLevel = ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
	this.dataMask =  (formatInfo & 0x07);

	this.__defineGetter__("ErrorCorrectionLevel", function()
	{
		return this.errorCorrectionLevel;
	});
	this.__defineGetter__("DataMask", function()
	{
		return this.dataMask;
	});
	this.GetHashCode=function()
	{
		return (this.errorCorrectionLevel.ordinal() << 3) |  dataMask;
	}
	this.Equals=function( o)
	{
		var other =  o;
		return this.errorCorrectionLevel == other.errorCorrectionLevel && this.dataMask == other.dataMask;
	}
}

FormatInformation.numBitsDiffering=function( a,  b)
{
	a ^= b; // a now has a 1 bit exactly where its bit differs with b's
	// Count bits set quickly with a series of lookups:
	return BITS_SET_IN_HALF_BYTE[a & 0x0F] + BITS_SET_IN_HALF_BYTE[(URShift(a, 4) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 8) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 12) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 16) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 20) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 24) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 28) & 0x0F)];
}

FormatInformation.decodeFormatInformation=function( maskedFormatInfo)
{
	var formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo);
	if (formatInfo != null)
	{
		return formatInfo;
	}
	// Should return null, but, some QR codes apparently
	// do not mask this info. Try again by actually masking the pattern
	// first
	return FormatInformation.doDecodeFormatInformation(maskedFormatInfo ^ FORMAT_INFO_MASK_QR);
}
FormatInformation.doDecodeFormatInformation=function( maskedFormatInfo)
{
	// Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
	var bestDifference = 0xffffffff;
	var bestFormatInfo = 0;
	for (var i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++)
	{
		var decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
		var targetInfo = decodeInfo[0];
		if (targetInfo == maskedFormatInfo)
		{
			// Found an exact match
			return new FormatInformation(decodeInfo[1]);
		}
		var bitsDifference = this.numBitsDiffering(maskedFormatInfo, targetInfo);
		if (bitsDifference < bestDifference)
		{
			bestFormatInfo = decodeInfo[1];
			bestDifference = bitsDifference;
		}
	}
	// Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
	// differing means we found a match
	if (bestDifference <= 3)
	{
		return new FormatInformation(bestFormatInfo);
	}
	return null;
}

		
/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function ErrorCorrectionLevel(ordinal, bits, name) {
  this.ordinal_Renamed_Field = ordinal;
  this.bits = bits;
  this.name = name;
  this.__defineGetter__("Bits", function() {
    return this.bits;
  });
  this.__defineGetter__("Name", function() {
    return this.name;
  });
  this.ordinal = function() {
    return this.ordinal_Renamed_Field;
  }
}

ErrorCorrectionLevel.forBits = function(bits) {
  if (bits < 0 || bits >= FOR_BITS.length) {
    throw "ArgumentException";
  }
  return FOR_BITS[bits];
}

var L = new ErrorCorrectionLevel(0, 0x01, "L");
var M = new ErrorCorrectionLevel(1, 0x00, "M");
var Q = new ErrorCorrectionLevel(2, 0x03, "Q");
var H = new ErrorCorrectionLevel(3, 0x02, "H");
var FOR_BITS = new Array(M, L, H, Q);

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function BitMatrix(width, height) {
  if (!height)
    height = width;
  if (width < 1 || height < 1) {
    throw "Both dimensions must be greater than 0";
  }
  this.width = width;
  this.height = height;
  var rowSize = width >> 5;
  if ((width & 0x1f) != 0) {
    rowSize++;
  }
  this.rowSize = rowSize;
  this.bits = new Array(rowSize * height);
  for (var i = 0; i < this.bits.length; i++)
    this.bits[i] = 0;

  this.__defineGetter__("Width", function() {
    return this.width;
  });
  this.__defineGetter__("Height", function() {
    return this.height;
  });
  this.__defineGetter__("Dimension", function() {
    if (this.width != this.height) {
      throw "Can't call getDimension() on a non-square matrix";
    }
    return this.width;
  });

  this.get_Renamed = function(x, y) {
    var offset = y * this.rowSize + (x >> 5);
    return ((URShift(this.bits[offset], (x & 0x1f))) & 1) != 0;
  }
  this.set_Renamed = function(x, y) {
    var offset = y * this.rowSize + (x >> 5);
    this.bits[offset] |= 1 << (x & 0x1f);
  }
  this.flip = function(x, y) {
    var offset = y * this.rowSize + (x >> 5);
    this.bits[offset] ^= 1 << (x & 0x1f);
  }
  this.clear = function() {
    var max = this.bits.length;
    for (var i = 0; i < max; i++) {
      this.bits[i] = 0;
    }
  }
  this.setRegion = function(left, top, width, height) {
    if (top < 0 || left < 0) {
      throw "Left and top must be nonnegative";
    }
    if (height < 1 || width < 1) {
      throw "Height and width must be at least 1";
    }
    var right = left + width;
    var bottom = top + height;
    if (bottom > this.height || right > this.width) {
      throw "The region must fit inside the matrix";
    }
    for (var y = top; y < bottom; y++) {
      var offset = y * this.rowSize;
      for (var x = left; x < right; x++) {
        this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
      }
    }
  }
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function DataBlock(numDataCodewords, codewords) {
  this.numDataCodewords = numDataCodewords;
  this.codewords = codewords;

  this.__defineGetter__("NumDataCodewords", function() {
    return this.numDataCodewords;
  });
  this.__defineGetter__("Codewords", function() {
    return this.codewords;
  });
}

DataBlock.getDataBlocks = function(rawCodewords, version, ecLevel) {

  if (rawCodewords.length != version.TotalCodewords) {
    throw "ArgumentException";
  }

  // Figure out the number and size of data blocks used by this version and
  // error correction level
  var ecBlocks = version.getECBlocksForLevel(ecLevel);

  // First count the total number of data blocks
  var totalBlocks = 0;
  var ecBlockArray = ecBlocks.getECBlocks();
  for (var i = 0; i < ecBlockArray.length; i++) {
    totalBlocks += ecBlockArray[i].Count;
  }

  // Now establish DataBlocks of the appropriate size and number of data codewords
  var result = new Array(totalBlocks);
  var numResultBlocks = 0;
  for (var j = 0; j < ecBlockArray.length; j++) {
    var ecBlock = ecBlockArray[j];
    for (var i = 0; i < ecBlock.Count; i++) {
      var numDataCodewords = ecBlock.DataCodewords;
      var numBlockCodewords = ecBlocks.ECCodewordsPerBlock + numDataCodewords;
      result[numResultBlocks++] = new DataBlock(numDataCodewords, new Array(numBlockCodewords));
    }
  }

  // All blocks have the same amount of data, except that the last n
  // (where n may be 0) have 1 more byte. Figure out where these start.
  var shorterBlocksTotalCodewords = result[0].codewords.length;
  var longerBlocksStartAt = result.length - 1;
  while (longerBlocksStartAt >= 0) {
    var numCodewords = result[longerBlocksStartAt].codewords.length;
    if (numCodewords == shorterBlocksTotalCodewords) {
      break;
    }
    longerBlocksStartAt--;
  }
  longerBlocksStartAt++;

  var shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ECCodewordsPerBlock;
  // The last elements of result may be 1 element longer;
  // first fill out as many elements as all of them have
  var rawCodewordsOffset = 0;
  for (var i = 0; i < shorterBlocksNumDataCodewords; i++) {
    for (var j = 0; j < numResultBlocks; j++) {
      result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
    }
  }
  // Fill out the last data block in the longer ones
  for (var j = longerBlocksStartAt; j < numResultBlocks; j++) {
    result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
  }
  // Now add in error correction blocks
  var max = result[0].codewords.length;
  for (var i = shorterBlocksNumDataCodewords; i < max; i++) {
    for (var j = 0; j < numResultBlocks; j++) {
      var iOffset = j < longerBlocksStartAt ? i : i + 1;
      result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
    }
  }
  return result;
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function BitMatrixParser(bitMatrix) {
  var dimension = bitMatrix.Dimension;
  if (dimension < 21 || (dimension & 0x03) != 1) {
    throw "Error BitMatrixParser";
  }
  this.bitMatrix = bitMatrix;
  this.parsedVersion = null;
  this.parsedFormatInfo = null;

  this.copyBit = function(i, j, versionBits) {
    return this.bitMatrix.get_Renamed(i, j) ? (versionBits << 1) | 0x1 : versionBits << 1;
  }

  this.readFormatInformation = function() {
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }

    // Read top-left format info bits
    var formatInfoBits = 0;
    for (var i = 0; i < 6; i++) {
      formatInfoBits = this.copyBit(i, 8, formatInfoBits);
    }
    // .. and skip a bit in the timing pattern ...
    formatInfoBits = this.copyBit(7, 8, formatInfoBits);
    formatInfoBits = this.copyBit(8, 8, formatInfoBits);
    formatInfoBits = this.copyBit(8, 7, formatInfoBits);
    // .. and skip a bit in the timing pattern ...
    for (var j = 5; j >= 0; j--) {
      formatInfoBits = this.copyBit(8, j, formatInfoBits);
    }

    this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }

    // Hmm, failed. Try the top-right/bottom-left pattern
    var dimension = this.bitMatrix.Dimension;
    formatInfoBits = 0;
    var iMin = dimension - 8;
    for (var i = dimension - 1; i >= iMin; i--) {
      formatInfoBits = this.copyBit(i, 8, formatInfoBits);
    }
    for (var j = dimension - 7; j < dimension; j++) {
      formatInfoBits = this.copyBit(8, j, formatInfoBits);
    }

    this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }
    throw "Error readFormatInformation";
  }
  this.readVersion = function() {

    if (this.parsedVersion != null) {
      return this.parsedVersion;
    }

    var dimension = this.bitMatrix.Dimension;

    var provisionalVersion = (dimension - 17) >> 2;
    if (provisionalVersion <= 6) {
      return Version.getVersionForNumber(provisionalVersion);
    }

    // Read top-right version info: 3 wide by 6 tall
    var versionBits = 0;
    var ijMin = dimension - 11;
    for (var j = 5; j >= 0; j--) {
      for (var i = dimension - 9; i >= ijMin; i--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    this.parsedVersion = Version.decodeVersionInformation(versionBits);
    if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
      return this.parsedVersion;
    }

    // Hmm, failed. Try bottom left: 6 wide by 3 tall
    versionBits = 0;
    for (var i = 5; i >= 0; i--) {
      for (var j = dimension - 9; j >= ijMin; j--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    this.parsedVersion = Version.decodeVersionInformation(versionBits);
    if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
      return this.parsedVersion;
    }
    throw "Error readVersion";
  }
  this.readCodewords = function() {

    var formatInfo = this.readFormatInformation();
    var version = this.readVersion();

    // Get the data mask for the format used in this QR Code. This will exclude
    // some bits from reading as we wind through the bit matrix.
    var dataMask = DataMask.forReference(formatInfo.DataMask);
    var dimension = this.bitMatrix.Dimension;
    dataMask.unmaskBitMatrix(this.bitMatrix, dimension);

    var functionPattern = version.buildFunctionPattern();

    var readingUp = true;
    var result = new Array(version.TotalCodewords);
    var resultOffset = 0;
    var currentByte = 0;
    var bitsRead = 0;
    // Read columns in pairs, from right to left
    for (var j = dimension - 1; j > 0; j -= 2) {
      if (j == 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }
      // Read alternatingly from bottom to top then top to bottom
      for (var count = 0; count < dimension; count++) {
        var i = readingUp ? dimension - 1 - count : count;
        for (var col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!functionPattern.get_Renamed(j - col, i)) {
            // Read a bit
            bitsRead++;
            currentByte <<= 1;
            if (this.bitMatrix.get_Renamed(j - col, i)) {
              currentByte |= 1;
            }
            // If we've made a whole byte, save it off
            if (bitsRead == 8) {
              result[resultOffset++] = currentByte;
              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }
      readingUp ^= true; // readingUp = !readingUp; // switch directions
    }
    if (resultOffset != version.TotalCodewords) {
      throw "Error readCodewords";
    }
    return result;
  }
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


DataMask = {};

DataMask.forReference = function(reference) {
  if (reference < 0 || reference > 7) {
    throw "System.ArgumentException";
  }
  return DataMask.DATA_MASKS[reference];
}

function DataMask000() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    return ((i + j) & 0x01) == 0;
  }
}

function DataMask001() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    return (i & 0x01) == 0;
  }
}

function DataMask010() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    return j % 3 == 0;
  }
}

function DataMask011() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    return (i + j) % 3 == 0;
  }
}

function DataMask100() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    return (((URShift(i, 1)) + (j / 3)) & 0x01) == 0;
  }
}

function DataMask101() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    var temp = i * j;
    return (temp & 0x01) + (temp % 3) == 0;
  }
}

function DataMask110() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    var temp = i * j;
    return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
  }
}

function DataMask111() {
  this.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  this.isMasked = function(i, j) {
    return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
  }
}

DataMask.DATA_MASKS = new Array(new DataMask000(), new DataMask001(), new DataMask010(), new DataMask011(), new DataMask100(), new DataMask101(), new DataMask110(), new DataMask111());

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function ReedSolomonDecoder(field) {
	this.field = field;

	this.decode = function(received, twoS) {
		var poly = new GF256Poly(this.field, received);
		var syndromeCoefficients = new Array(twoS);
		for (var i = 0; i < syndromeCoefficients.length; i++) syndromeCoefficients[i] = 0;
		var dataMatrix = false; //this.field.Equals(GF256.DATA_MATRIX_FIELD);
		var noError = true;
		for (var i = 0; i < twoS; i++) {
			// Thanks to sanfordsquires for this fix:
			var eval = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
			syndromeCoefficients[syndromeCoefficients.length - 1 - i] = eval;
			if (eval != 0) {
				noError = false;
			}
		}
		if (noError) {
			return;
		}
		var syndrome = new GF256Poly(this.field, syndromeCoefficients);
		var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
		var sigma = sigmaOmega[0];
		var omega = sigmaOmega[1];
		var errorLocations = this.findErrorLocations(sigma);
		var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations, dataMatrix);
		for (var i = 0; i < errorLocations.length; i++) {
			var position = received.length - 1 - this.field.log(errorLocations[i]);
			if (position < 0) {
				throw "ReedSolomonException Bad error location";
			}
			received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
		}
	}
	this.runEuclideanAlgorithm = function(a, b, R) {
		// Assume a's degree is >= b's
		if (a.Degree < b.Degree) {
			var temp = a;
			a = b;
			b = temp;
		}

		var rLast = a;
		var r = b;
		var sLast = this.field.One;
		var s = this.field.Zero;
		var tLast = this.field.Zero;
		var t = this.field.One;

		// Run Euclidean algorithm until r's degree is less than R/2
		while (r.Degree >= Math.floor(R / 2)) {
			var rLastLast = rLast;
			var sLastLast = sLast;
			var tLastLast = tLast;
			rLast = r;
			sLast = s;
			tLast = t;

			// Divide rLastLast by rLast, with quotient in q and remainder in r
			if (rLast.Zero) {
				// Oops, Euclidean algorithm already terminated?
				throw "r_{i-1} was zero";
			}
			r = rLastLast;
			var q = this.field.Zero;
			var denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree);
			var dltInverse = this.field.inverse(denominatorLeadingTerm);
			while (r.Degree >= rLast.Degree && !r.Zero) {
				var degreeDiff = r.Degree - rLast.Degree;
				var scale = this.field.multiply(r.getCoefficient(r.Degree), dltInverse);
				q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
				r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
				//r.EXE();
			}

			s = q.multiply1(sLast).addOrSubtract(sLastLast);
			t = q.multiply1(tLast).addOrSubtract(tLastLast);
		}

		var sigmaTildeAtZero = t.getCoefficient(0);
		if (sigmaTildeAtZero == 0) {
			throw "ReedSolomonException sigmaTilde(0) was zero";
		}

		var inverse = this.field.inverse(sigmaTildeAtZero);
		var sigma = t.multiply2(inverse);
		var omega = r.multiply2(inverse);
		return new Array(sigma, omega);
	}
	this.findErrorLocations = function(errorLocator) {
		// This is a direct application of Chien's search
		var numErrors = errorLocator.Degree;
		if (numErrors == 1) {
			// shortcut
			return new Array(errorLocator.getCoefficient(1));
		}
		var result = new Array(numErrors);
		var e = 0;
		for (var i = 1; i < 256 && e < numErrors; i++) {
			if (errorLocator.evaluateAt(i) == 0) {
				result[e] = this.field.inverse(i);
				e++;
			}
		}
		if (e != numErrors) {
			throw "Error locator degree does not match number of roots";
		}
		return result;
	}
	this.findErrorMagnitudes = function(errorEvaluator, errorLocations, dataMatrix) {
		// This is directly applying Forney's Formula
		var s = errorLocations.length;
		var result = new Array(s);
		for (var i = 0; i < s; i++) {
			var xiInverse = this.field.inverse(errorLocations[i]);
			var denominator = 1;
			for (var j = 0; j < s; j++) {
				if (i != j) {
					denominator = this.field.multiply(denominator, GF256.addOrSubtract(1, this.field.multiply(errorLocations[j], xiInverse)));
				}
			}
			result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
			// Thanks to sanfordsquires for this fix:
			if (dataMatrix) {
				result[i] = this.field.multiply(result[i], xiInverse);
			}
		}
		return result;
	}
}

/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function GF256Poly(field,  coefficients)
{
	if (coefficients == null || coefficients.length == 0)
	{
		throw "System.ArgumentException";
	}
	this.field = field;
	var coefficientsLength = coefficients.length;
	if (coefficientsLength > 1 && coefficients[0] == 0)
	{
		// Leading term must be non-zero for anything except the constant polynomial "0"
		var firstNonZero = 1;
		while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0)
		{
			firstNonZero++;
		}
		if (firstNonZero == coefficientsLength)
		{
			this.coefficients = field.Zero.coefficients;
		}
		else
		{
			this.coefficients = new Array(coefficientsLength - firstNonZero);
			for(var i=0;i<this.coefficients.length;i++)this.coefficients[i]=0;
			//Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
			for(var ci=0;ci<this.coefficients.length;ci++)this.coefficients[ci]=coefficients[firstNonZero+ci];
		}
	}
	else
	{
		this.coefficients = coefficients;
	}
	
	this.__defineGetter__("Zero", function()
	{
		return this.coefficients[0] == 0;
	});
	this.__defineGetter__("Degree", function()
	{
		return this.coefficients.length - 1;
	});
	this.__defineGetter__("Coefficients", function()
	{
		return this.coefficients;
	});
	
	this.getCoefficient=function( degree)
	{
		return this.coefficients[this.coefficients.length - 1 - degree];
	}
	
	this.evaluateAt=function( a)
	{
		if (a == 0)
		{
			// Just return the x^0 coefficient
			return this.getCoefficient(0);
		}
		var size = this.coefficients.length;
		if (a == 1)
		{
			// Just the sum of the coefficients
			var result = 0;
			for (var i = 0; i < size; i++)
			{
				result = GF256.addOrSubtract(result, this.coefficients[i]);
			}
			return result;
		}
		var result2 = this.coefficients[0];
		for (var i = 1; i < size; i++)
		{
			result2 = GF256.addOrSubtract(this.field.multiply(a, result2), this.coefficients[i]);
		}
		return result2;
	}
	
	this.addOrSubtract=function( other)
		{
			if (this.field != other.field)
			{
				throw "GF256Polys do not have same GF256 field";
			}
			if (this.Zero)
			{
				return other;
			}
			if (other.Zero)
			{
				return this;
			}
			
			var smallerCoefficients = this.coefficients;
			var largerCoefficients = other.coefficients;
			if (smallerCoefficients.length > largerCoefficients.length)
			{
				var temp = smallerCoefficients;
				smallerCoefficients = largerCoefficients;
				largerCoefficients = temp;
			}
			var sumDiff = new Array(largerCoefficients.length);
			var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
			// Copy high-order terms only found in higher-degree polynomial's coefficients
			//Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
			for(var ci=0;ci<lengthDiff;ci++)sumDiff[ci]=largerCoefficients[ci];
			
			for (var i = lengthDiff; i < largerCoefficients.length; i++)
			{
				sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
			}
			
			return new GF256Poly(field, sumDiff);
	}
	this.multiply1=function( other)
		{
			if (this.field!=other.field)
			{
				throw "GF256Polys do not have same GF256 field";
			}
			if (this.Zero || other.Zero)
			{
				return this.field.Zero;
			}
			var aCoefficients = this.coefficients;
			var aLength = aCoefficients.length;
			var bCoefficients = other.coefficients;
			var bLength = bCoefficients.length;
			var product = new Array(aLength + bLength - 1);
			for (var i = 0; i < aLength; i++)
			{
				var aCoeff = aCoefficients[i];
				for (var j = 0; j < bLength; j++)
				{
					product[i + j] = GF256.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
				}
			}
			return new GF256Poly(this.field, product);
		}
	this.multiply2=function( scalar)
		{
			if (scalar == 0)
			{
				return this.field.Zero;
			}
			if (scalar == 1)
			{
				return this;
			}
			var size = this.coefficients.length;
			var product = new Array(size);
			for (var i = 0; i < size; i++)
			{
				product[i] = this.field.multiply(this.coefficients[i], scalar);
			}
			return new GF256Poly(this.field, product);
		}
	this.multiplyByMonomial=function( degree,  coefficient)
		{
			if (degree < 0)
			{
				throw "System.ArgumentException";
			}
			if (coefficient == 0)
			{
				return this.field.Zero;
			}
			var size = this.coefficients.length;
			var product = new Array(size + degree);
			for(var i=0;i<product.length;i++)product[i]=0;
			for (var i = 0; i < size; i++)
			{
				product[i] = this.field.multiply(this.coefficients[i], coefficient);
			}
			return new GF256Poly(this.field, product);
		}
	this.divide=function( other)
		{
			if (this.field!=other.field)
			{
				throw "GF256Polys do not have same GF256 field";
			}
			if (other.Zero)
			{
				throw "Divide by 0";
			}
			
			var quotient = this.field.Zero;
			var remainder = this;
			
			var denominatorLeadingTerm = other.getCoefficient(other.Degree);
			var inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);
			
			while (remainder.Degree >= other.Degree && !remainder.Zero)
			{
				var degreeDifference = remainder.Degree - other.Degree;
				var scale = this.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm);
				var term = other.multiplyByMonomial(degreeDifference, scale);
				var iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
				quotient = quotient.addOrSubtract(iterationQuotient);
				remainder = remainder.addOrSubtract(term);
			}
			
			return new Array(quotient, remainder);
		}
}
/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function GF256( primitive)
{
	this.expTable = new Array(256);
	this.logTable = new Array(256);
	var x = 1;
	for (var i = 0; i < 256; i++)
	{
		this.expTable[i] = x;
		x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
		if (x >= 0x100)
		{
			x ^= primitive;
		}
	}
	for (var i = 0; i < 255; i++)
	{
		this.logTable[this.expTable[i]] = i;
	}
	// logTable[0] == 0 but this should never be used
	var at0=new Array(1);at0[0]=0;
	this.zero = new GF256Poly(this, new Array(at0));
	var at1=new Array(1);at1[0]=1;
	this.one = new GF256Poly(this, new Array(at1));
	
	this.__defineGetter__("Zero", function()
	{
		return this.zero;
	});
	this.__defineGetter__("One", function()
	{
		return this.one;
	});
	this.buildMonomial=function( degree,  coefficient)
		{
			if (degree < 0)
			{
				throw "System.ArgumentException";
			}
			if (coefficient == 0)
			{
				return zero;
			}
			var coefficients = new Array(degree + 1);
			for(var i=0;i<coefficients.length;i++)coefficients[i]=0;
			coefficients[0] = coefficient;
			return new GF256Poly(this, coefficients);
		}
	this.exp=function( a)
		{
			return this.expTable[a];
		}
	this.log=function( a)
		{
			if (a == 0)
			{
				throw "System.ArgumentException";
			}
			return this.logTable[a];
		}
	this.inverse=function( a)
		{
			if (a == 0)
			{
				throw "System.ArithmeticException";
			}
			return this.expTable[255 - this.logTable[a]];
		}
	this.multiply=function( a,  b)
		{
			if (a == 0 || b == 0)
			{
				return 0;
			}
			if (a == 1)
			{
				return b;
			}
			if (b == 1)
			{
				return a;
			}
			return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
		}		
}

GF256.QR_CODE_FIELD = new GF256(0x011D);
GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

GF256.addOrSubtract=function( a,  b)
{
	return a ^ b;
}
/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


Decoder = {};
Decoder.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);

Decoder.correctErrors = function(codewordBytes, numDataCodewords) {
  var numCodewords = codewordBytes.length;
  // First read into an array of ints
  var codewordsInts = new Array(numCodewords);
  for (var i = 0; i < numCodewords; i++) {
    codewordsInts[i] = codewordBytes[i] & 0xFF;
  }
  var numECCodewords = codewordBytes.length - numDataCodewords;
  try {
    Decoder.rsDecoder.decode(codewordsInts, numECCodewords);
    //var corrector = new ReedSolomon(codewordsInts, numECCodewords);
    //corrector.correct();
  } catch (rse) {
    throw rse;
  }
  // Copy back into array of bytes -- only need to worry about the bytes that were data
  // We don't care about errors in the error-correction codewords
  for (var i = 0; i < numDataCodewords; i++) {
    codewordBytes[i] = codewordsInts[i];
  }
}

Decoder.decode = function(bits) {
  var parser = new BitMatrixParser(bits);
  var version = parser.readVersion();
  var ecLevel = parser.readFormatInformation().ErrorCorrectionLevel;

  // Read codewords
  var codewords = parser.readCodewords();

  // Separate into data blocks
  var dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);

  // Count total number of data bytes
  var totalBytes = 0;
  for (var i = 0; i < dataBlocks.length; i++) {
    totalBytes += dataBlocks[i].NumDataCodewords;
  }
  var resultBytes = new Array(totalBytes);
  var resultOffset = 0;

  // Error-correct and copy data blocks together into a stream of bytes
  for (var j = 0; j < dataBlocks.length; j++) {
    var dataBlock = dataBlocks[j];
    var codewordBytes = dataBlock.Codewords;
    var numDataCodewords = dataBlock.NumDataCodewords;
    Decoder.correctErrors(codewordBytes, numDataCodewords);
    for (var i = 0; i < numDataCodewords; i++) {
      resultBytes[resultOffset++] = codewordBytes[i];
    }
  }

  // Decode the contents of that stream of bytes
  var reader = new QRCodeDataBlockReader(resultBytes, version.VersionNumber, ecLevel.Bits);
  return reader;
  //return DecodedBitStreamParser.decode(resultBytes, version, ecLevel);
}

/*
   Copyright 2011 Lazar Laszlo (lazarsoft@gmail.com, www.lazarsoft.info)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var qrcode = {};
qrcode.imagedata = null;
qrcode.width = 0;
qrcode.height = 0;
qrcode.qrCodeSymbol = null;
qrcode.debug = false;
qrcode.maxImgSize = 1024 * 1024;

qrcode.sizeOfDataLengthInfo = [
  [10, 9, 8, 8],
  [12, 11, 16, 10],
  [14, 13, 16, 12]
];


qrcode.decode = function(image) {
  qrcode.width = image.width;
  qrcode.height = image.height;
  qrcode.imagedata = image;
  qrcode.result = qrcode.process();
  return qrcode.result;
}

qrcode.process = function() {
  var image = qrcode.grayScaleToBitmap(qrcode.grayscale());
  var detector = new Detector(image);
  var qRCodeMatrix = detector.detect();
  var reader = Decoder.decode(qRCodeMatrix.bits);
  var data = reader.DataByte;
  var string = '';

  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      string += String.fromCharCode(data[i][j]);
    }
  }
  return qrcode.decode_utf8(string);
}
qrcode.decode_utf8 = function(s) {
  if (qrcode.isUrl(s))
    return qrcode.decode_url(s);
  else
    return s;
}

qrcode.decode_url = function(s) {
  var escaped = "";
  try {
    escaped = escape(s);
  } catch (e) {
    escaped = s;
  }
  var ret = "";
  try {
    ret = decodeURIComponent(escaped);
  } catch (e) {
    ret = escaped;
  }
  return ret;
}

qrcode.isUrl = function(s) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(s);
}

qrcode.getPixel = function(x, y) {
  var point;
  var p;

  if (qrcode.width < x) {
    throw "point error";
  }
  if (qrcode.height < y) {
    throw "point error";
  }
  point = (x * 4) + (y * qrcode.width * 4);
  p = (qrcode.imagedata.data[point] * 33 + qrcode.imagedata.data[point + 1] * 34 + qrcode.imagedata.data[point + 2] * 33) / 100;
  return p;
}

qrcode.binarize = function(th) {
  var ret = new Array(qrcode.width * qrcode.height);
  for (var y = 0; y < qrcode.height; y++) {
    for (var x = 0; x < qrcode.width; x++) {
      var gray = qrcode.getPixel(x, y);

      ret[x + y * qrcode.width] = gray <= th ? true : false;
    }
  }
  return ret;
}

qrcode.grayscale = function() {
  var ret = new Array(qrcode.width * qrcode.height);
  for (var y = 0; y < qrcode.height; y++) {
    for (var x = 0; x < qrcode.width; x++) {
      var gray = qrcode.getPixel(x, y);

      ret[x + y * qrcode.width] = gray;
    }
  }
  return ret;
}

qrcode.grayScaleToBitmap = function(grayScale) {
  var middle = qrcode.getMiddleBrightnessPerArea(grayScale);
  var sqrtNumArea = middle.length;
  var areaWidth = Math.floor(qrcode.width / sqrtNumArea);
  var areaHeight = Math.floor(qrcode.height / sqrtNumArea);
  var bitmap = new Array(qrcode.height * qrcode.width);

  for (var ay = 0; ay < sqrtNumArea; ay++) {
    for (var ax = 0; ax < sqrtNumArea; ax++) {
      for (var dy = 0; dy < areaHeight; dy++) {
        for (var dx = 0; dx < areaWidth; dx++) {
          bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width] = (grayScale[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width] < middle[ax][ay]) ? true : false;
        }
      }
    }
  }
  return bitmap;
}

qrcode.getMiddleBrightnessPerArea = function(image) {
  var numSqrtArea = 4;
  //obtain middle brightness((min + max) / 2) per area
  var areaWidth = Math.floor(qrcode.width / numSqrtArea);
  var areaHeight = Math.floor(qrcode.height / numSqrtArea);
  var minmax = new Array(numSqrtArea);
  for (var i = 0; i < numSqrtArea; i++) {
    minmax[i] = new Array(numSqrtArea);
    for (var i2 = 0; i2 < numSqrtArea; i2++) {
      minmax[i][i2] = new Array(0, 0);
    }
  }
  for (var ay = 0; ay < numSqrtArea; ay++) {
    for (var ax = 0; ax < numSqrtArea; ax++) {
      minmax[ax][ay][0] = 0xFF;
      for (var dy = 0; dy < areaHeight; dy++) {
        for (var dx = 0; dx < areaWidth; dx++) {
          var target = image[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width];
          if (target < minmax[ax][ay][0])
            minmax[ax][ay][0] = target;
          if (target > minmax[ax][ay][1])
            minmax[ax][ay][1] = target;
        }
      }
      //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
    }
  }
  var middle = new Array(numSqrtArea);
  for (var i3 = 0; i3 < numSqrtArea; i3++) {
    middle[i3] = new Array(numSqrtArea);
  }
  for (ay = 0; ay < numSqrtArea; ay++) {
    for (ax = 0; ax < numSqrtArea; ax++) {
      middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
      //Console.out.print(middle[ax][ay] + ",");
    }
    //Console.out.println("");
  }
  //Console.out.println("");

  return middle;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function URShift(number, bits) {
  if (number >= 0)
    return number >> bits;
  else
    return (number >> bits) + (2 << ~bits);
}

/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


var MIN_SKIP = 3;
var MAX_MODULES = 57;
var INTEGER_MATH_SHIFT = 8;
var CENTER_QUORUM = 2;

qrcode.orderBestPatterns=function(patterns)
		{
			
			function distance( pattern1,  pattern2)
			{
				xDiff = pattern1.X - pattern2.X;
				yDiff = pattern1.Y - pattern2.Y;
				return  Math.sqrt( (xDiff * xDiff + yDiff * yDiff));
			}
			
			/// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
			function crossProductZ( pointA,  pointB,  pointC)
			{
				var bX = pointB.x;
				var bY = pointB.y;
				return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
			}

			
			// Find distances between pattern centers
			var zeroOneDistance = distance(patterns[0], patterns[1]);
			var oneTwoDistance = distance(patterns[1], patterns[2]);
			var zeroTwoDistance = distance(patterns[0], patterns[2]);
			
			var pointA, pointB, pointC;
			// Assume one closest to other two is B; A and C will just be guesses at first
			if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance)
			{
				pointB = patterns[0];
				pointA = patterns[1];
				pointC = patterns[2];
			}
			else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance)
			{
				pointB = patterns[1];
				pointA = patterns[0];
				pointC = patterns[2];
			}
			else
			{
				pointB = patterns[2];
				pointA = patterns[0];
				pointC = patterns[1];
			}
			
			// Use cross product to figure out whether A and C are correct or flipped.
			// This asks whether BC x BA has a positive z component, which is the arrangement
			// we want for A, B, C. If it's negative, then we've got it flipped around and
			// should swap A and C.
			if (crossProductZ(pointA, pointB, pointC) < 0.0)
			{
				var temp = pointA;
				pointA = pointC;
				pointC = temp;
			}
			
			patterns[0] = pointA;
			patterns[1] = pointB;
			patterns[2] = pointC;
		}


function FinderPattern(posX, posY,  estimatedModuleSize)
{
	this.x=posX;
	this.y=posY;
	this.count = 1;
	this.estimatedModuleSize = estimatedModuleSize;
	
	this.__defineGetter__("EstimatedModuleSize", function()
	{
		return this.estimatedModuleSize;
	}); 
	this.__defineGetter__("Count", function()
	{
		return this.count;
	});
	this.__defineGetter__("X", function()
	{
		return this.x;
	});
	this.__defineGetter__("Y", function()
	{
		return this.y;
	});
	this.incrementCount = function()
	{
		this.count++;
	}
	this.aboutEquals=function( moduleSize,  i,  j)
		{
			if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize)
			{
				var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
				return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
			}
			return false;
		}
	
}

function FinderPatternInfo(patternCenters)
{
	this.bottomLeft = patternCenters[0];
	this.topLeft = patternCenters[1];
	this.topRight = patternCenters[2];
	this.__defineGetter__("BottomLeft", function()
	{
		return this.bottomLeft;
	}); 
	this.__defineGetter__("TopLeft", function()
	{
		return this.topLeft;
	}); 
	this.__defineGetter__("TopRight", function()
	{
		return this.topRight;
	}); 
}

function FinderPatternFinder()
{
	this.image=null;
	this.possibleCenters = [];
	this.hasSkipped = false;
	this.crossCheckStateCount = new Array(0,0,0,0,0);
	this.resultPointCallback = null;
	
	this.__defineGetter__("CrossCheckStateCount", function()
	{
		this.crossCheckStateCount[0] = 0;
		this.crossCheckStateCount[1] = 0;
		this.crossCheckStateCount[2] = 0;
		this.crossCheckStateCount[3] = 0;
		this.crossCheckStateCount[4] = 0;
		return this.crossCheckStateCount;
	}); 
	
	this.foundPatternCross=function( stateCount)
		{
			var totalModuleSize = 0;
			for (var i = 0; i < 5; i++)
			{
				var count = stateCount[i];
				if (count == 0)
				{
					return false;
				}
				totalModuleSize += count;
			}
			if (totalModuleSize < 7)
			{
				return false;
			}
			var moduleSize = Math.floor((totalModuleSize << INTEGER_MATH_SHIFT) / 7);
			var maxVariance = Math.floor(moduleSize / 2);
			// Allow less than 50% variance from 1-1-3-1-1 proportions
			return Math.abs(moduleSize - (stateCount[0] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2] << INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4] << INTEGER_MATH_SHIFT)) < maxVariance;
		}
	this.centerFromEnd=function( stateCount,  end)
		{
			return  (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
		}
	this.crossCheckVertical=function( startI,  centerJ,  maxCount,  originalStateCountTotal)
		{
			var image = this.image;
			
			var maxI = qrcode.height;
			var stateCount = this.CrossCheckStateCount;
			
			// Start counting up from center
			var i = startI;
			while (i >= 0 && image[centerJ + i*qrcode.width])
			{
				stateCount[2]++;
				i--;
			}
			if (i < 0)
			{
				return NaN;
			}
			while (i >= 0 && !image[centerJ +i*qrcode.width] && stateCount[1] <= maxCount)
			{
				stateCount[1]++;
				i--;
			}
			// If already too many modules in this state or ran off the edge:
			if (i < 0 || stateCount[1] > maxCount)
			{
				return NaN;
			}
			while (i >= 0 && image[centerJ + i*qrcode.width] && stateCount[0] <= maxCount)
			{
				stateCount[0]++;
				i--;
			}
			if (stateCount[0] > maxCount)
			{
				return NaN;
			}
			
			// Now also count down from center
			i = startI + 1;
			while (i < maxI && image[centerJ +i*qrcode.width])
			{
				stateCount[2]++;
				i++;
			}
			if (i == maxI)
			{
				return NaN;
			}
			while (i < maxI && !image[centerJ + i*qrcode.width] && stateCount[3] < maxCount)
			{
				stateCount[3]++;
				i++;
			}
			if (i == maxI || stateCount[3] >= maxCount)
			{
				return NaN;
			}
			while (i < maxI && image[centerJ + i*qrcode.width] && stateCount[4] < maxCount)
			{
				stateCount[4]++;
				i++;
			}
			if (stateCount[4] >= maxCount)
			{
				return NaN;
			}
			
			// If we found a finder-pattern-like section, but its size is more than 40% different than
			// the original, assume it's a false positive
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
			if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal)
			{
				return NaN;
			}
			
			return this.foundPatternCross(stateCount)?this.centerFromEnd(stateCount, i):NaN;
		}
	this.crossCheckHorizontal=function( startJ,  centerI,  maxCount, originalStateCountTotal)
		{
			var image = this.image;
			
			var maxJ = qrcode.width;
			var stateCount = this.CrossCheckStateCount;
			
			var j = startJ;
			while (j >= 0 && image[j+ centerI*qrcode.width])
			{
				stateCount[2]++;
				j--;
			}
			if (j < 0)
			{
				return NaN;
			}
			while (j >= 0 && !image[j+ centerI*qrcode.width] && stateCount[1] <= maxCount)
			{
				stateCount[1]++;
				j--;
			}
			if (j < 0 || stateCount[1] > maxCount)
			{
				return NaN;
			}
			while (j >= 0 && image[j+ centerI*qrcode.width] && stateCount[0] <= maxCount)
			{
				stateCount[0]++;
				j--;
			}
			if (stateCount[0] > maxCount)
			{
				return NaN;
			}
			
			j = startJ + 1;
			while (j < maxJ && image[j+ centerI*qrcode.width])
			{
				stateCount[2]++;
				j++;
			}
			if (j == maxJ)
			{
				return NaN;
			}
			while (j < maxJ && !image[j+ centerI*qrcode.width] && stateCount[3] < maxCount)
			{
				stateCount[3]++;
				j++;
			}
			if (j == maxJ || stateCount[3] >= maxCount)
			{
				return NaN;
			}
			while (j < maxJ && image[j+ centerI*qrcode.width] && stateCount[4] < maxCount)
			{
				stateCount[4]++;
				j++;
			}
			if (stateCount[4] >= maxCount)
			{
				return NaN;
			}
			
			// If we found a finder-pattern-like section, but its size is significantly different than
			// the original, assume it's a false positive
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
			if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal)
			{
				return NaN;
			}
			
			return this.foundPatternCross(stateCount)?this.centerFromEnd(stateCount, j):NaN;
		}
	this.handlePossibleCenter=function( stateCount,  i,  j)
		{
			var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
			var centerJ = this.centerFromEnd(stateCount, j); //float
			var centerI = this.crossCheckVertical(i, Math.floor( centerJ), stateCount[2], stateCountTotal); //float
			if (!isNaN(centerI))
			{
				// Re-cross check
				centerJ = this.crossCheckHorizontal(Math.floor( centerJ), Math.floor( centerI), stateCount[2], stateCountTotal);
				if (!isNaN(centerJ))
				{
					var estimatedModuleSize =   stateCountTotal / 7.0;
					var found = false;
					var max = this.possibleCenters.length;
					for (var index = 0; index < max; index++)
					{
						var center = this.possibleCenters[index];
						// Look for about the same center and module size:
						if (center.aboutEquals(estimatedModuleSize, centerI, centerJ))
						{
							center.incrementCount();
							found = true;
							break;
						}
					}
					if (!found)
					{
						var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
						this.possibleCenters.push(point);
						if (this.resultPointCallback != null)
						{
							this.resultPointCallback.foundPossibleResultPoint(point);
						}
					}
					return true;
				}
			}
			return false;
		}
		
	this.selectBestPatterns=function()
		{
			
			var startSize = this.possibleCenters.length;
			if (startSize < 3)
			{
				// Couldn't find enough finder patterns
				throw "Couldn't find enough finder patterns";
			}
			
			// Filter outlier possibilities whose module size is too different
			if (startSize > 3)
			{
				// But we can only afford to do so if we have at least 4 possibilities to choose from
				var totalModuleSize = 0.0;
                var square = 0.0;
				for (var i = 0; i < startSize; i++)
				{
					//totalModuleSize +=  this.possibleCenters[i].EstimatedModuleSize;
                    var	centerValue=this.possibleCenters[i].EstimatedModuleSize;
					totalModuleSize += centerValue;
					square += (centerValue * centerValue);
				}
				var average = totalModuleSize /  startSize;
                this.possibleCenters.sort(function(center1,center2) {
				      var dA=Math.abs(center2.EstimatedModuleSize - average);
				      var dB=Math.abs(center1.EstimatedModuleSize - average);
				      if (dA < dB) {
				    	  return (-1);
				      } else if (dA == dB) {
				    	  return 0;
				      } else {
				    	  return 1;
				      }
					});

				var stdDev = Math.sqrt(square / startSize - average * average);
				var limit = Math.max(0.2 * average, stdDev);
				for (var i = 0; i < this.possibleCenters.length && this.possibleCenters.length > 3; i++)
				{
					var pattern =  this.possibleCenters[i];
					//if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)
                    if (Math.abs(pattern.EstimatedModuleSize - average) > limit)
					{
						this.possibleCenters.remove(i);
						i--;
					}
				}
			}
			
			if (this.possibleCenters.length > 3)
			{
				// Throw away all but those first size candidate points we found.
				this.possibleCenters.sort(function(a, b){
					if (a.count > b.count){return -1;}
					if (a.count < b.count){return 1;}
					return 0;
				});
			}
			
			return new Array( this.possibleCenters[0],  this.possibleCenters[1],  this.possibleCenters[2]);
		}
		
	this.findRowSkip=function()
		{
			var max = this.possibleCenters.length;
			if (max <= 1)
			{
				return 0;
			}
			var firstConfirmedCenter = null;
			for (var i = 0; i < max; i++)
			{
				var center =  this.possibleCenters[i];
				if (center.Count >= CENTER_QUORUM)
				{
					if (firstConfirmedCenter == null)
					{
						firstConfirmedCenter = center;
					}
					else
					{
						// We have two confirmed centers
						// How far down can we skip before resuming looking for the next
						// pattern? In the worst case, only the difference between the
						// difference in the x / y coordinates of the two centers.
						// This is the case where you find top left last.
						this.hasSkipped = true;
						return Math.floor ((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
					}
				}
			}
			return 0;
		}
	
	this.haveMultiplyConfirmedCenters=function()
		{
			var confirmedCount = 0;
			var totalModuleSize = 0.0;
			var max = this.possibleCenters.length;
			for (var i = 0; i < max; i++)
			{
				var pattern =  this.possibleCenters[i];
				if (pattern.Count >= CENTER_QUORUM)
				{
					confirmedCount++;
					totalModuleSize += pattern.EstimatedModuleSize;
				}
			}
			if (confirmedCount < 3)
			{
				return false;
			}
			// OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
			// and that we need to keep looking. We detect this by asking if the estimated module sizes
			// vary too much. We arbitrarily say that when the total deviation from average exceeds
			// 5% of the total module size estimates, it's too much.
			var average = totalModuleSize / max;
			var totalDeviation = 0.0;
			for (var i = 0; i < max; i++)
			{
				pattern = this.possibleCenters[i];
				totalDeviation += Math.abs(pattern.EstimatedModuleSize - average);
			}
			return totalDeviation <= 0.05 * totalModuleSize;
		}
		
	this.findFinderPattern = function(image){
		var tryHarder = false;
		this.image=image;
		var maxI = qrcode.height;
		var maxJ = qrcode.width;
		var iSkip = Math.floor((3 * maxI) / (4 * MAX_MODULES));
		if (iSkip < MIN_SKIP || tryHarder)
		{
				iSkip = MIN_SKIP;
		}
		
		var done = false;
		var stateCount = new Array(5);
		for (var i = iSkip - 1; i < maxI && !done; i += iSkip)
		{
			// Get a row of black/white values
			stateCount[0] = 0;
			stateCount[1] = 0;
			stateCount[2] = 0;
			stateCount[3] = 0;
			stateCount[4] = 0;
			var currentState = 0;
			for (var j = 0; j < maxJ; j++)
			{
				if (image[j+i*qrcode.width] )
				{
					// Black pixel
					if ((currentState & 1) == 1)
					{
						// Counting white pixels
						currentState++;
					}
					stateCount[currentState]++;
				}
				else
				{
					// White pixel
					if ((currentState & 1) == 0)
					{
						// Counting black pixels
						if (currentState == 4)
						{
							// A winner?
							if (this.foundPatternCross(stateCount))
							{
								// Yes
								var confirmed = this.handlePossibleCenter(stateCount, i, j);
								if (confirmed)
								{
									// Start examining every other line. Checking each line turned out to be too
									// expensive and didn't improve performance.
									iSkip = 2;
									if (this.hasSkipped)
									{
										done = this.haveMultiplyConfirmedCenters();
									}
									else
									{
										var rowSkip = this.findRowSkip();
										if (rowSkip > stateCount[2])
										{
											// Skip rows between row of lower confirmed center
											// and top of presumed third confirmed center
											// but back up a bit to get a full chance of detecting
											// it, entire width of center of finder pattern
											
											// Skip by rowSkip, but back off by stateCount[2] (size of last center
											// of pattern we saw) to be conservative, and also back off by iSkip which
											// is about to be re-added
											i += rowSkip - stateCount[2] - iSkip;
											j = maxJ - 1;
										}
									}
								}
								else
								{
									// Advance to next black pixel
									do 
									{
										j++;
									}
									while (j < maxJ && !image[j + i*qrcode.width]);
									j--; // back up to that last white pixel
								}
								// Clear state to start looking again
								currentState = 0;
								stateCount[0] = 0;
								stateCount[1] = 0;
								stateCount[2] = 0;
								stateCount[3] = 0;
								stateCount[4] = 0;
							}
							else
							{
								// No, shift counts back by two
								stateCount[0] = stateCount[2];
								stateCount[1] = stateCount[3];
								stateCount[2] = stateCount[4];
								stateCount[3] = 1;
								stateCount[4] = 0;
								currentState = 3;
							}
						}
						else
						{
							stateCount[++currentState]++;
						}
					}
					else
					{
						// Counting white pixels
						stateCount[currentState]++;
					}
				}
			}
			if (this.foundPatternCross(stateCount))
			{
				var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
				if (confirmed)
				{
					iSkip = stateCount[0];
					if (this.hasSkipped)
					{
						// Found a third one
						done = haveMultiplyConfirmedCenters();
					}
				}
			}
		}
		
		var patternInfo = this.selectBestPatterns();
		qrcode.orderBestPatterns(patternInfo);
		
		return new FinderPatternInfo(patternInfo);
	};
}

function AlignmentPattern(posX, posY, estimatedModuleSize) {
    this.x = posX;
    this.y = posY;
    this.count = 1;
    this.estimatedModuleSize = estimatedModuleSize;

    this.__defineGetter__("EstimatedModuleSize", function() {
        return this.estimatedModuleSize;
    });
    this.__defineGetter__("Count", function() {
        return this.count;
    });
    this.__defineGetter__("X", function() {
        return Math.floor(this.x);
    });
    this.__defineGetter__("Y", function() {
        return Math.floor(this.y);
    });
    this.incrementCount = function() {
        this.count++;
    }
    this.aboutEquals = function(moduleSize, i, j) {
        if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
            var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
            return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
        }
        return false;
    }

}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function AlignmentPatternFinder(image, startX, startY, width, height, moduleSize, resultPointCallback) {
  this.image = image;
  this.possibleCenters = new Array();
  this.startX = startX;
  this.startY = startY;
  this.width = width;
  this.height = height;
  this.moduleSize = moduleSize;
  this.crossCheckStateCount = new Array(0, 0, 0);
  this.resultPointCallback = resultPointCallback;

  this.centerFromEnd = function(stateCount, end) {
    return (end - stateCount[2]) - stateCount[1] / 2.0;
  }
  this.foundPatternCross = function(stateCount) {
    var moduleSize = this.moduleSize;
    var maxVariance = moduleSize / 2.0;
    for (var i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }
    return true;
  }

  this.crossCheckVertical = function(startI, centerJ, maxCount, originalStateCountTotal) {
    var image = this.image;

    var maxI = qrcode.height;
    var stateCount = this.crossCheckStateCount;
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;

    // Start counting up from center
    var i = startI;
    while (i >= 0 && image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i >= 0 && !image[centerJ + i * qrcode.width] && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = startI + 1;
    while (i < maxI && image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i++;
    }
    if (i == maxI || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i < maxI && !image[centerJ + i * qrcode.width] && stateCount[2] <= maxCount) {
      stateCount[2]++;
      i++;
    }
    if (stateCount[2] > maxCount) {
      return NaN;
    }

    var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }

    return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
  }

  this.handlePossibleCenter = function(stateCount, i, j) {
    var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    var centerJ = this.centerFromEnd(stateCount, j);
    var centerI = this.crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);
    if (!isNaN(centerI)) {
      var estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
      var max = this.possibleCenters.length;
      for (var index = 0; index < max; index++) {
        var center = this.possibleCenters[index];
        // Look for about the same center and module size:
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
        }
      }
      // Hadn't found this before; save it
      var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
      this.possibleCenters.push(point);
      if (this.resultPointCallback != null) {
        this.resultPointCallback.foundPossibleResultPoint(point);
      }
    }
    return null;
  }

  this.find = function() {
    var startX = this.startX;
    var height = this.height;
    var maxJ = startX + width;
    var middleI = startY + (height >> 1);
    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    var stateCount = new Array(0, 0, 0);
    for (var iGen = 0; iGen < height; iGen++) {
      // Search from middle outwards
      var i = middleI + ((iGen & 0x01) == 0 ? ((iGen + 1) >> 1) : -((iGen + 1) >> 1));
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;
      var j = startX;
      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (j < maxJ && !image[j + qrcode.width * i]) {
        j++;
      }
      var currentState = 0;
      while (j < maxJ) {
        if (image[j + i * qrcode.width]) {
          // Black pixel
          if (currentState == 1) {
            // Counting black pixels
            stateCount[currentState]++;
          } else {
            // Counting white pixels
            if (currentState == 2) {
              // A winner?
              if (this.foundPatternCross(stateCount)) {
                // Yes
                var confirmed = this.handlePossibleCenter(stateCount, i, j);
                if (confirmed != null) {
                  return confirmed;
                }
              }
              stateCount[0] = stateCount[2];
              stateCount[1] = 1;
              stateCount[2] = 0;
              currentState = 1;
            } else {
              stateCount[++currentState]++;
            }
          }
        } else {
          // White pixel
          if (currentState == 1) {
            // Counting black pixels
            currentState++;
          }
          stateCount[currentState]++;
        }
        j++;
      }
      if (this.foundPatternCross(stateCount)) {
        var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
        if (confirmed != null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    if (!(this.possibleCenters.length == 0)) {
      return this.possibleCenters[0];
    }

    throw "Couldn't find enough alignment patterns";
  }

}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function QRCodeDataBlockReader(blocks, version, numErrorCorrectionCode) {
  this.blockPointer = 0;
  this.bitPointer = 7;
  this.dataLength = 0;
  this.blocks = blocks;
  this.numErrorCorrectionCode = numErrorCorrectionCode;
  if (version <= 9)
    this.dataLengthMode = 0;
  else if (version >= 10 && version <= 26)
    this.dataLengthMode = 1;
  else if (version >= 27 && version <= 40)
    this.dataLengthMode = 2;

  this.getNextBits = function(numBits) {
    var bits = 0;
    if (numBits < this.bitPointer + 1) {
      // next word fits into current data block
      var mask = 0;
      for (var i = 0; i < numBits; i++) {
        mask += (1 << i);
      }
      mask <<= (this.bitPointer - numBits + 1);

      bits = (this.blocks[this.blockPointer] & mask) >> (this.bitPointer - numBits + 1);
      this.bitPointer -= numBits;
      return bits;
    } else if (numBits < this.bitPointer + 1 + 8) {
      // next word crosses 2 data blocks
      var mask1 = 0;
      for (var i = 0; i < this.bitPointer + 1; i++) {
        mask1 += (1 << i);
      }
      bits = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
      this.blockPointer++;
      bits += ((this.blocks[this.blockPointer]) >> (8 - (numBits - (this.bitPointer + 1))));

      this.bitPointer = this.bitPointer - numBits % 8;
      if (this.bitPointer < 0) {
        this.bitPointer = 8 + this.bitPointer;
      }
      return bits;
    } else if (numBits < this.bitPointer + 1 + 16) {
      // next word crosses 3 data blocks
      var mask1 = 0; // mask of first block
      var mask3 = 0; // mask of 3rd block
      //bitPointer + 1 : number of bits of the 1st block
      //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
      //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block
      for (var i = 0; i < this.bitPointer + 1; i++) {
        mask1 += (1 << i);
      }
      var bitsFirstBlock = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
      this.blockPointer++;

      var bitsSecondBlock = this.blocks[this.blockPointer] << (numBits - (this.bitPointer + 1 + 8));
      this.blockPointer++;

      for (var i = 0; i < numBits - (this.bitPointer + 1 + 8); i++) {
        mask3 += (1 << i);
      }
      mask3 <<= 8 - (numBits - (this.bitPointer + 1 + 8));
      var bitsThirdBlock = (this.blocks[this.blockPointer] & mask3) >> (8 - (numBits - (this.bitPointer + 1 + 8)));

      bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
      this.bitPointer = this.bitPointer - (numBits - 8) % 8;
      if (this.bitPointer < 0) {
        this.bitPointer = 8 + this.bitPointer;
      }
      return bits;
    } else {
      return 0;
    }
  }
  this.NextMode = function() {
    if ((this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2))
      return 0;
    else
      return this.getNextBits(4);
  }
  this.getDataLength = function(modeIndicator) {
    var index = 0;
    while (true) {
      if ((modeIndicator >> index) == 1)
        break;
      index++;
    }

    return this.getNextBits(qrcode.sizeOfDataLengthInfo[this.dataLengthMode][index]);
  }
  this.getRomanAndFigureString = function(dataLength) {
    var length = dataLength;
    var intData = 0;
    var strData = "";
    var tableRomanAndFigure = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':');
    do {
      if (length > 1) {
        intData = this.getNextBits(11);
        var firstLetter = Math.floor(intData / 45);
        var secondLetter = intData % 45;
        strData += tableRomanAndFigure[firstLetter];
        strData += tableRomanAndFigure[secondLetter];
        length -= 2;
      } else if (length == 1) {
        intData = this.getNextBits(6);
        strData += tableRomanAndFigure[intData];
        length -= 1;
      }
    }
    while (length > 0);

    return strData;
  }
  this.getFigureString = function(dataLength) {
    var length = dataLength;
    var intData = 0;
    var strData = "";
    do {
      if (length >= 3) {
        intData = this.getNextBits(10);
        if (intData < 100)
          strData += "0";
        if (intData < 10)
          strData += "0";
        length -= 3;
      } else if (length == 2) {
        intData = this.getNextBits(7);
        if (intData < 10)
          strData += "0";
        length -= 2;
      } else if (length == 1) {
        intData = this.getNextBits(4);
        length -= 1;
      }
      strData += intData;
    }
    while (length > 0);

    return strData;
  }
  this.get8bitByteArray = function(dataLength) {
    var length = dataLength;
    var intData = 0;
    var output = new Array();

    do {
      intData = this.getNextBits(8);
      output.push(intData);
      length--;
    }
    while (length > 0);
    return output;
  }
  this.getKanjiString = function(dataLength) {
    var length = dataLength;
    var intData = 0;
    var unicodeString = "";
    do {
      intData = getNextBits(13);
      var lowerByte = intData % 0xC0;
      var higherByte = intData / 0xC0;

      var tempWord = (higherByte << 8) + lowerByte;
      var shiftjisWord = 0;
      if (tempWord + 0x8140 <= 0x9FFC) {
        // between 8140 - 9FFC on Shift_JIS character set
        shiftjisWord = tempWord + 0x8140;
      } else {
        // between E040 - EBBF on Shift_JIS character set
        shiftjisWord = tempWord + 0xC140;
      }

      //var tempByte = new Array(0,0);
      //tempByte[0] = (sbyte) (shiftjisWord >> 8);
      //tempByte[1] = (sbyte) (shiftjisWord & 0xFF);
      //unicodeString += new String(SystemUtils.ToCharArray(SystemUtils.ToByteArray(tempByte)));
      unicodeString += String.fromCharCode(shiftjisWord);
      length--;
    }
    while (length > 0);


    return unicodeString;
  }

  this.__defineGetter__("DataByte", function() {
    var output = new Array();
    var MODE_NUMBER = 1;
    var MODE_ROMAN_AND_NUMBER = 2;
    var MODE_8BIT_BYTE = 4;
    var MODE_KANJI = 8;
    do {
      var mode = this.NextMode();
      //canvas.println("mode: " + mode);
      if (mode == 0) {
        if (output.length > 0)
          break;
        else
          throw "Empty data block";
      }
      //if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
      //  break;
      //}
      if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI) {
        /*          canvas.println("Invalid mode: " + mode);
        mode = guessMode(mode);
        canvas.println("Guessed mode: " + mode); */
        throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
      }
      dataLength = this.getDataLength(mode);
      if (dataLength < 1)
        throw "Invalid data length: " + dataLength;
      //canvas.println("length: " + dataLength);
      switch (mode) {

        case MODE_NUMBER:
          //canvas.println("Mode: Figure");
          var temp_str = this.getFigureString(dataLength);
          var ta = new Array(temp_str.length);
          for (var j = 0; j < temp_str.length; j++)
            ta[j] = temp_str.charCodeAt(j);
          output.push(ta);
          break;

        case MODE_ROMAN_AND_NUMBER:
          //canvas.println("Mode: Roman&Figure");
          var temp_str = this.getRomanAndFigureString(dataLength);
          var ta = new Array(temp_str.length);
          for (var j = 0; j < temp_str.length; j++)
            ta[j] = temp_str.charCodeAt(j);
          output.push(ta);
          //output.Write(SystemUtils.ToByteArray(temp_sbyteArray2), 0, temp_sbyteArray2.Length);
          break;

        case MODE_8BIT_BYTE:
          //canvas.println("Mode: 8bit Byte");
          //sbyte[] temp_sbyteArray3;
          var temp_sbyteArray3 = this.get8bitByteArray(dataLength);
          output.push(temp_sbyteArray3);
          //output.Write(SystemUtils.ToByteArray(temp_sbyteArray3), 0, temp_sbyteArray3.Length);
          break;

        case MODE_KANJI:
          //canvas.println("Mode: Kanji");
          //sbyte[] temp_sbyteArray4;
          //temp_sbyteArray4 = SystemUtils.ToSByteArray(SystemUtils.ToByteArray(getKanjiString(dataLength)));
          //output.Write(SystemUtils.ToByteArray(temp_sbyteArray4), 0, temp_sbyteArray4.Length);
          var temp_str = this.getKanjiString(dataLength);
          output.push(temp_str);
          break;
      }
      //
      //canvas.println("DataLength: " + dataLength);
      //Console.out.println(dataString);
    }
    while (true);
    return output;
  });
}

(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") { module.exports = f() } else if (typeof define === "function" && define.amd) { define([], f) } else {
    var g;
    if (typeof window !== "undefined") { g = window } else if (typeof global !== "undefined") { g = global } else if (typeof self !== "undefined") { g = self } else { g = this }
    g.adapter = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = { exports: {} };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
  })({
    1: [function(require, module, exports) {
      /* eslint-env node */
      'use strict';

      // SDP helpers.
      var SDPUtils = {};

      // Generate an alphanumeric identifier for cname or mids.
      // TODO: use UUIDs instead? https://gist.github.com/jed/982883
      SDPUtils.generateIdentifier = function() {
        return Math.random().toString(36).substr(2, 10);
      };

      // The RTCP CNAME used by all peerconnections from the same JS.
      SDPUtils.localCName = SDPUtils.generateIdentifier();

      // Splits SDP into lines, dealing with both CRLF and LF.
      SDPUtils.splitLines = function(blob) {
        return blob.trim().split('\n').map(function(line) {
          return line.trim();
        });
      };
      // Splits SDP into sessionpart and mediasections. Ensures CRLF.
      SDPUtils.splitSections = function(blob) {
        var parts = blob.split('\nm=');
        return parts.map(function(part, index) {
          return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
        });
      };

      // Returns lines that start with a certain prefix.
      SDPUtils.matchPrefix = function(blob, prefix) {
        return SDPUtils.splitLines(blob).filter(function(line) {
          return line.indexOf(prefix) === 0;
        });
      };

      // Parses an ICE candidate line. Sample input:
      // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
      // rport 55996"
      SDPUtils.parseCandidate = function(line) {
        var parts;
        // Parse both variants.
        if (line.indexOf('a=candidate:') === 0) {
          parts = line.substring(12).split(' ');
        } else {
          parts = line.substring(10).split(' ');
        }

        var candidate = {
          foundation: parts[0],
          component: parts[1],
          protocol: parts[2].toLowerCase(),
          priority: parseInt(parts[3], 10),
          ip: parts[4],
          port: parseInt(parts[5], 10),
          // skip parts[6] == 'typ'
          type: parts[7]
        };

        for (var i = 8; i < parts.length; i += 2) {
          switch (parts[i]) {
            case 'raddr':
              candidate.relatedAddress = parts[i + 1];
              break;
            case 'rport':
              candidate.relatedPort = parseInt(parts[i + 1], 10);
              break;
            case 'tcptype':
              candidate.tcpType = parts[i + 1];
              break;
            default: // Unknown extensions are silently ignored.
              break;
          }
        }
        return candidate;
      };

      // Translates a candidate object into SDP candidate attribute.
      SDPUtils.writeCandidate = function(candidate) {
        var sdp = [];
        sdp.push(candidate.foundation);
        sdp.push(candidate.component);
        sdp.push(candidate.protocol.toUpperCase());
        sdp.push(candidate.priority);
        sdp.push(candidate.ip);
        sdp.push(candidate.port);

        var type = candidate.type;
        sdp.push('typ');
        sdp.push(type);
        if (type !== 'host' && candidate.relatedAddress &&
          candidate.relatedPort) {
          sdp.push('raddr');
          sdp.push(candidate.relatedAddress); // was: relAddr
          sdp.push('rport');
          sdp.push(candidate.relatedPort); // was: relPort
        }
        if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
          sdp.push('tcptype');
          sdp.push(candidate.tcpType);
        }
        return 'candidate:' + sdp.join(' ');
      };

      // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
      // a=rtpmap:111 opus/48000/2
      SDPUtils.parseRtpMap = function(line) {
        var parts = line.substr(9).split(' ');
        var parsed = {
          payloadType: parseInt(parts.shift(), 10) // was: id
        };

        parts = parts[0].split('/');

        parsed.name = parts[0];
        parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
        // was: channels
        parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
        return parsed;
      };

      // Generate an a=rtpmap line from RTCRtpCodecCapability or
      // RTCRtpCodecParameters.
      SDPUtils.writeRtpMap = function(codec) {
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
          (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
      };

      // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      SDPUtils.parseExtmap = function(line) {
        var parts = line.substr(9).split(' ');
        return {
          id: parseInt(parts[0], 10),
          uri: parts[1]
        };
      };

      // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
      // RTCRtpHeaderExtension.
      SDPUtils.writeExtmap = function(headerExtension) {
        return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
          ' ' + headerExtension.uri + '\r\n';
      };

      // Parses an ftmp line, returns dictionary. Sample input:
      // a=fmtp:96 vbr=on;cng=on
      // Also deals with vbr=on; cng=on
      SDPUtils.parseFmtp = function(line) {
        var parsed = {};
        var kv;
        var parts = line.substr(line.indexOf(' ') + 1).split(';');
        for (var j = 0; j < parts.length; j++) {
          kv = parts[j].trim().split('=');
          parsed[kv[0].trim()] = kv[1];
        }
        return parsed;
      };

      // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
      SDPUtils.writeFmtp = function(codec) {
        var line = '';
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        if (codec.parameters && Object.keys(codec.parameters).length) {
          var params = [];
          Object.keys(codec.parameters).forEach(function(param) {
            params.push(param + '=' + codec.parameters[param]);
          });
          line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
        }
        return line;
      };

      // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
      // a=rtcp-fb:98 nack rpsi
      SDPUtils.parseRtcpFb = function(line) {
        var parts = line.substr(line.indexOf(' ') + 1).split(' ');
        return {
          type: parts.shift(),
          parameter: parts.join(' ')
        };
      };
      // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
      SDPUtils.writeRtcpFb = function(codec) {
        var lines = '';
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
          // FIXME: special handling for trr-int?
          codec.rtcpFeedback.forEach(function(fb) {
            lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + ' ' + fb.parameter +
              '\r\n';
          });
        }
        return lines;
      };

      // Parses an RFC 5576 ssrc media attribute. Sample input:
      // a=ssrc:3735928559 cname:something
      SDPUtils.parseSsrcMedia = function(line) {
        var sp = line.indexOf(' ');
        var parts = {
          ssrc: parseInt(line.substr(7, sp - 7), 10)
        };
        var colon = line.indexOf(':', sp);
        if (colon > -1) {
          parts.attribute = line.substr(sp + 1, colon - sp - 1);
          parts.value = line.substr(colon + 1);
        } else {
          parts.attribute = line.substr(sp + 1);
        }
        return parts;
      };

      // Extracts DTLS parameters from SDP media section or sessionpart.
      // FIXME: for consistency with other functions this should only
      //   get the fingerprint line as input. See also getIceParameters.
      SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
        var lines = SDPUtils.splitLines(mediaSection);
        // Search in session part, too.
        lines = lines.concat(SDPUtils.splitLines(sessionpart));
        var fpLine = lines.filter(function(line) {
          return line.indexOf('a=fingerprint:') === 0;
        })[0].substr(14);
        // Note: a=setup line is ignored since we use the 'auto' role.
        var dtlsParameters = {
          role: 'auto',
          fingerprints: [{
            algorithm: fpLine.split(' ')[0],
            value: fpLine.split(' ')[1]
          }]
        };
        return dtlsParameters;
      };

      // Serializes DTLS parameters to SDP.
      SDPUtils.writeDtlsParameters = function(params, setupType) {
        var sdp = 'a=setup:' + setupType + '\r\n';
        params.fingerprints.forEach(function(fp) {
          sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
        });
        return sdp;
      };
      // Parses ICE information from SDP media section or sessionpart.
      // FIXME: for consistency with other functions this should only
      //   get the ice-ufrag and ice-pwd lines as input.
      SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
        var lines = SDPUtils.splitLines(mediaSection);
        // Search in session part, too.
        lines = lines.concat(SDPUtils.splitLines(sessionpart));
        var iceParameters = {
          usernameFragment: lines.filter(function(line) {
            return line.indexOf('a=ice-ufrag:') === 0;
          })[0].substr(12),
          password: lines.filter(function(line) {
            return line.indexOf('a=ice-pwd:') === 0;
          })[0].substr(10)
        };
        return iceParameters;
      };

      // Serializes ICE parameters to SDP.
      SDPUtils.writeIceParameters = function(params) {
        return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
          'a=ice-pwd:' + params.password + '\r\n';
      };

      // Parses the SDP media section and returns RTCRtpParameters.
      SDPUtils.parseRtpParameters = function(mediaSection) {
        var description = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        };
        var lines = SDPUtils.splitLines(mediaSection);
        var mline = lines[0].split(' ');
        for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
          var pt = mline[i];
          var rtpmapline = SDPUtils.matchPrefix(
            mediaSection, 'a=rtpmap:' + pt + ' ')[0];
          if (rtpmapline) {
            var codec = SDPUtils.parseRtpMap(rtpmapline);
            var fmtps = SDPUtils.matchPrefix(
              mediaSection, 'a=fmtp:' + pt + ' ');
            // Only the first a=fmtp:<pt> is considered.
            codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
            codec.rtcpFeedback = SDPUtils.matchPrefix(
                mediaSection, 'a=rtcp-fb:' + pt + ' ')
              .map(SDPUtils.parseRtcpFb);
            description.codecs.push(codec);
            // parse FEC mechanisms from rtpmap lines.
            switch (codec.name.toUpperCase()) {
              case 'RED':
              case 'ULPFEC':
                description.fecMechanisms.push(codec.name.toUpperCase());
                break;
              default: // only RED and ULPFEC are recognized as FEC mechanisms.
                break;
            }
          }
        }
        SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
          description.headerExtensions.push(SDPUtils.parseExtmap(line));
        });
        // FIXME: parse rtcp.
        return description;
      };

      // Generates parts of the SDP media section describing the capabilities /
      // parameters.
      SDPUtils.writeRtpDescription = function(kind, caps) {
        var sdp = '';

        // Build the mline.
        sdp += 'm=' + kind + ' ';
        sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
        sdp += ' UDP/TLS/RTP/SAVPF ';
        sdp += caps.codecs.map(function(codec) {
          if (codec.preferredPayloadType !== undefined) {
            return codec.preferredPayloadType;
          }
          return codec.payloadType;
        }).join(' ') + '\r\n';

        sdp += 'c=IN IP4 0.0.0.0\r\n';
        sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

        // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
        caps.codecs.forEach(function(codec) {
          sdp += SDPUtils.writeRtpMap(codec);
          sdp += SDPUtils.writeFmtp(codec);
          sdp += SDPUtils.writeRtcpFb(codec);
        });
        // FIXME: add headerExtensions, fecMechanismş and rtcp.
        sdp += 'a=rtcp-mux\r\n';
        return sdp;
      };

      // Parses the SDP media section and returns an array of
      // RTCRtpEncodingParameters.
      SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
        var encodingParameters = [];
        var description = SDPUtils.parseRtpParameters(mediaSection);
        var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
        var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

        // filter a=ssrc:... cname:, ignore PlanB-msid
        var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
          .map(function(line) {
            return SDPUtils.parseSsrcMedia(line);
          })
          .filter(function(parts) {
            return parts.attribute === 'cname';
          });
        var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
        var secondarySsrc;

        var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
          .map(function(line) {
            var parts = line.split(' ');
            parts.shift();
            return parts.map(function(part) {
              return parseInt(part, 10);
            });
          });
        if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
          secondarySsrc = flows[0][1];
        }

        description.codecs.forEach(function(codec) {
          if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
            var encParam = {
              ssrc: primarySsrc,
              codecPayloadType: parseInt(codec.parameters.apt, 10),
              rtx: {
                payloadType: codec.payloadType,
                ssrc: secondarySsrc
              }
            };
            encodingParameters.push(encParam);
            if (hasRed) {
              encParam = JSON.parse(JSON.stringify(encParam));
              encParam.fec = {
                ssrc: secondarySsrc,
                mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
              };
              encodingParameters.push(encParam);
            }
          }
        });
        if (encodingParameters.length === 0 && primarySsrc) {
          encodingParameters.push({
            ssrc: primarySsrc
          });
        }

        // we support both b=AS and b=TIAS but interpret AS as TIAS.
        var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
        if (bandwidth.length) {
          if (bandwidth[0].indexOf('b=TIAS:') === 0) {
            bandwidth = parseInt(bandwidth[0].substr(7), 10);
          } else if (bandwidth[0].indexOf('b=AS:') === 0) {
            bandwidth = parseInt(bandwidth[0].substr(5), 10);
          }
          encodingParameters.forEach(function(params) {
            params.maxBitrate = bandwidth;
          });
        }
        return encodingParameters;
      };

      SDPUtils.writeSessionBoilerplate = function() {
        // FIXME: sess-id should be an NTP timestamp.
        return 'v=0\r\n' +
          'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
          's=-\r\n' +
          't=0 0\r\n';
      };

      SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
        var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

        // Map ICE parameters (ufrag, pwd) to SDP.
        sdp += SDPUtils.writeIceParameters(
          transceiver.iceGatherer.getLocalParameters());

        // Map DTLS parameters to SDP.
        sdp += SDPUtils.writeDtlsParameters(
          transceiver.dtlsTransport.getLocalParameters(),
          type === 'offer' ? 'actpass' : 'active');

        sdp += 'a=mid:' + transceiver.mid + '\r\n';

        if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += 'a=sendrecv\r\n';
        } else if (transceiver.rtpSender) {
          sdp += 'a=sendonly\r\n';
        } else if (transceiver.rtpReceiver) {
          sdp += 'a=recvonly\r\n';
        } else {
          sdp += 'a=inactive\r\n';
        }

        // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
        if (transceiver.rtpSender) {
          var msid = 'msid:' + stream.id + ' ' +
            transceiver.rtpSender.track.id + '\r\n';
          sdp += 'a=' + msid;
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
            ' ' + msid;
        }
        // FIXME: this should be written by writeRtpDescription.
        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
          ' cname:' + SDPUtils.localCName + '\r\n';
        return sdp;
      };

      // Gets the direction from the mediaSection or the sessionpart.
      SDPUtils.getDirection = function(mediaSection, sessionpart) {
        // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
        var lines = SDPUtils.splitLines(mediaSection);
        for (var i = 0; i < lines.length; i++) {
          switch (lines[i]) {
            case 'a=sendrecv':
            case 'a=sendonly':
            case 'a=recvonly':
            case 'a=inactive':
              return lines[i].substr(2);
            default:
              // FIXME: What should happen here?
          }
        }
        if (sessionpart) {
          return SDPUtils.getDirection(sessionpart);
        }
        return 'sendrecv';
      };

      // Expose public methods.
      module.exports = SDPUtils;

    }, {}],
    2: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */

      'use strict';

      // Shimming starts here.
      (function() {
        // Utils.
        var logging = require('./utils').log;
        var browserDetails = require('./utils').browserDetails;
        // Export to the adapter global object visible in the browser.
        module.exports.browserDetails = browserDetails;
        module.exports.extractVersion = require('./utils').extractVersion;
        module.exports.disableLog = require('./utils').disableLog;

        // Uncomment the line below if you want logging to occur, including logging
        // for the switch statement below. Can also be turned on in the browser via
        // adapter.disableLog(false), but then logging from the switch statement below
        // will not appear.
        // require('./utils').disableLog(false);

        // Browser shims.
        var chromeShim = require('./chrome/chrome_shim') || null;
        var edgeShim = require('./edge/edge_shim') || null;
        var firefoxShim = require('./firefox/firefox_shim') || null;
        var safariShim = require('./safari/safari_shim') || null;

        // Shim browser if found.
        switch (browserDetails.browser) {
          case 'opera': // fallthrough as it uses chrome shims
          case 'chrome':
            if (!chromeShim || !chromeShim.shimPeerConnection) {
              logging('Chrome shim is not included in this adapter release.');
              return;
            }
            logging('adapter.js shimming chrome.');
            // Export to the adapter global object visible in the browser.
            module.exports.browserShim = chromeShim;

            chromeShim.shimGetUserMedia();
            chromeShim.shimMediaStream();
            chromeShim.shimSourceObject();
            chromeShim.shimPeerConnection();
            chromeShim.shimOnTrack();
            break;
          case 'firefox':
            if (!firefoxShim || !firefoxShim.shimPeerConnection) {
              logging('Firefox shim is not included in this adapter release.');
              return;
            }
            logging('adapter.js shimming firefox.');
            // Export to the adapter global object visible in the browser.
            module.exports.browserShim = firefoxShim;

            firefoxShim.shimGetUserMedia();
            firefoxShim.shimSourceObject();
            firefoxShim.shimPeerConnection();
            firefoxShim.shimOnTrack();
            break;
          case 'edge':
            if (!edgeShim || !edgeShim.shimPeerConnection) {
              logging('MS edge shim is not included in this adapter release.');
              return;
            }
            logging('adapter.js shimming edge.');
            // Export to the adapter global object visible in the browser.
            module.exports.browserShim = edgeShim;

            edgeShim.shimGetUserMedia();
            edgeShim.shimPeerConnection();
            break;
          case 'safari':
            if (!safariShim) {
              logging('Safari shim is not included in this adapter release.');
              return;
            }
            logging('adapter.js shimming safari.');
            // Export to the adapter global object visible in the browser.
            module.exports.browserShim = safariShim;

            safariShim.shimGetUserMedia();
            break;
          default:
            logging('Unsupported browser!');
        }
      })();

    }, { "./chrome/chrome_shim": 3, "./edge/edge_shim": 5, "./firefox/firefox_shim": 7, "./safari/safari_shim": 9, "./utils": 10 }],
    3: [function(require, module, exports) {

      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';
      var logging = require('../utils.js').log;
      var browserDetails = require('../utils.js').browserDetails;

      var chromeShim = {
        shimMediaStream: function() {
          window.MediaStream = window.MediaStream || window.webkitMediaStream;
        },

        shimOnTrack: function() {
          if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
              window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
              get: function() {
                return this._ontrack;
              },
              set: function(f) {
                var self = this;
                if (this._ontrack) {
                  this.removeEventListener('track', this._ontrack);
                  this.removeEventListener('addstream', this._ontrackpoly);
                }
                this.addEventListener('track', this._ontrack = f);
                this.addEventListener('addstream', this._ontrackpoly = function(e) {
                  // onaddstream does not fire when a track is added to an existing
                  // stream. But stream.onaddtrack is implemented so we use that.
                  e.stream.addEventListener('addtrack', function(te) {
                    var event = new Event('track');
                    event.track = te.track;
                    event.receiver = { track: te.track };
                    event.streams = [e.stream];
                    self.dispatchEvent(event);
                  });
                  e.stream.getTracks().forEach(function(track) {
                    var event = new Event('track');
                    event.track = track;
                    event.receiver = { track: track };
                    event.streams = [e.stream];
                    this.dispatchEvent(event);
                  }.bind(this));
                }.bind(this));
              }
            });
          }
        },

        shimSourceObject: function() {
          if (typeof window === 'object') {
            if (window.HTMLMediaElement &&
              !('srcObject' in window.HTMLMediaElement.prototype)) {
              // Shim the srcObject property, once, when HTMLMediaElement is found.
              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                get: function() {
                  return this._srcObject;
                },
                set: function(stream) {
                  var self = this;
                  // Use _srcObject as a private property for this shim
                  this._srcObject = stream;
                  if (this.src) {
                    URL.revokeObjectURL(this.src);
                  }

                  if (!stream) {
                    this.src = '';
                    return;
                  }
                  this.src = URL.createObjectURL(stream);
                  // We need to recreate the blob url when a track is added or
                  // removed. Doing it manually since we want to avoid a recursion.
                  stream.addEventListener('addtrack', function() {
                    if (self.src) {
                      URL.revokeObjectURL(self.src);
                    }
                    self.src = URL.createObjectURL(stream);
                  });
                  stream.addEventListener('removetrack', function() {
                    if (self.src) {
                      URL.revokeObjectURL(self.src);
                    }
                    self.src = URL.createObjectURL(stream);
                  });
                }
              });
            }
          }
        },

        shimPeerConnection: function() {
          // The RTCPeerConnection object.
          window.RTCPeerConnection = function(pcConfig, pcConstraints) {
            // Translate iceTransportPolicy to iceTransports,
            // see https://code.google.com/p/webrtc/issues/detail?id=4869
            logging('PeerConnection');
            if (pcConfig && pcConfig.iceTransportPolicy) {
              pcConfig.iceTransports = pcConfig.iceTransportPolicy;
            }

            var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
            var origGetStats = pc.getStats.bind(pc);
            pc.getStats = function(selector, successCallback, errorCallback) {
              var self = this;
              var args = arguments;

              // If selector is a function then we are in the old style stats so just
              // pass back the original getStats format to avoid breaking old users.
              if (arguments.length > 0 && typeof selector === 'function') {
                return origGetStats(selector, successCallback);
              }

              var fixChromeStats_ = function(response) {
                var standardReport = {};
                var reports = response.result();
                reports.forEach(function(report) {
                  var standardStats = {
                    id: report.id,
                    timestamp: report.timestamp,
                    type: report.type
                  };
                  report.names().forEach(function(name) {
                    standardStats[name] = report.stat(name);
                  });
                  standardReport[standardStats.id] = standardStats;
                });

                return standardReport;
              };

              // shim getStats with maplike support
              var makeMapStats = function(stats, legacyStats) {
                var map = new Map(Object.keys(stats).map(function(key) {
                  return [key, stats[key]];
                }));
                legacyStats = legacyStats || stats;
                Object.keys(legacyStats).forEach(function(key) {
                  map[key] = legacyStats[key];
                });
                return map;
              };

              if (arguments.length >= 2) {
                var successCallbackWrapper_ = function(response) {
                  args[1](makeMapStats(fixChromeStats_(response)));
                };

                return origGetStats.apply(this, [successCallbackWrapper_,
                  arguments[0]
                ]);
              }

              // promise-support
              return new Promise(function(resolve, reject) {
                if (args.length === 1 && typeof selector === 'object') {
                  origGetStats.apply(self, [
                    function(response) {
                      resolve(makeMapStats(fixChromeStats_(response)));
                    },
                    reject
                  ]);
                } else {
                  // Preserve legacy chrome stats only on legacy access of stats obj
                  origGetStats.apply(self, [
                    function(response) {
                      resolve(makeMapStats(fixChromeStats_(response),
                        response.result()));
                    },
                    reject
                  ]);
                }
              }).then(successCallback, errorCallback);
            };

            return pc;
          };
          window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

          // wrap static methods. Currently just generateCertificate.
          if (webkitRTCPeerConnection.generateCertificate) {
            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
              get: function() {
                return webkitRTCPeerConnection.generateCertificate;
              }
            });
          }

          // add promise support -- natively available in Chrome 51
          if (browserDetails.version < 51) {
            ['createOffer', 'createAnswer'].forEach(function(method) {
              var nativeMethod = webkitRTCPeerConnection.prototype[method];
              webkitRTCPeerConnection.prototype[method] = function() {
                var self = this;
                if (arguments.length < 1 || (arguments.length === 1 &&
                    typeof arguments[0] === 'object')) {
                  var opts = arguments.length === 1 ? arguments[0] : undefined;
                  return new Promise(function(resolve, reject) {
                    nativeMethod.apply(self, [resolve, reject, opts]);
                  });
                }
                return nativeMethod.apply(this, arguments);
              };
            });

            ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
            .forEach(function(method) {
              var nativeMethod = webkitRTCPeerConnection.prototype[method];
              webkitRTCPeerConnection.prototype[method] = function() {
                var args = arguments;
                var self = this;
                var promise = new Promise(function(resolve, reject) {
                  nativeMethod.apply(self, [args[0], resolve, reject]);
                });
                if (args.length < 2) {
                  return promise;
                }
                return promise.then(function() {
                    args[1].apply(null, []);
                  },
                  function(err) {
                    if (args.length >= 3) {
                      args[2].apply(null, [err]);
                    }
                  });
              };
            });
          }

          // support for addIceCandidate(null)
          var nativeAddIceCandidate =
            RTCPeerConnection.prototype.addIceCandidate;
          RTCPeerConnection.prototype.addIceCandidate = function() {
            return arguments[0] === null ? Promise.resolve() : nativeAddIceCandidate.apply(this, arguments);
          };

          // shim implicit creation of RTCSessionDescription/RTCIceCandidate
          ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = webkitRTCPeerConnection.prototype[method];
            webkitRTCPeerConnection.prototype[method] = function() {
              arguments[0] = new((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });
        },

        // Attach a media stream to an element.
        attachMediaStream: function(element, stream) {
          logging('DEPRECATED, attachMediaStream will soon be removed.');
          if (browserDetails.version >= 43) {
            element.srcObject = stream;
          } else if (typeof element.src !== 'undefined') {
            element.src = URL.createObjectURL(stream);
          } else {
            logging('Error attaching stream to element.');
          }
        },

        reattachMediaStream: function(to, from) {
          logging('DEPRECATED, reattachMediaStream will soon be removed.');
          if (browserDetails.version >= 43) {
            to.srcObject = from.srcObject;
          } else {
            to.src = from.src;
          }
        }
      };


      // Expose public methods.
      module.exports = {
        shimMediaStream: chromeShim.shimMediaStream,
        shimOnTrack: chromeShim.shimOnTrack,
        shimSourceObject: chromeShim.shimSourceObject,
        shimPeerConnection: chromeShim.shimPeerConnection,
        shimGetUserMedia: require('./getusermedia'),
        attachMediaStream: chromeShim.attachMediaStream,
        reattachMediaStream: chromeShim.reattachMediaStream
      };

    }, { "../utils.js": 10, "./getusermedia": 4 }],
    4: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';
      var logging = require('../utils.js').log;

      // Expose public methods.
      module.exports = function() {
        var constraintsToChrome_ = function(c) {
          if (typeof c !== 'object' || c.mandatory || c.optional) {
            return c;
          }
          var cc = {};
          Object.keys(c).forEach(function(key) {
            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
              return;
            }
            var r = (typeof c[key] === 'object') ? c[key] : { ideal: c[key] };
            if (r.exact !== undefined && typeof r.exact === 'number') {
              r.min = r.max = r.exact;
            }
            var oldname_ = function(prefix, name) {
              if (prefix) {
                return prefix + name.charAt(0).toUpperCase() + name.slice(1);
              }
              return (name === 'deviceId') ? 'sourceId' : name;
            };
            if (r.ideal !== undefined) {
              cc.optional = cc.optional || [];
              var oc = {};
              if (typeof r.ideal === 'number') {
                oc[oldname_('min', key)] = r.ideal;
                cc.optional.push(oc);
                oc = {};
                oc[oldname_('max', key)] = r.ideal;
                cc.optional.push(oc);
              } else {
                oc[oldname_('', key)] = r.ideal;
                cc.optional.push(oc);
              }
            }
            if (r.exact !== undefined && typeof r.exact !== 'number') {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname_('', key)] = r.exact;
            } else {
              ['min', 'max'].forEach(function(mix) {
                if (r[mix] !== undefined) {
                  cc.mandatory = cc.mandatory || {};
                  cc.mandatory[oldname_(mix, key)] = r[mix];
                }
              });
            }
          });
          if (c.advanced) {
            cc.optional = (cc.optional || []).concat(c.advanced);
          }
          return cc;
        };

        var shimConstraints_ = function(constraints, func) {
          constraints = JSON.parse(JSON.stringify(constraints));
          if (constraints && constraints.audio) {
            constraints.audio = constraintsToChrome_(constraints.audio);
          }
          if (constraints && typeof constraints.video === 'object') {
            // Shim facingMode for mobile, where it defaults to "user".
            var face = constraints.video.facingMode;
            face = face && ((typeof face === 'object') ? face : { ideal: face });

            if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                face.ideal === 'user' || face.ideal === 'environment')) &&
              !(navigator.mediaDevices.getSupportedConstraints &&
                navigator.mediaDevices.getSupportedConstraints().facingMode)) {
              delete constraints.video.facingMode;
              if (face.exact === 'environment' || face.ideal === 'environment') {
                // Look for "back" in label, or use last cam (typically back cam).
                return navigator.mediaDevices.enumerateDevices()
                  .then(function(devices) {
                    devices = devices.filter(function(d) {
                      return d.kind === 'videoinput';
                    });
                    var back = devices.find(function(d) {
                      return d.label.toLowerCase().indexOf('back') !== -1;
                    }) || (devices.length && devices[devices.length - 1]);
                    if (back) {
                      constraints.video.deviceId = face.exact ? { exact: back.deviceId } : { ideal: back.deviceId };
                    }
                    constraints.video = constraintsToChrome_(constraints.video);
                    logging('chrome: ' + JSON.stringify(constraints));
                    return func(constraints);
                  });
              }
            }
            constraints.video = constraintsToChrome_(constraints.video);
          }
          logging('chrome: ' + JSON.stringify(constraints));
          return func(constraints);
        };

        var shimError_ = function(e) {
          return {
            name: {
              PermissionDeniedError: 'NotAllowedError',
              ConstraintNotSatisfiedError: 'OverconstrainedError'
            }[e.name] || e.name,
            message: e.message,
            constraint: e.constraintName,
            toString: function() {
              return this.name + (this.message && ': ') + this.message;
            }
          };
        };

        var getUserMedia_ = function(constraints, onSuccess, onError) {
          shimConstraints_(constraints, function(c) {
            navigator.webkitGetUserMedia(c, onSuccess, function(e) {
              onError(shimError_(e));
            });
          });
        };

        navigator.getUserMedia = getUserMedia_;

        // Returns the result of getUserMedia as a Promise.
        var getUserMediaPromise_ = function(constraints) {
          return new Promise(function(resolve, reject) {
            navigator.getUserMedia(constraints, resolve, reject);
          });
        };

        if (!navigator.mediaDevices) {
          navigator.mediaDevices = {
            getUserMedia: getUserMediaPromise_,
            enumerateDevices: function() {
              return new Promise(function(resolve) {
                var kinds = { audio: 'audioinput', video: 'videoinput' };
                return MediaStreamTrack.getSources(function(devices) {
                  resolve(devices.map(function(device) {
                    return {
                      label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''
                    };
                  }));
                });
              });
            }
          };
        }

        // A shim for getUserMedia method on the mediaDevices object.
        // TODO(KaptenJansson) remove once implemented in Chrome stable.
        if (!navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia = function(constraints) {
            return getUserMediaPromise_(constraints);
          };
        } else {
          // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
          // function which returns a Promise, it does not accept spec-style
          // constraints.
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.
          bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function(cs) {
            return shimConstraints_(cs, function(c) {
              return origGetUserMedia(c).catch(function(e) {
                return Promise.reject(shimError_(e));
              });
            });
          };
        }

        // Dummy devicechange event methods.
        // TODO(KaptenJansson) remove once implemented in Chrome stable.
        if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
          navigator.mediaDevices.addEventListener = function() {
            logging('Dummy mediaDevices.addEventListener called.');
          };
        }
        if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
          navigator.mediaDevices.removeEventListener = function() {
            logging('Dummy mediaDevices.removeEventListener called.');
          };
        }
      };

    }, { "../utils.js": 10 }],
    5: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var SDPUtils = require('sdp');
      var logging = require('../utils').log;

      var edgeShim = {
        shimPeerConnection: function() {
          if (window.RTCIceGatherer) {
            // ORTC defines an RTCIceCandidate object but no constructor.
            // Not implemented in Edge.
            if (!window.RTCIceCandidate) {
              window.RTCIceCandidate = function(args) {
                return args;
              };
            }
            // ORTC does not have a session description object but
            // other browsers (i.e. Chrome) that will support both PC and ORTC
            // in the future might have this defined already.
            if (!window.RTCSessionDescription) {
              window.RTCSessionDescription = function(args) {
                return args;
              };
            }
          }

          window.RTCPeerConnection = function(config) {
            var self = this;

            var _eventTarget = document.createDocumentFragment();
            ['addEventListener', 'removeEventListener', 'dispatchEvent']
            .forEach(function(method) {
              self[method] = _eventTarget[method].bind(_eventTarget);
            });

            this.onicecandidate = null;
            this.onaddstream = null;
            this.ontrack = null;
            this.onremovestream = null;
            this.onsignalingstatechange = null;
            this.oniceconnectionstatechange = null;
            this.onnegotiationneeded = null;
            this.ondatachannel = null;

            this.localStreams = [];
            this.remoteStreams = [];
            this.getLocalStreams = function() {
              return self.localStreams;
            };
            this.getRemoteStreams = function() {
              return self.remoteStreams;
            };

            this.localDescription = new RTCSessionDescription({
              type: '',
              sdp: ''
            });
            this.remoteDescription = new RTCSessionDescription({
              type: '',
              sdp: ''
            });
            this.signalingState = 'stable';
            this.iceConnectionState = 'new';
            this.iceGatheringState = 'new';

            this.iceOptions = {
              gatherPolicy: 'all',
              iceServers: []
            };
            if (config && config.iceTransportPolicy) {
              switch (config.iceTransportPolicy) {
                case 'all':
                case 'relay':
                  this.iceOptions.gatherPolicy = config.iceTransportPolicy;
                  break;
                case 'none':
                  // FIXME: remove once implementation and spec have added this.
                  throw new TypeError('iceTransportPolicy "none" not supported');
                default:
                  // don't set iceTransportPolicy.
                  break;
              }
            }
            if (config && config.iceServers) {
              // Edge does not like
              // 1) stun:
              // 2) turn: that does not have all of turn:host:port?transport=udp
              this.iceOptions.iceServers = config.iceServers.filter(function(server) {
                if (server && server.urls) {
                  server.urls = server.urls.filter(function(url) {
                    return url.indexOf('turn:') === 0 &&
                      url.indexOf('transport=udp') !== -1;
                  })[0];
                  return !!server.urls;
                }
                return false;
              });
            }

            // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
            // everything that is needed to describe a SDP m-line.
            this.transceivers = [];

            // since the iceGatherer is currently created in createOffer but we
            // must not emit candidates until after setLocalDescription we buffer
            // them in this array.
            this._localIceCandidatesBuffer = [];
          };

          window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
            var self = this;
            var sections = SDPUtils.splitSections(self.localDescription.sdp);
            // FIXME: need to apply ice candidates in a way which is async but
            // in-order
            this._localIceCandidatesBuffer.forEach(function(event) {
              var end = !event.candidate || Object.keys(event.candidate).length === 0;
              if (end) {
                for (var j = 1; j < sections.length; j++) {
                  if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
                    sections[j] += 'a=end-of-candidates\r\n';
                  }
                }
              } else if (event.candidate.candidate.indexOf('typ endOfCandidates') === -1) {
                sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=' + event.candidate.candidate + '\r\n';
              }
              self.localDescription.sdp = sections.join('');
              self.dispatchEvent(event);
              if (self.onicecandidate !== null) {
                self.onicecandidate(event);
              }
              if (!event.candidate && self.iceGatheringState !== 'complete') {
                var complete = self.transceivers.every(function(transceiver) {
                  return transceiver.iceGatherer &&
                    transceiver.iceGatherer.state === 'completed';
                });
                if (complete) {
                  self.iceGatheringState = 'complete';
                }
              }
            });
            this._localIceCandidatesBuffer = [];
          };

          window.RTCPeerConnection.prototype.addStream = function(stream) {
            // Clone is necessary for local demos mostly, attaching directly
            // to two different senders does not work (build 10547).
            this.localStreams.push(stream.clone());
            this._maybeFireNegotiationNeeded();
          };

          window.RTCPeerConnection.prototype.removeStream = function(stream) {
            var idx = this.localStreams.indexOf(stream);
            if (idx > -1) {
              this.localStreams.splice(idx, 1);
              this._maybeFireNegotiationNeeded();
            }
          };

          window.RTCPeerConnection.prototype.getSenders = function() {
            return this.transceivers.filter(function(transceiver) {
                return !!transceiver.rtpSender;
              })
              .map(function(transceiver) {
                return transceiver.rtpSender;
              });
          };

          window.RTCPeerConnection.prototype.getReceivers = function() {
            return this.transceivers.filter(function(transceiver) {
                return !!transceiver.rtpReceiver;
              })
              .map(function(transceiver) {
                return transceiver.rtpReceiver;
              });
          };

          // Determines the intersection of local and remote capabilities.
          window.RTCPeerConnection.prototype._getCommonCapabilities =
            function(localCapabilities, remoteCapabilities) {
              var commonCapabilities = {
                codecs: [],
                headerExtensions: [],
                fecMechanisms: []
              };
              localCapabilities.codecs.forEach(function(lCodec) {
                for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
                  var rCodec = remoteCapabilities.codecs[i];
                  if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                    lCodec.clockRate === rCodec.clockRate &&
                    lCodec.numChannels === rCodec.numChannels) {
                    // push rCodec so we reply with offerer payload type
                    commonCapabilities.codecs.push(rCodec);

                    // FIXME: also need to determine intersection between
                    // .rtcpFeedback and .parameters
                    break;
                  }
                }
              });

              localCapabilities.headerExtensions
                .forEach(function(lHeaderExtension) {
                  for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
                    var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                    if (lHeaderExtension.uri === rHeaderExtension.uri) {
                      commonCapabilities.headerExtensions.push(rHeaderExtension);
                      break;
                    }
                  }
                });

              // FIXME: fecMechanisms
              return commonCapabilities;
            };

          // Create ICE gatherer, ICE transport and DTLS transport.
          window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
            function(mid, sdpMLineIndex) {
              var self = this;
              var iceGatherer = new RTCIceGatherer(self.iceOptions);
              var iceTransport = new RTCIceTransport(iceGatherer);
              iceGatherer.onlocalcandidate = function(evt) {
                var event = new Event('icecandidate');
                event.candidate = { sdpMid: mid, sdpMLineIndex: sdpMLineIndex };

                var cand = evt.candidate;
                var end = !cand || Object.keys(cand).length === 0;
                // Edge emits an empty object for RTCIceCandidateComplete‥
                if (end) {
                  // polyfill since RTCIceGatherer.state is not implemented in
                  // Edge 10547 yet.
                  if (iceGatherer.state === undefined) {
                    iceGatherer.state = 'completed';
                  }

                  // Emit a candidate with type endOfCandidates to make the samples
                  // work. Edge requires addIceCandidate with this empty candidate
                  // to start checking. The real solution is to signal
                  // end-of-candidates to the other side when getting the null
                  // candidate but some apps (like the samples) don't do that.
                  event.candidate.candidate =
                    'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
                } else {
                  // RTCIceCandidate doesn't have a component, needs to be added
                  cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
                  event.candidate.candidate = SDPUtils.writeCandidate(cand);
                }

                var complete = self.transceivers.every(function(transceiver) {
                  return transceiver.iceGatherer &&
                    transceiver.iceGatherer.state === 'completed';
                });

                // Emit candidate if localDescription is set.
                // Also emits null candidate when all gatherers are complete.
                switch (self.iceGatheringState) {
                  case 'new':
                    self._localIceCandidatesBuffer.push(event);
                    if (end && complete) {
                      self._localIceCandidatesBuffer.push(
                        new Event('icecandidate'));
                    }
                    break;
                  case 'gathering':
                    self._emitBufferedCandidates();
                    self.dispatchEvent(event);
                    if (self.onicecandidate !== null) {
                      self.onicecandidate(event);
                    }
                    if (complete) {
                      self.dispatchEvent(new Event('icecandidate'));
                      if (self.onicecandidate !== null) {
                        self.onicecandidate(new Event('icecandidate'));
                      }
                      self.iceGatheringState = 'complete';
                    }
                    break;
                  case 'complete':
                    // should not happen... currently!
                    break;
                  default: // no-op.
                    break;
                }
              };
              iceTransport.onicestatechange = function() {
                self._updateConnectionState();
              };

              var dtlsTransport = new RTCDtlsTransport(iceTransport);
              dtlsTransport.ondtlsstatechange = function() {
                self._updateConnectionState();
              };
              dtlsTransport.onerror = function() {
                // onerror does not set state to failed by itself.
                dtlsTransport.state = 'failed';
                self._updateConnectionState();
              };

              return {
                iceGatherer: iceGatherer,
                iceTransport: iceTransport,
                dtlsTransport: dtlsTransport
              };
            };

          // Start the RTP Sender and Receiver for a transceiver.
          window.RTCPeerConnection.prototype._transceive = function(transceiver,
            send, recv) {
            var params = this._getCommonCapabilities(transceiver.localCapabilities,
              transceiver.remoteCapabilities);
            if (send && transceiver.rtpSender) {
              params.encodings = transceiver.sendEncodingParameters;
              params.rtcp = {
                cname: SDPUtils.localCName
              };
              if (transceiver.recvEncodingParameters.length) {
                params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
              }
              transceiver.rtpSender.send(params);
            }
            if (recv && transceiver.rtpReceiver) {
              params.encodings = transceiver.recvEncodingParameters;
              params.rtcp = {
                cname: transceiver.cname
              };
              if (transceiver.sendEncodingParameters.length) {
                params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
              }
              transceiver.rtpReceiver.receive(params);
            }
          };

          window.RTCPeerConnection.prototype.setLocalDescription =
            function(description) {
              var self = this;
              var sections;
              var sessionpart;
              if (description.type === 'offer') {
                // FIXME: What was the purpose of this empty if statement?
                // if (!this._pendingOffer) {
                // } else {
                if (this._pendingOffer) {
                  // VERY limited support for SDP munging. Limited to:
                  // * changing the order of codecs
                  sections = SDPUtils.splitSections(description.sdp);
                  sessionpart = sections.shift();
                  sections.forEach(function(mediaSection, sdpMLineIndex) {
                    var caps = SDPUtils.parseRtpParameters(mediaSection);
                    self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
                  });
                  this.transceivers = this._pendingOffer;
                  delete this._pendingOffer;
                }
              } else if (description.type === 'answer') {
                sections = SDPUtils.splitSections(self.remoteDescription.sdp);
                sessionpart = sections.shift();
                var isIceLite = SDPUtils.matchPrefix(sessionpart,
                  'a=ice-lite').length > 0;
                sections.forEach(function(mediaSection, sdpMLineIndex) {
                  var transceiver = self.transceivers[sdpMLineIndex];
                  var iceGatherer = transceiver.iceGatherer;
                  var iceTransport = transceiver.iceTransport;
                  var dtlsTransport = transceiver.dtlsTransport;
                  var localCapabilities = transceiver.localCapabilities;
                  var remoteCapabilities = transceiver.remoteCapabilities;
                  var rejected = mediaSection.split('\n', 1)[0]
                    .split(' ', 2)[1] === '0';

                  if (!rejected) {
                    var remoteIceParameters = SDPUtils.getIceParameters(
                      mediaSection, sessionpart);
                    if (isIceLite) {
                      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                        .map(function(cand) {
                          return SDPUtils.parseCandidate(cand);
                        })
                        .filter(function(cand) {
                          return cand.component === '1';
                        });
                      // ice-lite only includes host candidates in the SDP so we can
                      // use setRemoteCandidates (which implies an
                      // RTCIceCandidateComplete)
                      iceTransport.setRemoteCandidates(cands);
                    }
                    iceTransport.start(iceGatherer, remoteIceParameters,
                      isIceLite ? 'controlling' : 'controlled');

                    var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                      mediaSection, sessionpart);
                    if (isIceLite) {
                      remoteDtlsParameters.role = 'server';
                    }
                    dtlsTransport.start(remoteDtlsParameters);

                    // Calculate intersection of capabilities.
                    var params = self._getCommonCapabilities(localCapabilities,
                      remoteCapabilities);

                    // Start the RTCRtpSender. The RTCRtpReceiver for this
                    // transceiver has already been started in setRemoteDescription.
                    self._transceive(transceiver,
                      params.codecs.length > 0,
                      false);
                  }
                });
              }

              this.localDescription = {
                type: description.type,
                sdp: description.sdp
              };
              switch (description.type) {
                case 'offer':
                  this._updateSignalingState('have-local-offer');
                  break;
                case 'answer':
                  this._updateSignalingState('stable');
                  break;
                default:
                  throw new TypeError('unsupported type "' + description.type +
                    '"');
              }

              // If a success callback was provided, emit ICE candidates after it
              // has been executed. Otherwise, emit callback after the Promise is
              // resolved.
              var hasCallback = arguments.length > 1 &&
                typeof arguments[1] === 'function';
              if (hasCallback) {
                var cb = arguments[1];
                window.setTimeout(function() {
                  cb();
                  if (self.iceGatheringState === 'new') {
                    self.iceGatheringState = 'gathering';
                  }
                  self._emitBufferedCandidates();
                }, 0);
              }
              var p = Promise.resolve();
              p.then(function() {
                if (!hasCallback) {
                  if (self.iceGatheringState === 'new') {
                    self.iceGatheringState = 'gathering';
                  }
                  // Usually candidates will be emitted earlier.
                  window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
                }
              });
              return p;
            };

          window.RTCPeerConnection.prototype.setRemoteDescription =
            function(description) {
              var self = this;
              var stream = new MediaStream();
              var receiverList = [];
              var sections = SDPUtils.splitSections(description.sdp);
              var sessionpart = sections.shift();
              var isIceLite = SDPUtils.matchPrefix(sessionpart,
                'a=ice-lite').length > 0;
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var lines = SDPUtils.splitLines(mediaSection);
                var mline = lines[0].substr(2).split(' ');
                var kind = mline[0];
                var rejected = mline[1] === '0';
                var direction = SDPUtils.getDirection(mediaSection, sessionpart);

                var transceiver;
                var iceGatherer;
                var iceTransport;
                var dtlsTransport;
                var rtpSender;
                var rtpReceiver;
                var sendEncodingParameters;
                var recvEncodingParameters;
                var localCapabilities;

                var track;
                // FIXME: ensure the mediaSection has rtcp-mux set.
                var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
                var remoteIceParameters;
                var remoteDtlsParameters;
                if (!rejected) {
                  remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                    sessionpart);
                  remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                    sessionpart);
                  remoteDtlsParameters.role = 'client';
                }
                recvEncodingParameters =
                  SDPUtils.parseRtpEncodingParameters(mediaSection);

                var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
                if (mid.length) {
                  mid = mid[0].substr(6);
                } else {
                  mid = SDPUtils.generateIdentifier();
                }

                var cname;
                // Gets the first SSRC. Note that with RTX there might be multiple
                // SSRCs.
                var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                  .map(function(line) {
                    return SDPUtils.parseSsrcMedia(line);
                  })
                  .filter(function(obj) {
                    return obj.attribute === 'cname';
                  })[0];
                if (remoteSsrc) {
                  cname = remoteSsrc.value;
                }

                var isComplete = SDPUtils.matchPrefix(mediaSection,
                  'a=end-of-candidates').length > 0;
                var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                  .map(function(cand) {
                    return SDPUtils.parseCandidate(cand);
                  })
                  .filter(function(cand) {
                    return cand.component === '1';
                  });
                if (description.type === 'offer' && !rejected) {
                  var transports = self._createIceAndDtlsTransports(mid,
                    sdpMLineIndex);
                  if (isComplete) {
                    transports.iceTransport.setRemoteCandidates(cands);
                  }

                  localCapabilities = RTCRtpReceiver.getCapabilities(kind);
                  sendEncodingParameters = [{
                    ssrc: (2 * sdpMLineIndex + 2) * 1001
                  }];

                  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

                  track = rtpReceiver.track;
                  receiverList.push([track, rtpReceiver]);
                  // FIXME: not correct when there are multiple streams but that is
                  // not currently supported in this shim.
                  stream.addTrack(track);

                  // FIXME: look at direction.
                  if (self.localStreams.length > 0 &&
                    self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                    // FIXME: actually more complicated, needs to match types etc
                    var localtrack = self.localStreams[0]
                      .getTracks()[sdpMLineIndex];
                    rtpSender = new RTCRtpSender(localtrack,
                      transports.dtlsTransport);
                  }

                  self.transceivers[sdpMLineIndex] = {
                    iceGatherer: transports.iceGatherer,
                    iceTransport: transports.iceTransport,
                    dtlsTransport: transports.dtlsTransport,
                    localCapabilities: localCapabilities,
                    remoteCapabilities: remoteCapabilities,
                    rtpSender: rtpSender,
                    rtpReceiver: rtpReceiver,
                    kind: kind,
                    mid: mid,
                    cname: cname,
                    sendEncodingParameters: sendEncodingParameters,
                    recvEncodingParameters: recvEncodingParameters
                  };
                  // Start the RTCRtpReceiver now. The RTPSender is started in
                  // setLocalDescription.
                  self._transceive(self.transceivers[sdpMLineIndex],
                    false,
                    direction === 'sendrecv' || direction === 'sendonly');
                } else if (description.type === 'answer' && !rejected) {
                  transceiver = self.transceivers[sdpMLineIndex];
                  iceGatherer = transceiver.iceGatherer;
                  iceTransport = transceiver.iceTransport;
                  dtlsTransport = transceiver.dtlsTransport;
                  rtpSender = transceiver.rtpSender;
                  rtpReceiver = transceiver.rtpReceiver;
                  sendEncodingParameters = transceiver.sendEncodingParameters;
                  localCapabilities = transceiver.localCapabilities;

                  self.transceivers[sdpMLineIndex].recvEncodingParameters =
                    recvEncodingParameters;
                  self.transceivers[sdpMLineIndex].remoteCapabilities =
                    remoteCapabilities;
                  self.transceivers[sdpMLineIndex].cname = cname;

                  if (isIceLite || isComplete) {
                    iceTransport.setRemoteCandidates(cands);
                  }
                  iceTransport.start(iceGatherer, remoteIceParameters,
                    'controlling');
                  dtlsTransport.start(remoteDtlsParameters);

                  self._transceive(transceiver,
                    direction === 'sendrecv' || direction === 'recvonly',
                    direction === 'sendrecv' || direction === 'sendonly');

                  if (rtpReceiver &&
                    (direction === 'sendrecv' || direction === 'sendonly')) {
                    track = rtpReceiver.track;
                    receiverList.push([track, rtpReceiver]);
                    stream.addTrack(track);
                  } else {
                    // FIXME: actually the receiver should be created later.
                    delete transceiver.rtpReceiver;
                  }
                }
              });

              this.remoteDescription = {
                type: description.type,
                sdp: description.sdp
              };
              switch (description.type) {
                case 'offer':
                  this._updateSignalingState('have-remote-offer');
                  break;
                case 'answer':
                  this._updateSignalingState('stable');
                  break;
                default:
                  throw new TypeError('unsupported type "' + description.type +
                    '"');
              }
              if (stream.getTracks().length) {
                self.remoteStreams.push(stream);
                window.setTimeout(function() {
                  var event = new Event('addstream');
                  event.stream = stream;
                  self.dispatchEvent(event);
                  if (self.onaddstream !== null) {
                    window.setTimeout(function() {
                      self.onaddstream(event);
                    }, 0);
                  }

                  receiverList.forEach(function(item) {
                    var track = item[0];
                    var receiver = item[1];
                    var trackEvent = new Event('track');
                    trackEvent.track = track;
                    trackEvent.receiver = receiver;
                    trackEvent.streams = [stream];
                    self.dispatchEvent(event);
                    if (self.ontrack !== null) {
                      window.setTimeout(function() {
                        self.ontrack(trackEvent);
                      }, 0);
                    }
                  });
                }, 0);
              }
              if (arguments.length > 1 && typeof arguments[1] === 'function') {
                window.setTimeout(arguments[1], 0);
              }
              return Promise.resolve();
            };

          window.RTCPeerConnection.prototype.close = function() {
            this.transceivers.forEach(function(transceiver) {
              /* not yet
              if (transceiver.iceGatherer) {
                transceiver.iceGatherer.close();
              }
              */
              if (transceiver.iceTransport) {
                transceiver.iceTransport.stop();
              }
              if (transceiver.dtlsTransport) {
                transceiver.dtlsTransport.stop();
              }
              if (transceiver.rtpSender) {
                transceiver.rtpSender.stop();
              }
              if (transceiver.rtpReceiver) {
                transceiver.rtpReceiver.stop();
              }
            });
            // FIXME: clean up tracks, local streams, remote streams, etc
            this._updateSignalingState('closed');
          };

          // Update the signaling state.
          window.RTCPeerConnection.prototype._updateSignalingState =
            function(newState) {
              this.signalingState = newState;
              var event = new Event('signalingstatechange');
              this.dispatchEvent(event);
              if (this.onsignalingstatechange !== null) {
                this.onsignalingstatechange(event);
              }
            };

          // Determine whether to fire the negotiationneeded event.
          window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
            function() {
              // Fire away (for now).
              var event = new Event('negotiationneeded');
              this.dispatchEvent(event);
              if (this.onnegotiationneeded !== null) {
                this.onnegotiationneeded(event);
              }
            };

          // Update the connection state.
          window.RTCPeerConnection.prototype._updateConnectionState = function() {
            var self = this;
            var newState;
            var states = {
              'new': 0,
              closed: 0,
              connecting: 0,
              checking: 0,
              connected: 0,
              completed: 0,
              failed: 0
            };
            this.transceivers.forEach(function(transceiver) {
              states[transceiver.iceTransport.state]++;
              states[transceiver.dtlsTransport.state]++;
            });
            // ICETransport.completed and connected are the same for this purpose.
            states.connected += states.completed;

            newState = 'new';
            if (states.failed > 0) {
              newState = 'failed';
            } else if (states.connecting > 0 || states.checking > 0) {
              newState = 'connecting';
            } else if (states.disconnected > 0) {
              newState = 'disconnected';
            } else if (states.new > 0) {
              newState = 'new';
            } else if (states.connected > 0 || states.completed > 0) {
              newState = 'connected';
            }

            if (newState !== self.iceConnectionState) {
              self.iceConnectionState = newState;
              var event = new Event('iceconnectionstatechange');
              this.dispatchEvent(event);
              if (this.oniceconnectionstatechange !== null) {
                this.oniceconnectionstatechange(event);
              }
            }
          };

          window.RTCPeerConnection.prototype.createOffer = function() {
            var self = this;
            if (this._pendingOffer) {
              throw new Error('createOffer called while there is a pending offer.');
            }
            var offerOptions;
            if (arguments.length === 1 && typeof arguments[0] !== 'function') {
              offerOptions = arguments[0];
            } else if (arguments.length === 3) {
              offerOptions = arguments[2];
            }

            var tracks = [];
            var numAudioTracks = 0;
            var numVideoTracks = 0;
            // Default to sendrecv.
            if (this.localStreams.length) {
              numAudioTracks = this.localStreams[0].getAudioTracks().length;
              numVideoTracks = this.localStreams[0].getVideoTracks().length;
            }
            // Determine number of audio and video tracks we need to send/recv.
            if (offerOptions) {
              // Reject Chrome legacy constraints.
              if (offerOptions.mandatory || offerOptions.optional) {
                throw new TypeError(
                  'Legacy mandatory/optional constraints not supported.');
              }
              if (offerOptions.offerToReceiveAudio !== undefined) {
                numAudioTracks = offerOptions.offerToReceiveAudio;
              }
              if (offerOptions.offerToReceiveVideo !== undefined) {
                numVideoTracks = offerOptions.offerToReceiveVideo;
              }
            }
            if (this.localStreams.length) {
              // Push local streams.
              this.localStreams[0].getTracks().forEach(function(track) {
                tracks.push({
                  kind: track.kind,
                  track: track,
                  wantReceive: track.kind === 'audio' ?
                    numAudioTracks > 0 : numVideoTracks > 0
                });
                if (track.kind === 'audio') {
                  numAudioTracks--;
                } else if (track.kind === 'video') {
                  numVideoTracks--;
                }
              });
            }
            // Create M-lines for recvonly streams.
            while (numAudioTracks > 0 || numVideoTracks > 0) {
              if (numAudioTracks > 0) {
                tracks.push({
                  kind: 'audio',
                  wantReceive: true
                });
                numAudioTracks--;
              }
              if (numVideoTracks > 0) {
                tracks.push({
                  kind: 'video',
                  wantReceive: true
                });
                numVideoTracks--;
              }
            }

            var sdp = SDPUtils.writeSessionBoilerplate();
            var transceivers = [];
            tracks.forEach(function(mline, sdpMLineIndex) {
              // For each track, create an ice gatherer, ice transport,
              // dtls transport, potentially rtpsender and rtpreceiver.
              var track = mline.track;
              var kind = mline.kind;
              var mid = SDPUtils.generateIdentifier();

              var transports = self._createIceAndDtlsTransports(mid, sdpMLineIndex);

              var localCapabilities = RTCRtpSender.getCapabilities(kind);
              var rtpSender;
              var rtpReceiver;

              // generate an ssrc now, to be used later in rtpSender.send
              var sendEncodingParameters = [{
                ssrc: (2 * sdpMLineIndex + 1) * 1001
              }];
              if (track) {
                rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
              }

              if (mline.wantReceive) {
                rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
              }

              transceivers[sdpMLineIndex] = {
                iceGatherer: transports.iceGatherer,
                iceTransport: transports.iceTransport,
                dtlsTransport: transports.dtlsTransport,
                localCapabilities: localCapabilities,
                remoteCapabilities: null,
                rtpSender: rtpSender,
                rtpReceiver: rtpReceiver,
                kind: kind,
                mid: mid,
                sendEncodingParameters: sendEncodingParameters,
                recvEncodingParameters: null
              };
              var transceiver = transceivers[sdpMLineIndex];
              sdp += SDPUtils.writeMediaSection(transceiver,
                transceiver.localCapabilities, 'offer', self.localStreams[0]);
            });

            this._pendingOffer = transceivers;
            var desc = new RTCSessionDescription({
              type: 'offer',
              sdp: sdp
            });
            if (arguments.length && typeof arguments[0] === 'function') {
              window.setTimeout(arguments[0], 0, desc);
            }
            return Promise.resolve(desc);
          };

          window.RTCPeerConnection.prototype.createAnswer = function() {
            var self = this;

            var sdp = SDPUtils.writeSessionBoilerplate();
            this.transceivers.forEach(function(transceiver) {
              // Calculate intersection of capabilities.
              var commonCapabilities = self._getCommonCapabilities(
                transceiver.localCapabilities,
                transceiver.remoteCapabilities);

              sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
                'answer', self.localStreams[0]);
            });

            var desc = new RTCSessionDescription({
              type: 'answer',
              sdp: sdp
            });
            if (arguments.length && typeof arguments[0] === 'function') {
              window.setTimeout(arguments[0], 0, desc);
            }
            return Promise.resolve(desc);
          };

          window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
            if (candidate === null) {
              this.transceivers.forEach(function(transceiver) {
                transceiver.iceTransport.addIceCandidate({});
              });
            } else {
              var mLineIndex = candidate.sdpMLineIndex;
              if (candidate.sdpMid) {
                for (var i = 0; i < this.transceivers.length; i++) {
                  if (this.transceivers[i].mid === candidate.sdpMid) {
                    mLineIndex = i;
                    break;
                  }
                }
              }
              var transceiver = this.transceivers[mLineIndex];
              if (transceiver) {
                var cand = Object.keys(candidate.candidate).length > 0 ?
                  SDPUtils.parseCandidate(candidate.candidate) : {};
                // Ignore Chrome's invalid candidates since Edge does not like them.
                if (cand.protocol === 'tcp' && cand.port === 0) {
                  return;
                }
                // Ignore RTCP candidates, we assume RTCP-MUX.
                if (cand.component !== '1') {
                  return;
                }
                // A dirty hack to make samples work.
                if (cand.type === 'endOfCandidates') {
                  cand = {};
                }
                transceiver.iceTransport.addRemoteCandidate(cand);

                // update the remoteDescription.
                var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
                sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim() : 'a=end-of-candidates') + '\r\n';
                this.remoteDescription.sdp = sections.join('');
              }
            }
            if (arguments.length > 1 && typeof arguments[1] === 'function') {
              window.setTimeout(arguments[1], 0);
            }
            return Promise.resolve();
          };

          window.RTCPeerConnection.prototype.getStats = function() {
            var promises = [];
            this.transceivers.forEach(function(transceiver) {
              ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
                'dtlsTransport'
              ].forEach(function(method) {
                if (transceiver[method]) {
                  promises.push(transceiver[method].getStats());
                }
              });
            });
            var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
              arguments[1];
            return new Promise(function(resolve) {
              // shim getStats with maplike support
              var results = new Map();
              Promise.all(promises).then(function(res) {
                res.forEach(function(result) {
                  Object.keys(result).forEach(function(id) {
                    results.set(id, result[id]);
                    results[id] = result[id];
                  });
                });
                if (cb) {
                  window.setTimeout(cb, 0, results);
                }
                resolve(results);
              });
            });
          };
        },

        // Attach a media stream to an element.
        attachMediaStream: function(element, stream) {
          logging('DEPRECATED, attachMediaStream will soon be removed.');
          element.srcObject = stream;
        },

        reattachMediaStream: function(to, from) {
          logging('DEPRECATED, reattachMediaStream will soon be removed.');
          to.srcObject = from.srcObject;
        }
      };

      // Expose public methods.
      module.exports = {
        shimPeerConnection: edgeShim.shimPeerConnection,
        shimGetUserMedia: require('./getusermedia'),
        attachMediaStream: edgeShim.attachMediaStream,
        reattachMediaStream: edgeShim.reattachMediaStream
      };

    }, { "../utils": 10, "./getusermedia": 6, "sdp": 1 }],
    6: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      // Expose public methods.
      module.exports = function() {
        var shimError_ = function(e) {
          return {
            name: { PermissionDeniedError: 'NotAllowedError' }[e.name] || e.name,
            message: e.message,
            constraint: e.constraint,
            toString: function() {
              return this.name;
            }
          };
        };

        // getUserMedia error shim.
        var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function(c) {
          return origGetUserMedia(c).catch(function(e) {
            return Promise.reject(shimError_(e));
          });
        };
      };

    }, {}],
    7: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var logging = require('../utils').log;
      var browserDetails = require('../utils').browserDetails;

      var firefoxShim = {
        shimOnTrack: function() {
          if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
              window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
              get: function() {
                return this._ontrack;
              },
              set: function(f) {
                if (this._ontrack) {
                  this.removeEventListener('track', this._ontrack);
                  this.removeEventListener('addstream', this._ontrackpoly);
                }
                this.addEventListener('track', this._ontrack = f);
                this.addEventListener('addstream', this._ontrackpoly = function(e) {
                  e.stream.getTracks().forEach(function(track) {
                    var event = new Event('track');
                    event.track = track;
                    event.receiver = { track: track };
                    event.streams = [e.stream];
                    this.dispatchEvent(event);
                  }.bind(this));
                }.bind(this));
              }
            });
          }
        },

        shimSourceObject: function() {
          // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
          if (typeof window === 'object') {
            if (window.HTMLMediaElement &&
              !('srcObject' in window.HTMLMediaElement.prototype)) {
              // Shim the srcObject property, once, when HTMLMediaElement is found.
              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                get: function() {
                  return this.mozSrcObject;
                },
                set: function(stream) {
                  this.mozSrcObject = stream;
                }
              });
            }
          }
        },

        shimPeerConnection: function() {
          if (typeof window !== 'object' || !(window.RTCPeerConnection ||
              window.mozRTCPeerConnection)) {
            return; // probably media.peerconnection.enabled=false in about:config
          }
          // The RTCPeerConnection object.
          if (!window.RTCPeerConnection) {
            window.RTCPeerConnection = function(pcConfig, pcConstraints) {
              if (browserDetails.version < 38) {
                // .urls is not supported in FF < 38.
                // create RTCIceServers with a single url.
                if (pcConfig && pcConfig.iceServers) {
                  var newIceServers = [];
                  for (var i = 0; i < pcConfig.iceServers.length; i++) {
                    var server = pcConfig.iceServers[i];
                    if (server.hasOwnProperty('urls')) {
                      for (var j = 0; j < server.urls.length; j++) {
                        var newServer = {
                          url: server.urls[j]
                        };
                        if (server.urls[j].indexOf('turn') === 0) {
                          newServer.username = server.username;
                          newServer.credential = server.credential;
                        }
                        newIceServers.push(newServer);
                      }
                    } else {
                      newIceServers.push(pcConfig.iceServers[i]);
                    }
                  }
                  pcConfig.iceServers = newIceServers;
                }
              }
              return new mozRTCPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

            // wrap static methods. Currently just generateCertificate.
            if (mozRTCPeerConnection.generateCertificate) {
              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                get: function() {
                  return mozRTCPeerConnection.generateCertificate;
                }
              });
            }

            window.RTCSessionDescription = mozRTCSessionDescription;
            window.RTCIceCandidate = mozRTCIceCandidate;
          }

          // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
          ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = RTCPeerConnection.prototype[method];
            RTCPeerConnection.prototype[method] = function() {
              arguments[0] = new((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });

          // support for addIceCandidate(null)
          var nativeAddIceCandidate =
            RTCPeerConnection.prototype.addIceCandidate;
          RTCPeerConnection.prototype.addIceCandidate = function() {
            return arguments[0] === null ? Promise.resolve() : nativeAddIceCandidate.apply(this, arguments);
          };

          // shim getStats with maplike support
          var makeMapStats = function(stats) {
            var map = new Map();
            Object.keys(stats).forEach(function(key) {
              map.set(key, stats[key]);
              map[key] = stats[key];
            });
            return map;
          };

          var nativeGetStats = RTCPeerConnection.prototype.getStats;
          RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
            return nativeGetStats.apply(this, [selector || null])
              .then(function(stats) {
                return makeMapStats(stats);
              })
              .then(onSucc, onErr);
          };
        },

        shimGetUserMedia: function() {
          // getUserMedia constraints shim.
          var getUserMedia_ = function(constraints, onSuccess, onError) {
            var constraintsToFF37_ = function(c) {
              if (typeof c !== 'object' || c.require) {
                return c;
              }
              var require = [];
              Object.keys(c).forEach(function(key) {
                if (key === 'require' || key === 'advanced' ||
                  key === 'mediaSource') {
                  return;
                }
                var r = c[key] = (typeof c[key] === 'object') ?
                  c[key] : { ideal: c[key] };
                if (r.min !== undefined ||
                  r.max !== undefined || r.exact !== undefined) {
                  require.push(key);
                }
                if (r.exact !== undefined) {
                  if (typeof r.exact === 'number') {
                    r.min = r.max = r.exact;
                  } else {
                    c[key] = r.exact;
                  }
                  delete r.exact;
                }
                if (r.ideal !== undefined) {
                  c.advanced = c.advanced || [];
                  var oc = {};
                  if (typeof r.ideal === 'number') {
                    oc[key] = { min: r.ideal, max: r.ideal };
                  } else {
                    oc[key] = r.ideal;
                  }
                  c.advanced.push(oc);
                  delete r.ideal;
                  if (!Object.keys(r).length) {
                    delete c[key];
                  }
                }
              });
              if (require.length) {
                c.require = require;
              }
              return c;
            };
            constraints = JSON.parse(JSON.stringify(constraints));
            if (browserDetails.version < 38) {
              logging('spec: ' + JSON.stringify(constraints));
              if (constraints.audio) {
                constraints.audio = constraintsToFF37_(constraints.audio);
              }
              if (constraints.video) {
                constraints.video = constraintsToFF37_(constraints.video);
              }
              logging('ff37: ' + JSON.stringify(constraints));
            }
            return navigator.mozGetUserMedia(constraints, onSuccess, onError);
          };

          navigator.getUserMedia = getUserMedia_;

          // Returns the result of getUserMedia as a Promise.
          var getUserMediaPromise_ = function(constraints) {
            return new Promise(function(resolve, reject) {
              navigator.getUserMedia(constraints, resolve, reject);
            });
          };

          // Shim for mediaDevices on older versions.
          if (!navigator.mediaDevices) {
            navigator.mediaDevices = {
              getUserMedia: getUserMediaPromise_,
              addEventListener: function() {},
              removeEventListener: function() {}
            };
          }
          navigator.mediaDevices.enumerateDevices =
            navigator.mediaDevices.enumerateDevices || function() {
              return new Promise(function(resolve) {
                var infos = [
                  { kind: 'audioinput', deviceId: 'default', label: '', groupId: '' },
                  { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }
                ];
                resolve(infos);
              });
            };

          if (browserDetails.version < 41) {
            // Work around http://bugzil.la/1169665
            var orgEnumerateDevices =
              navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
            navigator.mediaDevices.enumerateDevices = function() {
              return orgEnumerateDevices().then(undefined, function(e) {
                if (e.name === 'NotFoundError') {
                  return [];
                }
                throw e;
              });
            };
          }
        },

        // Attach a media stream to an element.
        attachMediaStream: function(element, stream) {
          logging('DEPRECATED, attachMediaStream will soon be removed.');
          element.srcObject = stream;
        },

        reattachMediaStream: function(to, from) {
          logging('DEPRECATED, reattachMediaStream will soon be removed.');
          to.srcObject = from.srcObject;
        }
      };

      // Expose public methods.
      module.exports = {
        shimOnTrack: firefoxShim.shimOnTrack,
        shimSourceObject: firefoxShim.shimSourceObject,
        shimPeerConnection: firefoxShim.shimPeerConnection,
        shimGetUserMedia: require('./getusermedia'),
        attachMediaStream: firefoxShim.attachMediaStream,
        reattachMediaStream: firefoxShim.reattachMediaStream
      };

    }, { "../utils": 10, "./getusermedia": 8 }],
    8: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var logging = require('../utils').log;
      var browserDetails = require('../utils').browserDetails;

      // Expose public methods.
      module.exports = function() {
        var shimError_ = function(e) {
          return {
            name: {
              SecurityError: 'NotAllowedError',
              PermissionDeniedError: 'NotAllowedError'
            }[e.name] || e.name,
            message: {
              'The operation is insecure.': 'The request is not allowed by the ' +
                'user agent or the platform in the current context.'
            }[e.message] || e.message,
            constraint: e.constraint,
            toString: function() {
              return this.name + (this.message && ': ') + this.message;
            }
          };
        };

        // getUserMedia constraints shim.
        var getUserMedia_ = function(constraints, onSuccess, onError) {
          var constraintsToFF37_ = function(c) {
            if (typeof c !== 'object' || c.require) {
              return c;
            }
            var require = [];
            Object.keys(c).forEach(function(key) {
              if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                return;
              }
              var r = c[key] = (typeof c[key] === 'object') ?
                c[key] : { ideal: c[key] };
              if (r.min !== undefined ||
                r.max !== undefined || r.exact !== undefined) {
                require.push(key);
              }
              if (r.exact !== undefined) {
                if (typeof r.exact === 'number') {
                  r.min = r.max = r.exact;
                } else {
                  c[key] = r.exact;
                }
                delete r.exact;
              }
              if (r.ideal !== undefined) {
                c.advanced = c.advanced || [];
                var oc = {};
                if (typeof r.ideal === 'number') {
                  oc[key] = { min: r.ideal, max: r.ideal };
                } else {
                  oc[key] = r.ideal;
                }
                c.advanced.push(oc);
                delete r.ideal;
                if (!Object.keys(r).length) {
                  delete c[key];
                }
              }
            });
            if (require.length) {
              c.require = require;
            }
            return c;
          };
          constraints = JSON.parse(JSON.stringify(constraints));
          if (browserDetails.version < 38) {
            logging('spec: ' + JSON.stringify(constraints));
            if (constraints.audio) {
              constraints.audio = constraintsToFF37_(constraints.audio);
            }
            if (constraints.video) {
              constraints.video = constraintsToFF37_(constraints.video);
            }
            logging('ff37: ' + JSON.stringify(constraints));
          }
          return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
            onError(shimError_(e));
          });
        };

        navigator.getUserMedia = getUserMedia_;

        // Returns the result of getUserMedia as a Promise.
        var getUserMediaPromise_ = function(constraints) {
          return new Promise(function(resolve, reject) {
            navigator.getUserMedia(constraints, resolve, reject);
          });
        };

        // Shim for mediaDevices on older versions.
        if (!navigator.mediaDevices) {
          navigator.mediaDevices = {
            getUserMedia: getUserMediaPromise_,
            addEventListener: function() {},
            removeEventListener: function() {}
          };
        }
        navigator.mediaDevices.enumerateDevices =
          navigator.mediaDevices.enumerateDevices || function() {
            return new Promise(function(resolve) {
              var infos = [
                { kind: 'audioinput', deviceId: 'default', label: '', groupId: '' },
                { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }
              ];
              resolve(infos);
            });
          };

        if (browserDetails.version < 41) {
          // Work around http://bugzil.la/1169665
          var orgEnumerateDevices =
            navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
          navigator.mediaDevices.enumerateDevices = function() {
            return orgEnumerateDevices().then(undefined, function(e) {
              if (e.name === 'NotFoundError') {
                return [];
              }
              throw e;
            });
          };
        }
        if (browserDetails.version < 49) {
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.
          bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function(c) {
            return origGetUserMedia(c).catch(function(e) {
              return Promise.reject(shimError_(e));
            });
          };
        }
      };

    }, { "../utils": 10 }],
    9: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      'use strict';
      var safariShim = {
        // TODO: DrAlex, should be here, double check against LayoutTests
        // shimOnTrack: function() { },

        // TODO: DrAlex
        // attachMediaStream: function(element, stream) { },
        // reattachMediaStream: function(to, from) { },

        // TODO: once the back-end for the mac port is done, add.
        // TODO: check for webkitGTK+
        // shimPeerConnection: function() { },

        shimGetUserMedia: function() {
          navigator.getUserMedia = navigator.webkitGetUserMedia;
        }
      };

      // Expose public methods.
      module.exports = {
        shimGetUserMedia: safariShim.shimGetUserMedia
          // TODO
          // shimOnTrack: safariShim.shimOnTrack,
          // shimPeerConnection: safariShim.shimPeerConnection,
          // attachMediaStream: safariShim.attachMediaStream,
          // reattachMediaStream: safariShim.reattachMediaStream
      };

    }, {}],
    10: [function(require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var logDisabled_ = true;

      // Utility methods.
      var utils = {
        disableLog: function(bool) {
          if (typeof bool !== 'boolean') {
            return new Error('Argument type: ' + typeof bool +
              '. Please use a boolean.');
          }
          logDisabled_ = bool;
          return (bool) ? 'adapter.js logging disabled' :
            'adapter.js logging enabled';
        },

        log: function() {
          if (typeof window === 'object') {
            if (logDisabled_) {
              return;
            }
            if (typeof console !== 'undefined' && typeof console.log === 'function') {
              console.log.apply(console, arguments);
            }
          }
        },

        /**
         * Extract browser version out of the provided user agent string.
         *
         * @param {!string} uastring userAgent string.
         * @param {!string} expr Regular expression used as match criteria.
         * @param {!number} pos position in the version string to be returned.
         * @return {!number} browser version.
         */
        extractVersion: function(uastring, expr, pos) {
          var match = uastring.match(expr);
          return match && match.length >= pos && parseInt(match[pos], 10);
        },

        /**
         * Browser detector.
         *
         * @return {object} result containing browser, version and minVersion
         *     properties.
         */
        detectBrowser: function() {
          // Returned result object.
          var result = {};
          result.browser = null;
          result.version = null;
          result.minVersion = null;

          // Fail early if it's not a browser
          if (typeof window === 'undefined' || !window.navigator) {
            result.browser = 'Not a browser.';
            return result;
          }

          // Firefox.
          if (navigator.mozGetUserMedia) {
            result.browser = 'firefox';
            result.version = this.extractVersion(navigator.userAgent,
              /Firefox\/([0-9]+)\./, 1);
            result.minVersion = 31;

            // all webkit-based browsers
          } else if (navigator.webkitGetUserMedia) {
            // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
            if (window.webkitRTCPeerConnection) {
              result.browser = 'chrome';
              result.version = this.extractVersion(navigator.userAgent,
                /Chrom(e|ium)\/([0-9]+)\./, 2);
              result.minVersion = 38;

              // Safari or unknown webkit-based
              // for the time being Safari has support for MediaStreams but not webRTC
            } else {
              // Safari UA substrings of interest for reference:
              // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
              // - safari UI version:        Version/9.0.3 (unique to Safari)
              // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
              //
              // if the webkit version and safari UI webkit versions are equals,
              // ... this is a stable version.
              //
              // only the internal webkit version is important today to know if
              // media streams are supported
              //
              if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
                result.browser = 'safari';
                result.version = this.extractVersion(navigator.userAgent,
                  /AppleWebKit\/([0-9]+)\./, 1);
                result.minVersion = 602;

                // unknown webkit-based browser
              } else {
                result.browser = 'Unsupported webkit-based browser ' +
                  'with GUM support but no WebRTC support.';
                return result;
              }
            }

            // Edge.
          } else if (navigator.mediaDevices &&
            navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
            result.browser = 'edge';
            result.version = this.extractVersion(navigator.userAgent,
              /Edge\/(\d+).(\d+)$/, 2);
            result.minVersion = 10547;

            // Default fallthrough: not supported.
          } else {
            result.browser = 'Not a supported browser.';
            return result;
          }

          // Warn if version is less than minVersion.
          if (result.version < result.minVersion) {
            utils.log('Browser: ' + result.browser + ' Version: ' + result.version +
              ' < minimum supported version: ' + result.minVersion +
              '\n some things might not work!');
          }

          return result;
        }
      };

      // Export.
      module.exports = {
        log: utils.log,
        disableLog: utils.disableLog,
        browserDetails: utils.detectBrowser(),
        extractVersion: utils.extractVersion
      };

    }, {}]
  }, {}, [2])(2)
});

'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*global qrcode:true*/

/**
 * QrReader
 *
 * This class allows to read QR codes from a web-browser in any device with a video-camera.
 *
 * @example
 * // First define the options passed to the QrReader.
 * let options = {};
 *
 * options.sucessCallback = function(){}; // This function will be executed when the detector reads a code.
 * options.errorCallback = function(){}; // This function will be executed when the detector fails reading a code.
 * options.videoSelector = '.video-preview'; // If you have a video tag with the video preview you can indicate a css selector.
 * options.stopOnRead =  true;  // When this flag is activated the detector will stop once a code was readed sucessfully.
 * options.startOnCreate = false;  // When this flag is activated the detector will start when instantiated.
 * let reader = new QrReader(options);
 *
 * reader.start(); // Start reading
 * reader.stop(); // Stop streams and video.
 */

var QrReader = function () {
	/**
  * Instantiate a QrReader object.
  * @param {object} options - Constructor options.
  * @param {function} options.sucessCallback - Callback to execute when the detector reads a code.
  * @param {function} options.errorCallback - Callback to execute when the detector fails reading a code.
  * @param {string} options.videoSelector -  The detector will use a video element found using the given selector, if undefined it will create his own.
  * @param {boolean} options.stopOnRead - When this flag is activated the detector will stop once a qrcode was readed sucessfully.
  * @param {boolean} options.startOnCreate - When this flag is activated the detector will start when instantiated.
  * @param {deviceId} options.deviceId - Id of the device used for recording video. (Use QrReader.getBackCamera to get the back camera device).
  */

	function QrReader(options) {
		_classCallCheck(this, QrReader);

		var videoSelector = options.videoSelector;

		// Initialize default values for atributes
		this._stopOnRead = options.stopOnRead;
		this._video = null;
		this._context = null;
		this._mediaStream = null;
		this._stopped = false;
		this._defaultHeight = 480;
		this._defaultWidth = 640;
		this._deviceId = options.deviceId;
		this._startOnCreate = options.startOnCreate || true;

		/**
   * Callback to run when a qr code is decoded.
   * @param {string} data - The decoded string obtained from the qr code.
   */
		this.onSuccess = options.sucessCallback;

		/**
   * Callback to run when an error happens trying to decode a code.
   * @param {Error} error - The error.
   */
		this.onError = options.errorCallback;

		// Initialize attributes
		this._video = this._createVideoElement(videoSelector);
		this._width = this._video.width;
		this._height = this._video.height;
		this._context = this._createContext2D(this._video);

		if (this._startOnCreate) {
			this.start();
		}
	}

	/**
  * Return a promise resolved with the back camera object.
  */


	_createClass(QrReader, [{
		key: 'start',


		/**
   * Start reading video from the video-camera decoding each frame.
   */
		value: function start() {
			var constraints = {
				video: {
					height: this._defaultHeight,
					width: this._defaultWidth
				}
			};
			if (this._deviceId) {
				constraints.video.deviceId = this._deviceId;
			}
			navigator.getUserMedia(constraints, this._onMediaStream.bind(this), this._onMediaStreamError.bind(this));
		}

		/**
   * Stop video streams.
   */

	}, {
		key: 'stop',
		value: function stop() {
			this._stopStreams();
		}

		/**
   * Return the existing video or create a new one from scratch.
   */

	}, {
		key: '_createVideoElement',
		value: function _createVideoElement(videoSelector) {
			if (videoSelector) {
				return document.querySelector(videoSelector);
			} else {
				var video = document.createElement('video');
				video.setAttribute('width', this._defaultWidth);
				video.setAttribute('height', this._defaultHeight);
				return video;
			}
		}

		/**
   * Return a 2D context with the same size of the video.
   */

	}, {
		key: '_createContext2D',
		value: function _createContext2D(video) {
			var canvas = document.createElement("canvas");
			canvas.width = video.width;
			canvas.height = video.height;
			return canvas.getContext("2d");
		}

		/**
   * Callback to run when the videoStream is obtained.
   */

	}, {
		key: '_onMediaStream',
		value: function _onMediaStream(stream) {
			this._mediaStream = stream;
			this._video.src = URL.createObjectURL(stream);
			this._video.play();
			requestAnimationFrame(this._onAnimationFrameRequested.bind(this));
		}

		/**
   * Callback to run when error on get mediastream.
   */

	}, {
		key: '_onMediaStreamError',
		value: function _onMediaStreamError(e) {
			console.error(e);
		}

		/**
   * Main Loop, get a frame from video and put it into canvas
   */

	}, {
		key: '_onAnimationFrameRequested',
		value: function _onAnimationFrameRequested() {
			if (this._stopped) {
				return;
			}
			this._context.drawImage(this._video, 0, 0, this._width, this._height);
			var frame = this._context.getImageData(0, 0, this._width, this._height);
			this._decode(frame);
			requestAnimationFrame(this._onAnimationFrameRequested.bind(this));
		}

		/**
   *
   */

	}, {
		key: '_decode',
		value: function _decode(frame) {
			var result = '';
			try {
				result = qrcode.decode(frame);
			} catch (e) {
				if (this._isExpectedError(e)) {
					return;
				} else {
					console.error('Unexpected error: ', e);
					this.onError(e);
				}
			}
			if (result !== '' && this._stopOnRead) {
				this._stopStreams();
			}
			if (result !== '') {
				this.onSuccess(result);
			}
		}
	}, {
		key: '_isExpectedError',
		value: function _isExpectedError(e) {
			return String(e).indexOf("Couldn't find enough") >= 0;
		}
	}, {
		key: '_stopStreams',
		value: function _stopStreams() {
			this._stopped = true;
			this._video.pause();
			this._mediaStream.getVideoTracks().forEach(function (videoTrack) {
				videoTrack.stop();
			});
		}
	}], [{
		key: 'getBackCamera',
		value: function getBackCamera() {
			return navigator.mediaDevices.enumerateDevices().then(function (devices) {
				devices = devices.filter(function (d) {
					return d.kind === 'videoinput';
				});
				var back = devices.find(function (d) {
					return d.label.toLowerCase().includes('back');
				});
				return back ? back : devices.shift();
			});
		}
	}]);

	return QrReader;
}();

exports.default = QrReader;

window.QrReader = QrReader;
})();
