import fieldTitle from './fieldTitle.vue'
import pushToGit from '@/components/common/pushToGit.vue'
import ddlSetting from '@/views/list/script/ddlSetting.vue'
import jpaSetting from '@/views/list/script/jpaClass/jpaSetting.vue'
import editLogList from './editLogList.vue'
import $ from 'jquery'
import { mapState } from 'vuex'
import LDMTypes from '@constant/LDMTypes'
import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import monacoEditor from '@/components/monacoEditor/monacoEditor.vue'
import verImg from '@/assets/images/icon/version.svg'

export default {
  components: {
    fieldTitle,
    ddlSetting,
    jpaSetting,
    monacoEditor,
    pushToGit,
    editLogList
  },
  props: {
    modelId: {
      required: true
    },
    currentModel: {
      required: true
    },
    path: {}
  },
  data () {
    return {
      showConflictMerge: window.setting.showConflictMerge,
      iframeSrc: null,
      verImg,
      jpaPackageName: '',
      editableTabsValue: '1',
      editableTabs: [],
      currentTab: 'version',
      tabIndex: 0,

      showJpaSettingDialog: false,
      currentFesTemplateType: '',
      jpaEntityCodes: '',
      isRenderEditorPage: false,
      isRenderEditor: true,
      isEditorLoading: false,
      editorErrorMsg: this.$store.state.$v.dataEntity.noError,
      errClassList: [],
      classList: [],
      currentExpandKey: [],

      loading: false,
      multipleSelection: [],
      hideAlterDbs: ['MongoDB', 'Cassandra'].map((item) => item.toLowerCase()),
      showSettingDialog: false,
      createScriptLoading: false,
      option: null,
      options: null,
      scriptTitle: this.$store.state.$v.dataEntity.noMsg,
      incrementalScript: '',
      scriptKey: 0,

      toggleTable: false,
      id: +this.$route.query.id,
      branchVersions: [],
      tableData: [],
      tableLoading: false,
      tableHeight: $('.content-box')[0].offsetHeight - 100,
      editLogMap: new Map(),
      minnVerMap: new Map(),
      log: [],
      logLoading: false,
      exportDDLVisible: false,
      exportJPAVisible: false,
      isLogical: false,
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
          {
            required: true,
            message: '请选择合并分支',
            trigger: ['blur', 'change']
          }
        ],
        startVer: [
          { required: true, message: '请选择起始版本', trigger: 'change' }
        ],
        endVer: [
          { required: true, message: '请选择结束版本', trigger: 'change' }
        ],
        mergeName: [
          {
            required: true,
            message: '请输入版本名称',
            trigger: ['blur', 'change']
          }
        ]
      },
      lock: false,
      mergeFailureResult: [],
      showMergeDialog: false,
      showMergeResultDialog: false,
      displayData: [],
      keyword: '',
      loadingScript: false,
      modelAdmin:
        this.currentModel.permission?.admin || this.$store.state.user.isAdmin
    }
  },
  computed: {
    ...mapState(['branchIdToAllRelatedBranchList']),
    showTabs () {
      return this.editableTabs?.length > 0
    }
  },
  created () {
    this.isLogical = this.$store.state.isLogical
    this.getScriptOption(true)
    this.getJpaOption(true)
  },
  mounted () {
    this.getVersions(this.modelId)
    this.handleResize()
    $(window).resize(this.handleResize)
  },
  beforeDestroy () {
    $(window).unbind('resize', this.handleResize)
  },
  methods: {
    downloadDDM () {
      let webPath = window.setting.products.ddm.webPath || '/'
      let url = `${webPath}static/download/DDMCCMacSetup.dmg`
      window.open(url)
    },
    signInDDM () {
      let p1 = this.$http.get(this.$url + '/service/configs/')
      let p2 = this.$http.get(this.$url + `/service/main/login/web/token`)
      Promise.all([p1, p2]).then(async res => {
        let config = res[0]?.data || []
        let hostname = ''
        let port = ''
        let UseHttps = ''
        config.forEach(item => {
          if (item.propertyName === 'configurable.server.https') {
            if (item.propertyValue !== '') {
              UseHttps = item.propertyValue === true || item.propertyValue === 'true'
            } else {
              UseHttps = window.location.protocol !== 'http:'
            }
          } else if (item.propertyName === 'configurable.server.ip') {
            hostname = item.propertyValue || location.hostname
          } else if (item.propertyName === 'configurable.server.port') {
            port = item.propertyValue || ''
          }
        })
        let defaultPort = UseHttps ? 443 : 80
        port = port || location.port || defaultPort
        try {
          let res1 = await this.$http.get(this.$url + '/service/models/' + this.mergeDataCopy.branchId + '?withPath=true')
          let res2 = await this.$http.get(this.$url + '/service/models/' + this.id + '?withPath=true')
          let versionsRes = await this.$http.get(this.$url + '/service/models/' + this.id + '/versions')
          let version = versionsRes.data[0]
          let leftVersion = this.branchVersions.find(i => i.id === this.mergeDataCopy.endVer)
          let obj = {
            leftModelId: this.mergeDataCopy.branchId,
            leftVersionId: null,
            leftPath: encodeURIComponent(res1.data.path.replace(/&record=\d+/, '')),
            leftVersion: encodeURIComponent(leftVersion.name),
            leftVersionNumber: leftVersion.endVersion,
            rightModelId: this.id,
            rightVersionId: null,
            rightPath: encodeURIComponent(res2.data.path.replace(/&record=\d+/, '')),
            rightVersion: encodeURIComponent(version.name),
            rightVersionNumber: version.endVersion
          }
          const json = {
            Host: hostname,
            Port: port,
            App: 'ddm',
            WebLoginToken: res[1].data,
            UseHttps: UseHttps,
            ...obj
          }
          const s = JSON.stringify(json)
          this.iframeSrc = 'ddmcc:' + `${btoa(JSON.stringify(json))}`
          this.$message({
            message: `正在尝试启动DDM客户端。如未看到启动界面，请检查DDM客户端是否已被正确的安装和配置`,
            type: 'warning',
            duration: 8000,
            showClose: true
          })
          setTimeout(() => {
            this.iframeSrc = ''
          }, 100)
        } catch (err) {
          this.$showFailure(err)
        }
      })
    },
    search (val) {
      this.tableLoading = true
      if (val.trim() !== '') {
        this.displayData = this.tableData.filter((v) => {
          let user = v.creator ? v.creator : v.user
          let description = v.description || ''
          let result =
            v.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            (!v.user &&
              description.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
            user.toLowerCase().indexOf(val.toLowerCase()) > -1
          return result
        })
      } else {
        this.displayData = this.tableData
      }
      this.tableLoading = false
    },
    downloadJpa (content, className) {
      if (content) {
        string.exportToFile(content, `${className}export.java`)
      } else {
        this.$message.info(this.$store.state.$v.report.mes6)
      }
    },
    copyJpa (content, className) {
      if (content) {
        string.setClipBoard(content)
        this.$blauShowSuccess(this.$store.state.$v.report.mes8)
      } else {
        this.$message.info(this.$store.state.$v.report.mes7)
      }
    },
    handleExpanChange (row) {
      this.highlight()
      // this.currentJpaStr = row.content
      // this.currentJpaClassName = row.className
      if (
        this.currentExpandKey.length > 0 &&
        row.index === this.currentExpandKey[0]
      ) {
        this.currentExpandKey = []
        return
      }
      this.currentExpandKey = [row.index]
    },
    handleClick (row) {
      // this.currentJpaStr = row.content
      // this.currentJpaClassName = row.className
      if (
        this.currentExpandKey.length > 0 &&
        row.index === this.currentExpandKey[0]
      ) {
        this.currentExpandKey = []
        return
      }
      this.currentExpandKey = [row.index]
      this.highlight()
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return 'row-can-click'
    },
    getRowKey (row) {
      return row.index
    },
    handleEditClick (type) {
      this.currentFesTemplateType = type
      this.getFesTemplate(type)
    },
    getFesTemplate (type) {
      this.loading = true
      this.$http
        .get(`${this.$url}/service/models/fesTemplate?group=jpa&name=${type}`)
        .then((res) => {
          if (res.data.success) {
            this.jpaEntityCodes = res.data.data
            this.isRenderEditorPage = true
            this.showJpaSettingDialog = false
          } else {
            // 没有修改模型模板则获取默认模板
            this.getDefaultFesTemplate(type)
          }
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
          this.$showFailure('加JPA class载模板失败')
          console.error(err)
        })
    },
    getDefaultFesTemplate (type) {
      this.loading = true
      return this.$http
        .get(
          `${this.$url}/service/models/defaultFesTemplate?group=jpa&name=${type}`
        )
        .then((res) => {
          if (res.data.success) {
            this.jpaEntityCodes = res.data.data
            this.loading = false
            this.isRenderEditorPage = true
            this.showJpaSettingDialog = false
            return Promise.resolve('success')
          } else {
            console.log(res.data)
          }
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
          this.$showFailure('加JPA class载模板失败')
          console.error(err)
        })
    },
    saveFesTemplate () {
      this.isEditorLoading = true
      let obj = { template: this.jpaEntityCodes }
      this.$http
        .put(
          `${this.$url}/service/models/fesTemplate?group=jpa&name=${this.currentFesTemplateType}`,
          obj
        )
        .then((res) => {
          if (res.data.success) {
            this.$blauShowSuccess(this.$store.state.$v.report.templateSave)
          } else {
            // console.error(res.data)
            let errorMsg = res.data.data.msg
            this.$showFailure(
              `${this.$store.state.$v.report.temFailed}:${errorMsg}`
            )
            this.editorErrorMsg = errorMsg
            this.jpaEntityErrors = [
              {
                startLineNumber: res.data.data.line,
                startColumn: 0,
                endLineNumber: res.data.data.line,
                endColumn: res.data.data.column,
                message: errorMsg
              }
            ]
          }
          this.isEditorLoading = false
        })
        .catch((err) => {
          this.isEditorLoading = false
          this.$showFailure('模板保存失败')
          console.error(err)
        })
    },
    handleResetEditor () {
      this.getDefaultFesTemplate(this.currentFesTemplateType).then((res) => {
        this.isRenderEditor = false
        setTimeout(() => {
          this.$blauShowSuccess(this.$store.state.$v.report.resetTem)
          this.isRenderEditor = true
        })
      })
    },
    getJpaOption (notOpenDialog = false) {
      this.loading = true
      this.option = null
      // 获取当前模型的配置
      this.$http
        .get(`${this.$url}/service/models/${this.modelId}/option?type=JPA`)
        .then((res) => {
          if (res.data === '') {
            // 获取默认配置
            this.$http
              .get(this.$url + '/service/models/jpaClasses/option')
              .then((res) => {
                const option = res.data
                // if (localStorage.getItem('jpa-setting')) {
                //   const str = localStorage.getItem('jpa-setting')
                //   this.options = new Set(JSON.parse(localStorage.getItem('jpa-setting')))
                // }
                // if (this.options) {
                //   this.forEachData(res.data.children)
                // }
                this.option = option
                if (!notOpenDialog) {
                  this.showJpaSettingDialog = true
                }
              })
              .catch((e) => {
                this.incrementalScript = ''
                this.$showFailure(e)
              })
              .then(() => {
                this.loading = false
              })
          } else {
            this.option = JSON.parse(res.data.option)
            if (!notOpenDialog) {
              this.showJpaSettingDialog = true
            }
            this.loading = false
          }
        })
        .catch((e) => {
          this.incrementalScript = ''
          this.$showFailure(e)
        })
    },
    downloadScript (content) {
      if (content) {
        string.exportToFile(content, 'export.sql')
      } else {
        this.$message.info(this.$store.state.$v.report.mes3)
      }
    },
    copyScript (content) {
      if (content) {
        string.setClipBoard(content)
        this.$blauShowSuccess(this.$store.state.$v.report.mes5)
      } else {
        this.$message.info(this.$store.state.$v.report.mes4)
      }
    },
    addTab (targetName, content, isJpa = false) {
      let newTabName = ++this.tabIndex + ''
      this.editableTabs.push({
        title: targetName,
        name: newTabName,
        key: this.scriptKey,
        content,
        isJpa
      })
      this.editableTabsValue = newTabName
      this.currentTab = newTabName
      // this.highlight()
    },
    highlight () {
      this.loadingScript = true
      // console.log('highlight')
      setTimeout(() => {
        Prism.highlightAll()
        setTimeout(() => {
          this.loadingScript = false
        }, 100)
      }, 500)
      // this.$nextTick(() => {
      //   Prism.highlightAll()
      // })
    },
    removeTab (targetName) {
      let tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            } else {
              activeName = 'version'
            }
          }
        })
      }
      this.currentTab = activeName
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    },
    formatLatestVersionId (version) {
      if (version.name === 'Latest Version') {
        return -1
      } else {
        return version.id
      }
    },
    getScript () {
      this.createScriptLoading = true
      const val = this.multipleSelection
      this.selection = val
      const length = val.length
      val.sort((a, b) => {
        return a.timestamp - b.timestamp
      })
      if (length === 0) {
        this.scriptTitle = NoSelectionMessage
        this.incrementalScript = ''
      } else if (length === 1) {
        this.scriptTitle = `${this.$store.state.$v.report.ver1}"${val[0].name}"${this.$store.state.$v.report.ver2}`
        this.getCreateScript()
      } else if (length === 2) {
        this.scriptTitle = `${this.$store.state.$v.report.ver3}"${val[0].name}"${this.$store.state.$v.report.ver4}"${val[1].name}"${this.$store.state.$v.report.ver5}`
        this.getAlterScript()
      } else {
        this.scriptTitle = NoSelectionMessage
        this.incrementalScript = ''
      }
    },
    getCreateScript () {
      this.loading = true
      const targetVerId = this.formatLatestVersionId(this.multipleSelection[0])
      const keys = this.$refs.ddlSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.ddlSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http
        .post(
          this.$url +
            `/service/models/${this.modelId}/script?targetVerId=${targetVerId}&mode=CREATE`,
          {
            option: this.option
          }
        )
        .then((res) => {
          let incrementalScript = res.data.create
            ? res.data.create
            : this.$store.state.$v.report.noContent
          this.scriptKey++
          this.showSettingDialog = false
          this.loading = false
          this.addTab(
            `【${this.multipleSelection[0].name}】SQL脚本`,
            incrementalScript
          )
          this.toggleSelection()
          // this.highlight()
        })
        .catch((e) => {
          this.loading = true
          this.$showFailure(e)
        })
        .finally(() => {
          this.createScriptLoading = false
        })
    },
    getAlterScript () {
      this.loading = true
      this.createScriptLoading = true
      this.multipleSelection.sort((a, b) => {
        return a.id - b.id
      })
      const baseVerId = this.formatLatestVersionId(this.multipleSelection[0])
      const targetVerId = this.formatLatestVersionId(this.multipleSelection[1])
      const keys = this.$refs.ddlSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.ddlSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http
        .post(
          this.$url +
            `/service/models/${this.modelId}/script?targetVerId=${targetVerId}&baseVerId=${baseVerId}&mode=ALTER`,
          {
            option: this.option
          }
        )
        .then((res) => {
          let incrementalScript = res.data.alter
            ? res.data.alter
            : this.$store.state.$v.report.noContent
          this.showSettingDialog = false
          this.loading = false
          this.addTab(
            `【${this.multipleSelection[0].name}】和【${this.multipleSelection[1].name}】SQL脚本`,
            incrementalScript
          )
          this.toggleSelection()
          this.scriptKey++
          // this.highlight()
        })
        .catch((e) => {
          this.loading = false
          this.$showFailure(e)
        })
        .finally(() => {
          this.createScriptLoading = false
        })
    },
    getScriptOption (notOpenDialog = false) {
      this.loading = true
      this.option = null
      // 获取当前模型的配置
      this.$http
        .get(
          `${this.$url}/service/models/${this.modelId}/option?type=${
            this.multipleSelection.length === 2 ? 'AlterDDL' : 'CreateDDL'
          }`
        )
        .then((res) => {
          this.option = JSON.parse(res.data.option)
          this.loading = false
          if (!notOpenDialog) {
            this.showSettingDialog = true
          }
        })
        .catch((e) => {
          this.incrementalScript = ''
          this.$showFailure(e)
        })
    },
    saveOption () {
      this.loading = true
      const keys = this.$refs.ddlSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.ddlSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http
        .post(`${this.$url}/service/models/option`, {
          option: JSON.stringify(_.cloneDeep(this.option)),
          modelId: this.modelId,
          type: `${
            this.multipleSelection.length === 2 ? 'AlterDDL' : 'CreateDDL'
          }`
        })
        .then((res) => {
          // this.getScript()
          this.$blauShowSuccess('配置保存成功')
          this.loading = false
        })
        .catch((e) => {
          this.showSettingDialog = true
          this.$showFailure(e)
        })
    },
    saveJpaOption () {
      this.createScriptLoading = true
      this.loading = true
      const keys = this.$refs.jpaSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.jpaSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http
        .post(`${this.$url}/service/models/option`, {
          option: JSON.stringify(this.option),
          modelId: this.modelId,
          type: 'JPA'
        })
        .then((res) => {
          this.$blauShowSuccess('配置保存成功')
          this.loading = false
        })
        .catch((e) => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.createScriptLoading = false
        })
    },
    getJpa () {
      this.loading = true
      this.createScriptLoading = true
      this.errClassList = []
      const targetVerId = this.formatLatestVersionId(this.multipleSelection[0])
      const keys = this.$refs.jpaSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.jpaSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http
        .post(
          this.$url +
            `/service/models/${this.modelId}/jpaClasses?targetVerId=${targetVerId}`,
          {
            setting: {
              option: this.option,
              params: {
                packageName: this.jpaPackageName
              }
            },
            templateGroup: 'jpa'
          }
        )
        .then((res) => {
          let classList = []
          let errClassList = []
          if (res.data.success) {
            classList = res.data.data
          } else {
            errClassList = res.data.data || []
            this.$showFailure('解析失败')
          }
          this.addTab(
            `【${this.multipleSelection[0].name}】JPA Class`,
            { classList, errClassList },
            true
          )
          this.showJpaSettingDialog = false
          // this.highlight()
        })
        .catch((e) => {
          this.incrementalScript = ''
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
          this.createScriptLoading = false
        })
    },
    forEachData (array) {
      const checkMap = new Set()
      const forEach = (array) => {
        array.forEach((item) => {
          if (item.children && item.children.length > 0) {
            item.selected = this.options.has(item.id)
            forEach(item.children)
          } else {
            item.selected = this.options.has(item.id)
          }
        })
      }
      forEach(array)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    toggleSelection (rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.expanTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.expanTable.clearSelection()
      }
    },
    canSelect (row) {
      return (
        this.multipleSelection.length < 2 ||
        this.multipleSelection.some((v) => v.id === row.id)
      )
    },
    toggleTableExpansion (bool) {
      this.tableData.forEach((v) => {
        v.expanded = bool
        this.handleRowClick(v)
        this.$refs.expanTable.toggleRowExpansion(v, bool)
      })
    },
    autoToggleTableExpansion () {
      this.toggleTable = !this.toggleTable
      this.toggleTableExpansion(this.toggleTable)
    },
    exportMergeResult () {
      let str = '对象类型,对象名称,冲突\n'
      const createStr = (data, deep) => {
        for (let i = 0; i < deep; i++) {
          str += '   '
        }
        str += !this.isLogical
          ? LDMTypes[data.tid] === 'Attribute'
            ? 'Column'
            : LDMTypes[data.tid] === 'Entity'
              ? 'Table'
              : LDMTypes[data.tid]
          : LDMTypes[data.tid]
        str += `,${data.ename},${!data.ableToMerge ? '是' : ''},${data.ctp}\n`
        if (data.sub) {
          data.sub.forEach((item) => {
            createStr(item, deep + 1)
          })
        }
      }
      this.mergeFailureResult.forEach((item) => {
        createStr(item, 0)
      })
      // encodeURIComponent解决中文乱码
      const uri =
        'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str)
      // 通过创建a标签实现
      const link = document.createElement('a')
      link.href = uri
      // 对下载的文件命名
      link.download = `${'分支合并冲突.csv'}`
      link.click()
    },
    confirmMergeBranch () {
      if (this.lock) {
        return
      }
      this.$refs.mergeForm.validate((valid) => {
        if (valid) {
          this.mergeDataCopy = _.cloneDeep(this.mergeData)
          this.lock = true
          this.$http
            .post(
              this.$url +
                `/service/models/branch/${this.mergeData.branchId}/merge/${this.mergeData.startVer}/${this.mergeData.endVer}/to/${this.id}?includeDiagram=${this.mergeData.includeDiagram}&checkInName=${this.mergeData.mergeName}`,
              {
                checkInDesc: this.mergeData.des
              }
            )
            .then((res) => {
              if (res.data.automerge) {
                this.$refs.mergeForm.resetFields()
                this.showMergeDialog = false
                this.$blauShowSuccess('合并成功！')
              } else {
                this.mergeFailureResult = [
                  {
                    ename: res.data.modelName,
                    ableToMerge: true,
                    tid: 80010001,
                    sub: res.data.elements
                  }
                ]
                this.showMergeResultDialog = true
              }
            })
            .catch((err) => {
              this.$showFailure(err)
            })
            .finally(() => {
              this.lock = false
            })
        }
      })
    },
    dataIconFunction (data) {
      if (data.tid === 80010001) {
        return 'tree-icon model'
      } else if (data.tid === 80000004) {
        return 'tree-icon entity'
      } else if (data.tid === 80000005) {
        return 'tree-icon attribute'
      } else {
        return `tree-icon ${LDMTypes[data.id]?.toLowerCase() || ''}`
      }
    },
    cancelMergeBranch () {
      this.showMergeDialog = false
      this.$refs.mergeForm.resetFields()
    },
    changeBranchId (id) {
      this.mergeData.startVer = null
      this.mergeData.endVer = null
      this.$http
        .get(this.$url + '/service/models/' + id + '/versions')
        .then((res) => {
          this.branchVersions = res.data.reverse().slice(0, -1)
        })
        .catch((err) => {
          this.$showFailure(err)
        })
    },
    renderContent (h, { node, data, store }) {
      return (
        <div class="content-detail">
          <i class={this.dataIconFunction(data)}></i>
          <div class="content-wrapper">
            <span class="left">
              {!this.isLogical
                ? LDMTypes[data.tid] === 'Attribute'
                  ? 'Column'
                  : LDMTypes[data.tid] === 'Entity'
                    ? 'Table'
                    : LDMTypes[data.tid]
                : LDMTypes[data.tid]}
            </span>
            <span class={!data.ableToMerge ? 'red-bg middle' : 'middle'}>
              {node.label}
            </span>
            <span class="right">{data.ctp}</span>
          </div>
        </div>
      )
    },
    showMergePanel () {
      this.showMergeDialog = true
    },
    handleResize () {
      this.tableHeight = $('.content-box')[0].offsetHeight - 100
    },
    getEditLogs () {
      let modelId = this.modelId
      let requestUrl = `${this.$url}/service/models/${modelId}/editlog/list`
      this.$http.get(requestUrl).then((res) => {
        let logs = res.data
        let logsMap = new Map()
        logs.forEach((item) => {
          item.d = `l${item.verId}`
          logsMap.set(item.verId, item)
        })
        this.minnVerMap = logsMap
        this.tableData.forEach((item) => {
          let arr = []
          if (item.startVersion === item.endVersion) {
            if (logsMap.has(item.endVersion)) {
              let log = _.cloneDeep(logsMap.get(item.endVersion))
              log.d = `${item.name}l${log.verId}`
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
    },
    getEditLog (verId, row) {
      this.logLoading = true
      let modelId = this.modelId
      let requestUrl = `${this.$url}/service/models/${modelId}/editlog?startVer=${verId}&endVer=${verId}`
      this.$http
        .get(requestUrl)
        .then((res) => {
          this.log = res.data
          this.$set(row, 'log', res.data)
          row.isOpen = true
          this.logLoading = false
        })
        .catch((e) => {
          this.$showFailure(e)
          this.logLoading = false
        })
    },
    load (row, treeNode, resolve) {
      if (row.d[0] === 'v') {
        let result = _.cloneDeep(this.editLogMap.get(row.d)) || []
        result = result.map(item => {
          return {
            modelId: this.modelId,
            verId: item.verId,
            d: `subLogs_${item.verId}`
          }
        })
        resolve(result)
        // let promises = []
        // result.forEach((v) => {
        //   promises.push(
        //     HTTP.getEditLog({ modelId: this.modelId, verId: v.verId })
        //   )
        // })
        // Promise.all(promises)
        //   .then((res) => {
        //     res.forEach((log, idx) => {
        //       let row = result[idx]
        //       this.$set(row, 'log', log)
        //       row.isOpen = true
        //     })
        //     resolve(result)
        //   })
        //   .catch((err) => {
        //     console.error(err)
        //     this.$showFailure(err)
        //   })
      }
    },
    getVersions (modelId) {
      this.tableLoading = true
      const self = this
      self.$http
        .get(self.$url + '/service/models/' + modelId + '/versions')
        .then((res) => {
          this.tableData = []
          res.data.forEach((item) => {
            item.d = 'v' + item.id
            item.hasChildren = true
            this.tableData.push(item)
          })

          this.getEditLogs()
          this.tableData.sort((a, b) => {
            return b.timestamp - a.timestamp
          })
          this.tableData[this.tableData.length - 1].isLast = true
          this.displayData = this.tableData
          self.tableLoading = false
        })
        .catch((e) => {
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
    handleRowClick (row, column) {
      if (row.creator) {
        let td = $(this.$el).find(`[data-id=${row.d}]`)
        let icon = td
          .parent()
          .parent()
          .parent()
          .find('td')
          .find('i[class*=-icon]')
        icon.click()
      } else if (row.verId) {
      }
    },
    pushToGit (script) {
      this.$refs.pushToGit
        .open({ script, modelId: this.modelId })
        .then((res) => {})
        .catch((e) => {
          console.log(e)
        })
    },
    scanLog (row) {
      this.getEditLog(row.verId, row)
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
          console.error(
            this.$store.state.$v.modelDetail.noOperation + row.opType
          )
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
        case 80010001:
          return this.$store.state.$v.udp.Model
        case 80100073:
          return this.$store.state.$v.dataEntity.business
        default:
          return typeId
      }
    },
    onJpaEntityCodeChange (currentCodes) {
      this.jpaEntityCodes = currentCodes
    }
  },
  watch: {
    modelId (newVal) {
      this.log = []
      this.getVersions(newVal)
    },
    currentTab () {
      this.highlight()
    },
    isRenderEditorPage (newVal) {
      this.$bus.$emit('reset-main-z-index', newVal)
    },
    $route () {
      this.id = +this.$route.query.id
    }
  }
}
