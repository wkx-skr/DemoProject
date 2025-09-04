<template>
  <el-card style="margin: 20px" v-show="false">
    <div slot="header">
      可用的函数模板
      <el-button size="small" @click="getRegistered" style="float: right">
        refresh
      </el-button>
    </div>

    <el-table class="datablau-table" :data="tableData">
      <el-table-column
        label="名称"
        prop="name"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="别名"
        prop="alias"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="返回值类型"
        prop="returnType"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="参数" prop="params" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ Object.values(scope.row.params) }}
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        prop="description"
        show-overflow-tooltip
      ></el-table-column>
    </el-table>
  </el-card>
</template>
<script>
export default {
  data() {
    return {
      tableData: null,
    }
  },
  mounted() {
    this.getRegistered()
  },
  methods: {
    getRegistered() {
      this.$http
        .get(this.$quality_url + '/funcs/registered')
        .then(res => {
          this.tableData = Object.values(res.data)
          this.$emit('got', res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
