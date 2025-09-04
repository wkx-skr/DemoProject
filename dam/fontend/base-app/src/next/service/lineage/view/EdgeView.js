class EdgeView {
  constructor(ctx, edgesMap) {
    this.highlightMap = new Map() // 为多重高亮预留，如果离开时全清，暂不需要使用
    this.ctx = ctx

    this.edgesMap = new Map()
    edgesMap.forEach((value, key) => {
      if (!value.readyToDelete) {
        this.edgesMap.set(key, value)
      }
    })
  }

  handleLineDash(value, ctx) {
    if (value.$indirect_impact) {
      ctx.setLineDash([10])
      ctx.beginPath()
    } else {
      ctx.setLineDash([])
      ctx.beginPath()
    }
  }

  drawSimpleEdges() {
    // this.ctx.fillStyle = '#123456'
    this.ctx.strokeStyle = '#BBB'
    this.ctx.fillStyle = '#BBB'
    this.edgesMap.forEach((value, key) => {
      this.handleLineDash(value, this.ctx);
      this.drawStraightLine(value, key)
      this.ctx.stroke()
      this.ctx.beginPath()
    })
    this.edgesMap.forEach((value, key) => {
      this.drawArrow(value)
    })
    this.ctx.fill()
  }

  highlightEdges(causeShapeId, edges) {
    this.clearCanvas()
    this.ctx.beginPath()
    this.ctx.strokeStyle = '#DDD'
    this.ctx.fillStyle = '#DDD'
    this.edgesMap.forEach((value, key) => {
      if (!edges.has(key)) {
        this.handleLineDash(value, this.ctx);
        this.drawStraightLine(value, key)
        this.ctx.stroke()
        this.ctx.beginPath()
      }
    })
    this.edgesMap.forEach((value, key) => {
      if (!edges.has(key)) {
        this.drawArrow(value)
      }
    })
    this.ctx.fill()

    this.ctx.beginPath()
    const color = '#123456'
    this.ctx.strokeStyle = color
    this.ctx.fillStyle = color
    edges.forEach(edgeId => {
      if (this.edgesMap.has(edgeId)) {
        this.handleLineDash(this.edgesMap.get(edgeId), this.ctx);
        this.drawStraightLine(this.edgesMap.get(edgeId), edgeId);
        this.ctx.stroke()
        this.ctx.beginPath()
      }
    })
    edges.forEach(edgeId => {
      if (this.edgesMap.has(edgeId)) {
        this.drawArrow(this.edgesMap.get(edgeId))
      }
    })
    this.ctx.fill()
  }

  // 为多重高亮预留，如果离开时全清，暂不需要使用
  removeHighlightOfEdges(causeShapeId, edges) {}

  clearCanvas() {
    this.ctx.clearRect(0, 0, 100000, 100000)
  }

  removeAllHighlight() {
    this.clearCanvas()
    this.drawSimpleEdges()
  }

  drawStraightLine(position, id) {
    if (position.sourceId === position.targetId) {
      this.ctx.moveTo(
        position.sourceX,
        position.sourceY - position.sourceHeight / 4
      )
      /* this.ctx.quadraticCurveTo(
        position.sourceX + 28,
        position.sourceY,
        position.targetX + position.sourceWidth + 10,
        position.targetY + position.sourceHeight / 4
      ) */
      this.ctx.bezierCurveTo(
        position.sourceX + 20,
        position.sourceY - 6,
        position.sourceX + 16,
        position.sourceY + 6,
        position.targetX + position.sourceWidth + 10,
        position.targetY + position.sourceHeight / 4
      )
    } else {
      this.ctx.moveTo(position.sourceX, position.sourceY)
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

  drawArrow(position) {
    const r = 20
    const headlen = 10
    /* const a = Math.atan2(
      position.targetY - position.sourceY,
      position.targetX - position.sourceX
    ) */
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
}

export default EdgeView
