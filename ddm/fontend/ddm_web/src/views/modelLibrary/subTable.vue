<template>
  <div class="sub-tree-container">
    <div class="top-shadow"></div>
    <datablau-table
      ref="subTable"
      class="expand-table"
      :class="{'dialogOpen':dialogOpen}"
      :single-select="needBind"
      :reserveSelection="needBind"
      :autoHideSelection="!needBind"
      :data="showChildren"
      :row-key="getKey"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :themeBlack="themeBlack"
      :resetHoverHandle="true"
    >
      <el-table-column width="24" align="left">
        <template slot-scope="scope">
          <i v-show="scope.row.root" class="tree-icon model"></i>
        </template>
      </el-table-column>
      <el-table-column
        prop="branchName"
        label="分支名称"
        width="200"
        show-overflow-tooltip
        sortable="custom"
      >
        <template slot="header">
          <span style="margin-left: 21px;">分支名称</span>
        </template>
        <template slot-scope="scope">
          <datablau-icon data-type="branch" :size="16" style="vertical-align: middle;margin-right: 6px;"></datablau-icon>
          <b
            style="cursor: pointer;"
            @click.stop="handleRowClick(scope.row)"
            v-if="scope.row.branch"
          >{{ scope.row.name }}</b>
          <b style="cursor: pointer;" @click.stop="handleRowClick(scope.row)" v-else>master</b>
        </template>
      </el-table-column>
      <el-table-column
        :label="$store.state.$v.modelList.modelStatus"
        header-align="left"
        align="left"
        width="100"
        prop="phase"
        sortable="custom"
        column-key="modelStatus"
        v-if="$store.state.featureMap.ddm_CustomStatus"
      >
        <template slot-scope="scope">
          <Status
            style="margin-left: 0;text-align: left;"
            :type="scope.row.phase"
            :key="scope.row.id"
          ></Status>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastModifier"
        :label="$store.state.$v.modelList.owner"
        show-overflow-tooltip
        sortable="custom"
      ></el-table-column>
      <el-table-column
        :label="$store.state.$v.modelList.databaseType"
        :min-width="180"
        prop="modelType"
        sortable="custom"
        column-key="databaseType"
      >
        <template slot-scope="scope">
          <Database-Type
            :key="scope.row.modelType"
            :value="scope.row.modelType"
            :size="16"
          ></Database-Type>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastModificationTimestamp"
        :formatter="$timeFormatter"
        width="140"
        :label="$store.state.$v.modelList.lastModification"
        sortable="custom"
      ></el-table-column>
      <el-table-column
        :width="100"
        :label="$store.state.$v.modelList.score"
        header-align="left"
        prop="rate"
        v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute"
        align="left"
      >
        <template slot-scope="scope">
          <rate-in-table
            :rate="Number(scope.row.rate || 0)"
          ></rate-in-table>
        </template>
      </el-table-column>
      <el-table-column
        :label="$store.state.$v.modelList.tag"
        header-align="left"
        :width="230"
        column-key="tag"
      >
        <template slot-scope="scope">
          <tag-container
            v-if="modelToTagMap.has(scope.row.id)"
            :modelId="scope.row.id"
            :modelToTagMap="modelToTagMap"
          ></tag-container>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        :label="$store.state.$v.modelList.description"
        :min-width="140"
        show-overflow-tooltip
      >
      </el-table-column>
      <!--<el-table-column-->
      <!--  label="操作"-->
      <!--  :min-width="100"-->
      <!--  fixed="right"-->
      <!--  v-if="inElectron"-->
      <!--&gt;-->
      <!--  <template slot-scope="scope">-->
      <!--    <div class="edit-model-btn" @click.stop="editModel(scope)">-->
      <!--      <img :src="editImg"/>-->
      <!--      <span>编辑</span>-->
      <!--    </div>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <el-table-column
        label="操作"
        width="180"
        header-align="center"
        v-if="showOperator"
      >
        <template slot-scope="scope">
          <datablau-button
            type="icon"
            class="iconfont icon-see"
            @click.stop="handleRowClick(scope.row)"
            tooltipContent="查看"
            :disabled="!scope.row.permissions.viewer"
          >
          </datablau-button>
          <datablau-button
            type="icon"
            class="iconfont icon-bianji"
            v-if="$store.state.lic.editor"
            @click.stop="editModel(scope)"
            tooltipContent="编辑"
            :disabled="!scope.row.permissions.editor"
          >
          </datablau-button>
          <datablau-button
            type="icon"
            class="iconfont icon-Recycle"
            @click.stop="deleteBranchConfirm(scope)"
            tooltipContent="删除"
            :disabled="!scope.row.permissions.admin"
          >
          </datablau-button>
          <datablau-button
              type="icon"
              class="iconfont icon-branch"
              @click.stop="createBranch(scope)"
              tooltipContent="创建分支"
              :disabled="!scope.row.permissions.editor"
              v-if="!couldPublishModel(scope)"
          >
          </datablau-button>
          <datablau-button
            type="icon"
            class="el-icon-more"
            v-if="couldPublishModel(scope)"
            @click.stop="(e) => showMoreAction(e, scope)"
          >
          </datablau-button>
          <datablau-button
                  type="icon"
                  class="iconfont icon-export"
                  @click.stop="exportDictionary(scope.row)"
                  tooltipContent="导出数据字典"
              >
              </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>

<script>
import rateInTable from '@/views/modelLibrary/rateInTable.vue'
import Status from '@/views/list/Status'
import tagContainer from '@/views/modelLibrary/tagContainer'
import DatabaseType from '@/components/common/DatabaseType'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'

export default {
  name: 'subTable',
  data () {
    return {
      showChildren: []
    }
  },
  props: {
    needBind: {
      required: true
    },
    getKey: {
      required: true
    },
    modelToTagMap: {
      required: true
    },
    inElectron: {
      required: true
    },
    editImg: {
      required: true
    },
    currentData: {
      required: true
    },
    showOperator: {
      default: false
    },
    couldPublishModel: {
      required: true
    },
    dialogOpen: {
      default: false
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    rateInTable,
    Status,
    tagContainer,
    DatabaseType
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.getModelsPermission(this.currentData.showChildren)
    },
    getModelsPermission (models) {
      sort.sort(models, 'id')
      this.showChildren = models
      if (!models || models.length === 0) {
        this.showChildren = []
      }
    },
    handleSortChange ({ column, prop, order }) {
      if (order) {
        sort.sort(this.showChildren, prop, order)
      } else {
        sort.sort(this.showChildren, 'id')
        // sort.sort(this.showChildren, 'branchName')
      }
    },
    handleRowClick (row) {
      this.$emit('handleRowClick', row)
    },
    editModel (row) {
      this.$emit('editModel', row)
    },
    deleteBranchConfirm (row) {
      this.$emit('deleteBranchConfirm', row)
    },
    showMoreAction (e, scope) {
      this.$emit('showMoreAction', e, scope)
    },
    createBranch (scope) {
      this.$emit('createBranch', scope)
    },
    exportDictionary (scope) {
      this.$emit('exportDictionary', scope)
    },
    handleSelectionChange (val) {
      this.$emit('handleSelectionChange', val)
    },
    clearSingleSelect () {
      this.$refs.subTable?.clearSingleSelect()
    }
  }
}
</script>

<style scoped lang="scss">
.expand-table {
  /deep/ {
    .el-table tr, .el-table th.el-table__cell {
      background-color: #F7F8FC;
    }
  }

  &.dialogOpen {
    /deep/ {
      .el-table tr, .el-table th.el-table__cell {
        background-color: transparent;
      }
    }
  }
}

.sub-tree-container {
  position: relative;
  overflow: hidden;

  .top-shadow {
    border: 1px solid red;
    z-index: 2;
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .06);
  }

  /deep/ {
    .el-table__body-wrapper tr.el-table__row:last-child .el-table__cell {
      border-bottom-width: 0px;
    }
  }
}
</style>
