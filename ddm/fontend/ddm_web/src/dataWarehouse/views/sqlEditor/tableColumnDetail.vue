<template>
  <div class="warp">
    <datablau-form-submit style="top:50px">
      <datablau-table
        :data="item.content"
        class="tableMOdelDetail"
        row-key="id"
        height="100%"
        :themeBlack="true"
      >
        <el-table-column
          prop="name"
          label="字段名"
          width="200"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="type"
          label="数据类型"
          width="100"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="length"
          label="长度"
          width="60"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="length"
          label="非空"
          width="60"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-check" v-if="!scope.row.nullable" style="font-weight:bold;font-size:16px;color:#6acf72;"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="defaultValue"
          label="默认值"
          width="60"
          show-overflow-tooltip>

        </el-table-column>
        <el-table-column
          prop="precision"
          label="精度"
          width="60"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="scale"
          label="范围"
          width="60"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="comment"
          label="注释"
          min-width="200"
          show-overflow-tooltip>
        </el-table-column>
      </datablau-table>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object
    }
  },
  data () {
    return {

    }
  },
  methods: {
  },
  mounted () {

  }
}
</script>

<style scoped lang='scss'>
.warp{
  background: #222222;
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
