'use strict';

var MaterialPalette = function (primary, accent) {
  var self = this;
  var primary_ = (primary || 'Indigo').toLowerCase();
  var accent_ = (accent || 'Amber').toLowerCase();
  
  self.getName = function () {
    return 'material' + primary_ + accent_;
  };
  
  
  var gc = ColorList.getColor;
  
  // add to known palettes
  KnownPalettes.palettes[self.getName()] = {
    "dark":gc('material ' , primary_ + " 700").value,
    "light":gc('material ' ,primary_ + " 100").value,
    "primary":gc('material ' ,primary_ + " 500").value,
    "icons":gc('material ' ,"white").value,
    "accent":gc('material ' ,accent_ + (["pink","blue"].indexOf(accent_) === -1 ? " 500" : "a200")).value,   
    "primaryText":gc('material ' ,"gray 900").value,  
    "secondaryText":"#727272",
    "divider":"#B6B6B6"  
  };
  
  // update the keys.
  ColorList.reset();


}
