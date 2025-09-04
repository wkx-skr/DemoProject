import api from '../util/api'
import _ from 'lodash'
export default {
  name: 'ParamsConfig',
  props: {},
  mounted() {
    this.getConfig()
  },
  data() {
    return {
      activeName: 'autocode',
      formData: {},
      originData: {},
      rules: {
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: '请输入起始值',
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: '请输入子增量',
            trigger: 'blur',
          },
        ],
      },
      disabled: true,
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
        this.formData.digitPart = value
        this.formData.startVal = 0
      } else if (type === 'startVal') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.formData.startVal = value
      } else if (type === 'incStepSize') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formData.incStepSize = value
      }
    },
    getConfig() {
      api.getInformationItemCodeConfig().then(res => {
        // console.log(res)
        this.originData = _.cloneDeep(res.data)
        this.formData = _.cloneDeep(res.data)
        this.disabled = true
      })
    },
    resetStartValue() {
      this.formData.startVal = 0
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
                this.$blauShowSuccess('保存成功')
                this.getConfig()
              }
            })
        } else {
          return false
        }
      })
    },
    edit() {
      this.$DatablauCofirm(
        '修改code模板，可能会与之前已采用的code模板相同，导致新生成的code大量重复，影响到code模板正常使用，确定修改吗？',
        '提示',
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.disabled = false
        })
        .catch(e => {
          console.log(e)
        })
    },
    closeSave() {
      this.disabled = true
      this.$refs.formData.resetFields()
      this.getConfig()
    },
  },
  watch: {},
}
