<template>
  <div class="data-classify-page">
    <!-- 新建安全分类 -->
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
        label-width="120px"
      >
        <datablau-detail-subtitle
          :title="'基础属性'"
          mt="0px"
          mb="10px"
        ></datablau-detail-subtitle>

        <div class="list" :class="{ 'list-only': !hasAttr }">
          <el-form-item :label="'分类名称'" prop="name">
            <datablau-input
              clearable
              :placeholder="'请输入，避免使用#/\@$_%<>等特殊字符'"
              v-model="securityForm.name"
              style="width: 250px"
              maxlength="30"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="'安全等级'" prop="levelId" v-if="hasAttr">
            <datablau-select
              v-model="securityForm.levelId"
              filterable
              remote
              reserve-keyword
              :placeholder="'请选择安全等级'"
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
          <el-form-item :label="'影响程度'" prop="impactDegreeId">
            <datablau-select
              v-model="securityForm.impactDegreeId"
              filterable
              remote
              reserve-keyword
              :placeholder="'请选择影响程度'"
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
          <el-form-item :label="'影响范围'" prop="scopeId">
            <datablau-select
              v-model="securityForm.scopeId"
              filterable
              remote
              reserve-keyword
              :placeholder="'请选择影响范围'"
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
          <el-form-item :label="'影响对象'" prop="objectId">
            <datablau-select
              v-model="securityForm.objectId"
              filterable
              remote
              reserve-keyword
              :placeholder="'请选择影响对象'"
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
          <el-form-item :label="'重要程度'" prop="importId">
            <datablau-select
              v-model="securityForm.importId"
              filterable
              remote
              reserve-keyword
              :placeholder="'请选择重要程度'"
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
        <div class="list list-only" v-if="hasAttr">
          <el-form-item :label="'法规'" prop="statuteId">
            <datablau-select
              clearable
              v-model="securityForm.statuteId"
              filterable
              remote
              reserve-keyword
              :placeholder="'请选择法规'"
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
          <el-form-item :label="'条文'" prop="article" style="width: 100%">
            <datablau-input
              clearable
              :placeholder="'请输入'"
              v-model="securityForm.article"
              show-word-limit
              maxlength="50"
              style="width: 100%"
            ></datablau-input>
          </el-form-item>
        </div>
        <el-form-item :label="'描述'" prop="comment">
          <datablau-input
            type="textarea"
            :rows="5"
            show-word-limit
            resize="none"
            clearable
            :placeholder="'请输入描述'"
            v-model="securityForm.comment"
            style="width: 100%; max-height: 240px"
          ></datablau-input>
        </el-form-item>
        <!-- 扩展属性 -->
        <template v-if="udps.length">
          <datablau-detail-subtitle
            :title="'扩展属性'"
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
                v-if="udp.type === 'STRING'"
                v-model="udp.value"
                style="width: 250px"
                :maxlength="255"
                :placeholder="'请输入'"
              ></datablau-input>
              <el-input-number
                v-if="udp.type === 'NUM'"
                size="small"
                v-model="udp.value"
                style="width: 250px"
                :max="999999999999"
              ></el-input-number>
              <datablau-select
                v-if="udp.type === 'ENUM'"
                style="width: 250px"
                v-model="udp.value"
                filterable
                placeholder="请输入"
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
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="sure('securityForm')">
          {{ $t('common.button.ok') }}
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
    <!-- 导入安全分类目录 -->
    <datablau-dialog
      :size="'m'"
      append-to-body
      :title="`导入安全分类`"
      :close-on-click-modal="false"
      :visible.sync="uploadShow"
      v-if="uploadShow"
    >
      <div class="uploadContent">
        <p class="uploadtip">仅支持上传单个文件，支持上传文件格式为：xlsx</p>
        <datablau-button
          style="float: right; margin-right: -25px; line-height: 32px"
          type="text"
          @click="modelDownload"
        >
          下载模板
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
              <span>上传文件</span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="uploadShow = false">
          取消
        </datablau-button>
        <datablau-button
          :disabled="fileList.length === 0"
          type="primary"
          @click="uploadSure"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="tree-box">
      <datablau-tree-header>
        <template slot="title">安全分类管理</template>
        <template slot="more" v-if="hasManageAuth">
          <i class="iconfont icon-lue" @click="addCatalog"></i>
        </template>
        <template slot="search">
          <div class="search-tree-box lazy-tree-box">
            <i
              v-show="showClose"
              class="el-icon-circle-close cursor-close"
              :class="{ 'show-cursor-close': showClose }"
              @click="clear"
            ></i>
            <datablau-select
              ref="loadSelect"
              filterable
              clearable
              class="filter-input"
              v-model="treeKey"
              remote
              placeholder="搜索分类名称"
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
          :show-overflow-tooltip="true"
          v-loading="treeLoading"
          lazy
          :load="loadCallback"
          :use-default-sort="false"
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
            !treeLoading && allTreeList.length === 0 ? '暂无目录信息' : ''
          "
          height="calc(100vh - 140px)"
          :itemSize="34"
          :highlightCurrent="true"
        ></datablau-easy-tree>
      </div>
    </div>
    <div class="resize-column-middle"></div>
    <div
      class="classify-right-box"
      v-if="allTreeList.length > 0"
      v-loading="rightLoading"
    >
      <template>
        <div class="datablau-breadcrumb-header" style="padding-left: 0">
          <div>
            <datablau-breadcrumb
              :showBack="false"
              :nodeData="breadcrumbNodes"
              @nodeClick="handleBreadcrumb"
              @back="goBack"
            ></datablau-breadcrumb>
          </div>
        </div>
        <sort-base-info
          v-if="heightCatalog.id"
          :click-child="clickChild"
          :heightCatalog="heightCatalog"
          :hasManageAuth="hasManageAuth"
        ></sort-base-info>
        <div class="classify-describe" ref="desBox">
          <div class="title-box">
            <datablau-detail-subtitle
              title="描述"
              mt="0px"
              mb="6px"
            ></datablau-detail-subtitle>
          </div>
          <div class="des-content">
            {{ heightCatalog.comment ? heightCatalog.comment : '暂无描述' }}
          </div>
        </div>
        <datablau-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="数据资产" name="first"></el-tab-pane>
          <el-tab-pane label="分类信息项" name="second"></el-tab-pane>
          <!-- <el-tab-pane label="识别规则" name="third"></el-tab-pane> -->
        </datablau-tabs>
        <div
          class="mapping-data-box"
          :style="{ top: desBox + 170 + 'px' }"
          v-if="activeName === 'first' && heightCatalog.id"
        >
          <mapping-data
            v-if="activeName === 'first'"
            :minScreen="minScreen"
            :heightCatalog="heightCatalog"
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
              v-if="activeName === 'second'"
              :isOpen="isOpen"
              :minScreen="minScreen"
              :heightCatalog="heightCatalog"
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
        <div class="rule-box" v-if="activeName === 'third'">
          <recognition-rules :minScreen="minScreen"></recognition-rules>
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
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
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
    .rule-box {
      position: absolute;
      top: 164px;
      left: 0px;
      right: 0px;
      bottom: 0;
      padding: 10px 20px 0;
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
        float: right;
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
