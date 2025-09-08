<!-- 数据资产 --- 资产管理 -->
<template>
  <div v-loading="loading" style="width: 100%; height: 100%">
    <!-- 目录导入结果 -->
    <datablau-dialog
      :title="$t('assets.upload.assetsBindTitle')"
      size="s"
      :height="242"
      :visible.sync="showBind"
      v-if="showBind"
    >
      <div class="tip-content">
        <div class="item">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('assets.upload.bindError') }}：
          </div>
          <div class="list">
            <p>
              {{ bindFailList.join('，') }}
            </p>
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
        label-width="140px"
      >
        <template
          v-if="catalogueTitle === $t('assets.catalogue.changeCatalog')"
        >
          <datablau-detail-subtitle
            :title="$t('assets.catalogue.applyReason')"
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
          v-if="
            udps.length ||
            catalogueTitle === $t('assets.catalogue.changeCatalog')
          "
          :title="$t('assets.catalogue.basicAttr')"
          mt="0px"
          mb="10px"
        ></datablau-detail-subtitle>
        <div class="list">
          <el-form-item :label="nameMap[catalogueForm.level]" prop="name">
            <datablau-input
              :placeholder="$t('assets.catalogue.inputRequired')"
              v-model="catalogueForm.name"
              style="width: 240px"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="englishMap[catalogueForm.level]"
            prop="englishName"
          >
            <datablau-input
              :placeholder="$t('assets.catalogue.inputRequired')"
              v-model="catalogueForm.englishName"
              maxlength="100"
              style="width: 240px"
            ></datablau-input>
          </el-form-item>
        </div>
        <div class="list">
          <!-- <el-form-item
            :label="$t('assets.catalogue.approverText')"
            prop="approver"
            v-if="catalogueForm.level === 1"
          >
            <datablau-select
              style="width: 240px"
              v-model="catalogueForm.approver"
              filterable
              :placeholder="$t('assets.catalogue.selectRequired')"
              clearable
              remote
              :remote-method="remoteMethod"
              @visible-change="selectFocus('')"
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
                {{ $t('assets.catalogue.loadingText') }}
              </el-option>
            </datablau-select>
          </el-form-item> -->
          <!-- <el-form-item :label="$t('assets.catalogue.ownershipText')" prop="bm">
            <datablau-select
              v-model="catalogueForm.bm"
              filterable
              remote
              reserve-keyword
              :placeholder="$t('assets.catalogue.inputRequired')"
              :remote-method="getDepartmentByKeyword"
              style="width: 214px; border-right: none; display: inline-block"
            >
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.fullName"
                :value="item.bm"
              ></el-option>
            </datablau-select>
            <datablau-button
              type="icon"
              @click="toSelectDepartment"
              class="owner-select-btn iconfont icon-tianjia"
            >
            </datablau-button>
          </el-form-item> -->
          <!-- <el-form-item
            :label="$t('assets.catalogue.dataSteward')"
            prop="butler"
          >
            <datablau-select
              style="width: 240px"
              v-model="catalogueForm.butler"
              filterable
              :placeholder="$t('assets.catalogue.selectRequired')"
              clearable
              remote
              :remote-method="remoteMethod"
              @visible-change="selectButlerFocus('')"
              @clear="selectButlerFocus('')"
              v-selectLazyLoad="butlerLazyloading"
            >
              <el-option
                v-for="item in butlerList"
                :key="item.id"
                :label="item.fullUserName + '(' + item.username + ')'"
                :value="item.username"
              ></el-option>
              <el-option
                v-if="butlerLoading"
                disabled
                style="text-align: center"
              >
                {{ $t('assets.catalogue.loadingText') }}
              </el-option>
            </datablau-select>
          </el-form-item> -->
          <el-form-item
            :label="'业务域编码'"
            prop="code"
            v-if="catalogueForm.level === 1"
          >
            <datablau-input
              :placeholder="$t('assets.catalogue.inputRequired')"
              v-model="catalogueForm.code"
              style="width: 240px"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
        </div>

        <!-- <div class="list" style="overflow: hidden; width: 100%">
          <el-form-item
            :label="$t('assets.commonHead.keyword')"
            style="width: 100%"
          >
            <datablau-input
              :placeholder="$t('assets.catalogue.keywordRequired')"
              v-model="catalogueForm.keyword"
              show-word-limit
              maxlength="100"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
        </div> -->
        <el-form-item :label="commentMap[catalogueForm.level]" prop="comment">
          <datablau-input
            type="textarea"
            maxlength="1000"
            :rows="5"
            show-word-limit
            resize="none"
            clearable
            :placeholder="$t('assets.catalogue.inputRequired')"
            v-model="catalogueForm.comment"
            style="width: 100%; max-height: 100px"
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
                style="width: 240px"
                maxlength="255"
                :placeholder="$t('assets.catalogue.inputRequired')"
              ></datablau-input>
              <el-input-number
                v-if="udp.type === 'NUM'"
                size="small"
                v-model.number="udp.value"
                @change="handleNumChange(udp.propName)"
                style="width: 240px"
              ></el-input-number>
              <datablau-select
                v-if="udp.type === 'ENUM'"
                style="width: 240px"
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
      :bindTip="bindTip"
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
        <!-- <template
          v-if="
            !isAssetsList &&
            OfflineTitle !== $t('assets.commonHead.publishAssetCatalog')
          "
        >
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
        </template> -->
      </el-form>
      <!-- 可以让用户自己选择是否应用操作到子目录 -->
      <datablau-tooltip v-if="!isAssetsList" :content="underBaseLineTips">
        <datablau-checkbox
          :disabled="underBaseLineList.length !== 0"
          :checkboxType="'single'"
          v-model="offlineForm.applyToSub"
          style="margin-left: 20px; margin-top: 20px"
        >
          {{ $t('assets.catalogue.applyToChildren') }}
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
        <!-- <p v-if="isCatalog">
          {{ $t('assets.upload.tip1') }}
        </p>
        <p v-else style="white-space;: pre-line">
          {{ $t('assets.upload.tip2') }}
        </p> -->
        <!-- <div class="radio-box">
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
        </div> -->
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
            :data="isCatalog ? '' : uploadData"
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
      <div
        style="
          height: 100%;
          width: 100%;
          min-width: 950px;
          overflow-x: auto;
          overflow-y: hidden;
          position: relative;
        "
      >
        <div class="datablau-breadcrumb-header">
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
          :editable="
            currentNode.authType === 'MANAGER' ||
            currentNode.authType === 'EDIT'
          "
          :clickNode="clickNode"
          :baseInfo="baseInfo"
        ></top-base-info>
        <datablau-tabs
          class="now-tabs"
          v-model="activeName"
          @tab-click="handleClick"
        >
          <el-tab-pane
            :label="$t('assets.summaryInfo.title')"
            name="first"
          ></el-tab-pane>
          <el-tab-pane
            :label="$t('assets.assetList.title')"
            name="second"
          ></el-tab-pane>
          <el-tab-pane
            v-if="$versionFeature.graph_KnowledgeGraph"
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
            currentNode.authType === 'MANAGER' ||
            currentNode.authType === 'EDIT'
          "
          :clickNode="clickNode"
          :currentNode="currentNode"
          :summaryInfo="summaryInfo"
          :topH="topH"
          :authFunction="authFunction"
          :authTooltip="authTooltip"
          :pageId="0"
          :isNull="baseInfo.isNull"
          :baseInfo="baseInfo.baseInfo"
        ></summary-info>
        <assets-list
          v-if="activeName === 'second'"
          ref="assetsList"
          :type="0"
          :assetsType="subAssetsType"
          :clickNode="clickNode"
          :editable="
            currentNode.authType === 'MANAGER' ||
            currentNode.authType === 'EDIT'
          "
          :id="currentNode.id"
          :currentNode="currentNode"
          :breadcrumbNodes="breadcrumbNodes"
          :treeData="curtreeData"
          :topH="topH"
        ></assets-list>
        <knowledgeGraphBox
          v-if="activeName === 'third'"
          :editable="
            currentNode.authType === 'MANAGER' ||
            currentNode.authType === 'EDIT'
          "
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
    </div>
    <div
      v-else-if="currentStructure && currentStructure.id"
      class="directory-content"
    >
      <structure-details
        ref="structureDetails"
        :structureInfo="currentStructure"
        :isManager="currentStructure.isStructureManager"
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
  max-height: 110px;
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
  // padding: 10px 16px;
  // padding-top: 0;
  background-color: #fff;
  overflow-x: auto;
  overflow-y: hidden;
  .datablau-breadcrumb-header {
    padding-left: 16px;
    padding-right: 16px;
  }
  .top-base-info-page {
    padding: 20px 16px;
  }
  .now-tabs {
    padding: 0 16px;
  }

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
        // float: right;
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
    // line-height: 32px;
    vertical-align: top;
    height: 32px !important;
    line-height: 30px !important;
    width: 34px;
    border: 1px solid #ddd;
    border-left: 0;
    color: #999;
    box-sizing: border-box;
    // border-left: none;
    &:hover {
      color: #409eff;
      border: 1px solid #409eff;
      border-left: 0;
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
  max-width: 560px;
}
.catalog-dialog {
  max-height: 605px !important;
}
</style>
