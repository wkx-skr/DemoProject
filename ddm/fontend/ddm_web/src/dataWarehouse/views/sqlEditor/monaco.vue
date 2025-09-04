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
// import * as monaco from 'monaco-editor'
// import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution'
// import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution'
// import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
// import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
// 汉化 monaco
import { setLocaleData } from 'monaco-editor-nls'
// eslint-disable-next-line camelcase
import zh_CN from 'monaco-editor-nls/locale/zh-hans'
import { format } from 'sql-formatter'
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
    height: {
      type: Number,
      default: 300
    },
    isDiff: {
      type: Boolean,
      default: false
    },
    clearLog: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modelId: null,
      schemaName: null,
      // 主要配置
      defaultOpts: {
        value: '', // 编辑器的值
        theme: 'vs', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
        roundedSelection: true, // 右侧显示编辑器预览框
        autoIndent: true, // 自动缩进
        origin: '', // 编辑器服务器上的值
        language: 'sql',
        readOnly: false,
        contextmenu: true,
        selectOnlineNumbers: true,
        renderSideBySide: false,
        automaticLayout: true,
        folding: true, // 是否折叠
        foldingHighlight: true, // 折叠等高线
        foldingStrategy: 'auto', // 折叠方式  auto | indentation
        showFoldingControls: 'mouseover', // 是否一直显示折叠 always | mouseover
        scrollBeyondLastLine: false
      },
      // 编辑器对象
      monacoEditor: null,
      monacoDiffEditor: null,
      /* getTablesCache: this.memoize(this.getTables),
      getColumnsCache: this.memoize(this.getColumns), */
      tableNames: [],
      page: 1,
      keyWord: '',
      totalItems: 1,
      oldDec: [], // 装饰器
      schemaList: []
    }
  },
  beforeDestroy () {
    this.monacoEditor?.dispose()
    window.provider.dispose()
    this.$bus.$off('sendAssetData')
    this.$bus.$off('sqlHighlight')
    this.$bus.$off('sqlHighlightClear')
    this.$bus.$off('rowHighlight')
  },
  watch: {
    opts: {
      handler (val, old) {
        let editorOptions = Object.assign(this.defaultOpts, this.opts)
        this.monacoEditor.updateOptions(editorOptions)
        this.monacoEditor.setValue(this.opts.value)
      },
      deep: true
    },
    isDiff () {
      this.init()
    },
    async schemaName () {
      this.changeSchemaName()
    }
    /* async modelId () {
      if (!this.modelId) return
      let res = await this.getSchemas(this.modelId)
      this.schemaList = res.data
    } */
  },
  mounted () {
    this.initHint()
    this.init()
    this.bindMenuItem()
    this.$bus.$on('sendAssetData', (modelId, schemaName) => {
      this.modelId = modelId
      this.schemaName = schemaName
    })
    this.$bus.$on('sqlHighlight', (name) => {
      this.columnHighLight(name)
    })
    this.$bus.$on('sqlHighlightClear', (name) => {
      this.clearHighLight(name)
    })
    this.$bus.$on('rowHighlight', (lineNum, errorMessage) => {
      this.rowHighlight(Number(lineNum), errorMessage)
    })
  },
  methods: {
    async changeSchemaName () {
      window.provider?.dispose()
      window.provider = null
      if (this.schemaName) {
        await this.getTables(this.modelId, this.schemaName)
        // await this.getTablesCache(this.modelId, this.schemaName)
      }
      this.initHint()
    },
    /* memoize (fn) {
      let cache = {}
      return async function () {
        let key = JSON.stringify(arguments)
        cache[key] = cache[key] || await fn.apply(this, arguments)
        return cache[key]
      }
    }, */
    async getSchemas (modelId, keyWord = '') {
      return this.$http.get(`${this.$dddUrl}/datatype/${this.modelId}/raw-schemas?search=${keyWord}`)
    },
    async getTables (modelId, schemaName, lastToken = '') {
      const reg = /['"&$||@\\*\\%()]/gi
      if (reg.test(lastToken)) {
        lastToken = ''
      }
      return this.$http.get(`${this.$dddUrl}/datatype/${modelId}/${encodeURIComponent(schemaName)}/raw-tables?pageSize=50&currentPage=1&search=`)
    },
    async getColumns (modelId, schemaName, tableName) {
      return this.$http.get(`${this.$dddUrl}/datatype/${modelId}/${schemaName}/${tableName}/raw-columns-detail`)
    },
    initHint () {
      if (!window.provider) {
        let self = this
        window.provider = monaco.languages.registerCompletionItemProvider('sql', {
          provideCompletionItems: async function (model, position) {
            // 获取当前行数
            const line = position.lineNumber

            // 获取当前列数
            const column = position.column
            // 获取当前输入行的所有内容
            const content = model.getLineContent(line)
            let word = model.getWordUntilPosition(position)
            let range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }

            // 通过下标来获取当前光标后一个内容，即为刚输入的内容
            let sym = content[column - 2]
            if (sym === '.') {
              let startIndex = 0
              for (let i = column - 3; i >= 0; i--) {
                if (content[i] === '.' || content[i] === ' ') {
                  startIndex = i
                  break
                }
              }
              const beforeStr = (content.slice(startIndex === 0 && content[startIndex] !== '.' ? startIndex : startIndex + 1, column - 2)).replace(' ', '')
              if (self.schemaList.indexOf(beforeStr) !== -1) {
                self.schemaName = beforeStr
                try {
                  // let res = await self.getTables(this.keyWord)
                  // self.tableNames = new Set(res.data)
                  self.tableNames = []
                  self.page = 1
                  let res = await self.getTables(self.modelId, beforeStr, self.keyWord)
                  self.tableNames = res.data.content
                  let suggestions = [ ...res.data.content.map((i, index) => ({
                    label: i, // 显示的提示内容
                    kind: monaco.languages.CompletionItemKind['EnumMember'], // 用来显示提示内容后的不同的图标
                    insertText: i, // 选择后粘贴到编辑器中的文字
                    detail: '', // 提示内容后的说明
                    range: range
                  }))]
                  return {
                    suggestions
                  }
                } catch (err) {
                  self.$showFailure(err)
                }
              }
              if (self.tableNames.indexOf(beforeStr) !== -1) {
                // let res = await self.getColumnsCache(self.modelId, self.schemaName, beforeStr)
                let res = await self.getColumns(self.modelId, self.schemaName, beforeStr)
                let columns = res.data.map(item => item.name)
                let suggestions = [...columns.map(i => ({
                  label: i, // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['Enum'], // 用来显示提示内容后的不同的图标
                  insertText: i, // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                }))]
                return {
                  suggestions
                }
              } else {
                return {
                  suggestions: []
                }
              }
            }
            let textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column })
            // ---------------------------------------------------
            // 上面的代码仅仅是为了获取sym，即提示符
            // ---------------------------------------------------
            // 直接提示，以下为sql语句关键词提示
            let sqlStr = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LIMIT', 'ORDER BY', 'GROUP BY', 'select', 'from', 'where', 'and', 'or', 'limit', 'order by', 'group by']
            const tokens = textUntilPosition.trim().split(/\s+/)
            const lastToken = tokens[tokens.length - 1].toLowerCase()
            const reg = /['"&$||@\\*\\%()]/gi
            if (sqlStr.indexOf(lastToken.trim()) !== -1 || reg.test(self.keyWord)) {
              self.keyWord = ''
            } else {
              self.keyWord = lastToken
            }
            if (self.modelId) {
              try {
                // let res = await self.getTables(this.keyWord)
                // self.tableNames = new Set(res.data)
                let res = await self.getSchemas(self.modelId)
                let resTable = await self.getTables(self.modelId, self.schemaName, self.keyWord)
                self.schemaList = res.data
                self.tableNames = resTable.data.content
                let suggestions = [...sqlStr.map(i => ({
                  label: i, // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['Function'], // 用来显示提示内容后的不同的图标
                  insertText: i, // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                })), ...self.schemaList.map((i, index) => ({
                  label: i, // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['User'], // 用来显示提示内容后的不同的图标
                  insertText: i, // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                })), ...self.tableNames.map((i, index) => ({
                  label: i, // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['EnumMember'], // 用来显示提示内容后的不同的图标
                  insertText: i, // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                }))]
                return {
                  suggestions
                }
              } catch (err) {
                self.$showFailure(err)
              }
            }
            if (self.modelId && self.schemaName) {
              try {
                // let res = await self.getTables(this.keyWord)
                // self.tableNames = new Set(res.data)
                self.tableNames = []
                self.page = 1
                let res = await self.getTables(self.modelId, self.schemaName, self.keyWord)
                self.tableNames = res.data.content
                let suggestions = [...sqlStr.map(i => ({
                  label: i, // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['Function'], // 用来显示提示内容后的不同的图标
                  insertText: i, // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                })), ...res.data.content.map((i, index) => ({
                  label: i, // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['EnumMember'], // 用来显示提示内容后的不同的图标
                  insertText: i, // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                }))]
                return {
                  suggestions
                }
              } catch (err) {
                self.$showFailure(err)
              }
            } else {
              return {
                suggestions: [
                  ...sqlStr.map(i => ({
                    label: i, // 显示的提示内容
                    kind: monaco.languages.CompletionItemKind['Function'], // 用来显示提示内容后的不同的图标
                    insertText: i, // 选择后粘贴到编辑器中的文字
                    detail: '', // 提示内容后的说明
                    range: range
                  }))
                ]
              }
            }
          },
          triggerCharacters: ['.', ' ']
        })
      }
    },
    bindMenuItem () {
      let offsetX
      let offsetY
      $(document).contextmenu(e => {
        offsetX = e.clientX
        offsetY = e.clientY
      })
      !this.clearLog && this.monacoEditor.addAction({
        id: 'course', // 菜单项 id
        label: '查看存储过程', // 菜单项名称
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
          // chord
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Q
          )], // 绑定快捷键
        // precondition: null,
        // keybindingContext: null,
        contextMenuGroupId: 'navigation', // 所属菜单的分组
        contextMenuOrder: 1.5,
        run: () => {
          let text = this.monacoEditor.getModel().getValueInRange(this.monacoEditor.getSelection())
          if (!text) {
            this.$datablauMessage.warning('请先选中要查询的存储过程名称')
            return
          }
          this.$bus.$emit('viewProcedure', { name: text, type: 'procedure', id: text, modelId: this.modelId, schemaName: '', offsetX, offsetY })
        } // 点击后执行的操作
      })
      !this.clearLog && this.monacoEditor.addAction({
        id: 'formatting',
        label: '程序格式化', // 菜单项名称
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F9,
          // chord
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D
          )],
        // precondition: null,
        // keybindingContext: null,
        contextMenuGroupId: 'navigation', // 所属菜单的分组
        contextMenuOrder: 1,
        run: () => {
          let selectText = this.monacoEditor.getModel().getValueInRange(this.monacoEditor.getSelection())
          let selectObj = this.monacoEditor.getSelection()
          // this.monacoEditor.trigger('source', 'editor.action.deleteLines')
          if (!selectText) {
            this.monacoEditor.setValue(format(this.monacoEditor.getValue()))
            return
          }
          let insertText = format(selectText)
          this.monacoEditor.executeEdits('', [
            {
              range: new monaco.Range(selectObj.startLineNumber, selectObj.startColumn, selectObj.endLineNumber, selectObj.endColumn),
              text: insertText
            }
          ])
        }
      })
      this.clearLog && this.monacoEditor.addAction({
        id: 'clearLogs',
        label: '清空日志', // 菜单项名称
        keybindings: [],
        // precondition: null,
        // keybindingContext: null,
        contextMenuGroupId: '9_cutcopypaste', // 所属菜单的分组
        contextMenuOrder: 1,
        run: () => {
          this.$emit('clearLogsRun')
        }
      })
      /* this.monacoEditor.addAction({
        // An unique identifier of the contributed action.
        id: 'editor.action.runSql',

        // A label of the action that will be presented to the user.
        label: '运行当前选中sql',

        // An optional array of keybindings for the action.
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
          // chord
          monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Q
          )
        ],

        // A precondition for this action.
        precondition: null,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: null,

        contextMenuGroupId: 'navigation',

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convenience
        run: () => {
          // alert("i'm running => " + ed.getPosition())
          alert(this.monacoEditor.getModel().getValueInRange(this.monacoEditor.getSelection()))
        }
      }) */
      // function bindKeyWithAction (editor, key, actionID) {
      //   editor.addCommand(key, function () {
      //     editor.trigger('', actionID)
      //   })
      // }
      // bindKeyWithAction(this.monacoEditor, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_V, 'editor.action.clipboardPasteAction')
      let stay = [
        // 'editor.action.jumpToBracket',
        // 'editor.action.selectToBracket',
        // ... action IDs ...
        'editor.action.clipboardCopyAction',
        'editor.action.clipboardCutAction',
        'editor.action.clipboardPasteAction',
        'vs.editor.ICodeEditor:1:course',
        'vs.editor.ICodeEditor:1:formatting',
        'vs.editor.ICodeEditor:2:clearLogs'
      ]
      for (let [MenuId, LinkedList] of menus.entries()) {
        for (let obj of LinkedList) {
          if (obj.command) {
            switch (obj.command.title) {
              case 'Cut': obj.command.title = '剪切'; break
              case 'Copy': obj.command.title = '复制'; break
              case 'Paste': obj.command.title = '粘贴'; break
              case 'Change All Occurrences': obj.command.title = '查找引用'; break
              case 'Command Palette': obj.command.title = '命令面板'; break
            }
          } else {
            // let index = LinkedList.remove(obj)
            // remove(obj)
            // console.log(index)
          }
        }
        /* if (typeof menu === 'undefined') { continue }
        console.log(menu)
        for (let index = 0; index < menu.length; index++) {
          if (typeof menu[index].command === 'undefined') { continue }
          // menu[index].command.id获取action的ID字符串
          // console.log(menu[index].command.id)

          if (!stay.includes(menu[index].command.id) && menu[index].command.id.indexOf('course') === -1 && menu[index].command.id.indexOf('formatting') === -1 && menu[index].command.id.indexOf('clearLogs') === -1 && menu[index].command.id.indexOf('copy') === -1 && menu[index].command.id.indexOf('cut') === -1 && menu[index].command.id.indexOf('affix') === -1) {
            menu.splice(index, 1)
            index--
          }
        } */
      }
    },
    init () {
      if (!this.isDiff) {
        if (this.monacoEditor) {
          this.monacoEditor.dispose()
          this.monacoEditor = null
          this.monacoDiffEditor = null
        }
      } else {
        if (this.monacoDiffEditor) {
          this.monacoDiffEditor.dispose()
          this.monacoDiffEditor = null
          this.monacoEditor = null
        }
      }
      // 初始化container的内容，销毁之前生成的编辑器
      this.$refs.container.innerHTML = ''
      // 生成编辑器配置
      let editorOptions = Object.assign(this.defaultOpts, this.opts)
      if (!this.isDiff) {
        // 初始化编辑器实例
        this.monacoEditor = monaco.editor.create(this.$refs.container, _.cloneDeep(editorOptions))
      } else {
        // 初始化编辑器实例
        this.monacoDiffEditor = monaco.editor.createDiffEditor(this.$refs.container, _.cloneDeep(editorOptions))
        this.monacoDiffEditor.setModel({
          original: monaco.editor.createModel(editorOptions.origin, editorOptions.language),
          modified: monaco.editor.createModel(editorOptions.value, editorOptions.language)
        })
        // 编辑器内容发生改变时触发
        this.monacoEditor = this.monacoDiffEditor.getModifiedEditor()
      }
      // 编辑器内容发生改变时触发
      this.monacoEditor.onDidChangeModelContent(() => {
        this.$emit('change', this.monacoEditor.getValue())
      })
      this.monacoEditor.onDidChangeCursorSelection(() => {
        this.$emit('select', this.monacoEditor.getModel().getValueInRange(this.monacoEditor.getSelection()))
      })
    },
    clearHighLight () {
      this.monacoEditor.deltaDecorations(this.oldDec, [])
    },
    columnHighLight (sqlName) {
      this.oldDec.forEach(element => {
        this.monacoEditor.deltaDecorations(element, [])
      })
      this.monacoEditor.revealLineInCenter(this.monacoEditor.getModel().findMatches(sqlName)[0].range.startLineNumber)
      this.monacoEditor.getModel().findMatches(sqlName).forEach(element => {
        this.oldDec.push(
          this.monacoEditor.deltaDecorations(
            [],
            [
              {
                range: element.range,
                options: {
                  inlineClassName: 'm-line-hight',
                  className: 'm-line-hight',
                  isWholeLine: false,
                  marginClassName: 'errorBg'
                }
              }
            ]
          )
        )
      })
    },
    rowHighlight (lineNum, errorMessage) {
      const r = new monaco.Range(lineNum, 1, lineNum, 10000)
      // 滚动到行
      // editor.revealLine(lineNum)
      // 滚动到行，使其处于中心
      this.monacoEditor.revealLineInCenter(lineNum)
      this.oldDec = this.monacoEditor.deltaDecorations(
        [],
        [
          {
            range: r,
            options: {
              inlineClassName: 'm-line-row',
              className: 'm-line-row',
              isWholeLine: true,
              hoverMessage: {
                value: errorMessage
                // value: [1, 2, 3],
              }, // 悬停信息
              // minimap: { position: 1 }, // 小地图中注入装饰
              marginClassName: 'errorBg'
            }
          }
        ]
      )
    },
    upDateDiff (val) {
      this.monacoDiffEditor.updateOptions({
        renderSideBySide: !val
      })
    },
    // 供父组件调用手动获取值
    getVal () {
      return this.monacoEditor.getValue()
    },
    changeTheme (theme) {
      monaco.editor.setTheme(theme)
    }
  }
}
</script>
<style scoped lang="scss">
</style>
<style>
  .main {
    padding: 0;
  }
  .m-line-hight{
    background: #a37c14;
  }
  .m-line-row{
    background: rgba(218,31,9,.4);
  }
  .errorBg{
    background:  rgba(218,31,9,.4);
  }
</style>
