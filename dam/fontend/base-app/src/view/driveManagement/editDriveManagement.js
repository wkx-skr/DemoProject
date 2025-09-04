import HTTP from '@/http/main'
import DatasourceController from '../../../../base-components/http/baseController/DatasourceController'
const moment = require('moment')
export default {
  data() {
    return {
      ruleForm: {
        driverName: '',
        driverClassName: '',
        storedFileId: '',
        type: '',
        builtIn: '',
        defaultDriver: '',
        storedFileName: '',
      },
      rules: {
        driverName: [
          { message: this.$t('meta.driveManage.fillName'), trigger: 'blur' },
        ],
        driverClassName: [
          {
            required: true,
            message: this.$t('meta.driveManage.fillDriverClassName'),
            trigger: 'blur',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('meta.driveManage.selType'),
            trigger: 'change',
          },
        ],
        storedFileName: [
          {
            required: true,
            message: this.$t('meta.driveManage.getFile'),
            trigger: 'blur',
          },
        ],
      },
      typeOption: [],
      builtInOption: [
        { lable: this.$t('meta.common.true'), value: true },
        { lable: this.$t('meta.common.false'), value: false },
      ],
      defaultDriverOption: [
        { lable: this.$t('meta.common.true'), value: true },
        { lable: this.$t('meta.common.false'), value: false },
      ],
      uploadDriUrl: '',
      addDisabled: true,
      fileListZip: [],
    }
  },
  props: ['dsEditing', 'supdsform'],
  computed: {},

  mounted() {
    this.getAllPlugins()
    this.dataInit()
  },
  beforeMount() {
    this.uploadDriUrl = `${this.$url}/drivers/uploadDriver`
  },
  beforeDestroy() {},

  methods: {
    getAllPlugins() {
      const getAllPlugin = async () => {
        let allPlugin = await DatasourceController.getAllPlugins()
        return allPlugin.data
      }
      getAllPlugin()
        .then(res => {
          this.typeOption = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataInit() {
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
      HTTP.getDriverList({
        type: this.supdsform.type,
        pageSize: 100,
        currentPage: 1,
      })
        .then(res => {
          let data = res.data.content
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              if (item.builtIn) {
                this.ruleForm.driverClassName = item.driverClassName // 驱动类名称根据 buileIn 赋值
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    submitForm() {
      const formName = 'ruleForm'
      this.$refs[formName].validate(valid => {
        if (valid) {
          const response = _.cloneDeep(this.ruleForm)
          if (!response.driverName) {
            response.driverName = this.ruleForm.storedFileName
          }
          if (this.dsEditing === true) {
            this.$http
              .post(this.$url + `/driver/${this.supdsform.id}/update`, response)
              .then(res => {
                this.$emit('removeEdiTab')
                this.$message.success(this.$t('meta.DS.message.modifySucceed'))
                this.$bus.$emit('refreshList')
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            this.$http
              .post(this.$url + '/drivers/addDriver', response)
              .then(res => {
                this.$emit('removeEdiTab')
                this.$message.success(this.$t('meta.DS.message.createSucceed'))
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
    // resetForm(formName) {
    resetForm() {
      const formName = 'ruleForm'
      this.$refs[formName].resetFields()
      this.$emit('removeEdiTab')
    },
    uploadHandle(file) {
      return true
      // const len = file.name.split('.').length
      // const type = file.name.split('.')[len - 1]
      // if (type !== 'jar') {
      //   this.$message.error('只能上传jar格式的文件!')
      // }
      // return type == 'jar'
    },
    onRefDocSuce(res) {
      this.ruleForm.storedFileId = res.fileId
      this.ruleForm.storedFileName = res.fileName
      if (!this.ruleForm.driverName) {
        this.ruleForm.driverName = this.ruleForm.storedFileName
      }
      this.$message.success(this.$t('meta.DS.message.uploadSucceed'))
      this.fileListZip = res.zipFileNameList
    },
    onRefDocErr(e) {
      this.$showUploadFailure(e)
    },
    onRemove(e) {
      this.fileListZip = []
    },
  },
  watch: {
    ruleForm: {
      handler(value) {
        if (
          value.driverClassName !== null &&
          value.driverClassName !== '' &&
          value.storedFileId !== null &&
          value.storedFileId !== '' &&
          value.type !== null &&
          value.type !== ''
        ) {
          this.addDisabled = false
        }
      },
      deep: true,
    },
    supdsform() {
      this.dataInit()
    },
  },
}
