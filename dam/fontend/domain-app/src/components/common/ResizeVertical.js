class ResizeHorizontal {
  constructor(
    leftDom,
    rightDom,
    middleDom = $('.resize-column-middle'),
    outerDom = $('#main-content'),
    leftPaddingCor = 0,
    callback
  ) {
    this.leftDom = leftDom
    this.rightDom = rightDom
    this.middleDom = middleDom
    this.outerDom = outerDom
    this.leftOffset = parseInt(this.leftDom.css('height')) - 310 // 310 is for scan model only . because right content is not load at first.
    if (isNaN(leftPaddingCor - 0)) {
      leftPaddingCor = 0
    }
    this.leftPadding = Number.parseInt(this.leftDom.css('top')) + leftPaddingCor
    this.drag = {
      start: 0,
      startTime: 0,
      mousedown: false,
      end: 0,
      offset: 0,
      windowOffset: 0,
    }
    this.outerDom.bind('mouseup', () => {
      this.handleDragEnd()
      if (callback) {
        callback()
      }
    })
    this.middleDom.on('mousedown', e => {
      this.handleDrag(e)
    })
    this.outerDom.on('mousemove', e => {
      this.onDrag(e)
    })
  }

  start() {}

  handleDrag(e) {
    //    this.leftOffset = this.leftDom.css('height');
    this.drag.windowOffset = e.clientY - this.leftOffset
    this.drag.mousedown = true
  }

  onDrag(e) {
    if (this.drag.mousedown) {
      this.resetColStyle(e)
    }
  }

  handleDragEnd() {
    this.drag.mousedown = false
  }

  resetColStyle(e) {
    const x = e.clientY
    if (x === null) {
      //      this.rightDom.css('left',y +30);
      //      this.leftDom.css('width',y);
      //      this.middleDom.css('left',y + 20);
    } else {
      //      if(Number.parseInt(this.rightDom.css('width')) >= 100 && Number.parseInt(this.leftDom.css('width'))>=100){
      this.rightDom.css('height', 'auto')
      this.rightDom.css(
        'top',
        x - this.drag.windowOffset + this.leftPadding + 10
      )
      this.leftDom.css('height', x - this.drag.windowOffset)
      //        this.rightDom.css('bottom',this.drag.windowOffset - x);
      this.middleDom.css('top', x - this.drag.windowOffset + this.leftPadding)
      this.leftOffset = parseInt(this.leftDom.css('height'))
      //      }else if(Number.parseInt(this.rightDom.css('width')) < 100){
    }
  }
}
export default ResizeHorizontal
