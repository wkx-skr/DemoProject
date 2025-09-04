<template>
  <div class="citic-card-tabs new-style model-graph-container">
    <datablau-dialog
      width="240"
      :title="$store.state.$v.dataEntity.viewDetails"
      append-to-body
      close-on-click-modal
      :visible.sync="viewDialog.visible"
    >
      <datablau-table
        class="datablau-table"
        :show-header="false"
        :data="[{key: $store.state.$v.tagMgr.name, value: viewDialog.data.Name}, {key: $store.state.$v.dataEntity.definition, value: viewDialog.data.Definition},{key: 'SQL', value: viewDialog.data.SQL}]">
        <el-table-column prop="key" :width="120"></el-table-column>
        <el-table-column prop="value">
          <template slot-scope="scope">
            <div v-html="scope.row.value"></div>
          </template>
        </el-table-column>
      </datablau-table>
      <el-button style="margin-top:1em;" size="small" @click="viewDialog.visible = false">
        {{ $store.state.$v.report.close }}
      </el-button>
    </datablau-dialog>
    <slot name="publish"></slot>
    <!--<div v-if="currentId !== 0 && showEREdit" class="edit-model-btn" @click.stop="goEditPage(currentModel)">
      <img :src="editImg"/>
      <span>编辑主题</span>
    </div>-->
    <datablau-tabs
      :type="from === 'tables' ? 'card' : ''"
      class="detail-wrapper "
      :class="{hideAfter:tables.length === 0 && from === 'tables','report-outer-tabs':from === 'tables'}"
      v-model="currentTab"
      @edit="tabChange"
      @tab-remove="removeTab">

      <!--实体关系图-->
      <!--模型详情 实体/表 tab 不展示-->
      <el-tab-pane
        v-if="from !== 'tables'"
        :label="$store.state.$v.erGraph.erGraph"
        key="graph"
        name="graph"
      >
        <div class="model-graph-page">
          <el-dialog :title="dialog.title" width="600px" :visible.sync="dialog.visible" append-to-body>
            <el-table
              :data="dialog.data"
              class="datablau-table"
              :show-header="false">
              <el-table-column property="key" label="" width="100"></el-table-column>
              <el-table-column label="">
                <template slot-scope="scope">
                  <span v-html="nl2br(scope.row.value)"></span>
                </template>
              </el-table-column>
            </el-table>
          </el-dialog>
          <div id="container" v-loading="loading" :element-loading-text="loadingText"
               :class="{fixed:fixed, 'show-report': showReport}">
            <div id="consa-graph"></div>
            <!--          <div id="loading-box" v-if="loading"><i class="el-icon-loading"></i></div>-->
            <!--<div style="position:absolute;top:20px;left:20px;height: 40px;line-height: 40px;">
              <div style="float:left;background: #fff;border-radius: 4px;box-shadow: 0px 0px 10px rgba(123, 123, 123, 0.16);">
                <el-dropdown
                  placement="bottom-start"
                  @command="beforeHandleCommand">
                  <span class="el-dropdown-link">
                    <el-button-group>
                      <el-button
                        style="position:relative;top:2px;"
                        size="small"
                        :title="$v.erGraph.viewType"
                    >
                      <i class="icon--37--7"></i>
                      </el-button>
                    </el-button-group>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="dataType">
                      <el-checkbox :value="showDataType"></el-checkbox>
                      {{$store.state.$v.erGraph.dataType}}</el-dropdown-item>
                    <el-dropdown-item command="allColumn" divided>
                      <el-checkbox :value="showAllColumn"></el-checkbox>
                      {{$store.state.$v.erGraph.allColumn}}
                    </el-dropdown-item>
                    <el-dropdown-item command="keyColumn">
                      <el-checkbox :value="showKeyColumn"></el-checkbox>
                      {{$store.state.$v.erGraph.keyOnly}}</el-dropdown-item>
                    <el-dropdown-item command="noColumn">
                      <el-checkbox :value="showNoColumn"></el-checkbox>
                      {{$store.state.$v.erGraph.noColumn}}</el-dropdown-item>
                    <el-dropdown-item divided v-if="!isDesignModel" command="logicalName">
                      <el-checkbox :value="showLogicalName"></el-checkbox>
                      {{$store.state.$v.erGraph.logicalName}}</el-dropdown-item>
                    <el-dropdown-item v-if="!isDesignModel" command="physicalName">
                      <el-checkbox :value="showPhysicalName"></el-checkbox>
                      {{$store.state.$v.erGraph.physicalName}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button-group>
                  <el-button
                    size="small"
                    style="position:relative;top:-2px;"
                    @click="changeFullScreen"
                    :title="$store.state.$v.erGraph.fullScreen"
                  ><i :class="{'icon-42':!fixed,'icon-22':fixed}"></i></el-button>
                  <el-button
                    @click="toggleShowOutline"
                    size="small"
                    style="position:relative;top:-2px;"
                    :title="$store.state.$v.erGraph.navigator"
                  >
                    <i class="icon-41"></i>
                  </el-button>
                </el-button-group>
                <el-button-group>
                  <el-button
                    size="small"
                    :title="$store.state.$v.erGraph.dataRules"
                    @click="handleDataReportChange"
                    style="position:relative;top:-2px;margin-left: 10px;"
                    class="data-standard">
                    <i class="icon-43"></i>
                  </el-button>
                  <el-button
                    size="small"
                    title="自动布局"
                    class="icon--38--3 space-white"
                    @click="doLayout"
                  >
                  </el-button>
                  <el-button
                    size="small"
                    @click="exportGraph"
                    v-show="false"
                  >
                    <i class="el-icon-download" style="font-weight:bold;font-size:14px;"></i>
                  </el-button>
                </el-button-group>
              </div>
              <i style="position: absolute;right: 230px; top: 13px;z-index: 1;font-size: 16px;" class="icon-17"></i>
              <el-select
                v-model="value9"
                filterable
                remote
                reserve-keyword
                clearable
                :placeholder="$store.state.$v.erGraph.tip"
                :remote-method="remoteMethod"
                size="small"
                style="width:260px;margin-left:1em;position: relative;top: -1px;color: #20293B;"
                class="search-panel"
                @change="handleSelect"
              >
                <el-option
                  v-for="item in options4"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div> -->
            <div class="drap-box" :class="{fixed:fixed}">
              <datablau-button
                style="min-width: auto;height: 30px;margin-left: 10px;"
                type="secondary"
                class="button-container iconfont"
                :class="fixed ? 'icon-suoxiao' : 'icon-fangda1'"
                @click="changeFullScreen"
                :title="$store.state.$v.erGraph.fullScreen">
              </datablau-button>
              <datablau-select
                v-model="value9"
                filterable
                remote
                reserve-keyword
                clearable
                :placeholder="$store.state.$v.erGraph.tip"
                :remote-method="remoteMethod"
                size="small"
                style="width:240px;height:30px;margin-left:10px;"
                isIcon="iconfont icon-search"
                class="search-panel"
                @change="handleSelect"
              >
                <el-option
                  v-for="item in options4"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </datablau-select>
              <datablau-button
                type="secondary"
                size="small"
                style="height: 30px;margin-left: 10px;vertical-align: middle;line-height: 30px;"
                :title="$store.state.$v.erGraph.dataRules"
                @click="handleDataReportChange"
                class="data-standard iconfont icon-menu-blsx">
                数据规范
              </datablau-button>
              <datablau-dropdown
                class="filter-drop"
                :hide-on-click="false"
                trigger="click"
                placement="bottom-start"
                @command="beforeHandleCommand"
                ref="filterDropDown">
                <div class="el-dropdown-link right-line" :class="{relative:!toolSelection}">
                  <datablau-button
                    type="secondary"
                    style="height: 30px;margin-left: 10px;min-width: unset;"
                    size="small">
                    <img style="position: relative;top: -2px;" :src="showTypeImg" draggable="false" alt=""/>
                  </datablau-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="dataType">
                      <el-checkbox :value="showDataType"></el-checkbox>
                      字段数据类型
                    </el-dropdown-item>
                    <el-dropdown-item command="allColumn" divided>
                      <el-checkbox :value="showAllColumn"></el-checkbox>
                      显示所有字段
                  </el-dropdown-item>
                  <el-dropdown-item command="keyColumn">
                    <el-checkbox :value="showKeyColumn"></el-checkbox>
                    仅显示键字段</el-dropdown-item>
                  <el-dropdown-item command="noColumn">
                    <el-checkbox :value="showNoColumn"></el-checkbox>
                    仅显示表名</el-dropdown-item>
                  <el-dropdown-item divided command="logicalName">
                    <el-checkbox :value="showLogicalName"></el-checkbox>
                    业务名称</el-dropdown-item>
                  <el-dropdown-item command="physicalName">
                    <el-checkbox :value="showPhysicalName"></el-checkbox>
                    物理名称</el-dropdown-item>
                </el-dropdown-menu>
                <p v-show="toolSelection" class="disc">筛选</p>
              </div>
            </datablau-dropdown>
            <datablau-button
              size="small"
              type="secondary"
              class="icon--38--3"
              style="margin-left: 10px;"
              @click="doLayout"
              tooltipContent="自动布局"
            >
            </datablau-button>
          </div>
          <div class="report-container" :class="{'show-outline': showOutline}">
            <!-- <el-table></el-table> -->
            <datablau-button @click="handleDataReportChange" style="float: right;margin-right: 20px;position: relative;z-index: 1;" type="icon" class="iconfont icon-false"></datablau-button>
            <div class="report-data">
              <datablau-tabs v-model="currentReportType" @tab-click="handleReportTypeChange">
                <el-tab-pane name="ERROR">
                  <span slot="label"><span style="color:#D86344; margin-right: 5px;"><i class="el-icon-error"></i> </span>{{$store.state.$v.erGraph.error}}({{reportWrongData.length}})</span>
                </el-tab-pane>
                <el-tab-pane label="警告" name="WARN">
                  <span slot="label"><span style="color:#E99929; margin-right: 5px;"><i class="el-icon-warning"></i></span> {{$store.state.$v.erGraph.warning}}({{reportWarningData.length}})</span>
                </el-tab-pane>
                <el-tab-pane label="提示" name="INFO">
                  <span slot="label"><span style="margin-right: 5px;"><i class="el-icon-info" style="color:#4D82B8;"></i></span> {{$store.state.$v.erGraph.tips}}({{reportTipsData.length}})</span>
                </el-tab-pane>
              </datablau-tabs>
              <div class="tablbe-conta">
                <datablau-table
                  ref="table"
                  class="el-table"
                  :data="reportShowData"
                  :stripe="true"
                  :height="reportTableHeight"
                  header-row-class-name="table-head-row"
                  header-cell-class-name="table-header-cell"
                  :row-class-name="getTableRowClass"
                  cell-class-name="table-cell"
                  @row-click="handleRowClick"
                >
                  <el-table-column
                    :label="$store.state.$v.erGraph.index"
                    type="index"
                    width="100"
                  ></el-table-column>
                  <el-table-column
                    prop="name"
                    :label="$store.state.$v.dataEntity.type"
                    width="100"
                  >
                    <template slot-scope="scope">
                      {{reportTypeMap[scope.row.l]}}
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$store.state.$v.report.description"
                    prop="m"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="p"
                    :label="$store.state.$v.erGraph.obj"
                    show-overflow-tooltip
                  ></el-table-column>
                </datablau-table>
              </div>
            </div>
          </div>
          <div :class="['outline-container', {shrink: shrink}, {'show-report': showReport}]" v-show="showOutline">
            <div class="navigator-header" :class="{'small-width': shrink}" @click="shrink = !shrink"><span class="name">导航栏</span><div class="icon-box"><i class="el-icon-arrow-left"></i><i class="el-icon-arrow-left"></i></div></div>
            <div id="graph-outline" class="graph-outline"></div>
            <div class="bottom-line"></div>
            <div v-show="!shrink" class="none-before search-pn">
              <el-input-number :min="10" :max="1000" :step="50" :controls="false" @change="sliderChange" ref="scaleInput1" v-model="scale"></el-input-number><span>%</span>
            </div>
            <div class="resize-wrapper">
              <div class="img-wrapper" style="margin-right: 10px;" @click="minView">
                <!--              <img :src="reduceImg" />-->
                <i class="el-icon-remove-outline"></i>
              </div>

              <el-slider class="slider-wrapper" :format-tooltip="formatTooltip" :min="10" :max="1000" :step="50"
                         v-model="scale" @change="sliderChange"></el-slider>
              <div class="img-wrapper" style="margin-left: 10px;" @click="maxView">
                <!--              <img :src="plusImg" />-->
                <i class="el-icon-circle-plus-outline"></i>
              </div>
            </div>
          </div>
          </div>
        </div>
      </el-tab-pane>

      <!--实体表-->
      <el-tab-pane
        v-show="showTabOfTables"
        v-if="currentId"
        :label="$store.state.$v.dataEntity.entity"
        key="tables"
        name="tables"
      >
        <tables
          ref="partTables"
          v-if="dataReady"
          :current-name="currentName"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :current-id="currentId"
          :isLogicalModel="isLogicalModel"
          :isConceptual="isConceptual"
          :isView="isView"
          :diagramsLoading="diagramsLoading"
          @handleDialogData="showTabDetail"
          @handleDialogDataEdit="editTabDetail"
          @updateVersion="updateVersion"
          @showViewDetail="showViewDetail"
        ></tables>
      </el-tab-pane>
      <el-tab-pane
        v-else
        :label="isLogicalModel ? $store.state.$v.modelDetail.dataEntityList : $store.state.$v.modelDetail.tableList"
        key="tables"
        name="tables"
      >
        <tables
          ref="tables"
          :current-name="isLogicalModel ? $store.state.$v.modelDetail.dataEntityList : $store.state.$v.modelDetail.tableList"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :current-id="0"
          :isLogicalModel="isLogicalModel"
          :isConceptual="isConceptual"
          :isView="isView"
          :diagramsLoading="diagramsLoading"
          @handleDialogData="showTabDetail"
          @handleDialogDataEdit="editTabDetail"
          @updateVersion="updateVersion"
          @showViewDetail="showViewDetail"
        ></tables>
      </el-tab-pane>
      <el-tab-pane
        v-for="(v,k) in tables"
        :label="tabLabelFormatter(v)"
        closable
        :ref="String(k)"
        :key="String(k)"
        :name="tabLabelFormatter(v)">
        <table-details
          :key="v.tableMsg.Id"
          :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
          :rawData="v"
          :current-model="currentModel"
          :data-by-type="dataByType"
          :isLogicalModel="isDesignModel"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          @updateTabName="updateTabName"
          @updateVersion="updateVersion"
          @updateTableData="updateTableData"
        >
        </table-details>
      </el-tab-pane>
    </datablau-tabs>
  </div>
</template>

<script>
import modelGraph from './modelGraph.js'
export default modelGraph
</script>
<style lang="scss" scoped="scoped">
  @import './scoped';
  .datablau-select /deep/ .el-select .el-input input {
    height: 30px;
    line-height: 30px;
  }
  #container {
    top: 10px;
    overflow: visible;
    &.fixed {
      top: 0;
      #consa-graph {
        top: 40px;
      }
    }
  }
  .citic-card-tabs.new-style {
    .detail-wrapper.datablau-tabs {
      top: 0;
    }
    /deep/ .report-outer-tabs.datablau-tabs > .el-tabs {
      position: absolute;
      top: -5px;
      left: 2px;
      right: 0;
      bottom: 0;

      & > .el-tabs__header {
        padding-left: 8px;

        .el-tabs__nav > .el-tabs__item {
          border-left: 1px solid #ddd !important;
          font-size: 12px;

          &.is-active {
            border-color: #409eff !important;
            color: #409EFF !important;
          }

          &:first-child {
            // padding-left: 20px;
            font-size: 16px;
            color: #555;
            line-height: 40px;
            border: none !important;
            vertical-align: baseline;
            margin-right: 1px;

            &:after {
              content: '/';
              margin-left: 5px;
              display: inline-block;
              color: #ddd;
            }
          }

          & + .el-tabs__item {
            margin-left: 5px;
          }
        }
      }

      & > .el-tabs__content {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      }
    }
  /deep/ .hideAfter.datablau-tabs {
    .el-tabs__item:first-child {
      color: #555 !important;
    }
    .el-tabs__item::after {
      display: none !important;
    }

    & > .el-tabs {
      & > .el-tabs__header {
        .el-tabs__nav > .el-tabs__item {
          &.is-active {
            color: #555!important;
          }
        }
      }
    }
  }
  /deep/ .hideTab.datablau-tabs {
    .el-tabs__nav > .el-tabs__item:first-child {
      color: #555 !important;

      &::after {
        display: none !important;
      }
    }
  }
    /deep/ .datablau-tabs .el-tabs {
      position: absolute;
      top: 0px;
      left: 0;
      right: 0;
      bottom: 0;
      .el-tabs__header {
        padding-left: 20px;
        padding-right: 20px;
        .el-tabs__nav > .el-tabs__item {
          font-size: 14px;
          line-height: 28px;
          height: 28px;
          .el-icon-close {
            top: -2px;
            font-size: 14px;
          }
        }
      }
      .el-tabs__content {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
  }
  #consa-graph {
    /*margin-top: 50px;*/
    top: 30px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
  .el-dropdown-menu {
    padding: 6px 0;
  }
  .el-dropdown-menu__item {
    padding: 0 10px;
  }
  .el-dropdown-menu__item--divided:before {
    display: none;
  }
  .el-dropdown-menu__item--divided {
    margin-top: 0;
  }
  .el-dropdown-menu__item {
    font-size: 12px;
  }
  .el-input--small /deep/ .el-input__inner {
    height: 30px;
    line-height: 30px;
  }
  .drap-box {
    position: absolute;
    top: -6px;
    left: 10px;
    background: #fff;
    height: 30px;
    display: flex!important;
    align-items: center;
    /*border-bottom: 1px solid #efefef;*/
    /deep/ .el-select .el-input input {
      padding-left: 23px;
    }
    &.fixed {
      top: 5px;
    }
  }
  .edit-model-btn {
    position: absolute;
    right: 20px;
    top: -35px;
    z-index: 2;
    box-sizing: border-box;
    padding: 7px 10px;
    border: 1px solid #539FFD;
    font-size: 12px;
    line-height: 1;
    color: #539FFD;
    display: inline-block;
    border-radius: 2px;
    white-space: nowrap;
    img {
      width: 12px;
      margin-right: 8px;
    }
    span {
      vertical-align: top;
    }
    cursor: pointer;
  }
  .el-select /deep/ input {
    border-color: #ddd;
    padding-left: 35px;
    padding-right: 20px;
    height: 30px;
    line-height: 30px;
    border-radius: 2px;
  }
  .search-pn {
    margin-left: 20px;
    width: 86px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    & > i {
      flex: 0 0 auto;
      &:nth-child(2) {
        margin-left: 5px;
      }
    }
    & > span {
      position: relative;
      left: -3px;
      bottom: 1px;
      flex: 0 0 auto;
      color: #555;
    }
    .el-input-number {
      position: relative;
      top: -7px;
      margin-left: 5px;
      width: 25px;
      height: 100%;
      text-align: right;
    }
    /deep/ .el-input__inner {
      border: none;
      height: 100%;
      padding: 0;
      background: unset;
      color: #555;
    }
  }
  .outline-container {
    width:242px;
    height:234px;
    position: absolute;
    right: 32px;
    bottom: 32px;
    transition: all .2s;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 2px;
    box-shadow: 0px 2px 6px 0px rgba(85,85,85,0.20);
    &.show-report {
      bottom: 322px;
    }
    .navigator-header {
      width: 240px;
      padding: 0 0 0 10px;
      line-height: 26px;
      color: #3A3E44;
      font-size: 12px;
      cursor: pointer;
      background: #f5f5f5;
      border: 1px solid rgba(0,0,0,0.15);
      border-radius: 2px 2px 0px 0px;
      &.small-width {
        width: 83px;
      }
      // opacity: 0.9;
      .name {
        margin-right: 5px;
        line-height: 26px;
        display: inline-block;
      }
      img {
        width: 8px;
        margin-right: 5px;
      }
      .triangle {
        margin-right: 10px;
        height: 26px;
        display: inline-block;
        vertical-align: middle;
        float: right;
        span {
          display: inline-block;
          width: 0;
          height: 0;
          border: 6px solid transparent;
          border-right-color: #969696;
          vertical-align: middle;
        }
        span:last-child {
          margin-left: -6px;
        }
      }
      .icon-box {
        margin-right: 10px;
        height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        float: right;
        i:last-child {
          margin-left: -8px;
        }
      }
    }
    .bottom-line {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 26px;
      height: 1px;
      background: rgba(0,0,0,0.15);
    }
    .resize-wrapper {
      position: absolute;
      bottom: -7px;
      left: 80px;
      right: 0px;
      font-size: 12px;
      & > .img-wrapper {
        position: relative;
        top: -2px;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        width: 10px;
        user-select: none;
        &:hover > i {
          color: #409eff;
        }
        img {
          width: 10px;
          vertical-align: middle;
        }
        i {
          font-size: 14px;
          vertical-align: middle;
        }
        &:before {
          position: absolute;
          content: '';
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
        }
      }
      .slider-wrapper {
        display: inline-block;
        width: 100px;
        vertical-align: middle;
      }
      .el-icon-remove-outline, .el-icon-circle-plus-outline{
        color: #999;
      }
    }
    &.shrink {
      width: 80px;
      height: 26px;
      overflow: hidden;
      .triangle {
        transform: rotate(180deg);
      }
      .resize-wrapper {
        display: none;
      }
    }
    /deep/ {
      .el-slider__runway {
        height: 4px;
        border-radius: 2px;
        background-color: #EAEAEA;
      }
      .el-slider__button {
        width: 14px;
        height: 14px;
        box-shadow: 0px 0px 6px rgba(31, 26, 47, 0.16);
        background-color: #fff;
        border: none;
      }
      .el-slider__button-wrapper {
        top: -16px;
      }
    }
    .search-pn {
      margin: 0;
      position: absolute;
      left: 10px;
      bottom: 1px;
      justify-content: unset;
      width: 56px;
      height: 20px;
      border: 1px solid #ddd;
      border-radius: 2px;
    }

    .el-input-number {
      margin-right: 5px;
      top: -11px;
    }
  }

</style>
<style lang="scss">
  @import './graph';
</style>
