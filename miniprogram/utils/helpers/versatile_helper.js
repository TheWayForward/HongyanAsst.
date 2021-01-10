var time_helper = require("../helpers/time_helper");

function difficulty_to_stars(difficulty){
  switch(difficulty){
    case(1):
      return "★☆☆☆☆";
      break;
    case(2):
      return "★★☆☆☆";
      break;
    case(3):
      return "★★★☆☆";
      break;
    case(4):
      return "★★★★☆";
      break;
    case(5):
      return "★★★★★";
      break;
    default:
      return "警告：未知难度！"
      break;
  }
}

function generate_markers(snapshots,iconpath){
  var markers = [{}];
  for(var i = 0; i < snapshots.length; i++){
    markers.push({
      id: i + 1,
      location: snapshots[i].location,
      longitude: snapshots[i].location.toJSON().coordinates[0],
      latitude: snapshots[i].location.toJSON().coordinates[1],
      openid: snapshots[i].openid,
      name: snapshots[i].name,
      time: snapshots[i].time,
      time_string: time_helper.format_time(new Date(snapshots[i].time)).date_time,
      avatar: snapshots[i].avatar,
      nickname: snapshots[i].nickname,
      realname: snapshots[i].realname,
      taker: `${snapshots[i].nickname}(${snapshots[i].realname})`,
      detail: snapshots[i].detail,
      is_snapshot: true,
      iconPath: iconpath,
      url: snapshots[i].url,
      width: 30,
      height: 30,
      callout: {
        content: snapshots[i].detail,
        bgColor: "#FFFFFF",
        padding: "5px",
        borderRadius: "5px",
        borderWidth: "1px",
        borderColor: "#1485EF",
        display: "ALWAYS",
        fontSize: "10", 
      }
    });
  }
  for(var i = 1; i < markers.length; i++){
    for(var j = 1; j < markers.length; j++){
      if(markers[j].location == markers[i].location)
      {
        markers[j].longitude += i * 0.0002;
        markers[j].latitude += i * 0.0002;
      }
    }
  }
  return markers;
}

function delete_location_info_for_markers(markers){
  for(var i = 0; i < markers.length - 1; i++){
    markers[i + 1].id--;
    markers[i] = markers[i + 1];
  }
  markers.pop();
  return markers;
}

function attach_location_info_to_markers(location_info,device,markers,iconpath){
  markers[0] = {
    id: 0,
    latitude: location_info.latitude,
    longitude: location_info.longitude,
    width: 20,
    height: 20,
    anchor: {
      x: 0.5, y: 0.5
    },
    iconPath: iconpath,
    callout: {
      content: device.name,
      bgColor: "#fff",
      padding: "5px",
      borderRadius: "5px",
      borderWidth: "1px",
      borderColor: "#1296DB",
      display: "BYCLICK",
      fontSize: "10",
    },
    is_snapshot: false
  }
  return markers;
}

function hilight_marker(markers,marker_id,iconpath_normal,iconpath_selected){
  for(var i = 0; i < markers.length; i++){
    markers[i].iconPath = iconpath_normal;
    markers[i].callout.borderColor = "#1485EF";
    //change imagepoint to red
    if(i == marker_id)
    {
      markers[i].iconPath = iconpath_selected;
      markers[i].callout.borderColor = "#EF2914";
    }
  }
  return markers;
}

function generate_cloudpath_for_snapshots(event,user,file){
  return `events/${event.poster.split("/")[4]}/snapshots/${user.nickname}_${user.openid}_${Math.random()}_${Date.now()}.${file.match(/\.(\w+)$/)[1]}`;
}

module.exports = {
  difficulty_to_stars: difficulty_to_stars,
  generate_markers: generate_markers,
  attach_location_info_to_markers: attach_location_info_to_markers,
  delete_location_info_for_markers: delete_location_info_for_markers,
  hilight_marker: hilight_marker,
  generate_cloudpath_for_snapshots: generate_cloudpath_for_snapshots
}