<template>
  <div>
    <h1>Tree 树形控件</h1>
    <h3>示例</h3>
    <div
      class="component-box"
      style="padding: 20px; height: auto; width: 600px"
    >
      <div style="overflow: auto; height: 300px">
        <datablau-tree
          ref="tree"
          :key="treeKey"
          :data="treeData"
          :show-checkbox="option.showCheckbox"
          @node-click="handleNodeClick"
          @node-contextmenu="handleContextmenu"
          :props="defaultProps"
          :data-supervise="supervise"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          :data-locked-function="dataLockedFunction"
          :filter-node-method="filterNode"
          :draggable="draggable"
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          :custom-node-key="customNodeKey"
          :use-default-sort="useDefaultSort"
          :show-overflow-tooltip="showOverflowTooltip"
        ></datablau-tree>
      </div>
      <el-card header="控制面板">
        <el-form>
          <el-form-item label="数据操作">
            <datablau-button @click="reloadData">更新数据</datablau-button>
            <datablau-button @click="expandOrCollapseTopLevel">
              第一级展开/收起
            </datablau-button>
            <el-input
              v-model="filterText"
              placeholder="请输入关键字过滤"
              style="width: 140px; margin-left: 10px"
              size="small"
            ></el-input>
          </el-form-item>
          <el-form-item label="显示图标">
            <el-switch v-model="option.showLogo"></el-switch>
          </el-form-item>
          <el-form-item label="可多选">
            <el-switch v-model="option.showCheckbox"></el-switch>
          </el-form-item>
          <el-form-item label="可平级拖拽">
            <el-switch v-model="draggable"></el-switch>
          </el-form-item>
          <el-form-item label="管理模式">
            <el-switch v-model="supervise"></el-switch>
          </el-form-item>
          <el-form-item label="使用组件默认排序">
            <el-switch v-model="useDefaultSort"></el-switch>
          </el-form-item>
          <el-form-item label="超长展示tooltip">
            <el-switch v-model="showOverflowTooltip"></el-switch>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <div class="console-box">
      <el-card header="控制台" style="height: 490px">
        <div v-for="log in consoleLogs">{{ log }}</div>
      </el-card>
    </div>
    <h2>接口</h2>
    <p>
      本组件完全继承了el-tree的属性、方法、和事件。如需浏览文档请移步
      <datablau-button type="text" @click="openElementUi">
        https://element.eleme.cn/#/zh-CN/component/tree
      </datablau-button>
      完全继承主要是为了向前兼容以往页面,不推荐使用的属性、方法和事件将不会出现在下方接口列表
      <br />
      例如render-content已经不推荐使用，不推荐使用的原生接口，我会给出更简洁的替代方案，因此，开发新页面和重构旧页面时，你可以仅通过本文档实现你所需的功能，如有缺陷和不足，请及时联系作者改进。
      <br />
      接口列表中包含两部分，修改过默认值的el-tree原生接口和我们自己新增的接口。
    </p>
    <h3>标签名称</h3>
    datablau-tree
    <h3>属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'expand-on-click-node',
          description: '点击时是否展开',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'data-supervise',
          description: '管理模式，用于出现菜单',
          type: 'bool',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'data-options-function',
          description:
            '回调函数，入参为树节点的data对象，需返回该行对应的右键菜单列表。右键菜单属性见下表。该属性需与data-supervise配合使用',
          type: 'Function: array',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'data-icon-function',
          description: '回调函数，入参为树节点的data对象，需返回对应的icon类名',
          type: 'Function: string',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'data-locked-function',
          description:
            '回调函数，入参为树节点的data对象，返回值为是否不允许访问',
          type: 'Function: boolean',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'node-key',
          description: 'el-tree原生属性，多种属性和方法需要配合使用',
          type: 'string',
          candidate: '-',
          isRequired: '否',
          default: 'id',
        },
        {
          name: 'custom-node-key',
          description: '手动触发点击事件的节点key，需要配合node-key使用',
          type: 'string / number',
          candidate: '-',
          isRequired: '否',
          default: '',
        },
        {
          name: 'use-default-sort',
          description:
            '递归的使用组件默认的排序，忽略服务器返回的数据顺序，默认开启',
          type: 'boolean',
          candidate: '-',
          isRequired: '否',
          default: 'true',
        },
        {
          name: 'show-overflow-tooltip',
          description: '节点超长展示tooltip',
          type: 'boolean',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
      ]"
    >
      <el-table-column
        label="属性名称"
        prop="name"
        :width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="描述"
        :width="300"
        show-overflow-tooltip
        prop="description"
      ></el-table-column>
      <el-table-column
        label="属性类型"
        prop="type"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="可选值" prop="candidate"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
    </el-table>
    <h3>方法</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'expandTopLevel',
          description: '展开第一层目录,需要配合配置node-key属性',
        },
        {
          name: 'collapseTopLevel',
          description: '收起第一层目录，需要配合配置node-key属性',
        },
      ]"
    >
      <el-table-column
        label="方法名称"
        prop="name"
        :width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="描述"
        show-overflow-tooltip
        prop="description"
      ></el-table-column>
    </el-table>
    <h3>右键菜单属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          label: 'icon',
          value: '选项的图标类',
        },
        {
          label: 'label',
          value: '选项名称',
        },
        {
          label: 'callback',
          value: '回调函数，点击选项后执行的函数',
        },
        {
          label: 'line',
          value: '暂时只支持\'solid\',使用时无需填写以上三个属性',
        },
      ]"
    >
      <el-table-column label="属性" prop="label"></el-table-column>
      <el-table-column label="说明" prop="value"></el-table-column>
    </el-table>
    <!--<h3>方法</h3>
    <h3>事件</h3>
    <el-table
      style="width: 800px;"
      class="datablau-table"
      :data="[/*{
        name: 'click',
        parameter: '默认是$event',
        description: '普通点击事件'
      }*/]"
    >
      <el-table-column
        label="事件名称"
        prop="name"
      ></el-table-column>
      <el-table-column
        label="参数"
        prop="parameter"
      ></el-table-column>
      <el-table-column
        label="描述"
        prop="description"
      ></el-table-column>
    </el-table>-->
  </div>
</template>

<script>
import moment from 'moment'
const treeData = [
  {
    id: '0',
    name: '大数据平台部',
    type: 'folder',
    children: [
      {
        id: '0-1',
        name: '大数据管理平台',
        type: 'folder',
        children: [
          {
            id: '0-1-1',
            name: 'MAAS系统(MAAS)',
            type: 'category',
            children: [
              {
                name: '某某数据源',
                type: 'source',
                children: [
                  {
                    name: 'default',
                    type: 'schema',
                  },
                ],
              },
            ],
          },
          {
            id: '0-1-2',
            name: '官网系统(OWS)',
            type: 'category',
          },
        ],
      },
      {
        id: '0-2',
        name: '信用卡中心',
        type: 'folder',
      },
      {
        id: '0-3',
        name: '这条是为了测试名称非常非常长的时候的情况，看看后面能不能出省略号，并且不遮挡右侧按钮',
        type: 'folder',
      },
    ],
  },
  {
    id: '1',
    name: '另一个平台部',
    type: 'folder',
    children: [
      {
        id: '0-1',
        name: '另一个平台部的管理平台',
        type: 'folder',
      },
    ],
  },
  {
    id: '2',
    name: '无权访问的部门',
    type: 'folder',
    locked: true,
    children: [
      {
        id: '2-1',
        name: '虽然我爸爸不接受访问，但是可以访问我',
        type: 'folder',
      },
    ],
  },
]
export default {
  data() {
    return {
      supervise: true,
      draggable: true,
      treeData: _.cloneDeep(treeData),
      option: {
        showLogo: true,
        showCheckbox: false,
      },
      defaultProps: {
        label: 'name',
      },
      consoleLogs: [],
      filterText: '',
      treeKey: 0,
      topLevelExpanded: false,
      customNodeKey: '0',
      useDefaultSort: true,
      showOverflowTooltip: false,
    }
  },
  methods: {
    console(text) {
      this.consoleLogs.push(
        moment(new Date()).format('HH:mm:ss.SSS') + ' ' + text
      )
      if (this.consoleLogs.length > 22) {
        this.consoleLogs.shift()
      }
    },
    openElementUi() {
      window.open('https://element.eleme.cn/2.11/#/zh-CN/component/tree')
    },
    reloadData() {
      this.treeData = null
      this.console('开始更新数据...')
      setTimeout(() => {
        this.treeData = treeData
        this.console('数据更新完毕')
      }, 3000)
    },
    handleNodeClick(data, node) {
      this.console(`点击了${node.label}`)
    },
    handleContextmenu($event, data, node) {
      this.console(`右键点击了${node.label}`)
    },
    dataIconFunction(data, node) {
      if (data.type === 'folder') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.type === 'source') {
        return 'iconfont icon-shujuyuan'
      } else if (data.type === 'schema') {
        return 'iconfont icon-schema'
      } else if (data.type === 'category') {
        return 'iconfont icon-xitong'
      } else {
        console.error(data)
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      options.push({
        icon: 'iconfont icon-tianjia',
        label: '添加子目录',
        callback: () => {
          this.console(`为${label}添加子目录`)
        },
        args: 'folder',
      })

      options.push({
        icon: 'iconfont icon-bianji',
        label: `编辑${label}`,
        callback: () => {
          this.console(`编辑${label}`)
        },
        args: 'folder',
      })
      // todo 分隔线暂时只支持solid实线
      options.push({
        line: 'solid',
      })
      options.push({
        icon: 'iconfont icon-delete',
        label: `删除${label}`,
        callback: () => {
          this.console(`删除${label}`)
        },
        args: 'folder',
      })
      return options
    },
    dataLockedFunction(data) {
      return data.locked
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    allowDrag() {
      return true
    },
    allowDrop(draggingNode, dropNode, type) {
      return (
        type !== 'inner' && draggingNode.level === dropNode.level
      ) /* || (type === 'inner' && draggingNode.level - 1 === dropNode.level) */
    },
    expandOrCollapseTopLevel() {
      if (this.topLevelExpanded) {
        this.$refs.tree.collapseTopLevel()
      } else {
        this.$refs.tree.expandTopLevel()
      }
      this.topLevelExpanded = !this.topLevelExpanded
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    'option.showLogo': {
      handler: function () {
        this.treeKey++
      },
    },
    supervise: {
      handler: function () {
        this.treeKey++
      },
    },
    useDefaultSort: {
      handler: function () {
        this.treeData = _.cloneDeep(treeData)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../base.scss';
div {
}
p {
  margin-bottom: 20px;
}
</style>
