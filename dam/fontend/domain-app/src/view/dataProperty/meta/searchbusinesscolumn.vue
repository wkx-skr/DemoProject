<template>
  <div>
    <datablau-button
      v-show="!select"
      type="primary"
      size="mini"
      plain
      style=""
      @click="showSourceSelect"
    >
      {{ selectBtnText }}
      <i class="el-icon-arrow-down el-icon--right"></i>
    </datablau-button>
    <datablau-input
      v-show="!select"
      size="mini"
      :iconfont-state="true"
      v-model="keyword"
      @keydown.native.enter="getData()"
      style="width: 240px; margin-left: 0.2em; display: inline-block"
      placeholder="请输入关键字进行搜索"
    ></datablau-input>
    <datablau-button
      v-show="!select"
      type="text"
      size="mini"
      @click="getData()"
      style="margin-right: 2em"
    >
      搜索
    </datablau-button>
    <el-checkbox
      v-show="searchView && !select"
      v-model="useTable"
      @change="getData()"
    >
      表
    </el-checkbox>
    <el-checkbox
      v-show="searchView && !select"
      v-model="useView"
      @change="getData()"
    >
      视图
    </el-checkbox>
    <datablau-breadcrumb
      class="top-bread"
      v-show="select"
      node-data="选择数据源"
      :couldClick="false"
      @back="goBack"
      separator=">"
    ></datablau-breadcrumb>
    <el-checkbox
      v-show="!select"
      v-model="useTable"
      @change="getData()"
      v-if="colSelectable"
    >
      表
    </el-checkbox>
    <el-checkbox
      v-show="!select"
      v-model="useColumn"
      @change="getData()"
      v-if="colSelectable"
    >
      字段
    </el-checkbox>
    <div class="tree-container" style="height: 370px" v-show="select">
      <source-select></source-select>
    </div>
    <datablau-table v-show="!select" :data="listData" border>
      <el-table-column prop="type" label="类型" v-show="searchView" width="60">
        <template slot-scope="scope">
          {{ scope.row.type === 'VIEW' ? '视图' : '表' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="physicalName"
        label="名称"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="logicalName"
        label="中文名"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="parentPhysicalName"
        label="数据源"
        show-overflow-tooltip
      ></el-table-column>
      <!--			<el-table-column prop="parentLogicalName" label="数据源逻辑名" show-overflow-tooltip>-->

      <!--			</el-table-column>-->
      <el-table-column label="操作" fixed="right" width="80">
        <template slot-scope="scope">
          <datablau-button
            @click.native.prevent="onRowClick(scope.$index, scope.row)"
            type="text"
            size="small"
          >
            {{ mode === 'add' ? '添加' : '选择' }}
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div class="dialog-bottom" v-show="!select">
      <datablau-pagination
        style="display: inline-block"
        layout="total, prev, pager, next, jumper"
        :total="totalItems"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="getData"
      ></datablau-pagination>
    </div>
    <!--<span v-show="!select">每页显示数目</span>-->
    <!--<el-input-number  v-show="!select" size="mini" v-model="pageSize"></el-input-number>-->
  </div>
</template>

<script>
import ComponentCaseName from '@constant/ComponentCaseName'
import sourceSelect from '../../../components/dataCatalog/sourceSelect'
export default {
  components: { sourceSelect },
  data() {
    return {
      componentCaseName: ComponentCaseName.Searchbusinesscolumn,
      keyword: '',
      listData: [],
      totalItems: 0,
      currentPage: 1,
      pageSize: 10,
      nowIndex: 0,
      useTable: true,
      useColumn: false,
      useView: this.searchView,
      select: false,
      checkedSources: undefined,
      checkedSourcesDetail: null,
    }
  },
  props: {
    searchView: {
      type: Boolean,
      default: false,
    },
    colSelectable: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'add',
    },
    keepParentName: {
      type: Boolean,
      default: false,
    },
    fromBusinessObject: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    const self = this
    if (self.colSelectable) {
      //				self.useColumn = true;
    } else {
      self.useColumn = false
    }
    this.getData()
    if (self.mode === 'add') {
      this.$bus.$on('addColumnToBusinessMenuSuccess', self.deleteRow)
    }
  },
  beforeDestroy() {
    if (self.mode === 'add') {
      this.$bus.$off('addColumnToBusinessMenuSuccess')
    }
  },
  computed: {
    selectBtnText() {
      var model = this.checkedSourcesDetail
      if (model) {
        return model.label
      } else {
        return '筛选数据源'
      }
    },
  },
  watch: {
    pageSize() {
      this.getData()
    },
    checkedSources(modelId) {
      this.select = false
      this.getData()
    },
  },
  methods: {
    goBack() {
      this.select = false
    },
    init() {
      this.currentPage = 1
      this.getData(1)
    },
    showSourceSelect() {
      this.select = true
    },
    onRowClick(index, row) {
      const self = this
      if (this.fromBusinessObject) {
        this.$emit('full-message-selected', {
          tableId: row.objectId,
          modelId: row.parentId,
        })
      }
      if (this.searchView) {
        this.$emit('selected', row.objectId)
        //          this.deleteRow(index);
      }
      if (row.type == 'COLUMN') {
        self.$bus.$emit('addColumnToBusinessMenu', {
          column: row.objectId,
          prevent: false,
        })
        if (self.mode == 'select') {
          self.$bus.$emit('selectTarget', { data: row, type: 'column' })
        }
        self.nowIndex = index
      } else if (row.type == 'TABLE') {
        self.$bus.$emit('addColumnToBusinessMenu', {
          column: row.objectId,
          prevent: false,
        })
        if (self.mode == 'select') {
          self.$bus.$emit('selectTarget', { data: row, type: 'table' })
        }
        self.nowIndex = index
      } else if (row.type == 'VIEW') {
        self.$bus.$emit('addColumnToBusinessMenu', {
          column: row.objectId,
          prevent: false,
        })
        if (self.mode == 'select') {
          self.$bus.$emit('selectTarget', { data: row, type: 'view' })
        }
        self.nowIndex = index
      }
    },
    deleteRow(index) {
      const self = this
      if (typeof self.nowIndex === 'number') {
        self.listData.splice(self.nowIndex, 1)
      } else if (!isNaN(index)) {
        self.listData.splice(index, 1)
      }
    },
    getData(currentPage) {
      const self = this
      this.currentPage = 1
      currentPage = currentPage || this.currentPage
      this.currentPage = currentPage
      const reg = /^\w*$/
      let keyword = this.keyword
      if (keyword && reg.test(this.keyword)) keyword = '*' + this.keyword + '*'
      const that = this

      var postObj = {
        pageSize: that.pageSize,
        currentPage: currentPage,
        keyword: keyword || null,
        types: [],
        modelId: this.checkedSources,
      }
      if (that.useTable) {
        postObj.types.push('TABLE')
      }
      if (that.useColumn) {
        postObj.types.push('COLUMN')
      }
      if (this.useView) {
        postObj.types.push('VIEW')
      }
      if (postObj.types.length > 0) {
        this.$http
          .post(this.$url + '/service/entities/search', postObj)
          .then(res => {
            res.data.content.forEach(item => {
              if (item.physicalName !== item.name && item.name) {
              } else {
                item.name = ''
              }
            })
            that.listData = res.data.content
            if (!self.keepParentName) {
              that.listData.forEach(item => {
                if (item.type != 'COLUMN') {
                  //									item.parentLogicalName = '-'
                  //									item.parentPhysicalName = '-'
                }
              })
            }
            that.totalItems = res.data.totalItems
          })
          .catch(err => {
            that.$notify.error({
              title: '错误',
              message: '读取数据列表失败',
            })
          })
      } else {
        that.listData = []
        this.totalItems = 0
      }
    },
  },
}
</script>

<style lang="scss">
.t218.el-table td,
.t218.el-table th {
  /*padding:2px 0;*/
}
</style>
<style lang="scss" scoped="scoped">
/deep/ .el-table {
  &:before {
    z-index: 5;
  }
}
/deep/ .el-pagination {
  .el-pager {
    li {
      height: 28px;
      line-height: 28px;
    }
  }
  .el-pagination__total {
    vertical-align: middle;
  }
  button {
  }
}

.tree-container {
  height: 300px;
  position: relative;
  top: 0;
}
</style>
<style lang="scss" scoped="scoped">
.bottom-line {
  border-top: 1px solid #e0e0e0;
  box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
  .datablau-pagination {
    margin-top: 9px;
  }
}
</style>
