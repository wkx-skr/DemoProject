import $ from 'jquery'

// minWith : {leftMinWidth, rightMinWidth}
class ResizeHorizontal {
  constructor (
    leftDom = {
      outerDom: null,
      leftDom: null,
      rightDom: null,
      middleDom: null,
      leftMinSize: 50,
      leftMaxSize: Number.MAX_VALUE,
      rightMinSize: 50,
      // 拖拽过程中触发事件
      onDragEvent: function () {
      },
      // 拖拽结束事件
      callback: function () {
      },
    },
    rightDom,
    middleDom = $('.resize-column-middle'),
    outerDom = $('#main-content'),
    leftPaddingCor = 0,
    callback,
    minWith,
    noCrack,
    restrictionOffsetLeft= 240, // 拖拽时左边值的限制
    restrictionOffsetRight= 290,// 拖拽时右边值的限制
    leftMaxSize = 640, // 拖拽时左边最大值
    rightMaxSize// 拖拽时右边最大值
  ) {
    this.leftMinWidth = 0
    this.rightMinWidth = 0
    if (leftDom.leftDom) {
      this.leftDom = $(leftDom.leftDom)
      this.rightDom = $(leftDom.rightDom)
      this.middleDom = $(leftDom.middleDom)
      this.outerDom = $(leftDom.outerDom) || $('#main-content')
      this.noCrack = leftDom.noCrack
      this.callback = leftDom.callback
      this.onDragEvent = leftDom.onDragEvent
      this.minWith = leftDom.minWith || 0
      this.leftPaddingCor = leftDom.leftPaddingCor
      this.leftMinWidth = leftDom.leftMinSize || 0
      this.leftMaxSize = leftDom.leftMaxSize || 640
      this.rightMinWidth = leftDom.rightMinSize || 0
    } else {
      this.leftDom = $(leftDom)
      this.rightDom = $(rightDom)
      this.middleDom = $(middleDom)
      this.outerDom = $(outerDom)
      this.minWith = minWith || 0
      this.callback = callback
      this.leftMaxSize = leftMaxSize
      this.rightMaxSize = rightMaxSize
      this.restrictionOffsetLeft = restrictionOffsetLeft
      this.restrictionOffsetRight = restrictionOffsetRight
      // 是否取消自动生成中间拖拽dom的宽度,
      // 默认是false, 会自动生成中间dom宽度
      this.noCrack = noCrack
    }

    // this.middleDom.css('border', '1px solid red')

    this.leftOffset = parseInt(this.leftDom.css('width'))
    if (isNaN(leftPaddingCor - 0)) {
      leftPaddingCor = 0
    }
    this.leftPadding = Number.parseInt(this.leftDom.css('left')) + leftPaddingCor
    this.drag = {
      start: 0,
      startTime: 0,
      mousedown: false,
      end: 0,
      offset: 0,
      windowOffset: 0
    }
    this.outerDom.unbind('mouseup')
    this.outerDom.bind('mouseup', (e) => {
      this.handleDragEnd(e)
      this.callback && this.callback(e)
    })
    $(document).bind('mouseup', (e) => {
      this.handleDragEnd(e)
      this.callback && this.callback(e)
    })
    this.middleDom.on('mousedown', e => {
      this.handleDrag(e)
      this.callback && this.callback(e)
      this.outerDom.on('mousemove', e => {
        this.drag.mousedown && this.onDrag(e)
      })
    })


    if (!isNaN(parseInt(this.leftMinWidth))) {
      this.leftMinWidth = parseInt(this.leftMinWidth)
    }
    // TODO right min width
    if (!isNaN(parseInt(this.rightMinWidth))) {
      this.rightMinWidth = parseInt(this.rightMinWidth)
    }
    let conMinWith = 0
    if (this.leftMinWidth && !isNaN(parseInt(this.leftMinWidth))) {
      conMinWith += parseInt(this.leftMinWidth)
    }
    if (this.rightMinWidth && !isNaN(parseInt(this.rightMinWidth))) {
      conMinWith += parseInt(this.rightMinWidth)
    }
    if (conMinWith) {
      this.outerDom.css('minWidth', conMinWith + 'px')
    }
  }

  start () {
  }

  resetResizeConfig(para = {}) {
    this.leftMaxSize = para.leftMaxSize
  }
  handleDrag (e) {
    this.drag.windowOffset = e.clientX - this.leftOffset
    this.drag.mousedown = true
    $(document).on('selectstart', false)
  }

  onDrag (e) {
    if (this.drag.mousedown) {
      this.resetColStyle(e)
      this.onDragEvent && this.onDragEvent(e)
    }
  }

  handleDragEnd () {
    this.drag.mousedown = false
    $(document).off('selectstart', false)
  }

  resetColStyle (e) {
    const x = e.clientX
    if (x === null) {
    } else {
      let leftOffset = this.drag.windowOffset
      leftOffset = this.leftMinWidth > x - leftOffset ?
        this.leftMinWidth :
        x - leftOffset
      // 有右侧拖拽最大限制时
      if(this.rightMaxSize) {
      } else {
        leftOffset = leftOffset > this.leftMaxSize ? this.leftMaxSize : leftOffset
      }
      // 1651(大)   1259(小)
      let min
      if (leftOffset < this.restrictionOffsetLeft && !this.rightMaxSize) {
        min = this.restrictionOffsetLeft
      } else if ($(document).width() - leftOffset < this.restrictionOffsetRight) {
        min = $(document).width() - this.restrictionOffsetRight
      } else if ($(document).width() - leftOffset > this.rightMaxSize && this.rightMaxSize) {
        min = $(document).width() - this.rightMaxSize
      } else {
        min = leftOffset
      }
      this.rightDom.css('left', min + this.leftPadding)
      this.leftDom.css('width', min)
      this.middleDom.css('left', min + this.leftPadding - 5)
      this.leftOffset = parseInt(this.leftDom.css('width'))
    }
  }
}

export default ResizeHorizontal
