/**
 * becoming a little defunct
 * but here for backwards compat
 */
function getLibraryInfo () {

  return { 
    info: {
      name:'cColorMath',
      version:'0.0.1',
      key:'MzllA1YhWnRFoatLOx-2TOKi_d-phDA33',
      description:'color maths and sorting sheets',
      share:'https://script.google.com/d/18af-Zy20ZRDGR27l-kkjoPuN_g4eQ63Jn1QUWxEcX_Q4lb_qfWid5VRQ/edit?usp=sharing'
    },
    dependencies:[
    ]
  }; 
}


function showMyScriptAppResource(s) {
  try {
    return ScriptApp.getResource(s);
  }
  catch (err) {
    throw err + " getting script " + s;
  }
}

