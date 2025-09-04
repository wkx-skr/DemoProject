<template>
  <div>
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <el-tab-pane label="用户" name="list" key="list">
        <our-list></our-list>
      </el-tab-pane>
      <el-tab-pane
        label="新建用户"
        name="add"
        key="add"
        v-if="showAddTab"
        closable
      >
        <our-detail :allRoles="allRoles"></our-detail>
      </el-tab-pane>
      <el-tab-pane
        v-for="item in dataArray"
        :key="item.name"
        :label="'编辑用户：' + item.name"
        :name="item.name"
        closable
      >
        <our-detail :allRoles="allRoles" :preData="item"></our-detail>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
