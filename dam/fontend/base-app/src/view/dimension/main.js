import PinyinMatch from 'pinyin-match'
import codeSelect from '@/view/newDataStandard/codeSelect.vue'
const funcArr = []
const categoryIdValidator = (rule, value, callback) => {
  const fun = funcArr[0]
  if (fun) {
    fun(rule, value, callback)
  }
}
const dialogIdValidator = (rule, value, callback) => {
  const fun = funcArr[1]
  if (fun) {
    fun(rule, value, callback)
  }
}
export default {
  data() {
    return {
      timer: null, // 定时器
      hasAccess: true,
      keyword: '',
      catalogsIdSet: new Set(),
      treeData: [
        /* {
        type:'FOLDER',
        catalog:'时间周期',
        children:[]
      }, */ {
          type: 'FOLDER',
          catalog: '修饰维度',
          children: [],
        } /* {
        type:'FOLDER-',
        catalog:'观测对象',
        children:[]
      } */,
      ],
      defaultProps: {
        value: 'catalogId',
        label: 'catalog',
      },
      treeKey: 0,
      addCategoryDialogVisible: false,
      categoryName: '',
      categoryId: '',
      renameCategoryDialogVisible: false,

      dialogTitle: '',
      dialogName: '',
      dialogId: '',
      dialogVisible: false,
      dialogFunction: null,
      dialogPlaceholder: '请输入',

      showPop: false,
      showCodePop: false,
      tableHeight: 500,
      currentDim: null,
      currentMonitor: null,
      currentType: 'NORMAL',
      dims: [],
      dimsIdSet: new Set(),
      // code
      standardCodeDialogVisible: false,
      codeTreeData: [],
      codeKeyword: '',
      codeDefaultProps: {
        label: 'name',
        id: 'code',
      },
      selectedCode: null,
      selectBtnEnable: false,
      codeUploading: false,
      tableLoading: false,
      dialogType: 'rename',
      defaultCodeClicked: false,
      firstLoad: true,
      formRules: {
        categoryId: {
          trigger: 'blur',
          validator: categoryIdValidator,
        },
        dialogId: {
          trigger: 'blur',
          validator: dialogIdValidator,
        },
      },
    }
  },
  components: { codeSelect },
  mounted() {
    funcArr.push(this.valueValidator)
    funcArr.push(this.valueValidator2)
    this.refresh()
    this.initTableHeight()
    $(window).on('resize', this.initTableHeight)
    this.$bus.$on('domainCodeSelected', row => {
      this.codeSelectedNew(row)
    })
  },
  beforeDestroy() {
    this.$bus.$off('domainCodeSelected')
    $(window).off('resize', this.initTableHeight)
    clearInterval(this.timer)
    this.timer = null // 注销定时器
  },
  methods: {
    refresh() {
      this.getCatalogs()
      //      this.getMonitorCatalogs();
    },
    getMonitorCatalogs() {
      this.$http
        .get(this.$url + '/service/me/monitors/catalogs')
        .then(res => {
          const data = res.data

          //        let monitors = this.treeData[1].children;
          const monitors = []
          monitors.length = 0
          if (Array.isArray(data)) {
            data.forEach(item => {
              monitors.push(item)
            })
          }
          if (monitors[0]) {
            this.currentMonitor = monitors[0]
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCatalogs() {
      this.$http
        .get(this.$url + '/service/me/dims/catalogs')
        .then(res => {
          const data = res.data
          //        let times = this.treeData[0].children;
          const times = []
          times.length = 0
          const dims = this.treeData[0].children
          dims.length = 0
          this.treeKey++
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.dimensionType === 'NORMAL') {
                dims.push(item)
              } else if (item.dimensionType === 'TIME') {
                times.push(item)
              }
            })
          }
          this.catalogsIdSet.clear()
          Array.isArray(dims) &&
            dims.forEach(item => {
              this.catalogsIdSet.add(item.catalogId)
            })
          this.$utils.sort.sortConsiderChineseNumber(dims, 'catalog')
          if (this.firstLoad) {
            setTimeout(() => {
              Ps.initialize($('.tree-box')[0], {
                suppressScrollX: true,
              })
            })
            this.firstLoad = false
          }
          this.$nextTick(() => {
            this.$refs.mainTree.filter(this.keyword)
          })

          if (!this.defaultCodeClicked) {
            this.defaultCodeClicked = true
            this.clickDefaultCode()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    renderContent(h, { node, data, store }) {
      let myStyle = {}
      const labelClass = 'oneline-eclipse tree-label'
      if (!this.hasAccess) {
        myStyle = { display: 'none' }
      }
      if (!data.type || data.type.indexOf('FOLDER') !== 0) {
        if (
          this.$auth.DATA_STANDARD_DIM_CATALOG_VALUE_ADD ||
          this.$auth.DATA_STANDARD_DIM_CATALOG_RENAME ||
          this.$auth.DATA_STANDARD_DIM_CATALOG_DELETE
        ) {
          return (
            <span class="tree-item-outer" data-code={data.code}>
              <span>
                <span class="tree-icon dim"> </span>
                <span class={labelClass}>{node.label}</span>
              </span>
              <span
                style={myStyle}
                class="show-when-hover"
                on-mouseenter={e => this.showCodeOptions(node, data, e)}
                on-click={e => this.clickCodeAnchor(e, data)}
              >
                <i class="el-icon-more"></i>
              </span>
            </span>
          )
        } else {
          return (
            <span class="tree-item-outer" data-code={data.code}>
              <span>
                <span class="tree-icon dim"> </span>
                <span class={labelClass}>{node.label}</span>
              </span>
              <span
                style={myStyle}
                class="show-when-hover"
                on-mouseenter={e => this.showCodeOptions(node, data, e)}
                on-click={e => this.clickCodeAnchor(e, data)}
              ></span>
            </span>
          )
        }
      } else if (data.type === 'FOLDER') {
        if (node.level === 1) {
          myStyle.fontWeight = 'bold'
        }
        if (this.$auth.DATA_STANDARD_DIM_CATALOG_ADD) {
          return (
            <span class="tree-item-outer">
              <span>
                <span class="icon-i-folder">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>
                <span class={labelClass}>{node.label}</span>
              </span>
              <span
                style={myStyle}
                class="show-when-hover"
                on-mouseenter={e => this.showOptions(node, data, e)}
                on-click={e => this.clickAnchor(e, data)}
              >
                <i class="el-icon-more"></i>
              </span>
            </span>
          )
        } else {
          return (
            <span class="tree-item-outer">
              <span>
                <span class="icon-i-folder">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>
                <span class={labelClass}>{node.label}</span>
              </span>
              <span
                style={myStyle}
                class="show-when-hover"
                on-mouseenter={e => this.showOptions(node, data, e)}
                on-click={e => this.clickAnchor(e, data)}
              ></span>
            </span>
          )
        }
      } else {
        if (node.level === 1) {
          myStyle.fontWeight = 'bold'
        }
        return (
          <span class="tree-item-outer">
            <span>
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
              <span style={myStyle}>{node.label}</span>
            </span>
          </span>
        )
      }
    },
    clickDefaultCode() {
      const id = this.$route.query.catalogId
      if (!id) {
        setTimeout(() => {
          $($('.el-tree-node.is-expanded  .el-tree-node')[0]).click()
        })
        return
      }
      setTimeout(() => {
        this.$refs.mainTree.setCurrentKey(id)
        const currentNode = this.$refs.mainTree.getCurrentNode()
        this.handleNodeClick(currentNode)
      })
    },
    handleNodeClick(data) {
      this.showPop = false
      this.showCodePop = false
      if (data.type === 'FOLDER') {
        if (data.catalog === '观测对象') {
          this.currentType = 'MONITOR'
          this.getMonitors()
        } else {
          this.currentDim = null
          this.currentType = data.catalog === '时间周期' ? 'TIME' : 'NORMAL'
        }
      } else {
        this.currentType = data.dimensionType
        this.currentDim = data
        if (!data.dimensionType) {
          this.currentType = 'MONITOR'
          this.getMonitors()
        } else {
          this.getDims()
        }
      }
    },
    handleAddCategory() {
      this.categoryName = ''
      this.categoryId = ''
      this.showPop = false
      this.addCategoryDialogVisible = true
    },
    handleRenameCategory() {
      this.showCodePop = false
      this.categoryName = this.currentDim.catalog
      this.categoryId = this.currentDim.catalogId
      this.showPop = false
      this.renameCategoryDialogVisible = true
    },
    renameCategory() {
      if (!this.categoryName) {
        this.$message.warning('请输入目录名称')
      } else {
        if (this.currentType === 'MONITOR') {
          this.$http
            .post(this.$url + '/service/me/monitors/catalogs', {
              catalogId: this.currentDim.catalogId,
              catalog: this.categoryName,
            })
            .then(res => {
              this.refresh()
              this.abortRenameCategory()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          this.$http
            .post(this.$url + '/service/me/dims/catalogs', {
              dimensionType: this.currentType,
              catalogId: this.currentDim.catalogId,
              catalog: this.categoryName,
            })
            .then(res => {
              this.refresh()
              this.abortRenameCategory()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    addCategory() {
      if (!this.categoryName) {
        this.$message.warning('请输入目录名称')
      } else if (this.categoryId && this.catalogsIdSet.has(this.categoryId)) {
        this.$message.error(`编码${this.categoryId}已经被占用`)
      } else {
        if (this.currentType === 'MONITOR') {
          this.$http
            .post(this.$url + '/service/me/monitors/catalogs', {
              catalogId: 'DC-' + this.$getUniqueId(),
              catalog: this.categoryName,
            })
            .then(res => {
              this.refresh()
              this.abortAddCategory()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          this.$http
            .post(this.$url + '/service/me/dims/catalogs', {
              dimensionType: this.currentType,
              catalogId: this.categoryId
                ? this.categoryId
                : 'DC-' + this.$getUniqueId(),
              catalog: this.categoryName,
            })
            .then(res => {
              this.refresh()
              this.abortAddCategory()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    getDims() {
      this.tableLoading = true
      this.$http
        .get(
          this.$url +
          '/service/me/dims/catalogs/' +
          this.currentDim.catalogId +
          '/dims'
        )
        .then(res => {
          this.dims = res.data
          this.dimsIdSet.clear()
          if (Array.isArray(this.dims)) {
            this.dims.forEach(item => {
              this.dimsIdSet.add(item.dimId)
            })
          }
          this.tableLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getMonitors() {
      this.$http
        .get(
          this.$url +
          '/service/me/monitors/catalogs/' +
          this.currentMonitor.catalogId +
          '/objects'
        )
        .then(res => {
          this.dims = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteDim(row) {
      this.$confirm('确定要执行删除操作吗？', '删除', {
        type: 'warning',
      })
        .then(() => {
          let requestUrl = this.$url + '/service/me/dims/'
          if (this.currentType === 'MONITOR') {
            requestUrl = this.$url + '/service/me/monitors/'
          }
          this.$http
            .delete(requestUrl + (row.dimId ? row.dimId : row.objectId))
            .then(res => {
              if (this.currentType === 'MONITOR') {
                this.getMonitors()
              } else {
                this.getDims()
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => { })
    },
    deleteDims() {
      this.$confirm(
        '确定要执行删除操作吗？该操作将删除该维度及其全部所属值',
        '删除',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.showCodePop = false
          const catalogId = this.currentDim.catalogId
          const values = this.dims

          const length = values.length
          let cnt = 0
          this.dims = []
          this.currentDim = null
          if (values.length === 0) {
            this.deleteDimCatalog(catalogId)
          }
          let requestUrl = this.$url + '/service/me/dims/'
          if (this.currentType === 'MONITOR') {
            requestUrl = this.$url + '/service/me/monitors/'
            values.forEach(dim => {
              this.$http
                .delete(requestUrl + (dim.dimId ? dim.dimId : dim.objectId))
                .then(res => {
                  cnt++
                  if (cnt === length) {
                    this.deleteDimCatalog(catalogId)
                  }
                })
                .catch(e => {
                  this.$showFailure(e)
                  this.$bus.$emit('getDimCatalogs')
                })
            })
          } else if (values.length > 0) {
            this.deleteDimCatalog(catalogId)
          }
        })
        .catch(e => { })
    },
    deleteDimCatalog(catalogId) {
      let requestUrl = this.$url + '/service/me/dims/catalogs/'
      if (this.currentType === 'MONITOR') {
        requestUrl = this.$url + '/service/me/monitors/catalogs/'
      }
      this.$http
        .delete(requestUrl + catalogId)
        .then(res => {
          this.$message.success('删除成功')
          this.refresh()
        })
        .catch(e => {
          this.$showFailure(e)
          this.refresh()
        })
    },

    showCodeOptions(node, data, e) {
      const nodeContent = $(e.toElement).parent().parent()[0]
      $('#codeAnchor').css({
        top: e.path[3].offsetTop,
        right: 10,
        display: 'block',
        'z-index': -999,
      })
    },
    clickCodeAnchor(e, data, node) {
      e.stopPropagation()
      this.handleNodeClick(data, node)
      this.$refs.mainTree.setCurrentKey(data.catalogId)
      $('#codeAnchor').click()
    },
    showOptions(node, data, e) {
      const nodeContent = $(e.toElement).parent().parent()[0]
      $('#anchor').css({
        top: e.path[3].offsetTop,
        right: 10,
        display: 'block',
        'z-index': -999,
      })
    },
    clickAnchor(e, data) {
      e.stopPropagation()
      this.handleNodeClick(data)
      this.$refs.mainTree.setCurrentKey(data.id)
      $('#anchor').click()
    },
    initTableHeight() {
      setTimeout(() => {
        const height = $('.content-area')[0].offsetHeight
        this.tableHeight = height - 100
      })
    },
    abortAddCategory() {
      this.addCategoryDialogVisible = false
    },
    abortRenameCategory() {
      this.renameCategoryDialogVisible = false
    },
    callDialog() {
      this.showCodePop = false
      if (arguments[0] === 'value') {
        let requestBody = {}
        const dimensionType = 'NORMAL'
        //        let typeText = '维度值';
        let typeText = this.typeLabel
        if (this.currentType != 'MONITOR') {
          typeText += '值'
        }
        this.dialogPlaceholder = '请输入' + typeText
        if (arguments[1] === 'rename') {
          this.dialogType = 'rename'
          requestBody = arguments[2]
          if (requestBody.value) {
            this.dialogName = requestBody.value
            this.dialogId = requestBody.dimCode
            this.dialogRealId = requestBody.dimId
          } else {
            this.dialogName = requestBody.monitorObject
            this.dialogId = requestBody.objectId
          }
          this.dialogTitle = '重命名' + typeText
        } else {
          this.dialogType = 'add'
          this.dialogName = ''
          this.dialogId = ''
          this.dialogTitle = '新增' + typeText
        }
        this.dialogFunction = () => {
          if (this.currentType === 'MONITOR') {
            requestBody.monitorObject = this.dialogName
            requestBody.objectId = this.dialogId
              ? this.dialogId
              : 'M-' + this.$getUniqueId()
            requestBody.catalog = this.currentMonitor
            this.$http
              .post(this.$url + '/service/me/monitors', requestBody)
              .then(res => {
                this.$message.success(this.$version.common.operationSucceed)
                this.getMonitors()
                this.abortHandleDialog()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            requestBody = {
              catalog: this.currentDim,
            }
            requestBody.value = this.dialogName
            requestBody.dimCode = this.dialogId
              ? this.dialogId
              : 'D-' + this.$getUniqueId()
            requestBody.dimId = this.dialogRealId
              ? this.dialogRealId
              : 'D-' + this.$getUniqueId()
            if (arguments[1] === 'add' && this.dimsIdSet.has(this.dialogId)) {
              this.$message.error(`编码${this.dialogId}已经被占用`)
              return
            }
            if (arguments[1] === 'add') {
              requestBody.dimId = ''
            }
            this.$http
              .post(this.$url + '/service/me/dims', requestBody)
              .then(res => {
                this.$message.success(this.$version.common.operationSucceed)
                this.getDims()
                this.abortHandleDialog()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      }
      this.showPop = false
      this.showCodePop = false
      this.dialogVisible = true
    },
    handleDialog() {
      const dialogName = _.trim(this.dialogName)
      this.dialogId = _.trim(this.dialogId)
      if (!dialogName) {
        this.$message.warning(`${this.typeLabel}不能为空`)
      } else {
        this.dialogFunction()
      }
    },
    abortHandleDialog() {
      this.dialogVisible = false
    },

    exportFromStandardCode() {
      // this.standardCodeDialogVisible = true
      // this.getStandardCodes()
      this.$bus.$emit('callDomainCodeSelector')
    },
    getStandardCodes() {
      this.$http
        .get(this.$url + '/service/domains/codes')
        .then(res => {
          if (Array.isArray(res.data)) {
            this.handleCodesList(res.data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCodesList(list) {
      this.codeTreeData = []
      const codesMap = {}
      list.forEach(item => {
        if (codesMap.hasOwnProperty(item.datasetName)) {
        } else {
          codesMap[item.datasetName] = []
        }
        codesMap[item.datasetName].push(item)
      })
      for (const i in codesMap) {
        const codes = codesMap[i]
        this.codeTreeData.push({
          name: i,
          children: codes,
        })
      }
    },
    codeRenderContent(h, { node, data, store }) {
      if (data.code) {
        return (
          <span
            style="flex: 1; display: flex;align-items: center;"
            data-code={data.code}
          >
            <span class="tree-icon domain-code"></span>
            <span>{node.label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span>{node.label}</span>
          </span>
        )
      }
    },
    codeFilterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    codeHandleNodeClick(data) {
      this.selectedCode = data
      this.selectBtnEnable = !!data.code
    },
    codeSelectedNew(selectedCode) {
      const name = selectedCode.name
      const code = selectedCode.code
      const requestBody = {
        catalogId: 'DC-' + code,
        catalog: name,
        dimensionType: 'NORMAL',
      }
      let values = []
      const count = 0

      this.$http
        .post(this.$url + '/service/me/dims/catalogs', requestBody)
        .then(res => {
          this.codeUploading = true
          this.$http
            .get(
              this.$url + '/service/domains/codes/content?codeNumber=' + code
            )
            .then(res => {
              values = res.data.values
              const length = values.length
              const r_cnt = 0 // request count
              let cnt = 0 // response count
              let count = 0 // response error count
              let errorCnt = 0
              const ArrayMsg = []
              const keyArray = []
              const errMap = {}
              if (length === 0) {
                this.$message.success('导入成功')
                this.codeUploading = false
                this.refresh()
              }
              values.forEach(item => {
                this.$http
                  .post(this.$url + '/service/me/dims', {
                    catalog: requestBody,
                    //              dimId:'D-' + this.$getUniqueId() + '-' + r_cnt++,
                    dimId: 'D-' + code + item.value,
                    dimCode: 'D-' + code + item.value,
                    value: item.name,
                  })
                  .then(res => {
                    cnt++
                    if (cnt === length) {
                      this.$message.success('导入成功')
                      this.codeUploading = false
                      this.refresh()
                    }
                  })
                  .catch(e => {
                    cnt++
                    errorCnt++
                    const obj = { value: code, errorMsg: '' }
                    obj.errorMsg = e.response.data.errorMessage
                    ArrayMsg.push(obj)
                    if (cnt === length) {
                      this.codeUploading = false
                      ArrayMsg.forEach(item => {
                        if (item.errorMsg === ArrayMsg[0].errorMsg) {
                          if (!errMap[item.errorMsg]) {
                            errMap[item.errorMsg] = []
                          }
                          errMap[item.errorMsg].push(item)
                          count++
                        }
                      })
                    }
                  })
              })
              this.timer = setTimeout(() => {
                let showHTML = `<div>导入${length}个代码，${errorCnt}个错误</div><br>`
                let source = ''
                for (const key in errMap) {
                  if (errMap[key].length === 1) {
                    source = `<div>第1条错误原因：${key}</div>`
                  } else {
                    source = `<div>第1条到第${errMap[key].length}条错误原因：${key}</div>`
                  }
                  showHTML += source
                }
                this.$showSuccess(showHTML)
              }, 1000)
            })
            .catch(e => {
              this.$showFailure(e)
              this.codeUploading = false
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    codeSelected() {
      const name = this.selectedCode.name
      const code = this.selectedCode.code
      const requestBody = {
        catalogId: 'DC-' + code,
        catalog: name,
        dimensionType: 'NORMAL',
      }
      let values = []
      const count = 0

      this.$http
        .post(this.$url + '/service/me/dims/catalogs', requestBody)
        .then(res => {
          this.codeUploading = true
          this.$http
            .get(
              this.$url + '/service/domains/codes/content?codeNumber=' + code
            )
            .then(res => {
              values = res.data.values
              const length = values.length
              const r_cnt = 0 // request count
              let cnt = 0 // response count
              let count = 0 // response error count
              let errorCnt = 0
              const ArrayMsg = []
              const keyArray = []
              const errMap = {}
              if (length === 0) {
                this.standardCodeDialogVisible = false
                this.$message.success('导入成功')
                this.codeUploading = false
                this.refresh()
              }
              values.forEach(item => {
                this.$http
                  .post(this.$url + '/service/me/dims', {
                    catalog: requestBody,
                    //              dimId:'D-' + this.$getUniqueId() + '-' + r_cnt++,
                    dimId: 'D-' + code + item.value,
                    dimCode: 'D-' + code + item.value,
                    value: item.name,
                  })
                  .then(res => {
                    cnt++
                    if (cnt === length) {
                      this.standardCodeDialogVisible = false
                      this.$message.success('导入成功')
                      this.codeUploading = false
                      this.refresh()
                    }
                  })
                  .catch(e => {
                    cnt++
                    errorCnt++
                    const obj = { value: code, errorMsg: '' }
                    obj.errorMsg = e.response.data.errorMessage
                    ArrayMsg.push(obj)
                    if (cnt === length) {
                      this.codeUploading = false
                      ArrayMsg.forEach(item => {
                        if (item.errorMsg === ArrayMsg[0].errorMsg) {
                          if (!errMap[item.errorMsg]) {
                            errMap[item.errorMsg] = []
                          }
                          errMap[item.errorMsg].push(item)
                          count++
                        }
                      })
                    }
                  })
              })
              this.timer = setTimeout(() => {
                let showHTML = `<div>导入${length}个代码，${errorCnt}个错误</div><br>`
                let source = ''
                for (const key in errMap) {
                  if (errMap[key].length === 1) {
                    source = `<div>第1条错误原因：${key}</div>`
                  } else {
                    source = `<div>第1条到第${errMap[key].length}条错误原因：${key}</div>`
                  }
                  showHTML += source
                }
                this.$showSuccess(showHTML)
              }, 1000)
            })
            .catch(e => {
              this.$showFailure(e)
              this.codeUploading = false
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSortChange({ prop, order }) {
      this.$utils.sort.sortConsiderChineseNumber(this.dims, prop, order)
    },
    valueValidator(rule, value, callback) {
      value = this.categoryId
      if (value && value.indexOf('/') !== -1) {
        const errorString = '编码值不能包含"/"'
        callback(errorString)
      } else {
        callback()
      }
    },
    valueValidator2(rule, value, callback) {
      value = this.dialogId
      if (value && value.indexOf('/') !== -1) {
        callback('编码值不能包含"/"')
      } else {
        callback()
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (!data.catalog) return false
      const current = node
      let hasValue = false

      if (this.$MatchKeyword(current.data, value, 'catalog', 'catalogId')) {
        hasValue = true
      }
      return hasValue
    },
  },
  computed: {
    typeLabel() {
      const type = this.currentType
      if (type === 'MONITOR') {
        return '观测对象'
      } else if (type === 'NORMAL') {
        return '修饰维度'
      } else {
        return '时间周期'
      }
    },
  },
  watch: {
    addCategoryDialogVisible(val) {
      // high light input when open dialog.
      setTimeout(() => {
        if (val && this.$refs.addCategory) {
          var dom = $(this.$refs.addCategory.$el).find('input')
          setTimeout(() => {
            dom.focus()
          })
        }
      })
    },
    renameCategoryDialogVisible(val) {
      setTimeout(() => {
        if (val && this.$refs.renameCategory) {
          var dom = $(this.$refs.renameCategory.$el).find('input')
          setTimeout(() => {
            dom.focus()
          })
        }
      })
    },
    dialogVisible(val) {
      setTimeout(() => {
        if (val && this.$refs.dialogInput) {
          const dom = $(this.$refs.dialogInput.$el).find('input')
          setTimeout(() => {
            dom.focus()
          })
        }
      })
    },
    codeKeyword(val) {
      this.$refs.tree.filter(val)
    },
    keyword(value) {
      this.$refs.mainTree.filter(value)
    },
  },
}
//  GET     /service/me/dims/catalogs
//  POST    /service/me/dims/catalogs     {catalogId: "DC-jmlqst9n", catalog: "new", dimensionType: "NORMAL"}
//  DELETE  /service/me/dims/catalogs/DC-jmlqst9n

//  GET     /service/me/dims/catalogs/DC-02/dims
//  DELETE  /service/me/dims/D-11
