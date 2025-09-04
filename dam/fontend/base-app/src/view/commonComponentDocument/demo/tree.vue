<template>
  <div>
    <h1>3 树</h1>
    <span>code@/view/commonComponentDocument/demo/tree.vue</span>
    <h2>3.1 基础用法</h2>
    <el-card>
      <div class="tree-container">
        <el-tree
          :data="treeData"
          class="grey-tree"
          :expand-on-click-node="false"
          :props="{ label: 'name' }"
        ></el-tree>
      </div>
    </el-card>
    <h2>3.2 带复选框</h2>
    <el-card>
      <div class="tree-container">
        <el-tree
          :data="treeData2"
          class="grey-tree"
          default-expand-all
          :expand-on-click-node="false"
          show-checkbox
          :props="{ label: 'name' }"
        ></el-tree>
      </div>
    </el-card>
    <h2>3.3 拖拽功能</h2>
    <el-card>
      <div class="tree-container">
        <el-tree
          :data="treeData3"
          default-expand-all
          :expand-on-click-node="false"
          class="grey-tree"
          draggable
          :props="{ label: 'name' }"
        ></el-tree>
      </div>
    </el-card>
    <h2>3.4 插入和删除节点</h2>
    <el-card>
      <div class="tree-container">
        <el-tree
          :data="treeData4"
          ref="tree4"
          default-expand-all
          :expand-on-click-node="false"
          :render-content="renderContent"
          class="grey-tree"
          :props="{ label: 'name' }"
        ></el-tree>
      </div>
    </el-card>
    <h2>3.5 默认高亮、设置高亮、模拟点击事件</h2>
    <el-card>
      <div class="tree-container" style="float: left">
        <el-tree
          :data="treeData5"
          class="grey-tree"
          ref="tree5"
          node-key="id"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          default-expand-all
          highlight-current
          :props="{ label: 'name' }"
        ></el-tree>
      </div>
      <div style="float: left">
        <el-form size="mini" label-position="right" label-width="2em">
          <el-form-item>
            默认为根节点高亮，你可以试试让下面的文本框中的部门高亮及模拟点击
          </el-form-item>
          <el-form-item>
            <el-select v-model="targetNodeName" size="mini">
              <el-option
                v-for="o in selectableDepartments"
                :key="o.id"
                :label="o.name"
                :value="o.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" @click="highlight">
              设置高亮
            </el-button>
            <el-button type="primary" size="mini" @click="highlightAndClick">
              设置高亮并模拟点击
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
class DepartmentBuilder {
  constructor() {
    this.idx = 1000
  }

  getNext() {
    this.idx++
    return {
      id: this.idx,
      name: '部门-' + this.idx,
      label: '部门-' + this.idx,
    }
  }
}
export default {
  data() {
    const treeData = [
      {
        id: 0,
        name: '北京数语科技有限公司',
        children: [
          {
            id: 1,
            name: '产品中心',
            children: [
              {
                id: 101,
                name: '产品管理部',
              },
              {
                id: 102,
                name: '产品测试部',
              },
              {
                id: 103,
                name: '产品交付部',
              },
              {
                id: 104,
                name: '产品开发部',
              },
            ],
          },
          {
            id: 2,
            name: '人力行政中心',
          },
          {
            id: 3,
            name: '营销中心',
          },
          {
            id: 4,
            name: '财务中心',
          },
          {
            id: 5,
            name: '售前解决方案中心',
          },
          {
            id: 6,
            name: '客户成功中心',
          },
        ],
      },
    ]
    return {
      treeData: _.cloneDeep(treeData),
      treeData2: _.cloneDeep(treeData),
      treeData3: _.cloneDeep(treeData),
      treeData4: _.cloneDeep(treeData),
      treeData5: _.cloneDeep(treeData),
      departmentBuilder: null,
      targetNodeName: 101,
      selectableDepartments: [
        {
          id: 101,
          name: '产品管理部',
        },
        {
          id: 102,
          name: '产品测试部',
        },
        {
          id: 103,
          name: '产品交付部',
        },
        {
          id: 104,
          name: '产品开发部',
        },
      ],
    }
  },
  mounted() {
    this.departmentBuilder = new DepartmentBuilder()
    this.$refs.tree5.setCurrentKey(0)
  },
  methods: {
    renderContent(h, { node, data, store }) {
      return (
        <span class="tree-item-outer">
          <span>
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span class="oneline-eclipse tree-label" style="margin-left:0.5em;">
              {node.label}
            </span>
          </span>
          <span
            class="el-icon-more more"
            style="line-height:34px;"
            on-click={evt => this.callContext(node, data, evt)}
          ></span>
        </span>
      )
    },
    callContext(node, data, evt) {
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      options.push({
        icon: 'el-icon-plus',
        label: '添加子目录',
        callback: () => {
          this.$refs.tree4.append(this.departmentBuilder.getNext(), node)
        },
      })
      options.push({
        icon: 'el-icon-delete',
        label: '删除',
        callback: () => {
          this.$refs.tree4.remove(node)
        },
      })
      if (options.length > 0) {
        let yOfResult = y
        if (window.innerHeight - y < 250) {
          yOfResult = window.innerHeight - 250
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
        })
      }
    },
    highlight() {
      console.log(this.targetNodeName)
      this.$refs.tree5.setCurrentKey(this.targetNodeName)
    },
    highlightAndClick() {
      this.$refs.tree5.setCurrentKey(this.targetNodeName)
      this.$nextTick(() => {
        const data = this.$refs.tree5.getCurrentNode()
        this.handleNodeClick(data)
      })
    },
    handleNodeClick(data) {
      console.log(data)
      this.$message.success(`点击了${data.name}`)
    },
  },
}
</script>

<style scoped lang="scss">
@import './base.scss';
.tree-container {
  height: 300px;
  width: 300px;
  border: 1px solid #f1f5f7;
  overflow: auto;
}
</style>
