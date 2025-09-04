<template>
  <div id="network-box">
    <div
      id="category-network"
      class="network-container"
      v-show="level === 'category'"
    ></div>
    <div
      id="source-network"
      class="network-container"
      v-show="level === 'source'"
    ></div>
    <div id="legend-box" v-show="level === 'category'">
      <category-legend @legend-click="handleLegendClick"></category-legend>
    </div>
    <div
      style="position: absolute; left: 20px; top: 27px"
      v-show="level === 'source'"
    >
      <div class="hand-bag" @click="back" title="返回系统视图">
        <i class="fa fa-reply"></i>
      </div>
    </div>
    <div id="tool-bar" :key="toolbarKey">
      <!--<datablau-tooltip
        style="vertical-align: top; padding-top: 5px"
        content="动画效果"
        placement="bottom"
        effect="dark"
      >
        <datablau-switch
          style="
            display: inline-block;

            padding-right: 5px;
          "
          v-model="physicsSwitchValue"
          @change="changePhysicsSwitch"
        ></datablau-switch>
      </datablau-tooltip>-->

      <span id="search-box">
        <input
          ref="search-com"
          :disabled="false"
          type="text"
          :placeholder="$t('meta.map.searchSysTablePlaceholder')"
          v-model="keyword"
          @keydown.enter="search"
        />
        <span class="icon-btn" style="float: right" @click="search">
          <i class="el-icon-search"></i>
        </span>
      </span>
      <span class="icon-btn" @click="reDraw" :title="$t('meta.map.reDraw')">
        <i class="fa fa-dot-circle-o"></i>
      </span>
      <span
        class="icon-btn"
        v-if="!fullScreen"
        @click="setFrameToFullScreen"
        :title="$t('meta.map.fullScreen')"
        ref="fullScreen"
      >
        <i class="fa fa-arrows-alt"></i>
      </span>
      <span
        class="icon-btn"
        v-else
        @click="setFrameToWindow"
        :title="$t('meta.map.Esc')"
      >
        <i class="fa fa-window-close-o"></i>
      </span>
    </div>
    <div id="detail-box" v-show="false" :class="{ 'is-width': isWidth }">
      <category-detail
        v-if="detailType === 'category'"
        :key="details.categoryId"
        :data="details"
        :system-call-overview="systemCallOverview"
        @row-click="handleRowClick"
        @jump-to-source="handleEntityClick"
        @show-model-detail="showModelDetail"
      ></category-detail>
      <model-detail
        v-if="detailType === 'model'"
        :key="details.modelId"
        @row-click="handleRowClick"
        :data="details"
      ></model-detail>
      <edge-detail
        v-if="detailType === 'edge'"
        :rawData="details"
        @row-click="handleRowClick"
        :key="detailsKey"
      ></edge-detail>
      <model-edge-detail
        v-if="detailType === 'modelEdge'"
        :rawData="details"
        :key="detailsKey"
        @row-click="handleRowClick"
      ></model-edge-detail>
      <search-detail
        v-if="detailType === 'search'"
        :keyword="keyword"
        @findCategory="findCategory"
        @row-click="handleRowClick"
      ></search-detail>
    </div>
    <lineage-graph
      id="lineage-box"
      ref="lineageBox"
      @close="showLineage = false"
      @resetFullScreen="resetFullScreen"
      v-if="showLineage"
      :key="lineageObject.objectId"
      :object="lineageObject"
    ></lineage-graph>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import './main.scss';
</style>
<style lang="scss">
@import './detail.scss';
</style>
