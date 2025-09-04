<template>
  <div class="data-classify-page">
    <!-- 新建数据分类 -->
    <datablau-dialog
      :zIndex="1888"
      v-if="showSecuritySort"
      size="l"
      :title="classifyTitle"
      :visible.sync="showSecuritySort"
    >
      <el-form
        ref="securityForm"
        :rules="rules"
        :model="securityForm"
        class="security-form"
        :class="{ 'only-see-form': isSee }"
        label-width="120px"
      >
        <datablau-detail-subtitle
          :title="$t('accessControl.baseAttr')"
          mt="0px"
          mb="10px"
        ></datablau-detail-subtitle>

        <div class="list" :class="{ 'list-only': !hasAttr }">
          <el-form-item :label="$t('securityModule.name')" prop="name">
            <div
              v-if="isSee"
              class="see-form-item"
              :style="{
                width: hasAttr ? '250px' : '100%',
              }"
            >
              <is-show-tooltip
                :content="securityForm.name"
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-input
              v-else
              :disabled="isSee"
              clearable
              :placeholder="$t('securityModule.input')"
              v-model="securityForm.name"
              :style="{ width: hasAttr ? '250px' : '100%' }"
              maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('securityModule.securityLevel')"
            prop="levelId"
            v-if="hasAttr"
          >
            <div v-if="isSee" class="see-form-item" style="width: 250px">
              <is-show-tooltip
                :content="
                  securityForm.securityLevel && securityForm.securityLevel.name
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-select
              v-else
              :disabled="isSee"
              v-model="securityForm.levelId"
              filterable
              clearable
              reserve-keyword
              :placeholder="$t('securityModule.placeSelect')"
              style="width: 250px"
            >
              <el-option
                v-for="item in levelList"
                :key="item.tagId"
                :label="item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <div class="list" v-if="hasAttr">
          <el-form-item
            :label="$t('securityModule.impactLevel')"
            prop="impactDegreeId"
          >
            <div v-if="isSee" class="see-form-item" style="width: 250px">
              <is-show-tooltip
                :content="
                  securityForm.dataImpactDegree &&
                  securityForm.dataImpactDegree.name
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-select
              v-else
              v-model="securityForm.impactDegreeId"
              filterable
              clearable
              :disabled="isSee"
              reserve-keyword
              :placeholder="$t('securityModule.placeSelect')"
              style="width: 250px"
            >
              <el-option
                v-for="item in degreeList"
                :key="item.tagId"
                :label="item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('securityModule.reach')" prop="scopeId">
            <div v-if="isSee" class="see-form-item" style="width: 250px">
              <is-show-tooltip
                :content="
                  securityForm.dataInfluenceScope &&
                  securityForm.dataInfluenceScope.name
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-select
              v-else
              :disabled="isSee"
              v-model="securityForm.scopeId"
              filterable
              clearable
              reserve-keyword
              :placeholder="$t('securityModule.placeSelect')"
              style="width: 250px"
            >
              <el-option
                v-for="item in rangeList"
                :key="item.tagId"
                :label="item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <div class="list" v-if="hasAttr">
          <el-form-item
            :label="$t('securityModule.affectedObjects')"
            prop="objectId"
          >
            <div v-if="isSee" class="see-form-item" style="width: 250px">
              <is-show-tooltip
                :content="
                  securityForm.dataInfluenceObject &&
                  securityForm.dataInfluenceObject.name
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-select
              v-else
              :disabled="isSee"
              v-model="securityForm.objectId"
              filterable
              clearable
              reserve-keyword
              :placeholder="$t('securityModule.placeSelect')"
              style="width: 250px"
            >
              <el-option
                v-for="item in objectList"
                :key="item.tagId"
                :label="item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('securityModule.importance')"
            prop="importId"
          >
            <div v-if="isSee" class="see-form-item" style="width: 250px">
              <is-show-tooltip
                :content="
                  securityForm.dataImportance &&
                  securityForm.dataImportance.name
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-select
              v-else
              :disabled="isSee"
              v-model="securityForm.importId"
              filterable
              clearable
              reserve-keyword
              :placeholder="$t('securityModule.placeSelect')"
              style="width: 250px"
            >
              <el-option
                v-for="item in importList"
                :key="item.tagId"
                :label="item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <div class="list" v-if="hasAttr">
          <el-form-item
            :label="$t('accessControl.fagui')"
            prop="statuteId"
            v-if="this.$versionFeature.datasecurity_Regulations"
          >
            <div v-if="isSee" class="see-form-item" style="width: 250px">
              <is-show-tooltip
                :content="
                  securityForm.dataSecurityRegulation &&
                  securityForm.dataSecurityRegulation.sourceName
                "
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-select
              v-else
              :disabled="isSee"
              clearable
              v-model="securityForm.statuteId"
              filterable
              remote
              reserve-keyword
              :placeholder="$t('securityModule.placeSelect')"
              style="width: 250px"
            >
              <el-option
                v-for="item in statuteList"
                :key="item.id"
                :label="item.sourceName"
                :value="item.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <div class="list" v-if="hasAttr" style="overflow: hidden; width: 100%">
          <el-form-item
            v-if="$versionFeature.datasecurity_Regulations"
            :label="$t('accessControl.article')"
            prop="article"
            style="width: 100%"
          >
            <div
              v-if="isSee"
              style="width: 100%; height: 32px; line-height: 32px"
            >
              <is-show-tooltip
                :content="securityForm.article"
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-input
              v-else
              clearable
              :disabled="isSee"
              :placeholder="$t('securityModule.input')"
              v-model="securityForm.article"
              show-word-limit
              maxlength="50"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
        </div>
        <el-form-item :label="$t('securityModule.des')" prop="comment">
          <datablau-input
            :disabled="isSee"
            type="textarea"
            :rows="5"
            resize="none"
            clearable
            :placeholder="$t('securityModule.input')"
            v-model="securityForm.comment"
            style="width: 100%; max-height: 240px"
          ></datablau-input>
        </el-form-item>
        <!-- 扩展属性 -->
        <template v-if="udps.length">
          <datablau-detail-subtitle
            :title="$t('securityModule.extendAttr')"
            mt="0px"
            mb="10px"
          ></datablau-detail-subtitle>
          <div class="list">
            <el-form-item
              v-for="(udp, index) in udps"
              :key="udp.id"
              :label="udp.propName"
              :prop="udp.propName"
              :style="{
                float: index ? (index % 2 === 0 ? 'left' : 'right') : 'none',
              }"
            >
              <datablau-input
                :disabled="isSee"
                v-if="udp.type === 'STRING'"
                v-model="udp.value"
                style="width: 250px"
                :maxlength="255"
                :placeholder="$t('securityModule.input')"
              ></datablau-input>
              <template v-if="udp.type === 'NUM'">
                <el-input
                  v-if="isSee"
                  :disabled="isSee"
                  size="small"
                  v-model="udp.value"
                  style="width: 250px"
                ></el-input>
                <el-input-number
                  v-else
                  size="small"
                  v-model="udp.value"
                  style="width: 250px"
                  :max="999999999999"
                ></el-input-number>
              </template>
              <datablau-select
                :disabled="isSee"
                v-if="udp.type === 'ENUM'"
                style="width: 250px"
                v-model="udp.value"
                filterable
                :placeholder="$t('securityModule.placeSelect')"
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
        <datablau-button type="secondary" @click="close('securityForm')">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="!isSee"
          type="important"
          @click="sure('securityForm')"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 添加信息项 -->
    <add-standard
      :visible="visible"
      :id="curCatalogTree.id"
      v-if="visible"
      :click-child="clickChild"
    ></add-standard>
    <!-- 导入数据分类目录 -->
    <datablau-dialog
      :size="'m'"
      append-to-body
      :title="$t('accessControl.importSecurity')"
      :close-on-click-modal="false"
      :visible.sync="uploadShow"
      :height="280"
      v-if="uploadShow"
    >
      <div class="uploadContent">
        <p class="uploadtip">{{ $t('accessControl.importTip') }}</p>
        <datablau-button
          style="float: right; margin-right: -25px; line-height: 32px"
          type="text"
          @click="modelDownload"
        >
          {{ $t('accessControl.exportTem') }}
        </datablau-button>
        <datablau-upload
          :action="uploadUrl"
          :before-upload="beforeUpload"
          :on-error="handleUploadError"
          :on-change="handleChange"
          :before-remove="handleRemove"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="calssifyUpload"
          :isEdit="true"
          :auto-upload="false"
          class="standardImport-upload"
          :name="'multipartFile'"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>{{ $t('accessControl.importFile') }}</span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="uploadShow = false">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          :disabled="fileList.length === 0"
          type="primary"
          @click="uploadSure"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="tree-box" v-if="!isView && treeShow">
      <datablau-tree-header>
        <template slot="title">{{ $t('accessControl.title') }}</template>
        <template slot="more" v-if="hasManageAuth">
          <i class="iconfont icon-lue" @click="addCatalog"></i>
        </template>
        <template slot="search">
          <div class="search-tree-box lazy-tree-box">
            <!-- <i
              v-show="showClose"
              class="el-icon-circle-close cursor-close"
              :class="{ 'show-cursor-close': showClose }"
              @click="clear"
            ></i> -->
            <datablau-select
              ref="loadSelect"
              filterable
              clearable
              class="filter-input"
              v-model="treeKey"
              remote
              :placeholder="$t('securityModule.search')"
              :remote-method="getCatalogName"
              @change="selectCatalogName(treeKey)"
              @focus="handleFocus"
              @visible-change="visibleChange"
              :isIcon="'icon-search'"
            >
              <el-option
                v-for="item in nameList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </datablau-select>
          </div>
        </template>
      </datablau-tree-header>
      <div class="tree-content">
        <datablau-easy-tree
          :class="['datablau-tree']"
          :show-overflow-tooltip="true"
          v-loading="treeLoading"
          lazy
          :load="loadCallback"
          @node-click="handleNodeClick"
          node-key="id"
          :props="defaultProps"
          :data="treeData"
          :data-supervise="true"
          :data-img-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          :expand-on-click-node="false"
          ref="tree"
          :default-expanded-keys="expandArr"
          :filter-node-method="filterNode"
          :empty-text="
            !treeLoading && allTreeList.length === 0
              ? $t('securityModule.noCatalogInfo')
              : ''
          "
          height="calc(100vh - 140px)"
          :itemSize="34"
          :highlightCurrent="true"
        ></datablau-easy-tree>
      </div>
    </div>
    <div class="resize-column-middle" v-if="!isView"></div>
    <div
      class="classify-right-box"
      :class="{ 'classify-box': isView }"
      v-if="allTreeList.length > 0"
      v-loading="rightLoading || viewLoading"
    >
      <template>
        <div
          class="datablau-breadcrumb-header"
          :class="{ 'spe-datablau-breadcrumb-header': isView }"
          style="padding-left: 0"
        >
          <div>
            <datablau-breadcrumb
              :showBack="isView"
              :nodeData="breadcrumbNodes"
              @nodeClick="handleBreadcrumb"
              @back="goBack"
            ></datablau-breadcrumb>
          </div>
        </div>
        <sort-base-info
          v-if="heightCatalog.id"
          :isView="isView"
          :click-child="clickChild"
          :heightCatalog="heightCatalog"
          :hasManageAuth="hasManageAuth"
        ></sort-base-info>
        <div class="classify-describe" ref="desBox">
          <div class="title-box">
            <datablau-detail-subtitle
              :title="$t('securityModule.des')"
              mt="0px"
              mb="6px"
            ></datablau-detail-subtitle>
          </div>
          <div class="des-content">
            {{
              heightCatalog.comment
                ? heightCatalog.comment
                : $t('securityModule.notDes')
            }}
          </div>
        </div>
        <datablau-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane
            :label="$t('accessControl.dataAssets')"
            name="first"
          ></el-tab-pane>
          <el-tab-pane
            :label="$t('accessControl.infoItem')"
            name="second"
          ></el-tab-pane>
        </datablau-tabs>
        <div
          class="mapping-data-box"
          :style="{ top: desBox + 170 + 'px' }"
          v-if="activeName === 'first' && heightCatalog.id"
        >
          <mapping-data
            v-if="activeName === 'first'"
            :isView="isView"
            :minScreen="minScreen"
            :heightCatalog="heightCatalog"
            :highId="highId"
            :hasManageAuth="$auth.DATA_SECURITY_ASSET_MANAGE"
          ></mapping-data>
        </div>
        <div
          class="safety-standard-box"
          :style="{ top: desBox + 170 + 'px' }"
          v-if="activeName === 'second'"
        >
          <div
            class="safety-standard-content"
            :class="{ 'max-safety-standard-content': !heightCatalog.hasAttr }"
          >
            <safety-standards
              :click-child="clickChild"
              :isView="isView"
              v-if="activeName === 'second'"
              :isOpen="isOpen"
              :minScreen="minScreen"
              :heightCatalog="heightCatalog"
              :highId="highId"
              :hasManageAuth="hasManageAuth"
              ref="safetyStandards"
            ></safety-standards>
          </div>
          <div class="right-attr-box">
            <datablau-meta-data-attr
              :operation-open="operationOpen"
              :isMin="false"
            >
              <div class="attr-items" v-for="item in infoList" :key="item.id">
                <template v-if="item.data.length > 0">
                  <p class="group-key">{{ item.title }}</p>
                  <item-attr
                    :info="o"
                    :isOpen="isOpen"
                    v-for="o in item.data"
                    :key="o.key"
                  ></item-attr>
                </template>
              </div>
            </datablau-meta-data-attr>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.datablau-breadcrumb-header {
  &.spe-datablau-breadcrumb-header {
    /deep/ .db-breadcrumb {
      .back-separator {
        display: none;
      }
    }
  }
}
.data-classify-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  .tree-box {
    position: absolute;
    left: 0;
    width: 240px;
    top: 0;
    bottom: 0;
    border-right: 1px solid var(--border-color-lighter);
    .tree-name {
      height: 44px;
      line-height: 24px;
      padding: 10px;
      padding-right: 7px;
      font-size: 16px;
      font-weight: 600;
      i {
        float: right;
        line-height: 24px;
        height: 24px;
        width: 24px;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
        border-radius: 2px;
        &:hover {
          background-color: var(--tree-current-bgc);
          transition: background-color 0.3s;
          color: $primary-color;
        }
      }
    }
    .search-tree-box {
      position: relative;
      height: 32px;
      .filter-input {
        position: absolute;
        top: 0px;
        left: 10px;
        right: 10px;
      }
    }
    .tree-content {
      position: absolute;
      top: 80px;
      bottom: 10px;
      left: 0;
      right: 0;
      // overflow-y: auto;
    }
  }
  .resize-column-middle {
    left: 240px;
    top: 0;
    background-color: transparent;
    width: 10px;
    z-index: 8;
  }
  .classify-right-box {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 240px;
    padding: 0px 20px 10px;
    z-index: 8;
    &.classify-box {
      left: 0;
    }
    .classify-describe {
      margin-bottom: 10px;
      span {
        vertical-align: top;
      }
      .title-box {
        position: relative;
        .iconfont {
          margin-left: 10px;
          font-size: 12px;
          color: $primary-color;
          cursor: pointer;
        }
      }
      .des-content {
        font-size: 12px;
        line-height: 20px;
        max-height: 100px;
        overflow-y: auto;
        // text-overflow: ellipsis;
        // display: -webkit-box;
        // -webkit-line-clamp: 2;
        // -webkit-box-orient: vertical;
      }
    }
    /deep/ .datablau-tabs {
      .el-tabs__content {
        height: 0;
      }
    }
    .safety-standard-box {
      position: absolute;
      top: 217px;
      left: 0px;
      right: 0px;
      bottom: 0;
      padding: 10px 20px 0;
      .safety-standard-content {
        &.max-safety-standard-content {
          /deep/ .safety-standard-com {
            // .left-info-box {
            //   position: absolute;
            //   right: 0px;
            // }
          }
        }
      }

      .safety-standard-content {
        position: absolute;
        top: 0px;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
    .right-attr-box {
      .attr-items {
        margin-bottom: 16px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      .group-key {
        height: 24px;
        line-height: 24px;
        font-weight: 600;
        color: #444;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        // margin-bottom: 8px;
      }
    }
    .mapping-data-box {
      position: absolute;
      top: 217px;
      left: 0px;
      right: 0px;
      bottom: 0;
      padding: 10px 20px 0;
    }
  }
}
.security-form {
  padding-bottom: 10px;
  .list {
    &.list-only {
      /deep/ .el-form-item {
        width: 100%;
        &:last-child {
          float: left;
        }
      }
    }
    &:after {
      content: '';
      display: block;
      clear: both;
    }
    /deep/ .el-form-item {
      &:last-child {
        // float: right;
      }
      display: inline-block;
      margin-bottom: 14px;
    }
    .el-input__icon {
      line-height: 34px;
    }
  }
}
.uploadContent {
  clear: both;
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
