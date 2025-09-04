<template>
  <div>
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <el-tab-pane label="权限管理" name="list" key="list">
        <our-list></our-list>
      </el-tab-pane>
      <el-tab-pane
        label="添加权限"
        name="add"
        key="add"
        v-if="showAddTab"
        closable
      >
        <our-detail></our-detail>
      </el-tab-pane>
      <el-tab-pane
        v-for="item in dataArray"
        :key="item.roleFriendlyName"
        :label="'编辑权限：' + item.roleFriendlyName"
        :name="item.roleFriendlyName"
        closable
      >
        <our-detail :preData="item"></our-detail>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
