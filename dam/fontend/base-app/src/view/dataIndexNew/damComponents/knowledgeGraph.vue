<template>
  <!-- 动态扩展节点 -->
  <div class="content" style="position: relative">
    <div id="kg">
      <div class="content-search" style="height: 50px">
        <div class="left-content">
          <el-form
            class="st-page-form"
            label-position="right"
            label-width=""
            ref="searchForm"
            :inline="true"
            :model="searchFormData"
            :class="{thema: thema === 'black'}"
          >
            <el-form-item>
              <el-radio-group
                class="screen-switch-radio"
                v-model="displayType"
                size="mini"
                @change="displayTypeChange"
                style="margin-right: 10px"
                :class="{'screen-switch-radio-black': thema === 'black'}"
              >
                <el-radio-button label="1">
                  <i class="iconfont icon-layouta"></i>
                </el-radio-button>
                <el-radio-button label="2">
                  <i class="iconfont icon-layoutb"></i>
                </el-radio-button>
                <el-radio-button label="table">
                  <i class="fa fa-table" style="font-size: 16px;"></i>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.nodeType')"
              prop="stateValue"
            >
              <datablau-select-weak
                style="width: 100px"
                ref="nodeOptionsSelect"
                :optionsData="{
                  data: searchFormData.nodeOptions,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
                @change="nodeOptionsValueChange"
                multiple
                v-model="nodeOptionsValue"
                :placeholder="$t('meta.DS.tableDetail.knowledgeGraph.all')"
                :themeBlack="thema === 'black'"
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.relationType')"
              prop="stateValue"
              v-if="app !== 'archy'"
            >
              <datablau-select-weak
                style="width: 100px"
                ref="relationshipSelect"
                :optionsData="{
                  data: searchFormData.relationshipOptions,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
                @change="relationshipValueChange"
                multiple
                v-model="relationshipValue"
                :placeholder="$t('meta.DS.tableDetail.knowledgeGraph.all')"
                :themeBlack="thema === 'black'"
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.level')"
              prop="stateValue"
            >
              <datablau-select-weak
                ref="hierarchySelect"
                v-model="hierarchyValue"
                :placeholder="$t('meta.common.pleaseSelect')"
                style="width: 70px"
                :optionsData="{
                  data: searchFormData.hierarchy,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
                :themeBlack="thema === 'black'"
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item label="同级数目">
              <datablau-select
                ref="siblingsSelect"
                v-model="maxSibling"
                style="width: 100px"
                :themeBlack="thema === 'black'"
              >
                <el-option :value="100" label="不限制"></el-option>
                <el-option :value="10" label="最大值10"></el-option>
                <el-option :value="5" label="最大值5"></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.direction')"
              prop="stateValue"
            >
              <datablau-select-weak
                ref="directionSelect"
                v-model="directionValue"
                :placeholder="$t('meta.common.pleaseSelect')"
                :style="{ width: name === 'assets' ? '80px' : '150px' }"
                :optionsData="{
                  data: searchFormData.direction,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
                :themeBlack="thema === 'black'"
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item v-if="thema !== 'black' && app !== 'archy' && !isAssets">
              <add-relation
                ref="addRelation"
                @update-graph="handleUpdateGraph"
                :typeNameArr="typeNameArr"
              ></add-relation>
            </el-form-item>
            <el-form-item>
              <datablau-button
                class="iconfont icon-search"
                @click="callSearchPane"
                :themeBlack="thema === 'black'"
              >
                搜索
              </datablau-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="right-content" :class="{rightThema:thema === 'black'}" v-if="app!=='archy'">
          <span style="font-size: 12px; line-height: 40px">
            {{ $t('meta.DS.tableDetail.knowledgeGraph.updateTime')
            }}{{
              lastUpdateTime !== null ? $timeFormatter(lastUpdateTime) : '--'
            }}
          </span>
        </div>
        <!-- <div class="right-content">
              <el-radio v-model="displayType" label="1">左右布局</el-radio>
              <el-radio v-model="displayType" label="2">中心布局</el-radio>
              <el-radio v-model="displayType" label="3">文本显示</el-radio>
          </div> -->
      </div>
      <div class="noresult" v-show="noresultState === false">
        <div class="noresult-img">
          <img src="/static/kgimg/noresult.svg" alt="" />
          <p>
            {{ $t('meta.DS.tableDetail.noData') }}
          </p>
        </div>
      </div>
      <div v-show="noresultState === true" v-loading="loadingKg" :style="{marginTop: thema === 'black' ? '40px' : '0'}">
        <!--width,height 画布的宽度，高度。 可以是百分比或像素，一般在dom元素上设置 -->
        <div
          id="network_id"
          class="network"
          style="height: 70vh; background: #f7f7f7"
          :style="{height: thema === 'black' ? '46vh' : '70vh',background: thema === 'black' ? '#1A1A1A' : '#f7f7f7'}"
        ></div>
        <!-- <div id="detail-box" v-show="false" :class="{'is-width':isWidth}">
        </div> -->
        <div id="detail-box" v-show="false" :class="{ 'is-width': isWidth ,'detail-box-black':thema === 'black'}" :style="{top:thema === 'black' ? '94px' : '60px'}">
          <p class="title">
            {{ $t('meta.DS.tableDetail.knowledgeGraph.nodeInfo') }}
          </p>
          <div class="ul-box">
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.Name') }}
            </p>
            <p class="value">{{ nodesArrayDetail.Name }}</p>
          </div>
          <div class="ul-box">
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.alias') }}
            </p>
            <p class="value">{{ nodesArrayDetail.alias }}</p>
          </div>
          <!-- <div class="ul-box">
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.type') }}
            </p>
            <p class="value">
              {{ typeNameArrName(nodesArrayDetail.typeId) }}({{
                nodesArrayDetail.typeId
              }})
            </p>
          </div> -->
          <div class="ul-box">
            <p class="key">来源</p>
            <p class="value" v-if="nodesArrayDetail.path">
              {{ nodesArrayDetail.path.join('/') }}
            </p>
          </div>
          <div
            class="ul-box"
            v-if="
              nodesArrayDetail.Type !== '82800018' &&
              nodesArrayDetail.Type !== '82800010'
            "
          >
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.desc') }}
            </p>
            <el-tooltip
              v-if="nodesArrayDetail.description !== ''"
              class="item"
              effect="dark"
              :content="nodesArrayDetail.description"
              placement="bottom-start"
            >
              <p
                class="value"
                style="
                  max-height: 194px;
                  overflow: hidden;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 7;
                "
              >
                {{ nodesArrayDetail.description }}
              </p>
            </el-tooltip>
          </div>
          <div v-show="app !== 'archy'"  v-if="nodesArrayDetail.typeId === '80000005' ||  nodesArrayDetail.typeId === '80500008' ||  nodesArrayDetail.typeId === '80010118'||  nodesArrayDetail.typeId === '80010119' || nodesArrayDetail.typeId === '80000004' ||nodesArrayDetail.typeId === '82800009' || nodesArrayDetail.typeId === '82800012' ||nodesArrayDetail.typeId === '80010001'">
            <div
              class="detailButton"
              @click="goDetail(nodesArrayDetail)"
              v-if="
                nodesArrayDetail.level !== 0 &&
                (!nodesArrayDetail.isOpen || nodesArrayDetail.isOpen !== 'false')
              "
            >
              <p>
                {{ $t('meta.DS.tableDetail.knowledgeGraph.detail') }}
              </p>
            </div>
          </div>
        </div>
        <div id="detail-box2" v-show="false" :class="{ 'is-width': isWidth,'detail-box-black':thema === 'black' }" :style="{top:thema === 'black' ? '94px' : '60px'}">
          <p class="title">
            {{ $t('meta.DS.tableDetail.knowledgeGraph.relationInfo') }}
          </p>
          <div class="ul-box">
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.type') }}
            </p>
            <p class="value">{{ edgesArrayDetail.relationName }}</p>
          </div>
          <div class="ul-box">
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.desc') }}
            </p>
            <el-tooltip
              v-if="edgesArrayDetail.description !== ''"
              class="item"
              effect="dark"
              :content="edgesArrayDetail.description"
              placement="bottom-start"
            >
              <p
                class="value"
                style="
                  max-height: 194px;
                  overflow: hidden;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 7;
                "
              >
                {{ edgesArrayDetail.description }}
              </p>
            </el-tooltip>
          </div>
        </div>
        <div id="detail-box3" v-show="false" :style="{top:thema === 'black' ? '94px' : '60px'}" :class="{'detail-box-black':thema === 'black' }">
          <p class="title">模糊搜索</p>
          <datablau-input
            v-model="searchKeyword"
            placeholder="请输入关键字"
            style="margin-left: 20px; width: 260px"
            :themeBlack="thema === 'black'"
          ></datablau-input>
          <div
            style="
              position: absolute;
              bottom: 20px;
              left: 20px;
              right: 20px;
              top: 100px;
            "
          >
            <datablau-table
              :data="searchResult"
              :show-header="false"
              height="100%"
              @row-click="handleRowClick"
              :cell-style="{ cursor: 'pointer' }"
              :themeBlack="thema === 'black'"
            >
              <el-table-column :width="40" align="right">
                <template slot-scope="scope">
                  <img
                  v-if="app === 'archy' && scope.row.type === '80010001'"
                    :src="'static/kgimg/' + '80010001-1' + '.svg'"
                    style="width: 24px"
                    alt=""
                  />
                  <img
                  v-else-if="app === 'archy' && scope.row.type === '80010076'"
                    :src="'static/kgimg/' + '80010076-1' + '.svg'"
                    style="width: 24px"
                    alt=""
                  />
                  <img
                  v-else
                    :src="'static/kgimg/' + scope.row.type+ '.svg'"
                    style="width: 24px"
                    alt=""
                  />

                  <!-- <img
                    :src="'static/kgimg/' + scope.row.type + '.svg'"
                    style="width: 24px"
                    alt=""
                  /> -->
                </template>
              </el-table-column>
              <el-table-column prop="label" show-overflow-tooltip>
                <!--                <template slot-scope="scope">-->
                <!--                  <div style="cursor: pointer">-->
                <!--                    {{ scope.row.label }}-->
                <!--                  </div>-->
                <!--                </template>-->
              </el-table-column>
            </datablau-table>
          </div>
        </div>
        <div id="legend-box" style="line-height: 12px;" v-if="!listMode">
          <div style="height: 16px; background-color: #f6f6f6"
               :style="{background: thema === 'black' ? '#222222' : '#f6f6f6'}">
            <i
              v-if="showContent"
              @click="re"
              class="fa fa-backward"
              style="
                float: right;
                cursor: pointer;
                color: #969696;
                margin-right: 2px;
              "
            ></i>
            <span v-else style="color: #969696; cursor: pointer" @click="re">
              <span
                style="
                  position: relative;
                  display: inline-block;
                  vertical-align: top;
                  font-size: 12px;
                  line-height: 12px;
                "
              >
                {{ $t('meta.DS.tableDetail.knowledgeGraph.legend') }}&nbsp;
              </span>
              <i
                class="fa fa-forward"
                style="
                  float: right;
                  cursor: pointer;
                  color: #969696;
                  margin-right: 2px;
                  display: inline-block;
                  vertical-align: top;
                  font-size: 12px;
                  line-height: 12px;
                "
              ></i>
            </span>
          </div>
          <div
            style="
              padding: 10px;
              padding-top: 2px;
              z-index: 2;
              background-color: #f6f6f6;
              position: relative;
              color: #d6d6d6;
            "
            :style="{background: thema === 'black' ? '#222222' : '#f6f6f6'}"
            v-show="showContent"
          >
            <div v-for="(k, index) in typeArr" :key="index" class="legend-item">
              <!-- <div
                :style="{background:colorArr[k]}"
                style="width:10px;height:10px;border-radius:3px;margin-right:0.5em;position:relative;display:inline-block;">
              </div> -->
              <p>
                <img
                v-if="app === 'archy' && k === '80010001'"
                  style="width: 30px; height: 30px; margin-right: 0.5em"
                  :src="'static/kgimg/' + '80010001-1' + '.svg'"
                  alt=""
                />
                <img
                v-else-if="app === 'archy' && k === '80010076'"
                  style="width: 30px; height: 30px; margin-right: 0.5em"
                  :src="'static/kgimg/' + '80010076-1' + '.svg'"
                  alt=""
                />
                <img
                v-else
                  style="width: 30px; height: 30px; margin-right: 0.5em"
                  :src="'static/kgimg/' + k + '.svg'"
                  alt=""
                />
                <span :style="{color: thema === 'black' ? '#bbbbbb' : '#888888'}">{{ typeNameArr[k] }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <list-data
        v-show="listMode"
        style="
          position: absolute;
          top: 50px;
          left: 0;
          right: 0;
          bottom: -3px;
          background-color: #fff;
        "
        :list-data="nodesArrayInitial"
        :themeBlack="thema === 'black'"
        :app="app"
      ></list-data>
    </div>
  </div>
</template>
<script>
import Main from './knowledgeGraph/main.js'
export default Main
</script>
<style lang="scss">
@import './knowledgeGraph/main';
.screen-switch-radio {
  // vertical-align: super;
  margin-bottom: 1px;

  .el-radio-button .el-radio-button__inner {
    padding: 9px 10px;
  }

  .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 2px 0 0 2px;
  }

  .el-radio-button .el-radio-button__inner {
    padding: 7px 10px;
  }

  .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 0px 2px 2px 0px;
  }

  .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 2px 0px 0px 2px;
  }

  .el-radio-button__orig-radio:checked+.el-radio-button__inner i::before {
    color: #409EFF;
  }

  .el-radio-button:last-child .el-radio-button__orig-radio:checked+.el-radio-button__inner {
    // border-left: 1px solid #409EFF;
    border-left: 1px solid transparent;
  }

  .el-radio-button:last-child .el-radio-button__inner {
    border-left: 1px solid transparent;
  }

  .el-radio-button__orig-radio:checked+.el-radio-button__inner {
    border-color: #409EFF;
    background: #edf4ff;
  }
  &.screen-switch-radio-black{
    .el-radio-button__inner{
      background: transparent;
      border-color: #666;
      color: #bbbbbb;
    }
    .el-radio-button__orig-radio:checked+.el-radio-button__inner {
      border-color: #187FFF;;
      background: rgba(24, 127, 255, .2);
    }
  }
}
.thema{
  .el-form-item{
    margin-bottom: 6px !important;
  }
}
.left-content{
  .el-form-item__content{
    line-height: 32px;
  }
  .el-input__inner::placeholder{
    color: #bbb !important;
  }
  .el-select:hover .el-input__inner{
    border-color: #409eff;
  }

}

</style>
