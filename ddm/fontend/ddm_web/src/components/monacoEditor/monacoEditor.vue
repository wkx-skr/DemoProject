<template>
    <div class="monaco-editor-container" id="container" ref="container"></div>
</template>
<script>
// monaco editor 官方文档 https://microsoft.github.io/monaco-editor/
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
export default {
  props: {
    // 编辑器初始化时的内容
    codes: {
      type: String,
      default: function () {
        return '//edit somethings'
      }
    },
    // 支持 js ts java等 具体参考
    language: {
      type: String,
      default: function () {
        return 'javascript'
      }
    },
    // 编辑器主题 可选 vs、hc-black、vs-dark
    theme: {
      type: String,
      default: function () {
        return 'vs-dark'
      }
    },
    /** 样例
     * {
     *  startLineNumber: 0,
        startColumn: 0,
        endLineNumber: 0,
        endColumn: 0,
        message: 'msg' // 提示文案
     * }
     */
    errors: {
      type: Array,
      default: function () {
        return []
      }
    },
    // 参考文档
    editorOptions: {
      type: Object,
      default: function () {
        return {
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false, // 只读
          cursorStyle: 'line', // 光标样式
          automaticLayout: true, // 自动布局
          glyphMargin: true, // 字形边缘
          useTabStops: false,
          fontSize: 28, // 字体大小
          autoIndent: true // 自动缩进
        }
      }
    }
  },
  mounted () {
    this.initEditor()
  },
  data () {
    return {

    }
  },
  methods: {
    initEditor () {
      this.monacoEditor = monaco.editor.create(this.$refs.container, {
        value: this.codes,
        language: this.language,
        theme: this.theme,
        editorOptions: this.editorOptions
      })
      // 编辑器创建完成回调
      this.$emit('onMounted', this.monacoEditor)
      // 编辑器内容changge事件
      let that = this
      this.monacoEditor.onDidChangeModelContent(
        function (event) {
          that.$emit('onCodeChange', that.monacoEditor.getValue(), event)
        }
      )
    }

  },
  watch: {
    errors (val) {
      console.log(val, 'error array')
      let newVal = JSON.parse(JSON.stringify(val))
      newVal.severity = monaco.MarkerSeverity.Error // 添加提示类型
      monaco.editor.setModelMarkers(this.monacoEditor.getModel(), 'java', newVal)
    }
  }
}
</script>
<style lang="scss" scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
}
</style>
