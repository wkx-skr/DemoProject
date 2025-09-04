<template>
  <div id="dataStandard-quoto">
    <!--dam 引用情况, ddm 时隐藏-->
    <div class="top-box" v-if="categoryTypeId < 4" v-show="appName === 'DAM'">
      <div class="data-box">
        <p class="fl">{{ $t('domain.domain.quoteTitle') }}</p>
        <datablau-button
          style="margin-left: 16px; float: right; margin-top: 14px"
          v-show="data && data.length > 0 && !Boolean($route.query.isAssets)"
          type="text"
          size="mini"
          @click="unbindAll"
        >
          {{ this.$t('domain.domain.unbindAll') }}
        </datablau-button>
        <div class="num">
          {{ total }}
        </div>
      </div>
      <div class="data-box">
        <p class="fl">{{ $t('domain.domain.mappingResult') }}</p>
        <div class="num">
          {{ pieData }}
        </div>
      </div>
    </div>

    <div class="table-container" v-if="appName === 'DAM' && categoryTypeId < 4">
      <datablau-table :data="data">
        <el-table-column type="index" label="#" width="44"></el-table-column>
        <el-table-column
          prop="columnName"
          :label="$version.tableHeader.columnName"
          show-overflow-tooltip
          min-width="100"
        >
          <template slot-scope="scope">
            <a
              @click="
                onColumnClick(scope.row.tableObjectId, scope.row.columnObjectId)
              "
              href="javascript:;"
              class="blue"
            >
              {{ scope.row.columnName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$version.tableHeader.inTable"
          prop="tableName"
          show-overflow-tooltip
          min-width="100"
        >
          <template slot-scope="scope">
            <a
              @click="onTableClick(scope.row.tableObjectId)"
              href="javascript:;"
              class="blue"
            >
              {{ scope.row.tableName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$version.tableHeader.inDatabase"
          prop="modelName"
          show-overflow-tooltip
          min-width="150"
        >
          <template slot-scope="scope">
            <a>{{ scope.row.modelName }}</a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.domain.ruleNum')"
          show-overflow-tooltip
          min-width="150"
        >
          <template slot-scope="scope">
            <a>{{ scope.row.ruleCounts }}</a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('domain.domain.problemNum')"
          show-overflow-tooltip
          min-width="150"
        >
          <template slot-scope="scope">
            <a>{{ scope.row.problemCounts }}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('domain.domain.mappingResult')" width="200">
          <template slot-scope="scope">
            <div style="position: relative; height: 27px">
              <!-- <el-progress style="position: absolute;top: 3px;width:150px" :percentage="0"></el-progress> -->
              <p
                style="
                  float: left;
                  position: relative;
                  top: 3px;
                  width: 80px;
                  font-size: 14px;
                "
              >
                {{ scope.row.status }}
              </p>
              <el-button
                v-show="scope.row.status && !Boolean($route.query.isAssets)"
                style="
                  float: left;
                  position: relative;
                  top: 7px;
                  margin-left: -20px;
                  padding: 0;
                  height: 16px;
                  z-index: 3;
                "
                type="text"
                @click="go2domainVertify(scope.row.verObj)"
                size="mini"
              >
                {{ $t('domain.common.details') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$version.tableHeader.operation"
          width="85"
          v-if="!Boolean($route.query.isAssets)"
        >
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="preUnbind(scope.row)">
              {{ $t('common.button.unbind') }}
            </el-button>
          </template>
        </el-table-column>
      </datablau-table>
      <datablau-pagination
        style="float: right; padding-top: 10px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        :layout="'total, sizes, prev, pager, next'"
        :total="total"
        v-show="data && data.length > 0"
      ></datablau-pagination>
    </div>

    <!--ddm 引用情况, 只要 ddm 启动, 就显示-->
    <div class="top-box" v-if="ddmEnabled">
      <div class="data-box">
        <p class="fl">模型库中被字段引用数：</p>
        <div class="num">
          {{ ddmCnt }}
        </div>
      </div>
    </div>

    <div class="table-container" v-show="ddmEnabled">
      <datablau-table border size="small" :data="ddmData">
        <el-table-column type="index" label="#" width="44"></el-table-column>
        <el-table-column
          prop="columnName"
          show-overflow-tooltip
          :label="$version.tableHeader.columnName"
          min-width="100"
        ></el-table-column>
        <el-table-column
          :label="$version.tableHeader.inTable"
          prop="tableName"
          show-overflow-tooltip
          min-width="100"
        ></el-table-column>
        <el-table-column
          :label="$version.tableHeader.inModel"
          prop="modelPath"
          min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <a>{{ scope.row.modelPath }}/{{ scope.row.modelName }}</a>
          </template>
        </el-table-column>
      </datablau-table>

      <datablau-pagination
        style="float: right; padding-top: 10px"
        @size-change="handleSizeChangeDdm"
        @current-change="handleCurrentChangeDdm"
        :current-page="currentPageDdm"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSizeDdm"
        :layout="'total, sizes, prev, pager, next'"
        :total="ddmCnt"
        v-show="ddmData && ddmData.length > 0"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  props: ['domainId', 'domainCode', 'categoryTypeId'],
  mounted() {
    setTimeout(() => {
      this.getData()
      this.getDDMData()
    }, 200)
  },
  beforeDestroy() {
    $(window).unbind('resize')
  },
  updated() {},
  data() {
    return {
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      ddmData: [],
      ddmCnt: 0,
      currentPageDdm: 1,
      pageSizeDdm: 10,
      pieData: '0%',
      visit: 0,
      useDam: this.$damEnabled,
      appName: HTTP.$appName,
      ddmEnabled: window.setting.servicesAlive.ddm === true,
      // useDam: true,
    }
  },
  methods: {
    getPiedata2Percent(pieData) {
      let result = '0%'
      let full = pieData[this.$t('domain.verification.completeMapping')] || 0
      if (!isNaN(full - 0)) {
        full = full - 0
      } else {
        full = 0
      }
      const total = this.tableData ? this.tableData.length : 0
      if (full > 0 && total > 0) {
        result = parseInt((full * 100) / total) + '%'
      }
      return result
    },
    go2domainVertify(obj) {
      const json = JSON.stringify(obj)
      localStorage.setItem('domainVertifyObj', json)
      window.open(`${location.pathname}#/main/domainVertify?edit=on`)
      // this.$store.commit('setCurrentDomainVertifyObj',testObj)
      // this.$router.push({name:'domainVertify'})
    },
    getDomainVerifyPie() {
      this.$http
        .get(`${this.$url}/service/domains/domainVerifyPie/${this.domainId}`)
        .then(res => {
          this.pieData = this.getPiedata2Percent(res.data)
        })
    },
    handleSizeChangeDdm(val) {
      this.currentPageDdm = 1
      this.pageSizeDdm = val
      this.getDDMData()
    },
    handleCurrentChangeDdm(val) {
      this.currentPageDdm = val
      this.getDDMData()
    },
    getDDMData() {
      // 如果有 ddm, 则获取 ddm 数据
      if (!this.domainId || !this.ddmEnabled) {
        return
      }
      HTTP.getDdmDomainUsage({
        pageSize: this.pageSizeDdm,
        currentPage: this.currentPageDdm,
        domainCode: this.domainCode,
      })
        .then(res => {
          try {
            res.data = JSON.parse(res.data)
          } catch (e) {
            console.log(e)
          }
          if (!res.data) {
            this.ddmData = []
            this.ddmCnt = 0
          } else {
            this.ddmData = res.data.items
            this.ddmCnt = res.data.totalItems
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getData()
    },
    getData() {
      if (!this.domainId || !this.$damEnabled) {
        return
      }

      this.$http
        .post(`/domain/domains/domain/getDomainUsagesPage`, {
          domainId: this.domainId,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        })
        .then(res => {
          this.tableData = _.cloneDeep(res.data.content)
          this.getStatus(_.cloneDeep(res.data.content))
          this.total = res.data.totalItems
          this.getDomainVerifyPie()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getStatus(currentData) {
      this.$http
        .get(
          `${this.$url}/service/domains/domainVerifyInfo?currentPage=1&pageSize=2000&keyword=&status=&theme=&modelCategoryId=&orderBy=updateTime&sort=desc&domainId=${this.domainId}`
        )
        .then(res => {
          currentData.forEach(v => {
            res.data.content.forEach(item => {
              if (item.objectId === v.columnObjectId) {
                v.status = item.status
                v.verObj = item
              }
            })
          })
          this.tableData = currentData
        })
    },
    preUnbind(row) {
      const objectId = row.columnObjectId
      const domainId = this.domainId
      this.$DatablauCofirm(this.$version.domain.long.unbind, '', {
        type: 'warning',
      })
        .then(() => {
          this.unbind(objectId, domainId)
        })
        .catch(() => {
          this.$message.info(this.$version.common.operationCancelled)
        })
    },
    unbind(objectId, domainId) {
      this.$http
        .delete(`${this.$url}/service/domains/${domainId}/columns/${objectId}`)
        .then(res => {
          this.getData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    unbindAll() {
      this.$DatablauCofirm(this.$version.domain.long.unbind, '', {
        type: 'warning',
      })
        .then(() => {
          this.$http
            .post(
              `/domain/domains/domain/unbindDomainById?domainId=${this.domainId}`
            )
            .then(_ => {
              this.getData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$version.common.operationCancelled)
        })
    },
    onRowClick(row) {
      this.$router.push({
        name: 'dataCatalog',
        query: { table: row.tableObjectId, column: row.columnObjectId },
      })
    },
    onTableClick(objectId) {
      this.$router.push({ name: 'dataCatalog', query: { table: objectId } })
    },
    onColumnClick(table, column) {
      this.$router.push({
        name: 'dataCatalog',
        query: { table: table, column: column },
      })
    },
  },
  computed: {
    data() {
      var result = []
      this.tableData.forEach((item, index) => {
        const row = {
          num: index,
          columnName: item.columnName,
          tableName: item.tableName,
          modelName: item.modelName,
          columnObjectId: item.columnObjectId,
          tableObjectId: item.tableObjectId,
          status: item.status,
          verObj: item.verObj,
          problemCounts: item.problemCounts,
          ruleCounts: item.ruleCounts,
        }
        index < 9 && (row.num = '0' + (index + 1))
        result.push(row)
      })
      return result
    },
  },
}
</script>

<style lang="scss" scoped>
.noresult {
  height: 200px;
}
</style>
<style lang="scss">
$default-color: var(--base-font-color);
$aux-color: #777f9e;
#dataStandard-quoto {
  text-align: left;

  .top-box {
    width: 100%;
    height: 60px;

    p {
      font-size: 13px;
      line-height: 60px;
    }
    .num {
      float: right;
      font-size: 30px;
      line-height: 60px;
    }
    .data-box {
      min-width: 220px;
      padding: 0 20px;
      float: left;
      margin-right: 3.33%;
      width: 30%;
      height: 60px;
      background-color: #f6f6f6;
    }
    .fl {
      float: left;
    }
  }
  .info {
    font-size: 13px;
    float: left;
    clear: both;
    margin-top: 15px;
    margin-bottom: 30px;
    //margin-left:20px;
    // color:$aux-color;
  }
  .table-container {
    padding-top: 40px;
    padding-bottom: 50px;
    td {
      .cell {
        color: $default-color;
      }
    }
  }
}
</style>
