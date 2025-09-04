<template>
  <div>
    <el-dialog
      title="选择数据标准"
      :visible.sync="visible"
      width="500px"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :key="key"
    >
      <div class="tree-search-box">
        <el-input
          size="small"
          suffix-icon="el-icon-search"
          placeholder="输入关键字过滤"
          v-model="keyword"
          clearable
        ></el-input>
      </div>
      <div class="tree-box" style="margin-top:5px;height:350px;overflow:auto;position: relative">
        <el-tree class="grey-tree"
                 :data="treeData"
                 ref="mainTree"
                 :props="defaultProps"
                 :render-content="renderContent"
                 node-key="id"
                 :default-expanded-keys="expandedKeys"
                 :default-expand-all="defaultExpandAll"
                 :expand-on-click-node="true"
                 @node-click="handleItemClicked"
                 v-loading="treeLoading"
                 :highlight-current="true"
                 :filter-node-method="filterNode"
        ></el-tree>
        <div class="inherit-type">
          <h2>应用数据标准到字段时将继承所选属性</h2>
          <el-checkbox-group v-model="selectedType">
            <el-checkbox  :disabled="item.disabled" v-for="item in inheritType" :label="item.value" :key="item.value">{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
<!--      <el-button-->
<!--        @click="visible=false"-->
<!--        size="small">关闭</el-button>-->
      <el-button
        @click="handleSelect"
        size="mini" :disabled="!enableSelect" type="primary">选定</el-button>
    </el-dialog>
  </div>
</template>
<script>
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import _ from 'lodash'
export default {
  data () {
    return {
      visible: false,
      keyword: '',
      treeLoading: false,
      keywordSetTimeout: null,
      treeBox: undefined,
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'id'
      },
      expandedKeys: [],
      state: 'A',
      defaultExpandAll: false,
      treeData: [],
      enableSelect: false,
      nowDomain: null,
      key: 0,
      inheritType: [{
        label: '数据类型',
        value: 'dataType'
      }, {
        label: '英文名称',
        value: 'enName'
      }, {
        label: '中文名',
        value: 'chName'
      }, {
        label: '业务定义',
        value: 'description'
      }, {
        label: '英文缩写（到字段名）',
        value: 'abbrivation'
      }, {
        label: '非空继承',
        value: 'notNull'
      }],
      selectedType: ['dataType']
    }
  },
  props: {
    limitedDsApply: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    if (this.limitedDsApply) {
      this.inheritType.find(item => item.label === '数据类型').disabled = true
      this.inheritType.find(item => item.label === '英文名称').disabled = true
      this.inheritType.find(item => item.label === '英文缩写（到字段名）').disabled = true
      this.inheritType.find(item => item.label === '中文名').disabled = true
      this.selectedType = ['dataType', 'enName', 'abbrivation', 'chName']
    } else {
      this.selectedType = ['dataType']
    }
    this.innerLoadStandard()
    this.$bus.$on('callDomainSelector', () => {
      this.visible = true
    })
  },
  beforeDestroy () {
    clearTimeout(this.timeout)
    this.$bus.$off('callDomainSelector')
  },
  methods: {
    openDialog () {
      this.key++
      setTimeout(() => {
        this.keyword = ''
        this.visible = true
      }, 400)
    },
    closeDialog () {
      this.visible = false
    },
    filterNode (value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (string.matchKeyword(current.data, value, 'name', 'domainCode')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    innerLoadStandard () {
    // if (treeData.nodes) {
    //   this.modifyArrKey(treeData)
    //   businessData = treeData.nodes
    // } else {
    //   businessData = []
    // }
      this.treeData = this.$globalData.domainTreeData
    },
    modifyArrKey (obj) {
      const self = this
      if (obj.nodes != null) {
        sort.sortConsiderChineseNumber(obj.nodes)
        obj.nodes.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.domains != null && obj.domains.length > 0) {
        sort.sortConsiderChineseNumber(obj.domains)
        obj.domains.forEach(item => {
          if (obj.nodes == null) {
            obj.nodes = []
          }
          obj.nodes.push(item)
        })
      }
    },
    handleItemClicked (data, node) {
      if (data.id) {
        this.nowDomainId = data.id
        this.nowDomain = data
        this.enableSelect = true
      } else {
        this.nowDomainId = null
        this.enableSelect = false
      }
    },
    renderContent (h, { node, data, store }) {
      if (data.id) {
        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.code}>
            <span class="tree-icon domain"></span>
            <span>{node.label}</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{data.domainCode}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="tree-icon folder"></span>
            <span>{node.label}</span>
          </span>
        )
      }
    },
    handleSelect () {
      this.nowDomain.inheritType = _.cloneDeep(this.selectedType)
      this.selectedType = ['dataType']
      this.$bus.$emit('domainSelected', this.nowDomain)
      this.$emit('selected', this.nowDomain)
      this.visible = false
      this.enableSelect = false
    }
  },
  watch: {
    keyword (value) {
      this.$refs.mainTree.filter(value)
    }
  }
}
</script>
<style scoped lang="scss">
  .grey-tree {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 120px;
    overflow: auto;
  }
  .inherit-type {
    position: absolute;
    bottom: 1em;
    height: 100px;
    left: 0;
    right: 0;
  }
  .inherit-type {
    background: #f0f0f0;
    border-radius: 2px;
    padding: 1em;
    h2 {
      font-size: 13px;
    }
    /deep/ .el-checkbox-group {
      padding: 1em 0;
      font-size: 12px;
      .el-checkbox {
        margin-bottom: 5px;
      }
    }
  }
</style>
