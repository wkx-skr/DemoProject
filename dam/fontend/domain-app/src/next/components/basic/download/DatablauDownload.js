import Vue from 'vue'
const This = Vue.prototype
function datablauDownload(url, param, fileName) {
  This.$http
    .post(url, param, { responseType: 'arraybuffer' })
    .then(res => {
      const blob = new Blob([res.data], {
        type: 'application/msword;charset=utf-8',
      })
      const url = window.URL.createObjectURL(blob)
      const obj = {
        url: url,
        fileName: fileName
          ? fileName.includes('.')
            ? fileName
            : fileName + '.xlsx'
          : decodeURIComponent(res.headers['content-disposition']).split(
              'filename='
            )[1],
      }
      if (obj.fileName.includes('"')) {
        obj.fileName = obj.fileName.substring(1, obj.fileName.length - 1)
      }
      This.$downloadFile(obj)
    })
    .catch(e => {
      // ArrayBuffer 转 JSON
      if (e.response.data instanceof ArrayBuffer) {
        var enc = new TextDecoder('utf-8')
        var uint8_msg = new Uint8Array(e.response.data)
        const error = JSON.parse(enc.decode(uint8_msg))
        This.$showFailure(error.errorMessage)
      } else {
        This.$showFailure(e)
      }
    })
}
export { datablauDownload }
