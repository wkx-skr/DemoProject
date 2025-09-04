import $ from 'jquery'

// 拖拽逻辑: 底部元素高度固定, 顶部元素 bottom 属性固定,
// 拖拽过程中, 底部元素改变 height 属性, 顶部元素改变 bottom 属性
// TODO 通过配置项设置 顶部/底部 元素高度固定
// TODO 事件绑定, 解绑方式调整: body 绑定,解绑 mousemove, middleDom

class ResizeVertical {
  constructor (params = {
    outerDom: null,
    topDom: null,
    bottomDom: null,
    middleDom: null,
    topMinSize: 50,
    bottomMinSize: 50,
    // bottomPadding: 0, // 底部元素距离容器底部的距离, 初始化时固定
    // 拖拽过程中触发事件
    onDragEvent: function () {
    },
    // 拖拽结束事件
    callback: function () {
    },
  }) {
    if (!params || !params.outerDom) {
      return new Error('ResizeVertical 参数传入错误')
    }
    this.topDom = $(params.topDom)
    this.bottomDom = $(params.bottomDom)
    this.middleDom = $(params.middleDom)
    this.outerDom = $(params.outerDom)
    
    this.topMinSize = params.topMinSize
    this.bottomMinSize = params.bottomMinSize
    
    this.onDragEvent = params.onDragEvent
    this.callback = params.callback
    
    this.drag = {
      start: 0,
      startTime: 0,
      mousedown: false,
      end: 0,
      offset: 0,
      bottomOffset: 0, // 底部元素 与 页面底部的距离, 开始拖拽时确定
      topOffset: 0, // 顶部元素与 页面顶部的距离
      middleOffset: 0 // middle 元素 与 drag 起点的偏移
    }
    
    this.middleDom.bind('mousedown', (e) => {
      this.handleDrag(e)
    })
    
  }
  
  start () {
  
  }
  
  destory () {
    this.middleDom.unbind('mousedown')
  }
  
  handleDrag (e) {
    $('body').addClass('no-text-select')
    const slef = this
    
    function handleDragEnd (e) {
      slef.handleDragEnd(e)
    }
    
    $('body').one('mouseup', handleDragEnd)
    $('body').bind('mousemove', e => this.onDrag(e))
    
    // 底部 dom 与页面底部距离
    this.drag.bottomOffset = (document.body.clientHeight - e.clientY) - parseInt(this.bottomDom.css('height'))
    
    let topBottom = this.topDom.css('bottom')
    topBottom = parseInt(topBottom)
    // 顶部 dom 与页面顶部距离
    this.drag.topOffset = (document.body.clientHeight - e.clientY) - topBottom
    this.drag.middleOffset = (document.body.clientHeight - e.clientY) - parseInt(this.middleDom.css('bottom'))
    
    // // 容器高度
    // let outerHeight = $(this.outerDom).css('height')
    // outerHeight = parseInt(outerHeight)
    // if (isNaN(outerHeight)) {
    //   outerHeight = 0
    // }
    //
    this.bottomMaxSize = document.body.clientHeight - this.drag.topOffset - this.drag.bottomOffset - this.topMinSize
    
    // 容器高度较小, 底部高度固定为最小高度
    if (this.bottomMaxSize < this.bottomMinSize) {
      this.bottomMaxSize = this.bottomMinSize
    }
    this.drag.mousedown = true
  }
  
  onDrag (e) {
    if (this.drag.mousedown) {
      this.resetColStyle(e)
      this.onDragEvent && this.onDragEvent(e)
    }
  }
  
  handleDragEnd (e) {
    if (this.callback && this.drag.mousedown) {
      this.callback(e)
    }
    this.drag.mousedown = false
    $('body').unbind('mousemove')
    $('body').removeClass('no-text-select')
  }
  
  resetColStyle (e) {
    let y = e.clientY
    if (y !== null) {
      let topBottom = 0 // 顶部dom bottom 值
      let middleBottom = 0
      let bottomHeight = 0
      
      bottomHeight = (document.body.clientHeight - e.clientY) - this.drag.bottomOffset
      middleBottom = (document.body.clientHeight - e.clientY) - this.drag.middleOffset
      topBottom = (document.body.clientHeight - e.clientY) - this.drag.middleOffset
      
      let offset = 0
      if (bottomHeight < this.bottomMinSize) {
        offset = this.bottomMinSize - bottomHeight
      } else if (bottomHeight > this.bottomMaxSize) {
        offset = this.bottomMaxSize - bottomHeight
      }
      
      bottomHeight = bottomHeight + offset
      middleBottom = middleBottom + offset
      topBottom = topBottom + offset
      
      this.topDom.css('bottom', topBottom + 'px')
      this.middleDom.css('bottom', middleBottom + 'px')
      this.bottomDom.css('height', bottomHeight + 'px')
    }
  }
}

export default ResizeVertical
