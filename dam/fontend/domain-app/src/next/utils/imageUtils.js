const typeMap = {
  system: require('../../assets/images/lineage/system.svg'),
  report: require('../../assets/images/search/report.svg'),
}

/**
 *
 * @param url 图片路径
 * @param ext 图片格式
 * @param width 图片宽度
 * @param height 图片高度
 */
function getUrlBase64(url, ext = 'svg', width = 20, height = 20) {
  return new Promise((resolve, reject) => {
    // IE 不能转 base64
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      resolve('')
      return;
    }
    let canvas = document.createElement('canvas') // 创建canvas DOM元素
    let ctx = canvas.getContext('2d')
    let img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = url
    // console.log(img, 'img')
    // console.log(url, 'url')
    img.onload = function () {
      canvas.height = height // 指定画板的高度,自定义
      canvas.width = width // 指定画板的宽度，自定义
      ctx.drawImage(img, 0, 0, width, height) // 参数可自定义
      let dataURL = canvas.toDataURL('image/' + ext)
      // console.log(dataURL, 'dataURL')
      resolve(dataURL)
      canvas = null
    }
  })
}

export default {
  getUrlBase64,
}
