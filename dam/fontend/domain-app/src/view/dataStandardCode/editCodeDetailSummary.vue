<template>
  <div class="tab-page edit-code-node" v-loading="loading">
    <send-mail-confirm
      ref="sendMailConfirm"
      @ifSendMail="ifSendMail"
    ></send-mail-confirm>
    <div class="content-outer">
      <datablau-form-submit>
        <el-collapse
          v-model="showArr"
          @change="changeCollapse"
          style="border-top: none; margin-left: 20px"
        >
          <el-collapse-item name="codeDetail">
            <template slot="title">
              <div class="collapse-title">
                <h4>{{ $t('domain.code.codeInfoTab') }}</h4>
              </div>
            </template>
            <datablau-form
              label-width="190px"
              :model="editCode"
              :rules="editRules"
              ref="codeFrom"
              class="code-detail-form"
            >
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.standardTheme')"
                prop="folderId"
              >
                <el-cascader
                  size="mini"
                  style="width: 300px"
                  expand-trigger="click"
                  :options="
                    treeData && treeData.length ? treeData[0].nodes : []
                  "
                  :props="defaultProps2"
                  :change-on-select="true"
                  v-model="selectedFolderIds"
                  :placeholder="$t('domain.code.themePlaceholder')"
                  ref="pathSelector"
                ></el-cascader>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.codePropCode')"
                prop="code"
              >
                <datablau-input
                  size="small"
                  :maxlength="20"
                  v-model="editCode.code"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.codePropCodePlaceholder')"
                  clearable
                  :disabled="isEdit || autoCode"
                  :disabledGrey="isEdit || autoCode"
                  :style="{
                    width:
                      isEdit || !(!isEdit && categoryId === 1 && useDam)
                        ? '300px'
                        : '200px',
                  }"
                ></datablau-input>
                <datablau-checkbox
                  v-if="!isEdit && categoryId === 1 && useDam"
                  :checkboxType="'single'"
                  v-model="autoCode"
                  @change="autoCodeChange"
                  :disabled="!autoCodeDisabled"
                  style="display: inline-block; margin-left: 10px"
                >
                  {{ $t('domain.code.autoCreate') }}
                </datablau-checkbox>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.cName')"
                prop="name"
              >
                <datablau-input
                  size="small"
                  :maxlength="30"
                  v-model="editCode.name"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.namePlaceholder')"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.enName')"
                prop="enName"
              >
                <datablau-input
                  size="small"
                  :maxlength="30"
                  v-model="editCode.enName"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.enNamePlaceholder')"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.remark')"
              >
                <datablau-input
                  size="small"
                  :maxlength="50"
                  v-model="editCode.comment"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.remarkPlaceholder')"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item"
                :label="$t('domain.code.codeMapping')"
                v-if="categoryId !== 1"
              >
                <datablau-input
                  size="small"
                  :maxlength="50"
                  v-model="editCode.refStdCode"
                  class="dia-input-item"
                  :placeholder="$t('domain.code.codeMappingPlaceholder')"
                  clearable
                  @focus="handleChooseRefCode"
                  @clear="handleClearRefCode"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                class="message-form-item udp-form-item"
                label=""
                label-width="0"
                v-for="(udp, index) in udps.filter(
                  e => e.catalog === $t('domain.domain.standardProp')
                )"
                :key="index"
                :prop="udp.udpId + ''"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="false"
                  :showRequired="!!udp.required"
                ></udp-form-label>
                <datablau-input
                  style="width: 300px"
                  v-if="udp.dataType === 'String'"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                ></datablau-input>
                <datablau-select
                  style="width: 300px; display: inline-block"
                  v-if="
                    Array.isArray(udp.candidates) &&
                    (udp.dataType === 'List' || udp.dataType === 'Enum')
                  "
                  v-model="additionalPropertiesObj[udp.udpId]"
                  :placeholder="$version.domain.placeholder.property"
                >
                  <el-option
                    v-for="item in udp.candidates"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
            </datablau-form>
          </el-collapse-item>
          <el-collapse-item name="codeValue">
            <template slot="title">
              <div class="collapse-title">
                <h4>{{ $t('domain.code.codeValue') }}</h4>
              </div>
            </template>
            <div
              class="table-container"
              :class="{ 'table-add-min-height': tableShowPagination }"
            >
              <datablau-button
                style="padding-left: 0"
                type="text"
                @click="addColumn"
                class="iconfont icon-tianjia"
              >
                {{ $t('domain.code.addCodeValue') }}
              </datablau-button>
              <!--              <div v-if="$damEnabled" style="display: inline-block">
                <datablau-button
                  v-if="isEdit"
                  size="mini"
                  type="text"
                  @click="onEdit(editCode.code)"
                >
                  {{ $t('domain.code.sourceSystem') }}
                </datablau-button>

                <datablau-button
                  v-else
                  size="mini"
                  type="text"
                  @click="sourceSystem"
                >
                  {{ $t('domain.code.sourceSystem') }}
                </datablau-button>
              </div>-->
              <datablau-table class="datablau-table thin" :data="showTableData">
                <el-table-column
                  :label="$t('domain.code.order')"
                  prop="order"
                  :width="$i18n.locale === 'en' ? 140 : 80"
                  align="center"
                >
                  <template slot="header" slot-scope="scope">
                    <span class="star">*</span>
                    <span>{{ $t('domain.code.order') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <!--<span>{{ scope.row.order }}</span>-->
                    <datablau-input
                      v-model="scope.row.order"
                      maxlength="9"
                      size="mini"
                      style="width: 60px"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.codeValueCode')"
                  prop="value"
                  :min-width="100"
                  show-overflow-tooltip
                >
                  <template slot="header" slot-scope="scope">
                    <span class="star">*</span>
                    <span>{{ $t('domain.code.codeValueCode') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.value"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.value"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.codeValueName')"
                  prop="name"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot="header" slot-scope="scope">
                    <span class="star">*</span>
                    <span>{{ $t('domain.code.codeValueName') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.name"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.name"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.parentCodeValue')"
                  :min-width="150"
                >
                  <template slot-scope="scope">
                    <datablau-select
                      size="mini"
                      clearable
                      filterable
                      v-model="scope.row.parentValue"
                      @visible-change="
                        parentValueChange($event, scope.row, false)
                      "
                      :placeholder="
                        $t('domain.code.parentCodeValuePlaceholder')
                      "
                    >
                      <el-option
                        v-for="item in parentValueOptions"
                        v-if="showSelectCode === scope.row"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        :disabled="item.disabled"
                      ></el-option>
                    </datablau-select>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.mappingCodeValueCode')"
                  :min-width="170"
                  v-if="categoryId !== 1"
                >
                  <template slot-scope="scope">
                    <datablau-select
                      size="mini"
                      clearable
                      filterable
                      v-if="scope.row.hasOwnProperty('refCodeValue')"
                      v-model="scope.row.refCodeValue"
                      :placeholder="
                        $t('domain.code.mappingCodeValueCodePlaceholder')
                      "
                      @change="mappingCodeValueCode(scope.$index, scope.row)"
                      @clear="clearMappingCodeValue(scope.$index, scope.row)"
                      @visible-change="
                        visible => {
                          mappingCodeSelectVisibleChange(
                            scope.$index,
                            scope.row,
                            visible
                          )
                        }
                      "
                    >
                      <el-option
                        v-for="item in refCodeValues"
                        v-if="focusMappingIndex === scope.$index"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </datablau-select>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="categoryId !== 1"
                  :min-width="$i18n.locale === 'zh' ? 130 : 180"
                  :label="$t('domain.code.mappingCodeName')"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ refCodeMapName.get(scope.row.refCodeValue) }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.mappingCodeValueName')"
                  prop="order"
                  :min-width="100"
                  show-overflow-tooltip
                  v-if="false"
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.order"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.order"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.remark1')"
                  prop="definition"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template #header>
                    <span
                      class="star"
                      v-if="editCode.whetherBusinessDimension === '1'"
                    >
                      *
                    </span>
                    <span>{{ $t('domain.code.remark1') }}</span>
                  </template>
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.definition"
                      @focus="autoRemakes(scope.row)"
                      @clear="clearAutoRemakes(scope.row)"
                      clearable
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      @focus="autoRemakes(scope.row)"
                      @clear="clearAutoRemakes(scope.row)"
                      clearable
                      v-model="scope.row.definition"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.remark2')"
                  prop="definition"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.definition2"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.definition2"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.code.remark3')"
                  prop="definition"
                  :min-width="150"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-input
                      v-if="isEdit"
                      v-model="scope.row.definition3"
                      size="mini"
                    ></datablau-input>
                    <datablau-input
                      v-else
                      v-model="scope.row.definition3"
                      size="mini"
                    ></datablau-input>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('domain.common.operation')"
                  fixed="right"
                  :width="80"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      type="icon"
                      class="iconfont icon-delete"
                      @click="deleteRow(scope.row)"
                    ></datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <div class="pagination-outer" v-if="tableShowPagination">
                <datablau-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="filterObj.currentPage"
                  :page-sizes="[10, 20, 50]"
                  :page-size="filterObj.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="codeValueCount"
                ></datablau-pagination>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        <template slot="buttons">
          <datablau-button
            size="small"
            type="primary"
            @click="saveEditCode(row && row.isUpdate)"
            :loading="submitLoading"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button
            type="secondary"
            class="white-btn"
            @click="removetab"
          >
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </template>
      </datablau-form-submit>
    </div>

    <code-select></code-select>
    <datablau-dialog
      title="来源系统"
      :visible.sync="visibleSync"
      :close-on-click-modal="false"
      size="l"
      :modal-append-to-body="true"
      custom-class="datablau-dialog-system"
    >
      <el-form
        class="left-part"
        ref="ruleForm"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item
          label="业务系统"
          prop="categoryName"
          class="one"
          style="margin-bottom: 20px"
        >
          <datablau-select
            ref="system"
            style="width: 500px"
            v-model="form.categoryName"
            size="small"
            @change="handleModelCategoryChange()"
            placeholder="请选择规则产生问题的所属业务系统"
            filterable
            clearable
          >
            <el-option
              v-for="item in $modelCategories"
              :key="item.categoryId"
              :label="item.displayName"
              :value="item.categoryName"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          label="目标数据源"
          prop="typeAll"
          style="margin-bottom: 20px"
        >
          <el-col :span="8" style="width: 160px; display: inline-block">
            <el-form-item prop="modelId">
              <datablau-select
                v-model="form.modelId"
                placeholder="目标数据源"
                @clear="initTableAndColumn"
                @change="handleModelIdChange(form.modelId)"
                filterable
                clearable
              >
                <el-option
                  v-for="item in modelList"
                  :key="item.modelId"
                  :label="item.definition"
                  :value="item.modelId"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="width: 160px; margin-left: 10px; display: inline-block"
          >
            <el-form-item prop="schemaName">
              <el-select
                v-model="form.schemaName"
                placeholder="请选择schema"
                size="small"
                @clear="clearSchemaName"
                @change="handleSqlModelChange"
                filterable
                clearable
              >
                <el-option
                  v-for="item in schemaArr"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :span="8"
            style="width: 160px; margin-left: 10px; display: inline-block"
          >
            <el-form-item prop="objectId">
              <datablau-select
                filterable
                v-model="form.objectId"
                style="width: 100%"
                placeholder="所属表"
                @change="getTableName(form.objectId)"
                remote
                reserve-keyword
                :remote-method="getTableList"
                @clear="initTableAndColumn"
                clearable
              >
                <el-option
                  v-for="item in tableList"
                  :key="item.objectId"
                  :label="item.physicalName"
                  @click.native="initColumn"
                  :value="item.objectId"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </el-col>
          <!-- <datablau-select
            filterable
            clearable
            style="width: 160px; margin-left: 10px; display: inline-block"
            v-model="form.columnId"
            placeholder="所属字段"
            remote
            reserve-keyword
            :remote-method="getColumnList"
            @change="getColumnName(form.columnId)"
          >
            <el-option
              v-for="item in columnList"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </datablau-select> -->
        </el-form-item>
        <el-form-item
          label="编码取值字段"
          prop="codeField"
          style="margin-bottom: 20px"
        >
          <!-- <datablau-input
            v-model="form.codeField"
            placeholder="所属字段"
            style="width: 500px"
          ></datablau-input> -->
          <datablau-select
            filterable
            clearable
            style="width: 500px"
            v-model="form.codeField"
            placeholder="所属字段"
            remote
            reserve-keyword
            :remote-method="getColumnList"
            @clear="clearValue()"
            @change="getCodeFieldName(form.codeField)"
          >
            <el-option
              v-for="item in columnList"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          label="编码中文名称字段"
          prop="codeChineseField"
          style="margin-bottom: 20px"
        >
          <datablau-select
            filterable
            clearable
            style="width: 500px"
            v-model="form.codeChineseField"
            placeholder="所属字段"
            remote
            reserve-keyword
            :remote-method="getColumnList"
            @clear="clearValue1()"
            @change="getCodeChineseFieldName(form.codeChineseField)"
          >
            <el-option
              v-for="item in columnList"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="父编码取值" style="margin-bottom: 20px">
          <!-- <datablau-input
            v-model="form.parentCode"
            placeholder="所属字段"
            style="width: 500px"
          ></datablau-input> -->
          <datablau-select
            filterable
            clearable
            style="width: 500px"
            v-model="form.parentValueId"
            placeholder="所属字段"
            remote
            reserve-keyword
            :remote-method="getColumnList"
            @clear="clearValue2()"
            @change="getParentValueName(form.parentValueId)"
          >
            <el-option
              v-for="item in columnList"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          label="备注1"
          prop="authDimensionId"
          style="margin-bottom: 20px"
        >
          <datablau-select
            filterable
            clearable
            style="width: 500px"
            v-model="form.authDimensionId"
            placeholder="所属字段"
            remote
            reserve-keyword
            :remote-method="getColumnList"
            @clear="clearValue3()"
            @change="getAuthDimensionName(form.authDimensionId)"
          >
            <el-option
              v-for="item in columnList"
              :key="item.objectId"
              :label="item.physicalName"
              :value="item.objectId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <!-- 添加SQL条件 -->
        <el-form-item label="SQL条件" style="margin-bottom: 20px">
          <datablau-button
            @click="addSQL"
            type="text"
            class="iconfont icon-tianjia"
          >
            添加SQL条件
          </datablau-button>
        </el-form-item>
        <div
          class="condition-box"
          v-for="(i, k) in form.SqlModifierRef"
          :key="k"
        >
          <el-form-item
            :label="'SQL条件' + (k ? k + 1 : '')"
            :prop="`SqlModifierRef.${k}.columnId`"
            :rules="[
              {
                required: true,
                message: '该项为必填项',
                trigger: 'change',
              },
            ]"
            style="margin-top: 10px; margin-bottom: 10px"
          >
            <datablau-select
              filterable
              clearable
              style="width: 500px"
              v-model="i.columnId"
              placeholder="查询字段条件"
              remote
              reserve-keyword
              :remote-method="getColumnList"
              @clear="clearValue4(k)"
              @change="getColumnName(i.columnId)"
            >
              <el-option
                v-for="item in columnList"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <!-- 运算符 -->
          <el-form-item
            :label="'运算符' + (k ? k + 1 : '')"
            :prop="`SqlModifierRef.${k}.operator`"
            :rules="[
              {
                required: true,
                message: '请选择运算符',
                trigger: 'change',
              },
            ]"
            style="margin-top: 10px; margin-bottom: 10px"
          >
            <datablau-select
              filterable
              clearable
              style="width: 500px"
              v-model="i.operator"
              @change="changeOperator(i.operator)"
              @clear="clearValue5(k)"
              placeholder="所属字段"
              remote
              reserve-keyword
            >
              <el-option
                v-for="item in operatorList"
                :key="item.name"
                :label="item.label"
                :value="item.name"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <!-- 删除按钮 -->
          <datablau-button
            @click="deleteSQL(k)"
            style="padding: 0px; position: absolute; right: 5px; top: 15px"
            type="text"
          >
            删除
          </datablau-button>
          <!-- SQL条件 -->
          <el-form-item
            v-if="
              i.operator === '>' ||
              i.operator === '<' ||
              i.operator === '=' ||
              i.operator === 'in' ||
              i.operator === 'not in' ||
              i.operator === 'likeLeft' ||
              i.operator === 'likeRight'
            "
            :prop="`SqlModifierRef.${k}.condition`"
            label="判断条件"
            :rules="[
              {
                required: true,
                message: '该项为必填项',
                trigger: 'blur',
              },
            ]"
            style="margin-top: 10px; margin-bottom: 10px"
          >
            <datablau-input
              style="width: 500px"
              v-model="i.condition"
              placeholder="条件1"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            v-else-if="i.operator === 'between and'"
            label="判断条件"
          >
            <el-form-item
              :prop="`SqlModifierRef.${k}.condition`"
              :rules="[
                {
                  required: true,
                  message: '该项为必填项',
                  trigger: 'blur',
                },
              ]"
              style="display: inline-block"
            >
              <datablau-input
                style="width: 245px"
                v-model="i.condition"
                placeholder="条件1"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :prop="`SqlModifierRef.${k}.condition1`"
              :rules="[
                {
                  required: true,
                  message: '该项为必填项',
                  trigger: 'blur',
                },
              ]"
              style="display: inline-block"
            >
              <datablau-input
                style="width: 245px; margin-left: 10px"
                v-model="i.condition1"
                placeholder="条件2"
              ></datablau-input>
            </el-form-item>
          </el-form-item>
          <!-- SQL条件 -->
        </div>
        <el-form-item label="SQL语句">
          <datablau-input
            type="textarea"
            v-model="sqlContext"
            maxlength="1000"
            class="maxlengthInput"
            show-word-limit
            style="width: 500px"
            :disabled="sqlDisabled"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          class="sub-header"
          style="margin-top: 20px"
          label="重复周期"
        >
          <select-period
            :hasLable="true"
            style="
              transform: translate(-65px, 36px);
              margin-left: -35px;
              width: 700px;
            "
            @getCronString="getCronString"
            :cron="
              form.schedule && form.schedule.includes('cron:')
                ? form.schedule.split('cron:')[1]
                : form.schedule
            "
            defaultCheck="scheduleByWeekdays"
            class="datablau-select-period"
          ></select-period>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="important" @click="save('ruleForm')">
          确定
        </datablau-button>
        <datablau-button type="secondary" @click="back">取消</datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import sendMailConfirm from './sendMailConfirm.vue'
import HTTP from '@/http/main.js'
import Vue from 'vue'
import codeSelect from '@/view/newDataStandard/codeSelect.vue'
import udpFormLabel from '@/view/newDataStandard/udpFormLabel.vue'
import { findByFoldId } from '@/view/dataStandardGlossary/glossaryConstants'

// // TODO i18n
// let noRowsOverlayComponent = {
//   template:
//     '<div class="msg-container"><div class="msg-inner"> 暂无数据，点击创建新数据</div></div>',
//   data() {
//     return {
//       supterComponent: null,
//     }
//   },
//   mounted() {
//     this.supterComponent = this.params.supterComponent
//   },
//   methods: {},
// }
// noRowsOverlayComponent = Vue.extend(noRowsOverlayComponent)
export default {
  props: {
    isEdit: {
      type: Boolean,
    },
    row: {
      type: Object,
    },
    foldId: {
      type: Number,
    },
    useWorkflow: {
      type: Boolean,
      default: true,
    },
    udps: {},
    treeData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    const typeAllRule = (rule, value, callback) => {
      if (!this.form.modelId || !this.form.schemaName || !this.form.objectId) {
        return callback()
      } else {
        callback()
      }
    }
    const formRules = {
      categoryName: {
        required: true,
        trigger: 'change',
        message: '此项不能为空',
      },
      typeAll: {
        trigger: 'change',
        required: true,
        validator: typeAllRule,
      },
      codeField: {
        required: true,
        trigger: 'change',
        message: '此项不能为空',
      },
      codeChineseField: {
        required: true,
        trigger: 'change',
        message: '此项不能为空',
      },
    }
    const autoCode = true
    return {
      datasourceId: '',
      visibleSync: false,
      sqlList: '',
      sqlDisabled: true,
      cleanSource: false,
      businessRules: [],
      modelList: [],
      columnList: [],
      tableList: [],
      schemaArr: [],
      connectionInfo: {},
      jobId: null,
      rowData: {},
      operatorList: [
        {
          label: '大于',
          name: '>',
        },
        {
          label: '小于',
          name: '<',
        },
        {
          label: '等于',
          name: '=',
        },
        {
          label: '包含',
          name: 'in',
        },
        {
          label: '不包含',
          name: 'not in',
        },
        {
          label: '介于',
          name: 'between and',
        },
        {
          label: '已开头',
          name: 'likeLeft',
        },
        {
          label: '已结尾',
          name: 'likeRight',
        },
      ],
      form1: {},
      form: {
        categoryName: '',
        categoryId: null,
        modelId: null,
        modelName: '',
        objectId: null,
        objectName: '',
        columnId: null,
        columnName: '',
        schemaName: null,
        codeChineseField: null,
        codeChineseFieldName: '',
        authDimensionId: '',
        authDimension: '',
        codeField: null,
        codeFieldName: '',
        parentValueId: '',
        parentValue: '',
        authDimensionNameEnId: '',
        authDimensionNameEn: '',
        operator: null,
        condition: '',
        condition1: '',
        sqlContext: '',
        resultTablePks: [],
        schedule: null, // 重复周期
        SqlModifierRef: [],
      },
      rules: formRules,
      additionalPropertiesRequired: true,
      additionalProperties: [],
      additionalPropertiesObj: {},
      additionalPropertiesObjInitial: null,
      selectedFolderIds: [],
      editCode: {
        code: '',
        name: '',
        enName: '',
        datasetName: '',
        '@class': 'com.datablau.service.dto.CodeDto',
        state: 'A',
        value: [],
        comment: '',
        refStdCode: '',
      },
      editRules: {
        name: [
          {
            required: true,
            // message: this.$t('domain.code.nameNotEmpty'),
            trigger: 'blur',
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error('中文名称不能为空'))
                return
              }
              // 只能包含中文、字母和数字，长度不超过15位
              if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
                callback(new Error('中文名称只能包含中文、字母和数字'))
                return
              }
              if (value.length > 15) {
                callback(new Error('中文名称长度不能超过15位'))
                return
              }
              callback()
            },
          },
        ],
        enName: [
          {
            required: true,
            // message: this.$t('domain.code.enNameNotEmpty'),
            trigger: 'blur',
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error('英文名称不能为空'))
                return
              }
              // 只能是字母和空格
              if (!/^[A-Za-z ]+$/.test(value)) {
                callback(new Error('英文名称只能包含字母和空格'))
                return
              }
              // 首字母大写
              if (!/^[A-Z]/.test(value)) {
                callback(new Error('首字母必须大写'))
                return
              }
              callback()
            },
          },
        ],
        code: autoCode
          ? []
          : [
              {
                required: true,
                message: this.$t('domain.code.codePropCodeNotEmpty'),
                trigger: 'blur',
              },
            ],
        folderId: [
          {
            required: true,
            trigger: 'change',
            // message: this.$t('domain.code.codeThemeNotEmpty'),
            validator: (rule, value, callback) => {
              if (
                !this.selectedFolderIds ||
                this.selectedFolderIds.length === 0
              ) {
                callback(new Error(this.$t('domain.code.codeThemeNotEmpty')))
              } /* else if (this.selectedFolderIds.length === 1) {
                callback(new Error(this.$t('domain.code.codeThemeNotEmpty')))
              } */ else {
                callback()
              }
            },
          },
        ],
      },
      editData: null,
      codeValue: [],
      showArr: ['codeDetail', 'codeValue'],
      // disabledEditCon: true,

      // value table
      totalShow: 0,
      num: 0,
      columnDefs: [],
      hideTopLine: true,
      defaultParaData: {},
      // tableOption: null,
      propMap: {
        name: this.$t('domain.code.cName'),
        enName: this.$t('domain.code.enName'),
        value: this.$t('domain.code.codeValueCode'),
        order: this.$t('domain.code.order'),
        parentValue: this.$t('domain.code.codeValueParent'),
        definition: this.$t('domain.code.remark1'),
        definition2: this.$t('domain.code.remark2'),
        definition3: this.$t('domain.code.remark3'),
      },
      themeCategoryArr: [],
      submitLoading: false,
      parentValueOptions: [],
      filterObj: {
        currentPage: 1,
        pageSize: 10,
      },
      loading: false,
      showSelectCode: '',
      refStdCodeDetail: {},
      // 映射代码 的 代码取值
      refCodeValues: [],
      focusMappingIndex: null,
      showMappingCodeSelect: 0, // 统计显示下拉框的数量，等于零表示所有下拉框都隐藏
      refCodeValueMap: {},
      autoCodeDisabled: null,
      autoCode,
      refCodeMapName: new Map(),
      modelType: null,
      defaultProps2: {
        value: 'foldId',
        children: 'nodes',
        label: 'name',
      },
    }
  },
  components: {
    sendMailConfirm,
    codeSelect,
    udpFormLabel,
  },
  computed: {
    sqlContext: {
      get() {
        if (
          this.editCode.datasetName &&
          this.editCode.name &&
          this.form.codeFieldName &&
          this.form.codeChineseFieldName &&
          this.form.objectName
        ) {
          let authDimensionNew = this.form.authDimension
            ? `,${this.form.authDimension}`
            : ''
          let authDimensionNameEnNew = this.form.authDimensionNameEn
            ? `,${this.form.authDimensionNameEn}`
            : ''

          if (this.modelType === 'ORACLE' || this.modelType === 'POSTGRESQL') {
            // // 自动生成代码编号
            if (this.autoCode) {
              // 编辑页面
              if (this.isEdit) {
                if (this.editCode.enName) {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                    `"${this.editCode.code}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                    `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.form.parentValue) {
                    this.sqlList =
                      `select '${this.editCode.datasetName}' as ` +
                      `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                      `"${this.editCode.code}",'${this.editCode.name}' as ` +
                      `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                      `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else if (this.form.parentValue) {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                    `"${this.editCode.code}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.editCode.enName) {
                    this.sqlList =
                      `select '${this.editCode.datasetName}' as ` +
                      `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                      `"${this.editCode.code}",'${this.editCode.name}' as ` +
                      `"${this.editCode.name}",'${this.editCode.enName}',${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                    `"${this.editCode.code}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              }
              // 非编辑页面
              else {
                if (this.editCode.enName) {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'{}' as ` +
                    `"{}" ,'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                    `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.form.parentValue) {
                    this.sqlList =
                      `select '${this.editCode.datasetName}' as ` +
                      `"${this.editCode.datasetName}",'{}' as ` +
                      `"{}",'${this.editCode.name}' as ` +
                      `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                      `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else if (this.form.parentValue) {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'{}' as ` +
                    `"{}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.editCode.enName) {
                    this.sqlList =
                      `select '${this.editCode.datasetName}' as ` +
                      `"${this.editCode.datasetName}",'{}' as ` +
                      `"{}",'${this.editCode.name}' as ` +
                      `"${this.editCode.name}","${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'{}' as ` +
                    `"{}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              }
            }
            // 不自动生成
            else {
              if (this.editCode.enName) {
                this.sqlList =
                  `select '${this.editCode.datasetName}' as ` +
                  `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                  `"${this.editCode.code}",'${this.editCode.name}' as ` +
                  `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                  `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                if (this.form.parentValue) {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                    `"${this.editCode.code}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                    `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              } else if (this.form.parentValue) {
                this.sqlList =
                  `select '${this.editCode.datasetName}' as ` +
                  `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                  `"${this.editCode.code}",'${this.editCode.name}' as ` +
                  `"${this.editCode.name}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                if (this.editCode.enName) {
                  this.sqlList =
                    `select '${this.editCode.datasetName}' as ` +
                    `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                    `"${this.editCode.code}",'${this.editCode.name}' as ` +
                    `"${this.editCode.name}",'${this.editCode.enName}' as ` +
                    `"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              } else {
                this.sqlList =
                  `select '${this.editCode.datasetName}' as ` +
                  `"${this.editCode.datasetName}",'${this.editCode.code}' as ` +
                  `"${this.editCode.code}",'${this.editCode.name}' as ` +
                  `"${this.editCode.name}",${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
              }
            }
          } else {
            // 自动生成代码编号
            if (this.autoCode) {
              // 编辑页面
              if (this.isEdit) {
                if (this.editCode.enName) {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as ` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                    '`' +
                    `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                    '`' +
                    `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.form.parentValue) {
                    this.sqlList =
                      `select "${this.editCode.datasetName}" as` +
                      '`' +
                      `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                      '`' +
                      `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                      '`' +
                      `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                      '`' +
                      `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else if (this.form.parentValue) {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                    '`' +
                    `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.editCode.enName) {
                    this.sqlList =
                      `select "${this.editCode.datasetName}" as` +
                      '`' +
                      `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                      '`' +
                      `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                      '`' +
                      `${this.editCode.name}\`\,"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                    '`' +
                    `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              }
              // 非编辑页面
              else {
                if (this.editCode.enName) {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"{}" as` +
                    '`' +
                    `{}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                    '`' +
                    `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.form.parentValue) {
                    this.sqlList =
                      `select "${this.editCode.datasetName}" as` +
                      '`' +
                      `${this.editCode.datasetName}\`\,"{}" as` +
                      '`' +
                      `{}\`\,"${this.editCode.name}" as` +
                      '`' +
                      `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                      '`' +
                      `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else if (this.form.parentValue) {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"{}" as` +
                    '`' +
                    `{}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  if (this.editCode.enName) {
                    this.sqlList =
                      `select "${this.editCode.datasetName}" as` +
                      '`' +
                      `${this.editCode.datasetName}\`\,"{}" as` +
                      '`' +
                      `{}\`\,"${this.editCode.name}" as` +
                      '`' +
                      `${this.editCode.name}\`\,"${this.editCode.enName}",${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                  }
                } else {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"{}" as` +
                    '`' +
                    `{}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              }
            }
            // 不自动生成
            else {
              if (this.editCode.enName) {
                this.sqlList =
                  `select "${this.editCode.datasetName}" as` +
                  '`' +
                  `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                  '`' +
                  `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                  '`' +
                  `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                  '`' +
                  `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                if (this.form.parentValue) {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                    '`' +
                    `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                    '`' +
                    `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              } else if (this.form.parentValue) {
                this.sqlList =
                  `select "${this.editCode.datasetName}" as` +
                  '`' +
                  `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                  '`' +
                  `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                  '`' +
                  `${this.editCode.name}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                if (this.editCode.enName) {
                  this.sqlList =
                    `select "${this.editCode.datasetName}" as` +
                    '`' +
                    `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                    '`' +
                    `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                    '`' +
                    `${this.editCode.name}\`\,"${this.editCode.enName}" as` +
                    '`' +
                    `${this.editCode.enName}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName},${this.form.parentValue}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
                }
              } else {
                this.sqlList =
                  `select "${this.editCode.datasetName}" as` +
                  '`' +
                  `${this.editCode.datasetName}\`\,"${this.editCode.code}" as` +
                  '`' +
                  `${this.editCode.code}\`\,"${this.editCode.name}" as` +
                  '`' +
                  `${this.editCode.name}\`\,${this.form.codeFieldName},${this.form.codeChineseFieldName}${authDimensionNew}${authDimensionNameEnNew} from ${this.form.schemaName}.${this.form.objectName}`
              }
            }
          }

          this.form.SqlModifierRef.forEach((e, i) => {
            if (e.operator !== 'between and') {
              let bool = true
              Object.keys(e).forEach(run => {
                if (!e[run] && run !== 'condition1') {
                  bool = false
                }
              })
              if (!bool) {
                return
              }
            }
            if (
              this.modelType === 'ORACLE' ||
              this.modelType === 'POSTGRESQL'
            ) {
              if (e.operator === 'between and') {
                let bool = true
                Object.keys(e).forEach(run => {
                  if (!e[run]) {
                    bool = false
                  }
                })
                if (!bool) {
                  return
                }
                if (e.condition && e.condition1) {
                  let result = e.condition1 - e.condition
                  if (result < 0) {
                    this.$message.warning('取值2不能小于取值1')
                    return (this.sqlList = '')
                  }
                }
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} between '${e.condition}' and '${e.condition1}'`
                } else {
                  this.sqlList += ` and ${e.columnName} between '${e.condition}' and '${e.condition1}'`
                }
              } else if (e.operator === 'in' || e.operator === 'not in') {
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} ${
                    e.operator
                  } (${this.conditionAutoCode(e.condition)})`
                } else {
                  this.sqlList += ` and ${e.columnName} ${
                    e.operator
                  } ('${this.conditionAutoCode(e.condition)}')`
                }
              } else if (e.operator === 'likeLeft') {
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} like '${e.condition}%'`
                } else {
                  this.sqlList += ` and ${e.columnName} like '${e.condition}%'`
                }
              } else if (e.operator === 'likeRight') {
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} like '%${e.condition}'`
                } else {
                  this.sqlList += ` and ${e.columnName} like '%${e.condition}'`
                }
              } else {
                if (i === 0) {
                  if (e.operator !== '') {
                    this.sqlList += ` where ${e.columnName} ${e.operator} '${e.condition}'`
                  }
                } else {
                  this.sqlList += ` and ${e.columnName} ${e.operator} '${e.condition}'`
                }
              }
            } else {
              if (e.operator === 'between and') {
                let bool = true
                Object.keys(e).forEach(run => {
                  if (!e[run]) {
                    bool = false
                  }
                })
                if (!bool) {
                  return
                }
                if (e.condition && e.condition1) {
                  let result = e.condition1 - e.condition
                  if (result < 0) {
                    this.$message.warning('取值2不能小于取值1')
                    return (this.sqlList = '')
                  }
                }
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} between "${e.condition}" and "${e.condition1}"`
                } else {
                  this.sqlList += ` and ${e.columnName} between "${e.condition}" and "${e.condition1}"`
                }
              } else if (e.operator === 'in' || e.operator === 'not in') {
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} ${
                    e.operator
                  } (${this.conditionAutoCode(e.condition)})`
                } else {
                  this.sqlList += ` and ${e.columnName} ${
                    e.operator
                  } ("${this.conditionAutoCode(e.condition)}")`
                }
              } else if (e.operator === 'likeLeft') {
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} like '${e.condition}%'`
                } else {
                  this.sqlList += ` and ${e.columnName} like '${e.condition}%'`
                }
              } else if (e.operator === 'likeRight') {
                if (i === 0) {
                  this.sqlList += ` where ${e.columnName} like '%${e.condition}'`
                } else {
                  this.sqlList += ` and ${e.columnName} like '%${e.condition}'`
                }
              } else {
                if (i === 0) {
                  if (e.operator !== '') {
                    this.sqlList += ` where ${e.columnName} ${e.operator} "${e.condition}"`
                  }
                } else {
                  this.sqlList += ` and ${e.columnName} ${e.operator} "${e.condition}"`
                }
              }
            }
          })
          return this.sqlList
        }
      },
      set(newValue) {
        this.sqlList = newValue
        return this.sqlList
      },
    },
    useDam() {
      return this.headerProduction && this.headerProduction === 'dam'
    },
    disabledEditCon() {
      let arr = (this.isEdit ? this.editCode.values : this.editCode.value) || []
      if (this.isEdit) {
        if (this.autoCode === true) {
          let bool = true
          if (arr.length === 0) {
            bool = !this.editCode.name || !this.editCode.datasetName
          } else {
            bool =
              !this.editCode.name ||
              !this.editCode.datasetName ||
              !this.testValueItem()
          }
          return bool
        } else {
          let bool = true
          if (arr.length === 0) {
            bool =
              !this.editCode.name ||
              !this.editCode.code ||
              !this.editCode.datasetName
          } else {
            bool =
              !this.editCode.name ||
              !this.editCode.code ||
              !this.editCode.datasetName ||
              !this.testValueItem()
          }
          return bool
        }
      } else {
        if (this.autoCode === true) {
          let bool = true
          if (arr.length === 0) {
            bool = !this.editCode.name || !this.editCode.datasetName
          } else {
            bool =
              !this.editCode.name ||
              !this.editCode.datasetName ||
              !this.testValueItem()
          }
          return bool
        } else {
          let bool = true
          if (arr.length === 0) {
            bool =
              !this.editCode.name ||
              !this.editCode.code ||
              !this.editCode.datasetName
          } else {
            bool =
              !this.editCode.name ||
              !this.editCode.code ||
              !this.editCode.datasetName ||
              !this.testValueItem()
          }
          return bool
        }
      }
    },
    showAddFirst() {
      let bool = false
      if (this.codeValue && this.codeValue.length === 0) {
        bool = true
      }
      return bool
    },
    gszcCustomer() {
      return this.$customerId === 'gszc'
    },
    // 当前标准代码的 代码取值列表
    tableParentValue() {
      let arr = (this.isEdit ? this.editCode.values : this.editCode.value) || []
      const valueMap = {}
      arr.forEach(item => {
        if (item.value) {
          valueMap[item.value] = item.value
        }
        if (!valueMap[item.parentValue]) {
          valueMap[item.parentValue] = item.parentValue
        }
      })
      arr.forEach(item => {
        item.definitionError = item.definitionError || false
        if (item.refValue) {
          // refValue 是 对象, 包含整个代码取值
          // refCodeValue 是 字符串, 只包含代码取值的 value 字段
          item.refCodeValue = item.refValue.value ? item.refValue.value : ''
        } else {
          item.refCodeValue = item.refCodeValue ? item.refCodeValue : ''
        }
        // 父编码取值 未匹配到 编码取值, 清空 父编码取值
        if (!valueMap[item.parentValue]) {
          item.parentValue = ''
        }
      })
      this.$utils.sort.sort(arr, 'order')
      return arr
    },
    codeValueCount() {
      return this.tableParentValue ? this.tableParentValue.length || 0 : 0
    },
    tableShowPagination() {
      return this.codeValueCount > 50
    },
    showTableData() {
      if (!this.tableParentValue) return []
      let s = this.filterObj.pageSize
      let c = this.filterObj.currentPage
      return this.tableParentValue.slice(s * (c - 1), s * c)
    },
    SqlModifierRefIsTrue() {
      if (this.form.SqlModifierRef.length < 1) {
        return true
      } else {
        let nos = true
        this.form.SqlModifierRef.forEach(item => {
          if (item.operator === 'between and') {
            Object.keys(item).forEach(res => {
              if (!item[res]) {
                nos = false
              }
            })
          } else {
            Object.keys(item).forEach(res => {
              if (!item[res] && res !== 'condition1') {
                nos = false
              }
            })
          }
        })
        return nos
      }
    },
    newDomianId() {
      if (
        !this.columnList ||
        this.columnList.length === 0 ||
        !this.form.authDimensionId
      ) {
        return null
      } else {
        return this.columnList.find(
          item => item.objectId === this.form.authDimensionId
        )?.domainId
      }
    },
    savaCodeRule() {
      let bool = false
      // let path = /^[A-Za-z0-9_ ]+$/
      // if (!this.editCode.enName) {
      //   bool = false
      // }
      // if (this.editCode.enName && path.test(this.editCode.enName)) {
      //   bool = false
      // }
      if (this.showTableData.find(item => item.definitionError)) {
        bool = true
      }
      return (
        this.disabledEditCon ||
        (this.udps.length > 0 && this.additionalPropertiesRequired) ||
        bool
      )
    },
  },

  beforeMount() {
    this.loading = true
    if (this.isEdit) {
      this.getCodeDetail()
      this.getSourse(this.row.code)
    } else {
      let fid
      if (this.foldId > 1) {
        fid = this.foldId
      } else {
        fid = this.treeData[0].nodes[0].foldId
      }
      const fids = []
      findByFoldId(this.treeData, fid, fids)
      fids.shift()
      this.selectedFolderIds = [...fids]
      this.getPath()
      this.codeValue = []
      this.totalShow = this.codeValue.length
      this.loading = false
    }
    this.getThemeCategoryArr()
    this.dataInit()
    // this.initAgGrid()
  },
  mounted() {
    this.$bus.$on('setCurrentDatasetName', val => {
      if (val) {
        this.editCode.datasetName = val
      }
    })
    this.getFindState()
    this.udps.forEach(e => {
      this.$set(this.additionalPropertiesObj, e.udpId, null)
      if (e.required) {
        let validator = (rule, value, callback) => {
          if (!this.additionalPropertiesObj[e.udpId]) {
            callback(
              new Error(
                this.$t('domain.common.itemRequiredInput', { name: e.name })
              )
            )
          } else {
            callback()
          }
        }
        this.$set(this.editRules, e.udpId, {
          required: true,
          trigger: 'blur',
          message: this.$t('domain.common.itemRequiredInput', { name: e.name }),
          validator,
        })
      }
    })
  },
  beforeDestroy() {
    this.$bus.$off('setCurrentDatasetName')
  },
  watch: {
    'form.columnName': {
      handler(val) {
        this.form.columnName = val
      },
      deep: true,
    },
    'editCode.values': {
      handler(val) {
        this.parentValueOptions = []
        val.forEach(element => {
          if (element.value !== '') {
            this.parentValueOptions.push({
              value: element.value,
              label: element.value,
            })
          }
        })
      },
      deep: true,
    },
    'editCode.value': {
      handler(val) {
        if (val) {
          this.parentValueOptions = []
          val.forEach(element => {
            if (element.value !== '') {
              this.parentValueOptions.push({
                value: element.value,
                label: element.value,
              })
            }
          })
        }
      },
      deep: true,
    },
    additionalPropertiesObj: {
      handler(value) {
        this.additionalPropertiesRequired = this.udps.some(e => {
          return e.required && !this.additionalPropertiesObj[e.udpId]
        })
      },
      deep: true,
    },
    'editCode.whetherBusinessDimension': {
      handler(val) {
        this.rules.authDimensionId = {
          required: val === '1',
          trigger: 'change',
          message: '此项不能为空',
        }
      },
      deep: true,
      immediate: true,
    },
  },
  inject: ['categoryId', 'headerProduction'],
  methods: {
    getPath() {
      let arr = [
        {
          name: this.isEdit ? this.editCode.name : '所有参考数据',
          couldClick: false,
        },
        {
          name: this.isEdit ? '编辑参考数据' : '创建参考数据',
          couldClick: false,
        },
      ]
      this.$emit('setPath', arr)
    },
    autoCodeChange(value) {
      if (value === true) {
        this.editCode.code = ''
        this.$set(this.editRules, 'code', [{ required: false }])
        this.$refs.codeFrom.validateField('code')
      } else {
        this.$set(this.editRules, 'code', [
          {
            required: true,
            message: this.$t('domain.code.codePropCodeNotEmpty'),
            trigger: 'blur',
          },
        ])
      }
    },
    getFindState() {
      HTTP.getfindState({ domainType: 'STANDARD_CODE' })
        .then(res => {
          this.autoCodeDisabled = res.data
          // this.autoCode = !!res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    mappingCodeValueCode(index, row) {
      let code = this.refCodeValues.find(
        item => item.value === row.refCodeValue
      )
      this.$set(row, 'refValue', code)
      // this.$set(row.referCode, '')
      // this.$set(this.showTableData, index, row)
    },
    clearMappingCodeValue(index, row) {
      this.$set(row, 'refValue', null)
    },
    focusMappingCodeSelect(index, row) {
      this.showMappingCodeSelect++
      this.focusMappingIndex = index
    },
    blurMappingCodeSelect(index, row) {
      this.showMappingCodeSelect--
      setTimeout(() => {
        if (this.showMappingCodeSelect === 0) {
          this.focusMappingIndex = -1
        }
      }, 1000)
    },
    mappingCodeSelectVisibleChange(index, row, visible) {
      if (visible) {
        this.focusMappingCodeSelect(index, row)
      } else {
        this.blurMappingCodeSelect(index, row)
      }
    },
    parentValueChange(callback, row, refreshData = false) {
      if (callback) {
        this.showSelectCode = row
        let childrenMap = this.getCodeChildren(row)
        this.parentValueOptions.forEach(element => {
          this.$set(element, 'disabled', false)
          if (childrenMap[element.value]) {
            this.$set(element, 'disabled', true)
          }
        })
      }
      // refreshData && (this.editCode.values = _.cloneDeep(this.editCode.values))
      // refreshData && (this.editCode.value = _.cloneDeep(this.editCode.value))
    },
    getCodeChildren(row) {
      let result = {}
      let itemMap = {}
      let tableParentValue = this.tableParentValue || []
      tableParentValue.forEach(item => {
        itemMap[item.value] = {
          value: item.value,
          parentValue: item.parentValue,
          children: [],
        }
      })
      tableParentValue.forEach(item => {
        if (item.parentValue) {
          let parent = itemMap[item.parentValue]
          parent.children && parent.children.push(itemMap[item.value])
        }
      })
      let current = itemMap[row.value]
      result[current.value] = true
      const getChildren = item => {
        if (item.children && item.children.length > 0) {
          item.children.forEach(child => {
            result[child.value] = true
            getChildren(child)
          })
        }
      }
      getChildren(current)
      return result
    },
    getCodeDetail() {
      // this.$http
      //   .get(
      //     `${this.$url}/service/domains/codes/content?codeNumber=${this.row.code}`
      //   )
      HTTP.getCodeContent({
        codeNumber: this.row.code,
        categoryId: this.categoryId,
      })
        .then(res => {
          this.editCode = res.data
          this.getPath()
          const pathIds = []
          findByFoldId(this.treeData, this.editCode.folderId, pathIds)
          pathIds.shift()
          this.selectedFolderIds = [...pathIds]

          if (!this.editCode.values || !Array.isArray(this.editCode.values)) {
            this.editCode.values = []
          }
          this.editCode.values.sort(function (a, b) {
            return a.order - b.order
          })
          this.editCode.values.forEach(element => {
            this.parentValueOptions.push({
              value: element.value,
              label: element.value,
            })
          })
          this.loading = false
          this.getRefCodeDetail(this.editCode.refStdCode)
          if (res.data.additionalProperties?.length) {
            res.data.additionalProperties.forEach(e => {
              this.additionalPropertiesObj[e[0]] = e[1]
            })
          }
          this.additionalPropertiesObjInitial = _.cloneDeep(
            this.additionalPropertiesObj
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getThemeCategoryArr() {
      HTTP.getCodeDatasetName({ categoryId: this.categoryId })
        .then(res => {
          res.data.forEach(e => {
            const obj = {
              value: e,
            }
            this.themeCategoryArr.push(obj)
          })
          // this.themeCategoryArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleChooseRefCode() {
      this.$bus.$emit('callDomainCodeSelector')
      this.$bus.$once('domainCodeSelected', code => {
        // console.log(code, 'code')
        this.$set(this.editCode, 'refStdCode', code.code)
        this.getRefCodeDetail(code.code)
      })
    },
    handleClearRefCode() {
      this.getRefCodeDetail()
    },
    getRefCodeDetail(codeNumber) {
      if (!codeNumber) {
        this.refCodeValues = []
        return
      }
      HTTP.getCodeContent({
        codeNumber,
      })
        .then(res => {
          this.refStdCodeDetail = res.data
          let valuesArr = res.data.values || []
          this.refCodeValues = valuesArr
          valuesArr.forEach(element => {
            this.refCodeMapName.set(element.value, element.name)
          })
          let valueMap = {}
          valuesArr.forEach(item => {
            valueMap[item.value] = item
          })
          this.refCodeValueMap = valueMap
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveCode(urlAdd, code, newCodes) {
      return HTTP.updateCodeService(newCodes)
    },
    // initAgGrid() {
    //   const valueLength = this.codeValue.length
    //
    //   const tableOption = {
    //     rowSelection: 'single',
    //     suppressRowClickSelection: true,
    //     noRowsOverlayComponent: 'noRowsOverlayComponent',
    //     noRowsOverlayComponentParams: {
    //       supterComponent: this,
    //     },
    //     frameworkComponents: {
    //       noRowsOverlayComponent: noRowsOverlayComponent,
    //     },
    //   }
    //   this.tableOption = tableOption
    // },
    isInteger(obj) {
      return Math.floor(obj) === obj
    },
    saveEditCode(isUpdate) {
      const tableObj = this.isEdit ? this.editCode.values : this.editCode.value
      let errMsg = ''
      tableObj.forEach(item => {
        let o = item.order - 0
        if (isNaN(o) || !this.isInteger(o) || o <= 0) {
          errMsg = this.$t('domain.code.orderRule')
        }
      })
      if (errMsg) {
        this.$datablauMessage(errMsg)
        return
      }

      if (isUpdate) {
        this.updateCodeApply()
      } else {
        this.ifSendMail({
          emailForDam: false,
          emailForDdm: false,
        })
      }
      // if (this.isEdit) {
      //   this.$refs.sendMailConfirm && this.$refs.sendMailConfirm.showDailog();
      // } else {
      //   this.ifSendMail({
      //     emailForDam: false,
      //     emailForDdm: false
      //   });
      // }
    },
    ifSendMail(para) {
      const editCode = this.editCode || {}
      const urlAdd = `?sendMailForDAM=${para.emailForDam}&sendMailForDDM=${para.emailForDdm}`
      const newCodes = {
        code: editCode.code,
        datasetName: editCode.datasetName,
        name: editCode.name,
        enName: editCode.enName,
        '@class': this.codeClass,
        comment: editCode.comment,
        // values: this.isEdit ? editCode.values : editCode.value,
        categoryId: this.categoryId,
        refStdCode: editCode.refStdCode || null,
        folderId: this.selectedFolderIds[this.selectedFolderIds.length - 1],
      }
      let values = (this.isEdit ? editCode.values : editCode.value) || []
      let valueResult = []
      values.forEach(item => {
        // refCodeValue codeMapping
        let obj = _.cloneDeep(item)
        let refValue = this.refCodeValueMap[obj.refCodeValue]
        // obj.refValue = refValue ? JSON.stringify(refValue) : null
        obj.refValue = refValue || null
        delete obj.refCodeValue
        valueResult.push(obj)
      })
      newCodes.values = valueResult

      // if (!this.useWorkflow) {
      // newCodes.state = 'A'
      // } else {
      newCodes.state = 'D'
      // }
      newCodes.additionalProperties = []
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        if (this.additionalPropertiesObj[e]) {
          newCodes.additionalProperties.push([
            e,
            this.additionalPropertiesObj[e],
          ])
        } else {
          newCodes.additionalProperties.push([e, ''])
        }
      })
      this.submitLoading = true
      if (this.isEdit) {
        if (
          this.form.categoryId &&
          this.form.modelId &&
          this.form.objectId &&
          this.form.schemaName &&
          this.form.codeChineseField &&
          this.form.codeField
        ) {
          this.onSubmit1()
        } else {
          this.saveCode(urlAdd, editCode.code, newCodes)
            .then(res => {
              this.submitLoading = false
              this.$message.success(this.$t('domain.common.modifySuccessfully'))
              this.removetab()
              this.$emit('editSucess')
            })
            .catch(e => {
              this.submitLoading = false
              this.$showFailure(e)
            })
        }
      } else {
        if (
          this.form.categoryId &&
          this.form.modelId &&
          this.form.objectId &&
          this.form.schemaName &&
          this.form.codeChineseField &&
          this.form.codeField
        ) {
          this.onSubmit1()
        } else {
          newCodes.autoGenCode = this.autoCode
          HTTP.saveCodeService(newCodes)
            .then(res => {
              this.submitLoading = false
              this.$message.success(this.$t('domain.common.addSucceed'))
              this.removetab()
              this.$emit('editSucess')
            })
            .catch(e => {
              this.submitLoading = false
              this.$showFailure(e)
            })
        }
      }
    },
    updateCodeApply(val) {
      this.submitLoading = true
      const newCodes = this.editCode || {}
      const udp = {}
      const udpInitial = {}
      newCodes.additionalProperties = []
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        if (this.additionalPropertiesObj[e]) {
          newCodes.additionalProperties.push([
            e,
            this.additionalPropertiesObj[e],
          ])
          const newValue = this.additionalPropertiesObj[e]
          const oldValue = this.additionalPropertiesObjInitial[e]
          udp[e] = newValue
          if (newValue !== oldValue) {
            udpInitial[e] = oldValue
          }
        } else {
          newCodes.additionalProperties.push([e, ''])
        }
      })
      newCodes.whetherBusinessDimension = this.editCode.whetherBusinessDimension
      newCodes.businessId = this.form1.categoryId
      newCodes.businessName = this.form1.categoryName
      newCodes.modelId = this.form1.modelId
      newCodes.modelName = this.form1.modelName
      newCodes.schema = this.form1.schemaName
      newCodes.objectId = this.form1.objectId
      newCodes.datasourceId = this.datasourceId
      newCodes.objectName = this.form1.objectName
      newCodes.codeFieldId = this.form1.codeField
      newCodes.codeField = this.form1.codeFieldName
      newCodes.codeChineseFieldId = this.form1.codeChineseField
      newCodes.codeChineseField = this.form1.codeChineseFieldName
      newCodes.authDimensionId = this.form1.authDimensionId
      newCodes.authDimensionNameEn = this.form1.authDimensionNameEn
      newCodes.authDimensionNameEnId = this.form1.authDimensionNameEnId
      newCodes.authDimension = this.form1.authDimension
      newCodes.parentValueId = this.form1.parentValueId
      newCodes.parentValue = this.form1.parentValue
      newCodes.schedule = this.form1.schedule
      newCodes.dbType = this.modelType
      newCodes.conditionList = this.form1.SqlModifierRef?.map((o, u) => {
        if (o.condition1) {
          return {
            order: u,
            conditionField: o.columnName,
            conditionFieldId: o.columnId,
            operator: o.operator,
            fillValue: `${o.condition},${o.condition1}`,
          }
        } else {
          return {
            order: u,
            conditionField: o.columnName,
            conditionFieldId: o.columnId,
            operator: o.operator,
            fillValue: `${o.condition}`,
          }
        }
      })
      newCodes.sql = this.sqlContext
      newCodes['@class'] =
        'com.datablau.dam.data.job.descriptor.SyncDataStandardJobDescriptor'
      newCodes.colMap = {
        CODE: this.editCode.code,
        CH_NAME: this.editCode.name,
        EN_NAME: this.editCode.enName,
        DATASET: this.editCode.datasetName,
        VALUE: this.form1.codeFieldName,
        VALUE_CH_NAME: this.form1.codeChineseFieldName,
        VALUE_EN_NAME: '',
        VALUE_PARENT_CODE: this.form1.parentValue,
        AUTH_DIMENSION: this.form1.authDimension,
        DOMAIN_ID: this.newDomianId,
        AUTH_DIMENSION_EN: this.form1.authDimensionNameEn,
      }
      newCodes.jobName = `标准代码-从数据抽取同步标准代码任务-${this.editCode.name}`
      newCodes.typeName = '数据标准-从数据库同步标准代码任务'

      HTTP.updateCode(newCodes)
        .then(res => {
          this.submitLoading = false
          this.$message.success(this.$t('domain.common.SubmissionSucceeded'))
          this.removetab()
          this.$emit('editSucess')
        })
        .catch(e => {
          this.submitLoading = false
          this.$showFailure(e)
        })
    },
    dataInit() {
      if (this.isEdit) {
        for (const key in this.oldData) {
          this.$set(this.editCode, key, this.oldData[key] || '')
        }
      }
    },
    removetab() {
      this.$emit('removetab')
    },
    changeCollapse(showArr) {
      const index = showArr.indexOf('codeValue')
      if (index !== -1) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.resetTableStyle()
          }, 300)
        })
      }
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const allValue = this.codeValue
        try {
          if (this.tableShowPagination) {
            let showData = []
            const s = para.pageSize || 10
            const c = para.currentPage || 1
            showData = allValue.slice((c - 1) * s, c * s)
            resolve(showData)
          } else {
            let data = allValue || []
            if (allValue.length === 0) {
              data = []
            }
            resolve(data)
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    resetTableStyle() {
      const index = this.showArr.indexOf('codeValue')
      this.$refs.tabWitdTable &&
        this.$refs.tabWitdTable.resetTableStyle &&
        index !== -1 &&
        this.$refs.tabWitdTable.resetTableStyle()
    },
    testValueItem() {
      let errMsg = ''
      let bool = true
      let propsArr
      if (this.isEdit) {
        propsArr = ['name', 'value', 'order']
      } else {
        propsArr = ['name', 'value', 'order']
      }

      const tableObj = []
      if (this.isEdit) {
        tableObj.push(...this.editCode.values)
      } else {
        tableObj.push(...this.editCode.value)
      }
      if (tableObj && Array.isArray(tableObj)) {
        tableObj.forEach(item => {
          const test = propsArr.some(prop => {
            let bool = false
            if (!item[prop] && item[prop] !== 0) {
              if (prop === 'order' && this.gszcCustomer) {
                item[prop] = this.getMaxOrder()
              } else {
                errMsg = this.$t('domain.common.requiredEmpty')
                bool = true
              }
            } else if (prop === 'order') {
              const o = item[prop]
              if (!o && o !== 0) {
                errMsg = this.$t('domain.common.requiredEmpty')
                bool = true
              }
            }
            return bool
          })
          if (test) {
            bool = false
          }
        })
      } else {
        bool = false
      }
      this.errMsg = errMsg
      return bool
    },
    removeValueItem(item) {
      const index = this.codeValue.findIndex(value => {
        return value.value === item.value
      })
      this.codeValue.splice(index, 1)
      this.refreshTable()
    },
    refreshTable() {
      this.$refs.tabWitdTable && this.$refs.tabWitdTable.refreshData()
    },
    getMaxOrder() {
      let values = this.isEdit ? this.editCode.values : this.editCode.value
      if (!values || !values.length) return 1
      let maxOrder = 1
      values.forEach(item => {
        let order = item.order - 0
        if (isNaN(order)) {
          order = 0
        }
        if (maxOrder <= order) {
          maxOrder = order + 1
        }
      })
      return maxOrder
    },
    addColumn() {
      if (this.isEdit) {
        if (this.form.categoryId) {
          this.$message.warning('已配置来源系统，不能添加新编码！')
          return
        }
      } else {
        if (this.form1.categoryId) {
          this.$message.warning('已配置来源系统，不能添加新编码！')
          return
        }
      }
      if (this.showTableData.length > 0) {
        if (typeof this.editCode.values !== 'undefined') {
          this.editCode.values.push({
            value: '',
            // children: [],
            // enName: '',
            level: 1,
            name: '',
            order: this.getMaxOrder(),
            parentValue: '',
            refCodeValue: '',
            definition: this.showTableData.filter(k => k.level === 1)[0]
              ?.definition,
            definitionError: false,
            definition2: '',
            definition3: '',
          })
        } else {
          // this.num++
          this.editCode.value.push({
            value: '',
            // children: [],
            // enName: '',
            name: '',
            level: 1,
            order: this.getMaxOrder(),
            parentValue: '',
            refCodeValue: '',
            definition: this.showTableData.filter(k => k.level === 1)[0]
              ?.definition,
            definitionError: false,
            definition2: '',
            definition3: '',
          })
        }
      } else {
        if (typeof this.editCode.values !== 'undefined') {
          this.editCode.values.push({
            value: '',
            // children: [],
            // enName: '',
            level: 1,
            name: '',
            order: this.getMaxOrder(),
            parentValue: '',
            refCodeValue: '',
            definition: '',
            definitionError: false,
            definition2: '',
            definition3: '',
          })
        } else {
          // this.num++
          this.editCode.value.push({
            value: '',
            // children: [],
            // enName: '',
            name: '',
            level: 1,
            order: this.getMaxOrder(),
            parentValue: '',
            refCodeValue: '',
            definition: '',
            definitionError: false,
            definition2: '',
            definition3: '',
          })
        }
      }
      this.skip2LastPage()
    },
    sortCodeValues() {
      this.$utils.sort.sort(this.tableParentValue, 'order')
    },
    skip2LastPage() {
      let pageCount = this.codeValueCount / this.filterObj.pageSize
      this.filterObj.currentPage = Math.ceil(pageCount)
    },
    deleteRow(row, index) {
      // console.log(index, 'index')
      if (!index && index !== 0) {
        index = this.tableParentValue.findIndex(item => item === row)
      }
      // console.log(index, 'index')
      if (index === -1) {
        this.$message.info(this.$t('domain.common.dataNotFind'))
      }
      if (this.isEdit) {
        this.editCode.values.splice(index, 1)
      } else {
        this.editCode.value.splice(index, 1)
      }
      this.parentValueOptions.forEach(element => {
        if (element.value === row.value) {
          this.parentValueOptions.splice(element, 1)
        }
      })
    },
    querySearch(queryString, cb) {
      // var restaurants = this.themeCategoryArr;
      var restaurants = this.themeCategoryArr
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSizeChange(p) {
      this.filterObj.currentPage = 1
      this.filterObj.pageSize = p
    },
    handleCurrentChange(p) {
      this.filterObj.currentPage = p
    },
    clearAutoRemakes(row) {
      row.definition = ''
      row.definition2 = ''
      row.definitionError = false
      // 将同层级的编码的字段名统一
      this.showTableData
        .filter(item => item.level === row.level)
        .forEach(item => {
          this.$set(item, 'definition', '')
          this.$set(item, 'definition2', '')
        })
      this.$nextTick(() => {
        this.checkDefinition()
      })
    },
    addSQL() {
      let obj = {
        operator: '',
        columnId: '',
        columnName: '',
        condition: '',
        condition1: '',
      }
      this.form.SqlModifierRef.push(obj)
    },
    deleteSQL(index) {
      this.form.SqlModifierRef.splice(index, 1)
    },
    removeSqlModifierRefItem() {},
    getCronString(cronString, type) {
      if (cronString === null) {
        this.form.schedule = cronString
      } else {
        this.form.schedule = 'cron:' + cronString
      }
    },
    // 切换运算符
    changeOperator() {
      // this.form.columnId = null
      // this.form.columnName = null
      // this.form.condition = null
      // this.form.condition1 = null
    },
    // 查询来源系统信息
    getSourse(code) {
      this.$http
        .get(`/domain/domains/codeSource/${code}`)
        .then(res => {
          if (!res.data.businessId) {
            // this.handleModelCategoryChange()
          } else {
            this.jobId = res.data.jobId
            if (res.data.code) {
              this.editCode.code = res.data.code
            }
            this.form.categoryName = res.data.businessName
            this.form.categoryId = res.data.businessId
            if (this.form.categoryId) {
              this.getModelList()
            }
            this.form.modelId = res.data.modelId
            this.modelType = res.data.dbType
            this.form.modelName = res.data.modelName
            if (this.form.modelId) {
              this.getTableList(this.form.modelId)
            }
            // this.handleModelIdChange(this.form.modelId)
            this.form.objectId = res.data.objectId
            this.form.objectName = res.data.objectName
            this.form.schemaName = res.data.schema
            this.form.codeChineseField = res.data.codeChineseFieldId
            this.form.codeChineseFieldName = res.data.codeChineseField
            this.form.authDimensionId = res.data.authDimensionId
            this.form.authDimensionNameEn = res.data.authDimensionNameEn
            this.form.authDimensionNameEnId = res.data.authDimensionNameEnId
            this.form.authDimension = res.data.authDimension
            this.form.codeField = res.data.codeFieldId
            this.form.codeFieldName = res.data.codeField
            this.form.parentValueId = res.data.parentValueId
            this.form.parentValue = res.data.parentValue
            this.datasourceId = res.data.datasourceId
            if (this.form.objectId) {
              this.getColumnList()
            }
            this.form.schedule = res.data.schedule ? res.data.schedule : null
            this.sqlContext = res.data.sql
            this.form.sqlContext = res.data.sql
            this.form.SqlModifierRef = res.data.conditionList?.map(item => {
              if (
                item.fillValue.includes(',') &&
                item.operator !== 'in' &&
                item.operator !== 'not in'
              ) {
                const fillValue1 = item.fillValue.split(',')
                return {
                  columnName: item.conditionField,
                  columnId: item.conditionFieldId,
                  operator: item.operator,
                  condition: fillValue1[0],
                  condition1: fillValue1[1],
                }
              } else {
                return {
                  columnName: item.conditionField,
                  columnId: item.conditionFieldId,
                  operator: item.operator,
                  condition: item.fillValue,
                }
              }
            })
          }
          this.form1 = _.cloneDeep(this.form)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 外部保存
    onSubmit1() {
      let json = {}
      this.form.sqlContext = this.sqlContext
      json.whetherBusinessDimension = this.editCode.whetherBusinessDimension
      json.datasetName = this.editCode.datasetName
      json.name = this.editCode.name
      json.code = this.autoCode ? '' : this.editCode.code
      json.enName = this.editCode.enName
      json.comment = this.editCode.comment
      json.categoryId = this.categoryId
      json.refStdCode = this.editCode.refStdCode
      json.state = 'D'
      json.autoGenCode = this.autoCode

      json.businessId = this.form1.categoryId
      json.businessName = this.form1.categoryName
      json.modelId = this.form1.modelId
      json.modelName = this.form1.modelName
      json.schema = this.form1.schemaName
      json.objectId = this.form1.objectId
      json.datasourceId = this.datasourceId
      // json.driverId = this.driverIdNews
      json.objectName = this.form1.objectName
      json.codeFieldId = this.form1.codeField
      json.codeField = this.form1.codeFieldName
      json.codeChineseFieldId = this.form1.codeChineseField
      json.codeChineseField = this.form1.codeChineseFieldName
      json.authDimensionId = this.form1.authDimensionId
      json.authDimensionNameEn = this.form1.authDimensionNameEn
      json.authDimensionNameEnId = this.form1.authDimensionNameEnId
      json.authDimension = this.form1.authDimension
      json.parentValueId = this.form1.parentValueId
      json.parentValue = this.form1.parentValue
      json.schedule = this.form1.schedule
      json.dbType = this.modelType
      json.conditionList = this.form1.SqlModifierRef?.map((o, u) => {
        if (o.condition1) {
          return {
            order: u,
            conditionField: o.columnName,
            conditionFieldId: o.columnId,
            operator: o.operator,
            fillValue: `${o.condition},${o.condition1}`,
          }
        } else {
          return {
            order: u,
            conditionField: o.columnName,
            conditionFieldId: o.columnId,
            operator: o.operator,
            fillValue: `${o.condition}`,
          }
        }
      })
      json.sql = this.sqlContext
      json['@class'] =
        'com.datablau.dam.data.job.descriptor.SyncDataStandardJobDescriptor'
      json.colMap = {
        CODE: this.editCode.code,
        CH_NAME: this.editCode.name,
        EN_NAME: this.editCode.enName,
        DATASET: this.editCode.datasetName,
        VALUE: this.form1.codeFieldName,
        VALUE_CH_NAME: this.form1.codeChineseFieldName,
        VALUE_EN_NAME: '',
        VALUE_PARENT_CODE: this.form1.parentValue,
        AUTH_DIMENSION: this.form1.authDimension,
        DOMAIN_ID: this.newDomianId,
        AUTH_DIMENSION_EN: this.form1.authDimensionNameEn,
      }
      // json.connectionInfo = this.connectionInfo
      json.creator = this.$user.username

      json.jobName = `标准代码-从数据抽取同步标准代码任务-${this.editCode.name}`
      json.typeName = '数据标准-从数据库同步标准代码任务'
      if (this.isEdit) {
        json.values = this.editCode?.values || []
        json.jobId = this.jobId
        json.code = this.editCode.realCode || this.editCode.code
        json.cleanSource = !this.sqlContext
        this.$http
          .post(`/domain/domains/code/updateCodeFromDB`, json)
          .then(res => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.modifySuccessfully'))
            // this.getRunJob(this.jobId)
            this.removetab()
            this.$emit('editSucess')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      } else {
        json.values = this.editCode?.value || []
        json.colMap.CODE = '{}'
        this.$http
          .post(`/domain/domains/code/createCodeFromDB`, json)
          .then(res => {
            this.submitLoading = false
            this.$message.success(this.$t('domain.common.addSucceed'))
            this.getRunJob(res.data.jobId)
            this.removetab()
            this.$emit('editSucess')
          })
          .catch(e => {
            this.submitLoading = false
            this.$showFailure(e)
          })
      }
    },
    // 查询编辑来源系统
    onEdit(val) {
      if (this.editCode.values.length !== 0) {
        if (this.form1.categoryId === null) {
          this.$message.warning('已添加新编码，不能添加来源系统！')
          return
        }
      }
      if (this.autoCode) {
        if (this.editCode.datasetName && this.editCode.name) {
          this.visibleSync = true
        } else {
          this.$message.warning('请填写必填项')
        }
      } else {
        if (
          this.editCode.code &&
          this.editCode.datasetName &&
          this.editCode.name
        ) {
          this.visibleSync = true
        } else {
          this.$message.warning('请填写必填项')
        }
      }
    },
    sourceSystem() {
      if (
        this.autoCode ||
        (this.editCode.code && this.editCode.datasetName && this.editCode.name)
      ) {
        this.visibleSync = true
      } else {
        this.$message.warning('请填写必填项')
      }
    },
    save(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.form1 = _.cloneDeep(this.form)
          this.visibleSync = false
        } else {
          this.$message.warning('请填写必填项')
          return false
        }
      })
    },
    back() {
      this.visibleSync = false
      if (!this.isEdit) {
        this.form = {
          categoryName: '',
          categoryId: null,
          modelId: null,
          modelName: '',
          objectId: null,
          objectName: '',
          columnId: null,
          columnName: '',
          schemaName: null,
          codeChineseField: null,
          codeChineseFieldName: '',
          codeField: null,
          codeFieldName: '',
          parentValueId: null,
          parentValue: '',
          operator: null,
          condition: '',
          condition1: '',
          sqlContext: '',
          resultTablePks: [],
          schedule: '', // 重复周期
        }
      } else {
        this.getSourse(this.row.code)
      }
    },
    handleModelIdChange(value) {
      this.schemaArr = []
      this.form.schemaName = null
      this.form.objectId = null
      // this.form.columnId = null
      this.form.objectName = null
      // this.form.columnName = null
      this.form.codeField = null
      this.form.codeFieldName = null
      this.form.codeChineseField = null
      this.form.codeChineseFieldName = null
      this.form.parentValueId = null
      this.form.parentValue = null
      this.form.SqlModifierRef.forEach(e => {
        e.columnId = null
        e.columnName = null
      })
      this.form.modelName = this.modelList.filter(
        e => e.modelId === value
      )[0].definition
      this.modelType = this.modelList.filter(e => e.modelId === value)[0].type
      this.modelList.forEach(element => {
        if (element.modelId === value) {
          this.datasourceId = element.datasourceId
          this.connectionInfo = element
          if (element?.schema) {
            let arr = element.schema.split(';')
            arr.forEach((item, index) => {
              this.schemaArr.push({
                name: item,
                id: index,
              })
            })
          } else {
            let arr = element?.database?.split(';') || []
            arr.forEach((item, index) => {
              this.schemaArr.push({
                name: item,
                id: index,
              })
            })
          }
        }
      })
    },
    clearSchemaName() {
      this.form.objectId = null
      // this.form.columnId = null
      this.form.objectName = null
      // this.form.columnName = null
      this.form.codeField = null
      this.form.codeFieldName = null
      this.form.codeChineseField = null
      this.form.codeChineseFieldName = null
      this.form.parentValueId = null
      this.form.parentValue = null
      this.form.SqlModifierRef.forEach(e => {
        e.columnId = null
        e.columnName = null
      })
    },
    initTableAndColumn() {
      this.form.objectId = null
      // this.form.columnId = null
      this.form.objectName = null
      // this.form.columnName = null
      this.form.codeField = null
      this.form.codeFieldName = null
      this.form.codeChineseField = null
      this.form.codeChineseFieldName = null
      this.form.parentValueId = null
      this.form.parentValue = null
      this.form.SqlModifierRef.forEach(e => {
        e.columnId = null
        e.columnName = null
      })
      this.form.resultTablePks = []
      this.getTableList(this.form.modelId)
      this.$refs.ruleForm.validateField('modelId')
    },
    initColumn(objectName) {
      if (typeof objectName === 'string') {
        this.form.objectName = objectName
      }
      // this.form.columnId = null
      // this.form.columnName = null
      this.form.codeField = null
      this.form.codeFieldName = null
      this.form.codeChineseField = null
      this.form.codeChineseFieldName = null
      this.form.parentValueId = null
      this.form.parentValue = null
      this.form.SqlModifierRef.forEach(e => {
        e.columnId = null
        e.columnName = null
      })
      this.form.resultTablePks = []
      this.showTableList = false
    },
    handleSqlModelChange(isInitTableAndColumn = true) {
      if (isInitTableAndColumn) {
        this.initTableAndColumn()
      }
    },
    createSqlResult(isCompareSql = null) {
      if (!this.form.modelId) {
        return
      }
      this.currentSqlLineageErrMsg = ''
      this.tableLoading = true
    },
    getModelList() {
      this.$http
        .get(
          `/metadata/models/fromreByCatelog?catelogId=${this.form.categoryId}`
        )
        .then(res => {
          this.modelList = res.data
          this.schemaArr = []
          this.modelList.forEach(element => {
            this.connectionInfo = element
            if (element.modelId === this.form.modelId) {
              if (element?.connectionInfo?.schemas) {
                let arr = element.connectionInfo.schemas.split(';')
                arr.forEach((item, index) => {
                  this.schemaArr.push({
                    name: item,
                    id: index,
                  })
                })
              } else {
                let arr = element.database.split(';')
                arr.forEach((item, index) => {
                  this.schemaArr.push({
                    name: item,
                    id: index,
                  })
                })
              }
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableList(objectName, id, schemaName) {
      return new Promise(resolve => {
        const obj = {
          currentPage: 1,
          keyword: objectName === this.form.modelId ? '' : objectName,
          modelIds: [this.form.modelId],
          pageSize: 100,
          tagIds: null,
          typeIds: [80000004],
          schema: this.form.schemaName,
        }
        this.$http
          .post(`/metadata/entities/searchMetadata`, obj)
          .then(res => {
            let _this = this
            if (this.form.objectId !== null && typeof objectName === 'number') {
              let findtableId = res.data.content.find(function (obj) {
                return obj.objectId === _this.form.objectId
              })
              if (findtableId === undefined) {
                this.getTableList(this.form.objectName)
              }
            }
            this.tableList = res.data.content
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getTableName(id) {
      if (!id) {
        return
      }
      this.form.objectName = this.tableList.filter(
        e => e.objectId === id
      )[0].physicalName
      this.getColumnList().then(() => {
        this.getColumnName(this.form.columnId)
      })
    },
    getColumnName(id) {
      if (!id) {
        return
      }
      this.form.SqlModifierRef.forEach(e => {
        if (e.columnId === id) {
          e.columnName = this.columnList.filter(
            e => e.objectId === id
          )[0].physicalName
        }
      })
    },
    getCodeFieldName(id) {
      if (!id) {
        return
      }
      this.form.codeFieldName = this.columnList.filter(
        e => e.objectId === id
      )[0].physicalName
    },
    getCodeChineseFieldName(id) {
      if (!id) {
        return
      }
      this.form.codeChineseFieldName = this.columnList.filter(
        e => e.objectId === id
      )[0].physicalName
    },
    getParentValueName(id) {
      if (!id) {
        return
      }
      this.form.parentValue = this.columnList.filter(
        e => e.objectId === id
      )[0].physicalName
    },
    getColumnList() {
      return new Promise(resolve => {
        const obj = {
          name: '',
        }
        if (this.form.objectId != null) {
          this.$http
            .post(`/metadata/entities/${this.form.objectId}/columns`)
            .then(res => {
              this.columnList = res.data
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    ruleTypeChange(val) {
      this.$refs.ruleForm.clearValidate()
      this.getTableList('')
      // 切换时清空所有sql脱敏相关信息
      this.cols = []
      this.colsA = []
      this.colsB = []
      this.resMapping = '{}'
      this.resMappingA = '{}'
      this.resMappingB = '{}'
      this.realMapping = '[]'
      this.realMappingA = '[]'
      this.realMappingB = '[]'
    },
    handleModelCategoryChange() {
      this.form.modelId = null
      this.form.modelName = null
      this.form.schemaName = null
      this.form.objectId = null
      // this.form.columnId = null
      this.form.objectName = null
      // this.form.columnName = null
      this.form.codeField = null
      this.form.codeFieldName = null
      this.form.codeChineseField = null
      this.form.codeChineseFieldName = null
      this.form.parentValueId = null
      this.form.parentValue = null
      this.form.SqlModifierRef.forEach(e => {
        e.columnId = null
        e.columnName = null
      })
      this.getSystemIdAndSourceList()
    },
    getSystemIdAndSourceList() {
      if (!this.form.categoryName) {
        return
      }
      this.form.categoryId = this.$modelCategories.filter(
        e => e.categoryName === this.form.categoryName
      )[0].categoryId
      if (this.form.categoryId) {
        this.getModelList()
      }
    },
    getRunJob(jobId) {
      // this.$http.get(`${this.$url}/service/datablau_jobs/${jobId}/run`)
      this.$http
        .post(`/job/main/startJob?jobId=${jobId}&executor=admin`)
        .then(res => {
          // console.log(res.data, 'res.data')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAuthDimensionName(id) {
      if (!id) {
        this.form.authDimension = ''
        return
      }
      this.form.authDimension = this.columnList.filter(
        e => e.objectId === id
      )[0].physicalName
    },
    clearValue() {
      this.form.codeField = null
      this.form.codeFieldName = ''
    },
    conditionAutoCode(code) {
      const arr = code.split(',')
      let mes = ''
      arr.forEach((item, i) => {
        mes = mes + "'" + item + "'"
        if (i < arr.length - 1) {
          mes = mes + ','
        }
      })
      return mes
    },
    clearValue1() {
      this.form.codeChineseField = null
      this.form.codeChineseFieldName = ''
    },
    clearValue2() {
      this.form.parentValueId = ''
      this.form.parentValue = ''
    },
    clearValue3() {
      this.authDimensionId = ''
      this.authDimension = ''
    },
    clearValue4(index) {
      this.form.SqlModifierRef[index].columnId = null
      this.form.SqlModifierRef[index].columnName = ''
    },
    clearValue5(index) {
      this.form.SqlModifierRef[index].operator = ''
      this.clearValue4(index)
      this.form.SqlModifierRef[index].condition = ''
      this.form.SqlModifierRef[index].condition1 = ''
    },
    autoRemakes(row) {
      this.rowData = {}
      this.$nextTick(() => {
        this.rowData = {
          ...row,
          definition: row.definitionError ? '' : row.definition,
        }
        this.definitionArr = []
        this.sortCategory(this.rowData)
        this.$bus.$emit('callDomainSelector', {
          multiple: true,
          code: this.editCode.code,
          rowData: this.rowData,
          showTableData: this.showTableData,
          definitionArr: this.definitionArr,
        })
      })
    },
    sortCategory(rowData) {
      let definitionArr = []
      this.showTableData
        .filter(item => item.level !== rowData.level)
        .forEach(code => {
          definitionArr = definitionArr.concat(
            (code.definition || '').split(',')
          )
        })
      this.definitionArr = definitionArr
      return this.definitionArr
    },
  },
}
</script>
<style lang="scss">
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.tab-page.edit-code-node {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 20px;

  .content-outer {
    @include absPos();
    .el-collapse-item__header {
      height: 40px;
      line-height: 40px;
    }
    .collapse-title {
      padding-left: 10px;
      h4 {
        position: relative;
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        &::after {
          content: '';
          display: block;
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          height: 14px;
          width: 4px;
          background: #409eff;
        }
      }
    }
  }
  .message-form-item {
    // width: 490px;
    display: inline-block;
    vertical-align: top;
    &:nth-of-type(odd) {
      //margin-right: 20px;
    }
  }

  .dia-input-item {
    width: 300px;

    textarea {
      width: 100%;
    }
  }

  .table-container {
    position: relative;

    &.table-add-min-height {
      min-height: 500px;
    }

    .table-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      cursor: pointer;
    }
    .thin {
      .el-table__body .el-table__row {
        .el-input__inner,
        .el-select .el-input {
          height: 30px !important;
          line-height: 30px !important;
        }
      }
    }
  }

  .page-btn-group {
    margin-bottom: 20px;
  }

  .pagination-outer {
    float: right;
    padding: 10px 0;
  }
}

.star {
  color: #f56c6c;
  font-size: 14px;
  margin: 2px 0 0 4px;
}

.code-detail-form {
  .el-form-item {
    margin-right: 4px;
  }
  .udp-form-item .el-form-item__error {
    left: 190px;
    display: block;
  }
}
</style>

<style lang="scss">
.el-dialog__wrapper
  .el-dialog.datablau-dialog-system
  .el-dialog__body
  .datablau-dialog-content {
  padding: 0 16px;
}

.tab-page.edit-code-node {
  .page-form {
    .dia-input-item {
      textarea {
        width: 100%;
      }
    }
  }

  .required-star {
    .ag-header-cell-text {
      &::before {
        content: '* ';
        color: red;
      }
    }
  }

  .tab-bottom-line {
    border-bottom: 1px solid #eee;
  }

  .ag-overlay {
    z-index: 22;
    // background-color: red;
  }

  .ag-center-cols-container {
    background-color: #fff;
  }

  // .msg-container {
  //   position: relative;
  //   .msg-inner {
  //     position: absolute;
  //     z-index: 22;
  //     width: 300px;
  //     text-align: center;
  //   }
  // }
  .add-first-btn {
    span {
      // position: absolute;
      cursor: pointer;
    }
  }
}
</style>
<style lang="scss" scoped>
.condition-box {
  border: 1px solid #eee;
  background: #eee;
  margin-bottom: 10px;
  overflow: auto;
  position: relative;
}
</style>
