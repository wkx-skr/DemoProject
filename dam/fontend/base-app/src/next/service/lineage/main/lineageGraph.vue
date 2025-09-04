<template>
  <div
    class="graph-outer"
    :style="{ backgroundColor: pageColor }"
    @click="handleOuterClick"
  >
    <steps-selector
      ref="stepsSelector"
      :all-steps="rawData.steps"
      v-if="rawData && rawData.steps"
      @selected="handleStepsSelected"
    ></steps-selector>
    <meta-selector
      dialog-title="元数据选择"
      ref="metaSelector"
      type="table"
      @select="handleMetaSelect"
    ></meta-selector>
    <datablau-breadcrumb
      :node-data="[
        $t('meta.lineageManage.lineageManage'),
        title + ' (' + subtitle + ')',
      ]"
      :couldClick="false"
      @back="handleClose"
    ></datablau-breadcrumb>
    <!--<div class="title">
      {{ title }}
    </div>
    <div class="subtitle">
      {{ subtitle }}
    </div>-->
    <div class="legend-container">
      <!--      图例:-->
      <!--      <div class="graph-legend" style="background: #e7c58e">源表</div>-->
      <!--      <div class="graph-legend" style="background: #cbe8ca">目标表</div>-->
      <!--      <div class="graph-legend" style="background: #d9dfef">中间步骤</div>-->
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
        @update-can-undo="updateCanUndo"
        @update-can-redo="updateCanRedo"
        @get-version-list="getVersionList"
      ></lineage-view>
    </div>
    <mini-view ref="miniView" id="graph-outline" v-show="!loading"></mini-view>
    <unfold class="unfold" @fold="handleFold"></unfold>
    <div id="consa-function" v-show="!loading">
      <!--<el-checkbox v-model="param.developerMode" @change="handleData" size="mini" label="开发者模式"></el-checkbox>-->
      <!--      <div>-->
      <!--        <span style="display: inline-block; width: 65px">Dev Config</span>-->
      <!--<datablau-tooltip
          content="开发阶段的配置，供开发调试、测试和设计使用，大概率不会开放给用户"
          placement="top"
          style="margin-right: 10px"
        >
          <i class="iconfont icon-tips"></i>
        </datablau-tooltip>
        <datablau-button style="" @click="getData">重绘</datablau-button>-->
      <!--<datablau-button @click="clearVersions" type="danger">
          清除所有版本
        </datablau-button>-->
      <!--<datablau-button
          style="margin-right: 10px"
          @click="deleteVersion"
          type="danger"
        >
          清除最后一个版本
        </datablau-button>-->
      <!--        <el-checkbox v-model="param.verticalAlign" @change="paintGraph">-->
      <!--          纵向居中布局-->
      <!--        </el-checkbox>-->
      <!--<el-checkbox
          v-model="param.showModel"
          @change="paintGraph"
          size="mini"
          label="Schema独立占用一行"
        ></el-checkbox>-->
      <!--<span style="margin-left: 10px">移动吸附基准</span>
        <datablau-select
          @change="changeAbsorb"
          v-model="param.absorb"
          style="display: inline-block; margin-left: 10px"
        >
          <el-option label="1像素" :value="0"></el-option>
          <el-option label="5像素" :value="5"></el-option>
          <el-option label="10像素" :value="10"></el-option>
          <el-option label="20像素" :value="20"></el-option>
          <el-option label="50像素" :value="50"></el-option>
        </datablau-select>-->
      <!--      </div>-->
      <div style="display: inline-block">
        <!--        <span style="display: inline-block; width: 65px">User Config</span>-->
        <!--        <datablau-tooltip-->
        <!--          content="用户使用时的配置项，仅为功能陈列，不一定都要开放给用户,请产品和设计决定摆放位置和操作逻辑。"-->
        <!--          placement="top"-->
        <!--          style="margin-right: 10px"-->
        <!--        >-->
        <!--          <i class="iconfont icon-tips"></i>-->
        <!--        </datablau-tooltip>-->
        <datablau-radio
          v-model="editMode"
          v-if="$route.query.writable === 'true'"
          style="display: inline-block"
        >
          <el-radio :label="false">
            {{ $t('meta.lineageManage.graph.scanMode') }}
          </el-radio>
          <el-radio :label="true" :disabled="!$auth['BLODD_FILE']">
            {{ $t('meta.lineageManage.graph.editMode') }}
          </el-radio>
        </datablau-radio>
        <!--        <el-checkbox v-model="param.showMiddleProcess" v-show="!editMode">
          {{ $t('meta.lineageManage.graph.middleProcess') }}
        </el-checkbox>-->
        <el-checkbox
          style="margin-left: 10px"
          v-model="showFullProcess"
          v-show="!editMode"
          :label="$t('meta.lineageManage.graph.wholeProcess')"
        ></el-checkbox>
        <el-checkbox
          v-model="param.showColumn"
          v-if="!disableShowColumn"
          v-show="!editMode"
          @change="paintGraph"
        >
          {{ $t('meta.lineageManage.graph.showColumn') }}
        </el-checkbox>
        <el-checkbox
          v-model="param.groupBySchema"
          @change="handleGroup"
          v-show="!editMode"
        >
          {{ $t('meta.lineageManage.graph.groupBySchema') }}
        </el-checkbox>
        <el-checkbox
          v-model="param.groupByCategory"
          @change="handleGroup2"
          v-show="!editMode"
        >
          {{ $t('meta.lineageManage.graph.groupBySystem') }}
        </el-checkbox>
        <datablau-button
          style="margin-left: 20px"
          @click="callSelectSteps"
          :disabled="!(rawData && rawData.steps)"
        >
          实体选择
        </datablau-button>
        当前绘制了
        <datablau-tooltip
          :content="selection.map(i => i.name).toString()"
          placement="top"
          :disabled="selection.length <= 1 || selectionLabel.includes('完整')"
        >
          <span>{{ selectionLabel }}</span>
        </datablau-tooltip>
        <datablau-tooltip
          content="可以选择一个或若干个实体进行选中实体的血缘完整链路绘制。当实体数较多时，默认仅绘制一张表的完整链路"
          placement="top"
        >
          <i class="iconfont icon-tips"></i>
        </datablau-tooltip>
      </div>
      <div v-if="supportEdit" style="display: inline-block; margin-left: 20px">
        <!--        <span style="display: inline-block; width: 65px">Graph Edit</span>-->
        <el-tooltip placement="top" style="margin-right: 10px">
          <i class="iconfont icon-tips" style="margin-left: 0"></i>
          <div slot="content">
            1. 移动位置：请直接拖拽表头或组的头部
            <br />
            2. 添加元数据：请在欲插入的位置双击或点击右键菜单，进行元数据选择
            <br />
            3. 建立血缘关系:
            请在源字段上双击或点击右键菜单进行选取。之后在目标字段上单击左键完成操作
            <br />
            4. 删除元数据: 请在欲删除的元数据上点击右键菜单进行操作
            <br />
            5. 删除血缘关系：请在源或目标字段上右键菜单中选择
            <br />
            6.
            删除操作：只能删除用户添加的元数据和血缘关系，不能删除自动解析出的
            <br />
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
        <!--Version
        <datablau-select
          v-model="currentVersion"
          style="width: 200px; display: inline-block; margin-right: 10px"
          @change="handleVersionChange"
        >
          <el-option
            v-for="(item, index) in versionList"
            :key="index"
            :label="item.title"
            :value="item.id"
          ></el-option>
        </datablau-select>-->
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

      <!--<el-checkbox
        v-model="showFullProcess"
        v-show="param.developerMode"
        label="显示全部过程"
      ></el-checkbox>-->
      <el-input
        placeholder="copy your json here..."
        class="textarea"
        v-model="jsonData"
        @change="handleJson"
        v-show="param.developerMode"
        type="textarea"
      ></el-input>
      <!--背景颜色<el-color-picker v-model="pageColor" show-alpha :predefine="predefineColors" size="mini"></el-color-picker>-->
      <!--<el-color-picker style="display:none;" v-model="param.inputTableColor" size="mini" @change="handleData"></el-color-picker>-->
    </div>
  </div>
</template>
<script>
import lineageGraph from './lineageGraph.js'
export default lineageGraph
</script>
<style lang="scss" scoped>
.graph-outer {
  padding: 10px 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //background:#FFF;
  background-color: var(--default-bgc);
}
#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 75px;
  left: 20px;
  right: 20px;
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
  overflow: auto;
  &.to-top {
    top: 20px;
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
  margin-top: 5px;
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
</style>
<style lang="scss">
@import '~@service/lineage/asset/base';
</style>
