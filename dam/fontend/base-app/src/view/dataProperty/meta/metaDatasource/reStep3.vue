<template>
  <div class="reDetail step3">
    <div class="skipContent">
      <datablau-detail-subtitle
        class="stepTitle"
        :title="$t('meta.reManage.reModelList')"
      ></datablau-detail-subtitle>
      <datablau-table
        class="datablau-table-info"
        ref="dsTable"
        :data="displayData"
        height="100%"
        highlight-current-row
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        test-name="datasource_table"
      >
        <el-table-column
          :label="$t('meta.dataSource.name')"
          prop="definition"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.dataSource.type')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <database-type
              :key="scope.row.type"
              :value="scope.row.type"
              :size="24"
            ></database-type>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.dataSource.operation')"
          width="180"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <div class="tool">
              <datablau-button
                :disabled="!$auth['BASE_TASK_SCHEDULER_MANAGE']"
                type="text"
                class="btn-in-table-info"
                @click="goToJob(scope.row, 1)"
                :tooltipContent="
                  !$auth['BASE_TASK_SCHEDULER_MANAGE']
                    ? $t('meta.reManage.noPermission')
                    : ''
                "
              >
                {{ $t('meta.reManage.updateTask') }}
              </datablau-button>
            </div>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
  </div>
</template>
<script>
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
export default {
  props: ['dsEditing', 'editRow'],
  data() {
    return {
      displayData: [],
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
    }
  },
  components: { DatabaseType },
  mounted() {
    this.$bus.$on('sendModuleData', this.getModuleList)
  },
  beforeDestroy() {
    this.$bus.$off('sendModuleData')
  },
  methods: {
    getModuleList(data) {
      this.displayData = data
    },
    goToJob(row, jobTypeNumber) {
      this.$bus.$emit('showMetadataJob', {
        row: row,
        jobTypeNumber: jobTypeNumber,
        fromRe: true,
      })
    },
    cancel() {
      this.$emit('removeReTab')
    },
    goJob() {},
  },
}
</script>
<style lang="scss" scoped>
.reDetail.step3 {
  position: absolute;
  padding: 0 20px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow: hidden;
  background: #fff;
  .datablau-table-info {
    padding: 0 20px;
    position: absolute !important;
    top: 30px;
    height: calc(100% - 30px);
    left: 0;
    right: 0;
    overflow: auto;
  }
}
</style>
