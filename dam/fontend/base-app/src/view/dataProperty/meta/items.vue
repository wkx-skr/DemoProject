<template>
  <div style="padding-left: 20px; margin-right: 20px">
    <datablau-dialog
      title="物理类扩展属性"
      :visible.sync="udpDialogVisible"
      :close-on-click-modal="true"
      append-to-body
      width="800px"
      :height="530"
      custom-class="dialog-set-udp"
    >
      <set-udp
        v-if="udpDialogVisible"
        @closeSetUp="closeSetUp"
        :groupId="0"
      ></set-udp>
    </datablau-dialog>
    <datablau-dialog
      title="逻辑类扩展属性"
      :visible.sync="udpLogicalDialogVisible"
      :close-on-click-modal="true"
      append-to-body
      width="800px"
      :height="530"
      custom-class="dialog-set-udp"
    >
      <set-udp
        v-if="udpLogicalDialogVisible"
        @closeSetUp="closeSetUpLogical"
        :groupId="1"
      ></set-udp>
      <!-- <set-udp-logical @closeSetUp="closeSetUpLogical"></set-udp-logical> -->
    </datablau-dialog>
    <div style="float: right; margin-top: 10px" class="model-btn">
      <!-- <datablau-page-title
        :name="model.name"
        style="margin-left: -8px"
      ></datablau-page-title> -->
      <div
        style="display: inline-block"
        v-if="model && typeof model === 'object' && showModelCompare"
      >
        <datablau-button
          size="mini"
          v-if="
            $versionFeature.metadata_ModelCompare &&
            accessModelCompare &&
            !(
              model.type === 'SCHEMA' &&
              (logicalType === 'DATADICTIONARY_LOGICAL' ||
                logicalType === 'DATADICTIONARY')
            )
          "
          @click="openModelCompareJob"
          class="iconfont icon-contrast"
        >
          {{ $t('meta.DS.tree_modelDiffAndSync') }}
        </datablau-button>
        <!--<datablau-button
          size="mini"
          v-if="accessModelCompare"
          @click="openModelCompare"
          class="iconfont icon-shuju right-btn-info"
        >
          {{ $t('meta.DS.tree_metaDataDiff') }}
        </datablau-button>-->
        <!-- <datablau-button size="small" v-if="accessHistory" @click="openHistory">
          变更历史
        </datablau-button> -->
        <datablau-button
          size="mini"
          type="secondary"
          class="el-icon-edit right-btn-info"
          style="vertical-align: middle"
          v-if="false && accessEditDataSource && $auth['EDIT_DATA_SOURCE']"
          @click="jumpToDataSource"
        >
          {{ $t('meta.dataSource.editDataSource') }}
        </datablau-button>
      </div>
      <el-dropdown
        trigger="click"
        style="margin-left: 10px"
        @command="handleCommand"
        v-if="!showShareFile && $auth['BUSINESS_ATTR']"
      >
        <datablau-button
          test-name="metadata_udp"
          class="iconfont icon-expand right-btn-info"
          type="secondary"
          size="mini"
        >
          {{ $t('meta.DS.udp.udp') }}
        </datablau-button>
        <el-dropdown-menu style="margin-top: 4px" slot="dropdown">
          <el-dropdown-item command="setUdp">物理类扩展属性</el-dropdown-item>
          <el-dropdown-item command="setUdpLogical">
            逻辑类扩展属性
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- <datablau-page-title
      v-else-if="model"
      name="全部文件类资产"
      style="margin-left: -8px"
    ></datablau-page-title>
    <datablau-page-title
      v-else
      name="全部元数据"
      style="margin-left: -8px"
    ></datablau-page-title> -->
    <div class="row-filter">
      <!-- <span class="label" style="margin-right: 0.5em">关键字</span> -->
      <datablau-input
        :style="{ width: $i18n.locale === 'zh' ? '200px' : '200px' }"
        style="display: inline-block"
        :iconfont-state="true"
        v-model="keyword"
        clearable
        @keydown.enter.native="handleCurrentChange(1)"
        :placeholder="$t('meta.DS.placeholder')"
      ></datablau-input>
      <span
        v-if="!showSmbModel"
        :style="{ 'margin-left': $i18n.locale === 'zh' ? '30px' : '10px' }"
      >
        <!-- <span class="label" style="margin-left: 2em; margin-right: 1em">
          资产类型
        </span> -->
        <div
          style="display: inline-block; margin-right: 10px"
          v-if="!hideListCheckbox && !isMetaModel"
          class="filter-checkbox"
        >
          <el-checkbox
            v-for="(item, key) in dataTypeMap2"
            :key="item"
            @change="handleDataTypeChange(key)"
            v-model="dataTypeChosen[key]"
            :disabled="checkboxDisabled"
            style="margin-right: 24px"
          >
            {{ item }}
          </el-checkbox>
        </div>
        <div
          style="display: inline-block; margin-right: 10px"
          v-if="!hideListCheckbox && isMetaModel"
          class="filter-checkbox"
        >
          <el-checkbox
            v-for="(item, key) in dataTypeMap3"
            :key="item.id"
            @change="handleDataTypeChange(key)"
            v-model="dataTypeChosen[item.id]"
            :disabled="checkboxDisabled"
            style="margin-right: 24px"
          >
            {{ item.chineseName }}
          </el-checkbox>
        </div>

        <span
          class="filter-header-btn"
          v-if="!hideListFilter"
          :class="!showTag ? '' : 'active'"
        >
          <datablau-button
            test-name="metadata_list_morefilter"
            type="text"
            @click="showFilterTag"
            class="iconfont icon-filter"
          >
            {{ $t('meta.DS.filter.moreFilter') }}
          </datablau-button>
        </span>
        <el-dropdown
          v-if="hideListFilter || hideListCheckbox"
          :hide-on-click="false"
        >
          <datablau-button
            type="text"
            style="padding: 0"
            class="btn-el el-icon-d-arrow-right"
          ></datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a" v-if="hideListCheckbox">
              <template>
                <div v-if="!isMetaModel" style="display: inline-block">
                  <el-checkbox
                    v-for="(item, key) in dataTypeMap2"
                    :key="item"
                    @change="handleDataTypeChange(key)"
                    v-model="dataTypeChosen[key]"
                    :disabled="checkboxDisabled"
                    :style="{
                      'margin-right': $i18n.locale === 'zh' ? '30px' : '24px',
                    }"
                    style="display: block"
                  >
                    {{ item }}
                  </el-checkbox>
                </div>

                <div style="display: inline-block" v-if="isMetaModel">
                  <el-checkbox
                    v-for="(item, key) in dataTypeMap3"
                    :key="item"
                    @change="handleDataTypeChange(key)"
                    v-model="dataTypeChosen[item.id]"
                    :disabled="checkboxDisabled"
                    style="display: block"
                  >
                    {{ item.chineseName }}
                  </el-checkbox>
                </div>
              </template>
            </el-dropdown-item>
            <el-dropdown-item
              v-if="hideListFilter"
              :divided="hideListFilter && hideListCheckbox"
            >
              <template>
                <datablau-button
                  type="text"
                  @click="showFilterTag"
                  class="iconfont icon-filter"
                  :class="!showTag ? 'primary-btn' : 'normal-btn'"
                >
                  {{ $t('meta.DS.filter.moreFilter') }}
                </datablau-button>
              </template>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span>

      <div
        class="tag-bar oneline-eclipse"
        :class="{ expand: expand }"
        v-if="!showSmbModel && showTag"
      >
        <div style="display: inline-block; margin-right: 10px" v-if="false">
          <span class="label" style="margin-right: 6px">元模型对象：</span>
          <datablau-select
            v-model="metaModelObject"
            clearable
            filterable
            style="width: 120px; display: inline-block"
            @change="handleMetaModelObjectChange"
          >
            <el-option
              v-for="item in metaModelObjectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
        <div style="display: inline-block; margin-right: 10px">
          <span class="label" style="margin-right: 6px">
            {{ $t('meta.DS.tableDetail.lineage.label') }}
          </span>
          <datablau-select
            v-model="lineageBindValue"
            clearable
            filterable
            style="width: 120px; display: inline-block"
            @change="lineageBindChange"
          >
            <el-option
              v-for="item in lineageBindOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
        <span class="label">
          {{ $t('meta.DS.filter.tag') }}
        </span>
        <div class="tagWrap" style="display: inline-block">
          <datablau-tooltip
            v-for="(v, i) in currentTag"
            :content="tagNames[i]"
            placement="top"
            :disabled="long"
            v-if="currentTag && i < 5"
            :key="i"
          >
            <el-tag
              @mouseover.native="getTooltip($event)"
              style="margin-left: 0.3em"
              size="small"
              closable
              @close="handleClose(v, i)"
            >
              <span
                style="
                  display: inline-block;
                  max-width: 96px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  vertical-align: bottom;
                "
              >
                {{ tagNames[i] }}
              </span>
            </el-tag>
          </datablau-tooltip>
        </div>

        <span v-if="currentTag && currentTag.length > 5">
          {{ $t('meta.DS.filter.etcTag').format(currentTag.length) }}
        </span>
        <datablau-button size="small" type="text" @click="callTagSelector">
          {{ $t('meta.DS.filter.filterByTag') }}
          <i class="el-icon-plus" style="font-weight: bold"></i>
        </datablau-button>
        <datablau-button
          type="text"
          size="small"
          @click="cancelTagSelect"
          v-if="currentTag && currentTag.length"
        >
          {{ $t('meta.DS.filter.cancelFilterByTag') }}
        </datablau-button>
      </div>
    </div>
    <div class="row-items" :class="{ high: showSmbModel, 'show-tag': showTag }">
      <div class="item-outer" v-if="!showSmbModel">
        <!--<div
          class="item-outer"
          v-for="v in searchResult"
          :key="v.objectId ? v.objectId+'dOuter': v.id+'fOuter'"
        >
          <search-item
            @itemClick="handleItemClick"
            :expand="expand"
            :key="v.objectId+'db'"
            :item="v"
          ></search-item>
        </div>-->
        <datablau-table
          ref="itemTable"
          class="datablau-table-info"
          :data="searchResult"
          height="100%"
          :checkDisabledObj="checkDisabledObj"
          row-class-name="row-can-click"
          @row-click="handleItemClick"
          @sort-change="handleSortChange"
          @selection-change="handleSelectionChange"
          :data-selectable="option.selectable"
          :auto-hide-selection="option.autoHideSelectable"
          :show-column-selection="option.showColumnSelection"
          :column-selection="option.columnSelection"
          :border="option.columnResizable"
          reserve-selection
          row-key="objectId"
        >
          <el-table-column width="28" header-align="center" align="center">
            <template slot-scope="scope">
              <!-- <i :class="getIconClass(scope.row)"></i> -->
              <datablau-tooltip
                :disabled="
                  scope.row.type == 'TABLE' ||
                  scope.row.type == 'COLUMN' ||
                  scope.row.type == 'VIEW'
                "
                :content="$t('meta.DS.metaTable.notSupportExport')"
              >
                <span>
                  <datablau-icon
                    class="iconForIe"
                    v-if="scope.row.type !== 'META_MODEL'"
                    :data-type="
                      scope.row.type === 'TABLE' && scope.row.logicalElement
                        ? 'logicaltable'
                        : scope.row.type === 'COLUMN' &&
                          scope.row.logicalElement
                        ? 'logicalcolumn'
                        : scope.row.type
                    "
                    :key="scope.row.objectId"
                    :size="18"
                    style="position: relative; margin-left: 5px; top: 3px"
                  ></datablau-icon>
                  <img
                    v-else
                    :src="metaModelIconMap[scope.row.typeId]"
                    width="18"
                    height="18"
                    alt=""
                  />
                </span>
              </datablau-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.DS.metaTable.enName')"
            prop="name"
            sortable="custom"
            show-overflow-tooltip
            min-width="150"
          >
            <template slot-scope="scope">
              <b>{{ scope.row.physicalName }}</b>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.DS.metaTable.chineseName')"
            show-overflow-tooltip
            :width="$i18n.locale === 'zh' ? '' : 120"
          >
            <template slot-scope="scope">
              {{ logicalNameFormatter(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            :width="$i18n.locale === 'zh' ? '' : 120"
            :label="$t('meta.DS.metaTable.type')"
            header-align="left"
            align="center"
          >
            <template slot-scope="scope">
              <p
                class="model-meta-type"
                :class="scope.row.type"
                v-if="scope.row.type === 'META_MODEL'"
              >
                <is-show-tooltip
                  :content="
                    dataTypeMap3.filter(e => e.id === scope.row.typeId)[0]
                      .chineseName
                  "
                ></is-show-tooltip>
              </p>
              <p class="model-meta-type" :class="scope.row.type" v-else>
                {{
                  scope.row.type === 'TABLE' && scope.row.logicalElement
                    ? '实体'
                    : scope.row.type === 'COLUMN' && scope.row.logicalElement
                    ? '属性'
                    : dataTypeMap[scope.row.type.toLowerCase()]
                }}
              </p>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.DS.metaTable.businessSystem')"
            min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{
                !$modelCategoriesDetailsMap[scope.row.modelCategoryId]
                  ? '--'
                  : $modelCategoriesDetailsMap[scope.row.modelCategoryId]
                      .displayName
              }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="数据源" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.parentPhysicalName }}
              <span v-if="scope.row.parentLogicalName">
                ({{ scope.row.parentLogicalName }})
              </span>
            </template>
          </el-table-column> -->
          <el-table-column
            label="Schema"
            prop="schema"
            show-overflow-tooltip
            v-if="!isMetaModel"
          ></el-table-column>
          <el-table-column
            :label="$t('meta.DS.metaTable.tech')"
            :width="$i18n.locale === 'zh' ? '' : 220"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{
                !$modelCategoriesDetailsMap[scope.row.modelCategoryId]
                  ? '--'
                  : $modelCategoriesDetailsMap[scope.row.modelCategoryId]
                      .itDepartmentName
              }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="120"
            :label="$t('meta.DS.metaTable.createTime')"
            prop="creationTime"
            sortable="custom"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ $timeFormatter(scope.row.creationTime).slice(0, -3) }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.DS.metaTable.dataManagers')"
            :width="$i18n.locale === 'zh' ? 80 : 100"
            show-overflow-tooltip
            v-if="!isMetaModel"
          >
            <template slot-scope="scope">
              {{ dealdataManagers(scope.row.dataManagers) }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('meta.DS.metaTable.operation')"
            :width="$i18n.locale === 'zh' ? 80 : 100"
            fixed="right"
            align="center"
          >
            <template slot-scope="scope">
              <datablau-button type="icon" @click="handleItemClick(scope.row)">
                <i
                  class="iconfont icon-see"
                  :title="$t('meta.DS.metaTable.btn_view')"
                ></i>
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <div class="item-outer" v-else>
        <smb-share-file-item
          v-for="v in searchResult"
          @itemClick="handleItemClick"
          :expand="expand"
          :key="v.id + 'file'"
          :item="v"
        ></smb-share-file-item>
      </div>
    </div>
    <div class="row-page-info">
      <span v-if="mutipleLength" class="check-info"></span>
      <span v-if="mutipleLength" class="footer-row-info">
        {{ $t('meta.DS.metaTable.exportTips', { exportNum: mutipleLength }) }}
      </span>
      <datablau-button
        type="danger"
        class="iconfont icon-delete"
        v-show="mutipleLength"
        v-if="isMetaModel"
        @click="deleteMetaModel"
      >
        {{ $t('common.button.delete') }}
      </datablau-button>
      <datablau-button
        type="primary"
        v-show="mutipleLength"
        @click="exportItems"
        :disabled="exportItemsDisabled"
        v-if="$auth.EXPORT_METADATA && !isMetaModel"
      >
        <i class="iconfont icon-export"></i>
        {{ $t('meta.DS.metaTable.export') }}
      </datablau-button>
      <datablau-pagination
        class="ddc-pagination"
        style="padding-top: 10px; float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
import items from './items'
export default items
</script>
<style lang="scss" scoped>
@import './items';
.el-dropdown-menu .el-dropdown-menu__item {
  height: auto !important;
}
// 弹出框样式
.el-dialog__wrapper {
  /deep/ .el-dialog {
    position: relative;
    padding-top: 50px;
    padding-bottom: 20px;
    .el-dialog__header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      padding: 20px 20px 0;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;

      .el-dialog__headerbtn {
        top: 20px;

        i {
          font-size: 14px;
        }
      }

      .el-dialog__title {
        color: #555;
        font-weight: 500;
      }
    }

    .el-dialog__body {
      overflow: auto;
      margin-top: 10px;
      padding-bottom: 0;

      .form-item-footer {
        bottom: 20px;
        left: 0;
        width: 100%;
        text-align: right;
      }
    }

    .el-dialog__footer {
      padding-bottom: 0;
    }
  }
}
</style>
