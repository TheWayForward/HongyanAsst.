function show_toast_with_icon(notification,duration){
  wx.showToast({
    title: notification,
    duration: duration
  })
}

function show_toast_without_icon(notification,duration){
  wx.showToast({
    title: notification,
    duration: duration,
    icon: 'none'
  })
}

module.exports = {
  show_toast_with_icon: show_toast_with_icon,
  show_toast_without_icon: show_toast_without_icon
}