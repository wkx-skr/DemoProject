<template>
  <div>
    <div class="search-line">
      <datablau-input
        v-model="keyword"
        class="search-input"
        :placeholder="
          $t('meta.DS.tableDetail.lineage.qualityProblem.placeholder1')
        "
        clearable
        :iconfont-state="true"
      ></datablau-input>
    </div>
    <datablau-table class="datablau-table" :data="showData" key="problemTable">
      <el-table-column
        :label="$t('meta.DS.tableDetail.lineage.qualityProblem.tableName')"
        prop="objectName"
        width="200px"
      ></el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.lineage.qualityProblem.problem')"
        prop="questName"
      ></el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.lineage.qualityProblem.questionsNum')"
        prop="questCounts"
        :width="$i18n.locale === 'zh' ? 80 : 160"
      >
        <template slot-scope="scope">
          <span class="quest-count">{{ scope.row.questCounts }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('meta.DS.tableDetail.lineage.qualityProblem.questionsTime')"
        prop="createTime"
        width="150px"
      ></el-table-column>
    </datablau-table>
  </div>
</template>

<script>
export default {
  name: 'problemList',
  data () {
    return {
      // problemData: [],
      keyword: ''
    }
  },
  props: {
    tableDetail: {
      type: [Object, Array],
      required: true
    }
  },
  components: {},
  computed: {
    allData () {
      let arr = this.tableDetail.questList || []
      // arr = arr.filter(item => {
      //   return item.type === 2
      // })
      return arr
    },
    showData () {
      let arr = []
      arr = this.allData.filter(item => {
        return this.$MatchKeyword(item, this.keyword, 'questName')
      })
      return arr
    }
  },
  mounted () {},
  methods: {},
  watch: {
    // keyword() {
    //   this.showData()
    // },
  }
}
</script>

<style scoped lang="scss">
  .search-line {
    .search-input {
      width: 300px;
    }
  }

  .quest-count {
    display: inline-block;
    //border: 1px solid red;
    //width: 35px;
    color: #f2220a;
    height: 22px;
    padding: 0 10px;
    line-height: 22px;
    background: rgba(242, 34, 10, 0.1);
    border-radius: 11px;
  }
</style>
