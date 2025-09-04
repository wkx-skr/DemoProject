// import reportDetail from './modelCompareReportDetail.vue'
import differenceReportSelfDetail from './differenceReportSelfDetail.vue'
export default {
  components: {
    // reportDetail,
    differenceReportSelfDetail,
  },
  data() {
    const CHECKNAME = (rule, value, callback) => {
      const flag = this.versionsArr.some(item => {
        return (
          item.versionName !== this.currentVersion && item.versionName === value
        )
      })
      if (flag) {
        callback(new Error('版本名称不能重复'))
      } else {
        callback()
      }
    }
    return {
      time: 'now',
      data: {},
      tableData: [],
      versions: null,
      firstVersion: null,
      versionId: undefined,
      modelId: undefined,
      requestUrl: '',
      result: {
        table: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        column: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        view: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        index: {
          added: 0,
          removed: 0,
          modified: 0,
        },
      },
      disableds: true,
      resultFileUrl: undefined,
      compareDetail: null,
      compareVersions: null,
      compareKey: 0,
      dataNmae: '',
      versionsOption: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      versionsValue: '',
      boxHeight: window.innerHeight - 215,
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      checkDisabledObj: {},
      selectionLength: 0,
      selectionName: '',
      versionsArr: [],
      dialogVisible: false,
      currentVersion: '',
      ruleForm: {
        versionName: '',
        description: '',
        createTime: '',
      },
      rules: {
        versionName: [
          {
            required: true,
            message: this.$t('meta.DS.treeSubOperation.inputVersionName'),
            trigger: 'blur',
          },
          { validator: CHECKNAME, trigger: 'blur' },
        ],
      },
      compareDetailVisible: false,
      disabledCompar: false,
      compareIds: [],
      selection: [],
      detailState: false,
    }
  },
  computed: {
    btnConfirm() {
      let bool = false
      if (!this.ruleForm.versionName) {
        bool = true
      }
      return bool
    },
  },
  props: ['sourceData'],
  mounted() {
    /* setTimeout(()=>{
      Ps.initialize($('.tab-page')[0]);
    }); */
    this.modelId = this.sourceData.id
    this.getVersions()
    this.$bus.$on('downloadResult', this.handleDownload)
    const innerHeight = window.innerHeight
  },
  beforeDestroy() {
    this.$bus.$off('downloadResult', this.handleDownload)
  },
  watch: {
    versionsValue(value) {
      this.filtData()
      // this.$refs.tree1.filter(value)
    },
  },
  methods: {
    returnCloseLevel() {
      this.compareDetailVisible = false
    },
    returnClose() {
      this.$emit('close')
    },
    editVersions(row, detailState) {
      this.detailState = detailState
      this.dialogVisible = true
      this.currentVersion = row.versionName
      this.ruleForm.versionName = row.versionName
      this.ruleForm.description = row.description
      this.ruleForm.createTime = row.createTime
      this.ruleForm.version = row.version
      this.ruleForm.modelId = row.modelId
    },
    closeVersion() {
      this.ruleForm.versionName = ''
      this.ruleForm.description = ''
      this.ruleForm.createTime = ''
      this.dialogVisible = false
      this.$refs.ruleForm.resetFields()
    },
    saveVersion() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const url = this.$url + '/service/models/version/name/delta'
          const body = {
            modelId: this.ruleForm.modelId,
            version: this.ruleForm.version,
            versionName: this.ruleForm.versionName,
            description: this.ruleForm.description,
            createTime: this.ruleForm.createTime,
          }
          this.$http.put(url, body).then(res => {
            this.disableds = true
            this.modelId = this.ruleForm.modelId
            this.getVersions()
            this.$bus.$on('downloadResult', this.handleDownload)
            this.dialogVisible = false
            if (this.detailState === true) {
              this.$refs.reportSelfDetail.editName(body)
            }
          })
        } else {
          // this.$message.error('版本名称不能为空')
        }
      })
    },
    handleSelectionChange(selection) {
      this.selection = selection
      this.selectionLength = selection.length
      let arr = []
      selection.forEach(element => {
        arr.push(element.versionName)
      })
      this.selectionName = arr.join('/')
      if (selection.length > 2) {
        let del_row = selection.shift()
        // console.log('把数组的第一个元素从其中删除后', selection);
        this.$refs.versionsList.onlyTwoChange(del_row)
      }
      if (this.selectionLength === 1) {
        selection.forEach(element => {
          if (
            element.version ===
            this.versionsArr[this.versionsArr.length - 1].version
          ) {
            this.disabledCompar = true
          }
        })
      } else {
        this.disabledCompar = false
      }
    },
    versionComparison() {
      if (this.selectionLength === 1) {
        this.compareIds = []
        this.compareIds.push(this.selection[0])
        this.versionsArr.forEach((element, index) => {
          if (element.version === this.selection[0].version) {
            this.compareIds.push(this.versionsArr[index + 1])
          }
        })
      } else {
        this.compareIds = this.selection
      }
      this.compareDetailVisible = true
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.versions = this.versionsArr.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      )
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.versions = this.versionsArr.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      )
    },
    input(index, data) {
      this.disableds = false
      this.dataNmae = data.versionName
    },
    blur(data) {
      if (data.versionName != '') {
        const url = this.$url + '/service/models/version/name/delta'
        const body = {
          modelId: data.modelId,
          version: data.version,
          versionName: data.versionName,
        }
        this.$http.put(url, body).then(res => {
          this.disableds = true
          this.modelId = data.modelId
          this.getVersions()
          this.$bus.$on('downloadResult', this.handleDownload)
        })
      } else {
        this.$message.error(this.$t('meta.DS.treeSubOperation.nameCanNotNull'))
      }
    },
    handleDownload(isVersion) {
      if (!isVersion) {
        return
      }
      if (this.resultFileUrl) {
        const url = this.resultFileUrl
        this.$downloadFile(url)
      } else {
        this.$message.info(this.$t('meta.DS.message.noDataSource'))
      }
    },
    getVersions() {
      this.$http
        .get(this.$url + '/service/models/' + this.modelId + '/versions/simple')
        .then(res => {
          this.versionsArr = res.data.sort((a, b) => b.version - a.version)
          this.firstVersion =
            this.versionsArr[this.versionsArr.length - 1].version
          // this.versionsArr.reverse()
          // this.versions = res.data
          this.filtData()
          this.totalItems = res.data.length
          if (res.data.length > 1) {
            this.disabledCompar = false
          } else {
            this.disabledCompar = true
          }
        })
    },
    filtData() {
      const keyword = this.versionsValue.trim().toLowerCase()
      this.versions = []
      this.versions = this.versionsArr.filter(item =>
        item.versionName.toLowerCase().includes(keyword)
      )
      let s = this.pageSize
      let c = this.currentPage
      this.versions = this.versions.slice(s * (c - 1), s * c)
      // this.versions.reverse()
    },
    compare(scope) {
      this.compareIds = []
      // const version = scope.row
      // const index = scope.$index
      // this.resultFileUrl = `${this.$url}/service/models/${this.modelId}/${version.version}/updateCompareResultFile`
      // this.requestUrl =
      //   this.$url +
      //   '/service/models/' +
      //   this.modelId +
      //   '/version/' +
      //   version.version +
      //   '/delta'
      // const lastVersion = this.versions[index + 1].versionName
      // this.getData({ right: version.versionName, left: lastVersion })
      this.compareIds.push(scope.row)
      this.versionsArr.forEach((element, index) => {
        if (element.version === scope.row.version) {
          this.compareIds.push(this.versionsArr[index + 1])
        }
      })
      this.compareDetailVisible = true
    },
    getData(obj) {
      this.$http
        .get(this.requestUrl)
        .then(res => {
          this.result = res.data
          this.data = res.data.compareResult
          this.tableData = this.data.differences
          if (obj) {
            this.compareVersions = obj
          }
          this.compareDetail = {
            result: this.result,
            data: this.data,
            tableData: this.tableData,
            requestFileUrl: this.resultFileUrl,
          }
          this.compareKey++
        })
        .catch(e => {
          this.$showFailure(e)
          //          this.$message.error(e.response.data.errorMessage);
        })
    },
  },
}
