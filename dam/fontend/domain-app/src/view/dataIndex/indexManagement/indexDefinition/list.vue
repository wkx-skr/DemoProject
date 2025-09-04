<template>
  <div class="list-box">
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      width="510px"
      append-to-body
    >
      <div class="content">
        <datablau-form label-width="6em">
          <el-form-item :label="$t('system.systemSetting.dir')">
            {{ currentParentLabel }}
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRules.directoryName')"
            required
          >
            <datablau-input
              style="width: 400px"
              v-model="category.name"
              maxlength="200"
              class="maxlengthInput"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRules.table.description')"
          >
            <datablau-input
              type="textarea"
              style="width: 400px"
              v-model="category.description"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button @click="closeCreateCategoryDialog">
          {{ $t('common.button.close') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="processCreateCategory"
          :disabled="processing || !category.name"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="top-row">
      <!--<datablau-page-title
        :name="$version.nav.indexDefinition"
        style="display: inline-block; line-height: 50px"
      ></datablau-page-title>-->
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
      <div class="btn-all">
        <el-tooltip
          effect="dark"
          :content="
            showUnFold
              ? this.$t('domain.common.shrink')
              : this.$t('domain.common.expansion')
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
        <span>{{ $t('indicator.demand.allCategory') }}</span>
      </p>
    </div>
    <datablau-tree
      ref="tree"
      style="
        position: absolute;
        top: 103px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      "
      node-key="foldId"
      :data="treeData"
      :props="defaultProps"
      :data-icon-function="dataIconFunction"
      :default-expanded-keys="defaultExpandedKeys"
      data-supervise
      :data-options-function="dataOptionsFunction"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    ></datablau-tree>
  </div>
</template>
<script>
import List from './list.js'
export default List
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
@import '../base';
</style>
