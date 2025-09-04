<template>
  <el-container id="model-edit" v-loading="loading.status" :element-loading-text="loading.text" style="user-select:none;width: 100%;">
    <el-container>
      <el-main v-if="permissionReady" v-loading="!permissionReady">
        <model-graph-edit
          v-if="currentPane==='tables' && dataByType.udp"
          :current-id="diagramId"
          :currentPane="currentPane"
          editorType="model"
          current-name="数据实体"
          from="tables"
          key="tables"
          :data="data"
          :data-by-type="dataByType"
          :modelId="currentModel.id"
          :currentModel="currentModel"
          @hideTabs="hideTabsChange"
          :disabledEdit="true"
        >
        </model-graph-edit>
        <model-graph-edit
          v-else-if="currentPane.indexOf('diagram')===0"
          :current-id="diagramId"
          :currentPane="currentPane"
          editorType="model"
          :current-name="diagramName"
          from="graph"
          :key="diagramId"
          :data="data"
          ref="modelGraphReference"
          :data-by-type="dataByType"
          :modelId="currentModel.id"
          :currentModel="currentModel"
          :diagrams="diagrams"
          :diagram="diagram"
          :preDiagrams="preDiagrams"
          :mapIdToDiagramData="mapIdToDiagramData"
          :sumElementNum="sumElementNum"
          :searchPanelExist="searchPanelExist"
          :loading="loading"
          :showViewButton="showViewButton"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          :isLogical="isLogical"
          :isConceptual="isConceptual"
          :entityTotal="entityTotal"
          :isShowSchema="showSchema"
          :transformData="transformData"
          @hideTabs="hideTabsChange"
          @modelLoading="handleModelLoading"
          @handleTopTileChange='handleTopTileChange'
          @handleTopHeaderChange="handleTopHeaderChange"
          :disabledEdit="true"
        >
          <el-header slot="header" v-if="!isRenderTopHeader" v-show="showTopTilte"  ref="erHeader" style="height:30px;padding:0;line-height: 50px;z-index:4" >
            <div class="top-title-box" >
              <div class="infomes-box">
                <div class="user-info">
                  <i class="iconfont icon-schema"></i><span class="text oneline-eclipse">{{$store.state.user.username}}</span>
                </div>
                <datablau-button style="height: 20px;line-height: 20px;border-radius: 10px;margin-left: 5px;" type="important" size="mini" @click="exit">退出编辑</datablau-button>
              </div>
              <div :title="currentModel.Name" class="model-header">
                <span style="position: relative;top: 2px;" class="tree-icon model"></span>
                <span class="model-name"><span>{{currentModel.Name}}</span><i style="margin-left: 10px;" title="编辑" class="iconfont icon-bianji" @click="editModelInfo()"></i></span>
              </div>
              <el-popover
                v-model="popoverVisible"
                placement="bottom-start"
                width="320"
                trigger="click"
                :append-to-body="false"
                style=""
                class="diagram-tree-wrapper"
              >
                <div v-loading="!diagrams" style="margin-bottom: 0.6em">
                  <div class="title" style="margin-left: 16px;margin-right: 16px;height: 46px;display: flex;align-items: center;">
                    <img style="margin-right: 4px;" :src="diagramImg1" alt="">
                    <span style="margin-right: 4px;font-size: 12px;font-weight: normal;">{{$store.state.$v.modelDetail.theme}}</span>
                    <datablau-button type="icon" class="iconfont icon-tianjia" style="flex: 0 0 auto;margin-left: 208px;cursor: pointer;" @click.stop="addDiagram()"></datablau-button>
                  </div>
                  <datablau-tree
                    v-if="diagrams && diagrams.length"
                    class="grey-tree model-edit"
                    :data="diagrams"
                    ref="themeTree"
                    :key="diagramKey"
                    :props="{label: 'Name', id: 'Id'}"
                    :render-content="renderContent"
                    @node-click="handleDiagramClick"
                    :filter-node-method="filterNode"
                    :expand-on-click-node="true"
                    node-key="Id"
                  ></datablau-tree>
                </div>
                <div slot="reference">
                  <div class="title" :title="diagramPath" style="height: 30px;display: flex;align-items: center;padding-left: 12px;cursor: pointer;position:relative;color: rgba(255,255,255,0.8);">
                    <!-- <img style="margin-right: 4px;flex: 0 0 auto;" :src="diagramImg1" alt=""> -->
                    <span style="margin-right: 4px;flex: 1 1 auto;font-size: 12px;font-weight: normal;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">{{diagramPath}}</span>
                    <i :class='{"el-icon-arrow-down":true,"up":popoverVisible}' style=""></i>
                  </div>
                </div>
              </el-popover>
            </div>
          </el-header>
        </model-graph-edit>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import modelDetail from './modelComponent.js'
import DatablauButton from '@components/basic/button/DatablauButton'
export default modelDetail
</script>
<style scoped lang="scss">
@import 'detail/modelDetail';
.full-area {
  top: 50px;
}
.entitiy-list-wrapper {
  position: absolute;
  top: 55px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
/deep/ .grey-tree.datablau-tree .el-tree-node.is-current > .el-tree-node__content .operate-list {
  display: inline-block;
}
/deep/ .el-icon-more {
  width: 24px;
  font-size: 14px;
  color: #999;
}
/deep/ .el-icon-more:hover {
  color: #409EFF;
}
.apply-img {
  position: relative;
  top: 2px;
  margin-right: 3px;
}
/deep/.datablau-checkbox2 {
  display: inline-block;
  margin-left: 5px;
  .el-checkbox {
    margin-right: 0;
    .el-checkbox__inner {
      border-color: #999;
    }
    &:hover .el-checkbox__inner {
      border-color: #409EFF;
    }
  }
}
.model-box {
  top: 84px;
  &.fullscreen {
    top: 54px;
  }
}
.bottom-line {
  width: 240px;
  height: 1px;
  background-color: #dddddd;
}
.search-box {
  height: 28px;
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  color: #555555;
  img {
    margin-left: 68px;
    cursor: pointer;
  }
  .close {
    margin-left: 6px;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    padding-left: 4px;
    color:  #999999;
    cursor: pointer;
  }
  .img-box {
    position: relative;
    top: 2px;
    margin-left: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #999999;
    &:hover {
      color: #409eff;
    }
  }
}
.top-title-box {
  height: 30px;
  background: #455c7c;
  position: relative;
  .diagram-tree-wrapper {
    height: 30px;
    display: inline-block;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  .model-header {
    margin-left: 10px;
    height: 30px;
    color: rgba(255,255,255,0.8);
    width: 40%;
    .model-name {
      font-size: 12px;
      font-weight: 400;
      &> span {
        max-width: 40%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  .infomes-box {
    float: right;
    display: flex;
    height: 100%;
    align-items: center;
    .el-button {
      margin: 0 10px;
      width: 70px;
      height: 20px;
      background: rgba(255,255,255,0.10);
      border-radius: 12px;
      border: unset;
      padding: 0;
      color: rgba(255,255,255,0.8);
    }
    .user-info {
      display: flex;
      align-items: center;
      color: rgba(255,255,255,0.8);
      .iconfont {
        margin-right: 5px;
      }
    }
  }
}
.el-icon-arrow-down {
  transform: rotate(-90deg);
  transition: all 0.2s linear;
  &.up {
    transform: rotate(0deg);
  }
}
.tree-area {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}
.operate-list, /deep/ .operate-list {
  display: none;
  width: 24px !important;
  height: 30px;
  position: relative;
  right: 5px;
  span {
    cursor: pointer;
    color: #999;
    font-size: 14px;
  }
}
/deep/ .list-item-wrapper, .list-item-wrapper {
  position: relative;
  padding-left: 30px;
  line-height: 30px;
  cursor: pointer;
  align-items: center;
  display: flex;
  font-size: 12px;
  color: #555;
  &.unactive {
    color: #999;
  }
  &.active {
    background-color: rgba(64,158,255,0.10);
    .operate-list {
      display: inline-block;
    }
    .node-name {
      color: #409EFF;
    }
  }
  &:hover {
    // background-color: rgba(64,158,255,0.10);
    .operate-list {
      // flex: 0 0 auto;
      // position: relative; //与左边菜单冲突
      // left: 40px;
      display: inline-block;
    }
  }
  & > span.node-name {
    // flex: 1 1 auto;
    // width: 155px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #555;
  }
  img {
    flex: 0 0 auto;
    position: relative;
    top: 2px;
    width: 14px;
    margin-right: 8px;
  }
}
.tableDetail,
.relationDetail,
.commentDetail,
.viewDetail,
.themeDetail{
  &.list-item-wrapper {
    &:hover {
      background-color: rgba(64,158,255,0.10);
    }
  }
}
/deep/ .grey-tree .el-icon-caret-right:not(.is-leaf):before {
  content: "\e6e0";
  font-family: unset;
}
.count-hint {
  margin-left: 6px;
  padding: 2px 8px;
  min-width: 34px;
  background:  rgba(119,119,119,0.10);
  border-radius: 10px;
  font-size: 12px;
  color: #555;
  & > span {
    color: #539FFD;
  }
}
.model-name {
  display: inline-block;
  vertical-align: top;
  font-weight: bold;
  font-size: 14px;
  & > span {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
}
.iconfont {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  &:before {
    font-size: 14px;
  }
  &:after {
    content: '';
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    position: absolute;
  }
}
.diagram-tree-wrapper /deep/ .el-tree-node__content {
  height: 30px;
}
// .diagram-tree-wrapper /deep/ span.el-tree-node__expand-icon.is-leaf {
//   visibility: unset;
// }
.diagram-tree-wrapper /deep/ .el-popover {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 90vh;
  & > .popper__arrow {
    display: none;
  }
  margin-top: 0!important;
  padding: 0;
}
.left-panel-wrapper {
  top: 86px;
  .title {
    font-size: 12px;
    color: #555;
  }
  .no-data {
    font-size: 12px;
    color: #999;
    text-align: center;
  }
  &.fullscreen {
    top: 54px;
  }
  /deep/ .el-collapse-item__header:hover {
    .el-collapse-item__arrow:before {
      color: #539ffd;
    }
    .title {
      color: #539ffd;
    }
  }
  .el-collapse-item {
    position: relative;
    /deep/.el-collapse-item__arrow {
      position: absolute;
      left: 14px;
      top: 9px;
      color: #999;
    }
    /deep/.el-icon-plus {
      padding-top: 5px;
      display: none;
      &::before {
        content:'';
        position: absolute;
        top: 7px;
        right: 7px;
        width: 24px;
        height: 24px;
        background: url('../../assets/images/mxgraphEdit/new-icon/add.svg') no-repeat;
      }
      &:hover::before {
        background: url('../../assets/images/mxgraphEdit/new-icon/add1.svg') no-repeat;
      }
      &.show {
        display: inline-block;
      }
    }
    /deep/ .el-collapse-item__header {
      border-bottom: unset;
      height: 30px;
      line-height: 30px;
      padding-left: 30px;
      &:hover {
        background-color: rgba(64,158,255,0.10);
      }
      &.active {
        background-color: rgba(64,158,255,0.10);
      }
    }
    /deep/ .el-collapse-item__wrap {
      border-bottom: unset;
      // position: relative;
      // left: -32px;
      // width: calc(100% + 32px);
    }
  }
  /deep/ .el-collapse-item__header {
    &:hover {
      .el-icon-plus {
        display: inline;
      }
    }
    &.active {
      .el-icon-plus {
        display: inline;
      }
    }
  }
  .el-radio-group {
    width: 30px;
    position: absolute;
    top: 0;
    left: 0;
    /deep/ .el-radio-button__inner {
      color: #555 !important;
      border: 1px solid #dddddd;
      width: 30px;
      padding: 1px;
      height: 98px;
      text-align: center;
      border-radius: 0;
      white-space: normal;
      line-height: 20px;
      border-right: none;
    }
    /deep/.el-radio-button.is-focus .el-radio-button__inner {
      color: #fff !important;
      border-color:#409EFF;
      background-color: #409EFF !important;
    }
    /deep/.el-radio-button__orig-radio:checked+.el-radio-button__inner {
      color: #fff !important;
      border-color:#409EFF;
      background-color: #409EFF !important;
    }
  }
  /deep/ .el-tooltip.node-name {
    display: inline-block;
    flex: unset;
    width: 155px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
}
</style>
<style lang="scss">
.icon-delete.disabled {
  & + .label {
    color: #C0C4CC!important;
  }
  color: #C0C4CC;
}
.el-color-dropdown__value {
  width: 180px;
}
.el-popper .popper__arrow, .el-popper .popper__arrow::after {
  display: none;
}
.el-popover {
  min-width: unset;
}
#context-menu-dam {
  &.er-diagram {
    width: 80px;
    padding:6px 0;
    .arrow {
      display: none;
    }
    .label {
      color: #555;
    }
    .context-option {
      min-width: 40px;
      padding-left: 10px;
      background-color: #fff;
      &:hover {
        background: rgba(24, 144, 255, 0.1);
        color: #409EFF;
        .label {
          color: #409EFF;
        }
      }
    }
  }
}
.el-message-box__btns {
  width: 100%;
}
.el-collapse {
  border-top:none;
  border-bottom: none;
}
.el-collapse-item__content {
  padding-bottom:0;
}
.modeEdit-more-itme-box {
  padding-left: 10px;
  display: block!important;
  cursor: pointer;
  width: 70px;
  height: 30px;
  color: #555555;
  line-height: 30px;
  font-size: 12px;
  &:hover {
    background: rgba(24, 144, 255, 0.1);
    color: #539FFD;
    &.iconfont::before {
      color: #539FFD;
    }
  }
  &:before {
    margin-right: 6px;
  }
}
.mod-pop {
  transform: translateY(20px);
  padding: 6px 0px;
}
</style>
