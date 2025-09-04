<template>
  <div
    class="list-box"
    :style="{ width: $i18n.locale === 'zh' ? '280px' : '320px' }"
  >
    <div class="top-row">
      <el-dropdown
        style="
          cursor: pointer;
          margin-left: 20px;
          margin-top: 15px;
          transition: all 0.8s linear;
        "
        trigger="click"
        v-if="!showSearchInput"
        @command="handleCommand"
      >
        <span class="el-dropdown-link" style="font-size: 12px; color: #555555">
          {{ classifyLabelMap[classifyType] }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="itDepartment">
            {{ $t('meta.DS.groupBy.tech') }}
          </el-dropdown-item>
          <el-dropdown-item command="businessDepartment">
            {{ $t('meta.DS.groupBy.business') }}
          </el-dropdown-item>
          <el-dropdown-item command="zone">
            {{ $t('meta.DS.groupBy.zone') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <datablau-input
        style="
          position: absolute;
          right: 85px;
          top: 10px;
          left: 10px;
          transition: all 0.8s linear;
        "
        v-model="keyword"
        :iconfont-state="true"
        clearable
        ref="metaInput"
        v-if="showSearchInput"
        @blur="handleSearchBlur"
        :placeholder="$t('common.placeholder.normal')"
      ></datablau-input>
      <div class="btn-all">
        <datablau-button
          v-show="!showSearchInput"
          class="iconfont icon-search btn-info top-btn"
          @click="changeShowInput"
          type="text"
        ></datablau-button>
        <el-tooltip
          effect="dark"
          :content="
            showFilteredNode
              ? $t('meta.DS.tree_filterEmpty')
              : $t('meta.DS.tree_showAll')
          "
          placement="top-start"
          popper-class="meta-top-tooltip"
        >
          <datablau-button
            class="iconfont btn-info top-btn"
            :class="
              showFilteredNode ? 'icon-hide primary-btn' : 'icon-shujuyuan'
            "
            type="text"
            @click="handleTreeFiltered"
          ></datablau-button>
        </el-tooltip>
        <el-tooltip
          effect="dark"
          :content="
            showUnFold ? $t('meta.DS.tree_unFold') : $t('meta.DS.tree_fold')
          "
          placement="top-start"
          popper-class="meta-top-tooltip"
        >
          <datablau-button
            class="iconfont top-btn"
            :class="showUnFold ? 'icon-shouqi' : 'icon-zhankai'"
            @click="expandOrCollapseTopLevel"
            type="text"
          ></datablau-button>
        </el-tooltip>
      </div>
    </div>
    <div class="second-row-info">
      <p @click="handleAllShow" :class="{ 'is-active': isAllActive }">
        <i class="iconfont icon-shuju"></i>
        <span>{{ $t('meta.DS.tree_allMetaData') }}</span>
      </p>
      <p @click="handleAllSouceShow" :class="{ 'is-active': isAllSouceActive }">
        <i class="iconfont icon-shujuyuan all"></i>
        <span>{{ $t('meta.DS.tree_allDataSource') }}</span>
      </p>
    </div>
    <datablau-tree
      class="grey-tree"
      ref="tree2"
      style="
        position: absolute;
        top: 137px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
        min-height: 300px;
      "
      @node-click="handleNodeClick"
      node-key="id"
      :props="defaultProps"
      :default-expanded-keys="expandedKeys"
      auto-expand-parent
      :data="treeData"
      :data-supervise="supervise"
      :data-icon-function="dataIconFunction"
      :data-options-function="dataOptionsFunction"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      v-loading="treeLoading"
      :allow-drag="allowDrag"
      draggable
      :emptyText="emptyText"
    ></datablau-tree>
    <div class="bottom-part" v-if="false">
      <!-- <span class="page-name">{{ $version.dataCatalog.pageTitle }}</span> -->

      <!-- <datablau-button
        type="text"
        size="mini"
        style="margin-left: 2em"
        @click="setUdp"
        v-if="!showShareFile && $auth['BUSINESS_ATTR']"
      >
        扩展属性
      </datablau-button>
      <datablau-button
        type="text"
        size="mini"
        style="margin-left: 2em"
        @click="showExpProp"
        v-if="showShareFile"
      >
        扩展属性
      </datablau-button> -->
    </div>
    <el-upload
      v-show="false"
      v-if="showUpload"
      :action="
        this.$url + '/service/models/' + currentModelId + '/updateMetadata'
      "
      :show-file-list="false"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      accept=".xlsx,.xls"
      :on-error="handleUpdateMetadataError"
    >
      <datablau-button
        type="text"
        size="small"
        ref="refreshMeta"
      ></datablau-button>
    </el-upload>
  </div>
</template>

<script>
import list from './list'
export default list
</script>

<style scoped lang="scss">
@import './color.scss';
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .list-box .top-row .btn-all {
    .is-block {
      display: inline !important;
    }
  }
  .list-box .top-row .btn-all .btn-info:after {
    display: inline !important;
  }
}
.list-box {
  position: absolute;
  left: 0;
  z-index: 2;
  //width: 280px;
  top: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  // border:1px solid var(--border-color-lighter);
  // border-left: none;
  //background-color:#FFF;
  .top-row {
    height: 54px;
    .dropdown-info {
      padding: 20px 10px;
    }
    .btn-all {
      display: inline-block;
      float: right;
      margin-right: 10px;
      margin-top: 10px;
      line-height: 34px;
      .btn-info {
        &:after {
          content: '';
          width: 1px;
          height: 16px;
          display: inline-block;
          margin-left: 10px;
          vertical-align: middle;
          background-color: $border-color;
        }
      }
      .top-btn {
        margin-left: 10px;
        padding: 0;
        &:before {
          color: $text-disabled;
        }
        &:hover {
          background: none;
          &:before {
            color: $primary-color;
          }
        }
        &:nth-of-type(2) {
        }
      }
    }
  }
  .second-row-info {
    p {
      padding-left: 20px;
      cursor: pointer;
      font-size: 12px;
      font-weight: normal;
      height: 34px;
      line-height: 34px;
      span {
      }
      i {
        &:before {
          font-size: 16px;
          color: $primary-color;
          margin-right: 7px;
        }
      }
      &:hover {
        background: $table-hover-color;
      }
      &.is-active {
        background: $table-hover-color;
        span {
          color: $primary-color;
        }
      }
    }
    &:after {
      content: '';
      width: 100%;
      height: 1px;
      display: inline-block;
      margin-bottom: 6px;
      background: $component-divide-color;
    }
  }
}

// .bottom-part {
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   height: 50px;
//   line-height: 50px;
//   .page-name {
//     font-size: 14px;
//     margin: 0 1.5em;
//   }
// }
</style>

<style>
.el-tooltip__popper.meta-top-tooltip {
  padding: 5px;
}
</style>
