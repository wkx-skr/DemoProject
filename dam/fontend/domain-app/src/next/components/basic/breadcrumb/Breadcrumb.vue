<template>
  <div class="db-breadcrumb" :test-name="testName" :title="resultString">
    <span
      class="back-btn"
      v-if="showBack"
      @click="backClick"
      :class="{ 'highlight-back': highlightBack }"
    >
      <i class="iconfont icon-return"></i>
      <span>{{ $t('common.button.return') }}</span>
    </span>
    <span class="back-separator" v-if="showBack">|</span>
    <a-breadcrumb ref="breadcrumb" @click="handleClick" :separator="separator">
      <!--v-on="$listeners" v-bind="defaultBind"-->
      <!--<a-breadcrumb-item v-if="showBack">-->
      <!--  <span class="back-btn" @click="backClick">返回</span>-->
      <!--</a-breadcrumb-item>-->
      <!--<a-breadcrumb-separator>|</a-breadcrumb-separator>-->
      <a-breadcrumb-item
        v-for="item in resultArray"
        :key="item.id"
        class="breadcrumb-item"
        :class="{
          'item-could-skip': couldClick && item.couldClick !== false,
          'is-current': item.id === currentNodeId,
        }"
      >
        <!--<span v-if="item.icon" class="item.icon"></span>-->
        <span @click="handleNodeClick(item)">{{ item.value }}</span>

        <a-menu
          v-if="couldClick && !!item.hasBrother"
          slot="overlay"
          class="db-breadcrumb-menu item-menu"
        >
          <a-menu-item
            v-for="menu in getBrother(item)"
            :key="menu.id"
            class="menu-item"
          >
            <span @click="handleMenuClick(menu)">{{ menu.value }}</span>
          </a-menu-item>
        </a-menu>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script>
// TODO
// 传入的数据重复问题
import Vue from 'vue'
// 按需引入 ant-design-vue
import { Breadcrumb, Menu } from 'ant-design-vue'

Vue.use(Breadcrumb)
Vue.use(Menu)
// interface bNode {
//   type: string 'node' | 'separator',
//   icon: string, // 分隔符 和 节点 的 icon, 暂时没有这个功能 TODO
//   value: string, // 节点的文字, 会被作为 nodeNameMap 的 key
//   children: Array<bNode>, // 下级数组, 每一项为一个 节点
//   id: Number, // 自动生成的 自增的 id
//     hasBrother: boolean, // 是否有同级元素(是否可以下拉)
//   level: number, // 层级, 判断是否最后一级
// }
// 属性值为Boolean时, 若仅写属性名, 如 element 的border 属性, 将会将值设置为 true, 否则, 值将可能由 空字符串 转换为 false
// 仅检测以下属性
const BOOLEAN_KEYS = []
export default {
  name: 'DatablauBreadcrumb',
  data() {
    return {
      defaultProps: {},
      autoId: 1,
      nodeMap: {},
      // key 为 name, 可能重复
      nodeNameMap: {},
      // 处理后的 tree, 遍历后生成面包屑
      nodeTree: [],
      resultArray: [],
      // 当没有传入 当前节点位置时, 自动寻找最后的节点
      defaultCurrent: '',
      // 当前层级, 用于计算默认当前节点, 同时超出当前层级的 tree 会隐藏
      currentLevel: 1,
      choseNode: '',
      currentNodeId: '',
      showTooltip: false,
      // 将用户自定义 id 转成 autoId
      idMap: {},
    }
  },
  props: {
    // 没有下拉框, 传入数组, 相当于 每一个节点的 child 就是数组的下一项
    // 有下拉框, 传入 tree, 下一层级放到 children 属性中
    // 数据是 数组, 节点可以是 字符串 或者对象, 对象中必须有 value 属性, 作为文本显示到页面
    // 数据是 tree, 节点必须是对象, 并且有 id 作为唯一识别标志
    nodeData: {
      type: [String, Array, Object],
      required: true,
    },
    // 分隔符, 默认为 '/'
    separator: {
      type: String,
      default: '/',
    },
    // 是否可以跳转, 如果不能跳转, 鼠标 图标不变
    // 对除结尾外的所有节点生效
    couldClick: {
      type: Boolean,
      default: true,
    },
    // 当前节点, 即目前所在位置, 默认为最后一个节点
    currentNode: {
      type: [String, Number],
      default: '',
    },
    showBack: {
      type: Boolean,
      default: true,
    },
    highlightBack: {
      type: Boolean,
      default: false,
    },
    testName: String,
  },
  computed: {
    // 最终的路径
    resultString() {
      if (this.showTooltip) {
        return this.resultArray.map(item => item.value).join(this.separator)
      } else {
        return ''
      }
    },
  },
  mounted() {
    this.dataInit()
    this.testShowTitle()
    $(window).on('resize', this.handleResize)
  },
  beforeDestroy() {
    $(window).off('resize', this.handleResize)
  },
  methods: {
    dataInit() {
      this.nodeTree = []
      this.nodeMap = {}
      this.resultArray = []
      this.nodeNameMap = {}
      if (!this.nodeData) return
      let nodeData = this.nodeData
      // 单行数据, 会忽略 node 的 children 属性
      if (typeof nodeData === 'string') {
        nodeData = [nodeData]
      }
      if (Array.isArray(nodeData)) {
        nodeData.forEach(node => {
          let obj = {
            type: 'node',
            value: node.name ? node.name : node,
            id: this.autoId++,
            originData: node,
            couldClick: node.couldClick !== false,
          }
          this.defaultCurrent = obj.id
          this.resultArray.push(obj)
        })

        this.getCurrentNodeId()
      } else {
        this.idMap = {}
        this.nodeTree = this.dealNode({ node: nodeData, level: 1 })
        // console.log(this.nodeTree, 'this.nodeTree')
        this.getTreePath()
      }
    },
    getTreePath() {
      let id = this.getCurrentNodeId()
      let node = this.nodeMap[id]
      let resultArray = []
      while (node) {
        resultArray.unshift(node)
        if (node.parentId && this.nodeMap[node.parentId]) {
          node = this.nodeMap[node.parentId]
        } else {
          node = null
        }
      }
      if (!resultArray[0].name) {
        resultArray.shift()
      }
      this.resultArray = resultArray
    },
    dealNode({ node, parentId, level = 1, hasBrother = false }) {
      this.currentLevel = this.currentLevel > level ? this.currentLevel : level
      let obj = {
        type: 'node',
        value: typeof node === 'string' ? node : node.name,
        children: [],
        id: this.autoId++,
        parentId: parentId || null,
        level: level,
        hasBrother: hasBrother,
        originId: node.id,
        originData: node,
        couldClick: node.couldClick,
      }
      if (node.id) {
        this.idMap[node.id] = obj.id
      }
      this.nodeMap[obj.id] = obj
      if (this.currentLevel <= level) {
        this.defaultCurrent = obj.id
      }
      if (
        node.children &&
        Array.isArray(node.children) &&
        node.children.length > 0
      ) {
        let hasBrother = node.children.length > 1
        node.children.forEach(item => {
          let child = this.dealNode({
            node: item,
            parentId: obj.id,
            hasBrother: hasBrother,
            level: level + 1,
          })
          obj.children.push(child)
        })
      }
      this.nodeNameMap[node.value] = obj

      return obj
    },
    getBrother(node) {
      let parent = this.nodeMap[node.parentId] || {}
      return parent.children || []
    },
    getCurrentNodeId() {
      let currentNode = this.idMap[this.currentNode] || ''
      this.currentNodeId = this.choseNode || currentNode || this.defaultCurrent
      return this.currentNodeId
    },
    /**
     * 根据 id 设置 当前节点
     * @param nodeId
     */
    setCurrentNodeKey(nodeId = '') {
      this.choseNode = this.idMap[nodeId] || ''
      this.getTreePath()
    },
    // 检测是否需要显示 title
    testShowTitle() {
      this.$nextTick(() => {
        let dom = $(this.$refs.breadcrumb.$el)[0]
        if (!dom) {
          this.showTooltip = false
          return
        }
        let clientWidth = dom.clientWidth
        let totalSpanWidth = 0
        let spanOverflow = false

        $(dom)
          .children()
          .each((index, el) => {
            let spanWidth = $(el).outerWidth(true) // 获取 span 的实际宽度（包括内边距和边框）
            totalSpanWidth += spanWidth
            if (totalSpanWidth > clientWidth) {
              spanOverflow = true
              return false // 如果有超出的 span，则跳出 each 循环
            }
          })

        this.showTooltip = spanOverflow
      })
    },
    handleResize() {
      this.testShowTitle()
    },
    handleNodeClick(node) {
      if (!this.couldClick) return
      if (node.couldClick === false) return
      if (node.id !== this.currentNodeId) {
        console.log(node.originData)
        this.$emit('nodeClick', node.originData)
      }
    },
    handleClick(e) {
      // ant 事件, 不处理
      // this.$emit('nodeClick', node.originData)
      // console.log(e, 'handleClick')
    },
    handleMenuClick(node) {
      this.$emit('nodeClick', node.originData)
    },
    backClick(e) {
      this.$emit('back', e)
    },
  },
  watch: {
    nodeData: {
      deep: true,
      handler() {
        this.dataInit()
        this.testShowTitle()
      },
    },
    currentNode() {
      this.choseNode = ''
      this.testShowTitle()
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../color';

$base-font-size: 12px;
$item-hover-color: $primary-color;
$gery-item-text: $text-message;

.db-breadcrumb {
  font-size: 0;

  i,
  span {
    font-size: $base-font-size;
    line-height: 24px;
  }

  /deep/ i,
  /deep/ span {
    line-height: 24px;
    //background-color: yellow;
  }

  .back-btn {
    color: $grey-2;
    cursor: pointer;

    i {
      display: inline-block;
      margin-right: 6px;
      font-size: 14px;
    }

    &:hover {
      color: $item-hover-color;

      i,
      span {
        color: $item-hover-color;
      }
    }

    //background-color: yellow;

    .icon-i-return {
      display: inline-block;
      margin-right: 6px;
      //padding: 0;
    }
  }

  .back-separator {
    display: inline-block;
    margin: 0 10px;
    color: $gery-item-text;
  }

  .highlight-back {
    i,
    span {
      color: $item-hover-color;
    }
  }

  .breadcrumb-item {
    /deep/ .ant-breadcrumb-link {
      color: $gery-item-text;
    }

    /deep/ .ant-breadcrumb-separator {
      margin: 0 6px;
      color: $gery-item-text;
    }

    /deep/ .ant-breadcrumb-overlay-link.ant-dropdown-trigger {
      &:hover {
        color: $item-hover-color;
      }
    }

    &.item-could-skip {
      /deep/ .ant-breadcrumb-link {
        cursor: pointer;

        &:hover {
          color: $item-hover-color;
        }
      }
    }

    &.is-current {
      /deep/ .ant-breadcrumb-link {
        cursor: default;

        &,
        &:hover {
          color: $text-default;
        }
      }
    }
  }

  /deep/ .ant-breadcrumb {
    display: inline-block;
    max-width: 1020px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
  }
}
</style>

<style lang="scss">
@import '../color';

$base-font-size: 12px;
$item-hover-color: $primary-color;
$gery-item-text: $text-message;

.db-breadcrumb-menu.item-menu {
  //border: 1px solid red;
  padding: 9px 0;

  li.menu-item {
    padding: 6px 12px;
    color: $gery-item-text;
    font-size: $base-font-size;

    &:hover {
      color: $item-hover-color;
      background-color: $light-color-1;
    }
  }
}
</style>
