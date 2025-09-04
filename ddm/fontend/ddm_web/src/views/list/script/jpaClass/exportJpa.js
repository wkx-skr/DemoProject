import HTTP from '@/resource/http'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import string from '@/resource/utils/string'
import $ from 'jquery'
import jpaSetting from './jpaSetting.vue'
import monacoEditor from '@/components/monacoEditor/monacoEditor.vue'

const NoSelectionMessage = '请选择一个版本查看CREATE脚本，或选择两个版本查看ALTER脚本'
export default {
  components: {
    jpaSetting,
    monacoEditor
  },
  props: {
    modelId: {
      required: true
    }
  },
  data () {
    return {
      tableData: [],
      errClassList: [],
      classList: [],
      multipleSelection: [],
      incrementalScript: '',
      scriptKey: 0,
      scriptTitle: NoSelectionMessage,
      option: null,
      options: null,
      loading: false,
      showSettingDialog: false,
      currentExpandKey: [],
      jpaPackageName: '',
      currentJpaStr: '',
      currentJpaClassName: '',
      jpaEntityErrors: [],
      jpaEntityCodes: '',
      isRenderEditorPage: false,
      isRenderEditor: true,
      isEditorLoading: false,
      currentFesTemplateType: '',
      editorErrorMsg: this.$store.state.$v.dataEntity.noError,
      modelAdmin: false,
      activeName: ''
    }
  },
  mounted () {
    this.getModelPermission()
    this.getVersions()
    this.getJpaOption(true)
  },
  methods: {
    getModelPermission () {
      HTTP.getModelPermission({ modelId: this.modelId })
        .then(res => {
          if (res.data.admin) {
            this.modelAdmin = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEditClick (type) {
      this.currentFesTemplateType = type
      this.getFesTemplate(type)
      this.showSettingDialog = false
    },
    onJpaEntityCodeChange (currentCodes) {
      this.jpaEntityCodes = currentCodes
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
      return 'row-can-click'
    },
    getRowKey (row) {
      return row.index
    },
    handleClick (row) {
      this.currentJpaStr = row.content
      this.currentJpaClassName = row.className
      if (this.currentExpandKey.length > 0) {
        this.currentExpandKey = []
        return
      }
      this.currentExpandKey = [row.index]
      this.highlight()
    },
    getVersions () {
      HTTP.getVersions({
        modelId: this.modelId,
        successCallback: data => {
          this.tableData = data
          setTimeout(() => {
            $('table th .el-checkbox').remove()
          })
        }
      })
    },
    toggleSelection (row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    getScript () {
      const val = this.multipleSelection
      this.selection = val
      this.getJpaClass()
      // const length = val.length
      // val.sort((a, b) => {
      //   return a.timestamp - b.timestamp
      // })
      // if (length === 0) {
      //   this.scriptTitle = NoSelectionMessage
      //   this.incrementalScript = ''
      // } else if (length === 1) {
      //   this.scriptTitle = `版本"${val[0].name}"的CREATE脚本`
      //   this.getCreateScript()
      // } else if (length === 2) {
      //   this.scriptTitle = `版本"${val[0].name}"和"${val[1].name}"的ALTER脚本`
      //   this.getAlterScript()
      // } else {
      //   this.scriptTitle = NoSelectionMessage
      //   this.incrementalScript = ''
      // }
    },
    handleExpanChange (row) {
      this.highlight()
      this.currentJpaStr = row.content
      this.currentJpaClassName = row.className
      if (this.currentExpandKey.length > 0) {
        this.currentExpandKey = []
        return
      }
      this.currentExpandKey = [row.index]
    },
    handleSelectionChange (val) {
      if (val.length > 1) {
        this.$refs.multipleTable.clearSelection()
        this.$refs.multipleTable.toggleRowSelection(val[val.length - 1])
      } else if (val.length === 0) {
        this.multipleSelection = []
      } else {
        this.multipleSelection = [val[val.length - 1]]
      }
    },
    getJpaOption (notOpenDialog = false) {
      this.loading = true
      this.option = null
      // 获取当前模型的配置
      this.$http.get(`${this.$url}/service/models/${this.modelId}/option?type=JPA`).then(res => {
        if (res.data === '') {
          // 获取默认配置
          this.$http.get(this.$url + '/service/models/jpaClasses/option').then(res => {
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
              this.showSettingDialog = true
            }
          }).catch(e => {
            this.incrementalScript = ''
            this.$showFailure(e)
          }).then(() => {
            this.loading = false
          })
        } else {
          this.option = JSON.parse(res.data.option)
          if (!notOpenDialog) {
            this.showSettingDialog = true
          }
          this.loading = false
        }
      })
        .catch(e => {
          this.incrementalScript = ''
          this.$showFailure(e)
        })
    },
    saveOption () {
      this.$http.post(`${this.$url}/service/models/option`, {
        option: JSON.stringify(this.option),
        modelId: this.modelId,
        type: 'JPA'
      })
        .then(res => {
          this.getScript()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateData (array) {
      // localStorage.setItem('jpa-setting', JSON.stringify(array))
      this.options = new Set(array)
      this.forEachData(this.option.children)
      this.saveOption()
    },
    forEachData (array) {
      const checkMap = new Set()
      const forEach = array => {
        array.forEach(item => {
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
    formatLatestVersionId (version) {
      if (version.name === 'Latest Version') {
        return -1
      } else {
        return version.id
      }
    },
    getJpaClass () {
      console.log('ppp')
      this.loading = true
      this.errClassList = []
      const targetVerId = this.formatLatestVersionId(this.multipleSelection[0])
      this.$http.post(this.$url + `/service/models/${this.modelId}/jpaClasses?targetVerId=${targetVerId}`, {
        setting: {
          option: this.option,
          params: {
            packageName: this.jpaPackageName
          }
        },
        templateGroup: 'jpa'
      }).then(res => {
        if (res.data.success) {
          this.classList = res.data.data
        } else {
          this.errClassList = res.data.data || []
          this.$showFailure('解析失败')
        }
        this.highlight()
      }).catch(e => {
        this.incrementalScript = ''
        this.$showFailure(e)
      }).then(() => {
        this.loading = false
      })
    },
    // getAlterScript () {
    //   this.multipleSelection.sort((a, b) => {
    //     return a.id - b.id
    //   })
    //   const baseVerId = this.formatLatestVersionId(this.multipleSelection[0])
    //   const targetVerId = this.formatLatestVersionId(this.multipleSelection[1])
    //   this.$http.post(this.$url + `/service/models/${this.modelId}/script?targetVerId=${targetVerId}&baseVerId=${baseVerId}&mode=ALTER`, {
    //     option: this.option
    //   }).then(res => {
    //     this.incrementalScript = (res.data.alter ? res.data.alter : '没有内容可以显示')
    //     this.scriptKey++
    //     this.highlight()
    //   }).catch(e => {
    //     this.$showFailure(e)
    //   })
    // },
    highlight () {
      setTimeout(() => {
        Prism.highlightAll()
      })
    },
    viewScript () {
      this.highlight()
    },
    downloadScript () {
      if (this.currentJpaStr) {
        string.exportToFile(this.currentJpaStr, `${this.currentJpaClassName}export.java`)
      } else {
        this.$message.info(this.$store.state.$v.report.mes6)
      }
    },
    copyScript () {
      if (this.currentJpaStr) {
        string.setClipBoard(this.currentJpaStr)
        this.$message.success(this.$store.state.$v.report.mes8)
      } else {
        this.$message.info(this.$store.state.$v.report.mes7)
      }
    },
    callSetting () {
      this.getJpaOption()
    },
    // 获取模板内容
    getFesTemplate (type) {
      this.loading = true
      this.$http
        .get(`${this.$url}/service/models/fesTemplate?group=jpa&name=${type}`)
        .then(res => {
          if (res.data.success) {
            this.jpaEntityCodes = res.data.data
            this.isRenderEditorPage = true
          } else {
            // 没有修改模型模板则获取默认模板
            this.getDefaultFesTemplate(type)
          }
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          // this.$showFailure('加JPA class载模板失败')
        })
    },
    getDefaultFesTemplate (type) {
      this.loading = true
      return this.$http
        .get(`${this.$url}/service/models/defaultFesTemplate?group=jpa&name=${type}`)
        .then(res => {
          if (res.data.success) {
            this.jpaEntityCodes = res.data.data
            this.loading = false
            this.isRenderEditorPage = true
            return Promise.resolve('success')
          } else {
            console.log(res.data)
            // this.$showFailure('加JPA class载模板失败')
          }
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          // this.$showFailure('加JPA class载模板失败')
        })
    },
    saveFesTemplate () {
      this.isEditorLoading = true
      let obj = { template: this.jpaEntityCodes }
      this.$http
        .put(`${this.$url}/service/models/fesTemplate?group=jpa&name=${this.currentFesTemplateType}`, obj)
        .then(res => {
          if (res.data.success) {
            this.$message.success(this.$store.state.$v.report.templateSave)
          } else {
            console.error(res.data)
            let errorMsg = res.data.data.msg
            this.$showFailure(`${this.$store.state.$v.report.temFailed}:${errorMsg}`)
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
        }).catch(err => {
          this.isEditorLoading = false
          console.error(err)
          // this.$showFailure('模板保存失败')
        })
    },
    handleResetEditor () {
      this.getDefaultFesTemplate(this.currentFesTemplateType)
        .then(res => {
          this.isRenderEditor = false
          setTimeout(() => {
            this.$message.success(this.$store.state.$v.report.resetTem)
            this.isRenderEditor = true
          })
        })
    }
  },
  computed: {
    isdisabledGenerate () {
      return this.multipleSelection.length === 0
    }
  }
}
