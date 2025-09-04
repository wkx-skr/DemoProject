// minWith : {leftMinWidth, rightMinWidth, leftMaxWidth}
class ResizeHorizontal {
  constructor(
    leftDom,
    rightDom,
    middleDom = $('.resize-column-middle'),
    outerDom = $('#main-content'),
    leftPaddingCor = 0,
    callback,
    minWith,
    noCrack
  ) {
    if (leftDom.leftDom) {
      this.leftDom = leftDom.leftDom
      this.rightDom = leftDom.rightDom
      this.middleDom = leftDom.middleDom
      //      this.outerDom = leftDom.outerDom;
      this.outerDom = leftDom.outerDom || $('#main-content')
      this.noCrack = leftDom.noCrack
      this.callback = leftDom.callback
      minWith = leftDom.minWith || {}
      this.leftPaddingCor = leftDom.leftPaddingCor
    } else {
      this.leftDom = leftDom
      this.rightDom = rightDom
      this.middleDom = middleDom
      this.outerDom = outerDom
      minWith = minWith || {}

      // 是否取消自动生成中间拖拽dom的宽度,
      // 默认是false, 会自动生成中间dom宽度
      this.noCrack = noCrack
    }

    $(this.rightDom).after($(this.middleDom))

    this.leftOffset = parseInt(this.leftDom.css('width'))
    if (isNaN(leftPaddingCor - 0)) {
      leftPaddingCor = 0
    }
    this.leftPadding =
      Number.parseInt(this.leftDom.css('left')) + leftPaddingCor
    this.drag = {
      start: 0,
      startTime: 0,
      mousedown: false,
      end: 0,
      offset: 0,
      windowOffset: 0,
    }
    this.outerDom.unbind('mouseup')
    this.outerDom.bind('mouseup', () => {
      this.handleDragEnd()
      if (callback) {
        callback()
      }
    })
    this.outerDom.bind('mouseleave', () => {
      this.handleDragEnd()
      if (callback) {
        callback()
      }
    })
    this.middleDom.on('mousedown', e => {
      this.handleDrag(e)
      // return false
    })
    this.outerDom.on('mousemove', e => {
      // e.preventDefault()
      if (e.which === 1) {
        this.onDrag(e)
      }
      // return false
    })
    this.outerDom.on('mouseup', () => {
      this.handleDragEnd()
      if (callback) {
        callback()
      }
    })
    this.outerDom.on('mouseleave', () => {
      this.handleDragEnd()
      if (callback) {
        callback()
      }
    })
    let leftMaxWidth
    if (minWith.leftMaxWidth) {
      leftMaxWidth = minWith.leftMaxWidth
    } else {
      leftMaxWidth =
        parseFloat(this.leftDom.css('width')) +
        parseFloat(this.rightDom.css('width'))
    }
    this.leftMinWidth = minWith.leftMinWidth || 240
    this.leftMaxWidth = leftMaxWidth
    this.rightMinWidth = minWith.rightMinWidth || 0
    if (!isNaN(parseInt(this.leftMinWidth))) {
      this.leftMinWidth = parseInt(this.leftMinWidth)
    }
    if (!isNaN(parseInt(this.rightMinWidth))) {
      this.rightMinWidth = parseInt(this.rightMinWidth)
    }
    if (!isNaN(parseInt(this.leftMaxWidth))) {
      this.leftMaxWidth = parseInt(this.leftMaxWidth)
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

  start() {}

  handleDrag(e) {
    this.drag.windowOffset = e.clientX - this.leftOffset
    this.drag.mousedown = true
    $(document).on('selectstart', false)
  }

  onDrag(e) {
    if (this.drag.mousedown) {
      this.resetColStyle(e)
    }
  }

  handleDragEnd() {
    this.drag.mousedown = false
    $(document).off('selectstart', false)
  }

  resetColStyle(e) {
    const x = e.clientX
    if (x === null) {
      //      this.rightDom.css('left',y +30);
      //      this.leftDom.css('width',y);
      //      this.middleDom.css('left',y + 20);
    } else {
      //      if(Number.parseInt(this.rightDom.css('width')) >= 100 && Number.parseInt(this.leftDom.css('width'))>=100){
      const dragW = x - this.drag.windowOffset
      let leftLimit
      if (dragW < this.leftMinWidth) {
        leftLimit = this.leftMinWidth
      } else if (dragW > this.leftMaxWidth) {
        leftLimit = this.leftMaxWidth
      } else {
        leftLimit = x - this.drag.windowOffset
      }
      if (this.noCrack) {
        this.rightDom.css('left', leftLimit + this.leftPadding)
        this.leftDom.css('width', leftLimit)
        this.middleDom.css('left', leftLimit + this.leftPadding - 1)
        this.leftOffset = parseInt(this.leftDom.css('width'))
      } else {
        this.rightDom.css('left', leftLimit + this.leftPadding + 10)
        this.leftDom.css('width', leftLimit)
        this.middleDom.css('left', leftLimit + this.leftPadding)
        this.leftOffset = parseInt(this.leftDom.css('width'))
      }
      if (this.callback) {
        this.callback()
      }
      // if(this.leftMinWidth && (x - this.drag.windowOffset)<this.leftMinWidth) {
      //   this.middleDom.css('left',this.leftMinWidth);
      //   if(this.noCrack) {
      //     this.middleDom.css('left',x - this.drag.windowOffset + this.leftPadding-1);
      //   }
      //   this.leftOffset = parseInt(this.leftDom.css('width'));
      // }
      // if(this.leftMinWidth && (x - this.drag.windowOffset)<this.leftMinWidth) {
      //   this.middleDom.css('left',this.leftMinWidth);
      // }

      //      }else if(Number.parseInt(this.rightDom.css('width')) < 100){
    }
  }
}
export default ResizeHorizontal
