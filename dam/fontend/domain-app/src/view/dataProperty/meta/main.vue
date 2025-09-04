<template>
  <div class="outer-box">
    <list
      ref="meta-list"
      @node-click="handleModelClick"
      @showModelCompareJob="showModelCompareJob"
      @showModelCompare="showProductionModelCompare"
      @showModelHistory="showModelHistory"
      @showCategoryDetail="showCategoryDetail"
      @showModelExport="showModelExport"
      @tree-ready="handleTreeReady"
      class="list-box"
    ></list>
    <div
      class="meta-resize-column-middle"
      :style="{ left: $i18n.locale === 'zh' ? '280px' : '320px' }"
    ></div>
    <div
      class="meta-right-box"
      :style="{
        left: $i18n.locale === 'zh' ? '280px' : '320px',
        'z-index': 2,
      }"
    >
      <items
        :key="
          modelId +
          (currentModel && currentModel.schema ? currentModel.schema : '')
        "
        :modelId="modelId"
        :model="currentModel"
        :expand="true"
        @itemClick="handleItemClick"
        v-if="showDetailStatus === 'showMetaList' && !showAllSouce"
        class="items"
        ref="items"
        :hideListFilter="hideListFilter"
        :hideListCheckbox="hideListCheckbox"
        @showModelCompare="showProductionModelCompare"
        @showModelCompareJob="showModelCompareJob"
      ></items>
      <all-souce
        v-if="showAllSouce"
        @showModelCompareJob="showModelCompareJob"
        @showModelCompare="showProductionModelCompare"
        @showModelHistory="showModelHistory"
        @showCategoryDetail="showCategoryDetail"
        @showModelExport="showModelExport"
        @showUpdate="showUpdate"
      ></all-souce>
      <downloadTab
        v-if="showDetailStatus === 'modelExport'"
        :modelId="modelId"
        :schemas="schemas"
        @showModel="showModel"
      ></downloadTab>
      <div
        v-if="showModelCompareBox && showDetailStatus !== 'compare'"
        class="model-item-page-title"
      >
        <datablau-breadcrumb
          v-if="showDetailStatus === 'difference'"
          :node-data="[
            {
              name: $t('meta.DS.treeSubOperation.modelDiff'),
              couldClick: false,
            },
          ]"
          @back="close"
        ></datablau-breadcrumb>
        <datablau-breadcrumb
          v-if="showDetailStatus === 'productionModelDifference'"
          :node-data="[
            { name: $t('meta.DS.allSource.metaDataDiff'), couldClick: false },
          ]"
          @back="close"
        ></datablau-breadcrumb>
        <datablau-breadcrumb
          v-if="showDetailStatus === 'categoryDetail'"
          :node-data="[
            {
              name: $version.modelCategory.systemDetail.title,
              couldClick: false,
            },
          ]"
          @back="close"
        ></datablau-breadcrumb>
        <datablau-breadcrumb
          v-if="showDetailStatus === 'modelDetail'"
          :node-data="[
            {
              name: $t('meta.DS.treeSubOperation.datasourceDetail'),
              couldClick: false,
            },
          ]"
          @back="close"
        ></datablau-breadcrumb>
        <el-button
          type="text"
          size="small"
          @click="skip2Job"
          style="float: right; margin-right: 1em"
          v-if="showDetailStatus === 'difference'"
        >
          {{ $t('meta.DS.treeSubOperation.viewTask') }}
        </el-button>
      </div>
      <div
        id="model-compare-box"
        v-if="showModelCompareBox && showDetailStatus !== 'compare'"
      >
        <difference-report
          ref="difference-report"
          v-if="showDetailStatus === 'difference' && !showAllSouce"
          :sourceData="sourceData"
          :key="differenceReportKey"
        ></difference-report>
        <model-compare
          v-if="
            showDetailStatus === 'productionModelDifference' &&
            modelTree &&
            !showAllSouce
          "
          :model-tree="modelTree"
          :sourceData="sourceData"
          :sourceDataArr="sourceDataArr"
          key="sourceData"
        ></model-compare>
        <category-detail
          v-else-if="showDetailStatus === 'categoryDetail'"
          :categoryId="sourceData.id"
          :key="differenceReportKey"
        ></category-detail>
      </div>
      <div
        id="model-compare-box2"
        v-if="showModelCompareBox && showDetailStatus === 'compare'"
      >
        <difference-report-self
          v-if="showDetailStatus === 'compare'"
          :sourceData="sourceData"
          :key="differenceReportKey"
          @close="close"
        ></difference-report-self>
      </div>
    </div>
    <table-details
      v-if="currentObjectType && currentObjectId"
      :key="currentObjectId"
      :objectId="currentObjectId"
      :objectTypeMaybe="currentObjectType"
      :object="currentObject"
      :expand="true"
      :loadedTagsBefore="loadedTags"
      class="details"
      @close="goBack"
    >
      <div class="navigator" style="">
        <span class="d-return icon-i-return" @click="goBack">
          {{ $t('common.button.return') }}
        </span>
      </div>
    </table-details>
    <standard-selector :isColumn="true"></standard-selector>
    <index-selector></index-selector>
    <code-select></code-select>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import './main.scss';
</style>
