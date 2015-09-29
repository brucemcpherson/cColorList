

var ColorList = (function(colorList) {
  
  'use strict';
  var list_ = knownPalettes();
             
  /**
  * get the list for a palette
  * @param {string} paletteName the name of the palette (eg Google)
  * @return {object] result object
  */
  colorList.getList = function (paletteName) {
    return list_[paletteName];
  };
  
  /**
  * get the known palettes
  * @return {[string]} result object
  */
  colorList.getPalettes = function () {
    return Object.keys(list_);
  };
  
 /**
  * find the nearest match
  * @param {string} colorCode the value of the color to find the nearest match to
  * @param {string} paletteName the name of the palette (eg Google)
  * @return {object] result object
  */
  colorList.getClosest = function (paletteName, colorCode) {

    // get the list for this paletter
    var list = colorList.getList(paletteName) ;
    if (!list) throw 'palette ' + paletteName + '  not found';
    
    // get a color math object for the target
    var props1 = colorList.getProps (colorCode);
    
    // compare with the other list
    return Object.keys(list).reduce (function(p,c) {
      var diff = props1.compareColorProps (colorList.getProps (list[c].value).getProperties());
      if (typeof p === typeof undefined || diff < p.diff) {
        p = {diff:diff, member:list[c]};
      }
      return p;
    },undefined);
    
  };
  

  /**
  * get color properties for a given palette and color name combination
  * @param {string} colorName the name of the color
  * @param {string} paletteName the name of the palette (eg Google)
  * @return {object] result object
  */
  colorList.getColor = function (paletteName, colorName) {
    return getColor_ (list_, text);
  };
  
  /**
  * get color name for a given palette and color code
  * @param {string|number} colorCode the rgb number or hex code of the the color
  * @param {string} paletteName the name of the palette to search (eg Google)
  * @return {object} result object
  */
  colorList.getColorName = function (paletteName, colorCode) {
    
    var result, cob = new cColorMath.ColorMath(colorCode).getProperties(), cx = cob.htmlHex.toLowerCase();
    
    // find the matching color by code.
    Object.keys(list_[paletteName] || {}).some(function(d) {
      if (cx ===  list_[paletteName][d].value) {
        result = list_[paletteName][d];
      }
      return result;
    });
    return getColor_ (paletteName, result ? result.name : '');
  };
  
  /**
  * get color properties for a given palette and color name combination
  * @param {string} colorName the name of the color
  * @param {string} paletteName the name of the palette (eg Google)
  * @return {object} result object
  */
  colorList.getColor = function (paletteName, colorName) {
    return getColor_ (paletteName, colorName);
  };
  
  /**
  * get color props for a color code
  * @param {string|number} colorCode the rgb number or hex code of the the color
  * @return {object] result object
  */
  colorList.getProps = function (colorCode) {
    return new cColorMath.ColorMath(colorCode);
  };
  
  /**
  * @param {string} colorName the name of the color
  * @param {string} paletteName the name of the palette (eg Google)
  * @return {object] result object
  */
  function getColor_ (paletteName, colorName) {
    
    //normalize
    var t = colorName.toLowerCase().replace(/\s/gmi,'').replace(/grey/gmi,"gray");
    var p = paletteName.toLowerCase().replace(/\s/gmi,'');
    
    // check it's known
    if(list_[p]) {
      var status = list_[p][t] ? 'ok' :'no such color';
    }
    else {
      var status = 'no such palette';
    }
    
    // the result
    return {
      name:status === 'ok' ? list_[p][t].name : colorName,
      value:status === 'ok' ? list_[p][t].value : '',
      palette:paletteName,
      status:status,
      properties:status === 'ok' ?  new cColorMath.ColorMath(list_[p][t].value).getProperties() :null
    };
  }
  return colorList;
  
})(ColorList || {});

