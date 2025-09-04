<!--
 * @Author: your name
 * @Date: 2022-02-17 17:31:44
 * @LastEditTime: 2022-02-23 10:55:12
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \dam产品-2079\dam-web\datablau-web\src\view\userGroup\list.vue
-->
<template>
  <div>
    <datablau-input
      maxlength="100"
      style="width: 260px; margin: 10px; position: relative; top: -1px;"
      v-model="keyword"
      clearable
      :iconfont-state="true"
      :placeholder="$t('common.placeholder.normal')"
    ></datablau-input>
    <datablau-easy-tree
      ref="tree2"
      :data-supervise="true"
      :data-icon-function="dataIconFunction"
      :data-options-function="dataOptionsFunction"
      @node-click="handleNodeClick"
      node-key="id"
      :props="defaultProps"
      :default-expanded-keys="expandedKeys"
      auto-expand-parent
      :data="wholeTreeData"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :allow-drag="allowDrag"
      v-loading="treeLoading"
      :itemSize="34"
      height="calc(100vh - 110px)"
    ></datablau-easy-tree>
    <!-- <div class="bottom-btn"> -->
      <!-- <datablau-button type="important" style="width: 110px;"  @click="showAdd">
        添加用户组
      </datablau-button> -->
      <!-- <el-dropdown>
        <el-button type="primary" size="mini">
          导出<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item><div @click="tableExport(true)">导出全部用户组</div></el-dropdown-item>
          <el-dropdown-item><div @click="tableExport(false)">导出当前用户组</div></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown> -->
    <!-- </div> -->
  </div>
</template>

<script>
import list from './list.js'
export default list
</script>

<style scoped>
.left-tree {
  position: absolute;
  left: 0;
  width: 300px;
  top: 0;
  bottom: 0;
  border: 1px solid #e6e6e6;
  background-color: #fff;
}
.grey-tree {
  position: absolute;
  top: 54px;
  bottom: 52px;
  left: 0;
  right: 0;
  overflow: auto;
}
.bottom-btn {
  position: absolute;
  left: 50px;
  bottom: 7px;
}
.el-input {
  width: 250px;
}
</style>
