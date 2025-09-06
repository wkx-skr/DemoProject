<template>
  <div class="codePage standard-code-page">
    <datablau-dialog
      size="xl"
      :title="$t('domain.common.upd')"
      :visible.sync="showUdps"
      append-to-body
      :height="400"
    >
      <udps
        v-if="showUdps"
        :categoryTypeId="typeIds"
        @getUdps="getUdps"
        @closeUdpDialog="showUdps = false"
        :standardCode="true"
      ></udps>
    </datablau-dialog>
    <datablau-dialog
      size="l"
      append-to-body
      :title="$t('domain.code.importCode')"
      :height="500"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <p
        style="
          font-size: 12px;
          color: #555555;
          padding-top: 6px;
          padding-bottom: 16px;
        "
      >
        {{ $t('domain.code.importRules') }}
      </p>
      <div
        class="elRadioSelectBox"
        :class="{ 'en-radio-page': $i18n.locale === 'en' }"
      >
        <div
          class="elRadioSelect"
          :class="{ elRadioSelectActive: isUploadPublishedStandard === false }"
          @click="elRadioSelect(false)"
        >
          <div class="elRadioSelectCont">
            <h3>{{ $t('domain.code.contentModeration') }}</h3>
            <p>
              {{ $t('domain.code.needAudit') }}
            </p>
          </div>
        </div>
        <div
          class="elRadioSelect"
          :class="{
            elRadioSelectActive: isUploadPublishedStandard === true,
            elRadioSelectdisabled:
              $auth['STANDARD_CODE_IMPORT_DIRECT'] === undefined,
          }"
          @click="elRadioSelect(true)"
        >
          <div class="elRadioSelectCont">
            <h3>{{ $t('domain.code.autoPublished') }}</h3>
            <p>{{ $t('domain.code.notAudit') }}</p>
            <br />
          </div>
        </div>
      </div>
      <div class="uploadContent">
        <p class="uploadtip">{{ $t('domain.code.uploadTooltip') }}</p>
        <datablau-button
          style="float: right; margin-right: -8px"
          type="text"
          @click="codeownload"
        >
          {{ $t('domain.common.downloadTemp') }}
        </datablau-button>
        <datablau-upload
          :action="standardUploadUrl"
          :before-upload="showBegain"
          :on-error="handleUploadError"
          :on-success="handleUploadSuccess"
          :show-file-list="true"
          :on-change="onChange"
          :before-remove="beforeRemove"
          accept=".xlsx"
          :headers="$headers"
          ref="standardCodeImport"
          :isEdit="true"
          :limit="1"
          :auto-upload="false"
          class="code-upload-component"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>{{ $t('domain.common.uploadFile') }}</span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
        <div class="autoCode" v-if="useDam && typeIds === 1">
          <datablau-switch
            v-model="autoCode"
            :disabled="!autoCodeDisabled"
            style="display: inline-block; margin-right: 8px"
          ></datablau-switch>

          <span
            style="margin-right: 2px; color: #555"
            :style="{ color: autoCode ? '#409eff' : '#555555' }"
          >
            {{ $t('domain.code.autoCreateCode') }}
          </span>
          <el-tooltip placement="right" effect="dark" class="tooltipDomain">
            <i class="iconfont icon-tips"></i>
            <div style="width: 350px" slot="content">
              {{ $t('domain.code.autoCreateCodeTooltip') }}
            </div>
          </el-tooltip>
        </div>
      </div>
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
            <el-tooltip placement="right" effect="dark" class="tooltipDomain">
              <i class="iconfont icon-tips"></i>
              <p
                style="
                  white-space: pre-line;
                  padding-left: 0px;
                  line-height: 1.2;
                  margin-left: 6px;
                "
                  slot="content"
              >
                {{ $t('common.export.exportTip') }}
              </p>
            </el-tooltip>
          </span>
        </div>
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
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <el-dialog
      :title="$t('domain.code.importCode')"
      v-if="$isIE"
      :visible.sync="dialogIEUploadVisible"
      width="400px"
      append-to-body
    >
      <form
        :action="uploadHost"
        method="post"
        class="IE-upload"
        enctype="multipart/form-data"
        target="nm_iframe"
      >
        <input
          type="file"
          name="file"
          :value="$t('domain.common.selectFile')"
        />
        <el-button size="mini" @click="handleIEUpload">
          <input
            id="id_submit"
            name="nm_submit"
            type="submit"
            @click="handleIEUpload"
            :value="$t('domain.common.upload')"
          />
        </el-button>
      </form>
      <iframe id="id_iframe" name="nm_iframe" style="display: none"></iframe>
    </el-dialog>
    <datablau-upload
      style="display: none"
      :action="uploadHost"
      :before-upload="showBegain"
      :on-error="handleUploadError"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :isEdit="true"
      accept=".xlsx"
      :headers="$headers"
      ref="standardCodeImport"
      class="code-upload-component"
    >
      <datablau-button class="code-upload-btn"></datablau-button>
    </datablau-upload>
    <div class="tree-area" v-if="showList">
      <tree-catalogue
        ref="treeCatalog"
        @itemClick="treeNodeClick"
      ></tree-catalogue>
    </div>
    <div class="tree-area-margin-right"></div>
    <div class="content-area" v-if="showList">
      <code-list
        ref="codeList"
        :currentCatalog="currentCatalog"
        :typeIds="typeIds"
        :useWorkflow="useWorkflow"
        @openCode="handleNodeClick"
        @openEdit="handleEditNode"
        @add="handleAddCode"
        @codeownload="codeownload"
        @codeFildDownload="codeFildDownload"
        @uploadCodeFile="uploadCodeFile"
        @openUdp="openUdp"
        @editSuccess="editSucess"
        class="code-folder-list"
        :hasEditAuth="hasEditAuth"
      ></code-list>
    </div>
    <div class="detail-content" v-if="currentTab !== 'list'">
      <div class="breadcrumb-line top-back-line">
        <datablau-breadcrumb
          style="height: auto; line-height: initial; display: inline-block"
          :node-data="nodeData"
          @back="backToFolder"
          @nodeClick="nodeClick"
        ></datablau-breadcrumb>
      </div>
      <div class="content-container content-box">
        <div class="detail-tab code-tab" v-if="currentTab === 'details'">
          <div class="detail-outer">
            <div class="top-container">
              <div class="left-info">
                <div class="code-icon">
                  <datablau-icon
                    data-type="daima"
                    :isIcon="true"
                    :size="48"
                  ></datablau-icon>
                </div>
                <div class="code-name-info">
                  <div class="info-outer">
                    <p class="code-en-name">{{ detailData.code }}</p>
                    <p class="code-name">
                      <span class="info-label">
                        {{ $t('domain.code.cName') }}：
                      </span>
                      {{ detailData.name }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="right-info">
                <div
                  class="right-btn"
                  v-if="
                    useWorkflow &&
                    !Boolean($route.query.isAssets) &&
                    headerProduction.toUpperCase() === 'DAM' &&
                    hasEditAuth
                  "
                >
                  <!-- <datablau-button
                    type="secondary"
                    @click="handleDelete"
                    v-if="
                      detailData.state === 'D' && $auth['STANDARD_CODE_DELETE']
                    "
                  >
                    {{ $t('common.button.delete') }}
                  </datablau-button> -->
                  <!-- <datablau-button
                    type="secondary"
                    @click="handlePublish()"
                    v-if="
                      detailData.state === 'D' &&
                      ($auth['STANDARD_CODE_RELEASE'] ||
                        $auth['ROLE_STANDARD_CODE_PUBLISH'])
                    "
                  >
                    {{ $t('domain.common.publish') }}
                  </datablau-button> -->
                  <!-- <datablau-button
                    type="secondary"
                    @click="handleAbandon()"
                    v-if="
                      detailData.state === 'A' &&
                      ($auth['STANDARD_CODE_SCRAP'] ||
                        $auth['ROLE_STANDARD_CODE_DISCARD'])
                    "
                  >
                    {{ $t('domain.common.discard') }}
                  </datablau-button> -->
                  <datablau-button
                    type="primary"
                    @click="handleEdit"
                    v-if="
                      detailData.state === 'D' && $auth['STANDARD_CODE_EDIT']
                    "
                  >
                    {{ $t('domain.common.edit') }}
                  </datablau-button>
                  <!-- <datablau-button
                    type="primary"
                    @click="handleEdit(false)"
                    v-if="
                      detailData.state === 'A' &&
                      ($auth['STANDARD_CODE_UPDATA'] ||
                        $auth['ROLE_STANDARD_CODE_CHANGE'])
                    "
                  >
                    {{ $t('domain.common.change') }}
                  </datablau-button> -->
                </div>
                <div
                  class="right-btn"
                  v-if="
                    !useWorkflow &&
                    headerProduction.toUpperCase() === 'DAM' &&
                    hasEditAuth &&
                    !Boolean($route.query.isAssets)
                  "
                >
                  <!-- <datablau-button
                    type="secondary"
                    @click="handleDelete"
                    v-if="detailData.state === 'D'"
                  >
                    {{ $t('common.button.delete') }}
                  </datablau-button> -->
                  <!-- <datablau-button
                    type="secondary"
                    @click="handlePublish($t('domain.code.domain'))"
                    v-if="
                      detailData.state === 'D' &&
                      ($auth['STANDARD_CODE_RELEASE'] ||
                        $auth['ROLE_STANDARD_CODE_PUBLISH'])
                    "
                  >
                    {{ $t('domain.common.publish') }}
                  </datablau-button> -->
                  <!-- <datablau-button
                    type="secondary"
                    @click="handleAbandon($t('domain.code.domain'))"
                    v-if="
                      detailData.state === 'A' &&
                      ($auth['STANDARD_CODE_SCRAP'] ||
                        $auth['ROLE_STANDARD_CODE_DISCARD'])
                    "
                  >
                    {{ $t('domain.common.discard') }}
                  </datablau-button> -->
                  <datablau-button
                    type="primary"
                    @click="handleEdit"
                    v-if="detailData.state === 'D'"
                  >
                    {{ $t('domain.common.edit') }}
                  </datablau-button>
                  <!-- <datablau-button
                    type="primary"
                    @click="handleEdit(false)"
                    v-if="
                      detailData.state === 'A' &&
                      ($auth['STANDARD_CODE_UPDATA'] ||
                        $auth['ROLE_STANDARD_CODE_CHANGE'])
                    "
                  >
                    {{ $t('domain.common.change') }}
                  </datablau-button> -->
                </div>
                <!-- <div class="ref-count domain-reference-count">
                  <p class="description-line">
                    {{ $t('domain.code.domainReference') }}
                    <datablau-tooltip
                      :content="$t('domain.code.domainReferenceCount')"
                      placement="top"
                    >
                      <i class="iconfont icon-tips"></i>
                    </datablau-tooltip>
                  </p>
                  <p class="count-line">
                    <span class="count">{{ refDomainCount }}</span>
                    {{ $t('domain.code.times') }}
                  </p>
                </div> -->
                <!-- <div class="ref-count domain-reference-count" v-if="useDdm">
                  <p class="description-line">
                    {{ $t('domain.code.fieldReference') }}
                    <datablau-tooltip
                      :content="$t('domain.code.fieldReferenceCount')"
                      placement="top"
                    >
                      <i class="iconfont icon-tips"></i>
                    </datablau-tooltip>
                  </p>
                  <p class="count-line">
                    <span class="count">{{ refColCount }}</span>
                    {{ $t('domain.code.times') }}
                  </p>
                </div> -->
              </div>
            </div>
            <div class="detail-tab-outer">
              <datablau-tabs v-model="currentDetailTab">
                <el-tab-pane
                  :label="$t('domain.code.codeInfoTab')"
                  name="codeData"
                >
                  <div class="detail-tab">
                    <code-detail-tab
                      ref="codeDetailTab"
                      :useWorkflow="useWorkflow"
                      :hasEditAuth="hasEditAuth"
                      @openEdit="handleEditNode"
                      @handleShowDomRef="handleShowDomRef"
                      @handleShowColRef="handleShowColRef"
                      @handleShowHistory="handleShowHistory"
                      @handleShowMetaQuote="handleShowMetaQuote"
                      @getDetailData="getDetailData"
                      @freshCode="freshCode"
                      @setPath="setPath"
                      :udps="udps"
                    ></code-detail-tab>
                  </div>
                </el-tab-pane>
                <el-tab-pane
                  :label="$t('domain.common.dataStandard')"
                  name="domainReference"
                >
                  <domain-reference
                    :codeData="detailData"
                    @getDomainCount="getDomainCount"
                  ></domain-reference>
                </el-tab-pane>
                <!--                <el-tab-pane
                  :label="$t('domain.code.modelReferenceTab')"
                  name="referCol"
                  v-if="useDdm"
                >
                  <refer-col
                    :codeData="detailData"
                    @getColCount="getColCount"
                  ></refer-col>
                </el-tab-pane>-->
                <!--                <el-tab-pane
                  style="
                    position: absolute;
                    top: 34px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                  "
                  :label="$t('domain.code.metadataReference')"
                  name="metaQuote"
                  v-if="typeIds === 1 && useDam"
                >
                  <meta-quote :codeData="detailData"></meta-quote>
                </el-tab-pane>-->
                <el-tab-pane
                  :label="$t('domain.code.historyTab')"
                  name="history"
                >
                  <code-history
                    :codeDataCode="detailData.realCode"
                  ></code-history>
                </el-tab-pane>
              </datablau-tabs>
            </div>
          </div>
        </div>
        <div class="detail-tab add-code-tab" v-if="currentTab === 'editCode'">
          <edit-code-detail
            :isEdit="currentData.name !== 'addCode'"
            :row="currentData.oldData"
            @removetab="handleTabRemove(currentData.name)"
            @editSucess="editSucess"
            v-if="currentData.type === 'code'"
            :key="currentData.name"
            :useWorkflow="useWorkflow"
            :udps="udps"
            :foldId="foldId"
            @setPath="setPath"
            :tree-data="treeData"
          ></edit-code-detail>
        </div>
        <div class="detail-tab history-tab" v-if="currentTab === 'history'">
          <code-history
            v-if="currentTab === 'history' && item.name === 'history'"
            :codeDataCode="currentData.code"
          ></code-history>
        </div>
        <div class="detail-tab reference-tab" v-if="currentTab === 'reference'">
          <domain-reference
            :codeData="currentData.data"
            v-if="currentTab === 'domainReference'"
          ></domain-reference>
        </div>
        <div class="detail-tab refer-tab" v-if="currentTab === 'refer'">
          <refer-col
            :codeData="currentData.data"
            v-if="currentTab === 'referCol'"
          ></refer-col>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import code from './code.js'

export default code
</script>
<style lang="scss">
.code-upload-component {
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
</style>
<style lang="scss" scoped="scoped">
@import './code.scss';
$border-text: 1px solid #aaa;
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.codePage {
  .tree-area {
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .code-in-tree {
    $tableLineHeight: 38px;
    font-size: 14px;

    .node-line {
      position: relative;
      display: inline-block;
      line-height: 28px;
      width: 100%;

      .code-value {
        display: inline-block;
        margin-top: 10px;
      }

      .flex-container {
        position: absolute;
        left: 100px;
        right: 150px;
        top: 0;
        bottom: 0;
      }
    }

    .node-control {
      float: right;
      margin-right: 20px;
      margin-top: 10px;
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background-color: #d1e5ff;
    }

    .el-tree-node__content {
      height: $tableLineHeight;

      .code-value {
        width: 14%;
      }
    }
  }

  .flex-box {
    position: absolute;
    top: 0;
    bottom: 0;
    // left: 0;
    right: 0;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-start;

    .flex-item {
      flex: auto;
      width: 100px;
    }
  }

  .page-btn-group {
    i {
      margin-right: 0;
    }
  }

  .content-area {
    .code-folder-list {
      @include absPos();
      z-index: 1;
    }
  }

  .detail-content {
    @include absPos();
    //border: 1px solid red;
    z-index: 3;
    background-color: #fff;

    .top-back-line {
      @include absPos();
      bottom: auto;

      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 44px;
      margin: 0 20px;
      font-size: 16px;
      line-height: 44px;
      background: var(--default-bgc);
      border-bottom: 1px solid #ddd;
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }

      .item-title {
        font-size: 18px;
      }

      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }

    .content-box {
      @include absPos();
      top: 44px;

      .detail-tab {
        @include absPos();

        .detail-outer {
          @include absPos();

          .top-container {
            @include absPos();
            bottom: auto;
            height: 90px;

            .left-info {
              float: left;
              display: flex;
              height: 100%;
              width: 40%;

              .code-icon {
                display: inline-block;
                height: 100%;
                width: 40px;
                margin-left: 20px;
                vertical-align: middle;

                /deep/ .img-icon-outer {
                  top: 50%;
                  transform: translateY(-50%);
                }
              }

              .code-name-info {
                position: relative;
                display: inline-block;
                max-width: 600px;
                height: 100%;
                margin-left: 16px;
                vertical-align: top;

                .info-outer {
                  position: relative;
                  display: inline-block;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 100%;

                  .code-en-name {
                    color: #555;
                    font-size: 20px;
                    line-height: 20px;
                    margin-bottom: 4px;
                  }

                  .code-name {
                    line-height: 14px;
                  }

                  .code-en-name,
                  .code-name {
                    display: inline-block;
                    width: 100%;
                    white-space: nowrap;
                    // overflow: hidden;
                    text-overflow: ellipsis;
                  }
                }
              }
            }

            .right-info {
              display: flex;
              flex-direction: row-reverse;
              align-items: center;
              //border: 1px solid red;
              // float: right;
              height: 100%;
              min-width: 600px;
              padding: 0 20px 0 0;

              .right-btn {
                float: right;
                padding-top: 4px;
              }

              .ref-count {
                float: right;
                height: 40px;
                padding: 0 20px 0 30px;
                border-right: 1px solid #ddd;
                margin-right: 20px;

                &:last-of-type {
                  border-left: 1px solid #ddd;
                  margin-right: 0;
                }
              }
            }
          }

          .detail-tab-outer {
            @include absPos();
            top: 90px;
            left: 20px;
            right: 20px;

            /deep/ .datablau-tabs {
              @include absPos();

              .el-tabs,
              .el-tabs__content {
                @include absPos();
              }

              .el-tabs__header {
                background: #fff;
                z-index: 1;
              }
            }

            /deep/ .el-tab-pane {
              @include absPos();
              top: 34px;
            }
          }
        }
      }
    }
  }
}
</style>
