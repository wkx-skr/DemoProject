<template>
  <div id="ruleTemplateDiv">
    <datablau-list-search style="margin: 0 20px">
      <template slot="title">
        <div>{{ $t('common.page.ruleTemplate') }}</div>
      </template>
      <div>
        <el-form>
          <el-form-item>
            <datablau-input
              maxlength="256"
              clearable
              v-model="searchWord"
              :iconfont-state="true"
              :placeholder="$t('quality.page.ruleTemplate.placeholderInput')"
              @keyup.enter.native="filter"
              test-name="ruleTemplate_keyword"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('quality.page.ruleTemplate.ruleType')">
            <datablau-select
              v-model="selectWord"
              test-name="ruleTemplate_selectWord"
            >
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.optionValue"
                :value="item.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('system.userGroup.updateTime')">
            <datablau-dateRange
              v-model="dataTime"
              clearable
              style="
                display: inline-block;
                vertical-align: bottom;
                line-height: 33px;
              "
              test-name="ruleTemplate_dataTime"
            ></datablau-dateRange>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button
              type="normal"
              @click="query()"
              test-name="ruleTemplate_queryButton"
            >
              {{ $t('quality.page.ruleTemplate.query') }}
            </datablau-button>
          </el-form-item>
        </el-form>
      </div>
      <template slot="buttons">
        <datablau-button
          type="important"
          @click="addTab"
          v-if="$auth['QUALITY_RULE_TEMPLATE_ADD']"
          test-name="ruleTemplate_addTemplate"
        >
          {{ $t('quality.page.ruleTemplate.addTemplate') }}
        </datablau-button>
        <el-dropdown
          v-if="$auth['QUALITY_RULE_TEMPLATE_IMPORT']"
          trigger="click"
          style="margin-left: 10px"
        >
          <datablau-button
            type="secondary"
            class="el-dropdown-link"
            test-name="ruleTemplate_moreOperation"
          >
            {{ $t('quality.page.ruleTemplate.moreOperation') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu style="margin-top: 4px" slot="dropdown">
            <el-dropdown-item
              icon="el-icon-upload"
              @click.native="importTemplate"
            >
              {{ $t('quality.page.ruleTemplate.importTemplate') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </datablau-list-search>

    <datablau-form-submit style="margin-top: 84px">
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%; height: 100%"
        height="100%"
        :header-cell-style="{
          color: '#494850',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
        @selection-change="handleSelectionChange"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        :checkDisabledObj="checkDisabledObj"
        test-name="ruleTemplate_table"
      >
        <el-table-column width="18">
          <datablau-icon
            :data-type="'ruletemplate'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          prop="templateName"
          :label="$t('quality.page.ruleTemplate.templateName')"
          :sortable="false"
          :sort-method="nameSort"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="ruleClass"
          :label="$t('quality.page.ruleTemplate.ruleClass')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ classTypeMapping[scope.row.ruleClass] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="creatorName"
          :label="$t('quality.page.ruleTemplate.creatorName')"
          :sortable="false"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                getPeopleName([scope.row.creatorName])
                  ? getPeopleName([scope.row.creatorName])
                  : scope.row.creatorName
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          :label="$t('system.userGroup.updateTime')"
          :sortable="false"
          :formatter="$timeFormatter"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('quality.page.ruleTemplate.handle')"
          align="center"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              @click.stop="handleRowClick(scope.row)"
              :title="$t('quality.page.ruleTemplate.button.scan')"
              test-name="ruleTemplate_scan"
            >
              <i class="iconfont icon-see"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :disabled="scope.row.builtIn === 1"
              v-if="$auth['QUALITY_RULE_TEMPLATE_EDIT']"
              :title="$t('quality.page.ruleTemplate.button.edit')"
              @click.stop="addEdit(scope.$index, scope.row)"
              test-name="ruleTemplate_bianji"
            >
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :disabled="scope.row.builtIn === 1"
              v-if="$auth['QUALITY_RULE_TEMPLATE_EXPORT']"
              :title="$t('quality.page.ruleTemplate.button.export')"
              @click.stop="exportTemplate(scope.row)"
              test-name="ruleTemplate_export"
            >
              <i class="iconfont icon-export"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :disabled="scope.row.builtIn === 1"
              v-if="$auth['QUALITY_RULE_TEMPLATE_DELETE']"
              :title="$t('quality.page.ruleTemplate.button.delete')"
              @click.stop="deleteThis(scope.row)"
              test-name="ruleTemplate_delete"
            >
              <i class="iconfont icon-delete 搜索"></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="!deleteDisabled">
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: selection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="deleteThis"
            :disabled="deleteDisabled"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="manyEachPage"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <el-upload
      style="z-index: -9999; height: 0"
      :action="$quality_url + '/template/import'"
      :show-file-list="false"
      v-if="showUpload"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <el-button type="text" size="small" ref="updateTemplate"></el-button>
    </el-upload>
    <datablau-dialog
      size="l"
      append-to-body
      :title="
        $t('common.page.ruleTemplate') +
        (this.$i18n.locale === 'en' ? '  ' : '') +
        $t('common.button.import')
      "
      :height="300"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <div class="exportError">
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
          style="float: right; margin-right: -8px"
          type="text"
          @click="exportTemplates"
        >
          {{ $t('quality.page.ruleTemplate.downloadTemplate') }}
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
  </div>
</template>

<script>
import ruleTemplate from './ruleTemplate.js'
export default ruleTemplate
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
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
.left-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 20px;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 13px;
      color: white;
    }
  }
}
.table-row {
  top: 62px;
  left: 20px;
  right: 20px;
  margin-top: 10px;
}
#ruleTemplateDiv {
  width: 100%;
  background-color: var(--default-bgc);
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: auto;
}
.search {
  width: 17vw;
  min-width: 200px;
  margin: 0 40px 10px 20px;
}
.top {
  /*width: 1100px;*/
  width: 98%;
  min-width: 1000px;
  span {
    font-size: 14px;
  }
  .query {
    margin-left: 40px;
  }
  .rightButton {
    float: right;
    margin-left: 10px;
  }
}
.body {
  margin-top: 15px;
  .table {
    //position: absolute;
    //top: 40px;
    //left: 0;
    margin-left: 10px;
    margin-top: -10px;
    min-width: 1000px;
  }
}
/*.icon{*/
/*  transform: scale(1.5);*/
/*  margin-right: 30px;*/
/*}*/
/*.icon:hover{*/
/*  background-color: lightgray;*/
/*}*/
.page {
  position: absolute;
  bottom: 0;
  right: 20px;
}
.four {
  position: absolute;
  left: 20px;
  bottom: 5px;
}
.history {
  padding: 0;
  margin-right: 20px;
  border: none;
  font-size: 12px;
  background-color: transparent;
}
.grey:hover {
  color: #c0c4cc;
}
.green:hover {
  color: #6a9a3a;
}
.bottom {
  position: absolute;
  bottom: 10px;
  right: 0;
  width: 100%;
  min-width: 1000px;
}
.btn-bottom {
  position: absolute;
  bottom: 0;
  left: 20px;
}
</style>
