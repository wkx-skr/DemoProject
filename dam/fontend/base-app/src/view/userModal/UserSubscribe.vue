<template>
  <div class="user-subscribe">
    <div class="tab-topLine">
      <p class="tab-title">{{ $t('userPane.title.mySubscription') }}</p>
      <div class="vertical-middle top-line-inner">
        <datablau-input
          :iconfont-state="true"
          :placeholder="$t('common.placeholder.normal')"
          prefix-icon="el-icon-search"
          v-model="keyword"
          :clearable="true"
        ></datablau-input>
      </div>
    </div>
    <div class="table-box">
      <datablau-form-submit class="table-row">
        <datablau-table
          ref="deTable"
          :data="tableData"
          v-loading="tableLoading"
          height="100%"
        >
          <el-table-column
            :label="$t('userPane.favourites.item')"
            min-width="600"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <datablau-icon
                :data-type="'datastandard'"
                :key="scope.row.id"
                :size="18"
                v-if="
                  scope.row.typeId === 80010066 &&
                  (scope.row.domainFolderId === 1 ||
                    scope.row.domainFolderId >= 4)
                "
                style="position: relative; top: 3px"
              ></datablau-icon>
              <datablau-icon
                :data-type="'index'"
                :key="scope.row.id"
                :size="18"
                v-if="
                  scope.row.typeId === 80010066 &&
                  scope.row.domainFolderId === 2
                "
                style="position: relative; top: 3px"
              ></datablau-icon>
              <datablau-icon
                :url="'static/userCenter/dataSource.png'"
                :key="scope.row.id"
                :size="18"
                v-if="
                  (scope.row.typeId === 80010001 ||
                    scope.row.typeId === 82800036) &&
                  scope.row.flag === 0
                "
                style="position: relative; top: 3px"
              ></datablau-icon>
              <img
                class="tableIcon"
                style="width: 18px; height: auto; position: relative; top: 0px"
                v-if="scope.row.typeId === 80000005 && scope.row.flag === 1"
                src="../../assets/images/search/column.svg"
                alt=""
              />
              <span style="padding-left: 10px">{{ scope.row.objectName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.subscription.addingDate')"
            min-width="250px"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ $timeFormatter(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('userPane.userPane.operation')"
            :width="$i18n.locale === 'en' ? 180 : 150"
            fixed="right"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="mini"
                @click="jump(scope.row)"
                style="margin-right: 10px"
              >
                {{ $t('domain.common.check') }}
              </el-button>
              <el-button type="text" size="small" @click="scan(scope.row)">
                {{ $t('domain.common.cancelSubscribe') }}
              </el-button>
            </template>
          </el-table-column>
        </datablau-table>
        <!--    </div>-->
        <!--    <div class="tab-bottomLine"></div>-->
        <template slot="buttons">
          <datablau-pagination
            @size-change="changePageSize"
            @current-change="changeCurrentPage"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>
<script>
import agTableComponent from '@/components/common/agTableComponent'
import MyScanRenderer from './MyScanRenderer.js'
import SubscribeController from '../../../../base-components/http/baseController/SubscribeController'
export default {
  components: { agTableComponent },
  data() {
    return {
      gridApi: null,
      columnApi: null,
      gridOptions: {
        rowSelection: false,
      },
      tableData: null,
      tableDataOfSource: null,
      tableDataOfModel: null,
      frameworkComponents: null,
      keyword: '',
      tableLoading: true,
      currentPage: 1,
      pageSize: 20,
      total: 0,
    }
  },
  beforeMount() {
    const cellStyle = {}
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
    this.$bus.$on('removeDisSubscribe', () => {
      this.prepareTableData()
    })
  },
  mounted() {
    this.prepareTableData()
  },
  methods: {
    changePageSize(val) {
      this.pageSize = val
      this.currentPage = 1
      this.prepareTableData()
    },
    changeCurrentPage(val) {
      this.currentPage = val
      this.prepareTableData()
    },
    jump(data) {
      if (data.typeId === 82800036 && data.flag === 0) {
        window.open(
          this.BaseUtils.RouterUtils.getFullUrl('dataSource', {
            id: data.objId,
          })
        )
      } else if (data.typeId === 80010001 && data.flag === 0) {
        this.$http
          .get(this.$meta_url + `/models/${data.objId}/plain`)
          .then(res => {
            if (res.data.type === 'SMBSHAREFILE') {
              const pos = location.href.indexOf('#/')
              const baseUrl = location.href.slice(0, pos + 2)
              window.open(baseUrl + 'main/metaFolder')
            } else {
              window.open(
                this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
                  modelId: data.objId,
                })
              )
            }
          })
          .catch(e => {})
      } else {
        let routeData
        if (data.typeId === 80010001 && data.flag === 1) {
          routeData = this.$router.resolve({
            name: 'ddm',
            query: {
              modelId: data.objId,
              path: data.objectName,
            },
          })
          window.open(routeData.href, '_blank')
        } else if (data.typeId === 80010066) {
          this.$skip2Domain(data.objId)
        }
      }
    },
    scan(data) {
      this.$DatablauCofirm(this.$t('meta.DS.message.sureToUnsubscribe'))
        .then(() => {
          SubscribeController.deleteSubscribe({
            subId: data.id,
          })
            .then(_ => {
              this.$getSubscribe(() => {
                this.prepareTableData()
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    prepareTableData() {
      this.tableData = []
      let param = {
        keyword: this.keyword,
        typeId: '',
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        desc: false,
      }
      SubscribeController.loadUserSubPage({
        requestBody: param,
      })
        .then(res => {
          this.total = res.data.totalItems
          this.tableData = res.data.content
          this.tableLoading = false
          if (
            (res.data.content.length === 0 || !res.data.content) &&
            this.currentPage > 1
          ) {
            this.currentPage -= 1
            this.prepareTableData()
          }
          // this.tableData = res.data.filter(e => e.typeId === 80010066)
          // this.tableDataOfSource = res.data.filter(e => e.typeId === 80010001 && e.flag === 0)
          // this.tableDataOfModel = res.data.filter(e => e.typeId === 80010001 && e.flag === 1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // this.setTableHeight()
    },
    setTableHeight() {
      if (this.$refs.domainsTable && this.tableData) {
        if (this.tableData.length <= 6) {
          this.$refs.domainsTable.$el.style.height =
            40 * this.tableData.length + 40 + 'px'
        } else {
          this.$refs.domainsTable.$el.style.height = '300px'
        }
      }
      if (this.$refs.sourceTable && this.tableDataOfSource) {
        if (this.tableDataOfSource.length <= 6) {
          this.$refs.sourceTable.$el.style.height =
            40 * this.tableDataOfSource.length + 40 + 'px'
        } else {
          this.$refs.sourceTable.$el.style.height = '300px'
        }
      }
      if (this.$refs.modelTable && this.tableDataOfModel) {
        if (this.tableDataOfModel.length <= 6) {
          this.$refs.modelTable.$el.style.height =
            40 * this.tableDataOfModel.length + 40 + 'px'
        } else {
          this.$refs.modelTable.$el.style.height = '300px'
        }
      }
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
      //        this.setTableHeight();
    },
    initAgGrid() {
      this.$refs.domainsTable.sizeColumnsToFit()
    },
  },
  watch: {
    keyword(newVal) {
      this.prepareTableData()
    },
  },
}
</script>
<style scoped lang="scss">
@import './_main';
</style>
<style lang="scss">
.user-subscribe {
  position: absolute;
  top: 0;
  left: 160px;
  right: 0;
  bottom: 0;
  .tab-topLine {
    padding: 0 20px;
    .tab-title {
      height: 40px;
      line-height: 40px;
      font-weight: 600;
      font-size: 16px;
      color: #555;
    }
  }
  .table-box {
    position: absolute;
    top: 85px;
    left: 0;
    right: 0;
    bottom: 0;
  }
  tbody tr:last-of-type td {
    border-bottom: 1px solid #dddddd;
  }
}
</style>
