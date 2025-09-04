function getParaName(url) {
  if (!url || url.indexOf('?') === -1) {
    return {}
  }
  let paraname = url.split('?')[1]
  return setObject(paraname) // 封装成对象
}

function setObject(paraArr) {
  let obj = {}
  let arr1 = paraArr.split('&')
  arr1.forEach(item => {
    let str = item.split('=')
    let key = str[0]
    let val = str[1]
    obj[key] = val
  })
  return obj
}

// let url = 'www.baidu.com?b=1&c=2&d=3'
// console.log(getParaName(url)) // {b: "1", c: "2", d: "3"}

export default getParaName
