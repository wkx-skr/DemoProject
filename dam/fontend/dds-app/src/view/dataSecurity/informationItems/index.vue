<template>
  <div
    style="height: 100%"
    id="ddd"
    class="domain-component-outer"
    v-loading="pageLoading"
  >
    <template v-if="!blank">
      <div class="tree-area">
        <template v-if="treeShow">
          <datablau-tree-header>
            <template slot="title">{{ $t('informationItems.title') }}</template>
            <template
              slot="more"
              v-if="$auth.DATA_SECURITY_AUTH_STANDARD_CATALOG_MANAGE"
            >
              <datablau-tooltip :content="$t('securityModule.new')">
                <i
                  class="iconfont icon-tianjia"
                  @click="commandHandle('addNext', {})"
                ></i>
              </datablau-tooltip>
            </template>
            <template slot="search">
              <div class="tree-search-box" style="width: 100%">
                <!-- <i
                v-show="showClose"
                class="el-icon-circle-close cursor-close"
                :class="{ 'show-cursor-close': showClose }"
                @click="clear"
              ></i> -->
                <datablau-select
                  ref="loadSelect"
                  class="filter-input"
                  v-model="chooseResult"
                  :iconfont-state="true"
                  clearable
                  filterable
                  remote
                  reserve-keyword
                  :placeholder="$t('securityModule.search')"
                  :remote-method="searchCatalog"
                  :loading="searchLoading"
                  popper-class="tree-search-popper"
                  @change="handleChooseChange"
                  @focus="handleChooseSelectFocus"
                  @visible-change="visibleChange"
                  :isIcon="'icon-search'"
                >
                  <el-option
                    v-for="item in searchResult"
                    :key="item.id"
                    :label="item.catalogPathName"
                    :value="item.id"
                  ></el-option>
                </datablau-select>
              </div>
            </template>
          </datablau-tree-header>
          <div
            class="tree-title"
            :class="{ 'tree-title-active': !nowFolder.id }"
            @click="handleAllTree"
          >
            <i class="iconfont icon-file"></i>
            <span>{{ $t('informationItems.allInformationItems') }}</span>
          </div>
          <div class="tree-line"></div>
          <div class="tree-box" style="overflow: auto">
            <datablau-tree
              v-loading="treeLoading"
              ref="mainTree"
              class="grey-tree"
              :props="defaultProps"
              :show-checkbox="false"
              node-key="id"
              lazy
              :load="loadTreeData"
              :default-expanded-keys="[]"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :highlight-current="true"
              auto-expand-parent
              :check-strictly="false"
              :data-icon-function="dataIconFunction"
              :data-options-function="dataOptionsFunction"
              :data-supervise="true"
              @node-click="handleItemClicked"
              show-overflow-tooltip
            ></datablau-tree>
          </div>
        </template>
      </div>
      <div class="tree-area-margin-right"></div>
      <div class="content-area">
        <div class="folder-content-box" v-if="listShow">
          <div class="datastandard-folder-detail" id="domainFolder">
            <datablau-list-search class="search-outer">
              <el-form ref="searchForm" :inline="true" :model="searchFormData">
                <el-form-item prop="itemName" style="width: 120px">
                  <datablau-input
                    clearable
                    maxlength="100"
                    type="text"
                    :iconfont-state="true"
                    style="width: 250px"
                    v-model="searchFormData.itemName"
                    :placeholder="$t('informationItems.searchCode')"
                    @keyup.native.enter="handleSearch"
                  ></datablau-input>
                </el-form-item>
              </el-form>
              <template slot="buttons">
                <div v-if="$auth.DATA_SECURITY_AUTH_STANDARD_MANAGE">
                  <datablau-button
                    type="primary"
                    class="iconfont icon-tianjia"
                    size="mini"
                    @click="addItem"
                  >
                    {{ $t('securityModule.new') }}
                  </datablau-button>
                  <el-dropdown
                    trigger="click"
                    @command="moreHandle"
                    class="more-fun-btn"
                    v-if="showMoreOptionsButton"
                  >
                    <datablau-button
                      size="mini"
                      type="secondary"
                      icon="el-icon-plus"
                    >
                      {{ $t('securityModule.more') }}
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </datablau-button>
                    <el-dropdown-menu class="more-drop-box" slot="dropdown">
                      <el-dropdown-item
                        icon="iconfont icon-import"
                        command="a"
                        v-if="$auth.DATA_SECURITY_AUTH_STANDARD_UPLOAD"
                      >
                        {{ $t('securityModule.import') }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        icon="iconfont icon-upload"
                        command="b"
                        v-if="$auth.DATA_SECURITY_AUTH_STANDARD_DOWNLOAD"
                      >
                        {{ $t('securityModule.export') }}
                      </el-dropdown-item>
                      <el-dropdown-item icon="iconfont icon-expand" command="c">
                        {{ $t('securityModule.extendAttr') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </template>
            </datablau-list-search>
            <datablau-form-submit :style="{ top: '53px' }">
              <datablau-table
                class="datablau-table"
                height="100%"
                ref="itemTable"
                :data="itemList"
                :data-selectable="
                  $auth.DATA_SECURITY_AUTH_STANDARD_MANAGE ||
                  $auth.DATA_SECURITY_AUTH_STANDARD_DOWNLOAD
                "
                v-loading="tableLoading"
                :reserve-selection="true"
                :show-column-selection="false"
                :row-key="geItemRowKeys"
                row-class-name="row-can-click"
                @row-click="checkItem"
                @selection-change="tableSelectionChanged"
                @sort-change="handleItemSortChange"
              >
                <el-table-column width="30px">
                  <datablau-icon
                    style="margin-top: 5px"
                    data-type="infoitems"
                    :isIcon="true"
                    :size="18"
                  ></datablau-icon>
                </el-table-column>
                <el-table-column
                  min-width="120px"
                  :label="$t('securityModule.name')"
                  prop="name"
                  sortable="name"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  min-width="110px"
                  sortable="stdCode"
                  :label="$t('securityModule.code')"
                  prop="stdCode"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  min-width="120px"
                  :label="$t('securityModule.enName')"
                  prop="englishName"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.englishName || '--' }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="120px"
                  :label="$t('securityModule.businessDefinition')"
                  prop="businessDepartment"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.businessDepartment || '--' }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="120px"
                  :label="$t('securityModule.creator')"
                  prop="creator"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('securityModule.creationTime')"
                  min-width="160"
                  column-key="last"
                  prop="createTime"
                  sortable="createTime"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="$t('securityModule.operate')"
                  align="center"
                  fixed="right"
                  header-align="center"
                  width="120"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      v-if="$auth.DATA_SECURITY_AUTH_STANDARD"
                      style="margin: 0 3px"
                      type="icon"
                      @click="checkItem(scope.row)"
                    >
                      <datablau-tooltip
                        :content="$t('securityModule.view')"
                        placement="top"
                      >
                        <i class="iconfont icon-see"></i>
                      </datablau-tooltip>
                    </datablau-button>

                    <div
                      class="edit-btn domain-edit"
                      v-if="$auth.DATA_SECURITY_AUTH_STANDARD_MANAGE"
                    >
                      <datablau-button
                        style="margin: 0 3px"
                        type="icon"
                        @click="editItem(scope.row)"
                      >
                        <datablau-tooltip
                          :content="$t('securityModule.edit')"
                          placement="top"
                        >
                          <i class="iconfont icon-bianji"></i>
                        </datablau-tooltip>
                      </datablau-button>
                      <datablau-button
                        style="margin: 0 3px"
                        type="icon"
                        :disabled="scope.row.bind"
                        @click="deleteItem('single', scope.row)"
                      >
                        <datablau-tooltip
                          :content="
                            scope.row.bind
                              ? $t('informationItems.delTip')
                              : $t('securityModule.delete')
                          "
                          placement="top"
                        >
                          <i class="iconfont icon-delete"></i>
                        </datablau-tooltip>
                      </datablau-button>
                    </div>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons">
                <div
                  class="left-btn"
                  v-show="tableSelection && tableSelection.length > 0"
                >
                  <div style="display: inline-block">
                    <btn-tip :num="tableSelection.length"></btn-tip>
                    <datablau-button
                      class="iconfont icon-delete"
                      type="danger"
                      size="mini"
                      v-if="$auth.DATA_SECURITY_AUTH_STANDARD_MANAGE"
                      @click="deleteItem('multiple')"
                      :tooltip-content="
                        tableSelection.find(item => item.bind)
                          ? $t('informationItems.delTip1')
                          : ''
                      "
                      :disabled="!!tableSelection.find(item => item.bind)"
                    >
                      {{ $t('securityModule.delete') }}
                    </datablau-button>
                    <datablau-button
                      v-if="
                        tableSelection.length > 0 &&
                        $auth.DATA_SECURITY_AUTH_STANDARD_DOWNLOAD
                      "
                      @click="handlerExport"
                    >
                      {{ $t('securityModule.export') }}
                    </datablau-button>
                  </div>
                </div>
                <datablau-pagination
                  class="pagination-component"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page.sync="itemPagination.currentPage"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="itemPagination.pageSize"
                  :pager-count="5"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="itemPagination.total"
                ></datablau-pagination>
              </template>
            </datablau-form-submit>
          </div>
        </div>
      </div>
    </template>
    <template v-if="showDetails">
      <div
        class="item-details"
        style="
          width: 100%;
          height: 100%;
          background-color: #fff;
          padding: 0;
          position: absolute;
          z-index: 99;
        "
      >
        <div class="title-row">
          <datablau-breadcrumb
            @back="cancelItem"
            :node-data="breadNodeData"
            :couldClick="false"
          ></datablau-breadcrumb>
        </div>
        <datablau-form-submit style="margin-top: 50px">
          <template v-if="itemEditable">
            <datablau-form
              :inline-message="false"
              label-position="right"
              :label-width="'100px'"
              size="small"
              ref="itemForm"
              :rules="itemEditable ? itemRules : {}"
              :model="itemDetails"
              style="padding-left: 20px"
            >
              <datablau-detail-subtitle
                :title="$t('informationItems.baseAttr')"
                mt="0px"
                mb="10px"
              ></datablau-detail-subtitle>
              <el-form-item
                :label="$t('informationItems.infoName')"
                prop="name"
              >
                <datablau-input
                  v-model="itemDetails.name"
                  :placeholder="$t('securityModule.input')"
                  maxlength="50"
                  show-word-limit
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('informationItems.infoCode')"
                prop="stdCode"
              >
                <datablau-input
                  v-model="itemDetails.stdCode"
                  :placeholder="$t('informationItems.inputInfoCode')"
                  :disabled="!!itemDetails.itemId || autoCodeSelect"
                  :disabledGrey="!!itemDetails.itemId || autoCodeSelect"
                  :style="{ width: !itemDetails.itemId ? '412px' : '500px' }"
                ></datablau-input>
                <datablau-checkbox
                  v-if="!itemDetails.itemId"
                  :checkboxType="'single'"
                  v-model="autoCodeSelect"
                  @change="autoCodeChange"
                  :disabled="!autoCode"
                  style="display: inline-block; margin-left: 10px"
                >
                  {{ $t('informationItems.automatically') }}
                </datablau-checkbox>
              </el-form-item>
              <el-form-item
                :label="$t('informationItems.enName')"
                prop="englishName"
              >
                <datablau-input
                  v-model="itemDetails.englishName"
                  :placeholder="$t('securityModule.input')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('securityModule.selectCatalog')"
                prop="catalogPathName"
              >
                <datablau-input
                  :placeholder="$t('securityModule.placeSelect')"
                  v-model="itemDetails.catalogPathName"
                  @focus="openItemCatalogDialog"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('securityModule.businessDefinition')"
                prop="businessDepartment"
              >
                <datablau-input
                  type="textarea"
                  v-model="itemDetails.businessDepartment"
                  :placeholder="$t('securityModule.input')"
                  style="width: 500px"
                ></datablau-input>
              </el-form-item>
              <template v-if="udps.length">
                <datablau-detail-subtitle
                  :title="$t('securityModule.extendAttr')"
                  mt="0px"
                  mb="10px"
                ></datablau-detail-subtitle>
                <el-form-item
                  v-for="(udp, index) in udps"
                  :key="index"
                  :prop="udp.propName"
                  :label="udp.propName"
                >
                  <datablau-input
                    v-if="udp.type === 'STRING'"
                    type="textarea"
                    :autosize="{ minRows: 2 }"
                    v-model="udp.value"
                    :placeholder="$t('securityModule.input')"
                    style="width: 500px"
                  ></datablau-input>
                  <datablau-select
                    v-if="udp.type === 'ENUM'"
                    v-model="udp.value"
                    :placeholder="$t('securityModule.placeSelect')"
                  >
                    <el-option
                      v-for="item in udp.typeData
                        .split(',')
                        .filter(m => m !== '')"
                      :key="item"
                      :label="item"
                      :value="item"
                    ></el-option>
                  </datablau-select>
                  <el-input-number
                    v-if="udp.type === 'NUM'"
                    v-model="udp.value"
                  ></el-input-number>
                </el-form-item>
              </template>
            </datablau-form>
            <div slot="buttons">
              <datablau-button
                v-if="itemEditable"
                type="primary"
                size="mini"
                @click="submitItem"
              >
                {{ $t('securityModule.sure') }}
              </datablau-button>
              <datablau-button type="secondary" size="mini" @click="cancelItem">
                {{ $t('securityModule.cancel') }}
              </datablau-button>
            </div>
          </template>
          <template v-else>
            <datablau-detail class="information-detail">
              <datablau-detail-subtitle
                :title="$t('informationItems.baseAttr')"
                mt="0px"
                mb="10px"
              ></datablau-detail-subtitle>
              <el-form-item
                :label="$t('informationItems.infoName')"
                style="width: 100%"
              >
                <span>{{ itemDetails.name }}</span>
              </el-form-item>
              <el-form-item
                :label="$t('informationItems.infoCode')"
                style="width: 100%"
              >
                <span>
                  {{ itemDetails.stdCode }}
                </span>
              </el-form-item>
              <el-form-item
                :label="$t('informationItems.enName')"
                style="width: 100%"
              >
                <span>{{ itemDetails.englishName }}</span>
              </el-form-item>
              <el-form-item
                :label="$t('securityModule.selectCatalog')"
                style="width: 100%"
              >
                <span>
                  {{ itemDetails.sensitiveCatalogName }}
                </span>
              </el-form-item>
              <el-form-item
                :label="$t('securityModule.businessDefinition')"
                style="width: 100%"
              >
                <span>{{ itemDetails.businessDepartment }}</span>
              </el-form-item>
              <template v-if="udps.length">
                <datablau-detail-subtitle
                  :title="$t('securityModule.extendAttr')"
                  mt="0px"
                  mb="10px"
                ></datablau-detail-subtitle>
                <el-form-item
                  v-for="(udp, index) in udps"
                  :key="index"
                  :label="udp.propName"
                  style="width: 100%"
                >
                  <template>{{ udp.value }}</template>
                </el-form-item>
              </template>
            </datablau-detail>
          </template>
        </datablau-form-submit>
      </div>
    </template>
    <!-- 导入信息项 -->
    <datablau-dialog
      :size="'m'"
      append-to-body
      :title="``"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
      @close="handleCloseUploadDialog"
    >
      <span slot="title">
        <span
          style="
            font-size: 16px;
            line-height: 24px;
            color: #555;
            font-weight: 500;
          "
        >
          {{ $t('informationItems.exportInfo') }}
        </span>
        <el-tooltip
          placement="right"
          effect="dark"
          popper-class="tooltipDomain"
        >
          <i class="iconfont icon-tips"></i>
          <div slot="content">{{ $t('informationItems.infoReTip') }}</div>
        </el-tooltip>
      </span>
      <template v-if="!showUploadRes">
        <div class="uploadContent" v-loading="uploading">
          <p class="uploadtip">{{ $t('informationItems.importTip') }}</p>
          <datablau-button
            style="
              float: right;
              margin-right: -25px;
              margin-top: -6px;
              line-height: 30px;
            "
            type="text"
            @click="modelDownload"
          >
            {{ $t('informationItems.downloadTem') }}
          </datablau-button>
          <datablau-upload
            :action="standardUploadUrl"
            :before-upload="showBegain"
            :on-error="onError"
            :on-success="onSuccess"
            :on-change="onChange"
            :before-remove="beforeRemove"
            :show-file-list="true"
            accept=".xlsx"
            :headers="$headers"
            ref="itemImport"
            :isEdit="true"
            :limit="2"
            :auto-upload="false"
            class="standardImport-upload"
          >
            <slot>
              <datablau-button type="secondary">
                <i class="iconfont icon-upload" style="margin-right: 6px"></i>
                <span>{{ $t('informationItems.upFile') }}</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
          <div class="autoCode">
            <datablau-switch
              v-model="autoCodeSelect"
              :disabled="!autoCode"
              style="display: inline-block; margin-right: 8px"
            ></datablau-switch>

            <span
              style="margin-right: 2px; color: #555"
              :style="{
                color: autoCode && autoCodeSelect ? '#409eff' : '#555555',
              }"
            >
              {{ $t('informationItems.autoCreateCode') }}
            </span>
            <el-tooltip
              placement="right"
              effect="dark"
              popper-class="tooltipDomain"
            >
              <i class="iconfont icon-tips"></i>
              <div slot="content">
                {{ $t('informationItems.uploadTip') }}
              </div>
            </el-tooltip>
          </div>
        </div>
        <div slot="footer">
          <datablau-button type="secondary" @click="handleCloseUploadDialog">
            {{ $t('securityModule.cancel') }}
          </datablau-button>
          <datablau-button
            :disabled="formFile.length === 0"
            type="primary"
            @click="importItems"
          >
            {{ $t('securityModule.sure') }}
          </datablau-button>
        </div>
      </template>
      <template v-else>
        <div class="success-group">
          <div class="success-title">
            <i class="el-icon-success success-icon"></i>
            <span style="margin-left: 6px">
              {{ $t('informationItems.uploadNum', { num: uploadSuccessNum }) }}
            </span>
          </div>
        </div>
        <div
          v-for="errorKey in Object.keys(uploadResList)"
          :key="errorKey"
          class="error-group"
        >
          <div class="error-title">
            <i class="el-icon-error fail-icon"></i>
            <span class="error-reason">{{ uploadResMap[errorKey] }}:</span>
            <span class="error-count">
              {{ uploadResList[errorKey].length
              }}{{ $t('informationItems.strip') }}
            </span>
            <span class="copy" v-copy="uploadResList[errorKey].join('， ')">
              {{ $t('securityModule.copy') }}
            </span>
          </div>
          <div class="error-list">
            {{ uploadResList[errorKey].join('， ') }}
          </div>
        </div>
      </template>
    </datablau-dialog>
    <!-- 扩展属性弹窗 -->
    <datablau-dialog
      width="780px"
      :title="$t('securityModule.extendAttr')"
      :visible.sync="showUdps"
      append-to-body
      :height="480"
    >
      <udps
        :defaultUdps="udps"
        @update="updateUdps"
        @close="closeudpDialog"
      ></udps>
    </datablau-dialog>
    <!-- 信息项树节点弹窗 -->
    <datablau-dialog
      class="jobs-sta"
      width="650px"
      :title="catalogDialogTitle"
      :visible.sync="catalogDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      @close="cancelCatalog"
    >
      <datablau-form
        v-if="catalogEditable"
        :model="catalogDetails"
        :rules="catalogEditable ? rulePram : {}"
        ref="catalogForm"
        label-width="60px"
        size="mini"
        class="catalogDialog"
      >
        <el-form-item :label="$t('securityModule.name')" prop="name">
          <datablau-input
            clearable
            show-word-limit
            maxlength="100"
            size="small"
            style="width: 100%"
            v-model="catalogDetails.name"
            :placeholder="$t('securityModule.input')"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('securityModule.des')" prop="description">
          <datablau-input
            type="textarea"
            clearable
            show-word-limit
            maxlength="1000"
            size="small"
            class="item-desc"
            style="width: 100%"
            :rows="2"
            resize="none"
            v-model="catalogDetails.comment"
            :placeholder="$t('securityModule.input')"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <datablau-detail v-else :fullWidth="true" :labelWidth="'auto'">
        <el-form-item
          :label="$t('informationItems.infoName1')"
          style="width: 100%"
        >
          <span>{{ catalogDetails.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('securityModule.des')" style="width: 100%">
          <span>{{ catalogDetails.comment }}</span>
        </el-form-item>
      </datablau-detail>
      <div slot="footer">
        <datablau-button type="secondary" @click="cancelCatalog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="catalogEditable"
          type="important"
          @click="submitCatalog"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <!-- 信息项目录弹窗 -->
    <datablau-dialog
      class="jobs-sta"
      width="650px"
      :title="$t('informationItems.selectInfoName')"
      :visible.sync="itemCatalogDialogVisible"
      v-if="itemCatalogDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeItemCatalogDialog"
      :height="400"
    >
      <items-tree :clickChild="clickChild"></items-tree>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeItemCatalogDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          :disabled="!targetItemCatalog"
          type="important"
          @click="selectItemCatalog"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <!-- 删除结果提示 -->
    <datablau-dialog
      :title="$t('securityModule.tip')"
      size="s"
      :visible.sync="showDeleteTips"
    >
      <div class="tip-content">
        <div class="item">
          <template>
            <div class="title">
              <i class="el-icon-success success-icon"></i>
              {{ $t('informationItems.successNum', { num: successNum }) }}
            </div>
            <div class="title">
              <i class="el-icon-error fail-icon"></i>
              {{
                $t('informationItems.failNum', { num: deleteTipList.length })
              }}
              <span class="span-error-tip">
                （{{ $t('informationItems.delTip2') }}）
              </span>
              <div
                class="copy"
                v-copy="deleteTipList.map(item => item.name).join('；')"
              >
                {{ $t('securityModule.copy') }}
              </div>
            </div>
            <div class="error-list">
              {{ deleteTipList.map(item => item.name).join(',') }}
            </div>
          </template>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="showDeleteTips = false">
          {{ $t('securityModule.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import main from './index.js'
export default main
</script>

<style lang="scss" scoped>
@import './index.scss';
.tree-area {
  .tree-title {
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    margin-top: 8px;
    box-sizing: content-box;
    cursor: pointer;
    &:hover {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    &.tree-title-active {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    i {
      color: #409eff;
    }
    span {
      margin-left: 5px;
    }
  }
  .tree-line {
    height: 1px;
    margin: 8px 0;
    background: #efefef;
  }
}
.datablau-detail {
  /deep/ .detail-form {
    // padding: 0;
  }
}
.title-row {
  height: 40px;
  border-bottom: 1px solid #ebeef5;
  padding-top: 8px;
  padding-left: 20px;
}
#domainFolder .st-page-form {
  @media (max-width: 1525px) {
    .el-form-item__content {
      //border: 1px solid red;
      width: 110px;

      .el-input {
        width: 110px;
      }

      .el-button {
        padding: 7px 10px;
      }
    }
  }
}

.datastandard-folder-detail {
  position: relative;
  height: 100%;
  width: 100%;

  .inline-search-item {
    display: inline-block;
    margin-left: 8px;
  }

  .search-outer {
    padding: 10px 20px 0 20px;

    /deep/ .datablau-form-box .el-select.is-single {
      width: 100% !important;
    }
    /deep/ .datablau-form-box {
      // min-width: 1000px;
      display: flex;
    }
    /deep/ .datablau-form-box .list-buttons {
      // min-width: 1000px;
      display: flex;
      float: none;
      flex-shrink: 0;
    }
    /deep/ .datablau-form-box .list-search-box {
      // display: flex;
      // flex-wrap: wrap;
      flex-grow: 1;
      overflow-x: auto;
      margin-right: 0;
      // min-width: 840px;
      overflow-y: hidden;
    }

    /deep/ .datablau-form-box .list-search-box .el-form {
      // flex-grow: 1;
      min-width: 0;
    }

    /deep/ .datablau-form-box .list-search-box .el-form .el-form-item {
      //border: 1px solid red;
      margin-right: 10px;

      .el-form-item__content {
        min-width: auto;
        line-height: 30px;
      }
    }

    .more-condition-btn {
      //border: 1px solid red;
      position: absolute;
      top: 18px;
      right: 350px;

      i {
        transform: rotate(180deg);
      }
    }

    .more-fun-btn {
      margin-left: 10px;
    }
  }

  /deep/ .list-title {
    display: none;
  }

  .search-form {
    padding: 10px 0 0 20px;

    &.el-form.el-form--inline /deep/ .el-form-item {
      margin-bottom: 4px;
    }
  }

  /deep/ .form-submit {
    top: 105px;
  }

  /deep/ .row-buttons {
    text-align: left;
  }

  .left-btn {
    position: absolute;
    left: 0;
    height: 100%;
    width: 600px;
    padding-left: 20px;
    .footer-row-info {
      margin-right: 10px;
      &::before {
        margin-right: 5px;
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        line-height: 13px;
        color: white;
        vertical-align: middle;
        content: '\e6da';
      }
    }
  }

  .pagination-component {
    float: right;
  }

  .hide-btn {
    visibility: hidden;
  }

  .not-subscribe {
    i.icon-dingyue {
      color: #999;
    }
  }
}

.edit-btn {
  display: inline-block;
}

.datastandard-folder-detail.less-search-line {
  /deep/ .form-submit {
    top: 80px;
  }

  .more-condition-btn {
    i {
      transform: rotate(0deg);
    }
  }
}

/deep/ .el-list-leave-active {
  transition: none;
  opacity: 0;
}
/deep/.el-form.db-form .el-form-item:last-child {
  margin-bottom: 0;
}
</style>
<style lang="scss">
.standardImport-upload {
  .el-upload-list__item {
    font-size: 12px;
  }
  .el-upload-list {
    display: inline-block;
    vertical-align: middle;
    padding-left: 4px;
  }
  .el-upload-list__item:first-child {
    margin-top: 0;
  }
  .el-upload__tip {
    display: none;
  }
}

.el-tooltip__popper.tooltipDomain.is-dark[x-placement^='right'] {
  transform: translate(-5px, 0px);
}
.datastandard-folder-detail {
  border-top: 1px solid rgba(0, 0, 0, 0);

  .ag-root {
    // ag-grid root
    $headerHigth: 50px;

    .ag-header {
      .ag-header-row {
        .ag-header-cell {
          height: $headerHigth;
          line-height: $headerHigth;

          &::after {
            height: $headerHigth;
          }
        }
      }
    }
  }

  .circle {
    position: relative;
    bottom: 1px;
    display: inline-block;
    margin-right: 7px;
    background-color: #5cb793;
    border-radius: 3.5px;
    width: 7px;
    height: 7px;
  }
}
.more-drop-box .el-dropdown-menu__item {
  .iconfont {
    color: #999;
    font-size: 14px;
  }
  &:hover {
    color: #409eff;
    .iconfont {
      color: #409eff;
    }
  }
}
.el-popover {
  min-width: 100px;
}
.catalogDialog .el-textarea .el-input__count {
  bottom: 1px;
  right: 16px;
}
.catalogDialog .el-textarea .el-textarea__inner {
  padding-left: 10px;
  padding-right: 5px;
  padding-bottom: 20px;
}
.catalogDialog .el-form.db-form .el-textarea,
.catalogDialog .el-form.db-form .datablau-input[type='textarea'] {
  width: 100%;
}
</style>
