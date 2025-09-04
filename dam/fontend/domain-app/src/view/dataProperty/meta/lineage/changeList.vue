<template>
  <div class="change-list">
    <div class="search-line">
      <datablau-input
        v-model="keyword"
        class="search-input"
        :placeholder="
          $t('meta.DS.tableDetail.lineage.qualityProblem.placeholder2')
        "
        clearable
        :iconfont-state="true"
      ></datablau-input>
    </div>
    <div class="table-line">
      <datablau-table
        class="datablau-table"
        :data="showData"
        key="changeTable"
        @row-click="handleRowClick"
      >
        <el-table-column
          :label="$t('meta.DS.tableDetail.lineage.qualityProblem.tableName')"
          prop="objectName"
          width="200px"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.lineage.qualityProblem.changeInfo')"
          prop="modifyInfo"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.lineage.qualityProblem.changeTime')"
          prop="modifyTime"
          width="150px"
        ></el-table-column>
      </datablau-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'changeList',
  data() {
    return {
      // changeData: [],
      keyword: '',
    }
  },
  props: {
    tableDetail: {
      type: [Object, Array],
      required: true,
    },
  },
  computed: {
    allData() {
      let arr = this.tableDetail.modifyList || []
      // arr = arr.filter(item => {
      //   return item.type === 2
      // })
      return arr
    },
    showData() {
      // {
      //   type: 1, // 1是当前实体，2是血缘实体
      //   modifyId: 5102, // 实体id
      //   modifyTime: '2021-12-31', // 变更时间
      //   modifyInfo: 'id,name,age,address', // 变更字段
      //   modifyCounts: 4, // 变更个数
      //   version: 2, // 变更版本信息
      //   modelId: 5100, // 模型ID
      // },
      let arr = []
      arr = this.allData.filter(item => {
        return this.$MatchKeyword(item, this.keyword, 'modifyInfo')
      })
      return arr
    },
  },
  components: {},
  mounted() {},
  methods: {
    handleRowClick(row) {
      // console.log(row, 'row')
    },
  },
  watch: {},
}
</script>

<style scoped lang="scss">
.change-list {
  .search-line {
    .search-input {
      width: 300px;
    }

    .table-line {
      height: 470px;
      border: 1px solid red;
      overflow: auto;
    }
  }
}
</style>
