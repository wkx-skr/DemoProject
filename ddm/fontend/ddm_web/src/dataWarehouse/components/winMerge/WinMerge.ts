import { MyersDiff } from './Core'
import { Conflict, LineContent, MoveValueMethod } from './Constant'
import ContentType from '@/dataWarehouse/components/winMerge/ContentType'
import { Range } from 'monaco-editor'
import { ResizeObserver } from 'resize-observer'
import $ from 'jquery'

const monaco = require('monaco-editor/esm/vs/editor/editor.api')
interface WinMergeInterface {
  /**
   * 返回一侧monaco编辑器中的不含程序为了进行比较自动添加的空行字符串
   * @param isLeft 通过布尔值表示左侧或右侧
   * @return monaco编辑器中的字符串
   */
  getValue (isLeft : boolean) : string | null | undefined;

  /**
   * 移动某块或完整内容到另一侧
   * @param method MoveValueMethod枚举类型,可选值LeftToRight|RightToLeft|LeftAllToRight|RightAllToLeft
   * @param conflictIndex 移动冲突块的索引，null表示当前差异
   * @return 不需要返回值
   */
  moveValue (method: MoveValueMethod, conflictIndex: number | null): void;

  /**
   * 在冲突块中进行导航
   * @param command 1表示下一个，-1表示上一个, 0表示当前, Number.MAX_SAFE_INTEGER表示最后一个
   * @return 不需要返回值
   */
  navigateConflict (command: number | null): void;

  /**
   * 是否有上一个冲突快
   * @param 不需要参数
   * @return 布尔值，表示有无
   */
  hasPrevConflict (): boolean;

  /**
   * 是否有下一个冲突快
   * @param 不需要参数
   * @return 布尔值，表示有无
   */
  hasNextConflict (): boolean;
}

class WinMerge implements WinMergeInterface {
  private leftEditor: any;
  private rightEditor: any;
  private leftFullScript: string;
  private rightFullScript: string;
  private leftScript: string;
  private rightScript: string;
  private leftLineContent: Array<LineContent>;
  private rightLineContent: Array<LineContent>;
  private leftNothingLinesIndex: Array<number>;
  private rightNothingLinesIndex: Array<number>;
  private conflicts: Array<Conflict>;
  private conflictIndex: number = 0;
  private conflictOnly: boolean = false;
  private noWorkflow : boolean;
  private bar : boolean;
  private evnDataValue: string;

  public constructor (leftScript: string, rightScript: string, leftEditor, rightEditor, noWorkflow, evnDataValue, bar) {
    this.leftEditor = leftEditor
    this.rightEditor = rightEditor
    this.leftScript = leftScript
    this.rightScript = rightScript
    this.noWorkflow = noWorkflow
    this.evnDataValue = evnDataValue
    this.bar = bar
    this.setValueOfEditors()
    this.initEventListener()
  }

  public changeConflictOnly (conflictOnly: boolean) {
    console.log('win.ts', conflictOnly)
    this.conflictOnly = conflictOnly
    this.setValueOfEditors()
  }

  private initEventListener () {
    // const resizeObserver = new ResizeObserver(() => {
    //   this.updateWidgets()
    // })
    // resizeObserver.observe($(this.leftEditor._domElement).find('.lines-content')[0])
    // todo onresize方法不推荐使用
    window.onresize = () => {
      this.updateWidgets()
    }
  }
  private setValueOfEditors (): void {
    let myersDiff = new MyersDiff()
    let leftList = this.leftScript.replace(/\r/g, '').split('\n')
    let rightList = this.rightScript.replace(/\r/g, '').split('\n')
    let pathNode = myersDiff.buildPath(leftList, rightList)
    const result = myersDiff.buildDiff(pathNode, leftList, rightList)
    this.leftLineContent = []
    this.rightLineContent = []
    const leftBuffer: Array<LineContent> = []
    const rightBuffer: Array<LineContent> = []
    result.forEach((item: LineContent) => {
      if (item.type === ContentType.Normal) {
        /*
        将相同内容压入两侧
         */
        this.leftLineContent.push(item)
        this.rightLineContent.push(item)
      }
      if (item.type === ContentType.TopLine) {
        /*
        清空buffer
         */
        leftBuffer.length = 0
        rightBuffer.length = 0
      }
      if (item.type === ContentType.Minus) {
        leftBuffer.push(item)
      }
      if (item.type === ContentType.Plus) {
        rightBuffer.push(item)
      }
      if (item.type === ContentType.EndLine) {
        /*
        处理buffer中的数据
         */
        if (leftBuffer.length > 0 && rightBuffer.length > 0) {
          /*
          变化
           */
          leftBuffer.forEach(item => {
            this.leftLineContent.push(item)
          })
          rightBuffer.forEach(item => {
            this.rightLineContent.push(item)
          })
          if (leftBuffer.length !== rightBuffer.length) {
            let diff = rightBuffer.length - leftBuffer.length
            for (let i = 0; i < Math.abs(diff); i++) {
              let nothingLine = diff > 0 ? this.leftLineContent : this.rightLineContent
              nothingLine.push({
                content: '',
                type: ContentType.Nothing
              })
            }
          }
        }
        if (leftBuffer.length > 0 && rightBuffer.length === 0) {
          /*
          仅左侧包含
           */
          leftBuffer.forEach(item => {
            this.leftLineContent.push(item)
            this.rightLineContent.push({
              content: '',
              type: ContentType.Nothing
            })
          })
        }
        if (rightBuffer.length > 0 && leftBuffer.length === 0) {
          /*
          仅右侧包含
           */
          rightBuffer.forEach(item => {
            this.rightLineContent.push(item)
            this.leftLineContent.push({
              content: '',
              type: ContentType.Nothing
            })
          })
        }
      }
    })
    this.leftEditor.setValue(this.leftLineContent.map(i => i.content).join('\n').replace(/\r/g, ''))
    this.rightEditor.setValue(this.rightLineContent.map(i => i.content).join('\n').replace(/\r/g, ''))
    this.calculateConflicts()
    this.removeWidgets()
    this.addWidgets()
    this.highlight()
  }

  private calculateConflicts (): void {
    const conflicts = []
    let conflict = new Conflict()
    this.leftLineContent.forEach((item, idx, arr) => {
      if (idx === 0) {
        if (item.type !== ContentType.Normal) {
          conflict.start = 0
        }
      }
      if (idx > 0 && arr[idx - 1].type !== item.type && this.rightLineContent[idx].type !== this.rightLineContent[idx - 1].type) {
        if (conflict.start === -1) {
          conflict.start = idx
        } else {
          conflict.end = idx - 1
          conflicts.push(conflict)
          conflict = new Conflict()
        }
      } else if (idx === arr.length - 1) {
        if (conflict.start !== -1) {
          conflict.end = idx
          conflicts.push(conflict)
        }
      }
    })
    if (this.conflictIndex >= conflicts.length) {
      this.conflictIndex = 0
    }
    this.conflicts = conflicts
  }
  private updateWidgets (): void {
    this.removeWidgets()
    this.addWidgets()
  }
  private removeWidgets (): void {
    $('.user-add-widget').remove()
  }
  private addWidgets (): void {
    const self = this
    const leftEditorWidth = parseInt($(self.leftEditor._domElement).css('width'))
    let isMac = /macintosh|mac os x/i.test(navigator.userAgent)
    function createNode (conflict, conflictIndex, isLeft) {
      const domNode = document.createElement('div')
      if (self.noWorkflow !== false) {
        domNode.className = 'user-add-widget'
        domNode.style.color = '#5583c9'
        domNode.style.fontSize = '19px'
        domNode.style.padding = '5px'
        domNode.style.cursor = 'pointer'
        domNode.style.position = 'absolute'
        if (self.bar) {
          domNode.innerHTML = isLeft ? '<i class="iconfont icon-triangle"></i>' : '<div class="reverse"><i class="iconfont icon-triangle"></i></div>'
          domNode.onclick = function () {
            self.moveValue(isLeft ? MoveValueMethod.LeftToRight : MoveValueMethod.RightToLeft, conflictIndex)
          }
        }
        if (isLeft) {
          domNode.style.left = leftEditorWidth - 100 + 'px'
        } else {
          domNode.style.left = '38px'
        }
        if (isMac) {
          domNode.style.top = `${conflict.start * 18 - 12}px`
        } else {
          domNode.style.top = `${conflict.start * 19 - 12}px`
        }
      } else {
        let nameSpan = self.leftLineContent[conflict.start].content.replace(/,/g, '')
        let nameId = nameSpan.split(':')[1].replace(/\s*/g, '')
        let sourceName = ''
        let targetName = ''
        JSON.parse(self.evnDataValue).forEach(element => {
          if (element.sourceId === nameId) {
            sourceName = element.sourceName
            targetName = element.targetName
          }
        })
        // 工作流中对比
        domNode.innerHTML = isLeft ? `<p class="tips-p"><span class="name-span">${sourceName}</span><span class="arrowhead-span"></span></p>` : `<p class="tips-p"><span class="name-span">${targetName}</span><span class="arrowhead-span"></span></p>`
        domNode.className = 'user-add-widget'
        domNode.style.color = '#5583c9'
        domNode.style.fontSize = '12px'
        domNode.style.padding = '5px'
        domNode.style.position = 'absolute'
        let distance = null
        if (isMac) {
          domNode.style.top = `${conflict.start * 18 - 10}px`
          distance = 100
        } else {
          domNode.style.top = `${conflict.start * 19 - 10}px`
          distance = 110
        }
        if (isLeft) {
          domNode.style.left = self.leftLineContent[conflict.start].content.length * 8 + distance + 'px'
        } else {
          domNode.style.left = self.rightLineContent[conflict.start].content.length * 8 + distance + 'px'
        }
      }
      return domNode
    }
    if (this.noWorkflow !== false) {
      const leftDom = $(this.leftEditor._domElement).find('.lines-content')
      const rightDom = $(this.rightEditor._domElement).find('.margin')
      this.conflicts.forEach((conflict, conflictIndex) => {
        $(leftDom).append(createNode(conflict, conflictIndex, true))
        $(rightDom).append(createNode(conflict, conflictIndex, false))
      })
    } else {
      const leftDom = $(this.leftEditor._domElement).find('.lines-content')
      const rightDom = $(this.rightEditor._domElement).find('.lines-content')
      this.conflicts.forEach((conflict, conflictIndex) => {
        $(leftDom).append(createNode(conflict, conflictIndex, true))
        $(rightDom).append(createNode(conflict, conflictIndex, false))
      })
    }
  }

  public hasNextConflict (): boolean {
    return this.conflictIndex < this.conflicts.length - 1
  }

  public hasPrevConflict (): boolean {
    return this.conflictIndex > 0
  }

  private highlight (): void {
    const list = this.leftLineContent
    const leftDecorations = []
    const rightDecorations = []
    const pushDecoration = (className, lineNumber, isLeft) => {
      const decorations = isLeft ? leftDecorations : rightDecorations
      decorations.push({
        range: new Range(lineNumber, 1, lineNumber, 10),
        options: {
          // marginClassName: className,
          className: className,
          isWholeLine: true
        }
      })
    }
    if (this.conflictIndex === Number.MAX_SAFE_INTEGER) {
      this.conflictIndex = this.conflicts.length - 1
    }
    const currentConflict = this.conflicts[this.conflictIndex]
    if (currentConflict) {
      const range = {
        startLineNumber: currentConflict.start,
        endLineNumber: currentConflict.end,
        startColumn: 1,
        endColumn: 1
      }
      this.leftEditor.revealRangeInCenter(range)
      this.rightEditor.revealRangeInCenter(range)
      // this.leftEditor.revealRangeInCenter()
    }
    for (let i = 0; i < list.length; i++) {
      const leftItem = list[i]
      const rightItem = this.rightLineContent[i]
      const inCurrentConflict = currentConflict && i >= currentConflict.start && i <= currentConflict.end
      if (this.noWorkflow === false || !this.bar) {
        // 工作流中对比
        let className = !this.bar ? 'm-line-current-plus' : 'm-line-current-plus2'
        if (leftItem.type === ContentType.Minus) {
          if (inCurrentConflict) {
            pushDecoration(className, i + 1, true)
          } else {
            pushDecoration(className, i + 1, true)
          }
        }
        if (rightItem.type === ContentType.Plus) {
          if (inCurrentConflict) {
            pushDecoration(className, i + 1, false)
          } else {
            pushDecoration(className, i + 1, false)
          }
        }
      } else {
        if (leftItem.type === ContentType.Minus) {
          if (inCurrentConflict) {
            pushDecoration('m-line-current-plus', i + 1, true)
          } else {
            pushDecoration('m-line-plus', i + 1, true)
          }
        }
        if (rightItem.type === ContentType.Plus) {
          if (inCurrentConflict) {
            pushDecoration('m-line-current-plus', i + 1, false)
          } else {
            pushDecoration('m-line-plus', i + 1, false)
          }
        }
      }
      if (leftItem.type === ContentType.Nothing) {
        if (inCurrentConflict) {
          pushDecoration('m-line-current-nothing', i + 1, true)
        } else {
          pushDecoration('m-line-nothing', i + 1, true)
        }
      }
      if (rightItem.type === ContentType.Nothing) {
        if (inCurrentConflict) {
          pushDecoration('m-line-current-nothing', i + 1, false)
        } else {
          pushDecoration('m-line-nothing', i + 1, false)
        }
      }
    }
    this.leftEditor.deltaDecorations([], leftDecorations)
    this.rightEditor.deltaDecorations([], rightDecorations)
  }

  public navigateConflict (command: number | null): void {
    switch (command) {
      case +1:
        this.conflictIndex++
        break
      case -1:
        this.conflictIndex--
        break
      case 0:
        this.conflictIndex = 0
        break
      case Number.MAX_SAFE_INTEGER:
        this.conflictIndex = Number.MAX_SAFE_INTEGER
        break
      default:
        break
    }
    this.leftScript = this.leftEditor.getValue()
    this.rightScript = this.rightEditor.getValue()
    const leftDecorations = this.leftEditor.getModel().getAllDecorations()
    const rightDecorations = this.rightEditor.getModel().getAllDecorations()
    const leftNothingLinesIndex = []
    const rightNothingLinesIndex = []
    const isCurrentLine = d => {
      return (d.options.className === 'm-line-nothing' || d.options.className === 'm-line-current-nothing') && d.range.endColumn === 1
    }
    leftDecorations.forEach(d => {
      if (isCurrentLine(d)) {
        leftNothingLinesIndex.push(d.range.startLineNumber - 1)
      }
    })
    rightDecorations.forEach(d => {
      if (isCurrentLine(d)) {
        rightNothingLinesIndex.push(d.range.startLineNumber - 1)
      }
    })
    this.leftNothingLinesIndex = leftNothingLinesIndex
    this.rightNothingLinesIndex = rightNothingLinesIndex
    this.leftScript = this.leftScript.split('\n').filter((v, i) => !leftNothingLinesIndex.includes(i)).join('\n')
    this.rightScript = this.rightScript.split('\n').filter((v, i) => !rightNothingLinesIndex.includes(i)).join('\n')
    this.setValueOfEditors()
  }

  public getValue (isLeft : boolean) : string | null | undefined {
    if (isLeft) {
      return this.leftScript
    } else {
      return this.rightScript
    }
  }

  public moveValue (method: MoveValueMethod, conflictIndex: number | null): void {
    const sideToSide = (isToRight: boolean, conflictIndex: number | null) => {
      let thisSide = this.leftEditor.getValue()
      let thatSide = this.rightEditor.getValue()
      if (!isToRight) {
        [thisSide, thatSide] = [thatSide, thisSide]
      }
      this.navigateConflict(null)
      const currentConflict = this.conflicts[conflictIndex !== null ? conflictIndex : this.conflictIndex]
      const nothingLinesIndex = isToRight ? this.leftNothingLinesIndex : this.rightNothingLinesIndex
      const subStrArr = thisSide.split('\n').filter((v, i) => {
        return !nothingLinesIndex.includes(i) && i >= currentConflict.start && i <= currentConflict.end
      })
      const resultArr = thatSide.split('\n').slice(0, currentConflict.start)
        .concat(subStrArr)
        .concat((thatSide.split('\n').slice(currentConflict.end + 1)))
      if (isToRight) {
        this.rightScript = resultArr.join('\n')
      } else {
        this.leftScript = resultArr.join('\n')
      }
      if (this.hasNextConflict()) {
      } else if (this.hasPrevConflict()) {
        this.conflictIndex = 0
      } else {
        vueMessage()
      }
    }
    function vueMessage () {
      // @ts-ignore
      window.vueThis.$message('两侧的脚本已经完全相同')
    }
    switch (method) {
      case MoveValueMethod.LeftToRight:
        sideToSide(true, conflictIndex)
        break
      case MoveValueMethod.RightToLeft:
        sideToSide(false, conflictIndex)
        break
      case MoveValueMethod.LeftAllToRight:
        this.rightScript = this.leftScript
        vueMessage()
        break
      case MoveValueMethod.RightAllToLeft:
        this.leftScript = this.rightScript
        vueMessage()
        break
      default:
        break
    }
    this.setValueOfEditors()
  }
}
export default WinMerge
