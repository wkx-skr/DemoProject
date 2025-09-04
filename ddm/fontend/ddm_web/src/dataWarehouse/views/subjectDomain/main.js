import ResizeHorizontal from '@/components/common/ResizeHorizontal'

export default {
  data () {
    return {
      keyword: '',
      initialization: true,
      treeData: [],
      treeKey: 0,
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'childList'
      },
      newSubject: false,
      formSubject: {
        newName: '',
        content: ''
      },
      dialogTitle: '',
      parentId: null,
      contentData: null,
      editState: false,
      clickData: null,
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      },
      mavonEditorHeight: 0,
      defaultNode: false
    }
  },
  mounted () {
    this.initResizeHorizontal()
    this.getTreeData()
    this.mavonEditorHeight = document.body.clientHeight - 160
  },
  beforeDestroy () {
  },
  methods: {
    // 创建根目录
    createDefaultNode () {
      let response = {
        'name': this.formSubject.newName,
        'content': this.formSubject.content
      }
      this.$http.post(`${this.$dddUrl}/service/subject/node/default`, response).then(res => {
        this.$datablauMessage.success('创建成功')
        this.newSubject = false
        this.defaultNode = false
        this.getTreeData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    addDefault () {
      this.newSubject = true
      this.defaultNode = true
    },
    handleDrop (draggingNode, dropNode, dropType, ev) {
      this.moveFile(draggingNode, dropNode, dropType)
    },
    moveFile (folderId, targetParentId, dropType) {
      let params = {
        nodeId: folderId.data.id,
        targetId: dropType === 'after' ? targetParentId.parent.data.id : targetParentId.data.id,
        targetParentId: dropType === 'inner' ? targetParentId.data.id : targetParentId.parent.data.id,
        targetOrder: targetParentId.data.order
      }
      this.$http.post(`${this.$dddUrl}/service/subject/node/move?nodeId=${params.nodeId}&targetId=${params.targetId}&targetParentId=${params.targetParentId}&targetOrder=${params.targetOrder}`)
        .then(res => {
          this.$datablauMessage.success('移动目录成功！')
          this.getTreeData()
        })
        .catch(() => {
          this.$showFailure('文件移动失败')
          this.treeLoading = true
          this.getTreeData()
        })
    },
    closeDialog () {
      this.newSubject = false
      this.formSubject = {
        newName: '',
        content: ''
      }
    },
    getTreeData (type) {
      this.$http.get(`${this.$dddUrl}/service/subject/tree`).then(res => {
        this.treeData = [res.data]
        if (this.treeData[0].id) {
          this.initialization = false
        } else {
          this.initialization = true
        }
        if (type === false) {
          this.$nextTick(function () {
            this.$refs.mainTree.setCurrentKey(this.contentData.id)
          })
        } else {
          this.$nextTick(function () {
            this.$refs.mainTree.setCurrentKey(this.treeData[0].id)
            this.contentData = this.treeData[0]
          })
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 控制左右两边的拖拽
    initResizeHorizontal () {
      this.$nextTick(() => {
        setTimeout(() => {
          let r = new ResizeHorizontal({
            leftDom: $(this.$el).find('.tree-subject'),
            rightDom: $(this.$el).find('.content-detail'),
            middleDom: $(this.$el).find('.folder-line'),
            outerDom: $(this.$el),
            noCrack: true,
            leftMinSize: 280

          })
        }, 1000)
      })
    },
    addNewSubject (type) {
      let response = {}
      if (type === 'edit') {
        response = {
          'name': this.contentData.name,
          'content': this.contentData.content,
          id: this.contentData.id,
          parentId: this.contentData.parentId
        }
        this.$http.put(`${this.$dddUrl}/service/subject/node`, response).then(res => {
          this.$datablauMessage.success('修改成功')
          this.editState = false
          this.getTreeData(false)
        }).catch(err => {
          this.$showFailure(err)
        })
      } else {
        response = {
          'name': this.formSubject.newName,
          'content': this.formSubject.content
        }
        if (this.dialogTitle === '新建子目录') {
          response.parentId = this.parentId
        } else {
          response.parentId = 0
        }
        this.$http.post(`${this.$dddUrl}/service/subject/node`, response).then(res => {
          this.$datablauMessage.success('创建成功')
          this.newSubject = false
          this.getTreeData()
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    addSubject () {
      this.parentId = 0
      this.dialogTitle = '新建目录'
      this.newSubject = true
    },
    editDetail () {
      this.editState = true
    },
    cancelEdit () {
      this.editState = false
    },
    saveDetail () {
      this.editState = true
    },
    deleteCatalogue (data) {
      this.$DatablauCofirm('确定要删除？').then(() => {
        this.$http.delete(`${this.$dddUrl}/service/subject/node/${data.id}`).then(res => {
          this.$datablauMessage.success('删除成功')
          this.getTreeData()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(() => {

      })
    },
    addCatalogue (data, node) {
      this.parentId = node.data.id
      this.newSubject = true
      this.dialogTitle = '新建子目录'
    },
    handleNodeClick (data) {
      this.contentData = data
      this.parentId = data.id
      this.editState = false
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-form'
      } else {
        return 'iconfont icon-form'
      }
    },
    dataOptionsFunction (data, node) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.id !== 0) {
        options.push({
          label: '新建',
          callback: () => {
            this.addCatalogue(data, node)
          },
          args: 'folder'
        })
        if (data.parentId !== 0) {
          options.push({
            label: '删除',
            callback: () => {
              this.deleteCatalogue(data)
            },
            args: 'folder'
          })
        }
      }
      return options
    },
    filterNode (value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    }
  },
  computed: {
  },
  watch: {
    keyword (val) {
      this.$refs.mainTree.filter(val)
    }
  }
}
