// let download = (url, para = {}) => {
//   let options = para.options;
//   let failureCallback = para.failureCallback;
//   if (para.http) {
//     let startAxiosCallback = para.startAxiosCallback;
//     startAxiosCallback && startAxiosCallback();
//     para.http({
//       url:url,
//       method:para.method ? para.method:'GET',
//       responseType:'blob',
//       data:para.requestBody,
//       onDownloadProgress: para.onDownloadProgress,
//     }).then((response) => {
//       let finishCallback = para.finishCallback;
//       finishCallback && finishCallback(para);
//       const newUrl = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = newUrl;
//       let fileName = 'export.xlsx';
//       if (response.headers['content-disposition']) {
//         let arr = response.headers['content-disposition'].split(';');
//         arr.forEach(item => {
//           if (item.indexOf('filename') !== -1) {
//             let nameArr = item.split('=');
//             if (nameArr.length >1) {
//               fileName = nameArr[1];
//               while(fileName.indexOf('"') !== -1) {
//                 fileName = fileName.replace('"', '');
//               }
//               fileName = fileName.replace('"', '');
//               fileName = decodeURIComponent(fileName);
//             }
//           }
//         })
//       } else {
//         let str = url.split('?')[0];
//         let arr = str.split(`/`);
//         fileName = arr[arr.length-1];
//       }
//       if(para.progressObj && !para.progressObj.fileName){
//         para.progressObj.fileName = fileName;
//       }
//       link.setAttribute('download', fileName);
//       document.body.appendChild(link);
//       link.click();
//     })
//     .catch(e=>{
//       // console.log(e, 'e')
//       // window.thise = e;
//       failureCallback && failureCallback(e);
//
//     })
//   } else if (!isIE() && fetch) {
//     fetch(url, options)
//     .then(res => {
//       if (res.status === 200) {
//         var a = document.createElement('a');
//         var url = res.url;
//         a.href = url;
//         a.click();
//       } else {
//         failureCallback && failureCallback(res);
//       }
//     })
//     .catch(e => {
//       console.log(e);
//     })
//   }  else {
//     // window.location.href = url;
//
//     let downloadable = false;
//     let haddownload = false;
//
//     let xmlhttp=null;//声明一个变量，用来实例化XMLHttpRequest对象
//     if (window.XMLHttpRequest){
//       xmlhttp=new XMLHttpRequest();// 新版本的浏览器可以直接创建XMLHttpRequest对象
//     } else if (window.ActiveXObject){
//       xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");// IE5或IE6没有XMLHttpRequest对象，而是用的ActiveXObject对象
//     }
//     if(xmlhttp) {
//       xmlhttp.onreadystatechange=state_Change;//指定响应函数为state_Change
//       xmlhttp.open("GET",url,true);//指定请求，这里要访问在/example/xdom路径下的note.xml文件，true代表的使用的是异步请求
//       xmlhttp.send(null);//发送请求
//     } else {
//       window.location.href = url;
//     }
//
//     //创建具体的响应函数state_Change
//     function state_Change() {
//       if (xmlhttp.readyState>1 && xmlhttp.status) {
//         if (xmlhttp.status==200) {
//           downloadable = true;
//           downloadFileOnce();
//           xmlhttp.abort();
//         } else{
//           failureCallback && failureCallback(xmlhttp);
//         }
//       }
//     }
//     function downloadFileOnce() {
//       if (downloadable && !haddownload) {
//         window.location.href = url;
//         haddownload = true;
//       }
//     }
//   }
// }
//
// export default {
//   download
// }
//
// function isIE() { //ie?
//   if (!!window.ActiveXObject || "ActiveXObject" in window){
//     return true;
//   }
//   else {
//     return false;
//   }
// }
const download = (url, para = {}) => {
  const options = para.options
  const failureCallback = para.failureCallback
  //
  /* if (para.http) {
    let startAxiosCallback = para.startAxiosCallback;
    startAxiosCallback && startAxiosCallback();
    para.http({
      url:url,
      method:para.method ? para.method:'GET',
      responseType:'blob',
      data:para.requestBody,
      onDownloadProgress: para.onDownloadProgress,
    }).then((response) => {
      let finishCallback = para.finishCallback;
      finishCallback && finishCallback(para);
      const newUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = newUrl;
      let fileName = 'export.xlsx';
      if (response.headers['content-disposition']) {
        let arr = response.headers['content-disposition'].split(';');
        arr.forEach(item => {
          if (item.indexOf('filename') !== -1) {
            let nameArr = item.split('=');
            if (nameArr.length >1) {
              fileName = nameArr[1];
              while(fileName.indexOf('"') !== -1) {
                fileName = fileName.replace('"', '');
              }
              fileName = fileName.replace('"', '');
              fileName = decodeURIComponent(fileName);
            }
          }
        })
      } else {
        let str = url.split('?')[0];
        let arr = str.split(`/`);
        fileName = arr[arr.length-1];
      }
      if(para.progressObj && !para.progressObj.fileName){
        para.progressObj.fileName = fileName;
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    })
    .catch(e=>{
      //
      // window.thise = e;
      failureCallback && failureCallback(e);

    })
  } else if (!isIE() && fetch) {
    fetch(url, options)
    .then(res => {
      if (res.status === 200) {
        var a = document.createElement('a');
        var url = res.url;
        a.href = url;
        a.click();
      } else {
        failureCallback && failureCallback(res);
      }
    })
    .catch(e => {

    })
  }  else */ {
    // window.location.href = url;

    const downloadable = false
    const haddownload = false

    let xmlhttp = null // 声明一个变量，用来实例化XMLHttpRequest对象
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest() // 新版本的浏览器可以直接创建XMLHttpRequest对象
    } else if (window.ActiveXObject) {
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP') // IE5或IE6没有XMLHttpRequest对象，而是用的ActiveXObject对象
    }
    if (xmlhttp) {
      para.startAxiosCallback()
      if (typeof url !== 'string') {
        xmlhttp.open('GET', url.url, true)
      } else {
        xmlhttp.open('GET', url, true)
      }
      xmlhttp.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded'
      )
      let tenantId = localStorage.getItem('tenantId')
      if (tenantId) {
        xmlhttp.setRequestHeader(
          'x-tenant-id',
          tenantId
        )
      }
      xmlhttp.responseType = 'blob'
      xmlhttp.onprogress = function (event) {
        if (event.lengthComputable) {
          para.onDownloadProgress(event)
        }
      }
      function fileNameFromHeader(disposition) {
        if (typeof url === 'object') {
          para.progressObj.fileName = url.fileName.toString()
          return url.fileName.toString()
        }
        let result = null
        if (disposition && /filename=.*/gi.test(disposition)) {
          result = disposition.match(/filename=.*/gi)
          para.progressObj.fileName = decodeURI(
            result[0].split('=')[1]
          ).replace(/"/g, '')
          console.log(para.progressObj.fileName)
          return para.progressObj.fileName
        } else {
          return '未命名.xlsx'
        }
      }

      xmlhttp.onload = function (oEvent) {
        if (xmlhttp.readyState === 4 && [200, 201].includes(xmlhttp.status)) {
          const blob = new Blob([xmlhttp.response])
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // for ie
            window.navigator.msSaveOrOpenBlob(
              blob,
              fileNameFromHeader(
                xmlhttp.getResponseHeader('Content-Disposition')
              )
            )
            para.finishCallback()
          } else {
            const csvUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = csvUrl
            link.download = fileNameFromHeader(
              xmlhttp.getResponseHeader('Content-Disposition')
            )
            link.click()
            para.finishCallback()
          }
        } else {
          failureCallback && failureCallback(xmlhttp)
        }
      }
      xmlhttp.send()
    } else {
      window.location.href = url
    }
  }
}

export default {
  download,
}

function isIE() {
  // ie?
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    return true
  } else {
    return false
  }
}
