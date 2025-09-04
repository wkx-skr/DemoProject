<template>
  <div>
    <div class="search-box">
      <input
        type="text"
        v-model="keyword"
        :placeholder="$t('meta.dataSource.modelCpmpare.placeholder')"
      />
    </div>
    <div class="tree-item table-header show-table-head-tooltip">
      <span>{{ $t('meta.dataSource.modelCpmpare.objType') }}</span>
      <el-tooltip effect="light" :content="data.rightObject" placement="top">
        <span class="right">{{ data.rightObject }}</span>
      </el-tooltip>
      <el-tooltip effect="light" :content="data.leftObject" placement="top">
        <span class="left">{{ data.leftObject }}</span>
      </el-tooltip>
      <span class="left">{{ data.leftObject }}</span>
    </div>
    <div style="height: 400px; overflow: auto">
      <el-tree
        ref="tree1"
        class="light-blue-tree"
        :data="businessData"
        v-loading="treeLoading"
        :props="businessDefaultProps"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
        :expand-on-click-node="true"
        :default-expand-all="false"
        :render-content="renderContent"
      ></el-tree>
    </div>
  </div>

  <!--<el-table :height="400" :data="tableData" class="fake-expand"
		@expand-change="handleExpandChange"
		>
		<el-table-column type="expand">
			<template>
				f
			</template>
		</el-table-column>
		<el-table-column label="对象类型">
			<template slot-scope="scope">
				{{scope.row.name}}
			</template>
		</el-table-column>
		<el-table-column :label="data.leftObject">
			<template slot-scope="scope">
				{{scope.row.leftObject}}{{scope.row.leftValue}}
			</template>
		</el-table-column>
		<el-table-column :label="data.rightObject">
			<template slot-scope="scope">
				{{scope.row.rightObject}}{{scope.row.rightValue}}
			</template>
		</el-table-column>
	</el-table>-->
</template>

<script>
export default {
  props: ['modelId'],
  data() {
    return {
      data: {},
      treeLoading: false,
      businessData: [this.data],
      businessDefaultProps: {
        label: 'name',
        id: 'name',
        children: 'differences',
      },
      itemData: {},
      tableData: [],
      keyword: '',
    }
  },
  watch: {
    keyword(value) {
      this.$refs.tree1.filter(value)
    },
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.$http
        .get(this.$url + '/service/models/' + this.modelId + '/compareResult')
        .then(res => {
          this.data = res.data
          this.tableData = [this.data]
        })
        .catch(e => {
          this.$message.error(e.response.errorMessage)
        })
    },
    handleNodeClick(data) {},
    handleExpandChange(row, expandedRows) {
      let isOpen = false
      for (let i = 0; i < expandedRows.length; i++) {
        if (row == expandedRows[i]) {
          isOpen = true
          break
        }
      }
      if (isOpen) {
      } else {
      }
    },
    renderContent(h, { node, data, store }) {
      if (data.name == 'Entity') {
        return (
          <div class="tree-item">
            <span class="tree-icon entity"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else if (data.name == 'Relationship') {
        return (
          <div class="tree-item">
            <span class="tree-icon relationship"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else if (data.name == 'Attribute') {
        return (
          <div class="tree-item">
            <span class="tree-icon attribute"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else if (data.name == 'KeyGroup') {
        return (
          <div class="tree-item">
            <span class="tree-icon keygroup"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else {
        return (
          <div class="tree-item">
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      }
    },
    filterNode(value, data) {
      if (!value) return true
      if (!data.name) return false
      return (
        false ||
        //					(data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1)
        (data.leftObject &&
          data.leftObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.leftValue &&
          data.leftValue.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.rightObject &&
          data.rightObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.rightValue &&
          data.rightValue.toLowerCase().indexOf(value.toLowerCase()) !== -1)
      )
    },
  },
}
</script>

<style lang="scss">
.tree-item {
  width: 100%;
  /*flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;*/
  span.left {
    text-align: center;
    float: right;
    width: 240px;
    margin-right: 30px;
  }
  span.right {
    text-align: center;
    float: right;
    width: 240px;
  }
}
</style>
<style lang="scss" scoped>
.table-header {
  background-color: #479eff;
  color: #fff;
  padding: 10px 20px 5px;

  span:first-child {
    margin-left: 2em;
  }
}
</style>
