<template>
  <datablau-input
    :precision="0"
    v-if="this.udp.UdpValueType==='INTEGER'"
    v-model="vModel"
    size="small"
    @input="handleChange('int', $event)"
    :themeBlack="themeBlack"
    style="width: 250px;"
  >
  </datablau-input>
  <datablau-input
      v-else-if="this.udp.UdpValueType==='DOUBLE'"
      v-model="vModel"
      size="small"
      @input="handleChange('double', $event)"
      :themeBlack="themeBlack"
      style="width: 250px;"
  >
  </datablau-input>
  <datablau-input
      v-else-if="this.udp.UdpValueType === 'STRING'"
      v-model="vModel"
      size="mini"
      placeholder="请输入"
      :themeBlack="themeBlack"
  >
  </datablau-input>
  <datablau-input
    v-else-if="this.udp.UdpValueType === 'LONGTEXT' && !hideLabel"
    v-model="vModel"
    size="mini"
    style="width: 250px;"
    placeholder="请输入"
    type="textarea"
    :themeBlack="themeBlack"
  >
  </datablau-input>
  <div v-else-if="this.udp.UdpValueType === 'LONGTEXT' && hideLabel">
    <datablau-tooltip :disabled="toolTipDisabled(vModel)" v-show="showInput" :content="vModel">
      <datablau-input class="input-wrapper" @focus="inputFocusMethods" v-model="vModel"></datablau-input>
    </datablau-tooltip>
    <datablau-input
      v-show="!showInput"
      v-model="vModel"
      ref="textInput"
      size="mini"
      style="width: 100%;position: relative;background: #fff;z-index: 100;"
      placeholder="请输入"
      type="textarea"
      :autosize="{minRows: 4, maxRows: 4}"
      @blur="showInput = true"
    >
    </datablau-input>
  </div>
  <!--<datablau-datePicker-->
  <!--    v-else-if="this.udp.ValueType==='System.DateTime'"-->
  <!--    v-model="vModel"-->
  <!--    type="datetime"-->
  <!--    size="mini"-->
  <!--&gt;-->
  <!--</datablau-datePicker>-->
  <el-date-picker
      v-else-if="this.udp.UdpValueType==='DATETIME'"
      v-model="vModel"
      type="datetime"
      size="mini"
      :placeholder="$t('common.placeholder.selectPrefix')"
      clearable
      format="yyyy-MM-dd HH:mm:ss"
      :value-format="'yyyy-MM-dd HH:mm:ss'"
      :class="{'black-el-date-picker': themeBlack}"
      :popper-class="themeBlack?'el-date-pickerpopper-black':''"
  >
  </el-date-picker>
</template>

<script>
import moment from 'moment'
export default {
  props: {
    value: {
      required: true
    },
    udp: {
      required: true
    },
    hideLabel: {
      default: false
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  mounted () {
    this.lastVModel = this.value
    // 对时间数据格式化
    if (this.udp.UdpValueType === 'DATETIME' && this.vModel) {
      try {
        let r = this.vModel.match(/^\d{4}-\d{1,2}-\d{1,2}/)
        if (!r) {
          this.vModel = ''
        } else {
          let time = moment(this.vModel)
          this.vModel = time.format('YYYY-MM-DD HH:mm:ss')
        }
      } catch (e) {
        this.vModel = ''
        console.log(e)
      }
    }
  },
  data () {
    return {
      vModel: this.value === null ? this.value : this.value + '',
      lastVModel: undefined,
      showInput: true
    }
  },
  methods: {
    toolTipDisabled (content) {
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = content
      $(document.body).append(span)
      const width = parseInt($(span).css('width'))
      const itemWidth = 170
      if (this.$isIEAll) {
        span.removeNode(true)
      } else {
        span.remove()
      }
      return itemWidth > width
    },
    inputFocusMethods () {
      this.showInput = false
      this.$nextTick(() => {
        this.$refs.textInput.focus()
      })
    },
    handleChange (type, evt) {
      this.vModel = evt === null ? evt : evt + ''
      if (type === 'int') {
        setTimeout(() => {
          if (!!this.vModel && (isNaN(this.vModel) || parseFloat(this.vModel).toString().includes('.'))) {
            this.$message.warning(this.udp.FriendlyName + '的值只能为整数')
            this.vModel = isNaN(parseInt(this.vModel)) ? '' : parseInt(this.vModel)
          } else {
            this.lastVModel = this.vModel
          }
        })
      } else if (type === 'double') {
        setTimeout(() => {
          if (this.vModel && isNaN(this.vModel)) {
            this.$message.warning(this.udp.FriendlyName + '的值只能为Double类型')
            this.vModel = isNaN(parseFloat(this.vModel)) ? '' : parseFloat(this.vModel)
          } else {
            this.lastVModel = this.vModel
          }
        })
      }
    }
  },
  watch: {
    udp: {
      deep: true,
      handler: function () {
        if (this.udp.UdpValueType === 'DATETIME' && this.vModel) {
          try {
            let r = this.vModel.match(/^\d{4}-\d{1,2}-\d{1,2}/)
            if (!r) {
              this.vModel = ''
            } else {
              let time = moment(this.vModel)
              this.vModel = time.format('YYYY-MM-DD HH:mm:ss')
            }
          } catch (e) {
            this.vModel = ''
            console.log(e)
          }
        }
      }
    },
    vModel () {
      this.$emit('update', this.vModel)
    },
    value () {
      // vModel重新赋值是因为udp默认值修改
      this.lastVModel = this.vModel
      if (this.udp.UdpValueType === 'DATETIME' && this.value) {
        try {
          let r = this.value.match(/^\d{4}-\d{1,2}-\d{1,2}/)
          if (!r) {
            this.vModel = ''
          } else {
            let time = moment(this.value)
            this.vModel = time.format('YYYY-MM-DD HH:mm:ss')
          }
        } catch (e) {
          this.vModel = ''
          console.log(e)
        }
      } else {
        this.vModel = this.value === null ? this.value : this.value + ''
      }
    }
  }
}
</script>
<style scoped>
.input-wrapper /deep/ input {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/deep/ .el-input-number__decrease, /deep/ .el-input-number__increase {
  display: none;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: 100%;
}
</style>
<style lang="scss" scoped>
  .black-el-date-picker /deep/{
    width: 170px !important;
  .el-input__inner{
    background: transparent;
    border: 1px solid #4D4D4D;
    color: #BBBBBB;
  }
}
</style>
<style lang="scss">
  .el-date-pickerpopper-black{
    background: #2A2A2A;
    border: 1px solid #333333;
    color: #BBBBBB;
    .popper__arrow{
      border-top-color: #333333 !important;
      border-bottom-color: #333333 !important;
    }
    .popper__arrow::after{
      border-top-color: #333333 !important;
      border-bottom-color: #333333 !important;
    }
    .el-date-picker__header-label{
      color: #BBBBBB;
    }
    .el-date-table th{
      color: #BBBBBB;
    border-bottom: solid 1px #4D4D4D;

    }
    .el-input__inner{
      background: transparent;
      color: #BBBBBB;
      border-color: #4D4D4D;
    }
    .el-date-picker__time-header{
      border-color: #4D4D4D;
    }
    .el-picker-panel__footer{
      background: #2A2A2A;
      border-color: #4D4D4D;
    }
    .el-button{
      background-color: transparent;
      // border-color: #4D4D4D;
      border: 1px solid #4D4D4D;
      color: #BBBBBB;
    }
    .el-button--text{
      border: 1px solid transparent;
      color: #409EFF;
    }
    .el-time-panel{
      background-color: #2A2A2A;
      border: 1px solid #333333;
      color: #BBBBBB;
    }
    .el-time-spinner__item{
      color: #888888;
    }
    .el-time-spinner__item:hover:not(.disabled):not(.active){
      background: rgba(24, 127, 255, .2);
    }
    .el-time-spinner__item.active:not(.disabled){
      color: #BBBBBB;
    }
    .el-time-panel__footer{
      border-color: #4D4D4D;
    }
    .el-time-panel__btn{
      &.cancel{
        color: #BBBBBB;
      }
    }
    .el-time-panel__content::after, .el-time-panel__content::before{
      border-color: #4D4D4D;
    }
    .el-button.is-plain:focus, .el-button.is-plain:hover{
      background:rgba(24, 127, 255, .2);
    }
  }
</style>
