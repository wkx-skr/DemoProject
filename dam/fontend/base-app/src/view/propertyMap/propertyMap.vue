<template>
  <div id="network-box">
    <div id="network1" v-show="level === 'category'"></div>
    <div id="network2" v-if="level === 'table'"></div>
    <img
      src="./img/logo.png"
      v-show="$showOurLogo && fullScreen"
      alt=""
      style="position: absolute"
    />
    <div style="position: absolute"></div>
    <div
      style="position: absolute; left: 20px; top: 77px"
      v-show="level === 'table'"
    >
      <div class="hand-bag" @click="moveToCategoryLevel" title="返回系统视图">
        <i class="fa fa-reply"></i>
      </div>
    </div>
    <div
      style="
        position: absolute;
        left: 10px;
        bottom: 10px;
        color: #d6d6d6;
        border-radius: 4px;
      "
      :key="zoneMapKey"
      v-show="level === 'category'"
    >
      <div style="position: relative">
        <div
          style="
            position: absolute;
            left: 0;
            bottom: 0;
            top: 0;
            right: 0;
            left: 0;
            opacity: 0.7;
            background-color: #343436;
            border-top: 2px solid #3b85ff;
            z-index: 0;
          "
        ></div>
        <div style="padding: 10px; z-index: 2; position: relative">
          <template v-for="k in zoneMapKeys">
            <div
              :style="{ background: colors[zoneMap[k.name]] }"
              style="
                width: 10px;
                height: 10px;
                border-radius: 3px;
                margin-top: 1em;
                margin-right: 0.5em;
                position: relative;
                display: inline-block;
              "
            ></div>
            {{ k.name.replace('\uEE99', '') }} ({{ zoneCnt[k.name] }})
            <br />
          </template>
        </div>
      </div>
    </div>
    <div
      style="
        position: absolute;
        left: 10px;
        bottom: 10px;
        color: #ddd;
        padding: 10px;
        border-radius: 4px;
      "
      v-show="level === 'table'"
    >
      <div>图中共有{{ tableCnt }}张表</div>
      <br />
      <el-switch
        active-text="中文表名"
        inactive-text="英文表名"
        v-model="tableNameLang"
        active-value="ch"
        inactive-value="en"
        inactive-color="#409EFF"
        @change="handleTableNameLangChange"
      ></el-switch>
    </div>
    <div id="tool-bar">
      <div class="icon-btn single"><i class="fa fa-user-o"></i></div>
      <div
        class="icon-btn"
        v-if="!fullScreen"
        @click="setFrameToFullScreen"
        title="全屏"
      >
        <i class="fa fa-arrows-alt"></i>
      </div>
      <div class="icon-btn" v-else @click="setFrameToWindow" title="退出全屏">
        <i class="fa fa-window-close-o"></i>
      </div>
      <div class="icon-btn" @click="reDraw" title="重绘">
        <i class="fa fa-dot-circle-o"></i>
      </div>
    </div>
    <div id="search-bar">
      <el-autocomplete
        v-model="keyword"
        class="transparent"
        :fetch-suggestions="querySearch"
        popper-class="autoClass"
        clearable
        :key="autoCompleteKey"
        placeholder="搜索"
        :trigger-on-focus="false"
        @select="handleSelect"
      ></el-autocomplete>
      <i v-if="!keyword" class="fa fa-search"></i>
      <i v-else class="el-icon-close" @click="keyword = ''"></i>
    </div>
    <div id="detail-box">
      <category-detail
        v-if="detailType === 'category'"
        :detail="modelCategoryDetail"
      ></category-detail>
      <table-detail
        v-if="detailType === 'table'"
        :detail="tableDetail"
        :key="tableDetailKey"
      ></table-detail>
      <etl-detail
        v-if="detailType === 'etl'"
        :detail="etlDetail"
        :key="etlDetailKey"
      ></etl-detail>
    </div>
    <div id="big-detail-box">
      <system-detail
        v-if="detailType === 'edge'"
        :detail="systemDetail"
        :key="systemDetailKey"
      ></system-detail>
    </div>
    <table-level-graph
      :data="tableLevelData"
      ref="tableLevelGraph"
      v-if="level === 'table'"
    ></table-level-graph>
  </div>
</template>

<script>
import code from './propertyMap.js'
export default code
</script>

<style scoped lang="scss">
@import './graph.scss';
@import './box.scss';
</style>
<style lang="scss">
.el-autocomplete.transparent {
  .el-input input.el-input__inner {
    background-color: transparent;
    border: none;
  }
  input {
    line-height: 32px;
    height: 32px;
    width: 292px;
    text-indent: 0.5em;
    color: #fff;
  }
}
</style>
