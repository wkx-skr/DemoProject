<template>
  <div
    class="graph-outer"
    :class="{'dark-theme': theme === 'dark', 'show-control-line': showControlLine}"
    @click="handleOuterClick"
  >
    <!--<datablau-breadcrumb-->
    <!--  :node-data="[-->
    <!--    $t('meta.lineageManage.lineageManage'),-->
    <!--    title + ' (' + subtitle + ')',-->
    <!--  ]"-->
    <!--  :couldClick="false"-->
    <!--  @back="handleClose"-->
    <!--&gt;</datablau-breadcrumb>-->
    <div class="legend-container">

    </div>
    <div id="loading-box" v-if="loading">
      <i class="el-icon-loading"></i>
      <div id="loading-progress"></div>
    </div>
    <div
      id="consa-graph"
      v-show="!loading"
      @mousedown="graphMousedown($event)"
      @mousemove="graphMousemove($event)"
      @mouseup="graphMouseup($event)"
      @scroll="graphScroll($event)"
      @contextmenu="onContextMenu"
      @dblclick="onDblClick($event)"
      :style="{
        cursor: dragInfo.dragFlag ? 'grabbing' : 'default',
      }"
    >
      <lineage-view
        ref="view"
        :graphType="graphType"
        :raw-data="rawData"
        :support-edit="supportEdit"
        :theme="theme"
        :direction="param.directionTB ? 'TB' : 'LR'"
        @update-can-undo="updateCanUndo"
        @update-can-redo="updateCanRedo"
        @get-version-list="getVersionList"
        :dataWarehouse="dataWarehouse"
      ></lineage-view>
    </div>
    <mini-view ref="miniView" id="graph-outline" v-show="!loading"></mini-view>
    <unfold class="unfold" @fold="handleFold"></unfold>
    <div id="consa-function" v-show="!loading">
      <div style="display: inline-block">
        <el-checkbox v-model="param.directionTB">
          纵向排列
        </el-checkbox>
        <el-checkbox v-model="param.showColumn">
          展示属性
        </el-checkbox>
        <datablau-radio
          v-model="editMode"
          v-if="writable"
          style="display: inline-block"
        >
          <el-radio :label="false">
            {{ $t('meta.lineageManage.graph.scanMode') }}
          </el-radio>
          <el-radio :label="true">
            {{ $t('meta.lineageManage.graph.editMode') }}
          </el-radio>
        </datablau-radio>
        <el-checkbox v-model="param.showMiddleProcess" v-show="param.developerMode && !editMode">
          {{ $t('meta.lineageManage.graph.middleProcess') }}
        </el-checkbox>
        <el-checkbox
          style="margin-left: 10px"
          v-model="showFullProcess"
          v-show="(param.developerMode && !editMode) || dataWarehouse"
          :label="$t('meta.lineageManage.graph.wholeProcess')"
        ></el-checkbox>
        <el-checkbox
          v-model="param.showColumn"
          v-if="!disableShowColumn || !!controlOptions.showColumn"
          v-show="!editMode"
          @change="paintGraph"
        >
          {{ $t('meta.lineageManage.graph.showColumn') }}
        </el-checkbox>
        <el-checkbox
          v-model="param.groupBySchema"
          @change="handleGroup"
          v-show="!editMode"
          v-if="!!controlOptions.groupBySchema"
        >
          {{ $t('meta.lineageManage.graph.groupBySchema') }}
        </el-checkbox>
        <el-checkbox
          v-model="param.groupByCategory"
          @change="handleGroup2"
          v-show="!editMode"
          v-if="!!controlOptions.groupByCategory"
        >
          {{ $t('meta.lineageManage.graph.groupBySystem') }}
        </el-checkbox>
      </div>
      <div v-if="supportEdit" style="display: inline-block; margin-left: 20px">
        <el-tooltip placement="top" style="margin-right: 10px">
          <i class="iconfont icon-tips" style="margin-left: 0"></i>
          <div slot="content">
            1. 移动位置：请直接拖拽表头或组的头部
            <br/>
            2. 添加元数据：请在欲插入的位置双击或点击右键菜单，进行元数据选择
            <br/>
            3. 建立血缘关系:
            请在源字段上双击或点击右键菜单进行选取。之后在目标字段上单击左键完成操作
            <br/>
            4. 删除元数据: 请在欲删除的元数据上点击右键菜单进行操作
            <br/>
            5. 删除血缘关系：请在源或目标字段上右键菜单中选择
            <br/>
            6.
            删除操作：只能删除用户添加的元数据和血缘关系，不能删除自动解析出的
            <br/>
            <!--            7.-->
            <!--            所有编辑操作支持单步撤回和重做，保存后会存储到数据库并清空本地单步记录-->
            <!--            3.-->
            <!--            插入和删除元数据操作仅限不显示加工过程，显示字段且未分组的模式下进行-->
            <!--            <br />-->
            <!--            4.-->
            <!--            因版本没有进行分支设计，因此只允许保存在最新版的基础上进行编辑操作-->
            <!--            <br />-->
          </div>
        </el-tooltip>
        <datablau-button
          v-if="editMode"
          type="text"
          :disabled="!supportEdit || !canUndo"
          @click="handleUndo"
          :dblClickTimeout="0"
          :tooltipContent="$t('meta.lineageManage.graph.undoTooltip')"
        >
          <i class="fa fa-undo"></i>
        </datablau-button>
        <datablau-button
          v-if="editMode"
          type="text"
          :disabled="!supportEdit || !canRedo"
          @click="handleRedo"
          :dblClickTimeout="0"
          :tooltipContent="$t('meta.lineageManage.graph.redoTooltip')"
        >
          <i class="fa fa-repeat"></i>
        </datablau-button>
        <datablau-button
          v-if="editMode"
          type="text"
          :disabled="!supportEdit || !canUndo"
          @click="handleSave"
          :tooltipContent="$t('meta.lineageManage.graph.saveTooltip')"
        >
          <i class="fa fa-save"></i>
        </datablau-button>
      </div>
      <div style="display: inline-block; margin-left: 10px" v-if="false">
        <datablau-button
          style="margin-left: 15px"
          @click="goToGraph"
          type="text"
          v-if="$route.query.id"
        >
          {{ $t('meta.lineageManage.graph.toOld') }}
        </datablau-button>
      </div>
      <el-input
        placeholder="copy your json here..."
        class="textarea"
        v-model="jsonData"
        @change="handleJson"
        v-show="param.developerMode"
        type="textarea"
      ></el-input>
    </div>
  </div>
</template>
<script>
import lineage from './lineage.js'

export default lineage
</script>
<style lang="scss" scoped>
.graph-outer {
  padding: 10px 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFF;
  //background-color: var(--default-bgc);
}

#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 32px;
  left: 20px;
  right: 20px;
  background-color: #F5F5F5;
  border: 1px solid #dddddd;
  overflow: auto;

  &.to-top {
    top: 20px;
  }
}

.show-control-line {
  #consa-graph {
    top: 35px;
  }
}

#graph-outline {
  position: absolute;
  height: 200px;
  width: 300px;
  /*top: 100px;*/
  bottom: 40px;
  right: 38px;
  border: 1px solid gray;
  background: rgba(225, 225, 225, 0.8);
}

.legend-container {
  float: right;
  margin-top: 15px;
}

.graph-legend {
  display: inline-block;
  width: 80px;
  text-align: center;
  border: 1px solid #bfbfbf;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.subtitle {
  font-size: 18px;
  font-style: italic;
}

#graph-outline {
  position: absolute;
  height: 200px;
  width: 300px;
  /*top: 100px;*/
  bottom: 40px;
  right: 38px;
  border: 1px solid gray;
  background: #efefef;
  opacity: 0.8;
}

.btn-group {
  float: right;
}

#loading-box {
  width: 200px;
  height: 36px;
  position: absolute;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);

  i {
    font-size: 36px;
  }
}

#consa-function {
  margin-top: -10px;
  height: 30px;
  line-height: 30px;
}

.textarea {
  position: absolute;
  width: 500px;
  right: 20px;
  top: 30px;
}

.tree-container {
  height: 300px;
  position: relative;
}

// theme 颜色
.graph-outer.dark-theme {
  &, .table, .shape, #consa-graph {
    //color: rgba(0, 0, 0, .65);
    color: rgb(254, 254, 254);
  }

  .shape-item {
    &.column {
      color: #BBBBBB;
    }

  }

  .graph-outer {
    background-color: #3C3F41;
  }

  #consa-graph {
    background-color: #3C3F41;
    border-color: #646464;
  }

  .table {
    background-color: transparent;
  }
}
</style>
<style lang="scss">
@import '~@service/lineage/asset/base';
</style>
