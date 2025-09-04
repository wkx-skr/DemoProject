class Drag {
  params = {
    dragEle: null, // 拖动元素
    dropEle: null, // 目标元素
    triggerEle: null, // 给iframe发送消息
    dragTargetEle: null, // 拖拽的具体的节点
    modelEle: null, // 模型树拖拽
    endDrag: false, // 是否拖拽到工作流
    fileWidth: 240
  }
  // 设置左侧目录树的宽度
  setFileWidth = w => {
    this.params.fileWidth = w
  }
  // 设置拖拽的节点，获取文件名，id
  setDraggingNode = node => {
    this.params.dragTargetEle = node
  }
  // 判断是否要拖拽排序
  getDrop = () => {
    return this.params.endDrag
  }
  init = (params) => {
    this.params.dragEle = params.dragEle
    this.params.dropEle = params.dropEle
    this.params.triggerEle = params.triggerEle
    this.params.modelEle = params.modelEle || ''
    if (params.dragEle) {
      this.initDrag(params.dragEle)
      this.initDrag(params.modelEle)
    }
  }
  // 初始化设置拖动元素
  initDrag = dragEle => {
    if (dragEle.childNodes.length) {
      dragEle.childNodes.forEach(item => {
        if (item.nodeType === 1 && (item.parentId !== 0 || !item.parentId) && item.nodeName === 'DIV') {
          item.setAttribute('draggable', 'true')
          item.ondragstart = this.dragStartEvent
          item.ondragend = this.dragEndEvent
        }
        if (item.childNodes && item.childNodes.length) {
          this.initDrag(item)
        }
      })
    }
  }
  // 初始化目标元素
  initDrop = dropEle => {
    dropEle.ondrop = this.dropEvent
    dropEle.ondragenter = this.dragEnterEvent
    dropEle.ondragover = this.dragOverEvent
    dropEle.ondragleave = this.dragLeaveEvent
  }
  // 开始拖拽
  dragStartEvent = (e) => {
    if (this.params.dropEle) {
      this.initDrop(this.params.dropEle)
    }
    this.params.endDrag = false
    this.params.dropEle.style.display = 'block'
  }
  // 结束拖拽
  dragEndEvent = e => {
    // this.params.dropEle.style.display = 'none'
  }
  dropEvent = ev => {
    ev.preventDefault()
    this.params.triggerEle.triggerMethod({ node: this.params.dragTargetEle, ev: { offsetX: ev.offsetX, offsetY: ev.offsetY, clientX: ev.clientX, clientY: ev.clientY, fileWidth: this.params.fileWidth } })
    this.params.endDrag = true
    this.params.dropEle.style.display = 'none'
  }
   dragEnterEvent = ev => {
     ev.preventDefault()
     this.params.endDrag = true
   }
  dragOverEvent = ev => {
    ev.preventDefault()
  }
  dragLeaveEvent = ev => {
    ev.preventDefault()
    this.params.endDrag = false
  }
}

export default new Drag()
