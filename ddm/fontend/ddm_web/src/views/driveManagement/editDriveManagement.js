import HTTP from '@/resource/http'

const moment = require('moment')
export default {
  data () {
    return {
      ruleForm: {
        driverName: '',
        driverClassName: '',
        storedFileId: '',
        type: '',
        builtIn: '',
        defaultDriver: '',
        storedFileName: ''
      },
      rules: {
        driverName: [
          { message: this.$v.drive.PleasedriverName, trigger: 'blur' }
        ],
        driverClassName: [
          { required: true, message: this.$v.drive.PleasedriverClassName, trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$v.drive.PleaseSelectType, trigger: 'change' }
        ],
        storedFileName: [
          { required: true, message: this.$v.drive.PleaseGetTheFile, trigger: 'blur' }
        ]
      },
      typeOption: [],
      typeOption2: [],
      defaultDriverOption: [
        { lable: this.$v.drive.yes, value: true },
        { lable: this.$v.drive.no, value: false }
      ],
      uploadDriUrl: '',
      addDisabled: true

    }
  },
  props: {
    dsEditing: {
      default: false
    },
    supdsform: {
      default: false
    }
  },
  computed: {
    lang () {
      return window.lang
    }
  },

  mounted () {
    this.dataInit()
    if (this.lang === 'English') {
      this.typeOption = this.typeOption2
    } else {
      this.typeOption = this.typeOption1
    }
  },
  beforeMount () {
    this.uploadDriUrl = `${this.$url}/service/files/upload/driver`
  },
  beforeDestroy () {
  },

  methods: {
    dataInit () {
      if (this.dsEditing === true) {
        this.ruleForm.driverName = this.supdsform.driverName
        this.ruleForm.driverClassName = this.supdsform.driverClassName
        this.ruleForm.storedFileId = this.supdsform.storedFileId
        this.ruleForm.type = this.supdsform.type
        this.ruleForm.builtIn = this.supdsform.builtIn
        this.ruleForm.defaultDriver = this.supdsform.defaultDriver
        this.ruleForm.storedFileName = this.supdsform.storedFileName
      } else {
        this.ruleForm.type = this.supdsform.type
      }
      HTTP.getDriverList({ type: this.supdsform.type, pageSize: 100, currentPage: 1 })
        .then(res => {
          let data = res.content
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              if (item.builtIn) {
                this.ruleForm.driverClassName = item.driverClassName
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const response = _.cloneDeep(this.ruleForm)
          if (!response.driverName) {
            response.driverName = this.ruleForm.storedFileName
          }
          if (this.dsEditing === true) {
            this.$http.post(this.$url + `/service//driver/${this.supdsform.id}/update`, response)
              .then(res => {
                this.$emit('removeEdiTab')
                this.$message.success(this.$v.drive.editSuccessfully)
                this.$bus.$emit('refreshList')
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            this.$http.post(this.$url + '/service/driver/', response)
              .then(res => {
                this.$emit('removeEdiTab')
                this.$message.success(this.$v.drive.CreatedSuccessfully)
                this.$bus.$emit('refreshList', this.ruleForm.type)
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.$emit('removeEdiTab')
    },
    uploadHandle (file) {
      const len = file.name.split('.').length
      const type = file.name.split('.')[len - 1]
      if (type === 'jar') {
        return true
      } else {
        this.$message.error(`只能上传jar格式的文件!`)
        return false
      }
    },
    onRefDocSuce (res) {
      this.ruleForm.storedFileId = res.fileId
      this.ruleForm.storedFileName = res.fileOrginalName
      if (!this.ruleForm.driverName) {
        this.ruleForm.driverName = this.ruleForm.storedFileName
      }
      this.$message.success(this.$v.drive.UploadSuccessful)
    },
    onRefDocErr (e) {
      this.$showUploadFailure(e)
    }
  },
  watch: {
    ruleForm: {
      handler (value) {
        if ((value.driverClassName !== null && value.driverClassName !== '') && (value.storedFileId !== null && value.storedFileId !== '') && (value.type !== null && value.type !== '')) {
          this.addDisabled = false
        }
      },
      deep: true
    },
    supdsform () {
      this.dataInit()
    }
  }

}
