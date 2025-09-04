<template>
  <el-card style="margin: 20px">
    <div slot="header">
      函数
      <el-button
        size="small"
        @click="newFunction"
        type="primary"
        style="float: right"
      >
        New Function
      </el-button>
      <el-button
        size="small"
        @click="getFunctions"
        style="float: right; margin-right: 10px"
      >
        Refresh
      </el-button>
    </div>
    <el-table class="datablau-table" :data="tableData">
      <el-table-column
        label="名称"
        prop="funcName"
        :width="100"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="返回值类型"
        :width="100"
        prop="funcReturnType"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="函数参数" prop="funcBody" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ Object.keys(scope.row.funcBody.parameters).join(', ') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" :width="120">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editFunction(scope.row)">
            编辑
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="removeFunction(scope.row)"
          >
            {{ $t('common.button.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      tableData: null,
    }
  },
  mounted() {
    this.getFunctions()
  },
  methods: {
    getFunctions() {
      const pageSize = 100
      const currentPage = 1
      this.$http
        .post(
          this.$quality_url +
            `/funcs/search?pageSize=${pageSize}&currentPage=${currentPage}`
        )
        .then(res => {
          this.tableData = res.data.content
        })
    },
    newFunction() {
      this.$bus.$emit('edit-function')
    },
    editFunction(func) {
      this.$bus.$emit('edit-function', _.cloneDeep(func))
    },
    removeFunction({ funcId }) {
      this.$http
        .post(this.$quality_url + `/funcs/${funcId}/del`)
        .then(res => {
          this.getFunctions()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
