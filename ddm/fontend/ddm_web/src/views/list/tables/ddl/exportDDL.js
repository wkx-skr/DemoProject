import HTTP from '@/resource/http'
// import 'prismjs/themes/prism-okaidia.css' 深色
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import string from '@/resource/utils/string'
import $ from 'jquery'
import ddlSetting from '@/views/list/script/ddlSetting.vue'
const NoSelectionMessage = '请选择一个版本查看CREATE脚本，或选择两个版本查看ALTER脚本'
export default {
  components: {
    ddlSetting
  },
  props: {
    modelId: {
      required: true
    },
    tableId: {},
    currentModel: {
      required: true
    },
    typeDataWareHouse: {}
  },
  data () {
    return {
      tableData: [],
      multipleSelection: [],
      incrementalScript: '',
      scriptKey: 0,
      scriptTitle: NoSelectionMessage,
      option: null,
      options: null,
      loading: false,
      showSettingDialog: false,
      modelAdmin: this.currentModel?.permission?.admin || this.$store.state.user.isAdmin
    }
  },
  mounted () {
    this.getVersions()
    this.getScriptOption(true)
    this.highlight()
    if (this.$route.path.indexOf('sql_editor') !== -1) {
      import('prismjs/themes/prism-okaidia.css')
    } else {
      import('prismjs/themes/prism.css')
    }
  },
  methods: {
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
      let parent = this.$parent.$parent.$parent
      // let list = graph && graph.editor && graph.editor.undoManager.indexOfNextAdd
      // console.log(list, 234)
      if ((parent.isTableChanged && parent.isTableChanged()) || (parent.$refs.indexEditor && parent.$refs.indexEditor.isIndexChanged && parent.$refs.indexEditor.isIndexChanged())) {
        this.$confirm('当前表已被修改，若不先进行保存，DDl脚本为最后一次保存的结果', '提示', {
          type: 'warning'
        })
      }
      // const val = this.multipleSelection
      // this.selection = val
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
      this.getCreateScript()
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
      this.getScriptOption(true)
    },
    getScriptOption (notOpenDialog = false) {
      this.loading = true
      this.option = null
      // 获取当前模型的配置
      this.$http.get(`${this.$url}/service/models/${this.modelId}/option?type=${this.multipleSelection.length === 2 ? 'AlterDDL' : 'CreateDDL'}`).then(res => {
        if (res.data === '') {
          // 获取默认配置
          HTTP.getScriptDefaultOption({ modelType: this.currentModel.modelType })
            .then(data => {
              const option = data
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
          this.loading = false
          if (!notOpenDialog) {
            this.showSettingDialog = true
          }
        }
      })
        .catch(e => {
          this.incrementalScript = ''
          this.$showFailure(e)
        })
    },
    saveOption () {
      const keys = this.$refs.ddlSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.ddlSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      console.log(_.cloneDeep(this.option), 2222)
      this.$http.post(`${this.$url}/service/models/option`, {
        option: JSON.stringify(this.option),
        modelId: this.modelId,
        type: `${this.multipleSelection.length === 2 ? 'AlterDDL' : 'CreateDDL'}`
      })
        .then(res => {
          // this.getScript()
          this.$blauShowSuccess('配置保存成功')
          this.showSettingDialog = false
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    updateData (array) {
      // localStorage.setItem('ddl-setting', JSON.stringify(array))
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
    getCreateScript () {
      this.loading = true
      const targetVerId = '-1'
      const keys = this.$refs.ddlSetting.$refs.tree.getCheckedKeys()
      const halfKeys = this.$refs.ddlSetting.$refs.tree.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http.post(this.$url + `/service/models/${this.modelId}/script?targetVerId=${targetVerId}&mode=CREATE`, {
        option: this.option,
        selectedObj: [this.$store.state.tableId || this.tableId]
      }).then(res => {
        this.incrementalScript = (res.data.create ? res.data.create : this.$store.state.$v.report.noContent)
        this.scriptKey++
        this.highlight()
        this.showSettingDialog = false
        this.loading = false
      }).catch(e => {
        this.incrementalScript = ''
        this.$showFailure(e)
      }).then(() => {
        this.loading = false
      })
    },
    getAlterScript () {
      this.multipleSelection.sort((a, b) => {
        return a.id - b.id
      })
      const baseVerId = this.formatLatestVersionId(this.multipleSelection[0])
      const targetVerId = this.formatLatestVersionId(this.multipleSelection[1])
      this.$http.post(this.$url + `/service/models/${this.modelId}/script?targetVerId=${targetVerId}&baseVerId=${baseVerId}&mode=ALTER`, {
        option: this.option
      }).then(res => {
        this.incrementalScript = (res.data.alter ? res.data.alter : this.$store.state.$v.report.noContent)
        this.scriptKey++
        this.highlight()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    highlight () {
      setTimeout(() => {
        Prism.highlightAll()
      })
    },
    viewScript () {
      this.highlight()
    },
    downloadScript () {
      if (this.incrementalScript) {
        string.exportToFile(this.incrementalScript, 'export.sql')
      } else {
        this.$message.info(this.$store.state.$v.report.mes3)
      }
    },
    copyScript () {
      if (this.incrementalScript) {
        string.setClipBoard(this.incrementalScript)
        this.$message.success(this.$store.state.$v.report.mes5)
      } else {
        this.$message.info(this.$store.state.$v.report.mes4)
      }
    },
    callSetting () {
      this.getScriptOption()
    }
  }
}
