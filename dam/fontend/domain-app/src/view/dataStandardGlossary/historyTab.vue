<template>
  <datablau-dialog
    :title="`${$t('domain.glossary.historyTitle', { name: glossary.chName })}`"
    :visible.sync="dialogVisible"
    :append-to-body="true"
    size="xl"
    class="glossary-history-dialog"
    :height="600"
  >
    <datablau-form-submit v-if="dialogVisible" v-loading="loading">
      <datablau-table :data="showData" :data-selectable="false" height="100%">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column
          :label="$t('domain.glossary.modifiedBy')"
          show-overflow-tooltip
          width="120"
          prop="operator"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.glossary.modifiedContent')"
          show-overflow-tooltip
          prop="changes"
          min-width="250"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.glossary.modifyTime')"
          prop="timestamp"
          width="140px"
          :formatter="$timeFormatter"
        ></el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalShow"
          style="padding-top: 10px"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </datablau-dialog>
</template>

<script>
import HTTP from '@/http/main'

export default {
  data() {
    return {
      dialogVisible: false,
      totalShow: 0,
      showData: [],
      pageSize: 20,
      currentPage: 1,
      loading: false,
    }
  },
  props: {
    glossary: {
      type: Object,
      required: true,
    },
  },
  components: {},
  computed: {
    tableClass() {
      return {
        'show-bottom-pagination': this.showBottom,
      }
    },
  },
  beforeMount() {},
  mounted() {},
  methods: {
    handleClose() {
      return true
    },
    showDialog() {
      this.dialogVisible = true
      this.$nextTick(this.getData)
    },
    getShowData(para) {
      this.loading = true
      // const url = `${this.$url}/service/ns/${
      //   this.glossary.nsId
      // }/history?pageSize=${para.pageSize}&currentPage=${para.currentPage - 1}`
      return new Promise((resolve, reject) => {
        // this.$http
        //   .get(url)
        HTTP.nsGetHistoryService({
          nsId: this.glossary.id,
          currentPage: para.currentPage - 1,
          pageSize: para.pageSize,
        })
          .then(res => {
            const data = res.data.content || []
            this.totalShow = res.data.totalItems
            resolve(data)
            this.loading = false
          })
          .catch(e => {
            reject(e)
            this.$showFailure(e)
            this.loading = false
          })
      })
    },
    getData() {
      let para = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      }
      this.getShowData(para)
        .then(res => {
          this.showData = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.getData()
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.getData()
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.glossary-history-dialog {
  // position: relative;
  .table-tab-container {
    position: relative;
    min-height: 500px;
  }
}
</style>
