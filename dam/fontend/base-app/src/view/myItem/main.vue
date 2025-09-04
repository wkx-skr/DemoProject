<template>
  <div class="page-outer table-main-page">
    <div class="page-container" style="padding: 0" v-show="show">
      <div class="datablau-breadcrumb-header">
        <div>
          <datablau-breadcrumb
            :node-data="[
              searchKeyword ? searchKeyword + '的搜索结果' : '全部结果',
              summary.wholeName,
            ]"
            :couldClick="false"
            @back="handleClose"
          ></datablau-breadcrumb>
          <!-- 面包靴中间部分 ，暂无遇见 -->
          <!-- <span
          class="catalog-path-item"
          v-for="(item, index) in catalogPathArr"
          :key="index"
        >
          <i class="fa fa-chevron-right"></i>
          <span class="path-item-text" @click="handleSkip2catalog(item)">
            {{ item.name }}
          </span>
        </span> -->
        </div>
      </div>

      <table-details
        v-if="favoPara && favoPara.objId && summaryLoaded"
        :objectId="parseInt(favoPara.objId)"
        objectTypeMaybe="unknown"
        :object="currentObject"
        :expand="true"
        :loadedTagsBefore="loadedTags"
        :hideHeader="true"
        :summary-from-props="summary"
        class="details"
      ></table-details>
      <!--<div class="ps-container top-40">
        <div :style="style.preview" class="content-preview">
          <div class="title">
            <datablau-icon
              v-if="dataType==='TABLE'"
              data-type="table" :size="20" style="position:relative;top:5px;"></datablau-icon>
            <datablau-icon
              v-else-if="dataType==='VIEW'"
              data-type="view" :size="20" style="position:relative;top:5px;"></datablau-icon>
            <datablau-icon
              v-else
              data-type="domain" :size="20" style="position:relative;top:3px;"></datablau-icon>
            {{summary.wholeName}}
          </div>
          <div class="description-line">
            <div class="markdown" v-if="summary.definition">
                <mavon-editor :defaultOpen="'preview'"
                    :toolbarsFlag="false"
                    :editable="false"
                    :scrollStyle="true"
                    :subfield="false"
                    :toolbars="toolbars"
                    style="min-height:60px;max-height:300px"
                    v-model="summary.definition"/>
            </div>
          </div>

          <div class="btn-con" v-if="false">
            <el-button class="btn-item" type="primary" @click="transform">数据变换</el-button>
            <div class="view-btn">
              <el-button
                class="btn-item"
                type="primary"
                @click="handleApplyData"
                v-if="$user.username !== summary.owner"
              >加入申请单</el-button>
              <el-button
                class="btn-item"
                type="primary"
                @click="handleCreateView"
                v-else-if="$user.username === summary.owner && $vdpsMap[currentModleId]"
              >创建视图</el-button>
              <el-tooltip
                :content="'请根据数据源 “' + currentModelName + '” 创建虚拟数据源'"
                v-else-if="!$vdpsMap[currentModleId]"
                effect="dark"
                placement="bottom"
              >
                <el-button
                  class="btn-item disable-btn"
                  type="primary"
                >创建视图</el-button>
              </el-tooltip>
            </div>
          </div>
          <div style="width:20px;height:100px;position:absolute;right:5px;top:0px;">
            <el-button
              type="text"
              @click="handleButtonClick"
            >
              <i class="el-icon-more"></i></el-button>
          </div>
          <div class="properties">
            <span class="property">
              <i class="icon-database"></i>{{summary.modelName}}
            </span>
            <span class="property">
              <i class="fa fa-user-o"></i>{{summary.owner}}
            </span>
            <span class="property star" v-if="false">
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
              <i class="fa fa-star-o"></i>
            </span>
            <span class="property star" v-else-if="true">
              <span>评分：</span>
              <el-rate
                class="table-rate"
                v-model="tableRate"
                disabled
                :show-score="tableRate !== 0"
                text-color="#898989"
                score-template="{value}"
              >
              </el-rate>
            </span>
            <span class="property collection" @click="toggleCollecStatus">
              <i class="el-icon-star-on" v-if="hasCollected"></i>
              <i class="el-icon-star-off" v-else></i>
              <span>收藏</span>
            </span>
          </div>
          <div class="properties">
            <business-properties v-if="summary.udps" :data="summary.udps"></business-properties>
          </div>
          <div class="tag-box blue">
            <el-tooltip
              v-for="t in summary.tags"
              :key="t.id"
              :disabled="!$globalData.tagDescriptionMap.get(t.id)"
              :content="$globalData.tagDescriptionMap.get(t.id)"
            >
              <span
                class="tag">{{t.name}}</span>
            </el-tooltip>
          </div>
        </div>
        <div>
          <el-tabs
            v-model="activeName"
            class="blue-tabs"
            @tab-click="handleTabClick"
          >
            <el-tab-pane
              v-if="dataType==='TABLE'"
              label="字段"
              name="column"
            ></el-tab-pane>
            <el-tab-pane
              name="queryData" disabled
              v-if="false">
              <span slot="label">
                <el-tooltip
                  :open-delay="1000"
                  content="您没有浏览数据的权限" placement="top"><span>数据 <i class="fa fa-lock"></i></span></el-tooltip>
              </span>
            </el-tab-pane>
            <el-tab-pane
              v-if="dataType==='TABLE'"
              label="模型" name="relation"></el-tab-pane>
            <el-tab-pane
              v-if="$featureMap.FE_LINEAGE && dataType==='TABLE'"
              label="血缘" name="lineage"></el-tab-pane>
            <el-tab-pane
              v-if="dataType==='VIEW'"
              label="sql语句"
              name="sql"
            ></el-tab-pane>
            <el-tab-pane
              label="API" name="dataViste"></el-tab-pane>
            <el-tab-pane name="comment">
              <span slot="label" v-if="commentCnt">
                评论
              </span>
              <span slot="label" v-else>
                评论
              </span>
            </el-tab-pane>
          </el-tabs>
          <div
            v-if="activeName==='column' && columnsLoaded && hasProfilingAccess" style="padding:0px 0 15px">
            <el-button
              class="column-btn"
              type="primary"
              @click="postProfile"
              :disabled="profiling"
            >{{profiling ? '正在执行...':'开始数据探查'}}</el-button>
            <span v-if="!profiling">
              <span style="margin:0 2em;">上次执行时间：
                <span v-if="profilingTimestamp">{{$timeFormatter(profilingTimestamp)}}</span>
                <span v-else style="color:darkgrey">暂无</span>
              </span>
              <span>行数：
                <span v-if="profilingTimestamp">
                  {{profilingRowCount}}行
                </span>
                <span v-else style="color:darkgrey">暂无</span>
              </span>
            </span>
          </div>
          <item-column
            v-if="activeName==='column' && columnsLoaded"
            :key="columnsProfileKey"
            @height-update="handleResize"
            :data="columns"
          ></item-column>
          <item-preview
            v-if="activeName==='data' && previewLoaded"
            @height-update="handleResize"
            :data="preview"
          ></item-preview>
          <old-relation
            v-if="activeName==='model'"
            :objectId="queryData.objectId"
          ></old-relation>
          <el-button
            size="mini"
            type="text"
            v-if="activeName==='sql' && sqlContent"
            @click="copyToClipboard"
          >拷贝sql语句到剪贴板</el-button>
          <div
            v-if="activeName==='sql' && sqlContent"
            class="sql-container">
            <div class="sql-content">
              <pre><code class="language-sql">{{sqlContent}}</code></pre>
            </div>
          </div>
          <logical-relation
            v-if="activeName==='relation'"
            :objectId="queryData.objectId"
          >

          </logical-relation>
          <consanguinity-graph
            v-if="activeName==='lineage'"
            :data="queryData"></consanguinity-graph>
          <comment
            v-if="activeName==='comment'"
            :objectId="summary.objectId"
            :showRate="true"
            @rateSubmitSuccess="handleRateSubmit"
            :typeId="summary.properties.TypeId"
          ></comment>
          <data-viste
            :objectId="queryData.objectId"
            class="data-visit"
            ref="dataViste"
            v-if="activeName==='dataViste'"
          ></data-viste>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import '../../assets/styles/constForDDC.sass';
@import './main.scss';
</style>
<style lang="scss">
.create-view {
  .el-dialog__body {
    padding: 0;
  }
  .create-view-dialog {
    max-height: 700px;
    overflow: auto;
  }
}
.btn-con {
  .btn-item.el-button {
    font-size: 10px;
  }
}
.page-outer {
  padding: 0;
}
</style>
