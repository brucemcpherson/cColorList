'use strict';


function getColorRankings (colors,options) {

  var options = options || {};
  var column = colors || [];
  options.sortBy = options.sortBy || 'hsHue';

  //the colors will probably be a 2 dim array, so convert it
  if (!column.length) return [];
  if (Array.isArray[column[0]]) {
    column = column.map (function(d) { 
      if (d.length !== 1) {
        throw 'can only sort on one column - colors array is invalid shape'
      }
      return d[0];
    });
  }
  
  //this defines a sort by next nearest color if the sortby is a hex color
  if (options.sortBy.substring(0,1) === "#") {
    var result= sortColumnByCompare ( colors, options);
  }
  else {
    var result = column.map(function (d,i) {
      // get all the color properties
      
      var p = new ColorMath (d).getProperties();
      //make sure whats being asked for exists
      if (!p.hasOwnProperty (options.sortBy)) {
        throw 'sortby property ' + options.sortBy + ' is not a known sort order';
      }
      
      return {index:i, sortValue:p[options.sortBy]};
    })
    .sort (function (a,b) {
      return a.sortValue > b.sortValue ? 1 : ( a.sortValue === b.sortValue ? 0 : -1);
    })
    .map (function (d,i) {
      // attach rank .. this will be thing used for sorting
      d.rank=i;
      return d;
    });

  }
  
  return result.sort (function(a,b) {
    // sort back into original order
    return a.index - b.index;
  })
  .map(function(d) {
    // just return the rank but as an array  ready for writing to sheet
    return [d.rank];
  });

}
function sortColumnByCompare (colors, options) {

  // this builds up an array of similar colors by finding the nearest match of the as yet unused colors
  var start = colors.map (function (d,i) {
    return {cm: new ColorMath (d) , index:i , rank:-1};
  });

  // start with the given color
  var next =  {cm: new ColorMath (options.sortBy) , index:-1 , rank:-1}; 
  var work = start;
  
  while (work.length) {
  
    // find the best match
    var match = work.reduce (function (p,c) {
      var difference = next.cm.compareColorProps (c.cm.getProperties());
      return !p || p.difference > difference ? {best:c , difference:difference } : p;
    },undefined);
    
    // record where this should be
    match.best.rank = next.rank +1;
    next = match.best;
    
    // redo what we still have to do
    work = start.filter (function(d) { return d.rank === -1 ; });
    
  }
  
  // all the ranks will have been added now
  return start;
  
}
