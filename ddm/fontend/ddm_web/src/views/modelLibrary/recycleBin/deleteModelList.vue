<template>
  <div class="delete-model-list-container">
    <select-model-category
        ref="selectModelCategory"
        @chooseModelCategory="chooseMoveCategoryNode"
        @chooseConfirm="handleRestoreTo"
    ></select-model-category>
    <div class="filter-line">
      <div class="vertical-line">
        <datablau-input
            prefix-icon="el-icon-search"
            size="small"
            v-model="modelKeyword"
            :iconfont-state="true"
            :placeholder="$store.state.$v.common.placeholder"
            clearable
            style="width: 240px"
            :themeBlack="$route.path.indexOf('sql_editor') !== -1"
        ></datablau-input>
        <span class="list-tips"> <i class="iconfont icon-tips"></i>回收站中进行删除操作是彻底删除，不可恢复</span>
      </div>
    </div>
    <div class="table-line">
      <datablau-table
        ref="deletedModelTable"
        class="deleted-model-table"
        :single-select="false"
        :data="showData"
        height="100%"
        :indent="0"
        row-key="modelId"
        :tree-props="{
          hasChildren: 'hasChildren',
          children: 'hasChildren'
        }"
        :themeBlack="$route.path.indexOf('sql_editor') !== -1"
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <recycle-sub-tree
              :ref="`subTree_${scope.row.modelId}`"
              :showData="scope.row.showData"
              :key="scope.row.modelId + 'subTable'"
              @undelete="undelete"
              @restoreTo="restoreTo"
              @deleteBranchConfirm="deleteBranchConfirm"
            ></recycle-sub-tree>
          </template>
        </el-table-column>
        <el-table-column
            prop="modelName"
            :label="$store.state.$v.modelList.modelName"
            min-width="120"
            show-overflow-tooltip
        >
          <template slot="header">
            <span style="margin-left: 25px;">模型名称</span>
          </template>
          <template slot-scope="scope">
            <span>
              <datablau-icon
                  v-if="!scope.row.dwModel"
                  data-type="model"
                  :size="16"
                  style="margin: 0 6px 0 -1px; vertical-align: middle;"
              ></datablau-icon>
              <datablau-icon
                  v-else
                  data-type="data-warehouse"
                  :size="16"
                  style="margin: 0 6px 0 -1px; vertical-align: middle;"
              ></datablau-icon>
            </span>
            <span>{{!scope.row.isBranch ? scope.row.modelName : scope.row.branchName}}</span>
          </template>
        </el-table-column>
        <el-table-column
            prop="originalPath"
            label="原位置"
            min-width="120"
            show-overflow-tooltip
        ></el-table-column>
        <el-table-column
            prop="trashedOn"
            :formatter="$timeFormatter"
            :width="140"
            label="删除时间"
        ></el-table-column>
        <el-table-column
            prop="trashedBy"
            label="删除者"
            show-overflow-tooltip
        >
          <template  slot-scope="scope">
            <span>{{scope.row.trashedBy || '无'}}</span>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            :width="$store.state.user.isAdmin ? 110 : 80"
            fixed="right"
            header-align="center"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              class="iconfont icon-return"
              @click.stop="undeleteBatch(scope)"
              tooltipContent="还原"
              v-if="scope.row.trashedBy"
            >
            </datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-chehui"
              @click.stop="batchRestoreTo(scope)"
              :tooltipContent="scope.row.branchName !== 'master' ? '分支模型不能还原至目录' : '还原至目录'"
              :disabled="scope.row.branchName !== 'master'"
              v-if="scope.row.trashedBy"
            >
            </datablau-button>
            <datablau-button
                type="icon"
                class="iconfont icon-delete"
                @click.stop="deleteBranchConfirm(scope)"
                tooltipContent="删除"
                v-if="$store.state.user.isAdmin && scope.row.trashedBy"
            >
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'

import selectModelCategory from '@/views/modelLibrary/selectModelCategory.vue'
import recycleSubTree from './recycleSubTree.vue'

export default {
  name: 'deleteModelList',
  data () {
    return {
      modelKeyword: '',
      allData: [],
      showData: null,
      chosenMoveCategoryId: '',
      categoryMap: {},
      cateGoryData: {},
      modelCategoryMap: new Map(),
      restoreModelId: null,
      batchRestore: false,
      batchRestoreModelIds: []
    }
  },
  components: {
    selectModelCategory,
    recycleSubTree
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      HTTP.getDeletedModelList({ fillParentModel: true })
        .then(res => {
          let allData = res || []
          let modelMap = {}
          let modelData = []
          allData.forEach(item => {
            modelMap[item.modelId] = item
            item.tableId = item.modelId + item.branchName
          })
          allData.forEach(item => {
            if (item.branchName === 'master') {
              let branch = _.cloneDeep(item)
              delete branch.children
              branch.isBranch = true
              let model = item
              model.isBranch = false
              model.tableId = item.modelId
              modelData.push(item)
              model.children = model.children || []
              if (item.trashedBy) {
                model.children.push(branch)
              }
            } else {
              item.isBranch = true
              let model = modelMap[item.referredModelId]
              model.children = model.children || []
              model.children.push(item)
            }
          })
          this.allData = modelData
          this.getShowData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getShowData () {
      let keyword = _.trim(this.modelKeyword)
      if (keyword) {
        this.showData = this.allData.filter(item => {
          let bool = this.$MatchKeyword(item, keyword, 'modelName')
          if (item.children) {
            item.showData = []
            item.children.forEach(child => {
              if (this.$MatchKeyword(child, keyword, 'branchName')) {
                bool = true
                item.showData.push(child)
              }
              if (child.branchName === 'master') {
                if (this.$MatchKeyword(child, keyword, 'modelName')) {
                  bool = true
                  item.showData.push(child)
                }
              }
            })
            return bool
          }
        })
        this.toggleTableExpansion(true)
      } else {
        this.showData = this.allData
        this.allData.forEach(item => {
          item.showData = item.children
        })
        this.toggleTableExpansion(false)
      }
    },
    toggleTableExpansion (bool) {
      this.$nextTick(() => {
        this.showData.forEach((v) => {
          v.expanded = bool
          this.$refs.deletedModelTable?.toggleRowExpansion(v, bool)
        })
      })
    },
    deleteBranchConfirm (scope) {
      this.$DatablauCofirm('删除后不可以恢复，确认要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.deleteBranch(scope.row)
      }).catch((e) => {
        console.log(e)
        console.log('cancel')
      })
    },
    deleteBranch (model) {
      let params = {
        modelId: model.modelId
      }
      HTTP.deleteModelFromRecycleBin(params)
        .then(res => {
          this.$datablauMessage.success('删除成功')
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    undelete ({ row }) {
      this.batchRestore = false
      let params = {
        modelId: row.modelId,
        categoryId: row.categoryId
      }
      HTTP.restoreBranch(params)
        .then(res => {
          this.$datablauMessage.success('恢复成功')
          this.updateModelList()
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    undeleteBatch ({ row }) {
      this.batchRestore = true
      this.batchRestoreModelIds = row.showData.map(item => item.modelId)
      let params = {
        modelIds: this.batchRestoreModelIds,
        categoryId: row.categoryId
      }
      HTTP.restoreBranchBatch(params)
        .then(res => {
          this.$datablauMessage.success('恢复成功')
          this.updateModelList()
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    restoreTo ({ row }) {
      this.batchRestore = false
      this.$refs.selectModelCategory?.dataInit()
      this.restoreModelId = row.modelId
    },
    batchRestoreTo ({ row }) {
      this.batchRestore = true
      this.$refs.selectModelCategory?.dataInit()
      this.batchRestoreModelIds = row.showData.map(item => item.modelId)
    },
    chooseMoveCategoryNode ({ data, node }) {
      if (data.id === 1) {
        this.$datablauMessage({
          message: '不能选择根目录',
          type: 'error',
          showClose: true
        })
        return
      }
      this.chosenMoveCategoryId = data.id
    },
    handleRestoreTo () {
      let restorePromise = null
      if (this.batchRestore) {
        let params = {
          modelIds: this.batchRestoreModelIds,
          categoryId: this.chosenMoveCategoryId
        }
        restorePromise = HTTP.restoreBranchBatch(params)
      } else {
        let params = {
          modelId: this.restoreModelId,
          categoryId: this.chosenMoveCategoryId
        }
        restorePromise = HTTP.restoreBranch(params)
      }
      restorePromise
        .then(res => {
          this.$datablauMessage.success('恢复成功')
          this.dataInit()
          this.updateModelList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.hideDialog()
        })
    },
    updateModelList () {
      this.$bus.$emit('updateModelList')
    }

  },
  watch: {
    modelKeyword () {
      this.getShowData()
    }
  }
}
</script>

<style lang="scss" scoped>
$filterLineHeight: 40px;
.delete-model-list-container {
  //border: 1px solid red;
  position: relative;
  height: 100%;

  .filter-line {
    position: absolute;
    left: 0;
    top: 0px;
    right: 0;
    height: $filterLineHeight;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .vertical-line {
      //border: 1px solid red;
      width: 100%;

      .list-tips {
        color: #777;

      }

      .icon-tips {
        margin: 0 4px 0 8px;
        color: #999;
      }
    }
  }

  .table-line {
    //border: 1px solid red;
    position: absolute;
    left: 0;
    top: $filterLineHeight;
    right: 0;
    bottom: 0;
  }
}
</style>
