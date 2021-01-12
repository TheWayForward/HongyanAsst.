function latitude_to_canvas(latitude){
  return latitude + 0.006;
}

function longitude_to_canvas(longitude){
  return longitude + 0.0065;
}

function wgs_to_jcg(lat,log){
  //is position off China mainland
  if (log < 72.004 || log > 137.8347 || lat < 0.8293 || lat > 55.8271) 
  {
    return {
      latitude: lat,
      longitude: log,
    }
  } 
  else 
  {
    const Pi = 3.14159265358979324;
    //coordinate projection factor
    const a = 6378245.0;
    //eccentricity
    const ee = 0.00669342162296594323;
    var transformLat = function (x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * Pi) + 20.0 * Math.sin(2.0 * x * Pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * Pi) + 40.0 * Math.sin(y / 3.0 * Pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * Pi) + 320 * Math.sin(y * Pi / 30.0)) * 2.0 / 3.0;
      return ret; 
    }
    var transformLog = function (x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * Pi) + 20.0 * Math.sin(2.0 * x * Pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * Pi) + 40.0 * Math.sin(x / 3.0 * Pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * Pi) + 300.0 * Math.sin(x / 30.0 * Pi)) * 2.0 / 3.0;
      return ret; 
    }
    var delta = function (lat, lon) {
      var dLat = transformLat(lon - 105.0, lat - 35.0);
      var dLon = transformLog(lon - 105.0, lat - 35.0);
      var radLat = lat / 180.0 * Pi;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Pi);
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Pi);
      return {
        'lat': dLat, 
        'lon': dLon
      };
    }
    const d = delta(lat, log);
    return {
      latitude:  lat + d.lat,
      longitude: log + d.lon,
      }
  }
}

function get_datapoints_from_onenet(device){
  return new Promise((resolve,reject) =>{
    wx.request({
      url: `https://api.heclouds.com/devices/${device.deviceid}/datapoints?datastream_id=Latitude,Logitude,Speed&limit=1`,
      method: "GET",
      header: {
        'content-type': 'application/json',
        'api-key': device.apikey
      },
      success(res){
        resolve({
            speed: Number(res.data.data.datastreams[0].datapoints[0].value),
            longitude: Number(res.data.data.datastreams[1].datapoints[0].value),
            latitude: Number(res.data.data.datastreams[2].datapoints[0].value),
            timestamp: new Date(Date.parse(res.data.data.datastreams[0].datapoints[0].at.replace(/-/g, "/")))
        })
      },
      fail(res){
        reject({
        })
      }
    })
  })
}

module.exports = {
  latitude_to_canvas: latitude_to_canvas,
  longitude_to_canvas: longitude_to_canvas,
  wgs_to_jcg: wgs_to_jcg,
  get_datapoints_from_onenet: get_datapoints_from_onenet
}