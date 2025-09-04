import Configuration from '@service/lineage/class/Configuration'
class EdgeView {
  // option 配置
  // theme 主题, 暂时有 light  和 dark
  constructor (ctx, edgesMap, option = { theme: 'light',  direction: 'LR'}) {
    this.highlightMap = new Map() // 为多重高亮预留，如果离开时全清，暂不需要使用
    this.ctx = ctx
    this.theme = option?.theme || 'light'
    this.direction = option?.direction || 'LR'

    this.edgesMap = new Map()
    edgesMap.forEach((value, key) => {
      if (!value.readyToDelete) {
        this.edgesMap.set(key, value)
      }
    })
  }

  drawSimpleEdges() {
    // this.ctx.fillStyle = '#123456'
    let baseLineColor = this.theme === 'dark' ? '#AAA' : '#BBB'
    this.ctx.strokeStyle = baseLineColor
    this.ctx.fillStyle = baseLineColor
    this.ctx.beginPath()
    this.edgesMap.forEach((value, key) => {
      this.drawStraightLine(value, key)
    })
    this.ctx.stroke()
    this.ctx.beginPath()
    this.edgesMap.forEach((value, key) => {
      this.drawArrow(value)
    })

    this.edgesMap.forEach((value, key) => {
      this.drawEdgeLabel(value, key)
    })
    this.ctx.fill()
  }

  highlightEdges(causeShapeId, edges) {
    let baseLineColor = this.theme === 'dark' ? '#666' : '#DDD'
    let highlightLineColor = this.theme === 'dark' ? '#EEE' : '#123456'
    this.clearCanvas()
    this.ctx.beginPath()
    this.ctx.strokeStyle = baseLineColor
    this.ctx.fillStyle = baseLineColor
    this.edgesMap.forEach((value, key) => {
      if (!edges.has(key)) {
        this.drawStraightLine(value, key)
        this.drawEdgeLabel(value, key)
      }
    })
    this.ctx.stroke()
    this.ctx.beginPath()
    this.edgesMap.forEach((value, key) => {
      if (!edges.has(key)) {
        this.drawArrow(value)
      }
    })
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.strokeStyle = highlightLineColor
    this.ctx.fillStyle = highlightLineColor
    edges.forEach(edgeId => {
      if (this.edgesMap.has(edgeId)) {
        this.drawStraightLine(this.edgesMap.get(edgeId), edgeId)
        this.drawEdgeLabel(this.edgesMap.get(edgeId), edgeId)
      }
    })
    this.ctx.stroke()
    this.ctx.beginPath()
    edges.forEach(edgeId => {
      if (this.edgesMap.has(edgeId)) {
        this.drawArrow(this.edgesMap.get(edgeId))
      }
    })
    this.ctx.fill()

    // this.edgesMap.forEach((value, key) => {
    //   this.drawEdgeLabel(value, key)
    // })
  }

  drawEdgeLabel(edge, id) {
    let ctx = this.ctx

    //设置填充颜色
    // ctx.fillStyle = "#aaa"
    //设置文本大小和字体
    ctx.font = "12px 微软雅黑"

    //绘制填充文本
    let x = (edge.sourceX + edge.targetX) / 2;
    let y = (edge.sourceY + edge.targetY) / 2;
    if (edge.sourceId === edge.targetId) {
      if (this.direction !== 'LR') {
        y = edge.sourceY
        y += 20
      } else {
        x = edge.sourceX
        x += 15
      }
    } else if (edge.sourceY > edge.targetY) {
      // 下降的线
      x -= 14
      y -= 8
    } else if (edge.sourceY < edge.targetY) {
      // 上升的线
      x += 3
      y -= 3
    } else {
      y -= 3
    }
    ctx.fillText(edge.label === undefined ? '' : edge.label, x, y)

  }

  // 为多重高亮预留，如果离开时全清，暂不需要使用
  removeHighlightOfEdges(causeShapeId, edges) {
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, 100000, 100000)
  }

  removeAllHighlight() {
    this.clearCanvas()
    this.drawSimpleEdges()
  }

  drawStraightLine(position, id) {
    if (position.sourceId === position.targetId) {
      if (this.direction !== 'LR') {
        this.ctx.moveTo(
          position.sourceX - position.sourceWidth / 4,
          position.sourceY
        )
        this.ctx.bezierCurveTo(
          position.sourceX - 6,
          position.sourceY + 30,
          position.sourceX + 16,
          position.sourceY + 25,
          position.sourceX + position.sourceWidth / 4,
          position.sourceY + 10
        )

      } else {
        this.ctx.moveTo(
          position.sourceX,
          position.sourceY - position.sourceHeight / 4
        )
        this.ctx.bezierCurveTo(
          position.sourceX + 20,
          position.sourceY - 6,
          position.sourceX + 16,
          position.sourceY + 6,
          position.targetX + position.sourceWidth + 10,
          position.targetY + position.sourceHeight / 4
        )
        this.ctx.lineTo(
          position.targetX + position.sourceWidth + 10,
          position.targetY + position.sourceHeight / 4
        )
      }
    } else {
      this.ctx.moveTo(position.sourceX, position.sourceY)
      if (this.direction !== 'LR') {
        let cp = [
          {x: (position.sourceX * 2 + position.targetX) / 3, y: (position.sourceY * 2 + position.targetY) / 3},
          {x: (position.sourceX + position.targetX * 2) / 3, y: (position.sourceY + position.targetY * 2) / 3},
        ]
        this.ctx.bezierCurveTo(
          cp[0].x,
          cp[0].y,
          cp[1].x,
          cp[1].y,
          position.targetX,
          position.targetY - 10 // -10 为了中和箭头引起的偏差
        )
      } else {
        let r = 100
        let z = 0
        if (position.sourceX > position.targetX) {
          z = 40
        } else if (position.targetX - position.sourceX < 150) {
          r = (position.targetX - position.sourceX) / 3
        }
        let cp = [
          { x: position.sourceX + r, y: position.sourceY + z },
          { x: position.targetX - r, y: position.targetY - z },
        ]
        this.ctx.bezierCurveTo(
          cp[0].x,
          cp[0].y,
          cp[1].x,
          cp[1].y,
          position.targetX - 10, // -10 为了中和角度引起的偏差
          position.targetY
        )
      }
    }
  }

  drawArrow(position) {
    if (this.direction === 'LR') {
      const r = 20
      const headlen = 10
      const angle1 = (r * Math.PI) / 180
      const angle2 = (-r * Math.PI) / 180
      const topX = headlen * Math.cos(angle1)
      const topY = headlen * Math.sin(angle1)
      const botX = headlen * Math.cos(angle2)
      const botY = headlen * Math.sin(angle2)
      if (position.sourceId === position.targetId) {
        const arrowX1 = position.targetX + position.sourceWidth + topX
        const arrowY1 = position.targetY + position.sourceHeight / 4 + topY
        const arrowX2 = position.targetX + position.sourceWidth + botX
        const arrowY2 = position.targetY + position.sourceHeight / 4 + botY
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(
          position.targetX + position.sourceWidth,
          position.sourceY + position.sourceHeight / 4
        )
        this.ctx.lineTo(arrowX2, arrowY2)
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(arrowX2, arrowY2)
      } else {
        const arrowX1 = position.targetX - topX
        const arrowY1 = position.targetY - topY
        const arrowX2 = position.targetX - botX
        const arrowY2 = position.targetY - botY
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(position.targetX, position.targetY)
        this.ctx.lineTo(arrowX2, arrowY2)
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(arrowX2, arrowY2)
      }
    } else {
      const r = 20
      const headlen = 10
      const angle1 = (r * Math.PI) / 180
      const angle2 = (-r * Math.PI) / 180
      const topX = headlen * Math.sin(angle1)
      const topY = headlen * Math.cos(angle1)
      const botX = headlen * Math.sin(angle2)
      const botY = headlen * Math.cos(angle2)
      if (position.sourceId === position.targetId) {
        const rightY = headlen * Math.cos(angle1)
        const rightX = headlen * Math.sin(angle1)
        const leftY = headlen * Math.cos(angle2)
        const leftX = headlen * Math.sin(angle2)
        const arrowX1 = position.targetX + position.sourceWidth / 4 + rightX
        const arrowY1 = position.sourceY + rightY
        const arrowX2 = position.targetX + position.sourceWidth / 4 + leftX
        const arrowY2 = position.sourceY + leftY
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(
          position.sourceX + position.sourceWidth / 4,
          position.sourceY
        )
        this.ctx.lineTo(arrowX2, arrowY2)
        this.ctx.lineTo(arrowX1, arrowY1)
      } else {
        const arrowX1 = position.targetX - topX
        const arrowY1 = position.targetY - topY
        const arrowX2 = position.targetX - botX
        const arrowY2 = position.targetY - botY
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(position.targetX, position.targetY)
        this.ctx.lineTo(arrowX2, arrowY2)
        this.ctx.moveTo(arrowX1, arrowY1)
        this.ctx.lineTo(arrowX2, arrowY2)
      }
    }

  }

  // 曲线为增强任务，先实现一个简易的直线版本
  drawEdges() {
    const ctx = this.ctx
    // ctx.fillStyle = '#123456'
    ctx.strokeStyle = '#321423'
    ctx.beginPath()
    ctx.moveTo(300, 100)
    ctx.arcTo(400, 150, 500, 200, 50)
    ctx.lineTo(400, 300)
    ctx.stroke()
    // ctx.fill()
    // ctx.moveTo(x, y)
    // ctx.lineTo(x + 5, y + 8)
  }

  // 修改主题颜色
  changeTheme (theme) {
    this.theme = theme
    this.clearCanvas()
    this.drawSimpleEdges()
  }
}

export default EdgeView
