<template>
  <div>
    <datablau-dialog
      :title="dialogTitle"
      width="95%"
      :visible="dialogVisible"
      @close="handleCloseDialog"
      :blackTheme="true"
    >
      <div class="box" ref="box" v-if="showDialogContent">
        <component-bar
          :options="barOptions"
          @conflict-index="navigateConflict"
          @move-value="moveValue"
          @use-value="useValue"
          @toggle-auto-refresh="toggleAutoRefresh"
          @toggle-conflict-only="toggleConflictOnly"
          v-if="noWorkflow && bar "
        ></component-bar>
        <div class="left" ref="left">
          <p style="position: absolute;top: -30px;left: 0;font-size: 14px;color:#bbb" v-if="!noWorkflow || !bar">{{leftType}}</p>
          <component-editor
            ref="leftEditor"
            :auto-refresh="autoRefresh"
            @scroll-change="handleLeftScrollChange"
            @update-decoration="handleUpdateDecoration"
            is-left
            style="height: 100%;"
            :bar="bar"
            :noWorkflow="noWorkflow"
            :evnDataValue="evnDataValue"
          ></component-editor>
        </div>
        <div class="right" ref="right">
          <p style="position: absolute;top: -30px;left: 0;font-size: 14px;color:#bbb" v-if="!noWorkflow || !bar">{{envType}}</p>
          <component-editor
            ref="rightEditor"
            :auto-refresh="autoRefresh"
            @scroll-change="handleRightScrollChange"
            @update-decoration="handleUpdateDecoration"
            :noWorkflow="noWorkflow"
            :bar="bar"
            :evnDataValue="evnDataValue"
            style="height: 100%;"></component-editor>
        </div>
        <div class="middle" ref="middle"></div>
      </div>
      <span slot="footer" v-if="!noWorkflow">
        <datablau-button type="primary" @click="saveJson" v-if="dialogTitle !== '版本对比'">
          保存
        </datablau-button>
        <datablau-button type="primary" @click="handleCloseDialog" v-else>
          关闭
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import $ from 'jquery'
import ComponentBar from './bar.vue'
import ComponentEditor from './editor.vue'
import WinMerge from '@/dataWarehouse/components/winMerge/WinMerge'
import { format } from 'sql-formatter'

export default {
  components: {
    ComponentBar,
    ComponentEditor
  },
  data () {
    return {
      dialogVisible: false,
      showDialogContent: false,
      resizeOuter: null,
      winMerge: null,
      barOptions: {
        hasNextConflict: false,
        hasPrevConflict: false
      },
      autoRefresh: true,
      conflictOnly: false
    }
  },
  props: {
    noWorkflow: {
      type: Boolean,
      default: true
    },
    bar: {
      type: Boolean,
      default: true
    },
    leftType: {
      type: String,
      default: '测试环境'
    },
    dialogTitle: {
      type: String,
      default: '版本冲突处理'
    },
    envType: {
      type: String
    },
    evnDataValue: {
      type: String
    }
  },
  mounted () {
  },
  beforeDestroy () {
    this.winMerge = null
  },
  methods: {
    saveJson () {
      let time = parseInt(new Date().getTime()) + ''
      let name = 'workflow-' + this.envType + '-'
      const element = document.createElement('a')
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.$refs.rightEditor.monacoEditor.getValue()))
      element.setAttribute('download', name + time)
      element.style.display = 'none'
      element.click()
      this.dialogVisible = false
    },
    init (localScript, onlineScript) {
      this.showDialogContent = true
      this.dialogVisible = true
      this.initResizeHorizontal()
      this.$nextTick(() => {
        this.$refs.leftEditor.init(localScript)
        this.$refs.rightEditor.init(onlineScript)
        setTimeout(() => {
          this.winMerge = new WinMerge(
            localScript,
            onlineScript,
            this.$refs.leftEditor.monacoEditor,
            this.$refs.rightEditor.monacoEditor,
            this.noWorkflow,
            this.evnDataValue,
            this.bar
          )
          if (!this.noWorkflow) {
            this.$refs.leftEditor.monacoEditor.setValue(JSON.stringify(JSON.parse(this.$refs.leftEditor.monacoEditor.getValue()), null, '\t'))
            this.$refs.rightEditor.monacoEditor.setValue(JSON.stringify(JSON.parse(this.$refs.rightEditor.monacoEditor.getValue()), null, '\t'))
            // this.$refs.leftEditor.monacoEditor.setValue(
            //   format(this.$refs.leftEditor.monacoEditor.getValue())
            // )
            // this.$refs.rightEditor.monacoEditor.setValue(
            //   format(this.$refs.rightEditor.monacoEditor.getValue())
            // )
            this.navigateConflict()
          }
          this.updateBarOptions()
        })
      })
    },
    updateBarOptions () {
      this.barOptions.hasNextConflict = this.winMerge.hasNextConflict()
      this.barOptions.hasPrevConflict = this.winMerge.hasPrevConflict()
    },
    navigateConflict (command) {
      this.winMerge.navigateConflict(command)
      this.updateBarOptions()
    },
    handleUpdateDecoration () {
      this.winMerge.navigateConflict(null)
    },
    moveValue (method) {
      // todo
      this.winMerge.moveValue(method, null)
      this.updateBarOptions()
    },
    useValue (isLeft) {
      let value = isLeft ? this.$refs.leftEditor.monacoEditor.getValue() : this.$refs.rightEditor.monacoEditor.getValue()
      value = this.winMerge.getValue(isLeft)
      this.$emit('set-value', value)
      this.handleCloseDialog()
    },
    initResizeHorizontal () {
      setTimeout(() => {
        this.resizeOuter = new ResizeHorizontal($(this.$refs.left), $(this.$refs.right), $(this.$refs.middle), $(this.$refs.box), '10px')
      }, 1000)
    },
    handleCloseDialog () {
      this.resizeOuter = null
      this.dialogVisible = false
      this.showDialogContent = false
    },
    /*
    * 左侧滚动条驱动右侧
    */
    handleLeftScrollChange (e) {
      const editor = this.$refs.rightEditor.monacoEditor
      editor.setScrollTop(e.scrollTop)
      editor.setScrollLeft(e.scrollLeft)
    },
    /*
    右侧滚动条驱动左侧
     */
    handleRightScrollChange (e) {
      const editor = this.$refs.leftEditor.monacoEditor
      editor.setScrollTop(e.scrollTop)
      editor.setScrollLeft(e.scrollLeft)
    },
    toggleAutoRefresh (autoRefresh) {
      this.autoRefresh = autoRefresh
    },
    toggleConflictOnly (conflictOnly) {
      this.conflictOnly = conflictOnly
    }
  },
  watch: {
    conflictOnly () {
      this.winMerge.changeConflictOnly(this.conflictOnly)
    }
  }
}
</script>

<style scoped lang="scss">
$marginBottom: -20px;
$barHeight: 30px;
.box {
  /*background: pink;*/
  height: 70vh;
  max-height: 555px;
  position: relative;
}
.left {
  position: absolute;
  left: 0;
  top: $barHeight;
  bottom: $marginBottom;
  width: 50%;
  min-width: 400px;
}
.right {
  position: absolute;
  top: $barHeight;
  right: 0;
  bottom: $marginBottom;
  left: 50%;
}
.middle {
  cursor: e-resize;
  width: 10px;
  position: absolute;
  left: calc(50% - 5px);
  top: $barHeight;
  bottom: $marginBottom;
}
</style>
