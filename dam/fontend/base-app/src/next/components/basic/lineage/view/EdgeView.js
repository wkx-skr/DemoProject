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

  drawSimpleEdges() {
    // this.ctx.fillStyle = '#123456'
    // 默认线颜色
    this.ctx.strokeStyle = '#BBB'
    this.ctx.fillStyle = '#BBB'
    this.ctx.beginPath()
    this.edgesMap.forEach((value, key) => {
      this.drawArrow(value)
    })
    this.ctx.fill()
    this.ctx.beginPath()
    this.edgesMap.forEach((value, key) => {
      this.drawStraightLine(value, key)
    })
    this.ctx.stroke()
  }

  highlightEdges(causeShapeId, edges) {
    this.clearCanvas()
    this.ctx.beginPath()
    // 鼠标移入时其他线条默认颜色
    this.ctx.strokeStyle = '#DDD'
    this.ctx.fillStyle = '#DDD'
    this.edgesMap.forEach((value, key) => {
      if (!edges.has(key)) {
        this.drawStraightLine(value, key)
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
    // 鼠标移入对象高亮颜色
    const color = '#123456'
    this.ctx.strokeStyle = color
    this.ctx.fillStyle = color
    edges.forEach(edgeId => {
      if (this.edgesMap.has(edgeId)) {
        this.drawStraightLine(this.edgesMap.get(edgeId), edgeId)
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
  }

  onTap(canvas, event) {
    const x = event.clientX - canvas.getBoundingClientRect().left
    const y = event.clientY - canvas.getBoundingClientRect().top
    let catchCurrent = false
    let leaveAll = false
    if (this.ctx.isPointInPath(x, y)) {
    } else {
      leaveAll = true
    }
    if (this.ctx.isPointInPath(x, y)) {
      this.edgesMap.forEach((value, key) => {
        this.ctx.beginPath()
        this.drawStraightLine(value, key, true)
        if (
          catchCurrent === false && (
            this.ctx.isPointInPath(x, y) ||
            this.ctx.isPointInPath(x, y + 1) ||
            this.ctx.isPointInPath(x, y - 1) ||
            this.ctx.isPointInPath(x, y + 2) ||
            this.ctx.isPointInPath(x, y - 2)
          )
        ) {
          catchCurrent = key
        }
        // this.ctx.stroke()
        this.ctx.closePath()
      })
    }
    return {
      catchCurrent,
      leaveAll,
    }
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
        position.targetX - 0, // -10 为了中和角度引起的偏差
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
}

export default EdgeView
