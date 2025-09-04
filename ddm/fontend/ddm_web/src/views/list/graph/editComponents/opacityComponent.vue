<template>
    <div id="opacity-component">
        <!-- <el-slider style="width:100px;position:absolute;" input-size="mini" v-model="currentValue" :format-tooltip="formatTooltip" @change="updateRgba"></el-slider> -->
        透明度
        <el-form @submit.native.prevent :disabled="disabled"  style="width:122px;height: 50px;position:absolute;left:47px;top:-1px;" :model="form" ref="form" :rules="rules" label-width="0" :inline="false" size="mini">
          <el-form-item label="" prop="currentValue">
            <el-autocomplete
                :disabled="disabled"
                style="width:80px;"
                size="mini"
              v-model="form.currentValue"
              :fetch-suggestions="getSuggestions"
                @keyup.enter.native="() => {}"
              @input="updateRgba"
            ></el-autocomplete>
          </el-form-item>
        </el-form>

        <span style="position:absolute;left:100px;top:50%;transform: translateY(-50%);">%</span>
    </div>
</template>
<script>
export default {
  props: ['rgba', 'disabled'],
  data () {
    let checkNum = (rule, value, callback) => {
      if (isNaN(parseInt(value))) {
        callback(new Error('请输入整数'))
      } else {
        if (value < 0) {
          callback(new Error('请输入正整数'))
        } else if (value > 100) {
          callback(new Error('输入值不能大于100'))
        } else {
          callback()
        }
        // if (this.ruleForm.checkPass !== '') {
        //   this.$refs.ruleForm.validateField('checkPass')
        // }
      }
    }
    return {
      form: {
        currentValue: '100'
      },
      rules: {
        currentValue: [
          { validator: checkNum, trigger: 'blur change' }
        ]
      },
      suggestions: [{ value: '70' }, { value: '50' }, { value: '30' }, { value: '10' }]
    }
  },
  methods: {
    getSuggestions (queryString, cb) {
      cb(this.suggestions)
    },
    formatTooltip (val) {
      return val + '%'
    },
    updateRgba (val) {
      if (!this.rgba) {
        return
      }
      let arr = this.rgba.split(',')
      if (isNaN(Number.parseInt(this.form.currentValue))) {
        this.$blauShowFailure('请输入整数')
        return
      }
      let temp = Number.parseInt(this.form.currentValue)
      if (temp < 0) {
        temp = 0
      } else if (temp > 100) {
        temp = 100
      }
      this.form.currentValue = temp + ''
      this.$emit('update:rgba', `rgba(${arr[0].slice(5)}, ${arr[1].slice(1)}, ${arr[2].slice(1)}, ${(parseInt(this.form.currentValue) / 100)})`)
    }
  },
  watch: {
    rgba: {
      handler (val) {
        if (val) {
          let arr = this.rgba.split(',')
          let num = parseInt((parseFloat(val.split(',')[3].slice(1, -1)) * 100).toFixed(0))
          if (isNaN(num) || num > 100 || num < 0) {
            num = 100
            this.$emit('update:rgba', `rgba(${arr[0].slice(5)}, ${arr[1].slice(1)}, ${arr[2].slice(1)}, 1)`)
          }
          this.form.currentValue = isNaN(num) ? '0' : num + ''
        } else {
          this.form.currentValue = '100'
        }
      },
      immediate: true
    }
  }
}
</script>
<style lang="scss">
#opacity-component {
    display:inline-block;
    width: 127px;
    height: 38px;
    position: relative;
    .el-slider__bar {
        background-color: #409EFF;
    }
    .el-slider__button {
        width: 8px;
        height: 8px;
        background-color: #409EFF;
    }
}
</style>
<style lang="scss" scoped>
    #opacity-component {
      height: 28px;
      line-height: 28px;
    }
    .el-autocomplete:hover /deep/ .el-input__inner {
        border-color: #409EFF;
    }
</style>
