<template>
  <div>
    <datablau-table
        ref="deletedModelTable"
        class="deleted-model-table expand-table"
        :single-select="false"
        :data="showData"
        height="100%"
        :indent="0"
        v-if="showData && showData.length > 0"
    >
      <el-table-column width="50" align="left">
      </el-table-column>
      <el-table-column
          prop="modelName"
          :label="$store.state.$v.modelList.modelName"
          min-width="120"
          show-overflow-tooltip
      >
        <template slot="header">
          <span style="margin-left: 25px;">分支名称</span>
        </template>
        <template slot-scope="scope">
          <span>
            <i v-if="!scope.row.isBranch" class="tree-icon model"></i>
            <datablau-icon v-else data-type="branch" :size="16" style="vertical-align: middle;margin: 0 10px 0 2px;"></datablau-icon>
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
              @click.stop="undelete(scope)"
              tooltipContent="还原"
              v-if="scope.row.trashedBy"
          >
          </datablau-button>
          <datablau-button
              type="icon"
              class="iconfont icon-chehui"
              @click.stop="restoreTo(scope)"
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
    <div v-else style="text-align: center;">
      <datablau-icon :data-type="'no-result'" icon-type="svg" :size="60" ></datablau-icon>
    </div>
  </div>
</template>

<script>

import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'

export default {
  name: 'recycleSubTree',
  data () {
    return {
      showChildren: null
    }
  },
  props: {
    showData: {
      required: true
    }
  },
  components: {
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // this.getModelsPermission(this.currentData.showChildren)
      sort.sort(this.showData, 'modelId')
    },
    undelete (scope) {
      this.$emit('undelete', scope)
    },
    restoreTo (scope) {
      this.$emit('restoreTo', scope)
    },
    deleteBranchConfirm (scope) {
      this.$emit('deleteBranchConfirm', scope)
    }
  }
}
</script>

<style scoped lang="scss">
.expand-table {
  /deep/  {
    .el-table tr, .el-table th.el-table__cell {
      background-color: #F7F8FC;
    }
  }
}
</style>
