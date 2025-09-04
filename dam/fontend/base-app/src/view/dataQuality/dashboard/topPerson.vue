<template>
  <div class="box">
    <div class="box-label">
      {{ $t('quality.page.dataQualityDashboard.topPerson') }}
    </div>
    <div class="table-container">
      <datablau-table :data="tableData">
        <el-table-column
          :width="$i18n.locale === 'zh' ? 50 : 60"
          :label="$t('quality.page.dataQualityDashboard.ranking')"
          align="center"
        >
          <template slot-scope="scope">
            <span class="grey">{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="user"
          :width="$i18n.locale === 'zh' ? '' : 90"
          :label="$t('quality.page.dataQualityDashboard.handler')"
        >
          <template slot-scope="scope">
            {{ scope.row.user }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalCnt"
          :width="$i18n.locale === 'zh' ? 100 : 180"
          :label="$t('quality.page.dataQualityDashboard.solveTotal')"
        ></el-table-column>
        <el-table-column
          prop="recentCnt"
          :width="$i18n.locale === 'zh' ? '' : 90"
          :label="$t('quality.page.dataQualityDashboard.lastMonth')"
        ></el-table-column>
      </datablau-table>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    rootData: {
      required: true,
      type: Object,
    },
    nameMapping: {
      required: false,
      type: Object,
    },
  },
  components: {},
  data() {
    /* if (this.rootData.userTop) {
      this.$utils.sort.sort(this.rootData.userTop, 'totalCnt')
    } */
    return {
      tableData: this.rootData.userTop || [],
    }
  },
  methods: {},
}
</script>
<style scoped lang="scss">
$grey: #9096a3;
@import './dashboard.scss';
.box {
  background: var(--default-bgc);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 3px;
}
.box-label {
  position: absolute;
  left: 20px;
  top: 12px;
  font-size: 15px;
}
.table-container {
  position: absolute;
  top: 48px;
  left: 10px;
  right: 10px;
  bottom: 10px;
}
</style>
<style lang="scss">
$grey: #9096a3;
.tp-table {
  &::before {
    display: none;
  }
  font-size: 12px;
  thead {
    color: var(--table-head-bgc);
  }
  td {
    padding: 8px 0;
  }
  th {
    padding: 6px 0;
  }
  tr:last-child {
    td {
      border-bottom: none;
    }
  }
  .grey {
    color: $grey;
  }
}
</style>
