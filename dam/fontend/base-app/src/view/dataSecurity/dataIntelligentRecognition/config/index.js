import HTTP from '@/http/main'
export default {
  name: 'ParamsConfig',
  props: {},
  mounted() {
    this.getList()
  },
  data() {
    return {
      activeName: 'autocode',
      formData: {},
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
      } else if (type === 'startVal') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.formData.startVal = value
      } else if (type === 'incStepSize') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        this.formData.incStepSize = value
      }
    },
    getList() {
      HTTP.getfindList()
        .then(res => {
          this.formData = res.data[0]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveFormData() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          HTTP.updateGenerate(this.formData)
            .then(res => {
              this.$message.success('保存成功')
              this.getList()
              this.disabled = true
            })
            .catch(e => {
              this.$showFailure(e)
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
      this.getList()
    },
  },
  watch: {},
}
