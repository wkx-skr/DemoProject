<template>
  <div>
    <!--<datablau-dialog
      title="添加模型"
      :visible.sync="logModal"
      append-to-body
      width="800px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >-->
      <div class="boxFlex">
        <div class="boxCon">
          <div class="tree-container">
            <datablau-input placeholder="搜索" v-model="treeQuerySearch" :iconfont-state="true" style="margin-bottom: 5px"></datablau-input>
            <datablau-tree
              class="model-tree"
              style="position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    overflow: auto;
    bottom: 0;"
              ref="modelTree"
              :data="treeData"
              :props="defaultProps"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
              :default-expand-all="false"
              :default-expanded-keys="defaultKey"
              :expand-on-click-node="false"
              :highlight-current="true"
              :dataSupervise="true"
              node-key="id"
              :data-icon-function="dataIconFunction"
              :showOverflowTooltip="true"
            ></datablau-tree>
          </div>
          <div class="right" style="flex: 1;">
            <datablau-input placeholder="搜索名称、编码" v-model="modelSearchQuery" :iconfont-state="true" @input="getModelListDataKeyWord"></datablau-input>
            <span v-if="selection.length" style="margin-left: 10px">已选择{{selection.length}}个模型</span>
            <div style="height: 410px">
              <datablau-table
              :data="tableData"
              :height=" '410px'"
              v-loading="loading"
              ref="tableData"
              :single-select="true"
              :auto-hide-selection="false"
              row-key="id"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                show-overflow-tooltip
                label="名称"
                prop="name"
                min-width="90"
              >
                <template slot-scope="scope">
                  <div class="name-wrapper">
                    <!-- <datablau-icon :data-type="'bpmnmodel'" icon-type="svg" :size="18" style="position: relative;top: 4px"></datablau-icon> -->
                    <span>{{scope.row.name}}</span>
                  </div>
                </template>
              </el-table-column>
              <!-- <el-table-column
                show-overflow-tooltip
                label="路径"
                prop="path"
                min-width="120"
              >
              </el-table-column> -->
              <el-table-column
                show-overflow-tooltip
                label="负责人"
                prop="owner"
              >
              </el-table-column>
              <el-table-column
                label="更新时间"
                show-overflow-tooltip
                :formatter="$timeFormatter"
                prop="lastModificationTimestamp"
              >
              </el-table-column>
            </datablau-table>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <datablau-pagination
          style="float: left"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50,100]"
          :page-size="pageSize"
          layout="total, sizes,  pager,  jumper"
          :total="total">
        </datablau-pagination>
        <div style="float: right">
          <datablau-button type="secondary" @click="closeModel">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button
            type="primary"
            @click="saveModel"
            :disabled="modelDisabled"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </div>
<!--    </datablau-dialog>-->
  </div>
</template>

<script>
import string from '@/resource/utils/string'
import HTTP from '@/resource/http'

export default {
  data () {
    return {
      pageSize: 20,
      currentPage: 1,
      total: 0,
      logModal: true,
      modelDisabled: true,
      treeQuerySearch: '',
      treeData: [],

      defaultKey: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableData: [],
      currentCategory: {},
      modelSearchQuery: '',
      loading: false,
      selection: [],
      modelsListAll: [],
      filterModel: []
    }
  },
  props: {
    oldData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    oldData (val) {
      /* console.log(val, 'val')
      this.handleSelectionChange(val)
      val.forEach(item => {
        this.$refs.tableData.toggleRowSelection(item, true)
      }) */
    },
    treeQuerySearch (value) {
      this.$refs.modelTree.filter(value)
    }
  },
  methods: {
    getFilterModel () {
      this.$http
        .get(`${this.$url}/layer/model/filter`)
        .then(res => {
          this.filterModel = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeModel () {
      // this.logModal = false
      this.$emit('closeMode')
    },
    saveModel () {
      // this.logModal = false
      this.$emit('result', this.selection)
      this.$emit('closeMode')
    },
    handleClose (item) {
      let ary = this.selection.filter(i => item.id !== i.id)
      this.handleSelectionChange(ary)
      this.$refs.tableData.toggleRowSelection(item, false)
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.getModelListData()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getModelListData()
    },
    getTreeData () {
      HTTP.getModels().then(res => {
        console.log(res, 'res.data')
        this.treeData = [res]
        this.modelsListAll = this.extractModels(this.treeData)
        this.defaultKey = [res.id]
        this.$nextTick(() => {
          let node = this.$refs.modelTree.getNode(res.id)
          this.$refs.modelTree.setCurrentKey(res.id)
          this.handleNodeClick(node.data, node)
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      if (string.matchKeyword(node.data, value, 'name')) {
        hasValue = true
      }
      return hasValue
    },
    handleNodeClick (data, node) {
      this.currentCategory = data
      this.getModelListData()
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleSelectionChange (val) {
      console.log(val, 'val')
      this.selection = val
      if (this.selection) {
        this.modelDisabled = false
      } else {
        this.modelDisabled = true
      }
    },
    getModelListDataKeyWord () {
      this.currentPage = 1
      this.pageSize = 20
      this.getModelListData()
    },
    extractModels (arr) {
      let result = []
      for (let item of arr) {
        if (item.models) {
          result = result.concat(item.models)
        }
        if (item.children) {
          result = result.concat(this.extractModels(item.children))
        }
      }
      return result
    },
    getModelListData () {
      // this.loading = true
      if (this.currentCategory.id === 1) {
        let modelsListAll = this.modelsListAll.filter(model => model.modelType !== 'Conceptual')
        this.tableData = modelsListAll
        // this.tableData.forEach(model => {
        //   if (this.filterModel.includes(model.id)) {
        //     model.disabled = true
        //   }
        // })
        this.total = modelsListAll.length
      } else {
        let modelsList = this.currentCategory.models ? this.currentCategory.models.filter(model => model.modelType !== 'Conceptual') : []
        this.tableData = modelsList
        // this.tableData.forEach(model => {
        //   if (this.filterModel.includes(model.id)) {
        //     model.disabled = true
        //   }
        // })
        this.total = modelsList ? modelsList.length : 0
      }
    }
  },
  mounted () {
    // this.getFilterModel()
    this.getTreeData()
  }
}
</script>

<style scoped lang='scss'>
  .boxCon{
    display: flex;
    /*height: 450px;*/
    border-bottom: 1px solid #ddd;
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    bottom: 36px;
    flex: 1;
  }
  .tree-container{
    width: 200px;
    padding: 10px;
    border-right: 1px solid #ddd;
    position: relative;
    stroke-opacity: -20px;
    display: flex;
    flex-direction: column;
  }
  .right{
    padding-left: 7px;
    padding-top: 10px;
  }
  .boxFlex{
    display: flex;
    flex-direction: column;
  }
  .selectBox{
    height: 40px;
    overflow: auto;
    position: absolute;
    right: 0;
    top: -1px;
    left: 20px;
    padding-top: 10px;
  }
  .datablau-tag{
    margin-bottom: 5px;
  }
  .footer{
    position: absolute;
    bottom: -7px;
    left: 20px;
    right: 20px;
  }
</style>
