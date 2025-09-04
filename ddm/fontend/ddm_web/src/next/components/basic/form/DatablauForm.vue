<template>
  <div>
    <el-form
      v-if="ready"
      class="db-form"
      ref="form"
      v-bind="$attrs"
      v-on="$listeners"
      :label-position="labelPosition"
      :label-width="labelWidth"
      :class="{'black-theme': themeBlack}"
    >
      <slot></slot>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'DatablauForm',
  props: {
    labelWidth: {
      required: false,
      default: '180px',
    },
    validateNoScroll: {
      default: false,
    },
    labelPosition:{
      default: 'right'
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  mounted() {
    setTimeout(() => {
      this.ready = true
    })
  },
  data() {
    let DATA = {
      ready: false,
      timeout: null,
    }
    this.emitElementMethod(DATA)
    return DATA
  },
  methods: {
    emitElementMethod(DATA) {
      const ElementMethods = [
        // 'validate',
        'validateField',
        'resetFields',
        'clearValidate',
      ]
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.form[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        DATA[m] = MethodGenerator(m)
      })
    },
    validate(callback) {
      const Validate = () => {
        this.$refs.form.validate((bool, obj) => {
          if (callback) {
            callback(bool, obj)
          }
          this.handleValidate()
        })
      }
      Validate()
    },
    handleValidate() {
      if (this.validateNoScroll) return
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.$nextTick(() => {
          if ($(this.$el).find('.el-form-item__error')[0]) {
            const sibling = $(this.$el).find('.el-form-item__error')[0]
              .previousElementSibling
            sibling.scrollIntoView()
            if ($(sibling).find('input').length > 0) {
              $(sibling).find('input').focus()
            } else if ($(sibling).find('textarea').length > 0) {
              $(sibling).find('textarea').focus()
            }
          }
        })
        this.timeout = null
      })
    },
  },
}
</script>

<style lang="scss">
.el-form.db-form {
  .datablau-cascader,
  .datablau-select,
  .datablau-input {
    width: 500px;
  }

  .datablau-input[type='textarea'] {
    width: 750px;
  }

  .el-form-item__content {
    font-size: 12px;
    line-height: 32px;
  }

  .el-form-item__error {
    padding-top: 2px;
  }
}
.el-form.db-form .el-textarea {
  /*width: 750px;*/
  font-size: 12px;
}
.el-form.db-form .el-form-item {
  margin-bottom: 16px;
}
.el-form.db-form .el-form-item__label {
  padding-right: 10px;
  line-height: 32px;
}
.black-theme{
  .el-form-item__label{
    color: #BBBBBB !important;
  }
}
</style>
