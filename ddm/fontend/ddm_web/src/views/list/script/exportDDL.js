import HTTP from '@/resource/http'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import string from '@/resource/utils/string'
import $ from 'jquery'
import ddlSetting from './ddlSetting.vue'
const NoSelectionMessage = '请选择一个版本查看CREATE脚本，或选择两个版本查看ALTER脚本'

export default {
  components: {
    ddlSetting
  },
  props: {
    modelId: {
      required: true
    }
  },
  data () {
    return {
      tableData: [],
      multipleSelection: [],
      incrementalScript: '',
      scriptKey: 0,
      scriptTitle: this.$store.state.$v.dataEntity.noMsg,
      option: null,
      options: null,
      loading: false,
      showSettingDialog: false
    }
  },
  mounted () {
    this.getVersions()
    this.getScriptOption(true)
    this.highlight()
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
          this.$http.get(this.$url + '/service/models/script/option').then(res => {
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
      this.$http.post(`${this.$url}/service/models/option`, {
        option: JSON.stringify(this.option),
        modelId: this.modelId,
        type: `${this.multipleSelection.length === 2 ? 'AlterDDL' : 'CreateDDL'}`
      })
        .then(res => {
          this.getScript()
        })
        .catch(e => {
          this.$showFailure(e)
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
      const targetVerId = this.formatLatestVersionId(this.multipleSelection[0])
      this.$http.post(this.$url + `/service/models/${this.modelId}/script?targetVerId=${targetVerId}&mode=CREATE`, {
        option: this.option
      }).then(res => {
        this.incrementalScript = (res.data.create ? res.data.create : this.$store.state.$v.report.noContent)
        this.scriptKey++
        this.highlight()
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
