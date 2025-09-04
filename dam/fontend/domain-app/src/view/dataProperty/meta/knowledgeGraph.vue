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
          >
            <el-form-item>
              <el-radio-group
                class="screen-switch-radio"
                v-model="displayType"
                size="mini"
                @change="displayTypeChange"
                style="margin-right: 10px"
              >
                <el-radio-button label="1">
                  <i class="iconfont icon-layouta"></i>
                </el-radio-button>
                <el-radio-button label="2">
                  <i class="iconfont icon-layoutb"></i>
                </el-radio-button>
                <el-radio-button label="table">
                  <i class="fa fa-table"></i>
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
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.relationType')"
              prop="stateValue"
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
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item label="同级数目">
              <datablau-select
                ref="siblingsSelect"
                v-model="maxSibling"
                style="width: 100px"
              >
                <el-option :value="0" label="不限制"></el-option>
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
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item>
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
              >
                搜索
              </datablau-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="right-content">
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
          <img src="static/kgimg/noresult.svg" alt="" />
          <p>
            {{ $t('meta.DS.tableDetail.noData') }}
          </p>
        </div>
      </div>
      <div v-show="noresultState === true" v-loading="loadingKg">
        <!--width,height 画布的宽度，高度。 可以是百分比或像素，一般在dom元素上设置 -->
        <div
          id="network_id"
          class="network"
          style="height: 70vh; background: #f7f7f7"
        ></div>
        <!-- <div id="detail-box" v-show="false" :class="{'is-width':isWidth}">
        </div> -->
        <div id="detail-box" v-show="false" :class="{ 'is-width': isWidth }">
          <p class="title">
            {{ $t('meta.DS.tableDetail.knowledgeGraph.nodeInfo') }}
            <span
              v-if="
                nodesArrayDetail.properties &&
                nodesArrayDetail.properties.state === 'X'
              "
            >
              （已废弃）
            </span>
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
          <div class="ul-box">
            <p class="key">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.type') }}
            </p>
            <p class="value">
              {{ typeNameArrName(nodesArrayDetail.typeId) }}({{
                nodesArrayDetail.typeId
              }})
            </p>
          </div>
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
          <div
            class="detailButton"
            @click="goDetail(nodesArrayDetail)"
            v-if="
              nodesArrayDetail.level !== 0 &&
              (!nodesArrayDetail.isOpen ||
                nodesArrayDetail.isOpen !== 'false') &&
              isDamAsset(nodesArrayDetail)
            "
          >
            <p>
              {{ $t('meta.DS.tableDetail.knowledgeGraph.detail') }}
            </p>
          </div>
        </div>
        <div id="detail-box2" v-show="false" :class="{ 'is-width': isWidth }">
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
        <div id="detail-box3" v-show="false">
          <p class="title">模糊搜索</p>
          <datablau-input
            v-model="searchKeyword"
            placeholder="请输入关键字"
            style="margin-left: 20px; width: 260px"
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
            >
              <el-table-column :width="40" align="right">
                <template slot-scope="scope">
                  <img
                    :src="'static/kgimg/' + scope.row.type + '.svg'"
                    style="width: 24px"
                    alt=""
                  />
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
        <div id="legend-box" v-if="!listMode">
          <div style="height: 12px; background-color: #f6f6f6">
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
              <span style="position: relative; top: -2px">
                {{ $t('meta.DS.tableDetail.knowledgeGraph.legend') }}&nbsp;
              </span>
              <i
                class="fa fa-forward"
                style="
                  float: right;
                  cursor: pointer;
                  color: #969696;
                  margin-right: 2px;
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
            v-show="showContent"
          >
            <div v-for="(k, index) in typeArr" :key="index" class="legend-item">
              <!-- <div
                :style="{background:colorArr[k]}"
                style="width:10px;height:10px;border-radius:3px;margin-right:0.5em;position:relative;display:inline-block;">
              </div> -->
              <p>
                <img
                  style="width: 30px; height: 30px; margin-right: 0.5em"
                  :src="'static/kgimg/' + k + '.svg'"
                  alt=""
                />
                <span>{{ typeNameArr[k] }}</span>
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
          bottom: 0;
          background-color: #fff;
        "
        :list-data="nodesArrayInitial"
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
</style>
