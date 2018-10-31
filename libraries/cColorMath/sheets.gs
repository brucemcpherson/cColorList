/**
 * given an array of hex rgb colors, sort the sheet they came from 
 * @param {*[]) colors the colors to sort on
 * @param {object} options things to direct the sort { sortBy : any colorprop.. default hsHue  } 
 * @return {object[]} an array of ranking.indexes showing the order
 */
 
function sortSheetByColor(columnRange, sortBy , ascending) {
  
  var sh = columnRange.getSheet();
  
  // get the colors of the sort column and sort them
  var rank  = getColorRankings ( columnRange.getBackgrounds(), {
    sortBy:sortBy
  }) ;
 
  // rearrange
  if (rank.length) {
    // add an extra column with the ranks
    sh.getRange(columnRange.getRowIndex(), sh.getLastColumn()+1, rank.length, 1).setValues(rank);
    
    // sort on it ascending
    sh.getRange(columnRange.getRowIndex(), 1, rank.length, sh.getLastColumn() ).sort({column: sh.getLastColumn(), ascending: ascending});
    
    // get rid of it
    sh.deleteColumn(sh.getLastColumn());
    
  }
  
  // sheet should now be sorted by color
}
