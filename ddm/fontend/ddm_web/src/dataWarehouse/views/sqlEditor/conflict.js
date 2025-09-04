import { MyersDiff } from '@/dataWarehouse/views/sqlEditor/core'
import ContentType from './ContentType'

export default {
  data () {
    return {
      resultList: {}
    }
  },
  mounted () {
    this.$bus.$on('mo-highlight', () => {
      this.highlight()
    })
  },
  beforeDestroy () {
    this.$bus.$off('mo-highlight')
  },
  computed: {
    currentCodeDetailId () {
      return this.editFiles.filter(i => i.id === parseInt(this.currentFile))[0]?.codeDetailId
    }
  },
  methods: {
    testConflict (data) {
      // console.log(data)
    },
    handleConflict (data, content) {
      let editor = this.$refs['editor'].monacoEditor
      let result = this.buildDiff(content, data.content.content)
      editor.setValue(result)
      return result.includes('<<<<<<<') && result.includes('>>>>>>>')
    },
    buildDiff (currentData, netData) {
      let myersDiff = new MyersDiff()
      try {
        let oldList = netData.split('\n')
        let newList = currentData.split('\n')
        let pathNode = myersDiff.buildPath(oldList, newList)
        this.$set(this.resultList, this.currentCodeDetailId, myersDiff.buildDiff(pathNode, oldList, newList))
        setTimeout(() => {
          this.highlight()
        })
        return this.resultList[this.currentCodeDetailId].map(i => i.content).join('\n')
      } catch (e) {
        console.log(e)
      }
    },
    highlightWhenValueChange (value) {
      const list = this.resultList[this.currentCodeDetailId]
      let idx = 0
      // todo handle remove highlight when value changed by user.
    },
    highlight () {
      const list = this.resultList[this.currentCodeDetailId]
      const decorations = []
      const pushDecoration = (className, lineNumber) => {
        decorations.push({
          range: new monaco.Range(lineNumber, 1, lineNumber, 10),
          options: {
            marginClassName: className,
            className: className,
            isWholeLine: true
          }
        })
      }
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if ([ContentType.TopLine, ContentType.MiddleLine].includes(item.type)) {
          pushDecoration('m-line-start', i + 1)
        } else if ([ContentType.Minus].includes(item.type)) {
          pushDecoration('m-line-minus', i + 1)
        } else if ([ContentType.Plus].includes(item.type)) {
          pushDecoration('m-line-plus', i + 1)
        } else if ([ContentType.EndLine].includes(item.type)) {
          pushDecoration('m-line-end', i + 1)
        }
      }
      this.editor.deltaDecorations([], decorations)
      // this.editor.deltaDecorations(
      //   [],
      //   [
      //     {
      //       range: new monaco.Range(2, 1, 5, 10),
      //       options: {
      //         marginClassName: 'm-line-minus',
      //         className: 'm-line-minus',
      //         isWholeLine: true
      //         // hoverMessage: {
      //         //   value: 'Extracted from [saveAll()]'
      //         // }
      //       }
      //     }, {
      //       range: new monaco.Range(8, 1, 15, 10),
      //       options: {
      //         marginClassName: 'm-line-plus',
      //         className: 'm-line-plus',
      //         isWholeLine: true
      //       }
      //     }
      //   ]
      // )
    }
  },
  watch: {
    currentFile (n, o) {
      // console.log(n, o)
    }
  }
}

/*
  monaco.languages.registerCodeLensProvider('sql', {
      provideCodeLenses: function (model, token) {
        let newCodeLens = []
        let editor = model.myEditor
        if (editor) {
          let content = model.getValue()
          let contentSplit = content.split('\n')
          let compareDatas = []

          // 当前的所在的状态，start开始状态，split分层状态，end结束状态
          let status = 'end'
          // 当前版本的内容
          let versionContent = ''
          // 冲突块
          let conflitBlock = {}
          let versionContentCount = 0
          contentSplit.forEach((line, index) => {
            let currentLine = index + 1
            if (line.startsWith('<<<<<<<')) {
              conflitBlock = {
                // 信息提示的行号
                startLine: currentLine,
                // 结束行
                endLine: -1,
                // 本地版本内容
                currentVersionContent: '',
                // 当前版本的总行数
                currentVersionLineCount: -1,
                // 远程版本内容
                incomingVersionContent: '',
                // 远程版本的总行数
                incomingVersionLineCount: -1
              }
              status = 'start'
              versionContent = ''
            } else if (line.startsWith('>>>>>>>') && status === 'split') {
              conflitBlock.incomingVersionContent = versionContent
              conflitBlock.endLine = currentLine
              conflitBlock.incomingVersionLineCount = versionContentCount
              versionContent = ''
              versionContentCount = 0
              status = 'end'
              compareDatas.push(conflitBlock)
            } else if (line.startsWith('=======') && status === 'start') {
              conflitBlock.currentVersionContent = versionContent
              conflitBlock.currentVersionLineCount = versionContentCount
              versionContent = ''
              versionContentCount = 0
              status = 'split'
            } else {
              if (status === 'start' || status === 'split') {
                versionContent = versionContent + line
                versionContentCount = versionContentCount + 1
              }
            }
          })

          let codeDecorations = []
          if (compareDatas.length > 0) {
            for (let compareData of compareDatas) {
              let { startLine, endLine, currentVersionContent, currentVersionLineCount, incomingVersionContent, incomingVersionLineCount } = compareData

              // 使用本地版本触发按钮
              newCodeLens.push(createCodeLen('currentVersion', '使用本地的版本', startLine, endLine, 1, editor, currentVersionContent))

              // 使用远程版本按钮
              newCodeLens.push(createCodeLen('incomingVersion', '使用远程版本', startLine, endLine, 2, editor, incomingVersionContent))

              // 合并两个版本按钮
              newCodeLens.push(createCodeLen('bothVersion', '同时使用两个版本', startLine, endLine, 3, editor, currentVersionContent + '\r\n' + incomingVersionContent))

              // 当前版本的标签
              codeDecorations.push(createMergeDecoration(startLine, startLine, 'currentVersionTag'))
              // 当前版本的代码范围 开始行数 + 当前版本的总行数
              codeDecorations.push(createMergeDecoration(startLine, startLine + currentVersionLineCount, 'currentContentTag'))

              // 远程版本的代码范围 结束行数 - 远程行数的总行数
              codeDecorations.push(createMergeDecoration(endLine - 1, endLine - incomingVersionLineCount, 'incomingContentTag'))
              // 远程版本的标签
              codeDecorations.push(createMergeDecoration(endLine, endLine, 'incomingVersionTag'))
            }
          }

          let oldMergeDecorations = editor.oldMergeDecorations ? editor.oldMergeDecorations : []
          // 返回的是一个decotation集，可以对期进行增删处理
          var decorations = editor.deltaDecorations(
            oldMergeDecorations,
            codeDecorations
          )

          editor.oldMergeDecorations = decorations
        }

        return {
          lenses: newCodeLens,
          dispose: () => { }
        }
      },
      resolveCodeLens: function (model, codeLens, token) {
        alert('condLens')
        return codeLens
      }
    })
    // 创建对比按钮
    var createCodeLen = (id, title, startLine, endLine, column, editor, replaceValue) => {
      return {
        range: {
          startLineNumber: startLine,
          startColumn: column,
          endLineNumber: endLine,
          endColumn: column
        },
        id,
        command: {
          id: 'mergeVersion',
          title,
          arguments: [{
            startLine,
            endLine,
            editor,
            replaceValue
          }]
        }
      }
    }

    // 创建
    var createMergeDecoration = (startLine, endLine, classStyleName) => {
      return {
        range: new monaco.Range(startLine, 1, endLine, 1),
        options: {
          isWholeLine: true,
          className: classStyleName
        }
      }
    }
 */
