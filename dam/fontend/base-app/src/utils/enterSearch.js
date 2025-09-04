function addEvent(obj, type, callback) {
  if (obj.addEventListener) {
    obj.addEventListener(type, callback)
  } else {
    // IE
    obj.attachEvent('on' + type, callback)
  }
}
/**
 * 解决移除事件监听兼容性问题
 * @param {Object} obj对象
 * @param {String} type时间类型,不带'on'前缀
 * @param {Function} callback事件处理程序
 */
function removeEvent(obj, type, callback) {
  if (obj.removeEventListener) {
    // W3C内核
    obj.removeEventListener(type, callback)
  } else {
    // IE内核
    obj.detachEvent('on' + type, callback)
  }
}
export default {
  addEvent,
  removeEvent,
}
