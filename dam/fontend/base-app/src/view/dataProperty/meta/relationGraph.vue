<template>
  <div
    id="relation-graph"
    style="position: relative; overflow-x: auto; overflow-y: hidden"
  >
    <canvas id="relation-canvas" width="720" height="1000"></canvas>
  </div>
</template>

<script>
export default {
  props: ['rawData', 'tableName'],
  data() {
    return {
      left: [],
      center: {
        title: 'center',
        columns: [
          {
            title: 'id',
          },
          { title: 'name' },
        ],
      },
      right: [],
      edges: [],
      columnsSet: null,
      ctx: null,
      themeName: 'light',
    }
  },
  mounted() {
    this.themeName = this.$globalData.$theme.themeName
    this.prepareData()
    this.drawShape()
    this.drawEdge()
    this.initEventListener()
    this.$bus.$on('changeGlobalTheme', this.handleThemeChange)
  },
  beforeDestroy() {
    $('#relation-graph .table').off('click')
    this.$bus.$off('changeGlobalTheme', this.handleThemeChange)
  },
  methods: {
    handleThemeChange(themeName) {
      this.themeName = themeName
      this.drawEdge()
    },
    initEventListener() {
      const self = this
      $('#relation-graph .table').on('click', function () {
        if ($(this).hasClass('center-box1')) {
          return
        }
        const dataId = $(this).attr('data-id')
        self.$bus.$emit('jumpToObject', {
          type: 'TABLE',
          object: { objectId: Number.parseInt(dataId) },
        })
      })
    },
    prepareData() {
      this.left = []
      this.columnsSet = new Set()
      this.rawData.forEach(item => {
        if (
          Array.isArray(item.relationships) &&
          item.relationships.length &&
          item.relationships[0].sourceParent
        ) {
          /* item.columnName = Object.keys(
            JSON.parse(item.relationships[0].source)
          )[0] */
          try {
            item.columnName = Object.keys(
              JSON.parse(item.relationships[0].target)
            )[0]
          } catch (err) {
            item.columnName = item.relationships[0].source
          }
          this.columnsSet.add(item.columnName)
          this.left.push(item)
        } else {
          if (
            Array.isArray(item.relationships) &&
            item.relationships.length &&
            item.relationships[0].target
          ) {
            try {
              item.columnName = Object.keys(
                JSON.parse(item.relationships[0].target)
              )[0]
            } catch (err) {
              item.columnName = item.relationships[0].target
            }
          }
          /* item.columnName = Object.keys(
            JSON.parse(item.relationships[0].target)
          )[0] */
          this.columnsSet.add(item.columnName)
          this.right.push(item)
        }
      })
    },
    drawShape() {
      const EACH_HEIGHT = 25
      const EACH_WIDTH = 240
      const Y_MAX_COUNT = Math.max(this.left.length, this.right.length)
      //        const TOTAL_HEIGHT  = Y_MAX_COUNT * (EACH_HEIGHT*2+20) + (Y_MAX_COUNT-1)*30+20;
      const TOTAL_HEIGHT =
        Y_MAX_COUNT * EACH_HEIGHT + (Y_MAX_COUNT - 1) * 30 + 20
      let [LEFT_OFFSET, RIGHT_OFFSET] = [0, 0]
      if (this.left.length < Y_MAX_COUNT) {
        LEFT_OFFSET =
          ((Y_MAX_COUNT - this.left.length) * EACH_HEIGHT) / 2 +
          (Y_MAX_COUNT - this.left.length - 1) * 25
      }
      if (this.right.length < Y_MAX_COUNT) {
        RIGHT_OFFSET =
          ((Y_MAX_COUNT - this.right.length) * EACH_HEIGHT) / 2 +
          (Y_MAX_COUNT - this.right.length - 1) * 25
        if (RIGHT_OFFSET === 12.5) {
          RIGHT_OFFSET = 22.5
        }
      }
      const centerHeight = /* EACH_HEIGHT*(1+this.columnsSet.size)+20 */ 25
      let CENTER_OFFSET = Math.max((TOTAL_HEIGHT - 30 - centerHeight) / 2, 0)
      if (TOTAL_HEIGHT - centerHeight <= 20) {
        CENTER_OFFSET = 0
      }

      let top = LEFT_OFFSET
      this.left.forEach(item => {
        $(this.$el)
          .append(`<div class="left-box table" data-id="${item.objectId}" style="width:${EACH_WIDTH}px;height:25px;top:${top}px">
            <div class="title oneline-eclipse" title="${item.physicalName}">${item.physicalName}</div>
            <div class="column">${item.columnName}</div>
            </div>`)
        top += 30 + 20
      })
      const hasLeft = this.left.length > 0
      const heightContainsColumns = EACH_HEIGHT * 2 + 20
      top = RIGHT_OFFSET
      this.right.forEach(item => {
        const left = hasLeft ? 700 : 350

        $(this.$el)
          .append(`<div class="right-box1 table" data-id="${item.objectId}" style="left:${left}px;width:${EACH_WIDTH}px;height:25px;top:${top}px;">
            <div class="title oneline-eclipse" title="${item.physicalName}">${item.physicalName}</div>
            <div class="column">${item.columnName}</div>
            </div>`)
        top += 30 + 20
      })
      const left = hasLeft ? 350 : 0
      let centerHtml = `<div class="center-box1 table" style="left:${left}px;width:${EACH_WIDTH}px;height:${centerHeight}px;top:${CENTER_OFFSET}px">
            <div class="title oneline-eclipse" title="${this.tableName}"><i class="fa fa-map-marker"></i> ${this.tableName}</div>`
      /* this.columnsSet.forEach(item=>{
          centerHtml += `<div class="column">${item}</div>`;
        }); */
      centerHtml += '</div>'
      this.$el.style.height = Math.max(TOTAL_HEIGHT, centerHeight) + 'px'
      $(this.$el)
        .find('canvas')
        .attr('height', Math.max(TOTAL_HEIGHT, centerHeight))
      $(this.$el).append(centerHtml)
    },
    drawEdge() {
      const [LEFT, CENTER, RIGHT] = [
        $(this.$el).find('.table.left-box'),
        $(this.$el).find('.table.center-box1'),
        $(this.$el).find('.table.right-box1'),
      ]
      if (LEFT.length === 0) {
        $(this.$el).find('canvas').attr('width', 400)
      }
      const canvasObj = document.getElementById('relation-canvas')
      console.log(canvasObj)
      this.ctx = canvasObj.getContext('2d')
      this.ctx.strokeStyle = '#3b3b3b'
      this.ctx.fillStyle = '#696969'
      this.ctx.setLineDash([4])
      this.ctx.beginPath()
      for (let i = 0; i < LEFT.length; i++) {
        this.drawOneEdge(LEFT[i], CENTER[0])
      }
      for (let i = 0; i < RIGHT.length; i++) {
        this.drawOneEdge(CENTER[0], RIGHT[i])
      }
      this.ctx.stroke()
    },
    drawEdgeCotainsColumns() {
      const [LEFT, CENTER, RIGHT] = [
        $(this.$el).find('.table.left-box'),
        $(this.$el).find('.table.center-box1'),
        $(this.$el).find('.table.right-box1'),
      ]
      const set = this.columnsSet
      const canvasObj = document.getElementById('relation-canvas')
      this.ctx = canvasObj.getContext('2d')
      this.ctx.strokeStyle = '#696969'
      this.ctx.fillStyle = '#696969'
      this.ctx.beginPath()
      set.forEach(item => {
        const left = LEFT.find(`.column:contains(${item})`)
        const center = CENTER.find(`.column:contains(${item})`)
        const right = RIGHT.find(`.column:contains(${item})`)
        if (left.length > 0) {
          for (let i = 0; i < left.length; i++) {
            this.drawOneEdge(left[i], center[0], true)
          }
        }
        if (right.length > 0) {
          for (let i = 0; i < right.length; i++) {
            this.drawOneEdge(center[0], right[i], false)
          }
        }
      })
      this.ctx.stroke()
      //        this.ctx.
    },
    drawStartNotation(left, top) {
      const ctx = this.ctx
      ctx.setLineDash([1000])
      ctx.beginPath()
      let [x, y] = [left, top]
      x += 10
      ctx.moveTo(left, y)
      ctx.lineTo(left + 12, y)
      ctx.moveTo(x, y - 5)
      ctx.lineTo(x, y + 5)
      ctx.moveTo(left + 19, top)
      ctx.ellipse(left + 15, top, 4, 4, 2 * Math.PI, 0, 2 * Math.PI)
      ctx.strokeStyle = this.themeName === 'dark' ? '#fff' : '#000'
      ctx.stroke()
    },
    drawEndNotation(left, top) {
      const ctx = this.ctx
      let [x, y] = [left, top]
      ctx.setLineDash([1000])
      ctx.beginPath()
      ctx.moveTo(left + 9, top)
      ctx.ellipse(left + 5, top, 4, 4, 2 * Math.PI, 0, 2 * Math.PI)
      x += 10
      ctx.moveTo(x, y - 5)
      ctx.lineTo(x, y + 5)
      ctx.moveTo(x, top)
      ctx.lineTo(left + 20, top)
      ctx.moveTo(x, top)
      ctx.lineTo(left + 20, top + 4)
      ctx.moveTo(x, top)
      ctx.lineTo(left + 20, top - 4)
      ctx.strokeStyle = this.themeName === 'dark' ? '#fff' : '#000'
      ctx.stroke()
    },
    drawOneEdge(leftDom, rightDom) {
      const leftPosition = this.getOffset(leftDom, true)
      const rightPosition = this.getOffset(rightDom, false)
      const left = leftPosition.left
      const top = leftPosition.top
      const leftEnd = rightPosition.left
      const topEnd = rightPosition.top
      const ctx = this.ctx
      this.drawStartNotation(left, top)
      ctx.setLineDash([4])
      ctx.beginPath()
      ctx.moveTo(left + 20, top)
      ctx.lineTo(left + 30, top)
      ctx.arcTo(
        (left + leftEnd) / 2,
        top,
        (left + leftEnd) / 2,
        (top + topEnd) / 2,
        Math.min(60, Math.abs(topEnd - top) / 2)
      )
      ctx.arcTo(
        (left + leftEnd) / 2,
        topEnd,
        leftEnd,
        topEnd,
        Math.min(60, Math.abs(topEnd - top) / 2)
      )
      ctx.lineTo(leftEnd - 20, topEnd)
      // 右边线
      ctx.strokeStyle = this.themeName === 'dark' ? '#fff' : '#000'
      ctx.stroke()
      this.drawEndNotation(leftEnd - 20, topEnd)
    },
    drawOneEdgeContainsEdge(leftDom, rightDom, isLeft) {
      const leftPosition = this.getOffset(leftDom, true)
      const rightPosition = this.getOffset(rightDom, false)
      const left = leftPosition.left
      const top = leftPosition.top
      const leftEnd = rightPosition.left
      const topEnd = rightPosition.top
      const ctx = this.ctx
      ctx.moveTo(left, top)
      ctx.arcTo(
        (left + leftEnd) / 2,
        top,
        (left + leftEnd) / 2,
        (top + topEnd) / 2,
        Math.min(60, Math.abs(topEnd - top) / 2)
      )
      ctx.arcTo(
        (left + leftEnd) / 2,
        topEnd,
        leftEnd,
        topEnd,
        Math.min(60, Math.abs(topEnd - top) / 2)
      )
      ctx.lineTo(leftEnd, topEnd)
      ctx.lineTo(leftEnd - 6, topEnd - 3)
      ctx.moveTo(leftEnd - 6, topEnd + 3)
      ctx.lineTo(leftEnd, topEnd)
    },
    getOffset(dom, isLeft) {
      const top = dom.offsetTop + dom.offsetHeight / 2
      let left = dom.offsetLeft + 1
      if (isLeft) {
        left += dom.offsetWidth
      }
      return {
        left: left,
        top: top,
      }
    },
    getOffsetContainsColumns(dom, isLeft) {
      const top =
        dom.offsetTop + dom.offsetParent.offsetTop + dom.offsetHeight / 2
      let left = dom.offsetLeft + dom.offsetParent.offsetLeft + 1
      if (isLeft) {
        left += dom.offsetWidth
      }
      return {
        left: left,
        top: top,
      }
    },
  },
}
</script>

<style lang="scss">
#relation-canvas {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
#relation-graph {
  position: relative;
  .line {
    position: absolute;
    display: inline-block;
    width: 2px;
    height: 2px;
    background-color: #696969;
  }
  .table {
    position: absolute;
    border-radius: 4px;
    padding: 10px;
    color: var(--lineage-label-color);
    .title {
      margin: -10px -10px 10px;
      height: 25px;
      line-height: 25px;
      text-align: center;
      font-size: 14px;
      border-radius: 4px 4px;
    }
    .column {
      height: 25px;
      display: none;
      line-height: 25px;
      text-indent: 1em;
      margin-top: -1px;
    }
  }
  .center-box1 {
    border: 1px solid #719dd9;
    .title {
      border-bottom: 1px solid #719dd9;
      background: #d7e8ff;
    }
    .column {
      border: 1px solid #719dd9;
    }
    left: 0;
  }
  .right-box1 {
    cursor: pointer;
    border: 1px solid #bf7374;
    &:hover .title {
      background: #fff7f7;
      font-weight: bold;
    }
    .title {
      border-bottom: 1px solid #bf7374;
      background: #f6eeee;
    }
    .column {
      border: 1px solid #bf7374;
    }
  }
  .left-box {
    cursor: pointer;
    &:hover .title {
      background: #e1fee0;
      font-weight: bold;
    }
    border: 1px solid #cbe8ca;
    .title {
      border-bottom: 1px solid #cbe8ca;
      background: #d9f6d8;
    }
    .column {
      border: 1px solid #cbe8ca;
    }
  }
}
</style>
