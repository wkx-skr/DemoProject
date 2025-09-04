<template>
  <div class="edit-api-tab" v-loading="loadingData">
    <datablau-dialog
      title="生成 SQL"
      :visible.sync="generateSQLVisible"
      width="900px"
      height="400px"
      class="app-edit-dialog generate-sql-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="edit-dialog-outer">
        <el-form
          label-width="90px"
          :model="generateSqlData"
          v-if="generateSQLVisible"
          class="generate-sql-dialog"
        >
          <el-form-item label="选择字段" :rules="{ required: true }">
            <div
              class="show-with-count"
              v-if="
                generateSqlData.chooseCols &&
                generateSqlData.chooseCols.length > 20 &&
                false
              "
            >
              <datablau-select
                v-model="chooseLimit"
                filterable
                clearable
                collapse-tags
                @visible-change="handleVisibleChange"
                multiple
                @focus="selectReturnCols"
                ref="returnColSelector"
                style="width: 720px"
              >
                <el-option
                  v-for="item in columnListLimit"
                  :key="item.objectId"
                  :label="item.physicalName"
                  :value="item.objectId"
                ></el-option>
              </datablau-select>
            </div>

            <el-select
              v-model="generateSqlData.chooseCols"
              filterable
              clearable
              multiple
              @visible-change="handleVisibleChange"
              @focus="selectReturnCols"
              @clear="clearReturnCols"
              popper-class="datablau-select-dropdown"
              style="width: 720px"
              ref="returnColSelector"
              class="choose-return-cols sql-condition"
              placeholder="请选择字段"
              v-else
            >
              <el-option
                v-for="item in columnList"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="过滤条件"
            prop="conditionList"
            class="condition-lines"
          >
            <div class="condition-container" :key="conditionListKey">
              <div class="condition-line">
                <el-button
                  type="primary"
                  size="mini"
                  style="
                    position: relative;
                    z-index: 10;
                    margin-bottom: 10px;
                    font-size: 12px;
                    padding-left: 1em;
                    padding-right: 1em;
                  "
                  @click="addQuery"
                >
                  新增条件组
                </el-button>
                <function-graph
                  @update="updateFunction"
                  :selectConditionCols="selectConditionCols"
                  :raw-data="sqlConditionData"
                  :columnList="columnList"
                ></function-graph>
              </div>
            </div>
          </el-form-item>
          <el-form-item
            label="分组"
            prop="group"
            class="condition-lines"
            style="clear: both"
          >
            <el-select
              ref="groupByCols"
              filterable
              clearable
              multiple
              v-model="generateSqlData.groupByCols"
              placeholder="请选择分组字段"
              @visible-change="handleVisibleChange"
              @focus="selectGroupCols"
              @clear="clearGroupCols"
              popper-class="datablau-select-dropdown"
              style="width: 720px"
            >
              <el-option
                v-for="item in columnList"
                :key="item.objectId"
                :label="item.physicalName"
                :value="item.objectId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="orderList" class="condition-lines">
            <div class="condition-container" :key="orderListKey">
              <div
                class="condition-line"
                v-for="(item, index) in generateSqlData.orderByCols"
                :key="index"
              >
                <datablau-select
                  ref="orderByCols"
                  v-model="item.column"
                  filterable
                  @visible-change="handleVisibleChange"
                  placeholder="请选择排序字段"
                  @focus="selectOrderCols(index, $event)"
                  clearable
                  class="condition-col sql-condition"
                >
                  <el-option
                    v-for="item in columnList"
                    :key="item.objectId"
                    :label="item.physicalName"
                    :value="item.objectId"
                  ></el-option>
                </datablau-select>
                <datablau-select
                  v-model="item.orderType"
                  placeholder="排序方式"
                  clearable
                  size="mini"
                  class="operator-col sql-condition"
                >
                  <el-option value="ASC" label="升序">升序</el-option>
                  <el-option value="DESC" label="降序">降序</el-option>
                </datablau-select>
                <datablau-button
                  icon="el-icon-plus"
                  @click="addOrderCol"
                  size="mini"
                  plain
                  low-key
                  type="icon"
                  v-if="item.column"
                ></datablau-button>
                <datablau-button
                  icon="el-icon-minus"
                  @click="removeOrderCol(index)"
                  size="mini"
                  low-key
                  type="icon"
                  plain
                  v-if="
                    generateSqlData.orderByCols &&
                    generateSqlData.orderByCols.length > 1
                  "
                ></datablau-button>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-bottom">
        <datablau-button size="small" @click="generateSQLVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="handleGenerateSql"
          class=""
          :disabled="!couldGenerateSql"
          :title="disableMessage"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>

    <datablau-dialog
      title="选择表"
      custom-class="choose-table-info"
      :visible.sync="showChooseTable"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="table-outer" v-if="showChooseTable">
        <choose-table
          :singleRowSelection="true"
          :schema="apiEditData.schemaName"
          :modelId="apiEditData.modelId"
          :showModelFilter="false"
          @confirmChoose="confirmChoose"
        ></choose-table>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="选择字段"
      custom-class="choose-table-info"
      :visible.sync="chooseReturnCols"
      width="1000px"
      class="app-edit-dialog choose-cols"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="table-outer" v-if="chooseReturnCols">
        <choose-column
          :singleRowSelection="selectColType === 'single'"
          :schema="apiEditData.schemaName"
          :modelId="apiEditData.modelId"
          :tableId="apiEditData.tableObjectId"
          :tableName="apiEditData.tableName"
          :showModelFilter="false"
          :showTableFilter="false"
          :choseCols="choseCols"
          @confirmChoose="confirmChooseColumn"
        ></choose-column>
      </div>
    </datablau-dialog>
    <datablau-form-submit>
      <div class="container api-form-edit">
        <div class="top-form">
          <el-form
            class="page-form api-form-edit-info"
            label-position="right"
            label-width="180px"
            size="mini"
            :model="apiEditData"
            ref="apiEditForm"
            :inline="true"
            :rules="rules"
            :disabled="!isEdit"
          >
            <div class="db-fieldMessage-title">
              <p class="message-title">接口配置</p>
            </div>
            <div class="form-group">
              <el-form-item label="API名称" v-if="!isEdit && false">
                <span
                  style="font-size: 12px; width: 300px; display: inline-block"
                >
                  {{ apiEditData.code }}
                </span>
              </el-form-item>
              <el-form-item label="API名称" prop="name">
                <datablau-input
                  size="mini"
                  class="api-form-edit-input"
                  v-model="apiEditData.name"
                  placeholder="请输入API名称"
                  :disabled="!isEdit"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="版本号" prop="version">
                <datablau-input
                  size="mini"
                  class="api-form-edit-input"
                  v-model="apiEditData.version"
                  placeholder="请输入版本号"
                  :disabled="!isEdit"
                ></datablau-input>
              </el-form-item>
              <br />
              <el-form-item label="分类" prop="apiCatalog">
                <datablau-select
                  class="api-form-edit-input"
                  v-model="apiEditData.apiCatalog"
                  placeholder="请选择分类"
                  :disabled="!isEdit"
                  allow-create
                  filterable
                >
                  <el-option
                    v-for="item in apiCatalogArr"
                    :key="item.id"
                    :label="item.apiCatalog"
                    :value="item.apiCatalog"
                  ></el-option>
                </datablau-select>
              </el-form-item>

              <el-form-item label="访问地址" prop="api">
                <datablau-input
                  size="mini"
                  class="api-form-edit-input"
                  v-model="apiEditData.api"
                  placeholder="例如: /test/examples"
                  :disabled="!isEdit"
                  v-if="isEdit"
                ></datablau-input>
              </el-form-item>
              <span class="url-line" v-if="!isEdit">
                <span class="url-content">
                  {{ ApiBaseurl }}{{ apiEditData.api }}
                </span>
                <span class="copy-btn" @click="copyToClipboard">复制</span>
                <!--<datablau-button type="text" size="mini" :disabled="false">复制</datablau-button>-->
              </span>
              <br />
              <!--<div class="parent-form-item">-->
              <!--<span class="parent-label el-form-item__label">接口配置</span>-->
              <!--<div class="form-item-container">-->
              <!--<p class="group-border-outer">-->
              <el-form-item
                prop="effectiveTime"
                class="effective-time-item"
                label="接口时效"
              >
                <datablau-datePicker
                  type="date"
                  value-format="timestamp"
                  size="mini"
                  class="data-picker api-form-edit-input"
                  v-model="apiEditData.effectiveTime"
                  placeholder="请选择下线日期"
                  :disabled="!apiEditData.autoOffline"
                  :picker-options="pickerOptions"
                ></datablau-datePicker>
                <el-checkbox
                  class="auto-offline-check"
                  v-model="apiEditData.autoOffline"
                  @change="autoOfflineChange"
                >
                  过期自动下线，到期时间
                </el-checkbox>
              </el-form-item>
              <br />

              <el-form-item label="流量限制" prop="flowLimit">
                <datablau-input
                  size="mini"
                  class="api-form-edit-input"
                  v-model="apiEditData.flowLimit"
                  placeholder="请输入流量限制"
                  :disabled="!isEdit"
                >
                  <template slot="append">次/分钟</template>
                </datablau-input>
              </el-form-item>
              <el-form-item label="超时限制" prop="overtimeLimit">
                <datablau-input
                  size="mini"
                  class="api-form-edit-input"
                  v-model="apiEditData.overtimeLimit"
                  placeholder="请输入超时限制"
                  :disabled="!isEdit"
                >
                  <template slot="append">秒</template>
                </datablau-input>
              </el-form-item>
              <br />
              <el-form-item label="调用方式" prop="method">
                <datablau-select
                  class="api-form-edit-input"
                  v-model="apiEditData.method"
                  placeholder="请选择调用方式"
                  :disabled="!isEdit"
                >
                  <el-option
                    v-for="item in methodArr"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="调用协议" prop="apiProtocol">
                <datablau-select
                  class="api-form-edit-input"
                  v-model="apiEditData.apiProtocol"
                  placeholder="请选择调用协议"
                  :disabled="!isEdit"
                >
                  <el-option
                    v-for="item in ['http', 'https']"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <br />
              <el-form-item label="更新频率" prop="updateFrequency">
                <datablau-select
                  class="api-form-edit-input"
                  v-model="apiEditData.updateFrequency"
                  placeholder="请选择更新频率"
                  :disabled="!isEdit"
                >
                  <el-option
                    v-for="item in updateFrequencyArr"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="返回格式" prop="resultType">
                <datablau-select
                  class="api-form-edit-input"
                  v-model="apiEditData.resultType"
                  placeholder="请选择返回格式"
                  :disabled="!isEdit"
                >
                  <el-option
                    v-for="item in resultTypeArr"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <br />
              <!--</p>-->
              <!--</div>-->
              <!--</div>-->
              <el-form-item label="接口说明" prop="description">
                <datablau-input
                  size="mini"
                  class="api-form-edit-input text-input-com"
                  type="textarea"
                  v-model="apiEditData.description"
                  placeholder="请输入接口说明"
                  :disabled="!isEdit"
                  :autosize="{ minRows: 3 }"
                  clearable
                ></datablau-input>
              </el-form-item>
              <br />
              <el-form-item
                label="API描述"
                prop="description"
                class="report-description"
                v-if="false"
              >
                <span v-if="!isEdit">暂无描述</span>
                <div class="markdown"></div>
              </el-form-item>
              <br />
              <el-form-item
                label="API链接"
                prop="url"
                class="report-link-item"
                v-if="false"
              >
                <datablau-input
                  size="mini"
                  type="textarea"
                  v-model="apiEditData.url"
                  placeholder="请输入API链接"
                  :disabled="!isEdit"
                  v-if="isEdit"
                ></datablau-input>
                <el-tooltip
                  v-else
                  effect="light"
                  :content="apiEditData.url"
                  placement="top"
                  popper-class="report-url-tooltip"
                >
                  <span class="report-link" @click="skip2Url(apiEditData.url)">
                    {{ apiEditData.url }}
                  </span>
                </el-tooltip>
              </el-form-item>
              <br />
            </div>
            <div class="db-fieldMessage-title">
              <p class="message-title">数据配置</p>
            </div>
            <div class="form-group">
              <el-form-item
                label="接入方式"
                prop="apiAccessMethod"
                v-if="isEdit"
                label-width="180px"
              >
                <el-radio-group
                  v-model="apiEditData.apiAccessMethod"
                  @change="changeApiType"
                >
                  <el-radio
                    name="apiAccessMethod"
                    :label="item.value"
                    v-for="item in apiAccessMethodMap"
                    :key="item.value"
                  >
                    {{ item.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <br />
              <div v-if="apiEditData.apiAccessMethod !== 'PROXY_API'">
                <el-form-item
                  label-width="180px"
                  label="数据源类型"
                  prop="modelType"
                  v-if="false"
                >
                  <datablau-select
                    v-model="apiEditData.modelId"
                    size="mini"
                    class="text-input-com"
                    style="width: 800px"
                    placeholder="请选择目标数据源"
                    @clear="initTableAndColumn"
                    @change="initTableAndColumn"
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
                  <el-cascader
                    v-model="apiEditData.modelId"
                    placeholder="请选择数据源"
                    clearable
                    size="mini"
                    :options="chooseTreeData"
                    :props="dsCascaderProps"
                    :show-all-levels="false"
                    @change="dbChange"
                    v-if="false"
                  >
                    <template slot-scope="{ node, data }">
                      <span>
                        <i
                          class="tree-icon fa fa-database"
                          v-if="data.type === 'MODEL'"
                        ></i>
                        <i
                          class="tree-icon fa fa-cube"
                          v-else-if="data.type === 'SCHEMA'"
                        ></i>
                        <!-- <i class="tree-icon folder" v-else></i> -->
                        <span class="icon-i-folder" v-else>
                          <span class="path1"></span>
                          <span class="path2"></span>
                        </span>
                      </span>
                      <span>{{ data.name }}</span>
                    </template>
                  </el-cascader>
                </el-form-item>
                <el-form-item label-width="180px" label="数据源" prop="modelId">
                  <datablau-select
                    v-model="apiEditData.modelId"
                    size="mini"
                    class="text-input-com"
                    placeholder="请选择目标数据源"
                    @clear="initTableAndColumn"
                    @change="initTableAndColumn"
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
                  <el-cascader
                    v-model="apiEditData.modelId"
                    placeholder="请选择数据源"
                    clearable
                    size="mini"
                    :options="chooseTreeData"
                    :props="dsCascaderProps"
                    :show-all-levels="false"
                    @change="dbChange"
                    v-if="false"
                  >
                    <template slot-scope="{ node, data }">
                      <span>
                        <i
                          class="tree-icon fa fa-database"
                          v-if="data.type === 'MODEL'"
                        ></i>
                        <i
                          class="tree-icon fa fa-cube"
                          v-else-if="data.type === 'SCHEMA'"
                        ></i>
                        <!-- <i class="tree-icon folder" v-else></i> -->
                        <span class="icon-i-folder" v-else>
                          <span class="path1"></span>
                          <span class="path2"></span>
                        </span>
                      </span>
                      <span>{{ data.name }}</span>
                    </template>
                  </el-cascader>
                </el-form-item>
                <br />
                <el-form-item
                  :label="isEdit ? '选择 schema' : 'schema'"
                  prop="schemaId"
                  label-width="180px"
                  v-if="apiEditData.apiAccessMethod === 'WHOLE_TABLE_DATA'"
                >
                  <datablau-select
                    filterable
                    clearable
                    class="text-input-com"
                    v-model="apiEditData.schemaName"
                    size="mini"
                    placeholder="请选择schema"
                    @change="getSchemaName(apiEditData.schemaName)"
                    :no-data-text="
                      apiEditData.modelId
                        ? '无数据, 请选择其他数据源'
                        : '请先选择数据源'
                    "
                  >
                    <el-option
                      v-for="item in schemaList"
                      :key="item.name"
                      :label="item.name"
                      :value="item.name"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <br v-if="apiEditData.apiAccessMethod === 'WHOLE_TABLE_DATA'" />
                <el-form-item
                  label-width="180px"
                  :label="isEdit ? '选择表' : '数据表'"
                  prop="tableObjectId"
                  v-if="apiEditData.apiAccessMethod === 'WHOLE_TABLE_DATA'"
                >
                  <datablau-select
                    ref="tableSelect"
                    v-model="apiEditData.tableObjectId"
                    filterable
                    size="mini"
                    class="text-input-com"
                    placeholder="请选择或输入搜索所属表"
                    remote
                    reserve-keyword
                    @change="getTableName"
                    @focus="chooseTable"
                    @visible-change="handleVisibleChange"
                  >
                    <el-option
                      v-for="item in tableList"
                      :key="item.objectId"
                      :label="item.physicalName"
                      :value="item.objectId"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <br v-if="apiEditData.apiAccessMethod === 'WHOLE_TABLE_DATA'" />
                <el-form-item
                  label="SQL 语句"
                  label-width="180px"
                  prop="sqlContent"
                  v-if="apiEditData.apiAccessMethod !== 'PROXY_API'"
                  key="sqlContent"
                >
                  <div
                    class="sql-control-btn"
                    v-if="
                      apiEditData.apiAccessMethod === 'WHOLE_TABLE_DATA' &&
                      isEdit
                    "
                  >
                    <datablau-button
                      type="text"
                      size="mini"
                      @click="generateSql"
                    >
                      SQL 生成器
                    </datablau-button>
                    <datablau-button
                      type="text"
                      size="mini"
                      v-if="false"
                      @click="sqlChange"
                    >
                      解析参数与返回值
                    </datablau-button>
                    <datablau-button type="text" size="mini" v-if="false">
                      预览SQL
                    </datablau-button>
                    <datablau-button type="text" size="mini" v-if="false">
                      编辑SQL
                    </datablau-button>
                  </div>
                  <datablau-input
                    size="mini"
                    type="textarea"
                    class="api-form-edit-input text-input-com"
                    v-model="apiEditData.sqlContent"
                    placeholder="请输入 SQL 语句"
                    :disabled="!couldEditSql"
                    @blur="blurSql"
                    clearable
                  ></datablau-input>
                </el-form-item>
              </div>
              <div v-if="apiEditData.apiAccessMethod === 'PROXY_API'">
                <el-form-item
                  label="调用方式"
                  prop="apiAccessMethod"
                  key="apiAccessMethod"
                  v-if="false"
                >
                  <datablau-select
                    v-model="apiEditData.apiAccessMethod"
                    size="mini"
                    placeholder="请选择调用方式"
                    filterable
                    clearable
                    :disabled="!isEdit"
                  >
                    <el-option
                      v-for="item in methodArr"
                      :key="item"
                      :label="item"
                      :value="item"
                    ></el-option>
                  </datablau-select>
                </el-form-item>
                <el-form-item
                  label-width="180px"
                  label="代理 URL"
                  prop="proxyUrl"
                  key="proxyUrl"
                >
                  <datablau-input
                    size="mini"
                    class="text-input-com"
                    v-model="apiEditData.proxyUrl"
                    placeholder="例如: https://www.test.com/test/examples"
                    :disabled="!isEdit"
                  ></datablau-input>
                </el-form-item>
              </div>
            </div>

            <h3
              class="form-title"
              v-if="apiEditData.apiAccessMethod === 'PROXY_API'"
            >
              <div class="db-fieldMessage-title">
                <p class="message-title">代理参数列表</p>
              </div>
              <div class="add-btn" v-if="isEdit">
                <datablau-button
                  class="add-btn-info"
                  type="important"
                  size="mini"
                  @click="addProxyParam"
                >
                  新增代理参数
                </datablau-button>
              </div>
            </h3>
            <div
              class="form-group list-form-item"
              v-if="apiEditData.apiAccessMethod === 'PROXY_API'"
            >
              <el-form-item>
                <div class="form-item-container">
                  <div class="params-list">
                    <proxy-params-list
                      ref="proxyParamsList"
                      :paramLocations="paramLocations"
                      :paramTypes="paramTypes"
                      :defaultParamsList="proxyParamsList"
                      :isEdit="isEdit"
                      :apiEditData="apiEditData"
                      :getParamsListFun="getParamsListOrg"
                      @sqlColsDuplicateTest="sqlColsDuplicateTest"
                      @updateParameter="updateParameter"
                      @updateProxyId="updateProxyId"
                      key="proxyParamsListEdit"
                    ></proxy-params-list>
                  </div>
                </div>
              </el-form-item>
            </div>
            <div class="db-fieldMessage-title" v-if="false">
              <p class="message-title">数据安全</p>
            </div>
            <div class="form-group" v-if="false">
              <el-form-item label="数据等级" prop="dataAccessLevel">
                <datablau-select
                  class="api-form-edit-input"
                  v-model="apiEditData.dataAccessLevel"
                  placeholder="请选择数据等级"
                  :disabled="!isEdit"
                >
                  <el-option
                    v-for="item in safeLevels"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
                <span class="tip-info">
                  <span class="info-icon"><i class="el-icon-info"></i></span>
                  <span class="info-text">
                    API数据的安全等级要高于选择表的数据安全等级
                  </span>
                </span>
                <!--<el-tooltip effect="light" content="API数据的安全等级要高于选择表的数据安全等级" placement="top">-->
                <!--  <i class="el-icon-info"></i>-->
                <!--</el-tooltip>-->
              </el-form-item>
            </div>
            <h3 class="form-title">
              <!-- <span>参数列表</span> -->
              <div class="db-fieldMessage-title">
                <p class="message-title">参数列表</p>
              </div>
              <div class="add-btn" v-if="isEdit">
                <datablau-button
                  class="add-btn-info"
                  type="important"
                  @click="addParam"
                >
                  新增参数
                </datablau-button>
              </div>
            </h3>
            <div class="form-group list-form-item">
              <el-form-item>
                <div class="form-item-container">
                  <div class="params-list">
                    <params-list
                      ref="paramsList"
                      :isAdd="isAdd"
                      :paramLocations="paramLocations"
                      :paramTypes="paramTypes"
                      :defaultParamsList="paramsList"
                      :isEdit="isEdit"
                      :apiEditData="apiEditData"
                      :name2Id="name2Id"
                      @saveEdit="saveEdit"
                      @sqlColsDuplicateTest="sqlColsDuplicateTest"
                      key="paramsListEdit"
                    ></params-list>
                  </div>
                </div>
              </el-form-item>
            </div>
            <h3 class="form-title">
              <!-- <span>返回值列表</span> -->
              <div class="db-fieldMessage-title">
                <p class="message-title">返回值列表</p>
              </div>
              <div class="add-btn" v-if="isEdit">
                <datablau-button
                  class="add-btn-info"
                  type="important"
                  @click="addReturnCol"
                >
                  新增返回值
                </datablau-button>
              </div>
            </h3>
            <div class="form-group list-form-item">
              <el-form-item>
                <div class="form-item-container">
                  <div class="return-list">
                    <return-cols-com
                      ref="returnColsCom"
                      :isEdit="isEdit"
                      :apiEditData="apiEditData"
                      :safeLevels="safeLevels"
                      :defaultReturnColsList="returnColsList"
                      :getColumnList="getColumnList"
                      @sqlColsDuplicateTest="sqlColsDuplicateTest"
                      key="returnColsComEdit"
                    ></return-cols-com>
                  </div>
                </div>
              </el-form-item>
            </div>
            <div class="db-fieldMessage-title">
              <p class="message-title">返回数据示例</p>
            </div>
            <div class="form-group return-examples">
              <el-form-item label="" prop="apiResultExample">
                <datablau-input
                  size="mini"
                  type="textarea"
                  class="api-form-edit-input-line"
                  v-model="apiEditData.apiResultExample"
                  placeholder="请输入返回数据示例"
                  :disabled="!isEdit"
                  v-if="isEdit"
                  :autosize="{ minRows: 5 }"
                ></datablau-input>
                <datablau-button type="text" @click="formatJSON" v-if="isEdit">
                  JSON 格式化
                </datablau-button>
                <div class="json-preview">
                  <div
                    class="script-container sql-container"
                    v-if="!isEdit && showJsonContent"
                  >
                    <div
                      class="sql-content"
                      v-if="apiEditData.apiResultExample"
                    >
                      <pre><code class="language-json"><p
                        v-html="jsonFormatter(apiEditData.apiResultExample)"></p></code></pre>
                    </div>
                    <div v-else-if="!apiEditData.apiResultExample">无</div>
                  </div>
                </div>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
      <div slot="buttons" v-if="isEdit">
        <div class="bottom-line">
          <datablau-button
            size="small"
            type="primary"
            class="green-btn tab-button"
            @click="saveEdit"
            :disabled="disableCommitButton"
          >
            保存
          </datablau-button>
          <datablau-button
            size="small"
            type="primary"
            class="green-btn tab-button"
            @click="testSql"
            :disabled="!apiEditData.sqlContent || returnColRepeat"
          >
            测试sql
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import editApiTab from './editApiTab'

export default editApiTab
</script>

<style lang="scss" scoped>
.edit-api-tab {
  .api-form-edit {
    margin-left: 20px;
    margin-right: 20px;
  }

  .api-form-edit-info {
    &.el-form--inline {
      .el-form-item {
        margin-right: 20px;
      }
    }
  }
  /deep/.el-form.page-form .el-form-item__label {
    font-weight: bold;
  }
  .data-picker {
    &.el-input.is-disabled /deep/ .el-input__inner,
    &.el-textarea.is-disabled /deep/ .el-textarea__inner {
      &::-webkit-input-placeholder {
        visibility: visible;
      }
    }
  }
  .text-input-com {
    width: 800px;

    & /deep/ textarea {
      width: 100%;
    }

    .el-select,
    .el-cascader,
    .el-input {
      width: 800px;
    }
  }
  /deep/ .api-form-edit-input-line textarea {
    width: 980px;
  }
  /deep/.text-input-com .el-select .el-input {
    width: 800px;
  }
  /deep/.text-input-com .el-input {
    width: 800px;
  }
  /deep/.api-form-edit-input .el-select .el-input {
    width: 300px;
  }
  /deep/.api-form-edit-input .el-input {
    width: 300px;
  }
  .api-form-edit-input {
    display: inline-block;
  }

  .params-list,
  .return-list {
    position: relative;
  }

  .form-item-container {
    display: inline-block;
  }

  .form-group {
    padding: 10px 0 30px 0;

    &.list-form-item {
      position: relative;

      .form-item-container {
        width: 100%;
      }
    }
  }

  .top-form {
    .url-line {
      line-height: 28px;

      .copy-btn {
        color: #409eff;
        cursor: pointer;
        margin-left: 10px;
      }
    }
  }

  .effective-time-item {
    .auto-offline-check {
      margin-left: 24px;
    }

    .data-picker {
      width: 285px;
    }
  }

  .params-list {
    .datablau-tab-table-line {
      top: 55px;
    }
  }
  .return-examples {
    .el-form-item--mini {
      width: 100%;

      .el-form-item__content {
        width: 100%;
      }

      .json-preview {
        .script-container {
          box-sizing: border-box;
        }
        width: 100%;
      }
    }
  }

  .add-btn {
    position: relative;
    height: 12px;

    .add-btn-info {
      right: 20px;
      top: -22px;
      position: absolute;
    }
  }
}
</style>

<style lang="scss">
.el-dialog {
  &.choose-table-info {
    height: 600px !important;
    margin-top: 6% !important;
    // .el-dialog__body {
    //   bottom: 0 !important;
    // }
  }
}
// .sql-condition{
//   display: inline-block;
// }
.edit-api-tab {
  .form-group.list-form-item {
    .el-form-item,
    .el-form-item__content {
      width: 100%;
    }
  }

  .return-examples {
    .el-form-item--mini {
      .el-form-item__content {
        width: 100%;
        //min-height: 100px;
        //border: 1px solid red;
      }
    }
  }
}
.table-outer {
  height: 440px;
}
.app-edit-dialog {
  .generate-sql-dialog {
    //border: 1px solid red;
    // max-height: 50vh;
    overflow: auto;
    padding: 20px 0;
  }

  .table-outer {
    //border: 1px solid red;
    position: relative;
    height: 70vh;
  }

  .choose-return-cols {
    &.el-select.el-select--mini {
      width: 720px;
    }
  }

  .condition-lines {
    //border: 1px solid red;

    .el-button {
      padding: 0;
      height: 24px;
      width: 24px;
      text-align: center;
      line-height: 24px;
    }

    .el-icon-plus {
      //width: 24px;
      //line-height: 24px;
      //padding: 0;
      //margin-right: 10px;
    }
  }
}
</style>

<style lang="scss">
.app-edit-dialog {
  &.choose-table-dialog {
    .el-dialog {
      min-width: 840px;
    }
  }

  &.generate-sql-dialog {
    .el-dialog {
      min-width: 860px;
    }
  }

  &.choose-cols {
    .el-dialog {
      margin-top: 10% !important;
      height: 50% !important;
      min-width: 860px;
    }
  }

  //position: relative;
  //height: 40vh;
  //overflow: auto;
  //
  //.edit-dialog-outer {
  //
  //  border: 1px solid red;
  //
  //}
}

.condition-container {
  .condition-line {
    .sql-condition {
      display: inline-block;

      &.condition-col {
        margin-right: 10px;
        width: 160px;
      }

      &.operator-col {
        margin-right: 10px;
        width: 100px;
      }

      &.para-name-col {
        margin-right: 10px;
        width: 160px;
      }

      &.default-value-col {
        margin-right: 10px;
        width: 160px;
      }

      &.relation-col {
        margin-right: 10px;
        width: 100px;
      }
    }
  }
}
</style>
