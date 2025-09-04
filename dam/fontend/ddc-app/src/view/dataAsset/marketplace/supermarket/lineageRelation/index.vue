<template>
  <div>
    <!-- 血缘关系 -->
    <div class="fieldMessage-title" style="margin: 20px 0">
      <p class="message-title">
        {{ $t('meta.DS.tableDetail.lineage.ana') }}
      </p>
    </div>
    <table-in-view
      v-if="summary"
      :objectId="objectId"
      :view-detail="summary"
      :key="objectId"
      @lineageFromApiTables="handleLineageFromApiTables"
    ></table-in-view>
    <div
      class="fieldMessage-title"
      v-if="
        $featureMap.FE_LINEAGE &&
        lineageFromApiTables &&
        lineageFromApiTables.lineage &&
        apiTablesLoaded
      "
    >
      <p class="message-title">
        {{ $t('meta.DS.tableDetail.lineage.label') }}
      </p>
    </div>
    <consanguinity-graph
      style="position: relative; height: 100%"
      v-show="
        $featureMap.FE_LINEAGE &&
        lineageFromApiTables &&
        lineageFromApiTables.lineage &&
        apiTablesLoaded
      "
      :key="'l' + objectId"
      ref="consanguinityGraph-view"
      :lineageData="lineageFromApiTables"
      :object-id="objectId"
      :data="{ objectId: objectId }"
    ></consanguinity-graph>
  </div>
</template>

<script>
import index from './index.js'
export default index
</script>

<style></style>
