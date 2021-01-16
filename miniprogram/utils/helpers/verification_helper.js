function nickname_verification(nickname) {
  return nickname.length > 0 && nickname.length <= 20 ? true : false;
}

function realname_verification(realname) {
  return /^[\u4E00-\u9FA5A-Za-z]+$/.test(realname);
}

function QQ_verification(QQ) {
  return /[1-9][0-9]{4,}/.test(QQ);
}

function tel_verification(tel) {
  return /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/.test(tel);
}

function email_verification(email) {
  return /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email);
}

function vcode_verification(vcode){
  return /[0-9]{6}/.test(vcode) ? true : false;
}

function generate_vcode(){
  return ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
}

function clear_vcode(app){
  app.clear_vcode();
}

module.exports = {
  nickname_verification: nickname_verification,
  realname_verification: realname_verification,
  QQ_verification: QQ_verification,
  tel_verification: tel_verification,
  email_verification: email_verification,
  vcode_verification: vcode_verification,
  generate_vcode: generate_vcode,
  clear_vcode: clear_vcode
}