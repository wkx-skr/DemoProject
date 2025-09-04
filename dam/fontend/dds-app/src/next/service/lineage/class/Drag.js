const Current = {
  isDragging: false,
  layerX: 0,
  layerY: 0,
  box: null,
  vueThis: null,
  isAbsorb: 10,
}
class Drag {
  static handleDrag(e, vueThis) {
    Current.vueThis = vueThis
    const { layerX, layerY, offsetX, offsetY } = e
    const parent = $($(e.target).parents('.shape')[0])
    // if (!Current.box) {
    Current.box = $(parent).parents('#consa-graph')
    // }
    const left = parseInt(parent.css('left'))
    const top = parseInt(parent.css('top'))
    const width = parseInt(parent.css('width'))
    const height = parseInt(parent.css('height'))
    Current.layerX = offsetX
    Current.layerY = offsetY
    Current.isDragging = true
    Drag.createRect(left, top, width, height)
  }

  static changeAbsorb(value) {
    Current.isAbsorb = value
  }

  static roundByAbsorb(number) {
    if (Current.isAbsorb) {
      let dif = Math.floor(number) % Current.isAbsorb
      if (dif <= Current.isAbsorb / 2) {
        return number - dif
      } else {
        return number + Current.isAbsorb - dif
      }
    } else {
      return number
    }
  }

  static createRect(left, top, width, height) {
    $('.drag-rect').remove()
    let scale = 1
    try {
      scale = parseFloat($('.l-6dot2')[0].style.transform.slice(6))
    } catch (e) {
      throw new Error('未定位到容器元素，scale获取失败')
    }
    Current.box.append(
      `<div class="drag-rect" style="width: ${width * scale}px;height: ${
        height * scale
      }px;display:none;"></div>`
    )
    const DOM = $('.drag-rect')
    DOM.off('mousemove')
    Current.box.off('mousemove')
    Current.box.on('mousemove', e => {
      if (e.which === 1) {
        if (Current.isDragging) {
          DOM.css({
            left:
              this.roundByAbsorb(
                e.clientX -
                  parseInt(Current.box.css('left')) +
                  Current.box.scrollLeft() -
                  Current.layerX
              ) -
              1 +
              'px',
            top:
              this.roundByAbsorb(
                e.clientY -
                  parseInt(Current.box.css('top')) +
                  Current.box.scrollTop() -
                  Current.layerY
              ) -
              1 +
              'px',
            display: 'block',
          })
        } else {
        }
      } else {
        DOM.off('mousemove')
      }
    })
    DOM.one('mouseup', e => {
      let scale = 1
      try {
        scale = parseFloat($('.l-6dot2')[0].style.transform.slice(6))
      } catch (e) {
        throw new Error('未定位到容器元素，scale获取失败')
      }
      let left =
        this.roundByAbsorb(
          e.clientX / scale -
            parseInt(Current.box.css('left')) / scale +
            Current.box.scrollLeft() / scale -
            Current.layerX / scale
        ) - 1
      let top =
        this.roundByAbsorb(
          e.clientY / scale -
            parseInt(Current.box.css('top')) / scale +
            Current.box.scrollTop() / scale -
            Current.layerY / scale
        ) - 1
      Current.vueThis.updatePosition(left, top)
      $('.drag-rect').hide()
      Current.isDragging = false
      DOM.off('mouseleave')
      Current.box.off('mousemove')
    })
    Current.box.one('mouseleave', () => {
      $('.drag-rect').hide()
      Current.isDragging = false
      DOM.off('mouseup')
      Current.box.off('mousemove')
    })
  }
}
export default Drag
