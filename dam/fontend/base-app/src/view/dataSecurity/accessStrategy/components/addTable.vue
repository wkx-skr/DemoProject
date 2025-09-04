<template>
  <datablau-dialog
    custom-class="assets-dialog-page"
    :title="title"
    :visible="visible"
    :before-close="closeDialog"
    width="1160px"
    :height="height"
    :table="true"
    ref="tableDialog"
  >
    <div class="add-table-page">
      <div class="tree-box">
        <datablau-input
          placeholder="搜索关键字"
          v-model="treeKey"
          :iconfont-state="true"
        ></datablau-input>
        <datablau-tree
          class="grey-tree data-asset-tree"
          ref="tree"
          :default-expand-all="false"
          auto-expand-parent
          v-loading="treeLoading"
          @node-click="nodeClick"
          node-key="id"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          :props="defaultProps"
          :default-expanded-keys="expandedKeys"
          :data-icon-function="dataIconFunction"
          :data="treeData"
          :showOverflowTooltip="true"
        ></datablau-tree>
      </div>
      <div class="assets-box">
        <div style="width: 100%; height: 40px">
          <template>
            <datablau-input
              style="width: 200px; display: inline-block"
              clearable
              :iconfont-state="true"
              placeholder="搜索关键字"
              v-model="assetsKeyword"
            ></datablau-input>
            <datablau-select
              v-if="assetType === 'TABLE'"
              style="width: 200px; display: inline-block; margin-left: 20px"
              v-model="modelId"
              v-selectLazyLoad="modelloading"
              filterable
              clearable
              placeholder="数据源名称"
            >
              <el-option
                v-for="item in allFromreList"
                :key="item.modelId"
                :label="item.definition"
                :value="item.modelId"
              ></el-option>
            </datablau-select>
            <datablau-button
              type="normal"
              style="margin-left: 10px"
              @click="qureyAssets"
            >
              查询
            </datablau-button>
            <template v-if="assetType === 'TABLE'">
              <el-checkbox
                @change="changeTable"
                v-model="isTable"
                style="margin-left: 16px"
              >
                表
              </el-checkbox>
              <el-checkbox @change="changeView" v-model="isView">
                视图
              </el-checkbox>
            </template>
          </template>
        </div>
        <div class="table-box">
          <datablau-table
            @selection-change="selectAsset"
            :data="assetsData"
            v-loading="tableLoading"
            :loading="tableLoading"
            ref="assetsTable"
            class="datablau-table table"
            height="100%"
            :single-select="true"
            show-overflow-tooltip
            :show-column-selection="false"
            :header-cell-style="{
              color: '#494850',
              'font-size': '12px',
              'font-weight': 'bold',
            }"
            :row-key="getAssetRowKeys"
          >
            <el-table-column width="28">
              <template slot-scope="scope">
                <datablau-icon
                  :data-type="scope.row.type"
                  :size="20"
                  style="position: relative; top: 3px"
                ></datablau-icon>
              </template>
            </el-table-column>
            <template v-for="c in columns">
              <el-table-column
                :key="c.prop"
                :prop="c.prop"
                :label="c.label"
                :min-width="c.minWidth"
                show-overflow-tooltip
              ></el-table-column>
            </template>
          </datablau-table>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      style="width: 100%; display: flex; justify-content: space-between"
    >
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="assetPagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="assetPagination.pageSize"
        layout="total, sizes, prev, pager, next"
        :pager-count="5"
        class="page"
        :total="assetPagination.total"
      ></datablau-pagination>
      <div>
        <datablau-button @click="closeDialog">取消</datablau-button>
        <datablau-button
          type="primary"
          :disabled="!selectedAssets.id"
          @click="submitAssets"
        >
          添加
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>
</template>

<script>
import api from '@/view/dataAsset/utils/api'
import HTTP from '@/view/dataSecurity/util/api'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    clickTable: {
      type: Function,
    },
    assetType: {
      type: String,
      default: '',
    },
    assetId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      title: '选择表/视图',
      isView: true,
      isTable: true,
      height: 530,
      treeKey: '',
      treeLoading: false,
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      expandedKeys: [],
      treeData: [],
      assetPagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
      },
      assetsData: [],
      assetsKeyword: '',
      modelId: '',
      schema: '',
      fromreList: [],
      allFromreList: [],
      columns: [],
      tableLoading: false,
      modelPage: 1,
      modelLoading: false,
      modelTotal: 0,
      selectedAssets: {},
    }
  },
  watch: {
    treeKey(val) {
      this.$refs.tree.filter(val)
    },
  },
  mounted() {
    if (this.assetType === 'TABLE') {
      this.title = '选择表/视图'
      this.columns = [
        {
          prop: 'tableName',
          label: '名称',
          minWidth: '150px',
        },
        {
          prop: 'system',
          label: '业务系统',
          minWidth: '120px',
        },
        {
          prop: 'schema',
          label: 'Schema',
          minWidth: '120px',
        },
        {
          prop: 'department',
          label: '技术部门',
          minWidth: '120px',
        },
        {
          prop: 'securityName',
          label: '安全等级',
          minWidth: '120px',
        },
        {
          prop: 'time',
          label: '发布时间',
          minWidth: '150px',
        },
      ]
    } else {
      this.title = '选择字段'
      this.columns = [
        {
          prop: 'tableName',
          label: '名称',
          minWidth: '120px',
        },
        {
          prop: 'system',
          label: '业务系统',
          minWidth: '100px',
        },
        {
          prop: 'schema',
          label: 'Schema',
          minWidth: '100px',
        },
        {
          prop: 'parentPhysicalName',
          label: '所在表/视图',
          minWidth: '120px',
        },
        {
          prop: 'department',
          label: '技术部门',
          minWidth: '100px',
        },
        {
          prop: 'securityName',
          label: '安全等级',
          minWidth: '120px',
        },
        {
          prop: 'time',
          label: '发布时间',
          minWidth: '150px',
        },
      ]
    }
    this.getTree()
    this.getList()
    this.getModel()
  },
  methods: {
    changeTable(bool) {
      this.isTable = bool
      this.assetPagination.currentPage = 1
      this.getList()
    },
    changeView(bool) {
      this.isView = bool
      this.assetPagination.currentPage = 1
      this.getList()
    },
    closeDialog() {
      this.clickTable('close')
    },
    nodeClick(data) {
      let name = ''
      this.assetPagination.currentPage = 1
      if (data.type === 'MODEL') {
        this.modelId = data.id
        this.schema = ''
        name = data.name
        this.getList()
      } else if (data.type === 'SCHEMA') {
        this.modelId = parseInt(data.id.split('_%')[0])
        this.schema = data.name
        name = data.id.split('_%_')[1]
        this.getList()
      } else if (data.type === 'MODEL_CATEGORY') {
        this.modelId = ''
        this.schema = ''
      } else if (data.type === 'catolog') {
        this.modelId = ''
        this.schema = ''
      } else if (data.type === 'IT_DEPART') {
        this.modelId = ''
        this.schema = ''
      }
      if (this.modelId) {
        const flag = this.fromreList.some(
          item => parseFloat(item.modelId) === parseFloat(this.modelId)
        )
        if (flag) {
        } else {
          this.allFromreList = _.clone(this.fromreList)
          const params = {
            modelId: this.modelId,
            definition: name,
          }
          this.allFromreList.push(params)
        }
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    dataIconFunction(data, node) {
      if (data.type === 'IT_DEPART' || data.type === 'catlog') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.type === 'MODEL') {
        return 'iconfont icon-shujuyuan'
      } else if (data.type === 'SCHEMA') {
        return 'iconfont icon-schema'
      } else if (data.type === 'MODEL_CATEGORY') {
        return 'iconfont icon-xitong'
      } else {
        // console.error(data)
      }
    },
    getTree() {
      // 数据集
      this.$http
        .get(this.$url + '/service/models/modeltree')
        .then(res => {
          this.treeLoading = false
          if (res.data.subNodes) {
            const modelTree = _.cloneDeep(res.data.subNodes)
            modelTree.forEach(dep => {
              if (dep.subNodes) {
                dep.subNodes.forEach(cat => {
                  if (cat.subNodes) {
                    cat.subNodes.forEach(model => {
                      delete model.subNodes
                    })
                  }
                })
              }
            })
            this.treeData = this.treeSort(res.data)
          }
        })
        .catch(err => {
          this.treeLoading = false
          this.$showFailure(err)
        })
    },
    getList() {
      // 清空已选资产
      this.$nextTick(() => {
        this.selectedAssets = {}
        this.$refs.assetsTable.clearSingleSelect()
      })
      this.tableLoading = true
      let params = {
        currentPage: this.assetPagination.currentPage,
        keyword: this.assetsKeyword,
        modelId: this.modelId,
        pageSize: this.assetPagination.pageSize,
        schema: this.modelId ? this.schema : '',
        sortByCreateTime: null,
        sortByName: null,
        tagIds: null,
        types: null,
      }
      params.typeIds = []
      if (this.assetType === 'TABLE') {
        if (this.isTable) {
          params.typeIds.push(80000004)
        }
        if (this.isView) {
          params.typeIds.push(80500008)
        }
        params.type = 'TABLE'
      } else if (this.assetType === 'COLUMN') {
        params.typeIds.push(80000005)
        params.type = 'COLUMN'
      }
      HTTP.getMetaData(params)
        .then(res => {
          this.tableLoading = false
          const { page: all, exist } = res.data.data
          this.assetPagination.total = all.totalItems
          all.content.map(item => {
            const hasAsset = exist.some(
              m => parseFloat(m) === parseFloat(item.objectId)
            )
            if (hasAsset) {
              item.disabled = true
            }
            item.tableName =
              item.physicalName +
              (item.logicalName ? '(' + item.logicalName + ')' : '')
            item.system = !this.$modelCategoriesDetailsMap[item.modelCategoryId]
              ? '--'
              : this.$modelCategoriesDetailsMap[item.modelCategoryId]
                  .displayName
            item.department = !this.$modelCategoriesDetailsMap[
              item.modelCategoryId
            ]
              ? '--'
              : this.$modelCategoriesDetailsMap[item.modelCategoryId]
                  .itDepartment
            item.time = this.$timeFormatter(item.creationTime)
          })
          this.assetsData = all.content || []
          // if (this.assetId) {
          //   this.$nextTick(() => {
          //     this.selectedAssets = this.assetsData.filter(
          //       v => parseFloat(v.objectId) === parseFloat(this.assetId)
          //     )
          //   })
          // }
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    sortByName(node) {
      const departments = node.subNodes
      this.$utils.sort.sortConsiderChineseNumber(departments)
    },
    // 数据表树排序
    treeSort(root) {
      const t = root.subNodes
      if (t != null) {
        this.sortByName(root)
        t.forEach(item => {
          this.sortByName(item)
          item.subNodes &&
            item.subNodes.forEach(c => {
              if (c.type === 'MODEL_CATEGORY') {
                c.id = 'c' + c.id
              }
              if (c.subNodes) {
                this.sortByName(c)
                c.subNodes.forEach(m => {
                  if (m.subNodes) {
                    this.sortByName(m)
                    m.subNodes.forEach(s => {
                      s.id += '_%_' + m.name + '_%_' + s.name
                    })
                  }
                })
              }
            })
        })
      }
      const index = t.findIndex(item => {
        return item.id === 'others'
      })
      if (index !== -1) {
        const others = t.splice(index, 1)
        t.push(others[0])
      }
      return t
    },
    getAssetRowKeys(row) {
      return row.id
    },
    modelloading() {
      if (this.modelPage * 20 >= this.modelTotal) return
      this.modelPage++
      this.getModel()
    },
    getModel() {
      this.modelLoading = true
      const params = {
        categoryId: '',
        currentPage: this.modelPage,
        modelName: '',
        pageSize: 20,
      }
      api.getFromre(params).then(res => {
        this.modelLoading = false
        this.modelTotal = res.data.totalItems
        if (this.modelPage !== 1) {
          this.fromreList = this.fromreList.concat(res.data.content)
        } else {
          this.fromreList = res.data.content
        }
        this.allFromreList = this.fromreList
      })
    },
    qureyAssets() {
      this.assetPagination.currentPage = 1
      if (!this.modelId) {
        this.$refs.tree.$refs.tree.setCurrentKey(null)
      }
      this.getList()
    },
    handleSizeChange(pageSize) {
      this.assetPagination.currentPage = 1
      this.assetPagination.pageSize = pageSize
      this.getList()
    },
    handleCurrentChange(page) {
      this.assetPagination.currentPage = page
      this.getList()
    },
    selectAsset(list) {
      this.selectedAssets = list
    },
    submitAssets() {
      let dataSource = ''
      if (this.assetType === 'TABLE') {
        dataSource =
          this.allFromreList.find(
            item => item.modelId === this.selectedAssets.parentId
          ).definition || ''
      } else {
        dataSource = this.selectedAssets.definition
      }
      const assetInfo = {
        assetId: this.selectedAssets.objectId,
      }
      this.clickTable('sureTable', { data: assetInfo })
    },
  },
}
</script>

<style scoped lang="scss">
.add-table-page {
  height: 395px;
  overflow: hidden;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  .tree-box {
    width: 190px;
    float: left;
    height: 100%;
    padding: 10px 0;
    border: 1px solid #ddd;
    /deep/ .datablau-input {
      margin: 0 10px;
    }
    .grey-tree {
      height: 340px;
      overflow-y: auto;
    }
  }
  .assets-box {
    height: 100%;
    padding: 0 10px;
    width: 930px;
    float: left;
    overflow: hidden;
    position: relative;
    .table-box {
      position: absolute;
      top: 40px;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
