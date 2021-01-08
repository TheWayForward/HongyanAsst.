//versatile comparison
var oneday = 86400000;
var onehour = 0.041;

function compare(p){
  return function(m,n){
    return m[p] - n[p];
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
  return now - event_time >= oneday ? "previous_event" : (event_time - now >= oneday ? "coming_event" : "current_event");
}

function compare_time_for_event_sign(event_time,now){ onehour = 0.041
  return (event_time - now) / oneday > onehour ? true : false;
}

function compare_time_for_event_locate(event_time,now){
  return (event_time - now) / oneday < 1 ? true : false;
}

function compare_time_for_event_locate_timer(event_time,now){
  return (event_time - now) / oneday < 0.5 && (now - event_time) / oneday < 1 ? true : false;
}

function compare_location_info(location_info,location_info_past){
  var delta_latitude = Math.abs(location_info.latitude - location_info_past.latitude);
  var delta_longitude = Math.abs(location_info.longitude - location_info_past.longitude);
  if(delta_latitude <= 0.00001 && delta_longitude <= 0.00001) return true;
}

module.exports = {
  compare: compare,
  compare_version: compare_version,
  compare_time_for_event: compare_time_for_event,
  compare_time_for_event_sign: compare_time_for_event_sign,
  compare_time_for_event_locate: compare_time_for_event_locate,
  compare_time_for_event_locate_timer: compare_time_for_event_locate_timer,
  compare_location_info: compare_location_info
}