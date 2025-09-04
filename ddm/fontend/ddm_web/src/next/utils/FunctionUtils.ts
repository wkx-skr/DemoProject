/*
如果单步操作运行时间超过50ms，就要考虑使用数组分块技术
调用demo
const array = [1, 2, 3]
const print = item => {
  console.log(item)
}
FunctionUtils.ArrayChunking(array, false, print, 100)
 */
const ArrayChunking = (
  dataList: Array<any> | undefined | null,
  keepDataList: boolean,
  handler: Function,
  interval: number = 100,
): void | boolean => {
  if (Array.isArray(dataList)) {
    let _dataList = dataList
    if (keepDataList) {
      _dataList = _dataList.concat()
    }

    const processItem = () => {
      const item = _dataList.shift()
      handler(item)
      if (_dataList.length > 0) {
        setTimeout(() => {
          processItem()
        },interval)
      }
    }
    setTimeout(processItem)
  }
}

/*
只要是周期性调度，都应该使用函数节流。如处理resize事件。
调用demo
const onResize = function () {
  let div = $('#emo')[0]
  div.style.width = div.offsetHeight + 'px'
}
window.onresize = function () {
  FunctionUtils.FunctionThrottle(onResize, 100)
}
 */
let tId: number | undefined
const FunctionThrottle = (method: Function, interval: number = 100): void => {
  clearTimeout(tId)
  tId = setTimeout(method, interval)
}

export {ArrayChunking, FunctionThrottle}
