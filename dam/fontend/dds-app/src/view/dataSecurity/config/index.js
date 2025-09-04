import api from '../util/api'
import _ from 'lodash'
export default {
  name: 'ParamsConfig',
  props: {},
  mounted() {
    this.rules = {
      digitPart: [
        {
          required: true,
          message: this.$t('securityModule.input'),
          trigger: 'blur',
        },
      ],
      startVal: [
        {
          required: true,
          message: this.$t('config.inputStartVal'),
          trigger: 'blur',
        },
      ],
      incStepSize: [
        {
          required: true,
          message: this.$t('config.inputAutoincrement'),
          trigger: 'blur',
        },
      ],
    }
    this.getItemsConfig()
  },
  data() {
    return {
      listShow: true,
      activeName: 'autocode',
      formData: {},
      originData: {},
      rules: {},
      disabled: true,
      activeName: 'itemsCode',
      asyncRanger: false,
      dataSourceList: [],
      dataSourceOptions: [],
      dataServiceOptions: [],
      originSourceData: [],
    }
  },
  methods: {
    fillZero(number, digits) {
      number = String(number)
      let length = number.length
      if (number.length < digits) {
        for (let i = 0; i < digits - length; i++) {
          number = '0' + number
        }
      }
      return number
    },
    handleEdit(e, type) {
      if (type === 'digitPart') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        if (parseInt(value) > 9) value = 9
        this.formData.digitPart = value
        this.formData.startVal = 0
      } else if (type === 'startVal') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.formData.startVal = value
      } else if (type === 'incStepSize') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        if (parseInt(value) > 9) value = 9
        this.formData.incStepSize = value
      }
    },
    getItemsConfig() {
      api
        .getInformationItemCodeConfig()
        .then(res => {
          // console.log(res)
          this.listShow = true
          this.originData = _.cloneDeep(res.data)
          this.formData = _.cloneDeep(res.data)
          this.disabled = true
        })
        .catch(e => {
          this.listShow = false
          this.$showFailure(e)
        })
    },
    getRangerAsyncConfig() {
      // this.asyncRanger = true
      api.getRangerSyncConfig().then(res => {
        const rs = res.data.data || []
        const dataSourceList = rs.map(item => ({
          ...item,
          definition: (
            this.dataSourceOptions.find(
              model => model.modelId === item.modelId
            ) || {}
          ).definition,
        }))
        this.dataSourceList = dataSourceList
        this.originSourceData = _.cloneDeep(dataSourceList)
        if (rs[0]) {
          this.asyncRanger = rs[0].sync
        } else {
          this.asyncRanger = false
        }
      })
    },
    saveFormData() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          if (
            this.formData.prefix !== this.originData.prefix ||
            this.formData.digitPart !== this.originData.digitPart ||
            this.formData.suffix !== this.originData.suffix
          ) {
            this.formData.nextVal = this.formData.startVal
          }
          api
            .updateInformationItemCodeConfig({
              ...this.formData,
              suffix: this.formData.suffix ? this.formData.suffix : '',
            })
            .then(res => {
              if (res.status === 200) {
                this.$datablauMessage.success(
                  this.$t('securityModule.editSuccess')
                )
                this.getItemsConfig()
              }
            })
        } else {
          return false
        }
      })
    },
    edit() {
      if (this.activeName === 'itemsCode') {
        this.$DatablauCofirm(this.$t('config.editTip'))
          .then(() => {
            this.disabled = false
          })
          .catch(e => {
            console.log(e)
          })
      }
      if (this.activeName === 'asyncRanger') {
        this.disabled = false
      }
    },
    addSource() {
      this.$set(this.dataSourceList, this.dataSourceList.length, {
        modelId: '',
        serviceName: '',
        editable: true,
      })
    },
    toEditSource(row, index) {
      this.$set(this.dataSourceList[index], 'editable', true)
      row.editable = true
    },
    toDeleteSource(source, index) {
      // this.dataSourceList.splice(index, 1)
      this.$DatablauCofirm(this.$t('securityModule.sureDelTip')).then(() => {
        api
          .deleteRangerDataSource(source.id)
          .then(res => {
            if (res.data.status === 200) {
              this.$datablauMessage.success(
                this.$t('securityModule.delSuccess')
              )
              this.getRangerAsyncConfig()
            } else {
              this.$datablauMessage.error(this.$t('securityModule.delFailed'))
            }
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    // 保存 ranger 配置数据源
    toSaveSource(source, index) {
      // console.log(index)
      let valid = true
      this.dataSourceList.forEach(source => {
        if (!source.modelId) {
          this.$datablauMessage.error(
            this.$t('securityModule.searchDataSource')
          )
          valid = false
        } else {
          if (!source.serviceName) {
            this.$datablauMessage.error(this.$t('config.inputService'))
            valid = false
          }
        }
      })
      if (valid) {
        // this.dataSourceList[index].editable = false
        api
          .addRangerDataSource({ ...source, editable: undefined, sync: false })
          .then(res => {
            if (res.data.status === 200) {
              this.$datablauMessage.success(
                this.$t('securityModule.editSuccess')
              )
              this.getRangerAsyncConfig()
            } else {
              this.$datablauMessage.error(this.$t('securityModule.editFailed'))
            }
          })
          .catch(err => {
            this.$showFailure(err)
          })
      }
    },
    toCancelSource(source, index) {
      if (source.id) {
        const originProp = this.originSourceData.find(
          item => item.id === source.id
        )
        if (originProp) {
          source.modelId = originProp.modelId
          source.serviceName = originProp.serviceName
        }
        source.editable = false
      } else {
        this.dataSourceList.splice(index, 1)
      }
    },
    // 改变 ranger 同步状态
    changeRangerSyncStatus() {
      if (this.asyncRanger) {
        if (this.dataSourceList.find(item => item.editable)) {
          this.$datablauMessage.error(this.$t('config.saveTip'))
          this.asyncRanger = false
          return
        }
        // 判断是否添加了数据源，如果没有，给错误提示
        const validSource = this.dataSourceList.filter(
          item => item.modelId && item.serviceName
        )
        if (validSource.length === 0) {
          this.$datablauMessage.error(this.$t('config.inputTip'))
          this.asyncRanger = false
          return
        }
      }
      api
        .updateRangerSycnStatus(this.asyncRanger)
        .then(res => {
          if (res.data.status === 200) {
            this.$datablauMessage.success(this.$t('config.setSuccess'))
          } else {
            this.$datablauMessage.error(this.$t('config.setFailed'))
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    closeSave() {
      this.disabled = true
      if (this.activeName === 'itemsCode') {
        this.$refs.formData.resetFields()
        this.getItemsConfig()
      } else {
        this.getRangerAsyncConfig()
      }
    },
    handleTabClick(node) {
      this.disabled = true
      if (node.name === 'itemsCode') {
        this.getItemsConfig()
      }
      if (node.name === 'asyncRanger') {
        api.getSourceByType('HIVE').then(res => {
          this.dataSourceOptions = res.data.data || []
          // 获取最新ranger同步配置
          this.getRangerAsyncConfig()
        })
      }
    },
  },
  watch: {},
}
