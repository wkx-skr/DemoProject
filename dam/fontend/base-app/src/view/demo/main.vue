<template>
  <div>
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <el-tab-pane label="列表" name="list">
        <our-list></our-list>
      </el-tab-pane>
      <el-tab-pane label="添加" name="add" v-if="showAddTab" closable>
        <our-detail></our-detail>
      </el-tab-pane>
      <el-tab-pane
        closable
        v-for="item in dataArray"
        :key="item.name"
        :label="item.name"
        :name="item.name"
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
