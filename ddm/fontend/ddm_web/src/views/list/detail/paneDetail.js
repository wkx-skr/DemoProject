import moment from 'moment'
import Status from '../Status.vue'
import DatabaseType from '@/components/common/DatabaseType.vue'
import _ from 'lodash'
import HTTP from '@/resource/http'
import TagSelector from '@/components/selector/TagSelector.vue'
import utils from '@/resource/utils/isJSON'
import $const from '@/resource/const'
import { mapState } from 'vuex'
import LDMTypes from '@constant/LDMTypes'
import RightAttrInfo from '../rightAttrInfo/rightAttrInfo.vue'
import inElectron from '@/resource/utils/environment'
import verImg from '@/assets/images/icon/version.svg'
import editLogList from '@/views/list/version/editLogList.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import rateInTable from '@/views/modelLibrary/rateInTable.vue'

export default {
  components: {
    Status,
    DatabaseType,
    TagSelector,
    editLogList,
    RightAttrInfo,
    rateInTable,
    spanWithTooltip
  },
  props: {
    detail: {

    },
    dataByType: {

    },
    path: {

    },
    isLogical: {

    },
    isEditor: {

    },
    isConceptual: {

    },
    isCassandraOrMongoDB: {

    },
    showViewButton: {

    }
  },
  inject: ['refresh'],
  data () {
    return {
      verImg,
      toggleTable: false,
      columImg: require('../../../assets/images/panedetail_icon/colum.svg'),
      messageImg: require('../../../assets/images/panedetail_icon/message.svg'),
      reportImg: require('../../../assets/images/panedetail_icon/report.svg'),
      tableImg: require('../../../assets/images/panedetail_icon/table.svg'),
      themeImg: require('../../../assets/images/panedetail_icon/theme.svg'),
      userImg: require('../../../assets/images/panedetail_icon/user.svg'),
      versionImg: require('../../../assets/images/panedetail_icon/version.svg'),
      viewImg: require('../../../assets/images/panedetail_icon/view.svg'),
      bg: require('../../../assets/images/bg/bg33.png'),
      id: +this.$route.query.id,
      branchVersions: [],
      mergeData: {
        branchId: null,
        startVer: null,
        endVer: null,
        mergeName: '',
        includeDiagram: false,
        des: ''
      },
      rules: {
        branchId: [
          { required: true, message: '请选择合并分支', trigger: ['blur', 'change'] }
        ],
        startVer: [
          { required: true, message: '请选择起始版本', trigger: 'change' }
        ],
        endVer: [
          { required: true, message: '请选择结束版本', trigger: 'change' }
        ],
        mergeName: [
          { required: true, message: '请输入版本名称', trigger: ['blur', 'change'] }
        ]
      },
      statusRules: {
        modelStatus: [
          { required: true, message: '请选择模型状态', trigger: ['change'] }
        ]
      },
      mergeFailureResult: [],
      showMergeDialog: false,
      showMergeResultDialog: false,
      udpMessage: null,
      tags: [],
      tagsLoaded: false,
      rate: 0,
      writable: this.$store.state.lic.editor && (this.$store.state.user.isAdmin || this.detail?.permission?.editor),
      showEditModelStatus: false,
      showEditModelName: false,
      showEditModelDescription: false,
      statusForm: {
        modelStatus: ''
      },
      // 是否开启强管控模式
      limitedDsApply: false,
      limitedDsApplyConfig: [],
      detailCopy: {},
      modelRules: {
        name: [
          { required: true, message: '请输入模型名称', trigger: 'blur' }
        ]
      },
      editLogMap: new Map(),
      minnVerMap: new Map(),
      tableData: [],
      tableLoading: false,
      modelInfoResult: {
        Attribute: '0',
        DataThreadMessage: '0',
        Diagram: '0',
        Entity: '0',
        ModelReport: '0',
        userCount: '0',
        ModelVersion: ''
      },
      statisticsLoading: true
    }
  },
  created () {
    if (this.detail.modelType === 'Logical') {
      this.$store.commit('setIslogical', true)
    } else {
      this.$store.commit('setIslogical', false)
    }
    this.getModelDetailNums(this.detail.id)
  },
  beforeMount () {
    this.removeExtraUdps()
    this.getLimitedDsApply()
    this.detail.categoryPath = this.path
    this.detail.dataByType = this.dataByType
    if (this.modelTypes.every(v => v.id !== this.detail.phase)) {
      this.$set(this.statusForm, 'modelStatus', '')
    } else {
      this.$set(this.statusForm, 'modelStatus', this.detail.phase)
    }

    this.$bus.$on('updateListRate', this.updateListRate)
  },
  watch: {
    $route () {
      this.id = +this.$route.query.id
    }
  },
  mounted () {
    this.getTags()
    this.getRate()
    this.dataInit()
    this.getVersions()
    this.setResizeStyle()
    // this.handleResize()
    // $(window).resize(this.handleResize)
    // document.addEventListener('visibilitychange', this.handlePageVisbleChange)
  },
  beforeDestroy () {
    // $(window).unbind('resize', this.handleResize)
    // document.removeEventListener('visibilitychange', this.handlePageVisbleChange)
    this.$bus.$off('updateListRate')
  },
  computed: {
    modelTypes () {
      let types = this.$store.getters.phases.filter(v => v.modelPhaseForbidden === false)
      return types.map(v => {
        if (v.modelPhaseBuildIn) {
          return {
            id: v.id - 1,
            name: v.modelPhaseName
          }
        }
        return {
          id: v.id,
          name: v.modelPhaseName
        }
      })
    },
    ...mapState(['branchIdToAllRelatedBranchList'])
  },
  methods: {
    changeDwStatus (val) {
      this.$http.post(`${this.$url}/models/${this.id}/dwModel/${val}`).then(res => {
        this.$datablauMessage.success('修改成功')
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getModelDetailNums (modelId) {
      this.statisticsLoading = true
      HTTP.getModelDetailNums(modelId)
        .then(res => {
          this.statisticsLoading = false
          this.modelInfoResult = res.modelInfoResult
          this.modelInfoResult.currentVersion = res.curVersion
        })
        .catch(err => {
          this.statisticsLoading = false
          this.$showFailure(err)
        })
    },
    toggleTableExpansion (bool) {
      this.tableData.forEach(v => {
        v.expanded = bool
        this.handleRowClick(v)
        this.$refs.expanTable.toggleRowExpansion(v, bool)
      })
    },
    autoToggleTableExpansion () {
      this.toggleTable = !this.toggleTable
      this.toggleTableExpansion(this.toggleTable)
    },
    handleCurrentPaneChange (pane, diabled = false) {
      if (diabled) {
        return
      }
      if (pane === 'views') {
        this.$emit('handleCurrentPaneChange', 'tables', true)
        return
      }
      this.$emit('handleCurrentPaneChange', pane, false)
    },
    go2Theme () {
      let themeNode = document.querySelectorAll('#model-library .theme-box .el-tree-node')[0]
      if (themeNode) {
        themeNode.click()
      }
    },
    load (row, treeNode, resolve) {
      if (row.d[0] === 'v') {
        let result = _.cloneDeep(this.editLogMap.get(row.d))
        // result.forEach(item => {
        //   item.d += Math.random()
        // })
        let promises = []
        result.forEach(v => {
          promises.push(HTTP.getEditLog({ modelId: this.detail.id, verId: v.verId }))
        })
        Promise.all(promises)
          .then(res => {
            res.forEach((log, idx) => {
              let row = result[idx]
              this.$set(row, 'log', log)
              row.isOpen = true
            })
            resolve(result)
          })
          .catch(err => {
            console.error(err)
            this.$showFailure(err)
          })
      }
    },
    getVersions () {
      this.tableLoading = true
      const self = this
      self.$http.get(self.$url + '/service/models/' + this.detail.id + '/versions').then(res => {
        this.tableData = []
        res.data.forEach(item => {
          // if (item.name === 'Latest Version') {
          //   item.timestamp = new Date().getTime()
          // }
          item.d = 'v' + item.id
          item.hasChildren = true
          this.tableData.push(item)
        })

        this.getEditLogs()
        this.tableData.sort((a, b) => {
          return b.timestamp - a.timestamp
        })
        this.tableData = this.tableData.slice(0, 5)
        // this.tableData[this.tableData.length - 1].isLast = true
        self.tableLoading = false
      }).catch(e => {
        self.tableLoading = false
      })
    },
    nl2br (value) {
      if (value) {
        return value.replace(/\n/g, '<br>')
      } else {
        return ''
      }
    },
    scanLog (row) {
      //      this.tableData.forEach(item=>item.isOpen =  false);
      //      row.isOpen = true;
      this.getEditLog(row.verId, row)
    },
    handleRowClick (row, column) {
      if (row.creator) {
        let td = $(this.$el).find(`[data-id=${row.d}]`)
        let icon = (td.parent().parent().parent().find('td').find('i[class*=-icon]'))
        icon.click()
      } else if (row.verId) {
        //        this.getEditLog(row.verId);
      }
    },
    // handleResize () {
    //   this.tableHeight = $('.content-box')[0].offsetHeight - 100
    // },
    getEditLogs () {
      let modelId = this.detail.id
      let requestUrl = `${this.$url}/service/models/${modelId}/editlog/list`
      this.$http.get(requestUrl).then(res => {
        let logs = res.data
        let logsMap = new Map()
        logs.forEach(item => {
          item.d = 'l' + item.verId
          logsMap.set(item.verId, item)
        })
        this.minnVerMap = logsMap
        this.tableData.forEach(item => {
          let arr = []

          if (item.startVersion === item.endVersion) {
            if (logsMap.has(item.endVersion)) {
              let log = _.cloneDeep(logsMap.get(item.endVersion))
              log.d = item.name + 'l' + log.verId
              arr.push(log)
            }
          } else {
            // 修复修改记录比客户端少一条的bug
            for (let i = item.endVersion; i >= item.startVersion; i--) {
              if (logsMap.has(i)) {
                let log = _.cloneDeep(logsMap.get(i))
                log.d = item.name + 'l' + log.verId
                arr.push(log)
              }
            }
          }
          this.editLogMap.set(item.d, arr)
        })
      })
      //      this.$http.get(requestUrl2);
    },
    getEditLog (verId, row) {
      this.tableLoading = true
      let modelId = this.detail.id
      let requestUrl = `${this.$url}/service/models/${modelId}/editlog?startVer=${verId}&endVer=${verId}`
      this.$http.get(requestUrl).then(res => {
        this.log = res.data
        this.$set(row, 'log', res.data)
        row.isOpen = true
        this.logLoading = false
      }).catch(e => {
        this.$showFailure(e)
        this.logLoading = false
      })
    },
    logFormatter (row) {
      let str = ''
      switch (row.opType) {
        case 'CREATE':
          str += this.$store.state.$v.modelDetail.create
          break
        case 'UPDATE':
          str += this.$store.state.$v.modelDetail.mod
          break
        case 'DELETE':
          str += this.$store.state.$v.modelDetail.delete
          break
        default:
          console.error(this.$store.state.$v.modelDetail.noOperation + row.opType)
          break
      }
      str += this.typeFormatter(row)
      str += row.name
      return str
    },
    typeFormatter (a) {
      let typeId
      if (typeof a === 'object') {
        typeId = a.typeId
      } else if (typeof a === 'number') {
        typeId = a
      } else if (typeof a === 'string') {
        typeId = Number.parse(a)
      }
      switch (typeId) {
        case 80000004:
          return this.$store.state.$v.udp.table
        case 80000005:
          return this.$store.state.$v.udp.column
        case 80000006:
          return this.$store.state.$v.udp.category
        case 80000093:
          return this.$store.state.$v.modelDetail.keyKeygroup
        case 80500001:
          return this.$store.state.$v.modelDetail.keyIndex
        case 80500008:
          return this.$store.state.$v.udp.view
          //          return ''
        default:
          return typeId
      }
    },
    renderContent (h, { node, data, store }) {
      return (
        <div class='content-detail'>
          <i class={this.dataIconFunction(data)}></i>
          <div class='content-wrapper'>
            <span class='left'>{!this.isLogical ? LDMTypes[data.tid] === 'Attribute' ? 'Column' : LDMTypes[data.tid] === 'Entity' ? 'Table' : LDMTypes[data.tid] : LDMTypes[data.tid] }</span>
            <span class={!data.ableToMerge ? 'red-bg middle' : 'middle'}>{node.label}</span>
            <span class='right'>{data.ctp}</span>
          </div>
        </div>
      )
    },
    dataIconFunction (data) {
      if (data.tid === 80010001) {
        return 'tree-icon model'
      } else if (data.tid === 80000004) {
        return 'tree-icon entity'
      } else if (data.tid === 80000005) {
        return 'tree-icon attribute'
      } else {
        return `tree-icon ${LDMTypes[data.id].toLowerCase()}`
      }
    },
    exportMergeResult () {
      let str = '对象类型,对象名称,冲突\n'
      const createStr = (data, deep) => {
        for (let i = 0; i < deep; i++) {
          str += '   '
        }
        str += !this.isLogical ? LDMTypes[data.tid] === 'Attribute' ? 'Column' : LDMTypes[data.tid] === 'Entity' ? 'Table' : LDMTypes[data.tid] : LDMTypes[data.tid]
        str += `,${data.ename},${!data.ableToMerge ? '是' : ''}\n`
        if (data.sub) {
          data.sub.forEach(item => {
            createStr(item, deep + 1)
          })
        }
      }
      this.mergeFailureResult.forEach(item => {
        createStr(item, 0)
      })
      // encodeURIComponent解决中文乱码
      const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str)
      // 通过创建a标签实现
      const link = document.createElement('a')
      link.href = uri
      // 对下载的文件命名
      link.download = `${'分支合并冲突.csv'}`
      link.click()
    },
    changeBranchId (id) {
      this.mergeData.startVer = null
      this.mergeData.endVer = null
      this.$http.get(this.$url + '/service/models/' + id + '/versions').then(res => {
        this.branchVersions = res.data.reverse().slice(0, -1)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    confirmMergeBranch () {
      this.$refs.mergeForm.validate((valid) => {
        if (valid) {
          this.$http.post(this.$url + `/service/models/branch/${this.mergeData.branchId}/merge/${this.mergeData.startVer}/${this.mergeData.endVer}/to/${this.id}?includeDiagram=${this.mergeData.includeDiagram}&checkInName=${this.mergeData.mergeName}`, {
            checkInDesc: this.mergeData.des
          }).then(res => {
            if (res.data.automerge) {
              this.$refs.mergeForm.resetFields()
              this.showMergeDialog = false
              this.$blauShowSuccess('合并成功！')
            } else {
              this.mergeFailureResult = [{
                ename: res.data.modelName,
                ableToMerge: true,
                tid: 80010001,
                sub: res.data.elements
              }]
              this.showMergeResultDialog = true
            }
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    cancelMergeBranch () {
      this.showMergeDialog = false
      this.$refs.mergeForm.resetFields()
    },
    showMergePanel () {
      this.showMergeDialog = true
    },
    test () {
      // this.$router.push({
      //   query: {
      //     id: 741599,
      //     pId: this.$route.query.pId,
      //     currentVersion: this.$route.query.currentVersion,
      //     rId: this.$route.query.rId,
      //     objectId: this.$route.query.objectId,
      //     objectType: this.$route.query.objectType,
      //     elementId: this.$route.query.elementId,
      //     parentId: this.$route.query.parentId,
      //     typeId: this.$route.query.typeId,
      //     tab: this.$route.query.tab
      //   }
      // })
      let { pId, currentVersion } = this.$route.query
      window.open(`/#/main/list?id=741599&pId=${pId}`, '_self')
    },
    handlePageVisbleChange () {
      if (this.$store.state.needRefresh) {
        this.$store.commit('setNeedRefresh', false)
        this.refresh()
      }
    },
    goLibrary (id) {
      if (window.location.href.indexOf('modelLibrary') > -1) {
        this.$router.push('/main/modelLibrary?pId=' + id)
      } else {
        if (inElectron) {
          this.$router.push('/electron/main/list?pId=' + id)
        } else {
          this.$router.push('/main/list?pId=' + id)
        }
      }
    },
    dataInit () {
      this.limitedDsApply = this.detail.limitedDsApply
      let limitedDsApplyConfig = {}
      limitedDsApplyConfig = utils.isJSON(this.detail.limitedDsApplyConfig) ? JSON.parse(this.detail.limitedDsApplyConfig) : this.detail.limitedDsApplyConfig
      for (let key in limitedDsApplyConfig) {
        if (limitedDsApplyConfig.hasOwnProperty(key) && limitedDsApplyConfig[key]) {
          this.limitedDsApplyConfig.push(key)
        }
      }
    },
    getLimitedDsApply () {
      if (this.detail.limitedDsApply) {
        this.limitedDsApply = true
      }
    },
    setLimitedDsApply () {
      const config = this.limitedDsApply
      HTTP.setLimitedDsApply({
        modelId: this.detail.id,
        config: config,
        successCallback: data => {
          this.detail.limitedDsApply = config
        }
      })
    },
    getRate () {
      HTTP.getRate({
        id: this.detail.id,
        successCallback: data => {
          this.rate = data
        }
      })
    },
    updateListRate ({ rate, modelId }) {
      this.rate = rate
    },
    getTags () {
      HTTP.getTagsOfModels({
        modelIds: [this.detail.id],
        successCallback: data => {
          if (data[this.detail.id]) {
            this.tags = data[this.detail.id]
            this.$set(this.detail, 'tags', data[this.detail.id])
          }
          this.tagsLoaded = true
        }
      })
    },
    dateFormatter (timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    removeExtraUdps () {
      const model = {}
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000000) {
          if (this.dataByType.model.hasOwnProperty(item.Id)) {
            model[item.Id] = this.dataByType.model[item.Id]
          } else {
            model[item.Id] = ''
          }
        }
      })
      this.udpMessage = model
      this.detail.udpMessage = model
    },
    openTagSelector () {
      this.$refs.tagDialog.openDialog()
      this.$refs.tagDialog.setKeys(this.tags)
    },
    updateTags (tags) {
      let newGroup = tags.map(item => item.id)
      let oldGroup = this.tags.map(item => item.id)
      let added = _.difference(newGroup, oldGroup)
      let minus = _.difference(oldGroup, newGroup)
      let modelId = this.detail.id
      this.unbindTag(modelId, minus, 0, () => {
        this.bindTag(modelId, added, 0, () => {
          this.tags = tags
          this.$set(this.detail, 'tags', tags)
        })
      })
    },
    bindTag (modelId, list, index, callback) {
      if (list.length === 0) {
        if (callback) {
          callback()
        }
      } else {
        let tagId = list[index]
        HTTP.bindTag({
          modelId: modelId,
          tagId: tagId,
          successCallback: () => {
            if (list[index + 1]) {
              this.bindTag(modelId, list, index + 1, callback)
            } else {
              this.$bus.$emit('updateTagsMap')
              if (callback) {
                callback()
              }
            }
          }
        })
      }
    },
    unbindTag (modelId, list, index, callback) {
      if (list.length === 0) {
        if (callback) {
          callback()
        }
      } else {
        let tagId = list[index]
        HTTP.unbindTag({
          modelId: modelId,
          tagId: tagId,
          successCallback: () => {
            if (list[index + 1]) {
              this.unbindTag(modelId, list, index + 1, callback)
            } else {
              this.$bus.$emit('updateTagsMap')
              if (callback) {
                callback()
              }
            }
          }
        })
      }
    },
    changeLimitedDsApply () {
      let config = {
        rColDt: false,
        rColChName: false,
        rColName: false
      }
      if (!this.limitedDsApply) {
        this.limitedDsApplyConfig = []
      }
      this.limitedDsApplyConfig.forEach(item => {
        config[item] = true
      })
      let para = {
        modelId: this.detail.id,
        limitedDsApply: this.limitedDsApply,
        requestBody: config,
        successCallback: () => {
          let para = {
            modelId: this.detail.id,
            modelName: this.detail.modelName,
            limitedDsApply: this.limitedDsApply,
            config
          }
          if (this.$store.state.modelsTree) {
            this.setModelLimitedConfig(para, this.$store.state.modelsTree)
            this.$datablauMessage.success(this.$store.state.$v.OperationReport.successfully)
          } else {
            HTTP.getModels({
              successCallback: (data) => {
                this.$store.state.modelsTree = data
                this.setModelLimitedConfig(para, this.$store.state.modelsTree)
                this.$datablauMessage.success(this.$store.state.$v.OperationReport.successfully)
              }
            })
          }
        }
      }

      HTTP.setLimitedConfig(para)
    },
    setModelLimitedConfig (para, modelTree) {
      // let modelTree = this.$store.state.modelsTree
      function getModel (node, id, modelName) {
        let models = node.models
        let result = null
        if (models && Array.isArray(models) && models.length) {
          models.forEach(item => {
            if (item.id === id) {
              result = item
            }
          })
        }
        if (result) {
          return result
        } else if (node.children && Array.isArray(node.children)) {
          let result = null
          let tree = node.children
          tree.forEach(item => {
            if (!result) {
              result = getModel(item, id, modelName)
            }
          })
          return result
        } else {
          return null
        }
      }

      let model = getModel(modelTree, para.modelId, para.modelName)
      model.limitedDsApply = para.limitedDsApply
      model.limitedDsApplyConfig = JSON.stringify(para.config)
      this.detail.limitedDsApply = para.limitedDsApply
      this.detail.limitedDsApplyConfig = JSON.stringify(para.config)
    },
    editModelStatus () {
      this.showEditModelStatus = true
    },
    editModelName () {
      this.detailCopy = _.cloneDeep(this.detail)
      this.showEditModelName = true
    },
    editModelDescription () {
      this.showEditModelDescription = true
    },
    saveModeName () {
      this.$refs['modelInfoForm'].validate((valid) => {
        if (valid) {
          HTTP.modModelInfo({
            name: this.detailCopy.name,
            description: this.detailCopy.description,
            id: this.detail.id
          }).then(res => {
            this.$message.success('修改成功')
            this.showEditModelName = false
            if (!this.detail.branch) {
              this.$set(this.detail, 'modelName', this.detailCopy.name)
            }
            this.$set(this.detail, 'name', this.detailCopy.name)
            this.$set(this.detail, 'description', this.detailCopy.description)
          }).catch(err => {
            this.$showFailure(err)
          })
        } else {
          return false
        }
      })
    },
    saveModelDescription () {
      HTTP.modModelInfo({
        description: this.detailCopy.description,
        id: this.detail.id
      }).then(res => {
        this.$message.success('修改成功')
        this.showEditModelDescription = false
        this.detail.description = this.detailCopy.description
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    saveModeStatus () {
      HTTP.changeModelStatus({
        modelId: this.detail.id,
        phase: this.statusForm.modelStatus
      })
        .then(res => {
          // console.log(res)
          this.showEditModelStatus = false
          this.$datablauMessage.success(this.$store.state.$v.modelList.modelStatus + this.$store.state.$v.modelDetail.successfully)
          // this.detail.phase = this.modelStatus
          this.detail.phase = res.phase
          this.$bus.$emit('changeModelStatus', this.detail)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setResizeStyle () {
      let $titleCom = $('.branch-name.name-tooltip')
      let $container = $('.el-main.content-box.model-details-content')
      let containerWidth = $container.width()
      $titleCom.css('max-width', containerWidth - 900)
    },
    handleClose (tag, index) {
      this.unbindTag(this.detail.id, [tag.id], 0, () => {
        this.tags.splice(index, 1)
      })
    }
  }
}
