<template>
  <div class="container" :style="{ backgroundColor: BACKGROUND_COLOR }">
    <div class="forPdf">
      <h5-list ref="h5List"></h5-list>
      <datablau-dialog
        title="组件选择器"
        width="940px"
        :visible.sync="appendComponentDialogVisible"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        append-to-body
      >
        <datablau-transfer
          :width="310"
          size="mini"
          filterable
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
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button @click="submitTransfer">
            {{ $t('common.button.ok') }}
          </datablau-button>
        </span>
      </datablau-dialog>
      <span class="asset" v-if="from === 'dataAsset'">
        <div class="slect">
          <!-- <span>{{ $t('common.dashboard.thisYear') }}</span> -->
          <!--        <el-select-->
          <!--          v-model="modelValueSingle"-->
          <!--          @change="modelValueChange"-->
          <!--          filterable-->
          <!--          :style="{ width: modelValueWidth }"-->
          <!--        >-->
          <!--          <el-option-->
          <!--            v-for="item in options"-->
          <!--            :key="item.id"-->
          <!--            :label="item.name"-->
          <!--            :value="item.id"-->
          <!--          ></el-option>-->
          <!--        </el-select>-->
          <el-dropdown trigger="click" @command="modelValueChange">
            <span class="el-dropdown-link batch">
              {{ modelValueName }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="k in options"
                :key="k.id"
                :command="k.id"
              >
                {{ k.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </span>
      <div
        v-if="$isAdmin"
        class="page-title-row"
        style="
          background-color: transparent;
          min-width: 1200px;
          position: relative;
        "
      >
        <span class="menu font-medium" style="font-size: 16px">
          {{ dashboardProperties.displayName }}
        </span>
        <!--导出-->

        <datablau-button
          v-if="
            dashboardProperties.dashboardName === 'dataQuality' &&
            $auth['COCKPIT_VIEW_PDF']
          "
          @click="exportPdf"
          type="text"
          style="float: right; margin-right: 10px"
        >
          <div>
            <i class="iconfont icon-export" style="font-size: 14px"></i>
            导出pdf
          </div>
        </datablau-button>
        <datablau-button
          v-if="!fullScreen"
          @click="setFrameToFullScreen"
          type="text"
          style="float: right; margin-right: 10px"
          class="iconfont icon-quanping1"
          :tooltipContent="$t('common.dashboard.fullscreen')"
        ></datablau-button>
        <datablau-button
          v-else
          @click="setFrameToWindow"
          type="text"
          style="float: right; margin-top: 5px; margin-right: 10px"
        >
          <div>
            <i class="fa fa-window-close-o"></i>
            {{ $t('common.dashboard.exitFullscreen') }}
          </div>
        </datablau-button>

        <span
          :style="{
            float: 'right',
          }"
        >
          <datablau-button
            v-if="$isAdmin && !editMode"
            @click="editMode = true"
            type="text"
            class="iconfont icon-bianji"
            :tooltipContent="$t('common.dashboard.configure')"
          ></datablau-button>
          <!--<el-button
          v-if="$isAdmin && editMode"
          size="mini"
          @click="editMode=false"
        >退出编辑模式</el-button>-->
          <datablau-button
            v-if="editMode"
            @click="addComponent"
            type="primary"
            size="mini"
          >
            {{ $t('common.dashboard.selectComponents') }}
          </datablau-button>
          <datablau-button v-if="editMode" @click="addH5Component" size="mini">
            {{ $t('common.dashboard.h5') }}
          </datablau-button>
          <datablau-button
            v-if="$i18n.locale === 'zh' && editMode && !proMode"
            @click="proMode = !proMode"
            size="mini"
            style="margin-right: 10px"
          >
            {{ proMode ? '收起高级' : '高级属性' }}
          </datablau-button>
          <template v-if="editMode && proMode">
            列栅格数
            <el-input-number
              size="mini"
              :min="3"
              :max="gridsNum"
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
              :min="min"
              :max="200"
              :step="8"
              style="width: 100px; margin-right: 10px"
              size="mini"
            ></el-input-number>
            组件间距
            <el-input-number
              v-model="COMPONENT_GAP"
              :min="0"
              :max="32"
              :step="8"
              style="width: 90px; margin-right: 10px"
              size="mini"
            ></el-input-number>
            <!--背景颜色
          <el-color-picker
            size="mini"
            v-model="BACKGROUND_COLOR"
            style="vertical-align: middle"
          ></el-color-picker>-->
            <!-- <el-button
        size="mini"
        @click="key++">增加key</el-button>-->
          </template>
          <div
            v-if="$isAdmin && editMode"
            style="
              display: inline-block;
              width: 1px;
              height: 30px;
              background-color: #e1e2e4;
              vertical-align: middle;
              position: relative;
              top: -2px;
              margin: 0 2px;
            "
          ></div>
          <datablau-button
            v-if="$isAdmin && editMode"
            style="margin-left: 10px"
            @click="resetAll"
          >
            {{ $t('common.button.reset') }}
          </datablau-button>
          <datablau-button
            v-if="$isAdmin && editMode"
            type="primary"
            style="margin-left: 10px"
            @click="handleSave"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button v-if="$isAdmin && editMode" @click="handleCancel">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </span>
      </div>
      <div
        v-if="dashboardProperties.dashboardName === 'dataQuality'"
        style="margin-top: 1px"
      >
        <searchHead></searchHead>
      </div>
      <div
        class="vdrs"
        :class="{
          'm-vdrs': !$isAdmin,
          'dataAsset-vdrs': from === 'dataAsset' && !$isAdmin,
        }"
        :style="{
          height:
            dashboardProperties.dashboardName === 'dataQuality' ? '2160px' : '',
        }"
        ref="box"
        :key="key"
      >
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
  overflow-x: hidden;
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
.dataAsset-vdrs {
  margin-top: 40px;
}
/deep/ .el-dropdown {
  background: #409eff;
  color: #fff;
  padding: 7px 10px;
  border-radius: 2px;
  font-size: 12px;
  position: relative;
  top: 3px;
  cursor: pointer;
}
.forPdf {
  overflow: hidden;
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
.asset {
  float: left;
  .slect {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 111;
    top: 5px;
    left: 9px;
    & > span {
      display: block;
      width: 56px;
      height: 32px;
      line-height: 32px;
      /* margin-top: 3px; */
      border-radius: 2px;
      top: 3px;
      text-align: center;
      font-size: 12px;
      background: #fff;
      margin-right: 21px;
      position: relative;
      &:after {
        content: '';
        position: absolute;
        width: 1px;
        height: 16px;
        background: #999;
        top: 6px;
        right: -12px;
      }
    }
  }
  /*/deep/ .slect {*/
  /*  .datablau-select .el-select .el-input input {*/
  /*    !*padding: 0;*!*/
  /*    !*background: none;*!*/
  /*    border: 0;*/
  /*    width: 100%;*/
  /*    background: #409eff;*/
  /*    color: #fff;*/
  /*    padding-left: 10px;*/
  /*    height: 29px;*/
  /*    line-height: 29px;*/
  /*    margin-top: 6px;*/

  /*
  /*  }*/
  /*}*/
  /*.slect /deep/ .datablau-select .el-select .el-input span i {*/
  /*  line-height: 29px;*/
  /*  margin-top: 3px;*/
  /*}*/
  /*.slect /deep/ .el-select .el-input {*/
  /*  /deep/ &:hover .el-select__caret {*/
  /*    color: #fff;*/
  /*  }*/
  /*}*/
  /*.slect /deep/.datablau-select .el-select .el-input .el-select__caret {*/
  /*  color: #fff;*/
  /*}*/
  .bianjibtn {
    position: absolute;
    top: 18px;
    right: 107px;
    cursor: pointer;
    color: #999;
    &:hover {
      color: #409eff;
    }
  }
}
</style>
