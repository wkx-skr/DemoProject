<!-- 数据资产 --- 资产管理 -->
<template>
  <div v-loading="loading" style="width: 100%; height: 100%">
    <!-- 目录导入结果 -->
    <datablau-dialog
      :title="$t('assets.upload.resultTitle')"
      size="s"
      :visible.sync="showCatalogueTip"
      v-if="showCatalogueTip"
    >
      <div class="tip-content" v-if="showCatalogueList.length > 0">
        <div class="item" v-for="item in showCatalogueList" :key="item.id">
          <template v-if="item.id === 'success'">
            <div class="title">
              <i class="el-icon-success success-icon"></i>
              {{ $t('assets.common.importSuccess', { num: item.data }) }}
              <!-- 导入成功共{{ item.data }}条 -->
            </div>
          </template>
          <template v-else-if="item.id === 'failed'">
            <div class="title">
              <i class="el-icon-error fail-icon"></i>
              {{ $t('assets.common.importFailed', { num: item.data }) }}
              <!-- 导入失败共{{ item.data }}条 -->
            </div>
          </template>
          <template v-else>
            <div class="title">
              <i
                class="el-icon-success success-icon"
                v-if="item.type === 'success'"
              ></i>
              <i
                class="el-icon-info same-icon"
                v-else-if="item.type === 'same'"
              ></i>
              <i class="el-icon-error fail-icon" v-else></i>
              {{ item.title }}：{{ item.data.length
              }}{{ $t('assets.upload.item') }}
              <div class="copy" v-copy="item.data.join('；')">
                {{ $t('assets.upload.copyText') }}
              </div>
            </div>
            <div class="list">
              <span v-for="(o, index) in item.data" :key="index">
                {{ item.data.length === index + 1 ? o : o + '，' }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </datablau-dialog>
    <!-- 资产导入结果提示 -->
    <datablau-dialog
      :title="$t('assets.upload.resultTitle')"
      size="l"
      :visible.sync="showTip"
      v-if="showTip"
    >
      <div class="tip-content">
        <div class="item" v-if="showList.success">
          <div class="title">
            <i class="el-icon-success success-icon"></i>
            {{ $t('assets.common.importSuccess', { num: showList.success }) }}
            <!-- 导入成功共{{ showList.success }}条 -->
          </div>
        </div>
        <div class="item" v-if="showList.failed">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.common.importFailed', { num: showList.failed }) }}
            <!-- 导入失败共{{ showList.failed }}条 -->
          </div>
        </div>
        <div
          class="item"
          v-if="Object.keys(showList.assetDuplicate).length > 0"
        >
          <div class="title">
            <i class="el-icon-info same-icon"></i>
            {{ $t('assets.upload.repeatedAssets') }}：
            <div class="copy" v-copy="copyContent(showList.assetDuplicate)">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.assetDuplicate" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>
        <div class="item" v-if="Object.keys(showList.assetNotExist).length > 0">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.noAsset') }}：
            <div class="copy" v-copy="copyContent(showList.assetNotExist)">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.assetNotExist" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>
        <div
          class="item"
          v-if="Object.keys(showList.assetNotPublish).length > 0"
        >
          <div class="title">
            <i class="el-icon-error same-icon"></i>
            {{ $t('assets.upload.unpublishedAsset') }}：
            <div class="copy" v-copy="copyContent(showList.assetNotPublish)">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.assetNotPublish" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>
        <div class="item" v-if="Object.keys(showList.catalogError).length > 0">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.errorCatalog') }}：
            <div class="copy" v-copy="copyContent(showList.catalogError)">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.catalogError" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>
        <div
          class="item"
          v-if="Object.keys(showList.systemNameError).length > 0"
        >
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.systemNameError') }}：
            <div class="copy" v-copy="copyContent(showList.systemNameError)">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.systemNameError" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>
        <div
          class="item"
          v-if="Object.keys(showList.connotAddAssetError).length > 0"
        >
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.connotAddAssetError') }}：
            <div
              class="copy"
              v-copy="copyContent(showList.connotAddAssetError)"
            >
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.connotAddAssetError" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>

        <div class="item" v-if="Object.keys(showList.managerError).length > 0">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.managerError') }}：
            <div class="copy" v-copy="copyContent(showList.managerError)">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <p v-for="(item, key) in showList.managerError" :key="key">
              <span>
                {{ setName(key) }}({{ item.length
                }}{{ $t('assets.upload.item') }})：
              </span>
              {{ item.join('，') }}
            </p>
          </div>
        </div>
        <div class="item" v-if="showList.errorMsg.length > 0">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.errorMessage') }}：
            <div class="copy" v-copy="showList.errorMsg.join('，')">
              {{ $t('assets.upload.copyText') }}
            </div>
          </div>
          <div class="list">
            <span>{{ showList.errorMsg.join('，') }}</span>
          </div>
        </div>
      </div>
    </datablau-dialog>
    <datablau-dialog
      v-if="showCatalogue"
      size="l"
      :title="catalogueTitle"
      :visible.sync="showCatalogue"
      @close="
        () => {
          close('catalogueForm')
        }
      "
      custom-class="catalog-dialog"
      style="max-height: 480px"
    >
      <el-form
        ref="catalogueForm"
        :rules="rules"
        :model="catalogueForm"
        class="catalogue-form"
        label-width="120px"
      >
        <template
          v-if="catalogueTitle === $t('assets.catalogue.changeCatalog')"
        >
          <datablau-detail-subtitle
            :title="$t('assets.catalogue.changeReason')"
            mt="0px"
            mb="10px"
          ></datablau-detail-subtitle>
          <el-form-item
            :label="$t('assets.catalogue.description')"
            prop="reason"
          >
            <datablau-input
              type="textarea"
              maxlength="100"
              :rows="2"
              show-word-limit
              resize="none"
              clearable
              :placeholder="$t('assets.catalogue.reasonRequired')"
              v-model="catalogueForm.reason"
              style="width: 100%; max-height: 100px"
            ></datablau-input>
          </el-form-item>
        </template>
        <datablau-detail-subtitle
          :title="$t('assets.catalogue.basicAttr')"
          mt="0px"
          mb="10px"
        ></datablau-detail-subtitle>
        <div class="list">
          <el-form-item :label="$t('assets.catalogue.name')" prop="name">
            <datablau-input
              :placeholder="$t('assets.catalogue.nameRequired')"
              v-model="catalogueForm.name"
              style="width: 250px"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('assets.commonHead.englishText')"
            prop="englishName"
          >
            <datablau-input
              :placeholder="$t('assets.catalogue.inputRequired')"
              v-model="catalogueForm.englishName"
              maxlength="100"
              style="width: 250px"
            ></datablau-input>
          </el-form-item>
        </div>
        <div class="list">
          <el-form-item
            :label="$t('assets.summaryInfo.approverText')"
            prop="approver"
          >
            <datablau-select
              style="width: 250px"
              v-model="catalogueForm.approver"
              filterable
              :placeholder="$t('assets.catalogue.selectRequired')"
              clearable
              remote
              :remote-method="remoteMethod"
              @focus="selectFocus(catalogueForm.approver)"
              @clear="selectFocus('')"
              v-selectLazyLoad="lazyloading"
            >
              <el-option
                v-for="item in approvalList"
                :key="item.id"
                :label="item.fullUserName + '(' + item.username + ')'"
                :value="item.username"
              ></el-option>
              <el-option
                v-if="approverLoading"
                disabled
                style="text-align: center"
              >
                加载中...
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('assets.summaryInfo.ownershipText')"
            prop="bm"
          >
            <el-select
              v-model="catalogueForm.bm"
              filterable
              remote
              reserve-keyword
              :placeholder="$t('assets.catalogue.inputRequired')"
              :remote-method="getDepartmentByKeyword"
              style="width: 187px; border-right: none"
            >
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.fullName"
                :value="item.bm"
              ></el-option>
            </el-select>
            <datablau-button
              type="secondary"
              @click="toSelectDepartment"
              class="owner-select-btn"
            >
              {{ $t('common.button.select') }}
            </datablau-button>
          </el-form-item>
        </div>

        <div class="list" style="overflow: hidden; width: 100%">
          <el-form-item
            :label="$t('assets.commonHead.keyword')"
            style="width: 100%"
          >
            <datablau-input
              :placeholder="$t('assets.catalogue.keywordRequired')"
              v-model="catalogueForm.keyword"
              show-word-limit
              maxlength="50"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
        </div>
        <el-form-item :label="$t('assets.catalogue.desc')" prop="comment">
          <datablau-input
            type="textarea"
            maxlength="200"
            :rows="5"
            show-word-limit
            resize="none"
            clearable
            :placeholder="$t('assets.catalogue.inputRequired')"
            v-model="catalogueForm.comment"
            style="width: 100%; max-height: 240px"
          ></datablau-input>
        </el-form-item>
        <!-- 扩展属性 -->
        <template v-if="udps.length">
          <div class="title-box">
            <datablau-detail-subtitle
              :title="$t('assets.catalogue.extendAttr')"
              mt="0px"
              mb="10px"
            ></datablau-detail-subtitle>
            <div class="span" v-if="hasAttrRequire">
              {{ $t('assets.catalogue.attrTip') }}
            </div>
          </div>
          <div class="list">
            <el-form-item
              v-for="(udp, index) in udps"
              :key="udp.propName"
              :label="udp.propName"
              :prop="udp.propName"
              :style="{
                float: index ? (index % 2 === 0 ? 'left' : 'right') : 'none',
              }"
            >
              <datablau-input
                v-if="udp.type === 'STRING'"
                v-model="udp.value"
                style="width: 250px"
                maxlength="255"
                :placeholder="$t('assets.catalogue.inputRequired')"
              ></datablau-input>
              <el-input-number
                v-if="udp.type === 'NUM'"
                size="small"
                v-model="udp.value"
                style="width: 250px"
              ></el-input-number>
              <datablau-select
                v-if="udp.type === 'ENUM'"
                style="width: 250px"
                v-model="udp.value"
                filterable
                :placeholder="$t('assets.catalogue.selectRequired')"
              >
                <el-option
                  v-for="item in udp.typeData.split(';')"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </div>
        </template>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="close('catalogueForm')">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="sure('catalogueForm')"
          :disabled="catalogBtnDisabled"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <add-assets-dialog
      v-if="assetDialogVisible"
      :visible="assetDialogVisible"
      :defaultProps="defaultProps"
      :type="addAssetType"
      :title="assetDialogTitle"
      :currentNode="currentNode"
      :currentStructure="currentStructure"
      :allCatalogs="allCatalogs"
      :addAsset="addAsset"
      :addedAssets="addedAssets"
      :addNodeparams="addNodeparams"
      @cancel="assetDialogVisible = false"
    ></add-assets-dialog>
    <datablau-dialog
      width="480px"
      :title="OfflineTitle"
      :visible.sync="showOfflineCatalogue"
      @close="
        () => {
          close('offlineForm')
        }
      "
    >
      <el-form ref="offlineForm" :model="offlineForm" label-width="90px">
        <!-- <el-form-item
          :label="$t('assets.catalogue.approverText')"
          prop="nameList"
        >
          <span>{{ offlineForm.nameList }}</span>
        </el-form-item> -->
        <el-form-item
          :label="OfflineReason"
          prop="reason"
          :rules="[
            {
              required: true,
              message: $t('assets.catalogue.reasonRequired'),
              trigger: 'blur',
            },
          ]"
        >
          <datablau-input
            type="textarea"
            maxlength="100"
            :rows="4"
            show-word-limit
            resize="none"
            clearable
            :placeholder="$t('assets.catalogue.reasonRequired')"
            v-model="offlineForm.reason"
            style="width: 100%; max-height: 100px"
          ></datablau-input>
        </el-form-item>
        <template v-if="!isAssetsList">
          <el-form-item
            :label="
              $t('assets.catalogue.meanwhile', {
                operate:
                  OfflineTitle === $t('assets.commonHead.publishAssetCatalog')
                    ? $t('assets.catalogue.publish')
                    : $t('assets.catalogue.offLine'),
              })
            "
            prop="assetAlong"
            :rules="[
              {
                required: true,
                message: $t('assets.catalogue.reasonRequired'),
                trigger: 'blur',
              },
            ]"
          >
            <datablau-radio v-model="offlineForm.assetAlong">
              <el-radio :label="true">
                {{ $t('assets.catalogue.yes') }}
              </el-radio>
              <el-radio :label="false">
                {{ $t('assets.catalogue.no') }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
        </template>
      </el-form>
      <!-- 可以让用户自己选择是否应用操作到子目录 -->
      <datablau-tooltip v-if="!isAssetsList" :content="underBaseLineTips">
        <datablau-checkbox
          :disabled="underBaseLineList.length !== 0"
          :checkboxType="'single'"
          v-model="offlineForm.applyToSub"
          style="margin-left: 20px; margin-top: 20px"
        >
          应用操作到子目录
        </datablau-checkbox>
      </datablau-tooltip>

      <span slot="footer">
        <datablau-button type="secondary" @click="close('offlineForm')">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="sure('offlineForm')"
          :disabled="catalogBtnDisabled"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      width="720px"
      :title="$t('assets.udp.udp')"
      :visible.sync="showExtend"
      v-if="showExtend"
    >
      <div slot="title">
        <div
          class="name"
          style="
            font-size: 16px;
            color: #555;
            font-weight: 500;
            display: inline-block;
          "
        >
          {{ $t('assets.udp.udp') }}
        </div>
        <datablau-tooltip
          style="color: #999; margin-left: 10px"
          :content="$t('assets.udp.udpTooltip')"
        >
          <i class="iconfont icon-tips"></i>
        </datablau-tooltip>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close('extendForm')">
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      size="m"
      :title="importTitle"
      :visible.sync="showImport"
      v-if="showImport"
    >
      <div class="import-box">
        <div class="mask" v-if="uploadLoading" v-loading="uploadLoading"></div>
        <p v-if="isCatalog">
          {{ $t('assets.upload.tip1') }}
        </p>
        <p v-else style="white-space;: pre-line">
          {{ $t('assets.upload.tip2') }}
        </p>
        <div class="radio-box">
          <div
            class="radio-content"
            :class="{ 'radio-select': isProcess }"
            @click="radioClick(true)"
          >
            <div class="title">{{ $t('assets.upload.needPublish') }}</div>
            <div class="radio-info" v-if="isCatalog">
              {{ $t('assets.upload.uploadTip1') }}
            </div>
            <div class="radio-info" v-else>
              {{ $t('assets.upload.uploadTip2') }}
            </div>
          </div>
          <div style="width: 10px; display: table-cell"></div>
          <div
            class="radio-content"
            :class="{ 'radio-select': !isProcess }"
            @click="radioClick(false)"
          >
            <div class="title">{{ $t('assets.upload.directPublish') }}</div>
            <div class="radio-info" v-if="isCatalog">
              {{ $t('assets.upload.publishTip1') }}
            </div>
            <div class="radio-info" v-else>
              {{ $t('assets.upload.publishTip2') }}
            </div>
          </div>
        </div>
        <div class="upload-box">
          <div class="upload-tip">
            {{ $t('assets.upload.fileTypeTip') }}
          </div>
          <datablau-button
            style="float: right; margin-right: -8px"
            type="text"
            @click="asstesTemplate"
          >
            {{ $t('assets.upload.download') }}
          </datablau-button>
          <datablau-upload
            :isEdit="true"
            style="margin-top: 10px"
            :action="action"
            :show-file-list="true"
            :before-remove="handleRemove"
            :on-change="handleChange"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :accept="'.xlsx,.csv'"
            :auto-upload="false"
            ref="assetsUpload"
            class="assets-import-upload"
            :name="actionName"
          >
            <slot>
              <datablau-button type="secondary">
                <i class="iconfont icon-upload" style="margin-right: 6px"></i>
                <span>{{ $t('assets.upload.uploadFile') }}</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close('importForm')">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="sure('importForm')">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <processDetail v-if="showProcess" ref="processDetail"></processDetail>
    <div class="directory-tree">
      <directory-tree
        ref="manageTree"
        show-checkbox
        :allCatalogs="allCatalogs"
        :currentNode="currentNode"
        :structureList="structureList"
        @node-click="handleNodeClick"
        @delete="deleteDir"
        :editable="true"
        :clickNode="clickNode"
        :authFunction="authFunction"
        :curStructureId="curStructureId"
        :getSubCatalog="getSubCatalog"
        :pageId="0"
      ></directory-tree>
    </div>
    <div class="resize-column-middle"></div>
    <div v-if="currentNode && currentNode.id" class="directory-content">
      <div class="datablau-breadcrumb-header" style="padding-left: 0">
        <div>
          <datablau-breadcrumb
            :showBack="false"
            :nodeData="breadcrumbNodes"
            @nodeClick="handleNodeClick"
            @back="goBack"
          ></datablau-breadcrumb>
        </div>
      </div>
      <top-base-info
        :editable="true"
        :clickNode="clickNode"
        :baseInfo="baseInfo"
      ></top-base-info>
      <datablau-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane
          :label="$t('assets.summaryInfo.title')"
          name="first"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.assetList.title')"
          name="second"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.knowledgeGraph.title')"
          name="third"
        ></el-tab-pane>
        <el-tab-pane
          v-if="currentNode.authType === 'MANAGER'"
          :label="$t('assets.permissionSettings.title')"
          name="fourth"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.history.title')"
          name="fifth"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.version.title')"
          name="sixth"
        ></el-tab-pane>
      </datablau-tabs>
      <summary-info
        v-if="activeName === 'first'"
        :editable="
          currentNode.authType === 'MANAGER' || currentNode.authType === 'EDIT'
        "
        :clickNode="clickNode"
        :currentNode="currentNode"
        :summaryInfo="summaryInfo"
        :topH="topH"
        :authFunction="authFunction"
        :authTooltip="authTooltip"
        :pageId="0"
      ></summary-info>
      <assets-list
        v-if="activeName === 'second'"
        ref="assetsList"
        :type="0"
        :assetsType="subAssetsType"
        :clickNode="clickNode"
        :id="currentNode.id"
        :currentNode="currentNode"
        :breadcrumbNodes="breadcrumbNodes"
        :treeData="curtreeData"
        :topH="topH"
      ></assets-list>
      <knowledgeGraphBox
        v-if="activeName === 'third'"
        :topH="topH"
        :currentNode="currentNode"
        permission="manage"
      ></knowledgeGraphBox>
      <PermissionSettings
        :topH="topH"
        v-if="activeName === 'fourth'"
        :currentNode="currentNode"
      ></PermissionSettings>
      <div
        class="logMana"
        :style="{ top: topH + 84 + 'px' }"
        v-if="activeName === 'fifth'"
      >
        <logManage
          pageFrom="history"
          :currentNode="currentNode"
          condition="condition"
        ></logManage>
      </div>
      <div
        class="version-record"
        v-if="activeName === 'sixth'"
        :style="{ top: topH + 84 + 'px' }"
      >
        <version-record :catalogId="currentNode.id"></version-record>
      </div>
    </div>
    <div
      v-else-if="currentStructure && currentStructure.id"
      class="directory-content"
    >
      <structure-details
        :structureInfo="currentStructure.structureDto"
        :isManager="currentStructure.structureManager"
        :structureIndex="currentStructure.index"
        :clickNode="clickNode"
      ></structure-details>
    </div>
    <div v-else-if="!loading" class="directory-content">
      <template v-if="structureList.length">
        <datablau-null
          :tip="
            $t('assets.catalogue.noPermission', {
              name: `[${$t('assets.catalogue.catalog')}]`,
              type: $t('assets.catalogue.access'),
            })
          "
          style="width: 160px; margin-top: 20%; margin-left: calc(50% - 80px)"
        ></datablau-null>
      </template>
      <template v-else>
        <datablau-null
          :tip="$t('assets.catalogue.noAssets')"
          style="width: 160px; margin-top: 20%; margin-left: calc(50% - 80px)"
        ></datablau-null>
      </template>
    </div>
  </div>
</template>

<script>
import index from './index'
export default index
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.assets-import-upload {
  /deep/ .datablau-upload {
    .el-upload__tip {
      display: none;
    }
    .el-upload-list {
      display: inline-block;
      vertical-align: middle;
      padding-left: 6px;
      .el-upload-list__item {
        margin-top: 0;
        vertical-align: middle;
        .el-icon-close {
          display: inline-block;
        }
      }
      &:hover {
        .el-icon-close {
          display: inline-block;
          color: #409eff;
        }
      }
    }
    .is-block.secondary {
      .icon-upload {
        color: #999;
      }
      &:hover {
        .icon-upload {
          color: #409eff;
        }
      }
    }
  }
}
.import-box {
  .mask {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /deep/ .el-loading-mask {
      &:after {
        content: '上传中...';
        left: calc(50% -18px);
      }
    }
  }
  p {
    font-size: 12px;
    color: #555555;
    padding-top: 6px;
    padding-bottom: 16px;
  }
  .radio-box {
    height: 90px;
    margin-bottom: 20px;
    display: table;
    &:after {
      content: '';
      clear: both;
      display: block;
    }
    .radio-content {
      display: table-cell;
      // float: left;
      width: 295px;
      cursor: pointer;
      background: #fff;
      border: 1px solid $border-color;
      border-radius: 2px;
      padding: 10px 16px;
      box-sizing: border-box;
      &:nth-of-type(2) {
        margin-left: 10px;
      }
      &.radio-select {
        border: 1px solid #409eff;
        .title,
        .radio-info {
          color: #409eff;
        }
      }
      &:hover {
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      }
      .title {
        font-size: 14px;
        color: #555;
        padding-bottom: 4px;
        font-weight: 600;
      }
      .radio-info {
        font-size: 12px;
        color: #555;
        line-height: 18px;
      }
    }
  }
  .upload-box {
    background: #f7f9fb;
    border-radius: 4px;
    padding: 16px;
    .upload-tip {
      font-size: 12px;
      color: $text-message;
      padding-bottom: 16px;
      display: inline-block;
    }
  }
}
/deep/ label[for='assetAlong'] {
  line-height: 17px;
}
/deep/ .el-input__suffix-inner {
  i {
    line-height: 34px;
  }
}
/deep/ .datablau-input .el-textarea__inner {
  padding: 5px 10px;
  padding-bottom: 20px;
}
/deep/ .el-textarea .el-input__count {
  bottom: 1px;
}
.resize-column-middle {
  left: 240px;
  top: 0;
  background-color: transparent;
  width: 10px;
  z-index: 8;
}
.directory-tree {
  position: absolute;
  left: 0;
  width: 240px;
  top: 0;
  bottom: 0;
}
.directory-content {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 240px;
  padding: 10px 20px;
  padding-top: 0;
  background-color: #fff;

  .base-info {
    margin-top: 10px;
  }
  /deep/ .datablau-tabs {
    .el-tabs__content {
      .el-tab-pane {
        padding: 0;
        padding-top: 10px;
      }
    }
  }

  .el-tab-pane {
    padding: 0;
  }
  .container-tab >>> .el-tabs__content {
    flex-grow: 1;
    overflow-y: scroll;
  }
}
.catalogue-form {
  .list {
    &:after {
      content: '';
      clear: both;
      display: block;
    }
    /deep/ .el-form-item {
      &:last-child {
        float: right;
      }
      display: inline-block;
      margin-bottom: 14px;
      .el-form-item__content {
        // display: inline-block;
      }
      // .el-form-item__label {
      //   overflow: hidden;
      //   text-overflow: ellipsis;
      //   white-space: nowrap;
      // }
    }
    .el-input__icon {
      line-height: 34px;
    }
  }
  .title-box {
    .span {
      margin-left: 10px;
      color: #f56c6c;
      font-size: 12px;
      display: inline-block;
    }
  }
  .owner-select-btn {
    line-height: 32px;
    height: 34px;
    // border-left: none;
    &:hover {
      border-left: 1px solid #409eff;
    }
  }
}
.logMana {
  position: absolute;
  top: 168px;
  bottom: 0;
  left: 0;
  right: 0;
}
.version-record {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
.import-content {
  .mask {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /deep/ .el-loading-mask {
      &:after {
        content: '上传中...';
        left: calc(50% -18px);
      }
    }
  }
  .title-box {
    height: 14px;
    line-height: 14px;
    color: $text-message;
    strong {
      color: $text-default;
      // font-weight: 500;
    }
    span {
      color: $primary-color;
      cursor: pointer;
    }
  }
  /deep/ .datablau-upload {
    width: 100%;
    .upload-demo {
      width: 100%;
      .el-upload {
        width: 100%;
        .el-upload-dragger {
          width: 200px;
          height: 100px;
          .el-upload__text {
            font-size: 12px;
          }
        }
        .el-icon-upload {
          margin: 15px 0 10px;
          font-size: 42px;
          line-height: 38px;
        }
      }

      .el-upload__tip {
        margin-top: 10px;
        color: #777;
      }
      .el-upload-list {
        .el-upload-list__item {
          height: 30px;
          line-height: 30px;
          background: $read-only;
          .el-upload-list__item-name {
            color: $primary-color;
          }
          .el-icon-close {
            top: 8px;
          }
          .el-progress {
            display: none;
          }
        }
      }
    }
  }
}
.tip-content {
  .title {
    line-height: 30px;
    color: #555555;
    font-weight: 600;
    i {
      font-size: 24px;
      vertical-align: middle;
      margin-right: 6px;
      margin-left: 0;
      &.success-icon {
        color: #66bf16;
      }
      &.same-icon {
        color: #e6ad00;
      }
      &.fail-icon {
        color: #ff4b53;
      }
    }
    .copy {
      float: right;
      padding: 5px 10px;
      color: #409eff;
      cursor: pointer;
      font-weight: normal;
      height: 30px;
      line-height: 30px;
    }
  }
  .list {
    margin-bottom: 6px;
    margin-top: 6px;
    height: 120px;
    padding: 8px 10px;
    box-sizing: border-box;
    background: #f5f5f5;
    color: #555555;
    overflow-y: auto;
    p {
      line-height: 24px;
    }
    span {
      // margin-right: 10px;
    }
  }
}
</style>
<style>
.datablau-option {
  max-width: 99vw;
}
.catalog-dialog {
  max-height: 605px !important;
}
</style>
