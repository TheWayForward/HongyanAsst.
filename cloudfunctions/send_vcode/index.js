const cloud = require('wx-server-sdk')
const Core = require("@alicloud/pop-core");

cloud.init();

exports.main = async (event, context) => {

  var client = new Core({
    accessKeyId: 'LTAI4GAMBjxECugoykMvRVyc',
    accessKeySecret: 'ePnKpmyLTyp1UvvEbIkCwFXcXjCbVj',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });
  var vcode = `{"code":"${event.vcode}"}`
  var vcode_params = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": event.my_phonenumber,
    "SignName": "北邮鸿雁车协",
    "TemplateCode": "SMS_209815001",
    "TemplateParam": vcode
  };
  var method = {
    method: 'POST'
  };
  var res = await client.request('SendSms', vcode_params, method).then((result) => {
    console.log(JSON.stringify(result));
    return {
      code: "succeed",
      result: result
    }
  }, (ex) => {
    return {
      code: "fail",
      result: ex
    }
  })
  return res;
}