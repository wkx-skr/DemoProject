<template>
  <div class="list-box">
    <datablau-dialog
      width="500px"
      :title="folderTitle"
      :visible.sync="folderVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <div>
        <!-- :model="jobDetails.jobContent" -->
        <datablau-form
          label-width="130px"
          :rules="rules"
          ref="form"
          :model="formData"
          size="mini"
        >
          <!-- <el-form-item v-if="parentPath" label="父级路径">
            <div>
              <span class="iconfont icon-file"></span>
              <span style="margin-left: 6px">{{ parentPath }}</span>
            </div>
          </el-form-item> -->
          <el-form-item
            :label="$t('indicator.demand.categoryName')"
            prop="name"
          >
            <datablau-input
              clearable
              maxlength="20"
              size="small"
              style="width: 100%"
              v-model="formData.name"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.description')"
            prop="description"
          >
            <datablau-input
              clearable
              maxlength="100"
              size="small"
              style="width: 100%"
              v-model="formData.description"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="addfolder"
          :disabled="!formData.name"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="top-row">
      <!-- <datablau-page-title
        :name="$version.nav.demandClass"
        style="display: inline-block; line-height: 50px"
      ></datablau-page-title> -->
      <datablau-input
        class="input"
        v-model="keyword"
        iconfont-state
        :search-narrow="false"
        :placeholder="$t('common.placeholder.normal')"
        to-right
        clearable
        ref="metaInput"
      ></datablau-input>
      <!-- <div class="btn-all">
        <el-tooltip
          effect="dark"
          :content="showUnFold ? '收起' : '展开'"
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
      </div> -->
    </div>
    <div class="second-row-info">
      <p @click="handleAllShow" :class="{ 'is-active': isAllActive }">
        <i class="iconfont icon-shuju"></i>
        <span>{{ $t('indicator.demand.allCategory') }}</span>
      </p>
    </div>
    <div
      v-if="noCategory"
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 50px;
      "
    >
      <!-- <img
        src="../../../assets/images/no-result.svg"
        style="width: 126px; height: 99.46px"
        alt="no-data"
      /> -->
      <div
        style="
          color: #555;
          margin-top: 39px;
          margin-bottom: 20px;
          font-size: 16px;
        "
      >
        {{ $t('component.table.noData') }}
      </div>
    </div>
    <div
      v-if="noCategory"
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 50px;
      "
    >
      <datablau-button
        type="primary"
        @click="createCategory"
        class="iconfont icon-tianjia"
        style="font-size: 14px; padding: 0 50px"
      >
        {{ $t('indicator.demand.addCategory') }}
      </datablau-button>
    </div>
    <datablau-tree
      v-if="!noCategory"
      ref="tree"
      style="
        position: absolute;
        top: 103px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      "
      node-key="id"
      :data="treeData"
      :props="defaultProps"
      :data-icon-function="dataIconFunction"
      :default-expanded-keys="defaultExpandedKeys"
      @node-expand="nodeExpand"
      @node-collapse="nodeCollapse"
      :data-supervise="this.$store.state.$auth['DDD_DEMAND_BUSINESS_EDIT'] || this.$store.state.$auth['DDD_DEMAND_TECH_EDIT']"
      :data-options-function="dataOptionsFunction"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
      :auto-expand-parent="false"
    ></datablau-tree>
  </div>
</template>

<script>
import list from './list'
export default list
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.top-row {
  height: 54px;
  .input {
    right: 10px;
  }
}
.btn-all {
  display: inline-block;
  float: right;
  margin-right: 10px;
  margin-top: 10px;
  line-height: 34px;
}
.input {
  position: absolute;
  right: 40px;
  top: 10px;
  left: 10px;
  transition: all 0.8s linear;
}
.top-btn {
  margin-left: 10px;
  padding: 0;
  &:before {
    color: $text-disabled;
  }
  &:hover {
    &:before {
      color: $primary-color;
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
</style>
<style>
.dialog-container .el-form.page-form textarea {
  width: 96%;
}
.dialog-container .el-form-item {
  margin-bottom: 20px;
}
</style>
