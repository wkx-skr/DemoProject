<template>
  <div>
    <el-form
      v-if="ready"
      class="db-form"
      ref="form"
      v-bind="$attrs"
      v-on="$listeners"
      label-position="right"
      :label-width="labelWidth"
    >
      <slot></slot>
    </el-form>
  </div>
</template>

<script>
import LabelTooltipService from '@/next/service/LabelTooltipService'
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
  },
  mounted() {
    setTimeout(() => {
      this.ready = true
      this.replaceLongLabel()
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
  updated() {
    // console.log('updated')
  },
  methods: {
    replaceLongLabel() {
      LabelTooltipService.basicTitle(this.$el, 'el-form-item__label')
    },
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
              // input是弹框属性的，不再聚焦
              if ($(sibling).find('input').attr('type') !== 'select') {
                $(sibling).find('input').focus()
              }
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
}
.el-form.db-form .el-textarea {
  /*width: 750px;*/
}
.el-form.db-form .el-form-item {
  margin-bottom: 16px;
}
.el-form.db-form .el-form-item__label {
  //margin-top: 3px;
  padding-right: 10px;
}
</style>
