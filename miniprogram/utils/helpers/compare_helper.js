//versatile comparison
function compare(p){
  return function(m,n){
    var a = m[p];
    var b = n[p];
    return a - b;
  }
};

//version comparison
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

//time comparison
function compare_time_for_event(event_time,now){
  var oneday = 86400000;
  if(now - event_time >= oneday) return "previous_event";
  else if(event_time - now >= oneday) return "coming_event";
  else return "current_event";
}

function compare_time_for_event_sign(event_time,now){
  var oneday = 86400000, onehour = 0.041
  if((event_time - now) / oneday < onehour) return false;
  else return true;
}

function compare_time_for_event_locate(event_time,now){
  var oneday = 86400000;
  if((event_time - now) / oneday < 1) return true;
  else return false;
}

module.exports = {
  compare: compare,
  compare_version: compare_version,
  compare_time_for_event: compare_time_for_event,
  compare_time_for_event_sign: compare_time_for_event_sign,
  compare_time_for_event_locate: compare_time_for_event_locate
}