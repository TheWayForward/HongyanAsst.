function compare(p){
  return function(m,n){
    var a = m[p];
    var b = n[p];
    return a-b;
  }
};

function compare_version(ver1,ver2){
  ver1 = ver1.split(".");
  ver2 = ver2.split(".");
  for(var i = 0; i < 3; i++){
    ver1[i] = Number(ver1[i]);
    ver2[i] = Number(ver2[i]);
  }
  var ver1_weight = ver1[0] * 1000 + ver1[1] * 100 + ver1[2];
  var ver2_weight = ver2[0] * 1000 + ver2[1] * 100 + ver2[2];
  return ver1_weight > ver2_weight ? false : true;
}

module.exports = {
  compare: compare,
  compare_version: compare_version
}