<template>
  <!-- 问题列表汇总 -->
  <div class="box">
    <div class="module-title">
      <p>{{ $t('quality.page.qualityDashboardNew.table.title') }}</p>
    </div>
    <div class="switch-tab">
      <div
        class="tabType"
        :class="{ tabTypeActive: tabTypeSelectActive === 1 }"
        @click="tabTypeSelect(1)"
      >
        <p>{{ $t('quality.page.qualityDashboardNew.organization') }}</p>
      </div>
      <div
        class="tabType"
        :class="{ tabTypeActive: tabTypeSelectActive === 2 }"
        @click="tabTypeSelect(2)"
      >
        <p>{{ $t('quality.page.qualityDashboardNew.system') }}</p>
      </div>
    </div>
    <div
      class="problemSummary-table"
      style="position: absolute; top: 40px; left: 20px; right: 20px; bottom: 0"
    >
      <datablau-table
        :data="listData"
        row-class-name="row-can-click"
        ref="multipleTable"
        height="100%"
        style="height: 100%"
        @sort-change="changeSort"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <el-table-column
          show-overflow-tooltip
          align="left"
          sortable
          prop="groupName"
          min-width="160"
          :label="
            tabTypeSelectActive === 1
              ? $t('quality.page.qualityDashboardNew.table.organizationName')
              : $t('quality.page.qualityDashboardNew.table.systemName')
          "
        >
          <template slot-scope="scope">
            {{ scope.row.groupName }}
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          align="left"
          sortable
          prop="problemNum"
          :min-width="$i18n.locale === 'en' ? 200 : 160"
          :label="$t('quality.page.qualityDashboardNew.table.numberProblems')"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips1')"
              class="bottom-list-tooltip"
            >
              <span>
                {{
                  $t('quality.page.qualityDashboardNew.table.numberProblems')
                }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            {{ scope.row.problemNum }}
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          align="left"
          sortable
          prop="problemRatio"
          :min-width="$i18n.locale === 'en' ? 180 : 160"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips2')"
              class="bottom-list-tooltip"
            >
              <span>
                {{
                  $t('quality.page.qualityDashboardNew.table.problemProportion')
                }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-progress
              style="padding-top: 3px"
              :width="30"
              type="circle"
              :color="'#FBC372'"
              :percentage="
                scope.row.problemRatio === 0
                  ? scope.row.problemRatio
                  : Number((scope.row.problemRatio * 100).toFixed(2))
              "
              :show-text="false"
            ></el-progress>
            <span
              style="
                position: absolute;
                top: 8px;
                left: 45px;
                color: #555555;
                font-size: 12px;
              "
            >
              {{ parseFloat((scope.row.problemRatio * 100).toFixed(2)) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalProblemRatio"
          show-overflow-tooltip
          align="left"
          sortable
          :min-width="$i18n.locale === 'en' ? 400 : 160"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              v-if="tabTypeSelectActive === 1"
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips3')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.proportion') }}
              </span>
            </el-tooltip>
            <el-tooltip
              v-else
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips4')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.proportion3') }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-progress
              :percentage="
                Number((scope.row.totalProblemRatio * 100).toFixed(2))
              "
              :color="'#FBC372'"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column
          prop="problemDataNum"
          show-overflow-tooltip
          align="left"
          sortable
          :min-width="$i18n.locale === 'en' ? 230 : 160"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips5')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.dataItems') }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            {{ scope.row.problemDataNum }}
          </template>
        </el-table-column>
        <el-table-column
          prop="problemDataRatio"
          show-overflow-tooltip
          align="left"
          sortable
          min-width="160"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips6')"
              class="bottom-list-tooltip"
            >
              <span>
                {{
                  $t('quality.page.qualityDashboardNew.table.dataVolumeRatio')
                }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-progress
              style="padding-top: 3px"
              :width="30"
              type="circle"
              :color="'#7582E5'"
              :percentage="
                scope.row.problemDataRatio === 0
                  ? scope.row.problemDataRatio
                  : Number((scope.row.problemDataRatio * 100).toFixed(2))
              "
              :show-text="false"
            ></el-progress>
            <span
              style="
                position: absolute;
                top: 8px;
                left: 45px;
                color: #555555;
                font-size: 12px;
              "
            >
              {{ parseFloat((scope.row.problemDataRatio * 100).toFixed(2)) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalProblemDataRatio"
          show-overflow-tooltip
          align="left"
          sortable
          :min-width="$i18n.locale === 'en' ? 500 : 210"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              v-if="tabTypeSelectActive === 1"
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips7')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.proportion2') }}
              </span>
            </el-tooltip>
            <el-tooltip
              v-else
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips8')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.proportion4') }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-progress
              :percentage="
                Number((scope.row.totalProblemDataRatio * 100).toFixed(2))
              "
              :color="'#7582E5'"
            ></el-progress>
          </template>
        </el-table-column>

        <el-table-column
          prop="overProblemNum"
          show-overflow-tooltip
          align="left"
          sortable
          :min-width="$i18n.locale === 'en' ? 210 : 160"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips9')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.overdueIssues') }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            {{ scope.row.overProblemNum }}
          </template>
        </el-table-column>
        <el-table-column
          prop="overProblemRatio"
          show-overflow-tooltip
          align="left"
          sortable
          :min-width="$i18n.locale === 'en' ? 210 : 160"
          :label="
            $t('quality.page.qualityDashboardNew.table.ratioOverdueIssues')
          "
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips10')"
              class="bottom-list-tooltip"
            >
              <span>
                {{
                  $t(
                    'quality.page.qualityDashboardNew.table.ratioOverdueIssues'
                  )
                }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-progress
              style="padding-top: 3px"
              :width="30"
              type="circle"
              :color="'#F9716C'"
              :percentage="
                scope.row.overProblemRatio === 0
                  ? scope.row.overProblemRatio
                  : Number((scope.row.overProblemRatio * 100).toFixed(2))
              "
              :show-text="false"
            ></el-progress>
            <span
              style="
                position: absolute;
                top: 8px;
                left: 45px;
                color: #555555;
                font-size: 12px;
              "
            >
              {{ parseFloat((scope.row.overProblemRatio * 100).toFixed(2)) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="overTotalProblemRatio"
          show-overflow-tooltip
          align="left"
          sortable
          :min-width="$i18n.locale === 'en' ? 400 : 200"
        >
          <template slot="header" slot-scope="scope">
            <el-tooltip
              v-if="tabTypeSelectActive === 1"
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips11')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.proportion5') }}
              </span>
            </el-tooltip>
            <el-tooltip
              v-else
              effect="dark"
              :content="$t('quality.page.qualityDashboardNew.tips.tips12')"
              class="bottom-list-tooltip"
            >
              <span>
                {{ $t('quality.page.qualityDashboardNew.table.proportion6') }}
              </span>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <el-progress
              :percentage="
                Number((scope.row.overTotalProblemRatio * 100).toFixed(2))
              "
              :color="'#F9716C'"
            ></el-progress>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'problemSummary',
  components: {},
  data() {
    return {
      listData: [],
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      tabTypeSelectActive: 1,
      dashboardData: [],
    }
  },
  mounted() {
    this.$bus.$on('dashboardDataChange', data => {
      this.$nextTick(() => {
        this.dashboardData = data
        if (this.tabTypeSelectActive === 1) {
          this.listData = data.detailDataOrg
        } else {
          this.listData = data.detailDataCategory
        }
      })
    })
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
  },
  methods: {
    insertComma(row, column, cellValue, index) {
      return row.problemNum
    },
    changeSort(sortData) {
      this.$utils.sort.sort(this.listData, sortData.prop, sortData.order)
    },
    tabTypeSelect(type) {
      this.tabTypeSelectActive = type
      if (type === 1) {
        this.listData = this.dashboardData.detailDataOrg
      } else {
        this.listData = this.dashboardData.detailDataCategory
      }
    },
  },
}
</script>
<style lang="scss">
.problemSummary-table {
  .el-progress__text {
    color: #555555;
    font-size: 12px !important;
  }
}
</style>
<style scoped lang="scss">
@import './public.scss';

.box {
  background: var(--default-bgc);
}
</style>
