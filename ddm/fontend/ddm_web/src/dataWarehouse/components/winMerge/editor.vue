<template>
  <div>
    <div
      ref="container"
      class="monaco-editor"
      :style="`height: 100%`"
    ></div>
  </div>
</template>
<script>
import $ from 'jquery'
// 汉化 monaco
import { setLocaleData } from 'monaco-editor-nls'
// eslint-disable-next-line camelcase
import zh_CN from 'monaco-editor-nls/locale/zh-hans'
setLocaleData(zh_CN)
const monaco = require('monaco-editor/esm/vs/editor/editor.api')
let menus = require('monaco-editor/esm/vs/platform/actions/common/actions').MenuRegistry._menuItems
export default {
  name: 'MonacoEditor',
  props: {
    opts: {
      type: Object,
      default () {
        return {}
      }
    },
    isLeft: {
      type: Boolean,
      default: false
    },
    autoRefresh: {
      type: Boolean
    },
    noWorkflow: {
      type: Boolean,
      default: true
    },
    bar: {
      type: Boolean,
      default: true
    },
    evnDataValue: {
      type: String
    }
  },
  data () {
    return {
      monacoEditor: null,
      // 主要配置
      defaultOpts: {
        value: '', // 编辑器的值
        theme: 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
        roundedSelection: true, // 右侧显示编辑器预览框
        autoIndent: true, // 自动缩进
        origin: '', // 编辑器服务器上的值
        language: 'sql',
        readOnly: false,
        selectOnlineNumbers: true,
        renderSideBySide: false,
        automaticLayout: true,
        folding: true, // 是否折叠
        foldingHighlight: true, // 折叠等高线
        foldingStrategy: 'auto', // 折叠方式  auto | indentation
        showFoldingControls: 'mouseover', // 是否一直显示折叠 always | mouseover
        scrollBeyondLastLine: false,
        minimap: {
          enabled: !this.isLeft
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    init (script) {
      monaco.editor.defineTheme('datablau-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          // 'editor.foreground': '#000000',
          'editor.background': '#1e1e1e',
          // 'editorCursor.foreground': '#8B0000',
          'editor.lineHighlightBackground': '#333333'
          // 'editorLineNumber.foreground': '#008800',
          // 'editor.selectionBackground': '#333333',
          // 'editor.inactiveSelectionBackground': '#88000015'
        }
      })
      // 初始化container的内容，销毁之前生成的编辑器
      this.$refs.container.innerHTML = ''
      // 生成编辑器配置
      const opts = _.cloneDeep(this.opts)
      opts.value = ''
      opts.origin = ''
      opts.theme = 'datablau-dark'
      if (!this.noWorkflow || !this.bar) {
        opts.readOnly = true
        opts.language = 'json'
      } else {
        opts.readOnly = false
      }
      let editorOptions = Object.assign(this.defaultOpts, opts)
      setTimeout(() => {
        this.monacoEditor = monaco.editor.create(this.$refs.container, editorOptions)
        this.initScrollbarEventListener()
        this.initContentChangeEventListener()
      })

      // console.log(this.monacoEditor)
      // this.monacoEditor.setValue(script)
      // this.monacoEditor.dispose()
      // console.log(this.monacoEditor.getValue())
    },
    initScrollbarEventListener () {
      this.monacoEditor.onDidScrollChange(scrollEvent => {
        if (scrollEvent.scrollLeftChanged || scrollEvent.scrollTopChanged) {
          this.$emit('scroll-change', scrollEvent)
        }
      })
    },
    initContentChangeEventListener () {
      this.monacoEditor.getModel().onDidChangeContent(changeEvent => {
        if (changeEvent.isFlush) {
          // 忽略初始化的情况
          return
        }
        const change = changeEvent.changes[0]
        if (this.autoRefresh) {
          this.updateDecoration()
        } else {
          if (change.range.endColumn === change.range.startColumn && change.range.endLineNumber === change.range.startLineNumber) {
            if (change.text.includes('\n')) {
              this.updateDecoration()
            } else {
              // this.updateDecoration()
              console.debug('这是在单行内进行输入操作', change.text, change)
            }
          } else if (!change.text && change.range.endLineNumber === change.range.startLineNumber && change.range.endColumn === change.range.startColumn + 1) {
            console.debug('这是在单行内进行backspace')
          } else {
            this.updateDecoration()
          }
        }
      })
    },
    updateDecoration () {
      this.$emit('update-decoration')
    }
  }
}
</script>
