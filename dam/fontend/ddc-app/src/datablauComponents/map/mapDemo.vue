<template>
  <div id="neo-container" :class="{ simply: this.dataName }">
    <div id="neo-top-name">
      {{ this.dataName }}
    </div>
    <div id="neo-top">
      <el-input
        v-model="keyword"
        size="mini"
        style="width: 160px"
        @keydown.native.enter="getDataBySearch"
        placeholder="请输入精确关键词"
        clearable
      ></el-input>
      <el-button type="text" size="mini" @click="getDataBySearch">
        搜索
      </el-button>

      <span class="gun">|</span>
      <el-checkbox v-model="showColumn">显示字段</el-checkbox>
      <!--<span class="gun">|</span>-->
      <!--<el-button type="text" size="mini" @click="getAllRelationsByQuery">get all relations</el-button>-->
      <span class="gun">|</span>

      <el-button type="text" size="mini">
        <span
          class="icon-btn"
          v-if="!fullScreen"
          @click="setFrameToFullScreen"
          title="全屏"
          ref="fullScreen"
        >
          <i class="fa fa-arrows-alt"></i>
          全屏显示
        </span>
        <span
          class="icon-btn"
          v-else
          @click="setFrameToWindow"
          title="退出全屏"
        >
          <i class="fa fa-window-close-o"></i>
          退出全屏
        </span>
      </el-button>
      <el-button type="text" size="mini"></el-button>
    </div>
    <div id="neo-legend">
      <div class="legend-item">表</div>
      <div class="legend-item">视图</div>
      <div class="legend-item">字段</div>

      <el-checkbox class="item" border size="small" v-model="checked.column">
        备选项
      </el-checkbox>
      <el-checkbox class="item" border size="small" v-model="checked.table">
        备选项
      </el-checkbox>
    </div>
    <div id="neo-left">
      <div
        class="left-btn"
        :class="{ checked: mode === 'graph' }"
        @click="mode = 'graph'"
      >
        <i class="fa fa-object-group"></i>
        <!--<svg class="SVGInline-svg" style="width: 20px;height: 20px;margin-top:10px;" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" height="24" width="24" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" viewBox="0 0 24 24">
          <path id="path6" d="m14.168 20.262c1.5956-0.43742 3.0565-1.299 4.2481-2.5295 1.5691-1.6212 2.5109-3.7173 2.7171-5.9502l-0.77521-0.0716c-0.19069 2.0587-1.057 3.9889-2.5015 5.4809-1.0943 1.1309-2.433 1.9201-3.8939 2.3202l0.20548 0.7503zm3.679-16.835c-2.453-2.1528-5.785-2.847-8.8343-1.9014l0.2304 0.7433c2.7919-0.8655 5.8409-0.2304 8.0899 1.7434l0.514-0.5853zm-13.648 1.5621c-2.819 3.8496-2.4758 9.2955 0.8601 12.742 0.27163 0.28019 0.55728 0.54249 0.85615 0.78454l0.4904-0.605c-0.2748-0.223-0.5371-0.463-0.7869-0.721-3.0713-3.173-3.388-8.1955-0.7916-11.741l-0.6281-0.4597zm13.051 9.9125c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm-1.3045 1.6843c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm-8.0377-2.85c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm-1.0873-1.969c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm4.843-9.3981c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm1.7512 0.72695c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm-7.131 4.1734c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm0.10274 2.1894c0.29732 0.30666 0.29732 0.80478 0 1.1114-0.29732 0.30666-0.7791 0.30666-1.0764 0-0.29732-0.30666-0.29732-0.80478 0-1.1114 0.29732-0.30666 0.7791-0.30666 1.0764 0zm6.253 7.1707c1.4329 1.4796 1.4329 3.8846 0 5.3642-1.4259 1.4726-3.732 1.4726-5.1571 0-1.4329-1.4796-1.4329-3.8846 0-5.3642 1.4259-1.4726 3.732-1.4726 5.1571 0l0.55883-0.54093c-1.7318-1.7886-4.5446-1.7886-6.2756 0-1.7248 1.7816-1.7248 4.6652 0 6.4468 1.7318 1.7886 4.5446 1.7886 6.2756 0 1.7248-1.7816 1.7248-4.6652 0-6.4468l-0.55961 0.54093zm-4.1394-14.897c0.95266 0.9838 0.95266 2.584 0 3.5678-0.94566 0.97679-2.4727 0.97679-3.4184 0-0.95266-0.9838-0.95266-2.584 0-3.5678 0.94566-0.97679 2.4727-0.97679 3.4184 0l0.5596-0.5417c-1.2515-1.2928-3.2853-1.2928-4.5368 0-1.2445 1.2858-1.2445 3.3647 0 4.6505 1.2515 1.2928 3.2853 1.2928 4.5368 0 1.2445-1.2858 1.2445-3.3647 0-4.6505l-0.5596 0.5417zm11.541 3.6767c1.7536 1.8119 1.7536 4.754 0 6.5659-1.7466 1.8041-4.5734 1.8041-6.32 0-1.7536-1.8119-1.7536-4.754 0-6.5651 1.7465-1.8041 4.5734-1.8041 6.32 0l0.55961-0.54171c-2.0524-2.1201-5.386-2.1201-7.4384 0-2.0454 2.1131-2.0454 5.5346 0 7.6478 2.0524 2.1201 5.386 2.1201 7.4384 0 2.0454-2.1131 2.0454-5.5346 0-7.6478l-0.56 0.5417z"></path>
        </svg>-->
        <h2>图</h2>
      </div>
      <div
        class="left-btn"
        :class="{ checked: mode === 'table' }"
        @click="mode = 'table'"
      >
        <i class="fa fa-table"></i>
        <h2>实体</h2>
      </div>
      <!--<div class="left-btn " :class="{checked:mode==='relation'}" @click="mode='relation'">
        <i class="fa fa-link"></i>
        <h2>关系</h2>
      </div>-->
    </div>
    <div id="neo-main">
      <div
        style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #f9fbfd;
        "
        id="myNetwork"
      ></div>
      <div
        v-show="mode === 'table'"
        style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
        "
      >
        <div
          class="item-detail"
          v-for="i in searchResult"
          v-html="itemDetailFormatter(i)"
        ></div>
        <span v-if="!searchResult || searchResult.length === 0">
          暂无搜索结果
        </span>
      </div>
      <div
        v-show="mode === 'relation'"
        style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
        "
      >
        <div
          class="item-detail"
          v-for="i in relationsResult"
          v-html="itemDetailFormatter(i)"
        ></div>
        <span v-if="!relationsResult || relationsResult.length === 0">
          暂无搜索结果
        </span>
      </div>
    </div>
    <div id="neo-detail-box" v-show="showDetailBox">
      <datablau-catalog-detail
        v-if="currentNode && currentType === 'catalog'"
        :key="currentNode.name"
        :catalog-name="currentNode.name"
      ></datablau-catalog-detail>
      <!--{{currentNode}}-->
      <datablau-table-detail
        v-if="currentNode && currentType === 'meta'"
        :key="currentNode.objectId"
        :objectId="currentNode.objectId"
      ></datablau-table-detail>
    </div>
    <!--<div v-for="i in searchResult">{{i}}</div>-->
  </div>
</template>
<script>
import mapDemo from './mapDemo'
export default mapDemo
</script>
<style lang="scss" scoped>
@import './mapDemo';
</style>
