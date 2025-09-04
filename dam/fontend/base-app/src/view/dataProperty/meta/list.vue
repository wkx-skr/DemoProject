<template>
  <div
    class="list-box"
    :style="{ width: $i18n.locale === 'zh' ? '280px' : '320px' }"
  >
    <datablau-dialog
      :visible.sync="reDialog"
      :title="$t('meta.reManage.title')"
      append-to-body
      size="s"
      height="400"
    >
      <div class="reContent">
        <datablau-detail
          label-width="100px"
          :model="reForm"
          :column="1"
          :fullWidth="true"
        >
          <el-form-item :label="$t('meta.reManage.reInfo')">
            <span class="reFormItem" :title="reForm.definition">
              {{ reForm.definition }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.system')" v-show="isFile">
            <span class="reFormItem" :title="reForm.categoryName">
              {{ reForm.categoryName }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.datasource')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.datasourceName">
              {{ reForm.datasourceName }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.db')">
            <span class="reFormItem" :title="reForm.type">
              {{
                reForm.type === 'DATADICTIONARY_LOGICAL'
                  ? 'Data Dictionary (Logical)'
                  : reForm.type === 'DATADICTIONARY'
                  ? 'Data Dictionary (Physical)'
                  : reForm.type
              }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.driver')" v-show="!isFile">
            <span class="reFormItem" :title="reForm.driverName">
              {{ reForm.driverName }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.server')" v-show="!isFile">
            <span class="reFormItem" :title="reForm.HostServer">
              {{ reForm.HostServer }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.dataConnect')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.dataConnect">
              {{ reForm.dataConnect }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.dataSample')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.dataSample">
              {{ reForm.dataSample }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.backupDatasource')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.backupDatasourceName">
              {{ reForm.backupDatasourceName }}
            </span>
          </el-form-item>
          <!--          文件 -->
          <el-form-item :label="$t('meta.reManage.reType')" v-if="isFile">
            <span class="reFormItem" :title="reForm.reType">
              {{ reForm.reType }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.fileName')"
            v-if="isFile && !isAuto"
          >
            <span class="reFormItem" :title="reForm.fileName">
              {{ reForm.fileName }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.filePath')"
            v-if="isFile && isAuto"
          >
            <span class="reFormItem" :title="reForm.filePath">
              {{ reForm.filePath }}
            </span>
          </el-form-item>
        </datablau-detail>
      </div>
    </datablau-dialog>
    <div class="top-row">
      <el-dropdown
        style="
          cursor: pointer;
          margin-left: 20px;
          margin-top: 15px;
          transition: all 0.8s linear;
        "
        trigger="click"
        v-if="!showSearchInput"
        @command="handleCommand"
      >
        <span class="el-dropdown-link" style="font-size: 12px; color: #555555">
          {{ classifyLabelMap[classifyType] }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="itDepartment">
            {{ $t('meta.DS.groupBy.tech') }}
          </el-dropdown-item>
          <el-dropdown-item command="businessDepartment">
            {{ $t('meta.DS.groupBy.business') }}
          </el-dropdown-item>
          <el-dropdown-item command="zone">
            {{ $t('meta.DS.groupBy.zone') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <datablau-input
        style="
          position: absolute;
          right: 85px;
          top: 10px;
          left: 10px;
          transition: all 0.8s linear;
        "
        v-model="keyword"
        :iconfont-state="true"
        clearable
        ref="metaInput"
        v-if="showSearchInput"
        @blur="handleSearchBlur"
        :placeholder="$t('common.placeholder.normal')"
      ></datablau-input>
      <div class="btn-all">
        <datablau-button
          v-show="!showSearchInput"
          class="iconfont icon-search btn-info top-btn"
          @click="changeShowInput"
          type="text"
        ></datablau-button>
        <el-tooltip
          effect="dark"
          :content="
            showFilteredNode
              ? $t('meta.DS.tree_filterEmpty')
              : $t('meta.DS.tree_showAll')
          "
          placement="top-start"
          popper-class="meta-top-tooltip"
        >
          <datablau-button
            class="iconfont btn-info top-btn"
            :class="
              showFilteredNode ? 'icon-hide primary-btn' : 'icon-shujuyuan'
            "
            type="text"
            @click="handleTreeFiltered"
          ></datablau-button>
        </el-tooltip>
        <el-tooltip
          effect="dark"
          :content="
            showUnFold ? $t('meta.DS.tree_unFold') : $t('meta.DS.tree_fold')
          "
          placement="top-start"
          popper-class="meta-top-tooltip"
        >
          <datablau-button
            class="iconfont top-btn"
            :class="showUnFold ? 'icon-shouqi' : 'icon-zhankai'"
            @click="expandOrCollapseTopLevel"
            type="text"
          ></datablau-button>
        </el-tooltip>
      </div>
    </div>
    <div class="second-row-info">
      <p @click="handleAllShow" :class="{ 'is-active': isAllActive }">
        <i class="iconfont icon-shuju"></i>
        <span>{{ $t('meta.DS.tree_allMetaData') }}</span>
      </p>
      <p @click="handleAllSouceShow" :class="{ 'is-active': isAllSouceActive }">
        <i class="iconfont icon-shujuyuan all"></i>
        <span>{{ $t('meta.DS.tree_allDataSource') }}</span>
      </p>
    </div>
    <datablau-tree
      class="grey-tree"
      ref="tree2"
      style="
        position: absolute;
        top: 137px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
        min-height: 300px;
      "
      @node-click="handleNodeClick"
      node-key="treeId"
      :props="defaultProps"
      :default-expanded-keys="expandedKeys"
      auto-expand-parent
      :data="treeData"
      :data-supervise="supervise"
      :data-icon-function="dataIconFunction"
      :data-options-function="dataOptionsFunction"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      v-loading="treeLoading"
      :allow-drag="allowDrag"
      :draggable="false"
      :emptyText="emptyText"
    ></datablau-tree>
    <!-- 导入/更新元数据弹框 -->
    <datablau-dialog
      size="l"
      append-to-body
      :title="importDialogTitle"
      :height="300"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <!-- 元模型元数据的导入这个红框要隐藏掉, 技术元数据不隐藏 -->
      <div
        class="exportError"
        v-if="
          reFormType !== 'DATADICTIONARY_LOGICAL' &&
          reFormType !== 'DATADICTIONARY'
        "
        v-show="!(currentImportDir.metaModelCode && currentImportDir.metaModelCode !== 'LDM')"
      >
        <span class="exportErrorSpan">
          {{ $t('common.export.exportError') }}
        </span>
        <datablau-radio v-model="exportType">
          <el-radio class="radio-info" :label="true">
            {{ $t('common.export.option1') }}
          </el-radio>
          <el-radio class="radio-info" :label="false">
            {{ $t('common.export.option2') }}
          </el-radio>
        </datablau-radio>
        <div style="display: inline-block">
          <span class="remark-info" style="display: flex; align-items: center">
            <i class="iconfont icon-tips"></i>
            <p
              style="
                white-space: pre-line;
                padding-left: 0px;
                line-height: 1.2;
                margin-left: 6px;
              "
            >
              {{ $t('common.export.exportTip') }}
            </p>
          </span>
        </div>
      </div>
      <div class="uploadContent">
        <p class="uploadtip">
          {{ $t('quality.page.dataQualityRules.importRules.uploadtip') }}
        </p>
        <datablau-button
          @click="downloadMetaModelTemplate"
          type="text"
          style="float: right"
          v-if="importDialogTitle === '导入元数据'"
        >
          下载模板
        </datablau-button>
        <datablau-upload
          :action="standardUploadUrl"
          :before-upload="showBegain"
          :on-error="handleUpdateMetadataError"
          :on-success="handleUpdateMetadataSuccess"
          :on-change="onChange"
          :before-remove="beforeRemove"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="standardImport"
          :isEdit="true"
          :limit="1"
          :auto-upload="false"
          class="standardImport-upload"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>
                {{
                  $t('quality.page.dataQualityRules.importRules.uploadTemplate')
                }}
              </span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button
          :disabled="formFile.length === 0"
          type="primary"
          @click="standardImportAction"
        >
          {{ $t('domain.common.confirm') }}
        </datablau-button>
        <datablau-button type="secondary" @click="uploadDialogVisible = false">
          {{ $t('domain.common.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <el-upload
      v-show="false"
      v-if="showUpload"
      :action="this.$meta_url + '/models/' + currentModelId + '/updateMetadata'"
      :show-file-list="false"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      accept=".xlsx,.xls"
      :on-error="handleUpdateMetadataError"
    >
      <datablau-button
        type="text"
        size="small"
        ref="refreshMeta"
      ></datablau-button>
    </el-upload>
  </div>
</template>

<script>
import list from './list'
export default list
</script>

<style scoped lang="scss">
@import './color.scss';
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .list-box .top-row .btn-all {
    .is-block {
      display: inline !important;
    }
  }
  .list-box .top-row .btn-all .btn-info:after {
    display: inline !important;
  }
}
.uploadContent {
  clear: both;
  background: #f7f9fb;
  border-radius: 4px;
  padding: 16px;
  .uploadtip {
    font-size: 12px;
    color: $text-message;
    padding-bottom: 16px;
    display: inline-block;
  }
  .autoCode {
    padding-top: 16px;
  }
}
.exportError {
  clear: both;
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}
.list-box {
  position: absolute;
  left: 0;
  z-index: 2;
  //width: 280px;
  top: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  // border:1px solid var(--border-color-lighter);
  // border-left: none;
  //background-color:#FFF;
  .top-row {
    height: 54px;
    .dropdown-info {
      padding: 20px 10px;
    }
    .btn-all {
      display: inline-block;
      float: right;
      margin-right: 10px;
      margin-top: 10px;
      line-height: 34px;
      .btn-info {
        &:after {
          content: '';
          width: 1px;
          height: 16px;
          display: inline-block;
          margin-left: 10px;
          vertical-align: middle;
          background-color: $border-color;
        }
      }
      .top-btn {
        margin-left: 10px;
        padding: 0;
        &:before {
          color: $text-disabled;
        }
        &:hover {
          background: none;
          &:before {
            color: $primary-color;
          }
        }
        &:nth-of-type(2) {
        }
      }
    }
  }
  .second-row-info {
    p {
      padding-left: 20px;
      cursor: pointer;
      font-size: 12px;
      font-weight: normal;
      height: 34px;
      line-height: 34px;
      span {
      }
      i {
        &:before {
          font-size: 16px;
          color: $primary-color;
          margin-right: 7px;
        }
      }
      &:hover {
        background: $table-hover-color;
      }
      &.is-active {
        background: $table-hover-color;
        span {
          color: $primary-color;
        }
      }
    }
    &:after {
      content: '';
      width: 100%;
      height: 1px;
      display: inline-block;
      margin-bottom: 6px;
      background: $component-divide-color;
    }
  }
}
.el-dialog {
  .reContent {
    .el-form-item {
      width: 100%;
    }
  }
}
</style>

<style lang="scss">
.el-tooltip__popper.meta-top-tooltip {
  padding: 5px;
}
.el-dialog {
  .reContent {
    .el-form-item {
      padding-right: 0;
    }
    .reFormItem {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      /*! autoprefixer: off */
      -webkit-box-orient: vertical;
      /* autoprefixer: on */
      text-overflow: ellipsis;
    }
  }
}
</style>
