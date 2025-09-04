<template>
  <div
    class="addreportFormManage tab-page"
    :class="{ 'show-scroll-auto': showHeightAuto }"
  >
    <datablau-dialog
      :title="$t('meta.report.customReportPath')"
      :visible.sync="showCustomReportPath"
      width="560px"
      :append-to-body="true"
      class="custom-report-paht"
      :close-on-click-modal="false"
    >
      <div class="edit-report-path">
        <el-form label-width="120px" class="custom-report-path-form">
          <el-form-item
            v-for="(item, index) in pathFroCustomEdit"
            :key="index"
            :label="
              $t('meta.report.catalogLevel', {
                index: index + 1,
              })
            "
          >
            <datablau-input
              style="display: inline-block"
              clearable
              v-model="pathFroCustomEdit[index]"
              :placeholder="$t('meta.report.fillPath')"
            ></datablau-input>
            <span class="control-icon" style="margin-left: 8px">
              <i class="fa fa-plus-square-o" @click="addPathArr(index + 1)"></i>
              <i
                class="fa fa-minus-square-o"
                @click="removePathArr(index)"
                v-if="pathFroCustomEdit.length > 1"
              ></i>
            </span>
          </el-form-item>
        </el-form>
        <div class="dialog-bottom">
          <datablau-button type="secondary" @click="cancelEditPath">
            {{ $t('common.button.cancel') }}
          </datablau-button>
          <datablau-button
            type="important"
            @click="comfirEditPath"
            :disabled="!canComfirEditPath"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </div>
    </datablau-dialog>
    <index-tree-dialog
      :title="$t('meta.report.selIndex')"
      ref="checkIndexDai"
      :treeData="indexTree"
      :treeProp="treeProp"
      :treeNodeKey="'id'"
      @chickIndex="chickIndex"
    ></index-tree-dialog>
    <datablau-dialog
      :title="this.bottomMap[this.showBottom]"
      :visible.sync="dialogEditVisible"
      width="600px"
      class="app-edit-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <!--      <el-form label-width="120px" v-show="editObj.ediType === 'requirement'">
        <el-form-item :label="$t('meta.report.inDim')">
          <datablau-select-weak
            :optionsData="{
              data: dimensionOptions,
              key: 'value',
              value: 'value',
              label: 'label',
            }"
            v-model="editObj.code"
            filterable
            clearable
            @change="setLabel2Lat"
          ></datablau-select-weak>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.searchItem')"
          :rules="[
            {
              required: true,
              message: $t('meta.report.validate.fillSearchItem'),
              trigger: 'blur',
            },
          ]"
        >
          <el-input size="mini" clearable v-model="editObj.label"></el-input>
        </el-form-item>
        <el-form-item :label="$t('meta.report.searchType')">
          <el-select size="mini" v-model="editObj.description">
            <el-option
              v-for="item in searchWay"
              :key="item"
              :value="item"
              :label="item"
            ></el-option>
          </el-select>
          &lt;!&ndash; <el-input size="mini" clearable v-model="editObj.QueryMode"></el-input> &ndash;&gt;
        </el-form-item>
      </el-form>-->
      <el-form label-width="120px" v-show="editObj.ediType === 'result'">
        <el-form-item :label="$t('meta.report.relationType')">
          <datablau-select-weak
            :optionsData="{
              data: typeArr,
              key: 'value',
              value: 'value',
              label: 'label',
            }"
            v-model="editObj.type"
            @change="editObj.code = ''"
          ></datablau-select-weak>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.relationDim')"
          v-if="editObj.type === 'Lat'"
        >
          <datablau-select-weak
            size="mini"
            :optionsData="{
              data: dimensionOptions,
              key: 'value',
              value: 'value',
              label: 'label',
            }"
            v-model="editObj.code"
            filterable
            clearable
            @change="setLabel2Lat"
          >
            <!-- <el-option
              v-for="item in dimensionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option> -->
          </datablau-select-weak>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.relationIndex')"
          v-else-if="editObj.type === 'Index'"
        >
          <datablau-input
            clearable
            v-model="editObj.code"
            :disabled="true"
            :placeholder="$t('meta.report.selIndex1')"
            v-show="false"
          ></datablau-input>
          <datablau-input
            clearable
            v-model="indexCnAbbr"
            :disabled="true"
            :placeholder="$t('meta.report.selIndex1')"
          ></datablau-input>
          <datablau-button type="secondary" @click="resetIndex">
            {{ $t('common.button.modify') }}
          </datablau-button>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.infoItemName')"
          :rules="[
            {
              required: true,
              message: $t('meta.report.validate.fillInfoItemName'),
              trigger: 'blur',
            },
          ]"
        >
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.columnName"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.report.dataType')">
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.datatype"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.report.tables.subReportName') + '：'">
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.category"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.report.intro')">
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.description"
            type="textarea"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <!--      <el-form label-width="80px" v-show="editObj.ediType === 'dimension'">
        <el-form-item :label="$t('meta.report.dim')">
          <datablau-select-weak
            :optionsData="{
              data: dimensionOptions,
              key: 'value',
              value: 'value',
              label: 'label',
            }"
            size="mini"
            v-model="editObj.code"
            filterable
            clearable
            @change="setLabel2Lat"
          >
            &lt;!&ndash; <el-option
              v-for="item in dimensionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option> &ndash;&gt;
          </datablau-select-weak>
        </el-form-item>
        <el-form-item
          label="列名："
          :rules="[{ required: true, message: '请输入列名', trigger: 'blur' }]"
        >
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.label"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="说明：">
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.description"
            type="textarea"
          ></datablau-input>
        </el-form-item>
      </el-form>-->
      <!--      <el-form label-width="100px" v-show="editObj.ediType === 'indexs'">
        <el-form-item label="使用指标：">
          <datablau-input
            size="mini"
            v-model="editObj.code"
            :disabled="true"
            placeholder="请选择指标"
            v-show="false"
          ></datablau-input>
          <el-input
            size="mini"
            clearable
            v-model="indexCnAbbr"
            :disabled="true"
            placeholder="请选择指标"
          ></el-input>
          <el-button size="mini" @click="resetIndex">修改</el-button>
        </el-form-item>
        <el-form-item label="指标解释：">
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.description"
            placeholder="请填写指标解释"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="信息项名："
          :rules="[
            { required: true, message: '请输入信息项名', trigger: 'blur' },
          ]"
        >
          <datablau-input
            size="mini"
            clearable
            v-model="editObj.columnName"
            placeholder="请填写列名"
          ></datablau-input>
        </el-form-item>
      </el-form>-->
      <el-form
        label-width="80px"
        v-show="editObj.ediType === 'relDb'"
        v-model="editReldbItem"
        class="reldb-edit-from"
      >
        <el-form-item :label="$t('meta.report.dataSource')">
          <el-radio size="mini" v-model="relDbCustom" :label="false">
            {{ $t('meta.report.tableAndColumn') }}
          </el-radio>
          <el-radio
            size="mini"
            v-model="relDbCustom"
            :label="true"
            :disabled="!couldReldbCustom"
          >
            {{ $t('meta.report.customTableAndColumn') }}
          </el-radio>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.dbs')"
          v-if="!relDbCustom"
          :rules="[
            {
              required: true,
              message: this.$t('meta.report.selDbs'),
              trigger: 'blur',
            },
          ]"
        >
          <el-cascader
            v-model="reDbItemDs"
            :placeholder="$t('meta.report.selDataSource')"
            clearable
            size="mini"
            v-if="startEdit && !relDbCustom"
            :options="chooseTreeData"
            :props="dsCascaderProps"
            :show-all-levels="false"
            @change="reDbDsChange"
          >
            <template slot-scope="{ node, data }">
              <span>
                <i
                  class="tree-icon fa fa-database"
                  v-if="data.type === 'MODEL'"
                ></i>
                <i
                  class="tree-icon fa fa-cube"
                  v-else-if="
                    data.type === 'SCHEMA' || data.type === 'MODEL_SCHEMA'
                  "
                ></i>
                <span class="icon-i-folder" style="margin-right: 8px" v-else>
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>
              </span>
              <span>{{ data.name }}</span>
            </template>
          </el-cascader>
          <datablau-button
            type="normal"
            style="margin-left: 20px"
            @click="matchRelDb"
            v-if="couldReldbCustom"
            :disabled="!couldAutoMatchReldb"
          >
            {{ $t('meta.report.autoMatch') }}
          </datablau-button>
          <datablau-tooltip
            :content="$t('meta.report.autoMatchTips')"
            placement="top"
            v-if="couldReldbCustom"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.table')"
          v-if="!relDbCustom"
          :rules="[
            {
              required: true,
              message: $t('meta.report.selTable'),
              trigger: 'blur',
            },
          ]"
        >
          <el-select
            v-model="editReldbItem.tableId"
            :placeholder="$t('meta.report.selTable')"
            @change="relEditTableChange"
            clearable
            filterable
          >
            <el-option
              v-for="item in relTablesArr"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.column')"
          v-if="!relDbCustom"
          :rules="[
            {
              required: true,
              message: $t('meta.report.selColumn'),
              trigger: 'blur',
            },
          ]"
        >
          <el-select
            size="mini"
            v-model="editReldbItem.columnId"
            :placeholder="$t('meta.report.selColumn')"
            clearable
            filterable
            @change="relEditColChange"
          >
            <el-option
              v-for="item in relColumnsArr"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.table')"
          v-if="relDbCustom"
          :rules="[
            {
              required: true,
              message: $t('meta.report.fillTable'),
              trigger: 'blur',
            },
          ]"
        >
          <datablau-input
            size="mini"
            v-model="editReldbItem.customTableName"
            :placeholder="$t('meta.report.fillTable')"
            :disabled="!startEdit"
            clearable
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.report.column')"
          v-if="relDbCustom"
          :rules="[
            {
              required: true,
              message: $t('meta.report.fillColumn'),
              trigger: 'blur',
            },
          ]"
        >
          <datablau-input
            size="mini"
            v-model="editReldbItem.customColName"
            :placeholder="$t('meta.report.fillColumn')"
            :disabled="!startEdit"
            clearable
          ></datablau-input>
        </el-form-item>
        <el-form-item class="form-item-footer">
          <datablau-button
            type="important"
            class="green-btn tab-button"
            @click="saveEditRelDbItem"
            :disabled="!couldConfirRelbdEdit"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </el-form-item>
      </el-form>
      <div slot="footer" v-show="editObj.ediType !== 'relDb'">
        <datablau-button type="secondary" @click="dialogEditVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="saveEditObj"
          :disabled="editBottomItemConfirm"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-form-submit>
      <div :class="'container report-form-manage id' + oldReportFormManage.id">
        <div class="top-form">
          <h3 class="form-title">
            <span>{{ $t('meta.report.basicPro') }}</span>
            <datablau-button
              type="text"
              style="margin-left: 1em"
              @click="changeToEditMode"
              v-if="hasAccess && !startEdit"
            >
              <i class="el-icon-edit"></i>
              {{ $t('common.button.edit') }}
            </datablau-button>
          </h3>
          <!--<p class="appCode" v-if="isEdit"><span>报表1编号：</span>{{reportFormManage.code}}</p>-->
          <el-form
            class="page-form"
            label-position="right"
            label-width="180px"
            size="small"
            :model="reportFormManage"
            ref="form"
            :inline="!showHeightAuto"
            :rules="rules"
          >
            <el-form-item :label="$t('meta.report.reportNum')" v-if="isEdit">
              <span
                style="font-size: 12px; width: 300px; display: inline-block"
              >
                {{ reportFormManage.code }}
              </span>
            </el-form-item>
            <el-form-item :label="$t('meta.report.reportName')" prop="name">
              <datablau-input
                size="mini"
                class="report-form-manage-input"
                v-model="reportFormManage.name"
                :placeholder="$t('meta.report.fillReportName')"
                :disabled="!startEdit"
              ></datablau-input>
            </el-form-item>
            <input type="text" v-show="false" v-model="reportFormManage.type" />
            <el-form-item :label="$t('meta.report.reportType')" prop="type">
              <datablau-select-weak
                :optionsData="{
                  data: appTypes,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
                size="mini"
                class="report-form-manage-input"
                v-model="reportFormManage.type"
                :placeholder="$t('meta.report.fillReportType')"
                @change="handleTypeChange"
                :disabled="!startEdit"
              ></datablau-select-weak>
            </el-form-item>
            <el-form-item :label="$t('meta.report.owner')" prop="owner">
              <datablau-input
                size="mini"
                class="report-form-manage-input"
                v-model="reportFormManage.owner"
                :placeholder="$t('meta.report.fillOwner')"
                :disabled="!startEdit"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('meta.report.subDate')" prop="createTime">
              <!-- datablau-datePicker -->
              <el-date-picker
                type="datetime"
                value-format="timestamp"
                size="mini"
                class="report-form-manage-input"
                v-model="reportFormManage.createTime"
                :placeholder="$t('meta.report.selSubDate')"
                :disabled="!startEdit"
                :clearable="false"
              ></el-date-picker>
            </el-form-item>
            <el-form-item
              :label="$t('meta.report.importSource')"
              prop="biReportType"
              v-if="reportFormManage.biReportType && !startEdit"
            >
              <datablau-input
                size="mini"
                class="report-form-manage-input"
                :value="importType"
                :placeholder="$t('meta.report.fillImportSource')"
                :disabled="true"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('meta.report.modifyTime')"
              prop="lastImportedModifiedTime"
              v-if="reportFormManage.lastImportedModifiedTime && !startEdit"
            >
              <div class="report-form-manage-input">
                <el-date-picker
                  type="date"
                  value-format="timestamp"
                  size="mini"
                  class="data-picker"
                  v-model="reportFormManage.lastImportedModifiedTime"
                  :placeholder="$t('meta.report.selImportDate')"
                  :disabled="true"
                ></el-date-picker>
                <el-tooltip
                  :content="$t('meta.report.importDateTips')"
                  effect="light"
                >
                  <i class="fa fa-info-circle time-tooltip"></i>
                </el-tooltip>
              </div>
            </el-form-item>
            <el-form-item
              :label="$t('meta.report.updateFrequency')"
              prop="frequency"
            >
              <el-select
                class="report-form-manage-input"
                v-model="reportFormManage.frequency"
                :placeholder="$t('meta.report.selFrequency')"
                :disabled="!startEdit"
              >
                <el-option
                  v-for="item in [
                    $t('meta.report.day'),
                    $t('meta.report.week'),
                    $t('meta.report.month'),
                    $t('meta.report.quarter'),
                  ]"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('meta.report.historyRange')" prop="range">
              <datablau-input
                size="mini"
                class="report-form-manage-input"
                v-model="reportFormManage.range"
                :placeholder="$t('meta.report.fillHistoryRange')"
                :disabled="!startEdit"
              ></datablau-input>
            </el-form-item>

            <el-form-item
              :label="$t('meta.report.reportPath')"
              prop="path"
              class="report-path"
            >
              <!-- <el-input
              size="mini"
              class="report-form-manage-input"
              placeholder="请输入报表路径"
              v-if="!startEdit"
              :value="reportFormManage.path | pathFormat"
              :disabled="true"
              :title="reportFormManage.path | pathFormat"
            ></el-input> -->
              <!-- <span
              v-if="!startEdit"
              class="path-show report-form-manage-input"
              :title="reportFormManage.path | pathFormat"
            >
              {{reportFormManage.path | pathFormat}}
            </span> -->
              <span-with-tooltip
                v-if="!startEdit"
                :content="reportFormManage.path | pathFormat"
                :classString="`path-show report-form-manage-input`"
                :placement="`right`"
                :displayType="`inline-block`"
              ></span-with-tooltip>
              <el-cascader
                class="cascader-box"
                style="margin-right: 10px"
                size="mini"
                :options="treeReportData"
                :props="pathCascaderProps"
                v-model="reportFormManage.path"
                :placeholder="$t('meta.report.selReportPath')"
                v-if="startEdit && !pathEditCustom"
              ></el-cascader>
              <datablau-input
                style="margin-bottom: 10px"
                size="mini"
                class="report-form-manage-input report-cascader-box"
                :placeholder="$t('meta.report.fillReportPath')"
                v-if="startEdit && pathEditCustom"
                :value="customPathArr | pathFormat"
                :disabled="true"
                :title="customPathArr | pathFormat"
              ></datablau-input>
              <!-- <el-button size="mini" @click="toggleEditModel" v-if="startEdit">
              {{ pathEditCustom ? '选择路径' : '自定义路径' }}
            </el-button> -->
              <datablau-button
                v-if="startEdit"
                type="normal"
                @click="toggleEditModel"
              >
                {{
                  pathEditCustom
                    ? $t('meta.report.selPath')
                    : $t('meta.report.customPath')
                }}
              </datablau-button>
              <datablau-button
                type="normal"
                @click="showEditPathDialog"
                v-if="startEdit && pathEditCustom"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('meta.report.reportIntro')"
              prop="description"
              class="report-description"
            >
              <span v-if="reportFormManage.description === '' && !startEdit">
                {{ $t('meta.report.noIntro') }}
              </span>
              <div class="markdown">
                <mavon-editor
                  :defaultOpen="'preview'"
                  v-if="false && !startEdit && reportFormManage.description"
                  :toolbarsFlag="false"
                  :editable="false"
                  :scrollStyle="true"
                  :subfield="false"
                  :toolbars="toolbars"
                  style="min-height: 60px; max-height: 300px; box-shadow: none"
                  v-model="reportFormManage.description"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
                <!--

        // mavon-editor  提示必须传递字符串类型，null类型报错
        this.reportFormManage.description = reportFormManage.description ? reportFormManage.description : ''
        console.log(this.reportFormManage)
          -->
                <mavon-editor
                  :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                  style="height: 300px; min-width: 800px"
                  v-if="startEdit"
                  :toolbars="toolbars"
                  v-model="reportFormManage.description"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
              </div>
              <!-- <el-input size="mini" type="textarea" v-model="reportFormManage.description" placeholder="请输入报表描述" :disabled="!startEdit" v-if="startEdit"></el-input>
            <el-tooltip
              v-else
              effect="light"
              :content="reportFormManage.description"
              placement="top"
              popper-class="report-description-tooltip"
            >
              <span class="report-description-span">{{reportFormManage.description}}</span>
            </el-tooltip> -->
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('meta.report.reportLink')"
              prop="url"
              class="report-link-item"
            >
              <datablau-input
                class="reportLinkContent"
                size="mini"
                type="textarea"
                v-model="reportFormManage.url"
                :placeholder="$t('meta.report.fillReportLink')"
                :disabled="!startEdit"
                v-if="startEdit"
              ></datablau-input>
              <el-tooltip
                v-else
                effect="light"
                :content="reportFormManage.url"
                placement="top"
                popper-class="report-url-tooltip"
              >
                <span
                  class="report-link"
                  @click="skip2Url(reportFormManage.url)"
                >
                  {{ reportFormManage.url }}
                </span>
              </el-tooltip>
              <!-- <span-with-tooltip
              v-else
               @click="skip2Url(reportFormManage.url)"
              :content="reportFormManage.url"
              :classString="`report-link`"
              :placement="`top`"
              :displayType="`inline-block`"
            >
            </span-with-tooltip> -->
            </el-form-item>
            <!--          <br>-->
            <!--           <el-form-item label="数据管家1"  class="report-link-item">-->
            <!--             <data-steward :isEdit="startEdit" :typeIds="'82800002'"></data-steward>-->
            <!--          </el-form-item>-->
            <!--          <br>-->
            <!--          <el-form-item label="权属部门"  class="report-link-item">-->
            <!--            <group-department :isEdit="startEdit" :typeIds="'82800002'"></group-department>-->
            <!--          </el-form-item>-->
            <el-form-item
              v-for="u in udps"
              :key="u.id"
              :label="u.name"
              class="large-form-item"
            >
              <datablau-input
                class="udpFormContent"
                type="textarea"
                :rows="2"
                v-if="u.type === 'STRING' || u.type === 'NUM_RANGE'"
                v-model="u.value"
                :disabled="!startEdit"
                resize="none"
                maxlength="200"
                show-word-limit
              ></datablau-input>
              <datablau-input
                class="udpFormContent"
                type="textarea"
                :rows="2"
                v-else-if="u.type === 'NUM'"
                v-model="u.value"
                :disabled="!startEdit"
                resize="none"
                maxlength="200"
                show-word-limit
              ></datablau-input>
              <el-switch
                v-else-if="u.type === 'BOOL'"
                v-model="u.value"
                :active-value="true"
                :inactive-value="false"
                :disabled="!startEdit"
              ></el-switch>
              <el-select
                class="udpFormContent"
                v-else-if="u.type === 'ENUM'"
                v-model="u.value"
                filterable
                :disabled="!startEdit"
              >
                <el-option
                  v-for="o in u.typeData.split(';')"
                  :key="o"
                  :label="o"
                  :value="o"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-box">
          <div class="title-con">
            <div class="title-doc" ref="tabBox">
              <div class="line" ref="line"></div>
              <h4
                ref="imageData"
                class="area-title"
                @click="showReportBottom('imageData')"
                :class="{ active: showBottom === 'imageData' }"
              >
                {{ $t('meta.report.reportImg') }}
              </h4>
              <div class="title-box" v-show="!appType_analysis">
                <!--                <h4
                  ref="requirement"
                  class="area-title"
                  @click="showReportBottom('requirement')"
                  :class="{ active: showBottom === 'requirement' }"
                  v-if="false"
                >
                  查询条件区
                </h4>-->
                <h4
                  class="area-title"
                  ref="result"
                  @click="showReportBottom('result')"
                  :class="{ active: showBottom === 'result' }"
                >
                  {{ $t('meta.report.infoItem') }}
                </h4>
              </div>
              <!--              <div class="title-box" v-show="appType_analysis" v-if="false">
                <h4
                  ref="dimension"
                  class="area-title"
                  @click="showReportBottom('dimension')"
                  :class="{ active: showBottom === 'dimension' }"
                >
                  维度区
                </h4>
                <h4
                  ref="indexs"
                  class="area-title"
                  @click="showReportBottom('indexs')"
                  :class="{ active: showBottom === 'indexs' }"
                >
                  指标区
                </h4>
              </div>-->
              <h4
                ref="relDb"
                class="area-title"
                @click="showReportBottom('relDb')"
                :class="{ active: showBottom === 'relDb' }"
                v-show="true"
              >
                {{ $t('meta.report.relDbs1') }}
              </h4>
              <!--              <h4
                ref="sourceCount"
                class="area-title"
                @click="showReportBottom('sourceCount')"
                :class="{ active: showBottom === 'sourceCount' }"
                v-if="false"
              >
                资源统计区
              </h4>-->
              <!--              <h4
                ref="userTop"
                class="area-title"
                @click="showReportBottom('userTop')"
                :class="{ active: showBottom === 'userTop' }"
                v-if="false"
              >
                访问量TOP5
              </h4>-->
            </div>
            <datablau-button
              class="el-icon-plus add-btn"
              type="text"
              @click="addTableItem"
              v-if="
                startEdit &&
                showBottom !== 'sourceCount' &&
                showBottom !== 'imageData'
              "
            >
              {{ $t('meta.report.add') }}
            </datablau-button>
          </div>
          <div class="table-outer show-container" ref="tableOuter">
            <!--            <div
              class="report-bottom search-requirement"
              v-show="showBottom === 'requirement'"
            >
              &lt;!&ndash;:header-cell-style="{'background-color':#F1F5F8}"&ndash;&gt;
              <datablau-table
                :showColumnSelection="false"
                :data="bottomDataRequirement"
                :height="tableHeight"
              >
                <el-table-column width="30"></el-table-column>
                <el-table-column
                  type="index"
                  width="55"
                  label="排序"
                ></el-table-column>
                <el-table-column
                  prop="label"
                  label="查询项"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="description"
                  label="查询方式"
                ></el-table-column>
                <el-table-column prop="code" label="维度代码">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="skipToDim(scope)"
                      v-if="canJump"
                    >
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | formatDim
                      }}
                    </el-button>
                    <span v-else>
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | formatDim
                      }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作1"
                  v-show="startEdit"
                  align="center"
                  width="220"
                >
                  &lt;!&ndash; prop="name" &ndash;&gt;
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="editReportBottom(scope)"
                    >
                      编辑
                    </datablau-button>
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="deleteReportBottom(scope)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                    <el-popover placement="right" width="150" trigger="click">
                      <el-select
                        v-model="moveItemValue"
                        size="mini"
                        @change="moveTableItem(scope)"
                      >
                        <el-option
                          v-for="item in bottomTableLength"
                          :value="item"
                          :key="item"
                          :label="'第' + item + '行'"
                          :disabled="scope.$index === item - 1"
                        ></el-option>
                      </el-select>
                      <datablau-button slot="reference" size="mini" type="text">
                        移动到
                      </datablau-button>
                    </el-popover>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>-->
            <div
              class="report-bottom table search-result"
              v-show="showBottom === 'result'"
            >
              <datablau-table :data="bottomDataResult" :height="tableHeight">
                <el-table-column width="30"></el-table-column>
                <el-table-column
                  type="index"
                  :width="$i18n.locale === 'zh' ? 55 : 90"
                  :label="$t('meta.report.tables.index')"
                ></el-table-column>
                <el-table-column
                  prop="columnName"
                  :label="$t('meta.report.tables.name')"
                  show-overflow-tooltip
                  :min-width="120"
                ></el-table-column>
                <el-table-column
                  :min-width="$i18n.locale === 'en' ? 180 : 200"
                  prop="description"
                  :label="$t('meta.report.tables.intro')"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="datatype"
                  :label="$t('meta.report.tables.dataType')"
                  show-overflow-tooltip
                  :min-width="100"
                ></el-table-column>
                <el-table-column
                  prop="category"
                  :label="$t('meta.report.tables.subReportName')"
                  show-overflow-tooltip
                  :min-width="$i18n.locale === 'en' ? 140 : 120"
                ></el-table-column>
                <el-table-column
                  :min-width="$i18n.locale === 'en' ? 140 : 120"
                  prop="type"
                  :label="$t('meta.report.tables.relType')"
                  :formatter="formatType"
                ></el-table-column>
                <el-table-column
                  :min-width="$i18n.locale === 'en' ? 200 : 120"
                  prop="code"
                  :label="$t('meta.report.tables.relDimOrindex')"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <el-button
                      style="font-size: 12px"
                      type="text"
                      @click="skipToDAI(scope)"
                      v-if="canJump"
                    >
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | formatDaI
                      }}
                    </el-button>
                    <span v-else style="font-size: 12px">
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | formatDaI
                      }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="name"
                  :label="$t('meta.report.operation')"
                  v-show="startEdit"
                  align="center"
                  fixed="right"
                  width="200"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      class="operation-text-btn"
                      type="text"
                      @click="editReportBottom(scope)"
                    >
                      {{ $t('common.button.edit') }}
                    </datablau-button>
                    <datablau-button
                      class="operation-text-btn"
                      type="text"
                      @click="deleteReportBottom(scope)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                    <el-popover placement="right" width="150" trigger="click">
                      <el-select
                        v-model="moveItemValue"
                        size="mini"
                        @change="moveTableItem(scope)"
                      >
                        <el-option
                          v-for="item in bottomTableLength"
                          :value="item"
                          :key="item"
                          :label="$t('meta.report.tables.line', { item: item })"
                          :disabled="scope.$index === item - 1"
                        ></el-option>
                      </el-select>
                      <datablau-button
                        slot="reference"
                        size="mini"
                        type="text"
                        class="operation-text-btn"
                      >
                        {{ $t('meta.report.tables.moveTo') }}
                      </datablau-button>
                    </el-popover>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
            <!--            <div
              class="report-bottom table dimension"
              v-show="showBottom === 'dimension'"
            >
              <datablau-table :data="bottomDataDimension" :height="tableHeight">
                <el-table-column width="30"></el-table-column>
                <el-table-column
                  type="index"
                  width="55"
                  label="排序"
                ></el-table-column>
                <el-table-column
                  prop="code"
                  width="150"
                  label="维度"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="skipToDim(scope)"
                      v-if="canJump"
                    >
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | formatDim
                      }}
                    </el-button>
                    <span v-else>
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | formatDim
                      }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="label"
                  width="150"
                  label="列名"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="description"
                  label="说明"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="name"
                  width="220"
                  align="center"
                  label="操作"
                  v-show="startEdit"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="editReportBottom(scope)"
                    >
                      编辑
                    </datablau-button>
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="deleteReportBottom(scope)"
                    >
                      删除
                    </datablau-button>
                    <el-popover placement="right" width="150" trigger="click">
                      <el-select
                        v-model="moveItemValue"
                        size="mini"
                        @change="moveTableItem(scope)"
                      >
                        <el-option
                          v-for="item in bottomTableLength"
                          :value="item"
                          :key="item"
                          :label="'第' + item + '行'"
                          :disabled="scope.$index === item - 1"
                        ></el-option>
                      </el-select>
                      <datablau-button slot="reference" size="mini" type="text">
                        移动到
                      </datablau-button>
                    </el-popover>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>-->
            <!--            <div
              class="report-bottom table indexs"
              v-show="showBottom === 'indexs'"
            >
              <datablau-table :data="bottomDataIndexs" :height="tableHeight">
                <el-table-column width="30"></el-table-column>
                <el-table-column
                  type="index"
                  width="55"
                  label="排序"
                ></el-table-column>
                <el-table-column
                  prop="code"
                  label="使用指标"
                  width="150"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="skipToIndex(scope)"
                      v-if="canJump"
                    >
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | indexFormat
                      }}
                    </el-button>
                    <span v-else>
                      {{
                        { row: scope.row, cellValue: scope.row.code }
                          | indexFormat
                      }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="description"
                  label="指标解释"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="columnName"
                  label="列名"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="name"
                  width="220"
                  align="center"
                  label="操作"
                  v-show="startEdit"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="editReportBottom(scope)"
                    >
                      编辑
                    </datablau-button>
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="deleteReportBottom(scope)"
                    >
                      删除
                    </datablau-button>
                    <el-popover placement="right" width="150" trigger="click">
                      <el-select
                        v-model="moveItemValue"
                        size="mini"
                        @change="moveTableItem(scope)"
                      >
                        <el-option
                          v-for="item in bottomTableLength"
                          :value="item"
                          :key="item"
                          :label="'第' + item + '行'"
                          :disabled="scope.$index === item - 1"
                        ></el-option>
                      </el-select>
                      <datablau-button slot="reference" size="mini" type="text">
                        移动到
                      </datablau-button>
                    </el-popover>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>-->
            <!--            关联库表区-->
            <div
              class="report-bottom table indexs"
              v-show="showBottom === 'relDb'"
            >
              <datablau-table :data="bottomDataRelDbs" :height="tableHeight">
                <el-table-column width="30"></el-table-column>
                <el-table-column
                  :width="$i18n.locale === 'zh' ? 55 : 90"
                  type="index"
                  :label="$t('meta.report.tables.index')"
                ></el-table-column>
                <el-table-column
                  prop="modelId"
                  :label="$t('meta.report.dbs')"
                  :formatter="modelFormater"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="tableId"
                  :label="$t('meta.report.table')"
                  :formatter="tableFormater"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="columnId"
                  :label="$t('meta.report.column')"
                  :formatter="columnFormater"
                  show-overflow-tooltip
                ></el-table-column>
                <!-- <el-table-column
                prop="columnName"
                label="字段"
                show-overflow-tooltip
              ></el-table-column> -->
                <el-table-column
                  prop="name"
                  width="200"
                  align="center"
                  :label="$t('meta.report.operation')"
                  fixed="right"
                  v-show="startEdit"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      class="operation-text-btn"
                      type="text"
                      size="mini"
                      @click="editReldb(scope)"
                    >
                      {{ $t('common.button.edit') }}
                    </datablau-button>
                    <datablau-button
                      class="operation-text-btn"
                      type="text"
                      size="mini"
                      @click="deleteReportBottom(scope)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                    <el-popover placement="right" width="150" trigger="click">
                      <el-select
                        v-model="moveItemValue"
                        size="mini"
                        @change="moveTableItem(scope)"
                      >
                        <el-option
                          v-for="item in bottomTableLength"
                          :value="item"
                          :key="item"
                          :label="$t('meta.report.tables.line', { item: item })"
                          :disabled="scope.$index === item - 1"
                        ></el-option>
                      </el-select>
                      <datablau-button
                        slot="reference"
                        size="mini"
                        type="text"
                        class="operation-text-btn"
                      >
                        {{ $t('meta.report.tables.moveTo') }}
                      </datablau-button>
                    </el-popover>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
            <!--            <div
              class="report-bottom table indexs"
              v-show="showBottom === 'sourceCount'"
            >
              <datablau-table
                :data="bottomDataSourceCount"
                :height="tableHeight"
              >
                <el-table-column width="30"></el-table-column>
                <el-table-column prop="ctr" label="点击率"></el-table-column>
                <el-table-column
                  prop="tablespace"
                  label="表空间占用"
                ></el-table-column>
                <el-table-column
                  prop="etlCost"
                  label="ETL作业时长"
                ></el-table-column>
                <el-table-column
                  prop="generateTime"
                  label="日期"
                  :formatter="$dateFormatter"
                ></el-table-column>
              </datablau-table>
            </div>-->
            <div
              class="report-bottom table indexs report-images"
              v-show="showBottom === 'imageData'"
            >
              <!-- <image-upload
              :imageList="imageList"
              :isEdit="startEdit"
              ref="imgUpload"
            ></image-upload> -->
              <datablau-upload
                ref="imgUpload"
                :isEdit="startEdit"
                :action="action"
                :show-file-list="false"
                :imageList="imageList"
                list-type="picture-card"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                accept=".png,.jpeg"
                @resetImageList="resetImageList"
              >
                <slot>
                  <i slot="default" class="el-icon-plus"></i>
                </slot>
              </datablau-upload>
            </div>
            <!--            <div
              class="report-bottom table indexs"
              v-if="showBottom === 'userTop'"
            >
              <user-top
                :data-id="String(reportFormManage.id)"
                :data-type="this.$commentPreCode.Report"
                style="margin-left: 30px"
              ></user-top>
            </div>-->
          </div>
        </div>
      </div>
      <div
        slot="buttons"
        class="bottom-line"
        v-if="startEdit"
        style="text-align: left"
      >
        <datablau-button type="secondary" @click="removetab">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="addReportFormManage"
          :disabled="disableCommitButton"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import editReportFormManageTab from './editReportFormManageTab.js'
export default editReportFormManageTab
</script>
<style lang="scss" scoped>
@import './editReportFormManageTab.scss';
/deep/ .el-form-item {
  margin-bottom: 16px !important;
  .el-form-item__label {
    //height: 34px;
    line-height: 34px;
    word-break: break-word;
  }
  .el-form-item__content {
    line-height: 34px;
  }
}
/deep/ .el-cascader {
  .el-input__inner {
    height: 34px;
    line-height: 34px;
  }
  &:hover {
    .el-input__inner {
      border-color: #409eff;
    }
  }
}
.markdown {
  /deep/ .v-note-wrapper {
    border: 1px solid #e0e0e0;
    box-shadow: none !important;
  }
}
.bottom-line {
  text-align: right;
  // padding-right: 20px;
}
.plain-table {
  margin-left: 20px;
}
.table-box {
  // padding-left: 20px;
  margin: 0 20px;
}
</style>
<style lang="scss">
.addreportFormManage {
  .plain-table th {
    background-color: var(--grey-table-title);
  }
  .el-form.page-form {
    .report-form-manage-input {
      // width: 300px;
      .el-input {
        width: 300px;
        input {
          width: 300px;
        }
      }
      .el-date-editor.el-input {
        // width: 110px;
        .el-input__inner {
          padding-right: 10px;
          width: 100%;
        }
      }
    }
    .report-path {
      .report-form-manage-input {
        width: 450px;
        &.path-show {
          width: 300px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          color: #606266;
          // border: 1px solid red;
        }
      }
    }
    .el-form-item__error {
      //top: 8px;
      //left: auto;
      //right: 10px;
    }
    @media (max-width: 1300px) {
      textarea {
        width: 530px;
      }
    }
    @media (max-width: 880px) {
      textarea {
        margin-left: 30px;
      }
    }
    .el-form-item.report-link-item,
    .el-form-item.report-description {
      width: 100%;
      .el-form-item__content {
        width: 80%;
        span.report-link,
        span.report-description-span {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
        span.report-link {
          -webkit-line-clamp: 1;
        }
      }
    }
  }
  &.show-scroll-auto {
    .report-description {
      .el-form-item__content {
        .el-textarea {
          textarea {
            min-width: 400px;
            width: 100%;
          }
        }
      }
    }
  }
  .app-edit-dialog {
    .el-input,
    .el-textarea {
      width: 300px;
    }
    .el-input.is-disabled .el-input__inner,
    .el-textarea.is-disabled .el-textarea__inner {
      border: 1px solid #dcdfe6;
      cursor: not-allowed !important;
      &::-webkit-input-placeholder {
        visibility: visible;
      }
    }
  }
  .white-add-btn.el-button--primary:focus,
  .white-add-btn.el-button--primary.is-disabled {
    background-color: #fff;
    color: #1b1b1b;
  }
}
.edit-report-path {
  max-height: 50vh;
  overflow: auto;
  .custom-report-path-form {
    .el-input {
      width: 300px;
      // input {
      //   width: 300px;
      // }
    }
  }
}
.app-edit-dialog {
  .reldb-edit-from {
    .el-cascader,
    .el-select,
    .el-input {
      width: 250px;
    }
    .margin-left20 {
      margin-left: 20px;
    }
    .gray-info {
      color: #aaa;
    }
  }
}
.el-tooltip__popper.report-url-tooltip {
  word-break: break-all;
  max-width: 80%;
}
.el-tooltip__popper.report-description-tooltip {
  max-width: 80%;
}
</style>
