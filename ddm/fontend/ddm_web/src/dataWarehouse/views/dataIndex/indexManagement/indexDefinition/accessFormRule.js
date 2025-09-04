export default {
  data () {
    const authorizedUserNameValidator = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error('授权对象不能为空'))
      } else {
        callback()
      }
    }
    const commencementDateValidator = (rule, value, callback) => {
      if (!value) {
        callback(new Error('生效日期不能为空'))
      } else if (
        !this.formData.id &&
        new Date().getTime() - value > 24 * 3600 * 1000
      ) {
        callback(new Error('生效日期不能是过去的时间'))
      } else {
        callback()
      }
    }
    const endDateValidator = (rule, value, callback) => {
      if (!value) {
        callback(new Error('失效日期不能为空'))
      } else if (value < this.formData.commencementDate) {
        callback(new Error('失效日期不能早于生效日期'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        commencementDate: [
          {
            required: true,
            trigger: 'blur',
            validator: commencementDateValidator
          }
        ],
        endDate: {
          required: true,
          trigger: 'change',
          validator: endDateValidator
        },
        authorizedUserName: {
          required: true,
          trigger: 'change',
          validator: authorizedUserNameValidator
        }
      }
    }
  }
}
