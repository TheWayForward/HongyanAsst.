var time_helper = require("../helpers/time_helper");
var compare_helper = require("../../utils/helpers/compare_helper");

//string

function difficulty_to_stars(difficulty) {
  switch (difficulty) {
    case (1):
      return "★☆☆☆☆";
      break;
    case (2):
      return "★★☆☆☆";
      break;
    case (3):
      return "★★★☆☆";
      break;
    case (4):
      return "★★★★☆";
      break;
    case (5):
      return "★★★★★";
      break;
    default:
      return "警告：未知难度！"
      break;
  }
}

//layout

function format_user(user) {
  user.total_distance_string = user.total_distance.toFixed(2);
  user.birthday_string = time_helper.format_time(new Date(user.birthday)).date;
  user.my_event.sort(compare_helper.compare("precise_time"));
  user.my_event.reverse();
  return user;
}

function format_event(event) {
  event.date = time_helper.format_time(event.time).date;
  event.date_time = time_helper.format_time(event.time).time.slice(0, 5);
  event.precise_time = time_helper.format_time(event.time).precise_time;
  event.day = time_helper.format_time(event.time).day_to_ch();
  return event;
}

function generate_color_for_block() {
  var color = "#",
    colors = ["A", "B", "C", "D", "E", "F"];
  for (var i = 0; i < 6; i++) {
    color += colors[Math.floor(Math.random() * 6)];
  }
  return color;
}

function get_length_for_block(length) {
  return length <= 20 ? 200 : 600 * Math.floor(length / 10) / Math.sqrt(length);
}

function generate_markers(snapshots, iconpath) {
  var markers = [{}];
  for (var i = 0; i < snapshots.length; i++) {
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
  for (var i = 1; i < markers.length; i++) {
    for (var j = 1; j < markers.length; j++) {
      if (markers[j].location == markers[i].location) {
        markers[j].longitude += i * 0.0002;
        markers[j].latitude += i * 0.0002;
      }
    }
  }
  return markers;
}

function delete_location_info_for_markers(markers) {
  for (var i = 0; i < markers.length - 1; i++) {
    markers[i + 1].id--;
    markers[i] = markers[i + 1];
  }
  markers.pop();
  return markers;
}

function attach_location_info_to_markers(location_info, device, markers, iconpath) {
  markers[0] = {
    id: 0,
    latitude: location_info.latitude,
    longitude: location_info.longitude,
    width: 20,
    height: 20,
    anchor: {
      x: 0.5,
      y: 0.5
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

function hilight_marker(markers, marker_id, iconpath_normal, iconpath_selected) {
  for (var i = 0; i < markers.length; i++) {
    if (!markers[i].is_snapshot) continue;
    markers[i].iconPath = iconpath_normal;
    markers[i].callout.borderColor = "#1485EF";
    //change imagepoint to red
    if (i == marker_id) {
      markers[i].iconPath = iconpath_selected;
      markers[i].callout.borderColor = "#EF2914";
    }
  }
  return markers;
}

//cloudpath

function generate_cloudpath_for_user(user, file) {
  return `user/${user.openid}/${user.nickname}_${user.openid}_${Math.random()}_${Date.now()}.${file.match(/\.(\w+)$/)[1]}`;
}

function generate_cloudpath_for_bicycle(bicycle, file) {
  return `bicycles/${bicycle._id}/${bicycle.name}_${bicycle.brand}_${Math.random()}_${Date.now()}.${file.match(/\.(\w+)$/)[1]}`;
}

function generate_cloudpath_for_snapshots(event, user, file) {
  return `events/${event.poster.split("/")[4]}/snapshots/${user.nickname}_${user.openid}_${Math.random()}_${Date.now()}.${file.match(/\.(\w+)$/)[1]}`;
}

function generate_cloudpath_for_event(name, user, file) {
  return `events/${name}_${Date.now()}/poster/${user.nickname}_${user.openid}_${Math.random()}_${Date.now()}.${file.match(/\.(\w+)$/)[1]}`;
}

function generate_cloudpath_for_article(title, user, file) {
  return `articles/${title}_${Date.now()}/thumbnail/${user.openid}_${Math.random()}_${Date.now()}.${file.match(/\.(\w+)$/)[1]}`;
}

module.exports = {
  difficulty_to_stars: difficulty_to_stars,
  format_user: format_user,
  format_event: format_event,
  generate_color_for_block: generate_color_for_block,
  get_length_for_block: get_length_for_block,
  generate_markers: generate_markers,
  attach_location_info_to_markers: attach_location_info_to_markers,
  delete_location_info_for_markers: delete_location_info_for_markers,
  hilight_marker: hilight_marker,
  generate_cloudpath_for_user: generate_cloudpath_for_user,
  generate_cloudpath_for_bicycle: generate_cloudpath_for_bicycle,
  generate_cloudpath_for_snapshots: generate_cloudpath_for_snapshots,
  generate_cloudpath_for_event: generate_cloudpath_for_event,
  generate_cloudpath_for_article: generate_cloudpath_for_article
}