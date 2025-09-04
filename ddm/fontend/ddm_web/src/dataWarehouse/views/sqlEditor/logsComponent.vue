<template>
  <div class="result-data" :class="{'dark-theme-result': theme === 'dark'}">
    <div class="top-line">
      <div class="hidden-btn">
        <datablau-button
          @click="refreshTab"
          size="small"
          type="icon"
          tooltip-content="刷新"
          class="iconfont icon-refresh"
        >
        </datablau-button>
        <datablau-button
          @click="clearLogsRun"
          size="small"
          type="icon"
          tooltip-content="清空日志"
          class="iconfont icon-delete"
        >
        </datablau-button>
        <datablau-button
          @click="exportFile"
          size="small"
          type="icon"
          tooltip-content="导出日志"
          class="iconfont icon-export"
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
import HTTP from '@/dataWarehouse/resource/http'
import string from '@/resource/utils/string'
export default {
  data () {
    return {
      monacoOpts: {
        value: '',
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
    sqlStartId: {
      type: [Number, String]
    },
    item: {
      type: Object
    }
  },
  components: { monaco },
  computed: {},
  methods: {
    hiddenLineageTab () {
      this.$emit('hiddenLineageTab')
    },
    refreshTab () {
      this.monacoOpts.value = ''
      this.sqlStartId && this.getLogsList(this.sqlStartId)
    },
    getLogsList (sqlStartId, limit = 500, skipLineNum = 0) {
      let time = null
      HTTP.getLogs({
        taskInstanceId: sqlStartId,
        limit: limit,
        skipLineNum: skipLineNum
      })
        .then(res => {
          if (res.data?.message) {
            let val = this.monacoOpts.value
            val += res.data.message
            this.$set(this.monacoOpts, 'value', val)
            time = setTimeout(() => {
              this.getLogsList(sqlStartId, limit + 500, skipLineNum + res.data.lineNum)
              clearTimeout(time)
            }, 2000)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clearLogsRun () {
      this.$set(this.monacoOpts, 'value', '')
    },
    exportFile () {
      if (this.monacoOpts.value) {
        string.exportToFile(this.monacoOpts.value, `${this.item.name}${new Date().getTime()}.log`)
      }
    }
  },
  mounted () {}
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
