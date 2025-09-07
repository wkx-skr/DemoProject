<template>
  <div
  id="table-details"
    class="container overflow avoid-citic"
    v-loading="buttonLoading"
    element-loading-text="正在计算数据,请稍候"
  >
    <domain-code-selector
      ref="domainCodeSelector"
      @selected="handleCodeSelected"
    ></domain-code-selector>
    <domain-selector
      :limitedDsApply="currentModel.limitedDsApply"
      :limitedDsApplyConfig="getConfig()"
      ref="domainSelector"
      @selected="handleDomainSelector"
    ></domain-selector>
    <check-in-version
      :dialog-visible="checkInVersionDialogVisible"
      @close="checkInVersionDialogVisible=false"
      :typeDataWareHouse="typeDataWareHouse"
      @save="saveInTableEditor"
      :modelId="currentModel.id"
    ></check-in-version>
    <!--<el-button
      v-if="editMode"
      @click="cancel"
      size="small"
      :disabled="buttonLoading"
      style="position:absolute;right:30px;top:15px;">取消</el-button>
    <el-button
      v-if="writable && !editMode"
      @click="editMode = true"
      size="small"
      type="primary"
      style="position:absolute;right:30px;top:15px;">编辑此表</el-button>
    <el-button
      v-else-if="writable"
      @click="beforeSave"
      size="small"
      type="primary"
      :disabled="buttonLoading || !requiredFormNotEmpty"
      style="position:absolute;right:100px;top:15px;">保存</el-button>-->
    <!-- <datablau-button
      v-if="writable && !editMode && rawData.tableMsg.RawType !== 'View' && !authPro "
      @click="goToEdit"
      size="small"
      type="important"
      style="position:absolute;right:30px;top:34px;">
      <i class="iconfont icon-bianji" style="margin-right:5px;font-size:14px"></i>
      编辑
    </datablau-button>
    <span v-else>
      <datablau-button
        v-if="writable && !editMode && rawData.tableMsg.RawType !== 'View' && (authPro['MODEL_EDIT'] || authPro.isAdmin) "
        @click="goToEdit"
        size="small"
        type="important"
        :themeBlack="typeDataWareHouse"
        style="position:absolute;right:30px;top:34px;">
        <i class="iconfont icon-bianji" style="margin-right:5px;font-size:14px"></i>
        编辑
      </datablau-button>
    </span>
    <datablau-button
      v-if="!editMode && rawData.tableMsg.RawType !== 'View'"
      @click="checkLineage(rawData.tableMsg)"
      size="small"
      type="noraml"
      :style="{right:!authPro?'110px':((authPro['MODEL_EDIT'] || authPro.isAdmin) ? '110px':'30px')}"
      style="position:absolute;right:110px;top:34px;" :themeBlack="typeDataWareHouse">血缘</datablau-button> -->
    <div v-if="!rawData.appendMode && !editMode" class="new-title-box" style="position: relative;">
      <div class="header clearfixed" :class="{'headerBlack':typeDataWareHouse}">
        <img style="margin-top:4px;" width="20" :src="rawData.tableMsg && rawData.tableMsg.TypeId === 80500008 ? viewImg : rawData.tableMsg && rawData.tableMsg.TypeId === 80100073 ? businessImg : tableImg" alt="">
        <div class="text-box" :class="{'text-box2':typeDataWareHouse}">
          <div style="display:flex;align-items: center;">
            <is-show-tooltip
                :content="rawData.tableMsg.Name"
                :style="{
                  maxWidth:'800px',
                  paddingTop: '2px',
                  fontWeight: '500',
                    fontSize: '16px',
                    color: '#555555'}"
              ></is-show-tooltip>
            <span  style="margin-left:10px;padding-bottom: 2px;">
              <datablau-button
                v-if="writable && !editMode && rawData.tableMsg.RawType !== 'View' && !authPro "
                @click="goToEdit"
                size="small"
                type="icon">
                <i class="iconfont icon-bianji" style="margin-right:5px;font-size:14px"></i>
              </datablau-button>
              <span v-else>
                <datablau-button
                  v-if="writable && !editMode && rawData.tableMsg.RawType !== 'View' && (authPro['MODEL_EDIT'] || authPro.isAdmin) "
                  @click="goToEdit"
                  size="small"
                  type="icon"
                  :themeBlack="typeDataWareHouse">
                  <i class="iconfont icon-bianji" style="margin-right:5px;font-size:14px"></i>
                </datablau-button>
              </span>
              <datablau-button
                v-if="!editMode && rawData.tableMsg.RawType !== 'View'"
                @click="checkLineage(rawData.tableMsg)"
                size="small"
                type="icon"

                :themeBlack="typeDataWareHouse"><i class="iconfont icon-lineage" style="margin-right:5px;font-size:14px"></i></datablau-button>
            </span>
          </div>
          <p style="color:#777">中文名称：{{rawData.tableMsg.LogicalName}} <span v-if="!rawData.tableMsg.LogicalName" style="color:#b0b0b0">暂无名称</span></p>
        </div>
        <div style="position: absolute;
    right: 20px;
    top: 22px;">
          <datablau-button
            type="text"
            @click="moreClick"
          > {{moreShow?'收起属性':'更多属性'}}
          <i v-if="moreShow" class="iconfont icon-rightarrow"></i>
          <i v-else class="iconfont icon-downarrow"></i>
         </datablau-button>
        </div>
        <div class="moreAttribute"  v-if="moreShow" style="position: absolute;
    top: 68px;
        ">
          <datablau-form
              label-position="right"
              :model="rawData.tableMsg"
              size="mini"
              label-width="105px"
              >
              <el-form-item label="定义：" >
                <is-show-tooltip
                  :content="rawData.tableMsg.Definition"
                  :style="{
                    maxWidth:
                      '700px',
                  }"
                ></is-show-tooltip>
                <!-- <p style="overflow: hidden;
                width: 64%;
                line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal; ">{{ rawData.tableMsg.Definition }}</p> -->
              </el-form-item>
          </datablau-form>
        </div>
      </div>
    </div>
    <!-- <div class="title" v-if="!rawData.appendMode">{{rawData.tableMsg.Name}}<span v-show="rawData.tableMsg.LogicalName && rawData.tableMsg.LogicalName !== rawData.tableMsg.Name">({{rawData.tableMsg.LogicalName}})</span></div> -->
<!--    <div class="sub-title">基本信息</div>-->
    <div v-if="editorType === 'model'" class="tab-to-expand-wrapper" @mouseenter="expandActive=true" @mouseleave="expandActive=false">
      <img class="tab-to-expand-btn" :src="expandActive? shrinkActiveImg: shrinkImg" alt="" v-show="shrink" @click="toExpand" />
      <img class="tab-to-expand-btn" :src="expandActive? expandActiveImg: expandImg" alt="" v-show="!shrink" @click="toShrink" />
    </div>
    <div v-if="editMode" class="header-wrapper" v-show="!typeDataWareHouse">
      <h2 v-if="rawData.tableMsg.TypeId === 80100073"><img style="margin-right: 5px;vertical-align: text-bottom;" :src="rawData.tableMsg && rawData.tableMsg.TypeId === 80500008 ? viewImg : rawData.tableMsg && rawData.tableMsg.TypeId === 80100073 ? businessImg : tableUsedImg" width="18" />{{(rawData.tableMsg && rawData.tableMsg.TypeId === 80100073 ? '业务对象' : isLogical ? '实体' : '表') + '：' + requestBody.name}}</h2>
      <datablau-detail-subtitle v-else title="基本信息" mt="0px" mb="0px"></datablau-detail-subtitle>
    </div>
    <div v-if="editMode" class="top-area" :class="{'black-theme': typeDataWareHouse}">
      <div v-if="rawData.tableMsg.TypeId === 80100073">
        <div class="property">
          <span class="label translate-cname">中文名称</span>
          <span v-if="!editMode" class="value">{{ rawData.tableMsg.LogicalName }}</span>
          <span v-else class="value">
            <datablau-input
              id="test2"
              v-model="requestBody.cnName"
              size="mini"
              :themeBlack="typeDataWareHouse"
              @focusout.native="handleTableCNNameTab(requestBody.cnName, true)"
              :style="typeDataWareHouse?'width: 210px': ''"></datablau-input>
          </span>
        </div>
        <div class="translate-wrapper" :style="typeDataWareHouse?'margin-left: 72px': ''" @click="handleTableCNNameTab(requestBody.cnName)" @mouseenter="translateActive=true" @mouseleave="translateActive=false">
          <span>翻译</span>
          <img :src="translateActive ? translateActiveImg : translateImg" alt="" />
        </div>
        <div class="property">
          <span class="label" :class="{required:editMode,required2:!isLogical}">{{(rawData.tableMsg && rawData.tableMsg.TypeId === 80100073 ? '业务对象' : isLogical ? '实体' : '表') + '名'}}</span>
            <span v-if="!editMode" class="value">{{rawData.tableMsg.Name}}</span>
            <span v-else class="value">
              <el-form @submit.native.prevent :model="requestBody" ref="tableNameRef" size="mini">
                <el-form-item style="height:28px;" :rules="rules.tableName" prop="tableName">
                  <datablau-input
                    @blur="formatTableName"
                    size="mini"
                    v-model="requestBody.name"
                    :themeBlack="typeDataWareHouse"
                    :style="typeDataWareHouse?'width: 210px': ''"
                  ></datablau-input>
                </el-form-item>
              </el-form>
            </span>
        </div>
      </div>
      <div v-else>
        <datablau-form
              label-position="right"
              ref="tableNameRef"
              :model="requestBody"
              size="mini"
              :label-width="$route.path==='/main/modeledit'? '90px':'120px'"
              >
              <div style="display:flex;width:1200px">
                <el-form-item label="逻辑数据实体中文名" :rules="rules.cnName" prop="cnName">
                  <div style="display:flex">
                    <datablau-input
                      id="test2"
                      v-model="requestBody.cnName"
                      size="mini"
                      :themeBlack="typeDataWareHouse"
                      style="width:280px"
                      @focusout.native="handleTableCNNameTab(requestBody.cnName, true)"
                      :style="typeDataWareHouse?'width: 210px': $route.path==='/main/modeledit'? 'width:160px' : 'width:280px'"></datablau-input>
                      <!-- <div class="translate-wrapper" :style="typeDataWareHouse?'margin-left: 72px': ''" @click="handleTableCNNameTab(requestBody.cnName)" @mouseenter="translateActive=true" @mouseleave="translateActive=false">
                      <span>翻译</span>
                      <img :src="translateActive ? translateActiveImg : translateImg" alt="" />
                    </div> -->
                  </div>
                </el-form-item>

                  <el-form-item   :rules="rules.tableName" prop="tableName" v-if="!(currentModel.forceCheckFlag && this.rawData.editMode)">
                    <span slot="label" >
                      <span class="tableNameLabel required">逻辑数据实体英文名</span>
                    </span>
                  <datablau-input
                      @blur="formatTableName"
                      size="mini"
                      v-model="requestBody.name"
                      :themeBlack="typeDataWareHouse"
                      :style="typeDataWareHouse?'width: 210px': $route.path==='/main/modeledit'? 'width:160px' : 'width:280px'"
                      style="width:280px"
                    ></datablau-input>
                </el-form-item>
                <el-form-item   :rules="rules.tableName2" prop="tableName2" v-else >
                    <span slot="label" >
                      <span class="tableNameLabel required">逻辑数据实体英文名</span>
                    </span>
                    <div style="max-width:664px;display:flex;height:32px">
                      <is-show-tooltip
                        :content="strongChecksPrefix"
                        :noContent="strongChecksPrefix===''?true:false"
                        :style="{
                          maxWidth:
                          '232px',
                        }"
                      ></is-show-tooltip>
                      <datablau-input
                      size="mini"
                      v-model="requestBody.nameAbbreviation"
                      style="width:160px;margin:0 8px;"
                    ></datablau-input>
                    <is-show-tooltip
                        :content="strongChecksSuffix"
                        :noContent="strongChecksSuffix===''?true:false"
                        :style="{
                          maxWidth:
                          '232px',
                        }"
                      ></is-show-tooltip>
                    </div>
                </el-form-item>
                <div style="display: inline-block;">
                        <div
                          v-if="isDesignModel && rawData.tableMsg.TypeId !== 80100073"
                          class="property" style="width: auto;margin-right: 0;margin-left: 146px;">
                          <el-checkbox
                            class="small"
                            :disabled="!editMode"
                            v-model="requestBody.logicalOnly"
                          >仅逻辑</el-checkbox>
                          <span class="label">
                            <datablau-tips placement="top" style="position: relative;top: -2px;left: 2px;width: 10px;font-size: 14px;" icon="iconfont icon-tips" content="仅逻辑：没有物理含义的表"></datablau-tips>
                          </span>
                        </div>
                        <div
                          v-else-if="rawData.tableMsg.TypeId !== 80100073"
                          class="property" style="width: auto;margin-right: 0;margin-left: 46px;">
                          <el-checkbox
                            class="small"
                            :disabled="!editMode"
                            v-model="requestBody.physicalOnly"
                            :class="{'el-checkbox-black-theme': typeDataWareHouse}"
                          >仅物理</el-checkbox>
                          <span class="label">
                            <datablau-tips placement="top" style="position: relative; top: -2px;left: 2px;width: 10px;font-size: 14px;" icon="iconfont icon-tips" content="仅物理：没有业务含义的表"></datablau-tips>
                          </span>
                        </div>
                      </div>

              </div>
              <el-form-item label="逻辑数据实体定义" :rules="rules.description" prop="description">
                <el-input
                  v-model="requestBody.description"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 2 }"
                  show-word-limit
                  resize="none"
                  size="mini"
                  maxlength="500"
                  @change="changeAbsoluteTop"
                  style="width:690px"
                  :style="$route.path==='/main/modeledit'? 'width:470px':'width:690px'"
                  :class="{'black-el-input': typeDataWareHouse}"
                ></el-input>
              </el-form-item>
        </datablau-form>
      </div>
    </div>
    <div :class="{'content-box': true,'is-edit': editMode, 'editor-type-table': editorType === 'table', 'editor-type-model': editorType === 'model'}" :style="computedTopStyle" style="transition: top 0.5s ease-in-out;background:#fff">
      <datablau-tabs
        v-model="activeTab"
        class="blue-tabs has-border"
        style="position:absolute;top:0;left:0;right:0;bottom:0"
        :themeBlack="typeDataWareHouse"
         @tab-click="activeTabChange"
      >
        <el-tab-pane v-if="rawData.tableMsg.TypeId === 80100073 && currentModel.TypeUniqueId !== '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80'" label="业务实体" name="business">
          <datablau-transfer
            style="height: 100%;margin-top: 10px;"
            v-model="businessEntityList"
            :data="entityData"
            filterable
            :titles="['未绑定实体列表','已绑定实体列表']"
            @change="handleBusinessSelectionChange"
          >
            <span slot-scope="{ option }">{{ option.properties.Name + (option.properties.LogicalName ? '（'+ option.properties.LogicalName + '）' : '' )}}</span>
          </datablau-transfer>
          <!--<datablau-input style="float: right;margin-right: 20px;width: 250px;" v-model="entityQuery" :iconfont-state="true" placeholder="请输入关键词搜索中文名、表名" size="mini" clearable></datablau-input>
          <div class="entity-wrapper">
            <datablau-table
              ref="entityTable"
              class="datablau-table"
              :data="entityShowData"
              height="100%"
              data-selectable
              :auto-hide-selection="false"
              @sort-change="entitySortChange"
              :default-sort = "{prop: 'properties.Name', order: 'ascending'}"
              @selection-change="handleBusinessSelectionChange"
            >
              <el-table-column
                sortable
                prop="properties.LogicalName"
                label="表名"
              >
              </el-table-column>
              <el-table-column
                sortable
                prop="properties.Name"
                label="中文名"
              >
              </el-table-column>
            </datablau-table>
          </div>
          <div style="position: absolute;bottom: 85px;left: 0;right: 0;">
            <datablau-pagination
              style="display: inline-block;"
              class="page"
              @size-change="handleBusinessSizeChange"
              @current-change="handleBusinessCurrentChange"
              :current-page="business.currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="business.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="business.total"
            ></datablau-pagination>
          </div>-->
        </el-tab-pane>
        <el-tab-pane :label="attributeName + '信息'" name="column">
          <div style="display: inline-block;margin-top: 10px;">
            <datablau-button :themeBlack="typeDataWareHouse" type="secondary" size="mini" :disabled="!(isFocusArea || isFocusOnly)" @click="translateCurrent">
              翻译当前
            </datablau-button>
            <datablau-button :themeBlack="typeDataWareHouse" type="secondary" size="mini" @click="translateAll">
              翻译全部
            </datablau-button>
          </div>
          <datablau-button
            v-show="editMode"
            type="text"
            @click="addColumn(true)"
            :dblClickTimeout="0"
            style="margin-left: 6px;"
          >
            <i style="font-size:16px;vertical-align: text-bottom;" class="el-icon-circle-plus-outline"></i>
            添加新{{attributeName}}
          </datablau-button>
          <div class="table-box" :class="{'table-box1':editMode,'table-box2':!editMode,'black-theme': typeDataWareHouse}">
            <datablau-table
              :data-changes-scroll-top="false"
              style="user-select: none;"
              use-virtual
              class="datablau-table thin shrink"
              v-if="allCols && shrink && editorType === 'model'"
              :data="allCols"
              :key="tableKey"
              :height="tableHeight"
              :rowHeight="31"
              ref="tableDetailListShrink"
              row-key="elementId"
              @cell-mouse-enter="handleCellMouseEnter"
              @cell-mouse-leave="handleCellMouseLeave"
              @keyup.native="onKeyPress"
              :row-class-name="tableRowClassName"
              header-row-class-name="table-header-class"
              @mousedown.native="handleTableMouseDown"
              @mouseup.native="handleTableMouseUp"
              :cell-class-name="tableCellClassName"
              @paste.native="handleTablePaste"
              @copy.native="handleTableCopy"
              @focusin.native="handleFocusIn"
              @focusout.native="handleFocusOut"
              :cell-style="{height: '30px'}"
              :themeBlack="typeDataWareHouse"
            >
              <el-table-column v-if="!editMode" fixed label="" width="50">
                <template slot-scope="scope">{{scope.$index+1}}</template>
              </el-table-column>
              <el-table-column
                fixed
                label="中文名"
                prop="cnName"
                :width="130"
                :show-overflow-tooltip="!editMode"
              >
                <!--<template slot="header">
                  <span>中文名</span>
                  <div style="float: right" class="translate-wrapper" @click="translateAll" @mouseenter="translateActive2=true" @mouseleave="translateActive2=false">
                    <span>翻译</span>
                    <img key="2" :src="translateActive2 ? translateActiveImg : translateImg" alt="" />
                  </div>
                </template>-->
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].cnName}}</span>
                  <el-form
                    @submit.native.prevent
                    label-position="right"
                    v-else
                    :model="allCols[scope.$index]"
                    :ref='`logical-name-form${scope.$index}-shrink`'
                    size="mini">
                    <el-form-item
                      class="input-content-box"
                      style="margin-bottom:1px;"
                      prop="cnName"
                      :rules="isDesignModel ? rules.logicalColumnName : {}"
                    >
                      <el-autocomplete
                        :rowindex="scope.$index"
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        style="width:100%"
                        size="mini"
                        :loading="domainLoading"
                        v-model="allCols[scope.$index].cnName"
                        :fetch-suggestions="lodash.debounce(queryDomain, 1000)"
                        :trigger-on-focus="false"
                        @select="handleOptionSelect($event, allCols[scope.$index])"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !!allCols[scope.$index].domainId ,scope)"
                        @focusout.native="handleCNNameTab(scope)"
                      >
                        <template slot-scope="{ item }">
                          <domain-popover :item="item"></domain-popover>
                        </template>
                      </el-autocomplete>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                fixed
                :label="attributeName + '名'"
                prop="name"
                :width="120"
                :show-overflow-tooltip="!editMode"
              >
                <template slot="header" slot-scope="scope">
                  <span v-if="editMode" :data="scope.$index" class="table-label required">{{attributeName + '名'}}</span>
                  <span v-else class="table-label">{{attributeName + '名'}}</span>
                </template>
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].name}}</span>
                  <el-form
                    @submit.native.prevent
                    label-position="right"
                    v-else
                    :model="allCols[scope.$index]"
                    :key="allCols.elementId"
                    :ref='`name-form${scope.$index}-shrink`'
                    size="mini">
                    <el-form-item
                      class="input-content-box"
                      style="margin-bottom:1px;"
                      prop="name"
                      :rules="rules.columnName"
                    >
                      <el-input
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        size="mini"
                        :ref="`colName${scope.$index}`"
                        @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                        @blur="formatColumnName(allCols[scope.$index])"
                        v-model="allCols[scope.$index].name"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !!allCols[scope.$index].domainId, scope)"
                      ></el-input>
                      <!-- <el-input
                        id="test1"
                        size="mini"
                        :ref="`colName${scope.$index}`"
                        @blur="checkColName(allCols[scope.$index],scope.$index)"
                        @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                        v-model="allCols[scope.$index].name"
                        :disabled="limitedDsApply && limitedDsApplyConfig.rColName && !!allCols[scope.$index].domainId"
                        @click.native="limitedDsApplyMessage(limitedDsApply && limitedDsApplyConfig.rColName && !!allCols[scope.$index].domainId)"
                      ></el-input> -->
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                :label="attributeName +`类型`"
                prop="dataType"
                width="138"
                fixed
                class-name="data-type"
                :show-overflow-tooltip="!editMode"
              >
                <template slot="header">
                  <span class="table-label" :class="{required:editMode}">{{$version.scan.dialog.type}}</span>
                </template>
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].dataType}}</span>
                  <el-form
                    @submit.native.prevent
                    :model="allCols[scope.$index]"
                    :ref='`type-form${scope.$index}-shrink`'
                    v-else>
                    <el-form-item
                      style="margin-bottom: 0;"
                      prop="dataType"
                      :rules="rules.dataType"
                    >
                      <el-autocomplete
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        :clearable="false"
                        size="mini"
                        @focus="onFocus(scope.$index)"
                        @input="onInput"
                        @select="(val) => {onSelect(val),clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[scope.$index].domainId, scope)}"
                        v-model="allCols[scope.$index].dataType"
                        :fetch-suggestions="queryDataType"
                        :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[scope.$index].domainId, scope)"
                      >
                        <template slot-scope="{ item }">
                          <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -4px;">{{item.value}}</div>
                          <span v-else>{{item.value}}</span>
                        </template>
                      </el-autocomplete>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                label="主键"
                width="50"
              >
                <template slot-scope="scope">
                  <span style="padding-left: 16px;"></span>
                  <el-checkbox
                    :disabled="disabledPk.has(allCols[scope.$index].elementId)"
                    v-if="editMode"
                    v-model="pkSelection[scope.$index]"
                    @change="handlePkSelectionChange"
                  ></el-checkbox>
                  <!--                <datablau-checked v-if="pk.indexOf(allCols[scope.$index].elementId) > -1"></datablau-checked>-->
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                :min-width="110"
                v-if="editMode"
              >
                <template slot="header">
                  <div style="text-align: center">操作</div>
                </template>
                <template slot-scope="scope">
                  <div class="operator-wrapper">
                    <datablau-button :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1" :tooltipContent="fk.indexOf(allCols[scope.$index].elementId) > -1 ? `外键成员${attributeName}不允许被删除` : ''" type="text" @click="editRow(allCols[scope.$index])" style="height: 30px;font-size: 14px;" class="iconfont icon-bianji"></datablau-button>
                    <datablau-button :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1" :tooltipContent="fk.indexOf(allCols[scope.$index].elementId) > -1 ? `外键成员${attributeName}不允许被删除` : ''" class="iconfont icon-delete" type="text" @click="deleteRow(allCols[scope.$index], scope.$index)" style="font-size:14px;height: 30px;"></datablau-button>
                    <datablau-button v-if="!isCassandraOrMongoDB" type="text" size="mini" @click.stop="up(scope.$index)" :disabled="scope.$index===0" class="iconfont icon-up" style="font-size:14px"></datablau-button>
                    <datablau-button v-if="!isCassandraOrMongoDB" type="text" size="mini" @click.stop="down(scope.$index)" :disabled="scope.$index===allCols.length-1" class="iconfont icon-down" style="font-size:14px"></datablau-button>
                  </div>
                </template>
              </el-table-column>
            </datablau-table>
            <datablau-table
              style="user-select: none;"
              :border="editMode"
              :data-changes-scroll-top="false"
              use-virtual
              class="datablau-table thin unshrink"
              :class="{blackBG: typeDataWareHouse}"
              v-if="allCols && (!shrink || editorType === 'table')"
              :data="allCols"
              :key="tableKey + 100000000"
              :height="tableHeight"
              :rowHeight="31"
              ref="tableDetailList"
              row-key="elementId"
              @cell-mouse-enter="handleCellMouseEnter"
              @cell-mouse-leave="handleCellMouseLeave"
              @keyup.native="onKeyPress"
              :row-class-name="tableRowClassName"
              header-row-class-name="table-header-class"
              @mousedown.native="handleTableMouseDown"
              @mouseup.native="handleTableMouseUp"
              :cell-class-name="tableCellClassName"
              @paste.native="handleTablePaste"
              @copy.native="handleTableCopy"
              @focusin.native="handleFocusIn"
              @focusout.native="handleFocusOut"
              :cell-style="{height: '30px'}"
              :showRightShadow="true"
              :themeBlack="typeDataWareHouse"
            >
              <el-table-column v-if="!editMode" fixed label="" width="50">
                <template slot-scope="scope">{{scope.$index+1}}</template>
              </el-table-column>
              <el-table-column
                fixed
                label="中文名"
                prop="cnName"
                :width="200"
                :show-overflow-tooltip="!editMode"
              >
                <!--<template slot="header">
                  <span>中文名</span>
                  <div style="float: right" class="translate-wrapper" @click="translateAll" @mouseenter="translateActive1=true" @mouseleave="translateActive1=false">
                    <span>翻译</span>
                    <img :key="1" :src="translateActive1 ? translateActiveImg : translateImg" alt="" />
                  </div>
                </template>-->
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].cnName}}</span>
                  <el-form
                    @submit.native.prevent
                    label-position="right"
                    v-else
                    :model="allCols[scope.$index]"
                    :ref='`logical-name-form${scope.$index}`'
                    size="mini">
                    <el-form-item
                      class="input-content-box"
                      style="margin-bottom:1px;"
                      prop="cnName"
                      :rules="isDesignModel ? rules.logicalColumnName : {}"
                    >
                      <el-autocomplete
                        :rowindex="scope.$index"
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        style="width:100%"
                        size="mini"
                        v-model="allCols[scope.$index].cnName"
                        :loading="domainLoading"
                        :fetch-suggestions="lodash.debounce(queryDomain, 1000)"
                        :trigger-on-focus="false"
                        @select="handleOptionSelect($event, allCols[scope.$index])"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !!allCols[scope.$index].domainId, scope)"
                        @focusout.native="handleCNNameTab(scope)"
                        :popper-class="typeDataWareHouse? 'balckpopper-class': ''"
                      >
                        <template slot-scope="{ item }">
                          <domain-popover :item="item"></domain-popover>
                        </template>
                      </el-autocomplete>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                fixed
                :label="attributeName + '名'"
                prop="name"
                :width="170"
                :show-overflow-tooltip="!editMode"
              >
                <template slot="header" slot-scope="scope">
                  <span v-if="editMode" :data="scope.$index" class="table-label required">{{attributeName + '名'}}</span>
                  <span v-else class="table-label required">{{attributeName + '名'}}</span>
                </template>
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].name}}</span>
                  <el-form
                    @submit.native.prevent
                    v-else
                    :model="allCols[scope.$index]"
                    :key="allCols.elementId"
                    :ref='`name-form${scope.$index}`'
                    size="mini">
                    <el-form-item
                      class="input-content-box"
                      style="margin-bottom:1px;"
                      prop="name"
                      :rules="rules.columnName"
                    >
                    <el-input
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        size="mini"
                        :ref="`colName${scope.$index}`"
                        @blur="formatColumnName(allCols[scope.$index])"
                        @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                        v-model="allCols[scope.$index].name"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !!allCols[scope.$index].domainId, scope)"
                      ></el-input>
                      <!-- <el-input
                        id="test1"
                        size="mini"
                        :ref="`colName${scope.$index}`"
                        @blur="checkColName(allCols[scope.$index],scope.$index)"
                        @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                        v-model="allCols[scope.$index].name"
                        :disabled="limitedDsApply && limitedDsApplyConfig.rColName && !!allCols[scope.$index].domainId"
                        @click.native="limitedDsApplyMessage(limitedDsApply && limitedDsApplyConfig.rColName && !!allCols[scope.$index].domainId)"
                      ></el-input> -->
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                :label="`${attributeName}类型`"
                prop="dataType"
                width="138"
                fixed
                class-name="data-type"
                :show-overflow-tooltip="!editMode"
              >
                <template slot="header">
                  <span class="table-label required">{{$version.scan.dialog.type}}</span>
                </template>
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].dataType}}</span>
                  <el-form
                    @submit.native.prevent
                    v-else
                    size="mini"
                    :model="allCols[scope.$index]"
                    :ref='`type-form${scope.$index}`'
                    :class="{'black-el-form': typeDataWareHouse}"
                  >
                    <el-form-item
                      style="margin-bottom:0"
                      prop="dataType"
                      :rules="rules.dataType"
                    >
                      <el-autocomplete
                        :class="caculateBorderClass(scope)"
                        :clearable="false"
                        :readonly="isFocusArea"
                        size="mini"
                        @focus="onFocus(scope.$index)"
                        @input="onInput"
                        @select="(val) => {onSelect(val),clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[scope.$index].domainId, scope)}"
                        v-model="allCols[scope.$index].dataType"
                        :fetch-suggestions="queryDataType"
                        :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1"
                        :popper-class="typeDataWareHouse? 'balckpopper-class': ''"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[scope.$index].domainId, scope)"
                      >
                        <template slot-scope="{ item }">
                          <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -4px;">{{item.value}}</div>
                          <span v-else>{{item.value}}</span>
                        </template>
                      </el-autocomplete>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                label="数据标准"
                :width="205"
                :show-overflow-tooltip="!editMode"
              >
                <template slot-scope="scope">
                  <span v-if="!editMode">{{domainIdToName[allCols[scope.$index].domainId]}}</span>
                  <span :title="domainIdToName[allCols[scope.$index].domainId]" v-else style="display: flex;">
                    <el-select
                      :key="scope.$index"
                      size="mini"
                      style="width: 150px;border-raduis:0;flex: 1 1 auto;"
                      :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1"
                      :value="domainIdToName[allCols[scope.$index].domainId]"
                      filterable
                      remote
                      placeholder="请输入标准"
                      :remote-method="searchDomain"
                      @focus="searchDomain(domainIdToName[allCols[scope.$index].domainId])"
                      :loading="domainLoading"
                      @change="changeDomainId(...arguments, scope)"
                      clearable
                      :class="{'black-el-select': typeDataWareHouse}"
                      @clear="clearDomain(scope)">
                      <el-option
                        v-for="item in domainOptions"
                        :key="item.domainCode"
                        :label="item.chName"
                        :value="item.domainCode">
                        <domain-popover :item="item"></domain-popover>
                      </el-option>
                    </el-select>
                    <el-button
                      :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1"
                      style="color: #409EFF;position:relative;top: 1px;width: 40px;height: 28px;padding: 6px;flex: 0 0 auto;"
                      size="mini"
                      :class="{'black-el-button': typeDataWareHouse}"
                      @click="callDomainSelector(scope)"
                    >选择</el-button>
                    <!-- <el-input
                      size="mini"
                      @focus="callDomainSelector(scope)"
                      :value="allCols[scope.$index].domainName !== '' ? allCols[scope.$index].domainName : domainIdToName[allCols[scope.$index].domainId]"
                      clearable
                      @clear="clearDomain(scope)"
                    ></el-input> -->
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="标准代码"
                :width="200"
                :show-overflow-tooltip="!editMode"
              >
                <template slot-scope="scope">
                  <span v-if="!editMode">{{$globalData.domainCodes && $globalData.domainCodes.map.get(allCols[scope.$index].dataStandardCode)}}</span>
                  <span :title="$globalData.domainCodes && $globalData.domainCodes.map.get(allCols[scope.$index].dataStandardCode)" v-else>
                    <el-input
                      size="mini"
                      @focus="callCodeSelector(scope)"
                      clearable
                      @clear="clearCode(scope)"
                      :class="{'black-el-input': typeDataWareHouse}"
                      :value="$globalData.domainCodes && $globalData.domainCodes.map.get(allCols[scope.$index].dataStandardCode)"
                    ></el-input>
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="主键"
                width="50"
              >
                <template slot-scope="scope">
                  <template v-if="editMode">
                    <span style="padding-left: 16px;"></span>
                    <el-checkbox
                      :disabled="disabledPk.has(allCols[scope.$index].elementId)"
                      v-model="pkSelection[scope.$index]"
                      @change="handlePkSelectionChange"
                    ></el-checkbox>
                  </template>
                  <datablau-checked v-if="!editMode && pk.indexOf(allCols[scope.$index].elementId) > -1"></datablau-checked>
                </template>
              </el-table-column>
              <el-table-column
                label="外键"
                width="50"
              >
                <template slot-scope="scope">
                  <span v-if="editMode" style="padding-left: 16px;"></span>
                  <datablau-checked v-if="fk.indexOf(allCols[scope.$index].elementId) > -1"></datablau-checked>
                </template>
              </el-table-column>
              <el-table-column
                label="非空"
                width="50"
                prop="IsNotNull"
              >
                <template slot-scope="scope">

                  <i class="el-icon-check" style="font-weight:bold;font-size:16px;color:#6acf72;" v-if="!editMode && allCols[scope.$index].notNull"></i>
                  <template v-if="editMode">
                    <span style="padding-left: 16px;"></span>
                    <el-checkbox
                      :disabled="pkSelection[scope.$index]"
                      v-model="allCols[scope.$index].notNull"
                    ></el-checkbox>
                  </template>
                </template>
              </el-table-column>
              <el-table-column
                v-if="isDesignModel"
                prop="IsLogicalOnly"
                width="50"
                label="仅逻辑">
                <template slot-scope="scope">
                  <template v-if="editMode">
                    <span style="padding-left: 16px;"></span>
                    <el-checkbox
                      v-model="allCols[scope.$index].logicalOnly"></el-checkbox>
                  </template>
                  <datablau-checked v-else-if="allCols[scope.$index].logicalOnly"></datablau-checked>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                width="50"
                prop="IsPhysicalOnly"
                label="仅物理">
                <template slot-scope="scope">
                  <template v-if="editMode">
                    <span style="padding-left: 16px;"></span>
                    <el-checkbox
                      v-model="allCols[scope.$index].physicalOnly"></el-checkbox>
                  </template>
                  <datablau-checked v-else-if="allCols[scope.$index].physicalOnly"></datablau-checked>
                </template>
              </el-table-column>
              <el-table-column
                label="默认值"
                :width="170"
                prop="defaultVal"
                :show-overflow-tooltip="!editMode"
              >
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].defaultVal}}</span>
                  <el-input
                    v-else
                    size="mini"
                    :class="{'black-el-input': typeDataWareHouse}"
                    v-model="allCols[scope.$index].defaultVal"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$version.scan.dialog.def"
                prop="Definition"
                :min-width="180"
                :show-overflow-tooltip="!editMode"
              >
                <template slot-scope="scope">
                  <span v-if="!editMode">{{allCols[scope.$index].description}}</span>
                  <el-input
                    v-else
                    size="mini"
                    :class="{'black-el-input': typeDataWareHouse}"
                    v-model="allCols[scope.$index].description"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column
                  :label="udp.FriendlyName || udp.Name"
                  v-for="udp of columnsUdpDisplay.values()"
                  :key="udp.Id"
                  :prop="String(udp.Id)"
                  :width="190"
              >
                <template slot-scope="scope">
                  <udp-setting :themeBlack="typeDataWareHouse" :edit-mode="editMode" class="in-column-wrapper" :hide-label="true" :tableMsg="requestBody.allUdps" :currentModel="currentModel" :type="80000005" :udp-map="new Map([[udp.Id, allCols[scope.$index].allUdps[udp.Id]]])" :data-by-type="dataByType" :request-body="allCols[scope.$index]">
                  </udp-setting>
                  <!--<span v-if="!editMode">{{allCols[scope.$index].allUdps[udpKey]}}</span>
                  <span v-else>
                    <el-select
                      v-model="allCols[scope.$index].allUdps[udpKey]"
                      v-if="dataByType.udp.get(udpKey).Enum"
                      size="mini"
                    >
                      <el-option
                        v-for="o in dataByType.udp.get(udpKey).Enum.split(';').slice(0,-1)"
                        :key="o"
                        :value="o"
                        :label="o"
                      ></el-option>
                    </el-select>
                    <udp-validater-input
                      v-else
                      :key="udpKey + allCols[scope.$index].elementId + allCols[scope.$index].name"
                      :value="allCols[scope.$index].allUdps[udpKey]"
                      @update="updateUdpValue(allCols[scope.$index].allUdps, udpKey, $event)"
                      :udp="dataByType.udp.get(udpKey)"
                    >
                    </udp-validater-input>
                  </span>-->
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                :min-width="110"
                v-if="editMode"
              >
                <template slot="header">
                  <div style="text-align: center">操作</div>
                </template>
                <template slot-scope="scope">
                  <div class="operator-wrapper">
                    <datablau-button v-if="editorType === 'model'" :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1" :tooltipContent="fk.indexOf(allCols[scope.$index].elementId) > -1 ? `外键成员${attributeName}不允许被删除` : ''" type="text" @click="editRow(allCols[scope.$index])" style="height: 30px;font-size: 14px;" class="iconfont icon-bianji"></datablau-button>
                    <datablau-button :disabled="fk.indexOf(allCols[scope.$index].elementId) > -1" :tooltipContent="fk.indexOf(allCols[scope.$index].elementId) > -1 ? `外键成员${attributeName}不允许被删除` : ''" class="iconfont icon-delete" type="text" @click="deleteRow(allCols[scope.$index], scope.$index)" style="font-size:14px;height: 30px;"></datablau-button>
                    <datablau-button v-if="!isCassandraOrMongoDB" type="text" size="mini" @click.stop="up(scope.$index)" :disabled="scope.$index===0" class="iconfont icon-up" style="font-size:14px"></datablau-button>
                    <datablau-button v-if="!isCassandraOrMongoDB" type="text" size="mini" @click.stop="down(scope.$index)" :disabled="scope.$index===allCols.length-1" class="iconfont icon-down" style="font-size:14px"></datablau-button>
                  </div>
                </template>
              </el-table-column>
            </datablau-table>
          </div>

        </el-tab-pane>
        <el-tab-pane :label="isDesignModel? '键': '索引'" name="index">
          <index-editor
            :disabledPk="disabledPk"
            :deliverNum="deliverNum"
            v-if="indexEditorVisible"
            ref="indexEditor"
            :raw-data="rawData"
            :requestBody="requestBody"
            :edit-mode="editMode"
            :virtualKey="false"
            :data-by-type="dataByType"
            :isDesignModel="isDesignModel"
            :getIndexNameNamingMap="getIndexNameNamingMap"
            :typeDataWareHouse="typeDataWareHouse"
            @updateIndexNotEmpty="updateIndexNotEmpty"
            @updateIndexMemberList="updateIndexMemberList"
            @deleteColumn="deleteColumn"
            @getIndexSArr="getIndexSArr"
          ></index-editor>
        </el-tab-pane>
        <!-- v-if="rawData.tableMsg.TypeId === 80100073" -->
        <el-tab-pane v-if="rawData.tableMsg.TypeId === 80100073"  :label="rawData.tableMsg && rawData.tableMsg.TypeId === 80100073 ? '对象属性' : isLogical || isConceptual ? '实体属性' : '表属性'" name="udp">
          <div style="margin-top: 10px;">
            <div v-if="!isDesignModel && isShowSchema" class="property" style="margin-top: 10px;width: 50%;">
              <span class="label" style="width: 82px;" :style="typeDataWareHouse?'color:#bbbbbb !important':''">schema</span>
              <datablau-select :themeBlack="typeDataWareHouse" style="width:180px;display: inline-block;" size="mini" v-model="requestBody.SchemaRef" placeholder="" clearable filterable>
                <el-option v-for="item in Object.values(dataByType.schema).filter(i => !i.properties.deleted)"
                           :key="item.properties.Id"
                           :label="item.properties.Name"
                           :value="item.properties.Id">
                </el-option>
              </datablau-select>
            </div>
            <div
              v-if="isDesignModel && rawData.tableMsg.TypeId !== 80100073"
              class="property" style="width: 200px;margin-right: 0">
              <el-checkbox
                class="small"
                :disabled="!editMode"
                v-model="requestBody.logicalOnly"
              >仅逻辑</el-checkbox>
              <span class="label">
                <datablau-tips placement="top" style="position: relative;top: -2px;left: 2px;width: 10px;font-size: 14px;" icon="iconfont icon-tips" content="仅逻辑：没有物理含义的表"></datablau-tips>
              </span>
              <!--<div v-if="!editMode" class="value">{{rawData.tableMsg.IsLogicalOnly ? '是' : '否'}}</div>-->
              <!--<span class="tip-text">
                <i class="iconfont icon-tips"></i>{{$store.state.$v.dataEntity.logicalOnlyTitle}}
               </span>-->
            </div>
            <div
              v-else-if="rawData.tableMsg.TypeId !== 80100073"
              class="property" style="width: 200px;margin-right: 0">
              <el-checkbox
                class="small"
                :disabled="!editMode"
                v-model="requestBody.physicalOnly"
                :class="{'el-checkbox-black-theme': typeDataWareHouse}"
              >仅物理</el-checkbox>
              <span class="label">
                <datablau-tips placement="top" style="position: relative; top: -2px;left: 2px;width: 10px;font-size: 14px;" icon="iconfont icon-tips" content="仅物理：没有业务含义的表"></datablau-tips>
              </span>
              <!--<span class="tip-text">
                <i class="iconfont icon-tips"></i>{{$store.state.$v.dataEntity.physicalOnlyTitle}}
              </span>-->
              <!--<div v-if="!editMode" class="value">{{rawData.tableMsg.IsPhysicalOnly ? '是' : '否'}}</div>-->
            </div>
            <div class="property broader" :style="typeDataWareHouse?'color:#bbbbbb !important':''">
              <span class="label" style="width:82px;margin-right: 0;" >定义</span>
              <span v-if="!editMode" class="value" style="line-height: 30px;">
              <div v-if="rawData.tableMsg.Definition" class="definition-content-show" :title="string.nl2br(rawData.tableMsg.Definition)" v-html="string.nl2br(rawData.tableMsg.Definition)"></div>
              {{rawData.tableMsg.Definition ? '' :'暂无定义'}}
            </span>
              <span v-else class="value" style="width:478px">
              <el-input
                v-model="requestBody.description"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 2 }"
                show-word-limit
                resize="none"
                size="mini"
                maxlength="500"
                @change="changeAbsoluteTop"
                :class="{'black-el-input': typeDataWareHouse}"
              ></el-input>
            </span>
            </div>
            <div
              v-if="udpMessageDisplay.size"
              style="font-size: 12px;font-weight: 400;color: #555555;margin-bottom:10px;margin-top: 10px;"
              :style="typeDataWareHouse?'color:#bbbbbb':''"
            >自定义属性:</div>
            <div :style="{top: rawData.tableMsg.TypeId ===80100073 ? '80px' :'140px'}" style="position: absolute;top: 150px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessageDisplay.keys()">
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 20px;" :style="typeDataWareHouse?'color:#bbbbbb':''">{{key}}</h2>
                <udp-setting :currentModel="currentModel" :type="rawData.tableMsg.TypeId" :themeBlack="typeDataWareHouse" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="requestBody">
                </udp-setting>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="自定义属性" v-else>
          <div :style="{top: 0}" style="position: absolute;top: 0px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessageDisplay.keys()">
                <!-- TODO: 实体的自定义属性 -->
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 20px;" :style="typeDataWareHouse?'color:#bbbbbb':''">{{key}}</h2>
                <udp-setting @myValidate="myValidate" ref="udpSetting" :currentModel="currentModel" :type="rawData.tableMsg.TypeId" :themeBlack="typeDataWareHouse" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="requestBody">
                </udp-setting>
              </div>
            </div>
        </el-tab-pane>
        <el-tab-pane class="code-generate" v-if="!isLogicalModel && !editMode" :label="$store.state.$v.dataEntity.codeGenerate" name="Code" :lazy="true">
          <datablau-button
            type="important"
            size="default"
            @click="callSet"
            style="
            position: absolute;
            top:10px;
            right: 10px;
            z-index: 100;
            "
            :themeBlack="typeDataWareHouse"
          >{{activeTool === 'jpa' ? "JPA 脚本配置" :"SQL 脚本配置"}}
          </datablau-button>
          <datablau-tabs style="position: absolute;top: 10px;left: 0;right: 0;bottom: 0;" type="card"  v-model="activeTool"  tab-position="top" >
            <el-tab-pane
              label="JPA Class"
              name="jpa"
              v-if="$store.state.featureMap.ddm_JPAClass"
            >
              <export-jpa
                ref='jpa'
                :typeDataWareHouse="typeDataWareHouse"
                :modelId ='this.currentModel.id'
                :tableId='rawData.tableMsg.Id'
                :currentModel="currentModel"
              ></export-jpa>
            </el-tab-pane>
            <el-tab-pane
              :label="$store.state.$v.dataEntity.ddlScript"
              name="ddl">
              <export-ddl
                ref='ddl'
                :typeDataWareHouse="typeDataWareHouse"
                :modelId ='this.currentModel.id'
                :tableId='rawData.tableMsg.Id'
                :currentModel="currentModel"
              ></export-ddl>
            </el-tab-pane>
          </datablau-tabs>

        </el-tab-pane>
        <el-tab-pane label="分区" name="partition" v-if="currentModel.TypeUniqueId === '0f691fa0-3fd7-42f1-b868-051b0ffad10c' || currentModel.TypeUniqueId === '2c85c9ca-d052-467c-8c55-d367d69982cf' || currentModel.TypeUniqueId === '647f241e-bf2f-7f19-6754-ec94e1c07bec'"> <!--Mysql、PostgreSQL、iceberge-->
          <partion-editor
            style="padding-top: 10px;"
            ref="partitionRef"
            :allCols="allCols"
            :partition="rawData.partition"
            :partitionElementDesign="rawData.partitionElementDesign"
            :rawData="rawData"
            :editMode="editMode"
            :deliverNum="deliverNum"
            :currentModel="currentModel"
            :typeDataWareHouse="typeDataWareHouse"
            :editorType="editorType">
          </partion-editor>
        </el-tab-pane>
        <el-tab-pane label="Cluster" name="cluster" v-if="currentModel.TypeUniqueId === '647f241e-bf2f-7f19-6754-ec94e1c07bec'"> <!--iceberge-->
          <cluster-editor
            style="padding-top: 10px;"
            ref="clusterRef"
            :allCols="allCols"
            :cluster="rawData.cluster"
            :rawData="rawData"
            :editMode="editMode"
            :deliverNum="deliverNum"
            :currentModel="currentModel"
            :typeDataWareHouse="typeDataWareHouse"
            :editorType="editorType">
          </cluster-editor>
        </el-tab-pane>
        <el-tab-pane label="Storage" name="storage" v-if="currentModel.TypeUniqueId === '647f241e-bf2f-7f19-6754-ec94e1c07bec'"> <!--iceberge-->
          <datablau-form
            @submit.native.prevent
            label-width="110px"
            style="padding-top: 10px;">
            <el-form-item label="Location">
              <datablau-input :autosize="{ minRows: 2, maxRows: 5 }" resizeState type="textarea" style="width: 450px;" :disabled="!editMode" v-model="requestBody.Location" clearalbe></datablau-input>
            </el-form-item>
          </datablau-form>
        </el-tab-pane>
        <el-tab-pane label="高级属性" name="highproperties" v-if="currentModel.TypeUniqueId === '647f241e-bf2f-7f19-6754-ec94e1c07bec'"> <!--iceberge-->
          <datablau-form
            @submit.native.prevent
            label-width="110px"
            style="padding-top: 10px;">
<!--            <el-form-item label="TableType">
              <datablau-input style="width: 450px;" :disabled="!editMode" v-model="requestBody.TableType" clearalbe></datablau-input>
            </el-form-item>-->
            <el-form-item label="TblProperties">
              <datablau-input :autosize="{ minRows: 2, maxRows: 5 }" resizeState type="textarea" style="width: 450px;" :disabled="!editMode" v-model="requestBody.TblProperties" clearalbe></datablau-input>
            </el-form-item>
          </datablau-form>
        </el-tab-pane>
        <el-tab-pane label="映射" name="dwMapping" v-if="currentModel.IsDataWarehouse">
          <dw-mapping
            style="padding-top: 10px;"
            ref="dwMappingRef"
            :editMode="editMode"
            :dw-mapping-origin="rawData.dwMapping"
            :typeDataWareHouse="typeDataWareHouse"
            :pkSelection="pkSelection"
            :fk="fk"
            :allCols="allCols"
            :deliverNum="deliverNum"
            :shrink="shrink"
            :limitedDsApply="limitedDsApply"
            :limitedDsApplyConfig="limitedDsApplyConfig"
            :currentModel="currentModel"
          >
          </dw-mapping>
        </el-tab-pane>
        <el-tab-pane v-if="editorType === 'model'" label="样式" name="theme">
          <ul class="edit-style-dialog-content-wrapper" style="margin-top: 10px;">
            <li>样式：&nbsp;&nbsp;&nbsp;&nbsp;
              <datablau-select :disabled="!editMode" style="display: inline-block;width: 182px;" size="mini" placeholder="请选择" v-model="currentStyleRelatedShapeTemplate.StyleThemeRef">
                <template v-for="themeId in Object.keys(dataByType.theme)">
                  <el-option v-if="!dataByType.theme[themeId].properties.deleted" :key="dataByType.theme[themeId].properties.Name" :value="dataByType.theme[themeId].properties.Id" :label="dataByType.theme[themeId].properties.Name" ></el-option>
                </template>
              </datablau-select>
            </li>
            <li v-if="rawData.tableMsg.TypeId !== 80100073" class="style-box">
              <!-- 标题背景： -->
              <el-color-picker :disabled="!editMode" style="margin-right: 15px;vertical-align: middle" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor2" size="mini" ></el-color-picker>
              <span class="label-disc middle-y">标题背景</span>
              <opacity-component :disabled="!editMode" class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor2"></opacity-component>
            </li>
            <li class="style-box">
              <el-color-picker :disabled="!editMode" style="margin-right: 15px;vertical-align: middle" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor" size="mini"></el-color-picker>
              <span class="label-disc middle-y">背景颜色</span>
              <opacity-component :disabled="!editMode" class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor"></opacity-component>
            </li>
          </ul>
          <div v-if="editMode" style="text-align: left;margin-top: 5px;">
            <el-button type="primary" @click="resetStyleConfirm" size="mini">重置</el-button>
          </div>
        </el-tab-pane>
        <template v-for="page of udpMessagePageDisplay.keys()">
          <el-tab-pane :label="page" :name="page" :key="page">
            <div style="position: absolute;top: 10px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessagePageDisplay.get(page).keys()">
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                <udp-setting :currentModel="currentModel" :type="rawData.tableMsg.TypeId" :udp-map="udpMessagePageDisplay.get(page).get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="requestBody">
                </udp-setting>
              </div>
            </div>
          </el-tab-pane>
        </template>
        <el-tab-pane label="版本" name="versionpage" v-if="!rawData.editMode &&!rawData.appendMode">
          <div style="position: absolute;top: 10px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto">
          <datablau-table
                      :data="tableVersionList"
                      height="100%"
                       class="datablau-table tableVersionList"
                       :cell-style="{height: '30px'}"
                        header-row-class-name="table-header-class"
                    >
              <el-table-column type="expand">
                <template slot-scope="scope">
                    <transition name="fade">
                    <div style="margin: 10px;">
                      <datablau-table :data="scope.row.logs" height="100%"
                       class="datablau-table thin unshrink"
                         :cell-style="{height: '30px'}"
                          header-row-class-name="table-header-class">
                        <el-table-column label="记录号" property="verId"  width="140" >

                        </el-table-column>
                        <el-table-column
                          show-overflow-tooltip
                          label="修改记录"
                          min-width="250"
                        >
                          <template slot-scope="props">
                            {{logFormatter(props.row)}}
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="creator"
                          width="160"
                          :label="$store.state.$v.modelDetail.Submitter"
                          show-overflow-tooltip
                        >
                        <template slot-scope="props">
                          <span>{{
                              props.row.operator
                            }}</span>
                        </template>
                        </el-table-column>
                        <el-table-column
                          width="140"
                          :label="$store.state.$v.modelDetail.commitTime"
                          show-overflow-tooltip
                          :formatter="$timeFormatter"
                          property="timestamp"
                        >
                        </el-table-column>
                      </datablau-table>
                    </div>
                  </transition>
                </template>
              </el-table-column>
              <el-table-column label="版本号" prop="versionName"   >

              </el-table-column>
            </datablau-table>
          </div>
        </el-tab-pane>
      </datablau-tabs>
    </div>
    <div v-if="editMode && editorType === 'table'" class="bottom-tool"  :class="{'shadow': activeTab === 'column','bottom-tool-black': typeDataWareHouse}">
      <datablau-button
        v-if="editMode && writable"
        @click="beforeSave"
        size="small"
        type="important"
        :disabled="buttonLoading || !requiredFormNotEmpty"
        :themeBlack="typeDataWareHouse"
      >{{$store.state.$v.dataEntity.ok}}</datablau-button>
      <datablau-button
        v-if="editMode"
        @click="cancel"
        size="small"
        type="secondary"
        :disabled="buttonLoading"
        :themeBlack="typeDataWareHouse"
      >{{$store.state.$v.dataEntity.cancel}}</datablau-button>
    </div>
  </div>
</template>
<script>
import tableDetail from './tableDetail.js'
export default tableDetail
</script>
<style lang="scss" scoped="scoped">
  @import '@/views/list/_paneDetail.scss';
  .plTableBox {
    overflow: auto;
  }
  /deep/ .el-tabs__nav-wrap {
    z-index: 10;
  }
  .definition-content-show {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 30px;
  }
  .operator-wrapper {
    line-height: 30px;
    text-align: center;
    .is-block {
      padding: 2px;
    }
  }
  .code-generate {
    /deep/ .el-tabs--card .el-tabs__content {
      top: 36px;
    }
    /deep/ .export-ddl .wrapper {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0px;
      .sql-container pre.language-sql {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 50px;
      }
      .el-icon-download, .el-icon-document-copy {
        position: absolute;
        left: 0px;
        top: auto;
        bottom: 0;
      }
      .el-icon-document-copy {
        left: 74px;
      }
    }
    /deep/ .datablau-tabs.datablau-tabs-card .el-tabs.el-tabs--card .el-tabs__header .el-tabs__nav .el-tabs__item {
      border: 1px solid #dddddd !important;

      //line-height: 30px;
      position: relative;
      padding: 0 10px !important;
      height: 32px;
      line-height: 32px;
      font-size: 12px;

      &:nth-child(n+2) {
        border-left-color: transparent !important;
      }

      &:nth-of-type(1) {
        // border-left: 1px solid #dddddd !important;
      }

      &.is-active {
        border: 1px solid #409EFF !important;
      }
    }
    /deep/ .el-collapse {
      display: none;
    }
  }
  .tip-text {
    margin-left: 15px;
    display: inline-block;
    font-size: 12px;
    line-height: 25px;
    color: #777;
    .iconfont {
      position: relative;
      top: 1px;
      margin-right: 3px;
      color: #999;
      font-size: 14px;
    }
  }
  .editor-type-table.content-box {
    top: 100px;
    bottom: 35px;
  }
  .bottom-tool {
    padding: 9px 0;
    padding-left: 20px;
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0;
    height: 50px;
    border-top: 1px solid #ddd;
    background-color: #fff;
    z-index: 9;
    &.bottom-tool-black{
      border-top: 1px solid #4D4D4D;;
      background: #222222;
    }
    &.shadow {
      box-shadow: 0px -2px 4px 0px rgba(0,0,0,0.1);
      border-top: unset;
    }
  }
  .small.el-checkbox {
    margin-right: 2px;
  }
  .el-checkbox-black-theme{
    /deep/ .el-checkbox__input.is-disabled .el-checkbox__inner{
      background-color: rgba(77, 77, 77, 0.4);
      border: 1px solid #888888;
    }
    /deep/ .el-checkbox__inner{
      background-color: transparent;
       border: 1px solid #888888;
    }
    /deep/ .el-checkbox__input + .el-checkbox__label{
      color: #bbbbbb;
    }
  }
  /deep/ .el-table--border::after {
    display: none;
  }
  .el-table.datablau-table /deep/ thead th {
    color: #555;
  }
  .el-button {
    font-weight: normal;
  }
  /deep/ .el-table__fixed::before {
    display: none;
  }
  /deep/ .el-table::before {
    display: none;
  }
  /deep/ .blue-tabs .el-tabs__item.is-active {
    color: #409EFF;
  }
  /deep/ .blue-tabs .el-tabs__active-bar {
    background-color: #409EFF;
  }
  /deep/ .el-tabs__item {
    font-size: 12px;
    color: #555;
  }
  /deep/ .el-button {
    font-size: 12px;
  }
  .entity-wrapper {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 130px;
  }
  .tab-to-expand-wrapper {
    user-select: none;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    img {
      height: 90px;
    }
  }
  .translate-wrapper {
    cursor: pointer;
    top: 4px;
    margin-left: 18px;
    display: inline-block;
    position: relative;
    img {
      width: 36px;
    }
    span {
      position: absolute;
      left: 4px;
      top: -2px;
      font-size: 12px;
      line-height: 1;
      color: #555;
    }
    &:hover {
      span {
        color: #409EFF;
      }
    }
  }
  .table-box1 {
    height: unset!important;
    position: absolute;
    top: 50px;
    left: 0;
    bottom: 20px;
    right: 0;
    .el-autocomplete {
      display: block;
      height: 30px;
    }
  }
  .table-box2 {
    /deep/ {
      .unshrink.blackBG {
        .el-table {
          background: #222;
          .cell {
            color: #bbb !important;
          }
          tr,th {
            background: #222;
            td,
            th {
              border-color: #888;
              color: #bbb;
            }
          }
          .hover-row {
            td {
              background-color: rgba(24, 127, 255, .2) !important;
            }
          }
          .current-row td{
            background: rgba(24, 127, 255, .2) !important;

          }
        }
      }
    }
  }
  .is-edit .table-box1 /deep/ td {
    border-right: 1px solid #EBEEF5!important;
  }
  .table-box /deep/ {
    .el-table--scrollable-x .el-table__body-wrapper {
      z-index: 1;
    }
  }
  .table-box1 /deep/ {
    .cell {
      height: 30px!important;
      line-height: 30px!important;
    }
    .datablau-table.thin {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .el-table__row td:last-child .cell {
      border-right: 1px solid #ddd;
    }
    .table-header-class {
      th {
        background-color: #F5F5F5;
        height: 30px!important;
      }
    }
    .el-table--border th.is-leaf {
      border-right: 2px solid #EBEEF5;
    }
    .el-table__body {
      .el-select {
        vertical-align: top;
      }
      .el-checkbox {
        line-height: 30px;
        height: 30px;
      }
      i.el-icon-check {
        height: 30px;
        line-height: 30px;
      }
      tr > td .is-error input {
        color: #F56C6C;
        border: 1px solid #F56C6C;
      }
      tr > td.focus .top input {
        border-top: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .left input {
        border-left: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .right input {
        border-right: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .bottom input {
        border-bottom: 1px solid rgb(64, 158, 255)
      }
      tr > td input:focus {
        background-color: rgba(64, 158, 255, 0.1) !important;
        border: 1px solid rgb(64, 158, 255)
      }
      tr td.focus input {
        position: relative;
        background-color: rgba(64, 158, 255, 0.1) !important;
        border: none;
      }
    }
    .el-input {
      vertical-align: top;
    }
    td {
      vertical-align: top;
    }
    input {
      height: 30px;
      line-height: 30px;
      border-radius: 0;
      vertical-align: inherit;
      border: none;
      background-color: unset;
    }
    button {
      padding: 0;
      height: 30px!important;
      vertical-align: inherit;
      border: none;
      background-color: unset;
    }
    .el-table__body, .el-table__footer, .el-table__header {
      border-collapse: collapse;
    }
    .el-table--border {
      border: none;
    }
    .el-table__header-wrapper {
      table {
        border-right: 1px solid #EBEEF5;
        border-top: 1px solid #EBEEF5;
      }
    }
    .el-table__fixed-header-wrapper {
      table {
        border-left: 1px solid #EBEEF5;
        border-top: 1px solid #EBEEF5;
      }
    }
    .el-table__body-wrapper {
      table {
        border: 1px solid #EBEEF5;
        border-top: none;
        .cell {
          padding-left: 0;
        }
      }
    }
    .el-table__fixed-body-wrapper {
      table {
        border: 1px solid #EBEEF5;
        border-top: none;
        .cell {
          padding-left: 0;
        }
      }
    }
  }
  .table-box1{
    &.black-theme  /deep/ {
      .el-table--border th.is-leaf {
      border-right: none;
      }
      .el-table__fixed-header-wrapper {
        table {
          border-left: 1px solid transparent;
          border-top: 1px solid transparent;
        }
      }
      .el-table__header-wrapper {
        table {
          border-right: 1px solid transparent;
          border-top: 1px solid transparent;
        }
      }
      td {
        border-right: 1px solid transparent !important;
      }
      .el-table__row td:last-child .cell {
        border-right: 1px solid transparent;
      }
      .el-table__fixed-body-wrapper {
        table {
          border: none;
          border-top: none;
          .cell {
            padding-left: 0;
          }
        }
      }
    }
  }
  // black组件修改颜色
  .black-el-form{
    /deep/ .el-input.is-disabled .el-input__inner{
      background-color: rgba(51,51,51,0.6);
      border: 1px solid #4D4D4D;
      color: #BBBBBB;
    }
    /deep/ .el-select .el-input.is-disabled .el-input__inner{
      background-color: rgba(51,51,51,0.6);
      border: 1px solid #4D4D4D;
      color: #BBBBBB;
    }
  }
  .black-el-select{
    /deep/ .el-input.is-disabled .el-input__inner{
      background-color: rgba(51,51,51,0.6);
      border: 1px solid #4D4D4D;
      color: #BBBBBB;
    }
    /deep/ .el-input__inner{
      color: #BBBBBB;
    }
    /deep/ .el-input__inner::placeholder{
      color:#888888;
    }
  }
  .black-el-input {
    /deep/ .el-textarea__inner{
      background-color: transparent;
      border: 1px solid #4D4D4D;
      color: #bbbbbb;
    }
    /deep/ .el-input__count{
      background-color: transparent;
    }
    /deep/ .el-input__inner{
      color: #bbbbbb;
    }
  }
  .el-button{
    &.black-el-button.is-disabled:hover{
      background-color: transparent;
    }
  }
  #table-details {
    /deep/ .icon-tips:before {
      font-size: 14px;
    }
    /deep/ .el-table th > .cell {
      font-size: 12px;
      color: #555;
    }
    /deep/ .el-table {
      font-size: 12px;
    }
    box-shadow: 2px 0 8px 0 rgba(0,0,0,0.1);
    .label-disc {
      margin-right: 20px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    .style-box  {
      position: relative;
      height: 42px;
    }
    .middle-y {
      display: inline-block;
      vertical-align: middle;
    }
  }
  .new-title-box {
    margin: 14px 0;
    .header {
      padding: 11px 16px;
      height: 70px;
      // background: #F6F8FF;
      padding-top: 15px;
      &.headerBlack{
        background: transparent;
      }
      img {
        float: left;
      }
      .text-box {
        padding-left: 10px;
        float: left;
        h3 {
          margin: 0;
          line-height: 20px;
          font-size: 16px;
        }
        p {
          padding-top: 3px;
          color: #7D8493;
          font-size: 13px;
        }
        &.text-box2 {
          display: inline-block;
          padding-left: 16px;
          vertical-align: super;
          h3 {
            line-height: 20px;
            font-size: 20px;
            color: #bbbbbb;
          }
          p {
            padding-top: 3px;
            color:#909399;
            font-size: 13px;
          }
        }
      }
    }
    .row {
      padding-top: 16px;
      .property {
        float: left;
        &.broader {
          height: unset;
          min-height: unset;
          // max-width: 1269px;
          width: calc(100% - 140px);
          margin-right: 0;
        }
        &.thin {
          height: 24px;
          min-height: unset;
          margin-right: 10px;
          width: 128px;
        }
        .value {
          color: #888F9D;
          word-break: break-word;
          & > div {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .tableNameLabel{
    &::before{
      content: '*';
    color: #e86666;
    font-size: 13px;
    }
  }
  .property {
    width: 30%;
    .label {
      font-size: 12px;
      font-weight: 400;
      color: #555555;
      line-height: 30px;
      /deep/ .el-tooltip {
        color: #999;
      }
    }
    &.thin {
      width: 180px;
    }
    &.udp {
          width: 561px;
          max-width: unset;
          margin-right: unset;
          min-height: unset;
           &:last-of-type {
              .label {
                border-bottom:1px solid #DDDDDD;
              }
          }
          .label {
            padding-left: 10px;
            width: 200px;
            height: 34px;
            background: #F5F5F5;
            border-radius: 2px 0px 0px 0px;
            border: 1px solid #DDDDDD;
            border-bottom: unset;
          }
          .value {
            width: 361px;
            height: 34px;
            .el-input {
              display: inline-block;
              width: 250px;
              height: 34px;
            }
            .el-input-number {
              width: 250px;
            }
            /deep/ .el-input__inner {
              width: 250px;
              height: 34px;
              line-height: 34px;
            }
            /deep/ .el-input-number__decrease {
              height: 34px;
            }
            /deep/ .el-input-number__increase {
              height: 34px;
            }
          }
        }
  }
  .top-area {
    width:600px;
    padding-bottom: 15px;
    .property.broader {
      margin-top: 10px;
      width: 100%;
    }
  }
  .top-area {
    .property {
      // height:3em;
      // line-height:2em;
      margin-right: unset;
      height: 30px;
      width: 210px;
      min-height: unset;
      .value {
        width: 160px;
        height: 30px;
      }
      .label {
        padding-left: 2px;
        width: 80px;
        line-height: 30px;
        text-align: right;
        padding-right: 10px;

        &.required::before {
          position: static;
        }

        &.required2::before {
          position: static;
        }

        &.translate-cname {
          width: auto;
        }
      }
    }
    &.black-theme{
      padding-top: 14px;
      width:auto;
      .translate-wrapper{
          span{
            color: #187FFF;
          }
        }
      .property{
        .label{
          color: #BBBBBB !important;
          width: 62px;
        }
      }

    }
  }
  .container.overflow {
    /*padding:10px;*/
    padding:0 20px 15px;
    margin-left: 0;
    overflow-x:hidden;
    overflow-y:auto;
    position:absolute;top:0;left:0;bottom:0;right:0px;
  }
  .title {
    margin-bottom:0.8em;
  }
  .outline {
    color:#494850;
    height:70px;
    position:relative;
    /*border: 1px solid red;*/
    .title{
      position:absolute;
      top:0px;
      left:20px;
      font-size:18px;
      /*max-width:350px;*/
    }
    .sub {
      position: absolute;
      top:30px;
      left:20px;
    }
  }
  .is-edit {
    top: 80px
  }
  /deep/ .hide-entity-row {
    display: none;
  }
  .edit-style-dialog-content-wrapper {
    text-align: left;
    li + li {
      margin-top: 10px;
    }
  }
  /deep/ {
    .el-transfer-panel {
      width: 210px !important;
      height: 85%;
    }
    .el-transfer-panel__body {
      height: 100% !important;
    }
    .el-transfer-panel__list.is-filterable{
      height: 85%;
    }
  }
  .header-wrapper {
    margin: 5px 0 10px 0;
    padding: 10px 0 10px;
    // border-bottom: 1px solid #D8D8D8;
    h2 {
      font-size: 14px;
      line-height: 1;
      color: #555;
      margin-left: 0px;
      // border-left: 4px solid #409EFF;
      padding-left: 0;
    }
  }
  .tab-to-expand-btn {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    &:hover {
      color: #409EFF;
    }
    cursor: pointer;
  }
</style>
<style lang="scss">
  #table-details {
    .el-table td, .el-table th {
      padding: 0;
      box-sizing: content-box;
    }
    .el-textarea__inner {
      min-height: unset !important;
    }
    .el-tooltip__popper {
      max-width:600px;
    }
    .el-autocomplete-suggestion li {
       padding: 0 0px;
    }
    .el-tabs__content {
      position: absolute;
      top: 30px!important;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
    }
    .el-tab-pane {
      overflow-y: hidden;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
     #pane-Code {
      overflow-y: auto;
    }
    .el-table {
      .cell {
        padding-right: 0;
      }
    }
    // .el-input__inner {
    //   border-radius: 0;
    // }
    .property {
      &.udp {
        .el-input__inner {
          height: 34px;
          line-height: 34px;
        }
      }
    }
    .in-column-wrapper {
      .property {
        &.udp {
          .el-input__inner {
            height: 30px!important;
            line-height: 30px;
            width: 160px;
          }
          .el-input-number {
            width: 160px;
          }
        }
      }
    }
    .input-content-box {
      .el-form-item__error {
        position: unset;
      }
    }
  }
  .el-popover.domain-popover {
    padding: 10px;
    .tree-icon.domain {
        left: 5px;
    }
    .domain-title {
        position: relative;
        font-size: 14px;
        font-weight: 500;
        color: #555555;
        > p {
          position: absolute;
          top: 0;
          right: 17px;
          color: #4496FF;
          font-size: 12px;
        }
    }
    .domain-disc {
        margin-bottom: 7px;
        padding-left: 24px;
        font-size: 12px;
        font-weight: 400;
        text-align: left;
        color: #555555;
        line-height: 24px;
        border-bottom: 1px solid rgba(85,85,85,0.10);;
    }
    .text-item {
        font-size: 12px;
        font-weight: 400;
        color: #555555;
        margin-bottom: 5px;
    }
    .label {
        margin-right: 10px;
        display: inline-block;
        width: 72px;
        text-align: right;
    }
}
.elselect2{
  .el-input__inner::placeholder{
    color: #bbb;
  }
}
.el-autocomplete-suggestion{
    &.balckpopper-class{
        background-color: #2A2A2A;
        border: 1px solid #333333;
        li{
          color: #BBBBBB;
          &:hover{
            background: rgba(24, 127, 255, .2);
          }
        }
        .popper__arrow{
          border-bottom-color: #333333;
        }
        .popper__arrow::after{
          border-bottom-color: #333333;
        }
    }
  }
  .moreAttribute{
    .el-form.db-form .el-form-item{
      margin-bottom:0;
    }
  }
</style>
