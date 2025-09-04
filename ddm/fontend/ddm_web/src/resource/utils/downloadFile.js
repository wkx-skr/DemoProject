let download = (url, para = {}) => {
  url = url.replace('/service/', '/')
  let options = para.options
  let failureCallback = para.failureCallback
  if (para.http) {
    let startAxiosCallback = para.startAxiosCallback
    startAxiosCallback && startAxiosCallback()
    para.http({
      url: url,
      method: para.method ? para.method : 'GET',
      responseType: 'blob',
      data: para.requestBody,
      onDownloadProgress: para.onDownloadProgress
    }).then((response) => {
      let finishCallback = para.finishCallback
      finishCallback && finishCallback(para)
      const newUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = newUrl
      let fileName = 'export.xlsx'
      if (response.headers['content-disposition']) {
        let arr = response.headers['content-disposition'].split(';')
        arr.forEach(item => {
          if (item.indexOf('filename') !== -1) {
            let nameArr = item.split('=')
            if (nameArr.length > 1) {
              fileName = nameArr[1]
              while (fileName.indexOf('"') !== -1) {
                fileName = fileName.replace('"', '')
              }
              fileName = fileName.replace('"', '')
              fileName = decodeURIComponent(fileName)
            }
          }
        })
      } else {
        let str = url.split('?')[0]
        let arr = str.split(`/`)
        fileName = arr[arr.length - 1]
      }
      if (para.progressObj && !para.progressObj.fileName) {
        para.progressObj.fileName = fileName
      }
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
    })
      .catch(e => {
      // console.log(e, 'e')
      // window.thise = e;
        failureCallback && failureCallback(e)
      })
  } else if (!isIE() && fetch) {
    fetch(url, options)
      .then(res => {
        if (res.status === 200) {
          var a = document.createElement('a')
          var url = res.url
          a.href = url
          a.click()
        } else {
          failureCallback && failureCallback(res)
        }
      })
      .catch(e => {
        console.log(e)
      })
  } else {
    // window.location.href = url;

    let downloadable = false
    let haddownload = false

    let xmlhttp = null// 声明一个变量，用来实例化XMLHttpRequest对象
    // 创建具体的响应函数state_Change

    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest()// 新版本的浏览器可以直接创建XMLHttpRequest对象
    } else if (window.ActiveXObject) {
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')// IE5或IE6没有XMLHttpRequest对象，而是用的ActiveXObject对象
    }
    if (xmlhttp) {
      xmlhttp.onreadystatechange = function stateChange () {
        if (xmlhttp.readyState > 1 && xmlhttp.status) {
          if (xmlhttp.status === 200) {
            downloadable = true
            if (downloadable && !haddownload) {
              window.location.href = url
              haddownload = true
            }
            xmlhttp.abort()
          } else {
            failureCallback && failureCallback(xmlhttp)
          }
        }
      } // 指定响应函数为state_Change
      xmlhttp.open('GET', url, true)// 指定请求，这里要访问在/example/xdom路径下的note.xml文件，true代表的使用的是异步请求
      xmlhttp.send(null)// 发送请求
    } else {
      window.location.href = url
    }

    // // 创建具体的响应函数state_Change
    // function state_Change () {
    //   if (xmlhttp.readyState > 1 && xmlhttp.status) {
    //     if (xmlhttp.status == 200) {
    //       downloadable = true
    //       downloadFileOnce()
    //       xmlhttp.abort()
    //     } else {
    //       failureCallback && failureCallback(xmlhttp)
    //     }
    //   }
    // }
    // function downloadFileOnce () {
    //   if (downloadable && !haddownload) {
    //     window.location.href = url
    //     haddownload = true
    //   }
    // }
  }
}

export default {
  download
}

function isIE () { // ie?
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    return true
  } else {
    return false
  }
}
