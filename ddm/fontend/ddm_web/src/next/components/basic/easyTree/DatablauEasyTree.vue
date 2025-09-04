<template>
  <div
    class="el-tree datablau-easy-tree"
    :class="{
      'el-tree--highlight-current': highlightCurrent,
      'is-dragging': !!dragState.draggingNode,
      'is-drop-not-allow': !dragState.allowDrop,
      'is-drop-inner': dragState.dropType === 'inner',
    }"
    role="tree"
    ref="tree"
  >
    <template v-if="height && !isEmpty">
      <div
        :style="{
          height: height,
        }"
      >
        <RecycleScroller
          :style="{
            height: height,
            'overflow-y': 'auto',
            'scroll-behavior': 'smooth',
          }"
          key-field="key"
          :items="dataList"
          :item-size="itemSize"
          :buffer="50"
        >
          <template slot-scope="{ active, item }">
            <ElTreeVirtualNode
              v-if="active"
              :style="`height: ${itemSize}px;`"
              :node="item"
              :item-size="itemSize"
              :render-content="treeRenderContent"
              :show-checkbox="showCheckbox"
              :render-after-expand="renderAfterExpand"
              @node-expand="handleNodeExpand"
            />
          </template>
        </RecycleScroller>
      </div>
    </template>

    <template v-else-if="!height">
      <el-tree-node
        v-for="child in visibleChildNodes"
        :key="getNodeKey(child)"
        :node="child"
        :props="props"
        :itemSize="itemSize"
        :show-checkbox="showCheckbox"
        :render-content="treeRenderContent"
        :render-after-expand="renderAfterExpand"
        @node-expand="handleNodeExpand"
      ></el-tree-node>
    </template>
    <div v-if="isEmpty" class="el-tree__empty-block">
      <span class="el-tree__empty-text">{{ emptyText }}</span>
    </div>
    <div
      v-show="dragState.showDropIndicator"
      ref="dropIndicator"
      class="el-tree__drop-indicator"
    ></div>
  </div>
</template>

<script>
import TreeStore from './components/model/tree-store'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { getNodeKey, findNearestComponent } from './components/model/util'
import ElTreeNode from './components/tree-node.vue'
import ElTreeVirtualNode from './components/virtual-tree-node.vue'
import emitter from './components/mixins/emitter.js'
import { addClass, removeClass } from './components/utils/dom'
import './assets/index.scss'

export default {
  name: 'DatablauEasyTree',

  components: {
    // VirtualList,
    RecycleScroller,
    ElTreeNode,
    ElTreeVirtualNode,
  },

  mixins: [emitter],
  props: {
    data: {
      type: Array,
    },
    emptyText: {
      type: String,
      default() {
        return '暂无数据'
      },
    },
    renderAfterExpand: {
      type: Boolean,
      default: true,
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    expandOnClickNode: {
      type: Boolean,
      default: true,
    },
    checkOnClickNode: Boolean,
    checkDescendants: {
      type: Boolean,
      default: false,
    },
    itemSize: {
      type: Number,
      default: 26,
    },
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    defaultCheckedKeys: Array,
    defaultExpandedKeys: Array,
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    allowDrag: Function,
    allowDrop: Function,
    // eslint-disable-next-line vue/require-prop-types
    props: {
      default() {
        return {
          children: 'children',
          label: 'label',
          disabled: 'disabled',
        }
      },
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    highlightCurrent: {
      type: Boolean,
      defalt: true,
    },
    load: Function,
    filterNodeMethod: Function,
    accordion: Boolean,
    indent: {
      type: Number,
      default: 18,
    },
    iconClass: String,
    height: {
      type: [String, Number],
      default: 0,
    },
    extraLine: {
      type: Number,
      default: 8,
    },
    keeps: {
      type: Number,
      default: 40,
    }, // 计算希望渲染的tree节点数
    dataImgFunction: Function,
    dataIconFunction: Function,
    dataLockedFunction: Function,
    dataOptionsFunction: Function,
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
  },

  data() {
    return {
      store: null,
      root: null,
      currentNode: null,
      treeItems: null,
      checkboxItems: [],
      dragState: {
        showDropIndicator: false,
        draggingNode: null,
        dropNode: null,
        allowDrop: true,
      },
      treeNodeName: this.height ? 'ElTreeVirtualNode' : 'ElTreeNode',
    }
  },

  computed: {
    children: {
      set(value) {
        this.data = value
      },
      get() {
        return this.data
      },
    },

    treeItemArray() {
      return Array.prototype.slice.call(this.treeItems)
    },

    isEmpty() {
      const { childNodes } = this.root
      return (
        !childNodes ||
        childNodes.length === 0 ||
        childNodes.every(({ visible }) => !visible)
      )
    },

    visibleChildNodes() {
      return this.root.childNodes.filter(() => {
        return !this.isEmpty
      })
    },

    dataList() {
      return this.smoothTree(this.root.childNodes)
    },
    treeRenderContent() {
      if (this.renderContent) {
        return this.renderContent
      } else {
        return (h, { node, data, store }) => {
          const style = {
            outer:
              'position:relative;flex:1;align-items: center;justify-content: space-between;',
            more: 'position:absolute;right: 7px;top:-3px',
            lock: 'position:absolute;right: 7px;top:-3px;display:inline-block;width: 24px;height: 24px;line-height:24px;background:#fef5e5;color: #ee9d02;border-radius: 12px;text-align:center;',
            label: 'position:absolute;',
            img: 'width: 16px; max-height: 16px',
            noClick:
              'position:absolute; top: 0; right: 0;left: 0; bottom: 0;z-index: 2; cursor: no-drop',
            icon: 'color: #409eff',
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
          if (LOCKED && !(this.dataLockedTip instanceof Promise)) {
            data.lockedTip =
              this.dataLockedTip(data) || `您对该目录没有访问权限`
          }
          const HAS_OPTIONS =
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
          return (
            <span style={style.outer}>
              {HAS_ICON ? (
                <span
                  class={this.dataIconFunction(data, node)}
                  style={style.icon}
                ></span>
              ) : null}
              {HAS_IMG ? (
                <img
                  style={style.img}
                  src={this.dataImgFunction(data, node)}
                ></img>
              ) : null}
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

  watch: {
    defaultCheckedKeys(newVal) {
      this.store.setDefaultCheckedKey(newVal)
    },

    defaultExpandedKeys(newVal) {
      this.store.defaultExpandedKeys = newVal
      this.store.setDefaultExpandedKeys(newVal)
    },

    data(newVal) {
      this.store.setData(newVal)
    },

    checkboxItems(val) {
      Array.prototype.forEach.call(val, checkbox => {
        checkbox.setAttribute('tabindex', -1)
      })
    },

    checkStrictly(newVal) {
      this.store.checkStrictly = newVal
    },
  },

  methods: {
    expandTopLevel() {
      const nodeKey = this.nodeKey
      this.data.forEach(item => {
        const node = this.getNode(item[nodeKey])
        node.expanded = true
      })
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

    smoothTree(treeData) {
      return treeData.reduce((smoothArr, data) => {
        if (data.visible) {
          // Mark different types to avoid being optimized out when assembled into the same dom
          data.type = this.showCheckbox
            ? `${data.level}-${data.checked}-${data.indeterminate}`
            : `${data.level}-${data.expanded}`
          smoothArr.push(data)
        }
        if (data.expanded && data.childNodes.length) {
          smoothArr.push(...this.smoothTree(data.childNodes))
        }

        return smoothArr
      }, [])
    },
    filter(value) {
      if (!this.filterNodeMethod)
        throw new Error('[Tree] filterNodeMethod is required when filter')
      this.store.filter(value)
    },

    scrollToItem(key) {
      if (this.height && !this.isEmpty) {
        const virtualInstance = this.$children.find(
          c => c.$options.name === 'RecycleScroller'
        )
        // Automatically scroll the target item to the top
        const index = virtualInstance.items.findIndex(e => {
          return e.key === key
        })
        this.$nextTick(() => {
          virtualInstance.scrollToItem(index)
        })
      } else {
        throw new Error(
          'scrollToItem can only be used when using virtual scrolling'
        )
      }
    },

    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data)
    },

    getNodePath(data) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in getNodePath')
      const node = this.store.getNode(data)
      if (!node) return []
      const path = [node.data]
      let parent = node.parent
      while (parent && parent !== this.root) {
        path.push(parent.data)
        parent = parent.parent
      }
      return path.reverse()
    },

    getCheckedNodes(leafOnly, includeHalfChecked) {
      return this.store.getCheckedNodes(leafOnly, includeHalfChecked)
    },

    getCheckedKeys(leafOnly) {
      return this.store.getCheckedKeys(leafOnly)
    },

    getCurrentNode() {
      const currentNode = this.store.getCurrentNode()
      return currentNode ? currentNode.data : null
    },

    getCurrentKey() {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in getCurrentKey')
      const currentNode = this.getCurrentNode()
      return currentNode ? currentNode[this.nodeKey] : null
    },

    setCheckedNodes(nodes, leafOnly) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCheckedNodes')
      this.store.setCheckedNodes(nodes, leafOnly)
    },

    setCheckedKeys(keys, leafOnly) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCheckedKeys')
      this.store.setCheckedKeys(keys, leafOnly)
    },

    setChecked(data, checked, deep) {
      this.store.setChecked(data, checked, deep)
    },

    setCheckedAll(checked = true) {
      this.store.setCheckedAll(checked)
    },

    getHalfCheckedNodes() {
      return this.store.getHalfCheckedNodes()
    },

    getHalfCheckedKeys() {
      return this.store.getHalfCheckedKeys()
    },

    setCurrentNode(node) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCurrentNode')
      this.store.setUserCurrentNode(node)
    },

    setCurrentKey(key) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCurrentKey')
      this.store.setCurrentNodeKey(key)
    },

    getNode(data) {
      return this.store.getNode(data)
    },

    remove(data) {
      this.store.remove(data)
    },

    append(data, parentNode) {
      this.store.append(data, parentNode)
    },

    insertBefore(data, refNode) {
      this.store.insertBefore(data, refNode)
    },

    insertAfter(data, refNode) {
      this.store.insertAfter(data, refNode)
    },

    handleNodeExpand(nodeData, node, instance) {
      this.broadcast(this.treeNodeName, 'tree-node-expand', node)
      this.$emit('node-expand', nodeData, node, instance)
    },

    updateKeyChildren(key, data) {
      if (!this.nodeKey)
        throw new Error('[Tree] nodeKey is required in updateKeyChild')
      this.store.updateChildren(key, data)
    },

    initTabIndex() {
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]')
      this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]')
      const checkedItem = this.$el.querySelectorAll(
        '.is-checked[role=treeitem]'
      )
      if (checkedItem.length) {
        checkedItem[0].setAttribute('tabindex', 0)
        return
      }
      this.treeItems[0] && this.treeItems[0].setAttribute('tabindex', 0)
    },

    handleKeydown(ev) {
      const currentItem = ev.target
      if (currentItem.className.indexOf('el-tree-node') === -1) return
      const keyCode = ev.keyCode
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]')
      const currentIndex = this.treeItemArray.indexOf(currentItem)
      let nextIndex
      if ([38, 40].indexOf(keyCode) > -1) {
        // up、down
        ev.preventDefault()
        if (keyCode === 38) {
          // up
          nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0
        } else {
          nextIndex =
            currentIndex < this.treeItemArray.length - 1 ? currentIndex + 1 : 0
        }
        this.treeItemArray[nextIndex].focus() // 选中
      }
      // 始终使用箭头，避免expand-on-click-node=false时不展开
      const expandIcon = currentItem.querySelector('[class*="el-icon-"]')
      if ([37, 39].indexOf(keyCode) > -1 && expandIcon) {
        // left、right 展开
        ev.preventDefault()
        expandIcon.click() // 选中
      }
      const hasInput = currentItem.querySelector('[type="checkbox"]')
      if ([13, 32].indexOf(keyCode) > -1 && hasInput) {
        // space enter选中checkbox
        ev.preventDefault()
        hasInput.click()
      }
    },
  },

  created() {
    this.isTree = true

    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      props: this.props,
      load: this.load,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod,
    })

    this.root = this.store.root

    let dragState = this.dragState

    this.$on('tree-node-drag-start', (event, treeNode) => {
      if (
        typeof this.allowDrag === 'function' &&
        !this.allowDrag(treeNode.node)
      ) {
        event.preventDefault()
        return false
      }
      event.dataTransfer.effectAllowed = 'move'

      // wrap in try catch to address IE's error when first param is 'text/plain'
      try {
        // setData is required for draggable to work in FireFox
        // the content has to be '' so dragging a node out of the tree won't open a new tab in FireFox
        event.dataTransfer.setData('text/plain', '')
      } catch (e) {
        console.log(e)
      }
      dragState.draggingNode = treeNode
      this.$emit('node-drag-start', treeNode.node, event)
    })

    this.$on('tree-node-drag-over', (event, treeNode) => {
      const dropNode = findNearestComponent(
        event.target,
        treeNode.$options.name
      )
      const oldDropNode = dragState.dropNode
      if (oldDropNode && oldDropNode !== dropNode) {
        removeClass(oldDropNode.$el, 'is-drop-inner')
      }
      const draggingNode = dragState.draggingNode
      if (!draggingNode || !dropNode) return

      let dropPrev = true
      let dropInner = true
      let dropNext = true
      let userAllowDropInner = true
      if (typeof this.allowDrop === 'function') {
        dropPrev = this.allowDrop(draggingNode.node, dropNode.node, 'prev')
        userAllowDropInner = dropInner = this.allowDrop(
          draggingNode.node,
          dropNode.node,
          'inner'
        )
        dropNext = this.allowDrop(draggingNode.node, dropNode.node, 'next')
      }
      event.dataTransfer.dropEffect = dropInner ? 'move' : 'none'
      if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
        if (oldDropNode) {
          this.$emit(
            'node-drag-leave',
            draggingNode.node,
            oldDropNode.node,
            event
          )
        }
        this.$emit('node-drag-enter', draggingNode.node, dropNode.node, event)
      }

      if (dropPrev || dropInner || dropNext) {
        dragState.dropNode = dropNode
      }

      if (dropNode.node.nextSibling === draggingNode.node) {
        dropNext = false
      }
      if (dropNode.node.previousSibling === draggingNode.node) {
        dropPrev = false
      }
      if (dropNode.node.contains(draggingNode.node, false)) {
        dropInner = false
      }
      if (
        draggingNode.node === dropNode.node ||
        draggingNode.node.contains(dropNode.node)
      ) {
        dropPrev = false
        dropInner = false
        dropNext = false
      }

      const targetPosition = dropNode.$el.getBoundingClientRect()
      const treePosition = this.$el.getBoundingClientRect()

      let dropType
      const prevPercent = dropPrev
        ? dropInner
          ? 0.25
          : dropNext
          ? 0.45
          : 1
        : -1
      const nextPercent = dropNext
        ? dropInner
          ? 0.75
          : dropPrev
          ? 0.55
          : 0
        : 1

      let indicatorTop = -9999
      const distance = event.clientY - targetPosition.top
      if (distance < targetPosition.height * prevPercent) {
        dropType = 'before'
      } else if (distance > targetPosition.height * nextPercent) {
        dropType = 'after'
      } else if (dropInner) {
        dropType = 'inner'
      } else {
        dropType = 'none'
      }

      const iconPosition = dropNode.$el
        .querySelector('.el-tree-node__expand-icon')
        .getBoundingClientRect()
      const dropIndicator = this.$refs.dropIndicator
      if (dropType === 'before') {
        indicatorTop = iconPosition.top - treePosition.top
      } else if (dropType === 'after') {
        indicatorTop = iconPosition.bottom - treePosition.top
      }
      dropIndicator.style.top = indicatorTop + 'px'
      dropIndicator.style.left = iconPosition.right - treePosition.left + 'px'

      if (dropType === 'inner') {
        addClass(dropNode.$el, 'is-drop-inner')
      } else {
        removeClass(dropNode.$el, 'is-drop-inner')
      }

      dragState.showDropIndicator =
        dropType === 'before' || dropType === 'after'
      dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner
      dragState.dropType = dropType
      this.$emit('node-drag-over', draggingNode.node, dropNode.node, event)
    })

    this.$on('tree-node-drag-end', event => {
      const { draggingNode, dropType, dropNode } = dragState
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      if (draggingNode && dropNode) {
        const draggingNodeCopy = { data: draggingNode.node.data }
        if (dropType !== 'none') {
          draggingNode.node.remove()
        }
        if (dropType === 'before') {
          dropNode.node.parent.insertBefore(draggingNodeCopy, dropNode.node)
        } else if (dropType === 'after') {
          dropNode.node.parent.insertAfter(draggingNodeCopy, dropNode.node)
        } else if (dropType === 'inner') {
          dropNode.node.insertChild(draggingNodeCopy)
        }
        if (dropType !== 'none') {
          this.store.registerNode(draggingNodeCopy)
        }

        removeClass(dropNode.$el, 'is-drop-inner')

        this.$emit(
          'node-drag-end',
          draggingNode.node,
          dropNode.node,
          dropType,
          event
        )
        if (dropType !== 'none') {
          this.$emit(
            'node-drop',
            draggingNode.node,
            dropNode.node,
            dropType,
            event
          )
        }
      }
      if (draggingNode && !dropNode) {
        this.$emit('node-drag-end', draggingNode.node, null, dropType, event)
      }

      dragState.showDropIndicator = false
      dragState.draggingNode = null
      dragState.dropNode = null
      dragState.allowDrop = true
    })
  },

  mounted() {
    this.initTabIndex()
    this.$el.addEventListener('keydown', this.handleKeydown)
  },

  updated() {
    this.treeItems = this.$el.querySelectorAll('[role=treeitem]')
    this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]')
  },
}
</script>

<style scoped lang="scss"></style>
