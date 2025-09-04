<template>
  <div>
    <div class="category-detail" style="padding-right: 0px">
      <h2>
        {{ $modelCategoriesMap[detail.cat.from] }}
        <i class="fa fa-arrow-right"></i>
        {{ $modelCategoriesMap[detail.cat.to] }}
      </h2>
      <br />
      <h2 v-if="detail.call && detail.call.length > 0">系统接口</h2>
      <el-table
        v-if="detail.call && detail.call.length > 0"
        style="margin-left: -20px; margin-right: -20px"
        :data="detail.call"
        class="transparent-table"
        highlight-current-row
        border
      >
        <el-table-column label="#" :width="40">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column
          prop="callType"
          label="引用方式"
          :width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="calleeModelName"
          label="数据库名称"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="resourceName"
          label="资源名称"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="description"
          label="功能说明"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
      <br />
      <h2 v-if="detail.lineage && detail.lineage.length > 0">表级血缘</h2>
      <el-table
        v-if="detail.lineage && detail.lineage.length > 0"
        style="margin-left: -20px; margin-right: -20px"
        :data="detail.lineage"
        class="transparent-table"
        highlight-current-row
      >
        <el-table-column label="#" :width="40">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column
          prop="from.model"
          label="源模型"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="from.tab"
          label="源表"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="to.model"
          label="目标模型"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="to.tab"
          label="目标表"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'systemDetail',
  props: ['detail'],
  mounted() {
    this.$nextTick(() => {
      Ps.initialize($('#big-detail-box')[0])
    })
  },
  beforeDestroy() {
    Ps.destroy($('#big-detail-box')[0])
  },
}
</script>

<style scoped lang="scss">
@import './detail.scss';
.label {
  width: 5em !important;
}
</style>
