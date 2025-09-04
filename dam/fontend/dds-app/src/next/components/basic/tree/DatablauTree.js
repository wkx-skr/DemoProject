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
    // 带锁可点击,没有提示(资产浏览页面目录空间公开访问，无权限的)
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
    // 为每个节点设置Id
    setId: {
      type: String,
      default: '',
    },
    // 树节点是否可点击
    canNodeClick: {
      type: Boolean,
      default: true,
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
    return {
      ...DATA,
      showLockedTips: {},
      lockedTips: '',
      hideTimer: null,
      showTimer: null,
    }
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
    isTooltipDisabled(h, node, data) {
      if (!this.showOverflowTooltip) {
        return true
      }
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = node.label
      $(document.body).append(span)
      const width = parseInt($(span).css('width'))
      this.$nextTick(() => {
        const boxWidth = parseInt($(this.$el).css('width'))
        let exWidth
        if (this.dataSupervise) {
          exWidth = 92
        } else {
          exWidth = 67
        }
        // const itemWidth = boxWidth - 75 - 18 * node.level
        const itemWidth = boxWidth - exWidth - 18 * (node.level - 1)
        if (this.$isIEAll) {
          span.removeNode(true)
        } else {
          span.remove()
        }
        const bool = itemWidth > width
        this.$set(data, 'curTootip', bool)
      })
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
    // 没有权限的节点的tips
    callLockedTips(data) {
      clearTimeout(this.hideTimer)
      this.showLockedTips[data.id] = false
      this.showTimer = setTimeout(() => {
        this.dataLockedTip(data).then(res => {
          res(data).then(rs => {
            this.showLockedTips[data.id] = true
            this.lockedTips = rs
          })
        })
      }, 300)
    },
    hideLockedTips(data) {
      clearTimeout(this.showTimer)
      this.hideTimer = setTimeout(() => {
        this.showLockedTips[data.id] = false
      }, 300)
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
            icon: 'width: 16px; max-height: 16px;display:inline-block',
            noClick:
              'position:absolute; top: 0; right: 0;left: 0; bottom: 0;z-index: 2; cursor: no-drop',
          }
          const HAS_ICON =
            this.dataIconFunction && this.dataIconFunction(data, node)
          const HAS_IMG =
            this.dataImgFunction && this.dataImgFunction(data, node)
          if (HAS_ICON || HAS_IMG) {
            style.label += 'left: 23px;'
          } else {
            style.label += 'left: 0;'
            style.outer += 'top: -16px'
          }
          const LOCKED =
            this.dataLockedFunction && this.dataLockedFunction(data)
          if (LOCKED && !(this.dataLockedTip instanceof Promise)) {
            data.lockedTip =
              this.dataLockedTip(data) || `您对该目录没有访问权限`
          }
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
          this.isTooltipDisabled(h, node, data)
          // const HAS_DRAG = this.$attrs.draggable && this.$attrs['allow-drag'] && this.$attrs['allow-drag'](data)
          return (
            <span style={style.outer} id={this.setId ? data[this.setId] : null}>
              {HAS_ICON ? (
                <span
                  style={style.icon}
                  class={this.dataIconFunction(data, node)}
                ></span>
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
                // disabled={this.isTooltipDisabled(h, node)}
                disabled={data.curTootip}
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
              {/* 如果用户对该节点没有权限，不允许用户进行点击，并给用户相关提示信息 */}
              {LOCKED && !this.LockedClick ? (
                <el-tooltip
                  placement="bottom-end"
                  open-delay={500}
                  effect="light"
                  popper-class="locked-tips"
                  value={this.showLockedTips[data.id]}
                  manual={data.dataLockedTip instanceof Promise}
                >
                  <div slot="content">
                    <i
                      class="iconfont icon-gaojing"
                      style={{
                        color: '#ff7519',
                        marginRight: '5px',
                      }}
                    ></i>
                    <span>{this.lockedTips || data.lockedTip}</span>
                  </div>
                  <span
                    style={style.noClick}
                    on-mouseenter={evt => this.callLockedTips(data)}
                    on-mouseleave={evt => this.hideLockedTips(data)}
                    on-click={evt => {
                      evt.stopPropagation()
                      return
                    }}
                  ></span>
                </el-tooltip>
              ) : (
                ''
              )}
            </span>
          )
        }
        // if (this.dataSupervise && this.dataOptions && this.dataOptions(data))
      }
    },
  },
}
