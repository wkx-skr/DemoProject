<template>
  <div class="dashboard-item model-history">
    <div class="title-line">
      <span class="title">我的模型</span>
      <span class="table-count">（最近修改20条）</span>
      <datablau-button
        type="text"
        class="skip-btn"
        @click="checkMore"
      >
        查看更多
      </datablau-button>
    </div>
    <div class="table-container">
      <datablau-table
        v-loading="loading"
        :data="tableData"
        @row-click="handleRowClick"
        height="100%"
        row-class-name="model-list-item"
        row-key="id"
        ref="historyTable"
      >
        <el-table-column
          prop="name"
          show-overflow-tooltip
          width="26px;"
        >
          <template slot-scope="scope">
            <span class="db-icon">
              <database-type
                :key="scope.row.modelType"
                :value="scope.row.modelType"
                :size="24"
                :hideLabel="true"
                :showIconTooltip="true"
                style="display: inline-block;margin-right: 3px;"
              ></database-type>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          show-overflow-tooltip
          label="模型名称"
          min-width="100px;"
        >
          <template slot-scope="scope">
            <span class="table-import-column">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="branch"
          show-overflow-tooltip
          label="模型分支"
          min-width="100px;"
        >
          <template slot-scope="scope">
            {{ scope.row.branch ? scope.row.name : 'master' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="path"
          show-overflow-tooltip
          label="模型路径"
          min-width="130px;"
        >
        </el-table-column>
        <el-table-column
          prop="taskName"
          show-overflow-tooltip
          label="评分"
          width="130px"
          v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute"
        >
          <template slot-scope="scope">
            <rate-in-table
              :rate="Number(scope.row.vote || 0)"
            ></rate-in-table>
          </template>
        </el-table-column>
        <el-table-column
          label="最后更新时间"
          prop="lastModificationTimestamp"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          width="130px"
        ></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="55px"
        >
          <template slot-scope="scope">
            <div class="default-button">
              <!--<datablau-button-->
              <!--  v-if="!scope.row.pinUp"-->
              <!--  type="icon"-->
              <!--  tooltipContent="将此项目固定到列表"-->
              <!--  class="iconfont icon-pinned"-->
              <!--  @click.stop="pinModel(scope.row)"-->
              <!--&gt;</datablau-button>-->
              <datablau-button
                v-if="scope.row.pinUp"
                type="icon"
                class="iconfont icon-pinned"
                @click.stop="deletePinModel(scope.row)"
              ></datablau-button>
            </div>
            <div class="hover-button">
              <datablau-button
                v-if="!scope.row.pinUp"
                type="icon"
                tooltipContent="置顶"
                class="iconfont icon-pinned"
                @click.stop="pinModel(scope.row)"
              ></datablau-button>
              <datablau-button
                v-if="scope.row.pinUp"
                type="icon"
                tooltipContent="取消置顶"
                class="iconfont icon-unpinned"
                @click.stop="deletePinModel(scope.row)"
              ></datablau-button>
            </div>

          </template>
        </el-table-column>
      </datablau-table>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import databaseType from '@/components/common/DatabaseType.vue'
import rateInTable from '@/views/modelLibrary/rateInTable.vue'

export default {
  name: 'dashboardModelHistory',
  data () {
    return {
      loading: true,
      tableData: []
    }
  },
  components: {
    rateInTable,
    databaseType
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      HTTP.getPinModel()
        .then(data => {
          // console.log(data, 'data')
          this.tableData = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
          $('.model-history .model-list-item').removeClass('hover-row')
        })
    },
    handleRowClick (row) {
      let param = row.param
      const skip = () => {
        this.$router.push({
          name: 'list',
          query: {
            id: row.id,
            pId: row.categoryId
            // rId: param.reportId
          }
        })
      }
      if (this.$store.state.user.isAdmin) {
        skip()
      } else {
        HTTP.getModelPermission({ modelId: row.id })
          .then(data => {
            if (data.admin || data.editor || data.viewer) {
              skip()
            } else {
              this.$message.warning(this.$v.modelList.tip_1)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    pinModel (row, e) {
      // e.stopPropagation()
      HTTP.pinModel({ objectId: row.id })
        .then(res => {
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deletePinModel (row, e) {
      // e.stopPropagation()
      HTTP.deletePinModel({ objectId: row.id })
        .then(res => {
          this.dataInit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkMore () {
      this.$router.push({
        name: 'list'
      })
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
@import './dashboardBase.scss';
.model-history {
  /deep/ .el-table__fixed-right::before {
    display: none;
  }
}
.model-history /deep/ .model-list-item {
  cursor: pointer;
}

.model-history .model-list-item  {

  .hover-button {
    display: none;
  }

  &:hover, &.hover-row {
    .default-button {
      display: none;
    }
    .hover-button {
      display: inline-block;
    }
  }
  .default-button,.hover-button {
    position: relative;
    left: 2px;
  }
}
</style>
