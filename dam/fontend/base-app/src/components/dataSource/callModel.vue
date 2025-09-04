<template>
  <div class="callWraper">
    <datablau-detail-subtitle
      :title="$t('meta.callModel.callInfo')"
      mt="20px"
    ></datablau-detail-subtitle>
    <!--    <datablau-list-search>-->
    <el-form label-width="70px" :inline="true">
      <el-form-item :label="$t('meta.callModel.callType')">
        <datablau-select v-model="callType" @change="changeCall">
          <el-option
            v-for="(item, index) in callList"
            :key="index"
            :label="item.displayName"
            :value="item.busName"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item :label="$t('meta.callModel.callName')">
        <datablau-input
          clearable
          v-model="callName"
          :iconfont-state="true"
          :placeholder="$t('meta.common.pleaseInput')"
        ></datablau-input>
      </el-form-item>
      <el-form-item class="btn">
        <datablau-button
          type="normal"
          @click="query()"
          test-name="ruleTemplate_queryButton"
        >
          {{ $t('quality.page.ruleTemplate.query') }}
        </datablau-button>
      </el-form-item>
    </el-form>
    <!--    </datablau-list-search>-->
    <datablau-table :data="callTableData" class="callTable">
      <el-table-column
        prop="callModel"
        :label="$t('meta.callModel.callModel')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="name"
        :label="$t('meta.callModel.callName')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="createUser"
        :label="$t('meta.callModel.creator')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="createTime"
        :label="$t('meta.callModel.createTime')"
        :formatter="$timeFormatter"
        show-overflow-tooltip
      ></el-table-column>
    </datablau-table>
    <datablau-pagination
      style="float: right; margin: 10px 0"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="currentPage"
      :page-sizes="[20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></datablau-pagination>
  </div>
</template>
<script>
export default {
  props: ['id'],
  data() {
    return {
      callType: '',
      callObj: null,
      callList: [],
      callName: '',
      callTableData: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      moduleMap: {
        datablau_metadata: '元数据',
      },
    }
  },
  mounted() {
    this.getCallList()
  },
  watch: {
    callType: {
      handler(newVal) {
        if (!newVal) return
        this.getTableData(newVal)
      },
      deep: true,
    },
  },
  methods: {
    query() {
      this.currentPage = 1
      this.getTableData()
    },
    getCallList() {
      this.$http
        .post(
          this.$url + '/usage/getRegisteredUsageByType?type=metadata,strategy'
        )
        .then(res => {
          if (Array.isArray(res.data) && res.data.length) {
            this.callList = res.data
            this.callObj = res.data[0]
            this.callType = res.data[0].busName
          } else {
            this.callList = []
            this.callTableData = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.callList = []
          this.callTableData = []
        })
    },
    changeCall(val) {
      this.currentPage = 1
      this.callObj = this.callList.filter(u => {
        return u.busName === val
      })[0]
    },
    getTableData() {
      let param = {
        predicates: {
          datasourceId: this.id,
        },
        size: this.pageSize,
        page: this.currentPage,
      }
      if (this.callName) {
        param.predicates.datasourceName = this.callName
      }
      this.$http
        .post(this.callObj.url, param)
        .then(res => {
          res.data.content.forEach(item => {
            item.callModel = this.callObj.name
          })
          this.callTableData = res.data.content
          this.total = res.data.totalElements
        })
        .catch(e => {
          this.$showFailure(e)
          this.callTableData = []
        })
    },
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getTableData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getTableData()
    },
  },
}
</script>
<style lang="scss" scoped>
.callWraper {
  padding: 0 20px;
  .callTable {
    ::v-deep .el-table__body-wrapper {
      height: 300px;
      overflow-y: auto;
    }
  }
}
</style>
