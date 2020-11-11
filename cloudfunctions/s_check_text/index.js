//checking comment text
const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: event.text
    })
    //illegal
    if (result && result.errCode.toString() === '87014') 
    {
      return { code: 500, msg: '内容含有违法违规内容', data: result }
    } 
    //legal
    else 
    {
      return { code: 200, msg: 'ok', data: result }
    }
  } catch (err) {
    if (err.errCode.toString() === '87014') 
    {
      return { code: 500, msg: '内容含有违法违规内容', data: err }
    }
    return { code: 502, msg: '调用security接口异常', data: err }
  }
}