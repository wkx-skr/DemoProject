<template>
  <el-container :class="{'in-electron': inElectron}" v-loading="!permissionReady" class="model-detail-container">
    <el-header style="height:35px;padding:0;">
      <div class="model-header">
        <!-- <span class="back-btn" @click="goBack">
          <img :src="backImg" alt="">
          <i>{{$store.state.$v.modelDetail.back}}</i>
        </span> -->
        <datablau-breadcrumb
          :node-data="modelPath"
          :separator="'/'"
          @back="goBack"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
        <!-- <span style="margin-left:.4em;" class="tree-icon model"></span>
        <span class="model-name">{{currentModel.modelName}}</span> -->
        <datablau-button
          v-show="isShowVerButton"
          :disabled="!writable"
          :tooltipContent="!writable?'无编辑权限':''"
          type="normal"
          class="ver"
          @click="handlePublishModel"
          v-if="currentPane.indexOf('diagram')!==0 && showEREdit"
        >
          发布模型
        </datablau-button>
        <div style="position: absolute;right: 20px;" :class="{disabled: !writable}" v-if="showEREdit && !isEditing" class="edit-model-btn" @click.stop="goEditPage(currentModel)">
          <i style="font-size: 14px;margin-right: 6px;" class="iconfont icon-bianji"></i>
          <span>模型编辑</span>
        </div>
      </div>
    </el-header>
    <el-container >
      <div v-show="isCollapse">
        <el-menu default-active="1" class="el-menu-vertical-demo" :collapse="isCollapse" >
            <el-menu-item index="1" @click="handelClickEntityPanel('isCollapse')">
              <i class="iconfont icon-menu-zlbg"></i>
              <span slot="title" v-if="isCollapse">{{ $store.state.$v.modelDetail.basicInfo }}</span>
            </el-menu-item>
            <el-menu-item index="2" @click="goManageInfo()">
              <i class="iconfont icon-guanlixinxi"></i>
              <span slot="title" v-if="isCollapse">{{ $store.state.$v.modelDetail.manageInfo }}</span>
            </el-menu-item>
        </el-menu>
      </div>
      <div class="tree-area model" style="padding:0;position:absolute;top:35px;bottom:0;left:0;width:240px;border-right: none;" v-show="!isCollapse">
        <div class="title-top">
          <div class="tree-icon model2"
               style="
            position: absolute;
            top: 2px;
            left: 0;
            width: 40px;
            height: 40px;
            background-size: 40px;
            background-repeat: no-repeat;"
          ></div>
          {{ currentModel.modelName }}
        </div>
        <div style="position:absolute;top:40px;bottom:0;left:0;right:0;overflow-x:hidden;overflow-y:auto"
             class="left-menu" >
          <el-collapse value="basic" @change="handleCollapseChange">
            <el-collapse-item name="basic" @click.native="itemChange">
              <template slot="title">
                <div class="title in-collapse">
                  <i class="iconfont icon-menu-zlbg"
                     :class="{active: currentPane === 'detail' || currentPane === 'tables' || currentPane === 'level' || currentPane === 'history' || currentPane === 'script'}"
                     style="margin-right: 0px;"></i>
                  {{ $store.state.$v.modelDetail.basicInfo }}
                </div>
              </template>
              <div class="link" style="margin-top:0em;" :class="{'checked-link': currentPane === 'detail'}">
                <div
                    class="button"
                    :class="{checked: currentPane === 'detail'}"
                    @click="handleChangeToDetail"
                >{{ $store.state.$v.modelDetail.modelSummary }}
                </div>
                <div class="cnt"></div>
              </div>
              <div class="link" :class="{'checked-link': currentPane === 'tables'}">
                <div
                    class="button"
                    :class="{checked: currentPane === 'tables'}"
                    @click="handelClickEntityPanel"
                >{{ isLogical ? $store.state.$v.modelDetail.dataEntityList : $store.state.$v.modelDetail.tableList }}
                </div>
                <div class="cnt"></div>
              </div>
              <div v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute" class="link" :class="{'checked-link': currentPane === 'level'}">
                <div
                    class="button"
                    :class="{checked: currentPane === 'level'}"
                    @click="currentPane = 'level'"
                >模型血缘
                </div>
              </div>
              <div class="link" :class="{'checked-link': currentPane === 'history'}">
                <div
                    class="button"
                    :class="{checked: currentPane === 'history'}"
                    @click="currentPane = 'history'"
                >{{ $store.state.$v.modelDetail.version }}
                </div>
                <!--                <div class="cnt">20</div>-->
              </div>
              <!-- <div class="link">
                <div
                  class="button"
                  :class="{checked: currentPane === 'script'}"
                  @click="currentPane = 'script'"
                >{{ $store.state.$v.modelDetail.codeGenerate }}
                </div>
              </div> -->
            </el-collapse-item>
          </el-collapse>
          <el-collapse value="basic" style="margin-bottom: 0;" @change="handleCollapseChange">
            <el-collapse-item name="basic" @click.native="itemChange">
              <template slot="title">
                <div class="title in-collapse">
                  <i class="iconfont icon-guanlixinxi"
                     :class="{active: currentPane === 'manage' || currentPane === 'report' || currentPane === 'comment'}"
                     style="margin-right: 0px;top: 1px;"></i>
                  {{ $store.state.$v.modelDetail.manageInfo }}
                </div>
              </template>
              <div class="link" style="margin-top:0em;" :class="{'checked-link': currentPane === 'manage'}">
                <div
                    class="button"
                    :class="{checked: currentPane === 'manage'}"
                    @click="currentPane = 'manage'"
                >{{ $store.state.$v.modelDetail.manage }}
                </div>
              </div>
              <div class="link" v-if="$store.state.lic.quality" :class="{'checked-link': currentPane === 'report'}">
                <div
                    class="button"
                    :class="{checked: currentPane === 'report'}"
                    @click="currentPane = 'report'"
                >{{ $store.state.$v.modelDetail.domainReport }}
                </div>
                <!--                <div class="cnt">230</div>-->
              </div>
              <div class="link" style="margin-bottom:0.6em;" :class="{'checked-link': currentPane === 'comment'}" v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute">
                <div
                    class="button"
                    :class="{checked: currentPane === 'comment'}"
                    @click="currentPane = 'comment'"
                >{{ $store.state.$v.modelDetail.comment }}
                </div>
                <!--                <div class="cnt">20</div>-->
              </div>
            </el-collapse-item>
          </el-collapse>
          <div class="title" style="border-bottom:none;padding-left: 20px;font-weight:400;position:relative">
            <i class="iconfont icon-zhutiyu" :class="{active: currentPane === 'diagram'}"></i>{{$store.state.$v.modelDetail.theme}}
            <i class="iconfont icon-search" v-show="!showThemeSearch" @click.stop="showSearchPanel" style="float:right;margin-right:20px;cursor:pointer;color:#999"></i>
          </div>
          <div
            style="height:50px;text-align:center;padding-top:30px;"
            v-if="diagramsLoading">
            <i class="el-icon-loading"></i>
          </div>
          <div class="theme-box" :class="{'to-top': themeBoxToTop, 'no-archy': !$store.state.lic.archy}">
            <!--<div
              class="link"
              v-for="d in diagrams"
              :key="d.Id"
            >
              <div
                class="button"
                :class="{checked: currentPane==='diagram' + d.Name}"
                @click="handleDiagramClick(d)"
              >
                <i class="tree-icon diagram"></i>
                <span class="diagram-text">{{d.Name}}</span>
              </div>
            </div>-->
            <!--            {{diagrams}}-->
            <div class="search-line" v-show="showThemeSearch">
              <datablau-input
                  id="searchId"
                  size="mini"
                  v-model="themeQuery"
                  style="padding: 1px 7px 1px 20px;"
                  placeholder="搜索主题域"
                  class="search-graph"
                  @input="themeSearch">
              </datablau-input>
              <datablau-button
                  type="icon"
                  @click="outEditSearch"
                  class="hide-search-icon"
                  low-key
                  style="display: inline-block;width: 15px"
              >
                <i class="el-icon-arrow-right"></i>
              </datablau-button>
            </div>

            <datablau-tree
              class="grey-tree"
              :data="diagrams"
              ref="themeTree"
              :props="{label: 'Name', id: 'Id'}"
              :render-content="renderContent"
              @node-click="handleDiagramClick"
              :filter-node-method="filterNode"
              :expand-on-click-node="true"
              node-key="Id"
            ></datablau-tree>
          </div>
        </div>
      </div>
      <div :class="['stretch-menu-wrapper', !isCollapse?'shrink':'']">
        <i class="iconfont" :class="!isCollapse ? 'icon-shouqi' : 'icon-zhankai'" @click="shrinkToggle"></i>
      </div>
      <div class="resize-column-middle model-details-page" v-show="!isCollapse"></div>
      <el-main style="border-left: 1px solid #E6EAF2;top:37px" class="content-box model-details-content" :class="{'hide-tabs': hideTabs,'isCollapse': isCollapse}">

        <pane-detail
          ref='detail'
          v-if="currentPane === 'detail' && dataByType.udp && permissionReady"
          :detail="currentModel"
          :data-by-type="dataByType"
          :path="modelPath"
          :isLogical="isLogical"
          :isConceptual="isConceptual"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          :is-editor="isEditor"
          :showViewButton="showViewButton"
          @handleCurrentPaneChange="handleCurrentPaneChange"
        >
          <!--<datablau-button
              v-if="currentPane.indexOf('diagram')!==0 && showEREdit" class="edit-model-btn"
              type="important"
              @click.stop="goEditPage(currentModel)"
            >
            模型编辑
          </datablau-button>-->
        </pane-detail>
        <model-level
          class="content-main"
          v-else-if="currentPane==='level'"
          :model-id="currentModel.id"
          :model-level="modelLevel"
          :detail="currentModel"
          :current-model="currentModel"
        >
        </model-level>
        <keep-alive>
        <manage
          v-if="currentPane === 'manage'"
          :detail="currentModel"
          :data-by-type="dataByType"
          :path="modelPath">
        </manage>
        <report
          v-else-if="currentPane === 'report'"
          :detail="currentModel"
          :current-path="currentPath"
          @hideTabs="hideTabsChange"
        >
        </report>
        <history
          v-else-if="currentPane === 'history'"
          :modelId="currentModel.id"
          :path="modelPath"
          :currentModel="currentModel"
        >
        </history>
          <!-- script-generator 旧页面, 已废弃-->
        <script-generator
          v-else-if="currentPane === 'script'"
          :modelId="currentModel.id"
          :path="modelPath"
          :isConceptual="isConceptual"
        >
        </script-generator>
        <div class="comment-container" v-else-if="currentPane==='comment'">
          <model-comment
            class="content-main comment-component"
            :objectId="'80010001' + currentModel.id"
            :key="currentModel.id"
            :typeId="'80010001'"
          >
          </model-comment>
        </div>
        </keep-alive>
        <model-graph-edit
          v-if="currentPane==='tables' && dataByType.udp"
          :loading="loading"
          :current-id="0"
          editorType="table"
          :current-name="isLogical ? $store.state.$v.modelDetail.dataEntityList : $store.state.$v.modelDetail.tableList"
          from="tables"
          key="tables"
          :data="data"
          :data-by-type="dataByType"
          :modelId="currentModel.id"
          :currentModel="currentModel"
          :isLogical="isLogical"
          :isConceptual="isConceptual"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          :diagramsLoading="diagramsLoading"
          :transformData="transformData"
          @hideTabs="hideTabsChange"
        >
        </model-graph-edit>
        <model-graph-edit
          v-else-if="currentPane.indexOf('diagram')===0"
          :loading="loading"
          :current-id="diagramId"
          from="graph"
          editorType="table"
          :current-name="diagramName"
          :key="diagramId"
          :data="data"
          :diagrams="diagrams"
          :diagram="diagram"
          ref="modelGraphReference"
          :data-by-type="dataByType"
          :modelId="currentModel.id"
          :currentModel="currentModel"
          :isLogical="isLogical"
          :isConceptual="isConceptual"
          :diagramsLoading="diagramsLoading"
          :isCassandraOrMongoDB="isCassandraOrMongoDB"
          :mapIdToDiagramData="mapIdToDiagramData"
          :transformData="transformData"
          @hideTabs="hideTabsChange"
        >
        </model-graph-edit>
      </el-main>
    </el-container>

    <publish-model
        ref="publishModel"
        :currentType="currentType"
        :currentModel="currentModel"
    ></publish-model>
  </el-container>
</template>
<script>
import modelDetail from './model.js'
export default modelDetail
</script>
<style scoped lang="scss">
  @import 'detail/modelDetail';
  .el-menu-vertical-demo{
    width:48px;
  }
  .resize-column-middle {
    left: 240px;
  }
  .tree-icon.model2 {
    background-image: url('../../assets/images/modelTree/model2.svg');
  }
  .model-header .edit-model-btn {
    margin-right: 0;
  }
  .title-top {
    position: relative;
    padding-left: 40px;
    height: 40px;
    line-height: 40px;
    font-weight: bold;
    color: #555555;
    background-color: rgba(221, 221, 221, 0.15);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /deep/ .el-select .el-input .el-select__caret {
  color: #999;
}
  /deep/ .db-breadcrumb .back-btn {
    white-space: nowrap;
  }
  .content-box {
    left: 240px;
    &.isCollapse{
      left: 48px;
    }
  }
  .model-header {
    height: 100%;
    .disabled.edit-model-btn {
      border-color: #999;
      color: #999;
    }
  }
  .el-header {
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.1);
  }
  .in-electron {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .col-icon {
    width: 16px;
    display: inline-block;
    text-align: center;
    height: 16px;
    vertical-align: middle;
    margin: -3px 6px 0 -5px;
    background-size: cover;
    background-image:url("../../assets/images/mxgraph/Column.png");
  }
  .table-icon {
    width: 24px;
    display: inline-block;
    text-align: center;
    height: 24px;
    vertical-align: middle;
    margin: -3px 6px 0 -5px;
    background-size: cover;
    background-image:url("../../assets/images/modelTree/table.png");
  }
  .ver {
    position: absolute;
    right: 120px;
    height: 29.73px;
    line-height: 27px;
  }

    .db-breadcrumb {
      display: flex;
    }
    .middle-line {
      position: absolute;
      left: 10px;
      top: 362px;
      width: 180px;
      height: 1px;
      background: #DDDDDD;
      z-index: 1;
    }
    .top-tool {
      padding-top: 12px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      .datablau-select {
        width: 126px;
      }
      .label {
        margin-right: 6px;
        width: 48px;
        font-size: 12px;
        font-weight: 400;
        color: #555555;
      }

      .title {
        font-size: 14px;
        font-weight: 400;
        color: #555555;
      }
    }

  .theme-box {
    left: 0;
  }

  .title .iconfont {
    color: #999;
  }

  .title .iconfont.active {
    color: #409EFF;
  }

  .model-details-page {
    z-index: 5;
  }
  .stretch-menu-wrapper {
    position: fixed;
    left: 0;
    width: 160px;
    bottom: 0;
    box-sizing: border-box;
    height: 51px;
    // border-top: 1px solid #F6F6F6;
    // border-right: 1px solid #ddd;
    padding: 17px;
    background: #fff;
    i {
     cursor: pointer;
    }
    &.shrink {
      width: 60px;
    }
  }
</style>
<style lang="scss">
.detail-wrapper.report-outer-tabs {
  .header-wrapper {
    margin: 5px 0 10px 0;
    padding: 12px 0 0;
    display: flex;
    // border-bottom: 1px solid #D8D8D8;
    h2 {
      flex: 1 1 auto;
      display: inline-block;
      font-weight: 500;
      font-size: 14px;
      line-height: 1;
      color: #555;
      // margin-left: 20px;
      // border-left: 4px solid #409EFF;
      padding-left: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
  .el-collapse {
    border-top:none;
  }
  .el-collapse-item__content {
    padding-bottom:0;
  }
  .model-name {
    display: inline-block;
    vertical-align: top;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tree-area {
    border-color: #ddd;
  }
  .tree-area.model {
    .button {
      font-size: 12px;
      padding-left: 40px;
    }
    .button.checked {
      color: #409EFF;
      border-radius: 0;
      background: rgba(64,158,255,0.1);
    }
    .title.in-collapse {
      font-size: 14px;
      font-weight: 400;
      color: #555555;
      padding-left: 20px;

      & > i.active {
        color: #409EFF;
      }
    }

    .el-collapse-item__wrap {
      border-bottom: unset;
    }

    // .el-input__inner {
    //   height: 32px;
    // }

    .link .button.checked {
      background-color: transparent;
    }

    .search-line {
      //border: 1px solid red;
      position: relative;

      .search-graph {
        display: block;
        margin-right: 20px;
      }

      .hide-search-icon {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        height: 32px !important;
        //line-height: 32px !important;
        vertical-align: top;

        .el-icon-arrow-right {
          vertical-align: middle;
          height: 32px;
          line-height: 32px;
        }
      }
    }
  }
</style>
