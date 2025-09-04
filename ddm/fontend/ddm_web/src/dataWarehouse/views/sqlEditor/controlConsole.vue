<template>
  <div class="result-data" :class="{'dark-theme-result': theme === 'dark'}">
    <div class="top-line">
      <div class="hidden-btn">
        <datablau-button
          @click="clearLogsRun"
          size="small"
          type="icon"
          tooltip-content="清空日志"
          class="iconfont icon-delete"
        >
        </datablau-button>
        <datablau-button
          @click="hiddenLineageTab"
          size="small"
          type="icon"
          class="icon el-icon-minus"
        >
        </datablau-button>
      </div>
    </div>
    <monaco
      ref="editor"
      :opts="monacoOpts"
      :isDiff="false"
      :clearLog="true"
      @clearLogsRun="clearLogsRun"
      class="monaco"
    ></monaco>
  </div>
</template>

<script>
import monaco from './monaco.vue'
export default {
  data () {
    return {
      monacoOpts: {
        value: this.errorMes,
        origin: '',
        readOnly: true,
        theme: 'vs-dark'
      }
    }
  },
  props: {
    theme: {
      type: String
    },
    errorMes: {
      type: String
    }
  },
  components: { monaco },
  computed: {
    /* monacoOpts () {
      console.log(this.errorMes, '  this.errorMes')
      return {
        value: this.errorMes,
        origin: '',
        readOnly: true,
        theme: 'vs-dark'
      }
    } */
  },
  methods: {
    hiddenLineageTab () {
      this.$emit('hiddenLineageTab')
    },
    clearLogsRun () {
      // this.$set(this.monacoOpts, 'value', '')
      this.$emit('clearLogsRun')
      this.$refs.editor.monacoEditor.setValue('')
    },
    setValue (val) {
      this.$refs.editor.monacoEditor.setValue(val)
    },
    clearHighLight () {
      this.$refs.editor.clearHighLight()
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
  .result-data {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    .top-line {
      position: relative;
      height: 32px;
      border-bottom: 1px solid #e5e5e4;
      overflow: hidden;

      .data-tabs {
        margin-left: 20px;
      }
    }

    .hidden-btn {
      position: absolute;
      right: 20px;
      top: 3px;
      /*width: 20px;*/
      height: 20px;
      z-index: 2;
    }

    &.dark-theme-result {
      .top-line {
        border-bottom: 1px solid #353535;
      }
    }
  }
  .monaco{
    position: absolute;
    top: 32px;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
