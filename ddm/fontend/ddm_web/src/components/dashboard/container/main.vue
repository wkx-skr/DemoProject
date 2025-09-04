<template>
  <div class="container" :style="{ backgroundColor: BACKGROUND_COLOR }">
    <h5-list ref="h5List"></h5-list>
    <datablau-dialog
      title="组件选择器"
      width="940px"
      :visible.sync="appendComponentDialogVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <datablau-transfer
        size="mini"
        filterable
        :width="330"
        :filter-method="filterMethod"
        :titles="['可选', '已添加']"
        :button-texts="['移除', '添加']"
        filter-placeholder="请输入组件名称"
        v-model="transferValue"
        :data="transferData"
      >
        <span slot-scope="{ option }">
          <span
            style="
              display: inline-block;
              width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{ option.label }}
          </span>
          <span
            style="
              display: inline-block;
              margin-left: 0.2em;
              vertical-align: top;
              color: #999999;
            "
          >
            {{ option.size }}
          </span>
        </span>
      </datablau-transfer>
      <span slot="footer">
        <datablau-button type="secondary" @click="cancelTransfer">
          取消
        </datablau-button>
        <datablau-button @click="submitTransfer">确定</datablau-button>
      </span>
    </datablau-dialog>
    <div
      v-if="couldEdit"
      class="page-title-row"
      style="background-color: transparent; min-width: 1200px"
    >
      <span class="menu font-medium" style="font-size: 16px">
        {{ dashboardProperties.displayName }}
      </span>
      <el-button
        v-if="!fullScreen"
        @click="setFrameToFullScreen"
        size="mini"
        type="text"
        style="float: right; margin-top: 5px; margin-right: 10px"
      >
        <div title="全屏">
          <i class="fa fa-arrows-alt"></i>
          全屏显示
        </div>
      </el-button>
      <el-button
        v-else
        @click="setFrameToWindow"
        size="mini"
        type="text"
        style="float: right; margin-top: 5px; margin-right: 10px"
      >
        <div title="退出全屏">
          <i class="fa fa-window-close-o"></i>
          退出全屏
        </div>
      </el-button>
      <span style="margin-left: 20px; position: relative; top: 2px">
        <el-button
          v-if="couldEdit && !editMode && !isIE"
          size="mini"
          @click="editMode = true"
        >
          编辑驾驶舱
        </el-button>
        <!--<el-button
          v-if="couldEdit && editMode"
          size="mini"
          @click="editMode=false"
        >退出编辑模式</el-button>-->
        <el-button
          v-if="editMode"
          @click="addComponent"
          type="primary"
          size="mini"
        >
          选择组件
        </el-button>
        <el-button v-if="editMode" @click="addH5Component" size="mini">
          H5组件库
        </el-button>
        <el-button
          v-if="editMode && !proMode"
          @click="proMode = !proMode"
          size="mini"
          style="margin-right: 10px"
        >
          {{ proMode ? '收起高级' : '高级属性' }}
        </el-button>
        <template v-if="editMode && proMode">
          列栅格数
          <el-input-number
            size="mini"
            :min="3"
            :max="10"
            v-model="COL_AMOUNT"
            style="width: 100px; margin-right: 10px"
          ></el-input-number>
          <!--高度画布格数
          <el-input-number
            size="mini"
            :min="3"
            :max="20"
            v-model="ROW_MAX_AMOUNT"
            style="margin-right: 10px;"
          ></el-input-number>-->
          高度基准
          <el-input-number
            v-model="HEIGHT_BASE"
            :min="100"
            :max="200"
            :step="5"
            style="width: 100px; margin-right: 10px"
            size="mini"
          ></el-input-number>
          组件间距
          <el-input-number
            v-model="COMPONENT_GAP"
            :min="0"
            :max="30"
            style="width: 90px; margin-right: 10px"
            size="mini"
          ></el-input-number>
          背景颜色
          <el-color-picker
            size="mini"
            v-model="BACKGROUND_COLOR"
            style="vertical-align: middle"
          ></el-color-picker>
          <!-- <el-button
        size="mini"
        @click="key++">增加key</el-button>-->
        </template>
        <el-button
          v-if="couldEdit && editMode"
          size="mini"
          style="margin-left: 10px"
          @click="resetAll"
        >
          重置
        </el-button>
        <el-button
          v-if="couldEdit && editMode"
          type="primary"
          size="mini"
          style="margin-left: 10px"
          @click="handleSave"
        >
          保存
        </el-button>
      </span>
    </div>
    <div class="vdrs" :class="{ 'm-vdrs': !couldEdit }" ref="box" :key="key">
      <!--<vdr
        :w="100"
        :h="100"
        @dragging="onDrag"
        @resizing="onResize"
        :parent="true">
        <p>Hello! I'm a flexible component. You can drag me around and you can resize me.<br>
          X: {{ x }} / Y: {{ y }} - Width: {{ width }} / Height: {{ height }}</p>
      </vdr>
      <vdr
        :w="200"
        :h="200"
        :parent="true"
        :debug="false"
        :min-width="200"
        :min-height="200"
        :isConflictCheck="true"
        :snap="true"
        :snapTolerance="20"
      >
      </vdr>-->
      <!--
  lock-aspect-ratio 锁定纵横比
  parent 不能在其父元素之外拖动或调整大小
  grid 只能按照某个倍数进行元素移动
-->
      <vdr
        v-for="component in components"
        :key="component.title + key"
        :w="xFormatter(component.width)"
        :h="yFormatter(component.height)"
        :x="xFormatter(component.x)"
        :y="yFormatter(component.y)"
        :lock-aspect-ratio="false"
        :grid="grid"
        :parent="false"
        :resizable="editMode"
        :draggable="editMode"
        @dragstop="handleDrag(component, arguments)"
        @resizestop="handleResize(component, arguments)"
        @dblclick.native="handleContextMenu(component, $event)"
        @contextmenu.native.prevent="handleContextMenu(component, $event)"
        drag-cancel=".drag-cancel"
        v-loading="isComponentLoading(component)"
        :class="{ 'no-border': !editMode }"
      >
        <div style="position: absolute" :style="vdrInnerStyle">
          <component-loader
            :edit-mode="editMode"
            :data="component"
            :root-data="rootData"
            :gap="COMPONENT_GAP"
          ></component-loader>
        </div>
      </vdr>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style lang="scss" scoped>
.page-title-row {
  height: 40px;
  line-height: 24px;
  padding-top: 8px;
  .menu {
    margin-left: 10px;
  }
}
.draggable {
  cursor: move;
}
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f6f6f6;
  /*min-width: 1100px;*/
  overflow-x: auto;
  overflow-y: auto;
  padding: 0 10px;
  visibility: hidden;
  transition: visibility ease-in 1s;
}
.vdrs {
  /*border: 1px solid red;*/
  /*margin-top: 10px;*/
  /*height: 2000px;*/
}
.m-vdrs {
  margin-top: 10px;
}
</style>
<style lang="scss">
.vdr/*.no-border*/ {
  border: none;
}
/*.el-transfer {
  button > span {
    position: relative;
    top: -5px;
  }
}*/
.el-transfer-panel {
  width: 310px;
}
</style>
