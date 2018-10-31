'use strict';
/**
 * an object containing lots of different color properties - get them with getColorProperties().property
 * @param {string|number} hexColor an rgb color in hex
 * @return {ColorMath} functions for dealing with color
 */
 
//VB equivalents for commin colors
var VBCOLORS = {
  vbBlue: 16711680,  
  vbWhite: 16777215,
  vbBlack: 0,
  vbGreen: 65280,
  vbYellow: 65535,
  vbRed:255
};

//Parameters for color comparision algo
var ECOMPARECOLOR = {
  whiteX  : 95.047,
  whiteY : 100,
  whiteZ  : 108.883,
  eccieDe2000 : 21000,
  beige: 10009301
};

  
function ColorMath (color) {

  var self = this;
  var props_ = makeColorProps (typeof color === 'number' ? color : htmlHexToRgb (color) );
  
  /**
   * @return {object} the color properties
   */
  self.getProperties = function () {
    return props_;
  };
  
  /**
   * find the difference between 2 colors
   * @param {ColorMath} p2 the properties of a ColorMath
   * @return {number} the difference
   */
  self.compareColorProps = function (p2 , optCompareType)  {
    
    switch (fixOptional(optCompareType, ECOMPARECOLOR.eccieDe2000)) {
      case ECOMPARECOLOR.eccieDe2000:
        var t= cieDe2000(self.getProperties() , p2);
        return t;
        
      default:
        debugAssert (false, "unknown color comparision " + optCompareType);
    }
    
  }
  
  /**
   * make a washeded out version of this color
   * @return {ColorMath} a washed out version
   */
  self.washOut = function () {
    
    // make a new one
    var p = makeColorProps(self.getProperties().rgb);
    
    // fiddle with the hsSaturation
    p.hsSaturation = p.hsSaturation * 0.2;
    p.hsLightness = p.hsLightness * 0.9;
    
    // redo the math
    return makeColorProps (hslToRgb(p));
  };
  
  /// local functions
  function RGB(r,g,b) {
    return Math.round(r) + (Math.round(g) << 8) + (Math.round(b) << 16);
  }
  
  function rgbRed(rgbColor) {
      return  rgbColor % 0x100;
  }
  
  function rgbGreen(rgbColor) {
      return Math.floor(rgbColor / 0x100) % 0x100;
  }
  
  function rgbBlue(rgbColor) {
      return Math.floor(rgbColor / 0x10000) % 0x100;
  }
  
  function rgbToHtmlHex(rgbColor) {
      // just swap the colors round for rgb to bgr as bit representation is reversed
      return "#" + maskFormat(RGB(rgbBlue(rgbColor), 
              rgbGreen(rgbColor), rgbRed(rgbColor)).toString(16), "000000");
  }
  
  function htmlHexToRgb (htmlHex){
    
    var s = trim(htmlHex);
    s =  (s.substring(0,1) == "#" ? '' : '#') + s;
    debugAssert (s.length > 1 && s.substring(0,1) == "#", "invalid hex color" + htmlHex);
    // -- need to find equivalent ---
    var x = parseInt(  s.substring(1),16);
    // these are purposefully reversed since byte order is different in unix
    return RGB(rgbBlue(x), rgbGreen(x), rgbRed(x));
  }
  
  function debugAssert ( test , text ) {
    if (!test) throw text;
    return test;
  }
  function maskFormat(sIn , f ) {
    var s = trim(sIn);
    if (s.length < f.length) {
        s = f.substring(0,f.length - s.length) + s ;
    }
    return s;
  }
  
  function lumRGB(rgbCom, brighten) {
      var x = rgbCom * brighten;
      return x > 255 ?  255 : 
                        x < 0 ? 0 : x;
  }
  
  function contrastRatio(rgbColorA, rgbColorB) {
    var lumA = w3Luminance(rgbColorA);
    var lumB = w3Luminance(rgbColorB);
    return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
  }
  
  
  function makeColorProps (rgbColor) {
    return populate(rgbColor);
  }
  
  function populate (rgbColor) {
    var p = {};
    
    //store the source color
    p.rgb = rgbColor;
    
    //split the components
    p.red = rgbRed(rgbColor);
    p.green = rgbGreen(rgbColor);
    p.blue = rgbBlue(rgbColor);
    
    //the Html hex rgb equivalent
    p.htmlHex = rgbToHtmlHex(rgbColor);
    
    //the w3 algo for luminance
    p.luminance = w3Luminance(rgbColor);
    
    //determine whether black or white background
    if (p.luminance < 0.5) 
      p.textColor = rgbToHtmlHex(VBCOLORS.vbWhite);
    else
      p.textColor = rgbToHtmlHex(VBCOLORS.vbBlack);
    
    
    //contrast ratio - to comply with w3 recs 1.4 should be at least 10:1 for text
    p.contrastRatio = contrastRatio(htmlHexToRgb(p.textColor), p.rgb);
    
    //cmyk - just an estimate
    p.black = Math.min(Math.min(1 - p.red / 255, 1 - p.green / 255), 1 - p.blue / 255);
    p.cyan = p.magenta = p.yellow = 0;
    
    if (p.black < 1) {
      p.cyan = (1 - p.red / 255 - p.black) / (1 - p.black);
      p.magenta = (1 - p.green / 255 - p.black) / (1 - p.black);
      p.yellow = (1 - p.blue / 255 - p.black) / (1 - p.black);
    }

    
    // calculate hsl + hsv and other wierd things
    var p2 = rgbToHsl(p.rgb);
    p.hsHue = p2.hsHue;
    p.hsSaturation = p2.hsSaturation;
    p.hsLightness = p2.hsLightness;
    
    p.hsValue = rgbToHsv(p.rgb).hsValue;
    
    p2 = rgbToXyz(p.rgb);
    p.x = p2.x;
    p.y = p2.y;
    p.z = p2.z;
    
    p2 = rgbToLab(p.rgb);
    p.cieLstar = p2.cieLstar;
    p.cieAstar = p2.cieAstar;
    p.cieBstar = p2.cieBstar;
    
    p2 = rgbToLch(p.rgb);
    p.cieCstar = p2.cieCstar;
    p.hStar = p2.hStar;
    
    return p;
    
  }
  
  function w3Luminance (rgbColor) {
  // this is based on
  // http://en.wikipedia.org/wiki/Luma_(video)
  
    return (0.2126 * Math.pow((rgbRed(rgbColor)/255),2.2)) +
           (0.7152 * Math.pow((rgbGreen(rgbColor)/255),2.2)) +
           (0.0722 * Math.pow((rgbBlue(rgbColor)/255),2.2)) ;
  }
  
  
  
  function hslToRgb(p) {
    // from // http://www.easyrgb.com/
    var x1 , x2 , h, s , l , 
        red , green , blue ;
    
    h = p.hsHue / 360;
    s = p.hsSaturation / 100;
    l = p.hsLightness / 100;
    
    if (s == 0) {
      return RGB (l * 255, l * 255, l * 255);
    }
    else {
      if (l < 0.5 )
        x2 = l * (1 + s);
      else
        x2 = (l + s) - (l * s);
      
      x1 = 2 * l - x2;
      
      red = 255 * hsHueToRgb(x1, x2, h + (1 / 3));
      green = 255 * hsHueToRgb(x1, x2, h);
      blue = 255 * hsHueToRgb(x1, x2, h - (1 / 3));
      return RGB (red, green, blue);
    }
  }
  
  function hsHueToRgb(a , b , h ) {
    // from // http://www.easyrgb.com/
    if (h < 0)  h = h + 1;
    if (h > 1)  h = h - 1;
    debugAssert (h >= 0 && h <= 1,"hsHue outside range 0-1:" + h);
    
    if (6 * h < 1) 
      return a + (b - a) * 6 * h;
    else {
      if (2 * h < 1) 
        return b;
      else {
        if (3 * h < 2) 
          return a + (b - a) * ((2 / 3) - h) * 6;
        else
          return a;
      }
    }   
  }

  function rgbToHsl (RGBcolor) {
    //from // http://www.easyrgb.com/
    var r , g , b , d , dr , dg , db , mn , mx , p ={};
    
    r = rgbRed(RGBcolor) / 255 ;
    g = rgbGreen(RGBcolor) / 255;
    b = rgbBlue(RGBcolor) / 255;
    mn = Math.min(Math.min(r, g), b);
    mx = Math.max(Math.max(r, g), b);
    d = mx - mn;
    
    //HSL sets here
    p.hsHue = 0;
    p.hsSaturation = 0;
    //hsLightness
    p.hsLightness = (mx + mn) / 2;
    
    if (d != 0) {
      // hsSaturation
      if (p.hsLightness < 0.5)
        p.hsSaturation = d / (mx + mn) ;
      else
        p.hsSaturation = d / (2 - mx - mn) ;       
      // hsHue
      dr = (((mx - r) / 6) + (d / 2)) / d ;
      dg = (((mx - g) / 6) + (d / 2)) / d ;
      db = (((mx - b) / 6) + (d / 2)) / d ;
      
      if (r == mx) 
        p.hsHue = db - dg ;
      else 
        if(g == mx) 
          p.hsHue = (1 / 3) + dr - db ;
      else
        p.hsHue = (2 / 3) + dg - dr ;
      
      
      //force between 0 and 1
      if (p.hsHue < 0) p.hsHue = p.hsHue + 1 ;
      if (p.hsHue > 1) p.hsHue = p.hsHue - 1 ;
      if (!(p.hsHue >= 0 && p.hsHue <= 1)) p.hsHue = 0;   // " invalid hsHue " + p.hsHue + ":" + JSON.stringify(p));
      
    }
    p.hsHue = p.hsHue * 360 ;
    p.hsSaturation = p.hsSaturation * 100 ;
    p.hsLightness = p.hsLightness * 100 ;
    return p;
    
  }
  
  function rgbToHsv(rgbColor){
    // adapted from // http://www.easyrgb.com/
    
    var r = rgbRed(rgbColor) / 255;
    var g = rgbGreen(rgbColor) / 255;
    var b = rgbBlue(rgbColor) / 255;
    var mn = Math.min(r, g, b);
    var mx = Math.max(r, g, b);
    
    // this is the same as hsl and hsv are the same.
    var p = rgbToHsl(rgbColor);
    
    // HSV sets here
    p.hsValue = mx;
    
    return p;
  }
  
  function xyzCorrection(v) {
    if (v > 0.04045) 
      return Math.pow( ((v + 0.055) / 1.055) , 2.4);
    else
      return v / 12.92 ;
    
  }
  
  function xyzCieCorrection(v) {
    return v > 0.008856 ? Math.pow(v , 1 / 3) : (7.787 * v) + (16 / 116);
  }
  function rgbToXyz(rgbColor) {
    // adapted from // http://www.easyrgb.com/
    
    var r = xyzCorrection(rgbRed(rgbColor) / 255) * 100;
    var g = xyzCorrection(rgbGreen(rgbColor) / 255) * 100;
    var b = xyzCorrection(rgbBlue(rgbColor) / 255) * 100;
    var p = {};
    p.x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    p.y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    p.z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    
    return p;
  }
  
  
  function rgbToLab(rgbColor) {
    // adapted from // http://www.easyrgb.com/
    
    var p = rgbToXyz(rgbColor);
    
    var x = xyzCieCorrection(p.x / ECOMPARECOLOR.whiteX);
    var y = xyzCieCorrection(p.y / ECOMPARECOLOR.whiteY);
    var z = xyzCieCorrection(p.z / ECOMPARECOLOR.whiteZ);
    
    p.cieLstar = (116 * y) - 16;
    p.cieAstar = 500 * (x - y);
    p.cieBstar = 200 * (y - z);
    
    return p;
  }

  
  
  function cieDe2000(p1, p2 ) {
    // calculates the distance between 2 colors using CIEDE200
    // see http://www.ece.rochester.edu/~gsharma/cieDe2000/cieDe2000noteCRNA.pdf
    
    var kp = Math.pow(25 , 7), kl = 1,kc = 1, kh = 1;
    
    // calculate c & g hsValues
    var c1 = Math.sqrt(Math.pow(p1.cieAstar , 2) + Math.pow(p1.cieBstar , 2));
    var c2 = Math.sqrt(Math.pow(p2.cieAstar , 2) + Math.pow(p2.cieBstar , 2));
    var c = (c1 + c2) / 2;
    var g = 0.5 * (1 - Math.sqrt(Math.pow(c , 7) / (Math.pow(c , 7) + kp)));
    
    //adjusted ab*
    var a1 = (1 + g) * p1.cieAstar;
    var a2 = (1 + g) * p2.cieAstar;
    
    // adjusted cs
    var c1Tick = Math.sqrt(a1 *a1 + p1.cieBstar *p1.cieBstar);
    var c2Tick = Math.sqrt(a2 *a2 + p2.cieBstar * p2.cieBstar);
    
    //adjusted h
    var h1 = computeH(a1, p1.cieBstar);
    var h2 = computeH(a2, p2.cieBstar);
    
    
    // deltas
    var dh;
    if (h2 - h1 > 180)  
      dh = h2 - h1 - 360;
    else if (h2 - h1 < -180) 
      dh = h2 - h1 + 360 ;
    else 
      dh = h2 - h1;
    
    
    var dl = p2.cieLstar - p1.cieLstar;
    var dc = c2Tick - c1Tick;
    var dBigH = (2 * Math.sqrt(c1Tick * c2Tick) * Math.sin(toRadians(dh / 2)));
    
    // averages
    var lTickAvg = (p1.cieLstar + p2.cieLstar) / 2;
    var cTickAvg = (c1Tick + c2Tick) / 2;
    
    var hTickAvg;
    if (c1Tick * c2Tick == 0)
      hTickAvg = h1 + h2;
    
    else if (Math.abs(h2 - h1) <= 180) 
      hTickAvg = (h1 + h2) / 2;
    
    else if (h2 + h1 < 360) 
      hTickAvg = (h1 + h2) / 2 + 180;
    
    else 
      hTickAvg = (h1 + h2) / 2 - 180;
    
    
    var l50 = Math.pow(lTickAvg - 50,2);
    var sl = 1 + (0.015 * l50 / Math.sqrt(20 + l50));
    
    var sc = 1 + 0.045 * cTickAvg;
    var t = 1 - 0.17 * Math.cos(toRadians(hTickAvg - 30)) + 0.24 * 
      Math.cos(toRadians(2 * hTickAvg)) + 0.32 * 
        Math.cos(toRadians(3 * hTickAvg + 6)) - 0.2 * 
          Math.cos(toRadians(4 * hTickAvg - 63));
    
    var sh = 1 + 0.015 * cTickAvg * t;
    
    var dTheta = 30 * Math.exp(-1 * Math.pow((hTickAvg - 275) / 25 , 2));
    var rc = 2 * Math.sqrt(Math.pow(cTickAvg , 7) / (Math.pow(cTickAvg , 7) + kp));
    var rt = -Math.sin(toRadians(2 * dTheta)) * rc;
    var dlk = dl / sl / kl;
    var dck = dc / sc / kc;
    var dhk = dBigH / sh / kh;
    return Math.sqrt(dlk *dlk + dck *dck + dhk *dhk + rt * dck * dhk);
    
  }
  function computeH(a , b ) {
    if (a == 0 && b == 0)
      return 0;
    else if (b < 0) 
      return fromRadians(Atan2(a,b)) + 360 ;
    
    else
      return fromRadians(Atan2(a,b))  ;   
  }
  
  function lchToLab (p) { 
    var h = toRadians(p.hStar);
    p.cieAstar = Math.cos(h) * p.cieCstar;
    p.cieBstar = Math.sin(h) * p.cieCstar;
    return p;
  }
  
  function labxyzCorrection(x ) {
    if (Math.pow(x , 3) > 0.008856)
      return Math.pow(x , 3);
    else
      return (x - 16 / 116) / 7.787; 
  }
  function lchToRgb(p) {
    return xyzToRgb(labToXyz(lchToLab(p)));
  }
  function labToXyz(p) {
    
    p.y = (p.cieLstar + 16) / 116;
    p.x = p.cieAstar / 500 + p.y;
    p.z = p.y - p.cieBstar / 200;
    
    p.x = labxyzCorrection(p.x) * ECOMPARECOLOR.whiteX;
    p.y = labxyzCorrection(p.y) * ECOMPARECOLOR.whiteY;
    p.z = labxyzCorrection(p.z) * ECOMPARECOLOR.whiteZ;
    return p;
  }
  
  
  function xyzrgbCorrection(x) {
    if (x > 0.0031308) 
      return 1.055 * (Math.pow(x , (1 / 2.4))) - 0.055;
    else
      return 12.92 * x;
    
  }
  function xyzToRgb(p) {
    
    var x = p.x / 100, y = p.y / 100 ,z = p.z / 100;
    
    var x1 = x * 0.8951 + y * 0.2664 + z * -0.1614;
    var y1 = x * -0.7502 + y * 1.7135 + z * 0.0367;
    var z1 = x * 0.0389 + y * -0.0685 + z * 1.0296;
    
    var x2 = x1 * 0.98699 + y1 * -0.14705 + z1 * 0.15997;
    var y2 = x1 * 0.43231 + y1 * 0.51836 + z1 * 0.04929;
    var z2 = x1 * -0.00853 + y1 * 0.04004 + z1 * 0.96849;
    
    r = xyzrgbCorrection(x2 * 3.240479 + y2 * -1.53715 + z2 * -0.498535);
    g = xyzrgbCorrection(x2 * -0.969256 + y2 * 1.875992 + z2 * 0.041556);
    b = xyzrgbCorrection(x2 * 0.055648 + y2 * -0.204043 + z2 * 1.057311);
    
    var c = RGB(Math.min(255, Math.max(0, CLng(r * 255))), 
                Math.min(255, Math.max(0, CLng(g * 255))), 
                Math.min(255, Math.max(0, CLng(b * 255))));
    
    return c;
  }
  
  function rgbToLch(rgbColor) {
    //convert from cieL*a*b* to cieL*CH
    //adapted from http://www.brucelindbloom.com/index.Html?Equations.Html
    
    var p = rgbToLab(rgbColor);
    if (rgbColor == 0 )
      p.hStar = 0 ;
    else {
      p.hStar =Atan2(p.cieAstar, p.cieBstar);
      if (p.hStar > 0) 
        p.hStar = fromRadians(p.hStar);
      else
        p.hStar = 360 - fromRadians(Math.abs(p.hStar));
      
    }
    p.cieCstar = Math.sqrt(p.cieAstar * p.cieAstar + p.cieBstar * p.cieBstar);
    return p;
  }

  /**
  * convert degrees to Radians
  * @param {number} deg degrees to convert
  * @return {number} eqivalent radians
  */
  function toRadians(deg) {
    return Math.PI / 180 * deg;
  }
  /**
  * convert  Radians to degrees
  * @param {number} rad radians to convert
  * @return {number} eqivalent degrees
  */
  function fromRadians(rad) {
    return 180/Math.PI * rad;
  }
  
  function trim (s) {
    return s.toString().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }

  function Atan2(x,y) {
    // args other way round than VBA
      return Math.atan2(y, x);
  }
  
  function fixOptional ( a ,def ) {
    return typeof a === typeof undefined ? def : a;
  }
}


