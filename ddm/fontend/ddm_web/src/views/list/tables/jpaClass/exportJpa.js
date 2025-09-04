import HTTP from '@/resource/http'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import string from '@/resource/utils/string'
import $ from 'jquery'
import jpaSetting from '@/views/list/script/jpaClass/jpaSetting.vue'
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
    },
    tableId: {},
    typeDataWareHouse: {},
    currentModel: {
      required: true
    }
  },
  data () {
    return {
      tableData: [],
      errClassList: [],
      showAssociation: false,
      associationTableList: [],
      unassociationTableList: [],
      multipleSelection: [],
      incrementalScript: '',
      scriptKey: 0,
      scriptTitle: NoSelectionMessage,
      option: null,
      options: null,
      loading: false,
      showSettingDialog: false,
      currentExpandKey: [],
      currentExpandKey2: [],
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
      activeName: '',
      modelAdmin: this.currentModel?.permission?.admin || this.$store.state.user.isAdmin
    }
  },
  mounted () {
    this.getJpaOption(true)
  },
  methods: {
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
    getRowKey2 (row) {
      return row.index + 'a'
    },
    handleClick (row) {
      this.currentJpaStr = row.content
      this.currentJpaClassName = row.className
      let currentIndex = this.currentExpandKey[0]
      if (this.currentExpandKey.length > 0) {
        this.currentExpandKey = []
        // return
      }
      this.currentExpandKey2 = []
      if (row.index !== currentIndex) {
        this.currentExpandKey = [row.index]
      }
      this.highlight()
    },
    handleClick2 (row) {
      this.currentJpaStr = row.content
      this.currentJpaClassName = row.className
      if (this.currentExpandKey2.length > 0) {
        this.currentExpandKey2 = []
        return
      }
      this.currentExpandKey = []
      this.currentExpandKey2 = [row.index + 'a']
      this.highlight()
    },
    toggleSelection (row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    getScript () {
      const val = this.multipleSelection
      this.selection = val
      this.getJpaClass()
    },
    handleExpanChange (row) {
      this.highlight()
      this.currentJpaStr = row.content
      this.currentJpaClassName = row.className
      let currentIndex = this.currentExpandKey[0]
      if (this.currentExpandKey.length > 0) {
        this.currentExpandKey = []
        // return
      }
      if (row.index !== currentIndex) {
        this.currentExpandKey = [row.index]
      }
    },
    handleExpanChange2 (row) {
      this.highlight()
      this.currentJpaStr = row.content
      this.currentJpaClassName = row.className
      if (this.currentExpandKey.length > 0) {
        this.currentExpandKey2 = []
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
      const refresh = (option, checkedKeys) => {
        let idToValue = {}
        const deepTree = (tree) => {
          tree.selected = false
          idToValue[tree.id] = tree
          if (tree.children) {
            tree.children.forEach(item => deepTree(item))
          }
        }
        deepTree(option)
        checkedKeys.forEach(id => {
          idToValue[id].selected = true
        })
      }
      let checkedKeys = this.$refs.jpaSetting.$refs.tree.getCheckedKeys()
      refresh(this.option, checkedKeys)
      this.$http.post(`${this.$url}/service/models/option`, {
        option: JSON.stringify(this.option),
        modelId: this.modelId,
        type: 'JPA'
      })
        .then(res => {
          this.$blauShowSuccess('配置保存成功')
          this.showSettingDialog = false
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
      this.loading = true
      this.errClassList = []
      this.activeName = ''
      // const targetVerId = this.formatLatestVersionId(this.multipleSelection[0])
      this.$http.post(this.$url + `/service/models/${this.modelId}/jpaClasses?targetVerId=-1`, {
        setting: {
          option: this.option,
          selectedObj: [this.$store.state.tableId || this.tableId],
          params: {
            packageName: this.jpaPackageName
          }
        },
        templateGroup: 'jpa'
      }).then(res => {
        if (res.data.success) {
          this.associationTableList = []
          this.unassociationTableList = []
          res.data.data.forEach(v => {
            if (v.associationTable) {
              this.associationTableList.push(v)
            } else {
              this.unassociationTableList.push(v)
            }
          })
        } else {
          this.errClassList = res.data.data || []
          this.$showFailure(res.data.msg || '解析失败')
          return
        }
        // 如果只存在一种，则默认展开
        if (this.unassociationTableList.length === 0 && this.associationTableList.length > 0) {
          this.activeName = '0'
        } else if (this.associationTableList.length === 0 && this.unassociationTableList.length > 0) {
          this.activeName = '1'
        }
        this.highlight()
        this.showSettingDialog = false
        this.loading = false
      }).catch(e => {
        console.error(e, 222)
        this.incrementalScript = ''
        this.$showFailure(e)
      }).then(() => {
        this.loading = false
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
  watch: {
    isRenderEditorPage (newVal) {
      this.$bus.$emit('reset-main-z-index', newVal)
    }
  },
  computed: {
    isdisabledGenerate () {
      return this.multipleSelection.length === 0
    }
  }
}
