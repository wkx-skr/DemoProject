<template>
  <div>
    <!--<div style="margin-bottom:1em;">逻辑关联</div>-->
    <div id="logical-relation" v-show="hasLogicalRelation">
      <canvas width="800" height="0"></canvas>
    </div>
    <span v-show="!hasLogicalRelation">没有结果可以显示</span>
    <!--{{objectId}}{{tableName}}-->
  </div>
</template>
<script>
export default {
  mounted() {
    if (this.objectId) {
      this.getData()
    }
  },
  props: ['object-id', 'table-name'],
  data() {
    return {
      data: null,
      ctx: null,
      subjectAreas: null,
      tables: null,
      left: [],
      right: [],
      hasLogicalRelation: false,
    }
  },
  methods: {
    initEventListener() {
      const self = this
      $(this.$el).on('click', '.diagram-box', function () {
        const diagram = $(this).attr('data-name')
        const pos = location.href.indexOf('ddc.html')
        const baseUrl = location.href.slice(0, pos) + '#/'
        window.open(
          baseUrl +
            `scanModel?id=${self.data.modelId}&logicalRelationMode=true&diagram=${diagram}&tableId=${self.data.elemId}`
        )
        //          window.open(baseUrl + `scanModel?id=${self.data.modelId}`,'_blank');
      })
    },
    getData() {
      this.$http
        .get(this.$meta_url + `/entities/tables/${this.objectId}/ddminfo`)
        .then(res => {
          if (res.data && res.data[0]) {
            this.hasLogicalRelation = true
            this.data = res.data[0]
            this.initEventListener()
            this.prepare()
            this.draw()
          } else {
          }
        })
        .catch(e => {
          this.hasLogicalRelation = false
          //          this.$showFailure(e);
        })
    },

    prepare() {
      const { subjectAreas, relatedTables } = this.data
      this.subjectAreas = subjectAreas
      this.tables = relatedTables
      this.prepareData()
    },
    prepareData() {
      this.left = []
      this.right = []
      this.tables.forEach(item => {
        if (item.src) {
          this.left.push(item)
        } else {
          this.right.push(item)
        }
      })
    },
    draw() {
      const EACH_HEIGHT = 25
      const EACH_WIDTH = 240
      const maxHeight = Math.max(this.left.length, this.right.length)
      const TOTAL_HEIGHT = maxHeight * EACH_HEIGHT + (maxHeight - 1) * 25 + 2
      //        const CENTER_OFFSET = TOTAL_HEIGHT/2 - EACH_HEIGHT/2;
      const CENTER_OFFSET = 1
      const container = $('#logical-relation')

      let name = this.data.name
      const alias = this.data.alias
      if (alias) {
        name = name + ' (' + alias + ')'
      }

      let offset = 0
      this.left.forEach(item => {
        let name = item.name
        const alias = item.alias
        if (alias) {
          name = name + ' (' + alias + ')'
        }
        const rightHtml = `<div class="left-box table" data-id="${item.tableId}" style="width:${EACH_WIDTH}px;top:${offset}px">
            <div class="title oneline-eclipse" title="${name}">
${name}</div></div>`
        offset += EACH_HEIGHT + 25
        container.append(rightHtml)
      })
      const hasLeft = this.left.length > 0
      offset = 0
      this.right.forEach(item => {
        let name = item.name
        const alias = item.alias
        if (alias) {
          name = name + ' (' + alias + ')'
        }
        const left = hasLeft ? 700 : 350
        const rightHtml = `<div class="right-box1 table" data-id="${item.tableId}" style="left:${left}px;width:${EACH_WIDTH}px;top:${offset}px">
            <div class="title oneline-eclipse" title="${name}">
${name}</div></div>`
        offset += EACH_HEIGHT + 25
        container.append(rightHtml)
      })

      const left = hasLeft ? 350 : 0
      const centerHtml = `<div class="center-box1 table" style="left:${left}px;width:${EACH_WIDTH}px;top:${CENTER_OFFSET}px">

            <div class="title oneline-eclipse" title="${name}"><i class="fa fa-map-marker"></i> ${name}</div></div>`
      container.append(centerHtml)

      let subjectTop = 20
      this.subjectAreas.forEach(item => {
        subjectTop += 30
        const diagramHtml = `
          <div
          data-name="${item}"
          class="diagram-box oneline-eclipse" title="在新页面查看主题域${item}" style="left:${
          hasLeft ? 400 : 50
        }px;top:${subjectTop}px;">
          <i class="tree-icon diagram" style="margin-right:0;"></i>
          ${item}
          </div>
        `
        container.append(diagramHtml)
      })
      const subjectBottom = subjectTop + 30
      const wholeHeight = Math.max(subjectBottom, TOTAL_HEIGHT)
      container[0].style.height = wholeHeight + 10 + 'px'
      container.find('canvas').attr('height', wholeHeight + 5 + 'px')

      this.drawEdge(CENTER_OFFSET, EACH_WIDTH)
      this.drawDiagramEdge()
    },
    drawDiagramEdge() {
      const ctx = this.ctx
      ctx.beginPath()
      const length = this.subjectAreas.length
      ctx.setLineDash([1000])
      ctx.strokeStyle = '#696969'
      const startX = this.left.length > 0 ? 400 : 50
      const startY = 67
      const width = 10
      const height = 30
      ctx.moveTo(startX, 27)
      ctx.lineTo(startX, 37 + 30 * length)
      for (let i = 0; i < length; i++) {
        ctx.moveTo(startX, 67 + 30 * i)
        ctx.lineTo(startX + width, 67 + 30 * i)
      }
      ctx.stroke()
    },
    drawEdge(centerOffset, eachWidth) {
      if (this.left.length === 0) {
        $(this.$el).find('canvas').attr('width', 400)
      }
      const canvasObj = $('#logical-relation').find('canvas')[0]
      this.ctx = canvasObj.getContext('2d')
      this.ctx.strokeStyle = '#3b3b3b'
      this.ctx.fillStyle = '#696969'
      this.ctx.setLineDash([4])
      this.ctx.beginPath()
      const [left, top, leftEnd, topEnd] = [
        eachWidth,
        centerOffset + 12,
        350,
        13,
      ]
      this.left.forEach((t, i) => {
        this.drawOneEdge(left, top + 50 * i, leftEnd, topEnd)
      })
      this.right.forEach((t, i) => {
        if (this.left.length === 0) {
          this.drawOneEdge(left, top, leftEnd, topEnd)
        } else {
          const [left, top, leftEnd, topEnd] = [
            eachWidth + 350,
            centerOffset + 12,
            700,
            13 + 50 * i,
          ]
          this.drawOneEdge(left, top, leftEnd, topEnd)
        }
      })

      this.ctx.stroke()
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
      ctx.stroke()
    },
    drawOneEdge(left, top, leftEnd, topEnd) {
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
      ctx.stroke()
      this.drawEndNotation(leftEnd - 20, topEnd)
      //        ctx.lineTo(leftEnd-6,topEnd-3);
      //        ctx.moveTo(leftEnd-6,topEnd+3);
      //        ctx.lineTo(leftEnd,topEnd);
    },
    drawShape() {
      const canvasObj = $(this.$el).find('canvas')[0]
      const ctx = canvasObj.getContext('2d')
      this.ctx = ctx
      ctx.strokeStyle = '#25242b'
      ctx.fillStyle = '#696969'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.font = '14px 微软雅黑'
      ctx.stroke()
    },
  },
}
</script>
<style lang="scss">
#logical-relation {
  height: 0px;
  width: 400px;
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  position: relative;
  .line {
    position: absolute;
    display: inline-block;
    width: 2px;
    height: 2px;
    background-color: #696969;
  }
  .diagram-box {
    position: absolute;
    left: 20px;
    /*border:1px solid grey;*/
    color: #409eff;
    cursor: pointer;
    padding-left: 1em;
    max-width: 200px;
    height: 30px;
    line-height: 30px;
    border-radius: 1px;
  }
  .table {
    position: absolute;
    border-radius: 4px;
    height: 25px;
    padding: 10px;
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
    /*cursor:pointer;*/
    border: 1px solid #bf7374;
    .title {
      border-bottom: 1px solid #bf7374;
      background: #f6eeee;
    }
    .column {
      border: 1px solid #bf7374;
    }
  }
  .left-box {
    /*cursor:pointer;*/
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
