<template>
  <div
    class="metadata-quality-detection"
    @scroll="handleScroll"
    ref="container"
  >
    <datablau-dialog
      size="xl"
      :visible.sync="showEmptyFilter"
      append-to-body
      :height="700"
    >
      <table-owener-accuracy
        v-if="showEmptyFilter"
        @closeUdpDialog="showEmptyFilter = false"
        :filter-params="filterParams"
      ></table-owener-accuracy>
    </datablau-dialog>
    <!-- 筛选面板 -->
    <filter-panel
      @filter-change="handleFilterChange"
      @open-empty-table="showEmptyFilter = true"
      :class="{ 'is-sticky': isSticky }"
      ref="filterPanel"
    ></filter-panel>

    <!-- 占位元素，防止吸顶时内容跳动 -->
    <div v-show="isSticky" :style="{ height: filterPanelHeight + 'px' }"></div>

    <!-- 三重要月度变化趋势图 -->
    <div class="chart-container">
      <h3>三要素月度变化趋势图</h3>
      <trend-chart
        ref="trendChartDom"
        :filter-params="filterParams"
      ></trend-chart>
    </div>

    <!-- 表格区域 -->
    <div class="tables-container">
      <div
        class="detection-table-row"
        style="margin-bottom: 20px"
        v-loading="tableDataLoading"
      >
        <div class="detection-table-col">
          <h3>各业务域准确性排名</h3>
          <datablau-table :data="tableData" style="width: 100%" :height="350">
            <el-table-column
              label="业务域"
              prop="buName"
              width="120"
              sortable
            ></el-table-column>
            <el-table-column
              label="准确性"
              prop="dataIntegrityRate"
              width="120"
              sortable
            ></el-table-column>
          </datablau-table>
        </div>
        <div class="detection-table-col">
          <h3>各业务域完整性排名</h3>
          <datablau-table :data="tableData" style="width: 100%" :height="350">
            <el-table-column
              label="业务域"
              prop="buName"
              width="120"
              sortable
            ></el-table-column>
            <el-table-column
              label="完整性"
              prop="accuracyRate"
              width="120"
              sortable
            ></el-table-column>
          </datablau-table>
        </div>
        <div class="detection-table-col">
          <h3>各业务域有效性排名</h3>
          <datablau-table :data="tableData" style="width: 100%" :height="350">
            <el-table-column
              label="业务域"
              prop="buName"
              width="120"
              sortable
            ></el-table-column>
            <el-table-column
              label="有效性"
              prop="validityRate"
              width="120"
              sortable
            ></el-table-column>
          </datablau-table>
        </div>
      </div>
      <div class="detection-table-row">
        <div class="detection-table-col2">
          <h3>负责人统计维度指标详情</h3>
          <owner-count-index-table
            ref="ownerCountIndexTableDom"
            :filter-params="filterParams"
          ></owner-count-index-table>
        </div>
        <div class="detection-table-col2">
          <h3>业务域统计维度指标详情</h3>
          <business-domain-count-index-table
            ref="buCountIndexTableDom"
            :filter-params="filterParams"
          ></business-domain-count-index-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FilterPanel from './components/filterPanel.vue'
import TrendChart from './components/trendChart.vue'
import AccuracyTable from './components/accuracyTable.vue'
import CompletenessTable from './components/completenessTable.vue'
import EffectivenessTable from './components/effectivenessTable.vue'
import ownerCountIndexTable from './components/ownerCountIndexTable.vue'
import businessDomainCountIndexTable from './components/businessDomainCountIndexTable.vue'
import tableOwenerAccuracy from './components/tableOwenerAccuracy.vue'
import {
  buSimpleData,
  users,
} from '@/view/metadataQualityDetection/components/mockData'

export default {
  components: {
    FilterPanel,
    TrendChart,
    AccuracyTable,
    CompletenessTable,
    EffectivenessTable,
    ownerCountIndexTable,
    businessDomainCountIndexTable,
    tableOwenerAccuracy,
  },
  data() {
    return {
      mock: false,
      filterParams: {
        responsiblePerson: [],
        responsiblePersonNames: [],
        businessDomain: [],
        businessDomainNames: [],
        statisticalPeriod: undefined,
      },
      tableData: [],
      tableDataLoading: false,
      isSticky: false,
      filterPanelHeight: 0,
      showEmptyFilter: false,
    }
  },
  methods: {
    handleFilterChange(params, prop) {
      // 更新筛选参数
      this.filterParams = { ...params }
      this.$nextTick(() => {
        if (prop === 'time') {
          this.$refs.trendChartDom.fetchChartData()
          this.fetchBuTableData()
          this.$refs.buCountIndexTableDom.refreshTable()
          this.$refs.ownerCountIndexTableDom.refreshTable()
        } else if (prop === 'user') {
          this.$refs.trendChartDom.fetchChartData()
          this.$refs.ownerCountIndexTableDom.refreshTable()
          this.$refs.tableOwenerAccuracyDom.refreshTable()
        } else if (prop === 'bu') {
          this.$refs.trendChartDom.fetchChartData()
          this.fetchBuTableData()
          this.$refs.buCountIndexTableDom.refreshTable()
          this.$refs.tableOwenerAccuracyDom.refreshTable()
        }
      })
    },
    fetchBuTableData() {
      this.tableDataLoading = true
      const params = {
        startTime: this.filterParams.statisticalPeriod,
        endTime: this.filterParams.statisticalPeriod,
        buName: this.filterParams.businessDomainNames,
      }
      this.$http
        .post('/assets/checkResult/simple/bu/ac/rate', params)
        .then(res => {
          this.tableData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableData = []
        })
        .finally(() => {
          this.tableDataLoading = false
        })
    },
    handleScroll() {
      const scrollTop = this.$refs.container.scrollTop
      if (scrollTop > 20 && !this.isSticky) {
        this.isSticky = true
      } else if (scrollTop <= 20 && this.isSticky) {
        this.isSticky = false
      }
    },
  },
  mounted() {
    // 获取筛选面板高度，用于创建占位元素
    this.$nextTick(() => {
      this.filterPanelHeight = this.$refs.filterPanel.$el.offsetHeight
    })
    this.fetchBuTableData()
  },
}
</script>

<style lang="scss" scoped>
.metadata-quality-detection {
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  .chart-container {
    margin-top: 20px;
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .tables-container {
    margin-top: 20px;

    .detection-table-row {
      display: flex;
      justify-content: space-between;

      .detection-table-col {
        width: 32%;
        background-color: #fff;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }
      .detection-table-col2 {
        width: 49%;
        background-color: #fff;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .table-container {
    margin-top: 20px;
    .table-accuracy {
      background-color: #fff;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
  }

  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 500;
  }

  // 筛选面板吸顶样式
  /deep/ .filter-panel.is-sticky {
    position: sticky;
    top: -20px;
    left: 0;
    right: 0;
    z-index: 1000;
    border-radius: 0;
    transition: all 0.3s;
    // padding: 10px 20px;
  }
}
</style>
