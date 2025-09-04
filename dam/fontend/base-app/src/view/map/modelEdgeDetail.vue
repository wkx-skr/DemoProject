<template>
  <div>
    <div class="map-detail">
      <div
        class="map-title oneline-eclipse"
        :title="from.model + ' >> ' + to.model"
      >
        {{ from.model }}
        <i class="fa fa-arrow-right"></i>
        {{ to.model }}
      </div>
      <div class="list-box" style="top: 80px">
        <el-tabs v-model="activeName">
          <el-tab-pane
            :label="$t('meta.map.tableLineage')"
            name="lineage"
          ></el-tab-pane>
        </el-tabs>
        <div class="list-content">
          <auto-table
            :data="lineage"
            :tableProp="tableProp"
            @row-click="handleRowClick"
          ></auto-table>
          <!--<el-table-column-->
          <!--prop="to.model"-->
          <!--label="目标模型"-->
          <!--show-overflow-tooltip-->
          <!--&gt;</el-table-column>-->
          <!--<el-table-column-->
          <!--prop="to.tab"-->
          <!--label="目标表"-->
          <!--show-overflow-tooltip-->
          <!--&gt;</el-table-column>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import autoTable from './autoTable.vue'
export default {
  props: ['rawData'],
  components: { autoTable },
  data() {
    return {
      activeName: 'lineage',
      from: this.rawData.from.detail,
      to: this.rawData.to.detail,
      lineage: this.rawData.lineage,
      tableProp: [
        {
          width: 10,
        },
        {
          label: '#',
          width: 37,
          index: true,
        },
        {
          label: this.$t('meta.map.sourceTable'),
          prop: 'fromTab',
        },
        {
          label: this.$t('meta.map.targetTable'),
          prop: 'toTab',
        },
      ],
    }
  },
  mounted() {},
  methods: {
    handleRowClick(row) {
      this.$emit('row-click', {
        objectId: row.fromTabId,
        physicalName: row.fromTab,
      })
    },
  },
}
</script>

<style scoped lang="scss">
.label {
  width: 5em !important;
}
.category-detail {
  height: (128+25) px;
  padding: 25px 20px;
  color: #ccc;
  h2 {
    font-size: 16px;
    color: #fff;
    font-weight: normal;
  }
  p {
    color: #ccc;
    margin-top: 1em;
    text-align: justify;
    line-height: 1.5em;
  }
  .item {
    font-size: 14px;
    margin-top: 1em;
    line-height: 1.5em;
    .label {
      display: inline-block;
      font-weight: bold;
      width: 5em;
      text-align: right;
    }
    .detail {
      margin-left: 0.5em;
      display: inline-block;
      vertical-align: top;
    }
  }
}
</style>
