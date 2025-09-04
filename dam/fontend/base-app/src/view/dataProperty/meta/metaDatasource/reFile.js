import chooseTag from '@/components/dataSource/chooseTag.vue'
export default {
  props: {
    editRow: {
      type: Object,
      default() {
        return {}
      },
    },
    dsEditing: {
      type: Boolean,
      default: false,
    },
    isShareFile: {
      type: Boolean,
      default: false,
    },
    tagTree: {
      type: Array,
      default() {
        return []
      },
    },
    tagMap: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      btnLoad: false,
      editRowData: {},
      dsform: {
        dbtype: 'DATADICTIONARY',
        ExcelAutoCollect: 'false',
      },
      categoryIdChanged: '',
      dialogChangeidVisible: false,
      fileUploadList: [],
      uploadHost: this.$url + '/files/upload',
      userPassword: false,
      showSmbUserPw: false,
      disableTest: false,
      userLabel: this.$t('meta.dataSource.edit.username'),
      pwLabel: this.$t('meta.dataSource.edit.password'),
      requiredForm: {
        SMBSHAREFILE: ['displayName', 'categoryId', 'dbtype', 'sharePath'],
        TABLEAU: ['displayName', 'categoryId', 'dbtype', 'fileId'],
        DATADICTIONARY_LOGICAL: ['displayName', 'categoryId', 'dbtype'],
        DATADICTIONARY: ['displayName', 'categoryId', 'dbtype'],
      },
      testSucceed: false,
    }
  },

  components: { chooseTag },

  computed: {
    pathArr() {
      let arr = [this.$t('common.page.dataSource')]
      if (!this.dsEditing) {
        arr.push(this.$t('meta.dataSource.add'))
      } else {
        arr.push(this.dsform.displayName)
      }
      return arr
    },
    fileDbTypeArr() {
      let arr = []
      if (this.$showOurLogo) {
        arr.splice(0, 0, {
          label: 'Data Dictionary(Physical)',
          value: 'DATADICTIONARY',
        })
        arr.splice(1, 0, {
          label: 'Data Dictionary(Logical)',
          value: 'DATADICTIONARY_LOGICAL',
        })
      }
      if (this.isShareFile) {
        arr = [
          {
            label: 'File Storage Server', // 文件类资产
            value: 'SMBSHAREFILE',
          },
        ]
      } else {
        // arr = [{ label: 'Tableau（Offline Dump）', value: 'TABLEAU' }]
        // if (this.$showOurLogo) {
        //   arr.splice(0, 0, {
        //     label: 'Data Dictionary(Physical)',
        //     value: 'DATADICTIONARY',
        //   })
        //   arr.splice(1, 0, {
        //     label: 'Data Dictionary(Logical)',
        //     value: 'DATADICTIONARY_LOGICAL',
        //   })
        // }
      }
      return arr
    },
    acceptTypes() {
      switch (this.dsform.dbtype) {
        case 'DATADICTIONARY':
        case 'DATADICTIONARY_LOGICAL':
          return '.xls,.xlsx'
        case 'TABLEAU':
          return '.twb'
        default:
          break
      }
    },

    // 文件类型上传文件
    showFileUpload() {
      let bool = false
      if (
        this.dsform.dbtype !== 'SMBSHAREFILE' &&
        `${this.dsform.ExcelAutoCollect}` === 'false'
      ) {
        bool = true
      }
      return bool
    },
    testBtnDisabled() {
      let bool = false
      if (this.dsform.dbtype === 'SMBSHAREFILE') {
        if (!this.dsform.sharePath) {
          bool = true
        }
      }
      return bool
    },
    disabledSaveBtn() {
      let flag = false
      flag = this.requiredForm[this.dsform.dbtype]?.some(r => {
        return !this.dsform[r]
      })
      /* if (this.userPassword) {
        if (!this.dsform.username || !this.dsform.password) {
          flag = true
        }
      } */
      return flag
    },
  },
  beforeMount() {},
  created() {
    if (this.isShareFile) {
      this.$set(this.dsform, 'dbtype', 'SMBSHAREFILE')
    }

    // 初始化采集类型
    // this.$set(this.dsform, 'ExcelAutoCollect', false)
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    removetab() {
      this.$emit('removeReTab')
    },
    handleEditRow() {
      this.$set(this.dsform, 'modelId', this.editRowData.modelId)
      this.$set(this.dsform, 'displayName', this.editRowData.definition)
      this.$set(this.dsform, 'categoryId', this.editRowData.categoryId)
      // this.$set(this.dsform, 'TagIds', this.editRowData.tagIds)
      this.$set(this.dsform, 'dbtype', this.editRowData.type)
      if (this.dsform.dbtype === 'SMBSHAREFILE') {
        this.$set(
          this.dsform,
          'sharePath',
          this.editRowData.reverseOptions.sharePath
        )
        this.$set(
          this.dsform,
          'description',
          this.editRowData.reverseOptions.description
        )
      }
      if (this.editRowData.type === 'TABLEAU') {
        this.getFileInfo(this.editRowData.reverseOptions.FilePath)
        this.$set(
          this.dsform,
          'fileId',
          this.editRowData.reverseOptions.FilePath
        )
      }
      if (
        this.editRowData.type === 'DATADICTIONARY' ||
        this.editRowData.type === 'DATADICTIONARY_LOGICAL'
      ) {
        /* if (this.editRowData.reverseOptions.Username) {
          this.userPassword = true
        } else {
          this.userPassword = false
        } */
        this.$set(
          this.dsform,
          'ExcelAutoCollect',
          `${this.editRowData.reverseOptions.ExcelAutoCollect}` || 'false'
        )
        this.$set(
          this.dsform,
          'ShareFilePath',
          this.editRowData.reverseOptions.FilePath
        )
        this.$set(
          this.dsform,
          'FilePath',
          this.editRowData.reverseOptions.FilePath
        )
        if (`${this.editRowData.reverseOptions.ExcelAutoCollect}` === 'false') {
          this.getFileInfo(this.editRowData.reverseOptions.FilePath)
          this.$set(
            this.dsform,
            'fileId',
            this.editRowData.reverseOptions.FilePath
          )
          this.$set(this.dsform, 'ShareFilePath', '')
        }
      }
    },
    // 查询文件信息
    getFileInfo(fileId) {
      this.$http
        .post(this.$url + `/files/getFilesInfo?fileIds=${fileId}`)
        .then(res => {
          let tempFileList = []
          res.data.forEach(item => {
            let obj = {
              name: item.fileName,
              ...item,
            }
            tempFileList.push(obj)
          })
          this.fileUploadList = tempFileList
        })
    },
    selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        if (res && Array.isArray(res) && res.length === 1) {
          this.newOwner = res[0].username
          this.afterChangeOwner()
        }
      })
    },
    downloadSampleFile() {
      let url = ''
      if (this.dsform.dbtype == 'DATADICTIONARY_LOGICAL') {
        url = `${this.$meta_url}/models/template?logical=true`
      } else {
        url = `${this.$meta_url}/models/template`
      }
      this.$downloadFile(url)
    },
    afterChangeOwner() {
      this.$set(this.dsform, 'owner', this.newOwner)
      this.formKey++
      this.$http
        .post(
          this.$meta_url +
            `/service/models/${this.dsform.id}/owner?owner=${this.newOwner}`
        )
        .then(res => {
          this.$message.success(this.$t('meta.dataSource.edit.ownerChanged'))
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeCategory() {
      this.dialogChangeidVisible = true
      this.categoryIdChanged = this.dsform.categoryId
    },
    changeCategoryId() {
      this.dialogChangeidVisible = false
      this.$http
        .put(
          this.$meta_url +
            '/service/models/' +
            this.editRowData.modelId +
            '/categories/' +
            this.categoryIdChanged
        )
        .then(res => {
          this.$message.success({
            message: this.$t('meta.dataSource.edit.sysModified'),
          })
          this.dsform.categoryId = this.categoryIdChanged
          this.$bus.$emit('changeDs')
          this.categoryId = this.categoryIdChanged
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    choosedTagChanged(tagIds) {
      this.dsform.TagIds = tagIds
    },
    getCategoryName(val) {
      this.$modelCategories.forEach(item => {
        if (item.categoryId === val) {
          this.dsform.categoryName = item.categoryName
          this.dsform.categoryAbbreviation = item.categoryAbbreviation
        }
      })
      this.dsform.categoryId = val
      this.dsform.modelCategoryId = val
    },

    openChooseTag() {
      this.$refs.tagSelect.blur()
      this.handleAddTag()
    },
    handleAddTag() {
      this.$refs.chooseTag && this.$refs.chooseTag.showDialog()
    },
    dbTypeWrapSelected(value) {
      this.$set(this.dsform, 'fileId', '')
      this.$set(this.dsform, 'ExcelAutoCollect', 'false')
      this.hostNameLabel = this.$t('meta.dataSource.edit.serverName')
      this.userLabel = this.$t('meta.dataSource.edit.username')
      this.pwLabel = this.$t('meta.dataSource.edit.password')
      this.dsform.dbtype = value
      this.dbTypeSelected()
    },
    dbTypeSelected() {
      const ds = this.dsform
      this.portText = this.$t('meta.dataSource.edit.port')
      this.dbplaceHolder = this.$t('meta.dataSource.edit.fillOrSelDbs')
      if (ds.dbtype !== 'SMBSHAREFILE') {
        this.fileUploadList = []
        this.testSucceed = true
      } else {
        this.$set(this.dsform, 'username', '')
        this.$set(this.dsform, 'password', '')
      }
      this.requireDbport = false
      this.showDbport = false
      if (
        ds.dbtype === 'DATADICTIONARY_LOGICAL' ||
        ds.dbtype === 'DATADICTIONARY'
      ) {
        ds.versioning = true
      } else {
        ds.versioning = false
      }
      ds.dbport = ''
    },
    handleBeforeUpload(file, type) {
      var self = this
      var ds = self.dsform
      var isCorrectFile = false
      if (
        (ds.dbtype == 'DATADICTIONARY' ||
          ds.dbtype == 'DATADICTIONARY_LOGICAL') &&
        (file.name.toLowerCase().indexOf('.xls') > -1 ||
          file.name.toLowerCase().indexOf('.xlsx') > -1)
      ) {
        isCorrectFile = true
      }
      if (
        ds.dbtype == 'TABLEAU' &&
        file.name.toLowerCase().indexOf('.twb') > -1
      ) {
        isCorrectFile = true
      }
      if (!isCorrectFile) {
        this.$message.error(
          this.$t('meta.dataSource.edit.fileTypeIncorrect') +
            (ds.dbtype == 'DATADICTIONARY' ||
            ds.dbtype == 'DATADICTIONARY_LOGICAL'
              ? '.xls, .xlsx'
              : type || ds.dbtype)
        )
      }
      return isCorrectFile
    },
    handleUploadSuccess(res, file) {
      file.filepath = res.fileStorePath
      this.$set(this.dsform, 'fileId', res.fileId)
      this.$set(this.dsform, 'FilePath', res.fileId)
      this.$refs.form.validateField('fileId')
      this.$http.post(this.$url + '/files/commitFile?fileIds=' + res.fileId)
    },
    handleFileRemoved(file, fileList) {
      this.$set(this.dsform, 'fileId', '')
      this.$set(this.dsform, 'FilePath', '')
      this.$refs.form.validateField('fileId')
      this.fileList = fileList
    },
    handleUploadChange(file, fileList) {
      this.fileList = fileList
    },
    // 组合参数测试
    getFormatPara(dsform, isTest) {
      let param = {
        categoryId: dsform.categoryId,
        categoryName: dsform.categoryName,
        connectType: 'SMB',
        credentialInfo: {
          password: this.$pwEncrypt(dsform.password),
          user: dsform.username,
        },
        modelCategoryId: dsform.modelCategoryId,
        parameterMap: {
          sharePath: dsform.sharePath,
          description: dsform.description,
          // TagIds: dsform.TagIds.join(','),
          FileNames: dsform.FileNames || '',
          ExcelAutoCollect: `${dsform.ExcelAutoCollect}`,
        },
        sourceName: dsform.displayName,
        type: dsform.dbtype,
      }
      return param
    },
    testDataSource({ hideMsg } = {}) {
      this.disableTest = true
      const self = this
      let json = this.getFormatPara(this.dsform, true)
      const isFullFill =
        this.dsform.categoryId &&
        this.dsform.displayName &&
        this.dsform.sharePath
      if (!isFullFill) {
        this.disableTest = false
        this.$message.error({
          title: this.$t('meta.dataSource.edit.createFaild'),
          message: this.$t('meta.dataSource.edit.msgIncomplete'),
        })
        return
      }
      const handleTestSuccess = () => {
        this.testSucceed = true
        !hideMsg &&
          self.showSuccess(
            this.$t('meta.dataSource.edit.datasourceTestSucceed')
          )
        this.disableTest = false
      }
      const handleTestFailure = e => {
        this.$showFailure(e)
        this.testSucceed = false
        this.disableTest = false
      }
      if (this.dsform.dbtype === 'SMBSHAREFILE') {
        const url = `${this.$meta_url}/service/models/re/shareFile`
        this.$http
          .put(url, json)
          .then(res => {
            handleTestSuccess()
          })
          .catch(e => {
            handleTestFailure(e)
          })
      }
    },
    formatParams() {
      let obj = {
        modelId: this.dsform.modelId || null,
        modelCategoryId: this.dsform.categoryId,
        definition: this.dsform.displayName,
        type: this.dsform.dbtype,
        // tagIds: this.dsform.TagIds,
        jdbcModel: false,
        reverseOptions: {
          FilePath:
            this.dsform.ExcelAutoCollect === 'true'
              ? this.dsform.ShareFilePath
              : this.dsform.FilePath,
          ExcelAutoCollect: `${this.dsform.ExcelAutoCollect}`,
        },
      }
      // showSmbUserPw  SMB 使用用户名密码
      if (this.userPassword) {
        obj.reverseOptions.cover = 'true'
        this.$set(
          obj.reverseOptions,
          'Username',
          this.dsform.username ? this.dsform.username : null
        )
        this.$set(
          obj.reverseOptions,
          'Password',
          this.dsform.password ? this.$pwEncrypt(this.dsform.password) : null
        )
      }
      if (this.dsform.dbtype === 'SMBSHAREFILE') {
        obj.reverseOptions.sharePath = this.dsform.sharePath
        obj.reverseOptions.description = this.dsform.description
        obj.reverseOptions.modelCategoryId = `${this.dsform.modelCategoryId}`
        if (this.showSmbUserPw) {
          obj.reverseOptions.Username = this.dsform.username
          obj.reverseOptions.Password = this.$pwEncrypt(this.dsform.password)
        }
      }
      return obj
    },
    save() {
      /* if (this.userPassword) {
        if (!this.dsform.username || !this.dsform.password) {
          this.$datablauMessage({
            message: '请输入用户名和密码',
            type: 'warning',
          })
          return
        }
      } */
      this.btnLoad = true
      let param = this.formatParams()
      if (
        param.type === 'DATADICTIONARY' ||
        param.type === 'DATADICTIONARY_LOGICAL'
      ) {
        this.$http
          .post(
            this.$meta_url + '/service/models/createDataDictionaryModel',
            param
          )
          .then(res => {
            this.$datablauMessage.success('保存成功')
            this.btnLoad = false
            this.$bus.$emit('getTaskJobResult', res.data, 'import')
            this.$emit('createdJob')
          })
          .catch(e => {
            this.$showFailure(e)
            this.btnLoad = false
          })
      } else {
        this.$http
          .post(this.$meta_url + '/service/models/createModel', param)
          .then(res => {
            this.$datablauMessage.success('保存成功')
            this.btnLoad = false
            this.$emit('createdJob')
          })
          .catch(e => {
            this.$showFailure(e)
            this.btnLoad = false
          })
      }
    },
  },
  watch: {
    testSucceed(newVal) {
      this.$emit('testSucceed', newVal)
    },
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = newVal
          this.handleEditRow()
        }
      },
      immediate: true,
    },
    dsform: {
      handler: function (newVal) {
        if (this.dsform.ExcelAutoCollect === 'false') {
          this.userPassword = false
          this.requiredForm.DATADICTIONARY_LOGICAL =
            this.requiredForm.DATADICTIONARY = [
              'displayName',
              'categoryId',
              'dbtype',
              'fileId',
            ]
        } else {
          this.requiredForm.DATADICTIONARY_LOGICAL =
            this.requiredForm.DATADICTIONARY = [
              'displayName',
              'categoryId',
              'dbtype',
              'ShareFilePath',
            ]
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
