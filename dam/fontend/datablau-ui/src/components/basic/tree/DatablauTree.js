export default {
  name: 'DatablauTree',
  props: {
    testName: String,
    expandOnClickNode: {
      type: Boolean,
      default: false,
    },
    renderContent: Function,
    dataSupervise: {
      type: Boolean,
      default: false,
    },
    dataOptionsFunction: {
      type: Function,
    },
    // 树节点是否有权限
    dataLockedFunction: {
      type: Function,
    },
    // 无权限时的提示
    dataLockedTip: {
      type: Function,
    },
    // 带锁可点击,没有提示
    LockedClick: {
      type: Boolean,
      default: false,
    },
    dataIconFunction: Function,
    dataImgFunction: Function,
    nodeKey: {
      default: 'id',
    },
    showOverflowTooltip: {
      default: false,
      type: Boolean,
      required: false,
    },
    tooltipPlacement: {
      default: 'bottom-start',
      type: String,
      required: false,
    },
    customNodeKey: {
      type: [String, Number],
      default: '',
    },
    emptyText: {
      type: String,
      default: '',
    },
    useDefaultSort: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  watch: {
    customNodeKey(nval) {
      this.customNodeClick(this.$attrs.data, nval)
    },
    '$attrs.data': {
      immediate: true,
      handler(data, oldData) {
        if (this.useDefaultSort && Array.isArray(data) && data !== oldData) {
          const labelProperty = this.$attrs.props.label
            ? this.$attrs.props.label
            : 'label'
          const childrenProperty = this.$attrs.props.children
            ? this.$attrs.props.children
            : 'children'
          const Foreach = arr => {
            if (Array.isArray(arr)) {
              this.$utils.sort.sortConsiderChineseNumber(arr, labelProperty)
              arr.forEach(item => {
                if (Array.isArray(item[childrenProperty])) {
                  Foreach(item[childrenProperty])
                }
              })
            }
          }
          Foreach(data)
        }
      },
    },
  },
  data() {
    const DATA = {}
    this.emitElementMethod(DATA)
    return DATA
  },
  mounted() {
    // this.emitElementMethod ()
    if (this.customNodeKey) {
      this.customNodeClick(this.$attrs.data, this.customNodeKey)
    }
  },
  methods: {
    customNodeClick(treeData, key) {
      if (!treeData.length) return
      this.$refs.tree.setCurrentKey(key)
      treeData.some(item => {
        if (`${item[this.nodeKey]}` === `${key}`) {
          this.$listeners['node-click'](item, this.getNode(key))
          return true
        } else if (item.children) {
          this.customNodeClick(item.children, key)
        }
      })
    },
    emitElementMethod(DATA) {
      const ElementMethods = [
        'filter',
        'updateKeyChildren',
        'getCheckedNodes',
        'setCheckedNodes',
        'getCheckedKeys',
        'setCheckedKeys',
        'setChecked',
        'getHalfCheckedNodes',
        'getHalfCheckedKeys',
        'getCurrentKey',
        'getCurrentNode',
        'setCurrentKey',
        'setCurrentNode',
        'getNode',
        'remove',
        'append',
        'insertBefore',
        'insertAfter',
      ]
      const MethodGenerator = m => {
        return (...args) => {
          return this.$refs.tree[m](...args)
        }
      }
      ElementMethods.forEach(m => {
        DATA[m] = MethodGenerator(m)
      })
    },
    // 转发element-ui原生事件
    emitElementEvent(eventName, ...args) {
      const resultArgs = []
      resultArgs.push(eventName)
      if (args && args[0] && args[0].length) {
        for (let i = 0; i < args[0].length; i++) {
          resultArgs.push(args[0][i])
        }
      }
      this.$emit.apply(this, resultArgs)
    },
    handleContextMenu(evt, data, node) {
      const HAS_OPTIONS =
        this.dataSupervise &&
        this.dataOptionsFunction &&
        this.dataOptionsFunction(data, node)
      const LOCKED = this.dataLockedFunction && this.dataLockedFunction(data)
      if (HAS_OPTIONS && !LOCKED) {
        this.callContext(data, node, evt, false)
      }
    },
    callContext(data, node, evt, fromRight) {
      evt.stopPropagation()
      const x = evt.clientX
      const y = evt.clientY
      const options = this.dataOptionsFunction(data, node)
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
          placement: fromRight ? 'left' : 'right',
        })
      }
    },
    expandTopLevel() {
      const nodeKey = this.nodeKey
      this.$attrs.data.forEach(item => {
        const node = this.$refs.tree.getNode(item[nodeKey])
        node.expanded = true
      })
    },
    expandAllLevel() {
      const nodeKey = this.nodeKey
      const expandNode = node => {
        node.expanded = true
        if (Array.isArray(node.childNodes)) {
          node.childNodes.forEach(subNode => {
            expandNode(subNode)
          })
        }
      }
      this.$attrs.data.forEach(item => {
        const node = this.$refs.tree.getNode(item[nodeKey])
        expandNode(node)
      })
    },
    collapseTopLevel() {
      const nodeKey = this.nodeKey
      this.$attrs.data.forEach(item => {
        const node = this.$refs.tree.getNode(item[nodeKey])
        node.expanded = false
      })
    },
    isTooltipDisabled(h, node) {
      if (!this.showOverflowTooltip) {
        return true
      }
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = node.label
      $(document.body).append(span)
      const width = parseInt($(span).css('width'))
      const boxWidth = parseInt($(this.$el).css('width'))
      const itemWidth = boxWidth - 75 - 18 * node.level
      if (this.$isIEAll) {
        span.removeNode(true)
      } else {
        span.remove()
      }
      return itemWidth > width
    },
    handleNodeClick(...args) {
      if (
        this.dataLockedFunction &&
        this.dataLockedFunction(args[0]) &&
        !this.LockedClick
      ) {
        this.$datablauMessage.warning(
          this.dataLockedTip
            ? this.dataLockedTip(args[0])
            : `您对"${args[1].label}"没有访问权限`
        )
      } else {
        this.emitElementEvent('node-click', args)
      }
    },
  },
  computed: {
    vLoading() {
      // 检查是否是数组 或是 懒加载
      return !(Array.isArray(this.$attrs.data) || this.$attrs.load)
    },
    renderContentGenerator() {
      if (this.renderContent) {
        return this.renderContent
      } else {
        return (h, { node, data, store }) => {
          const style = {
            outer:
              'position:relative;flex:1;align-items: center;justify-content: space-between;',
            more: 'position:absolute;right: 7px;top:5px',
            lock: 'position:absolute;right: 7px;top:5px;display:inline-block;width: 24px;height: 24px;line-height:24px;background:#fef5e5;color: #ee9d02;border-radius: 12px;text-align:center;',
            label: 'position:absolute;line-height: 34px;',
            img: 'width: 16px; max-height: 16px',
          }
          const HAS_ICON =
            this.dataIconFunction && this.dataIconFunction(data, node)
          const HAS_IMG =
            this.dataImgFunction && this.dataImgFunction(data, node)
          if (HAS_ICON || HAS_IMG) {
            style.label += 'left: 23px;'
          } else {
            style.label += 'left: 0;'
          }
          const LOCKED =
            this.dataLockedFunction && this.dataLockedFunction(data)
          const HAS_OPTIONS =
            this.dataSupervise &&
            this.dataOptionsFunction &&
            this.dataOptionsFunction(data) &&
            this.dataOptionsFunction(data).length > 0
          if (HAS_OPTIONS) {
            style.label += 'right: 30px;'
          } else {
            style.label += 'right: 5px;'
          }
          let labelClass = 'oneline-eclipse'
          // 如果有选项或有锁，预留右侧空间
          if (HAS_OPTIONS || LOCKED) {
            labelClass += ' label-with-more'
          }
          // const HAS_DRAG = this.$attrs.draggable && this.$attrs['allow-drag'] && this.$attrs['allow-drag'](data)
          return (
            <span style={style.outer}>
              {HAS_ICON ? (
                <span class={this.dataIconFunction(data, node)}></span>
              ) : null}
              {HAS_IMG ? (
                <img
                  style={style.img}
                  src={this.dataImgFunction(data, node)}
                ></img>
              ) : null}
              {/* <span class="drag-hint"></span> */}
              {/* {<span class={labelClass} style={style.label}>
                  {node.label}
                </span>} */}
              <el-tooltip
                content={node.label}
                placement={this.tooltipPlacement}
                open-delay={200}
                disabled={this.isTooltipDisabled(h, node)}
              >
                <span class={labelClass} style={style.label}>
                  {node.label}
                </span>
              </el-tooltip>
              {LOCKED ? (
                <span style={style.lock} class="iconfont icon-lock"></span>
              ) : null}
              {HAS_OPTIONS && !LOCKED ? (
                <span
                  class="iconfont icon-lue more"
                  style={style.more}
                  on-click={evt => this.callContext(data, node, evt, true)}
                ></span>
              ) : null}
            </span>
          )
        }
        // if (this.dataSupervise && this.dataOptions && this.dataOptions(data))
      }
    },
  },
}
