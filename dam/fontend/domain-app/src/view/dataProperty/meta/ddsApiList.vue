<template>
  <div class="data-viste-page">
    <!--    <datablau-dialog
      :title="$t('meta.DS.tableDetail.dataService.applyApi')"
      :close-on-click-modal="false"
      :visible.sync="showApplyDetail"
      append-to-body
      width="900px"
    >
      <apply-info
        @applySuccess="applySuccess"
        @cancelItem="cancelItem"
        :applyDetail="applyApiData"
        v-if="showApplyDetail && applyApiData"
      ></apply-info>
    </datablau-dialog>-->
    <div class="table-url-card" v-if="tableDataShow.length > 0">
      <div
        class="url-card"
        :class="{ 'only-one-item': tableDataShow.length === 1 }"
        v-for="item in tableDataShow"
        :key="item.id"
        v-loading="!item.columns"
      >
        <p class="url-data-item">
          <datablau-icon
            class="icon-box"
            data-type="api"
            :size="24"
          ></datablau-icon>
          <span class="title api-name" @click="skipToDataShowPage(item)">
            {{ item.name }}
          </span>
          <span class="description">{{ item.description }}</span>
        </p>
        <p class="url-data-item">
          <span class="label">
            {{ $t('meta.DS.tableDetail.dataService.expirationTime') }}
          </span>
          <span class="data">
            {{ $timeFormatter(item.expire) || '-' }}
          </span>
        </p>
        <div class="url-data-item">
          <span class="label">API：</span>
          <div class="data">
            {{ baseURL }}{{ item.url }}
            <!--<el-button type="text" @click="copyUrl(`${baseURL}${item.url}`)" class="copy-btn">复制</el-button>-->
            <!--<el-button type="text" @click="skipToDataShowPage(item)" class="copy-btn">查询数据</el-button>-->
          </div>
        </div>
        <div class="url-data-item columns-list">
          <span class="label">
            {{ $t('meta.DS.tableDetail.dataService.viewColumn') }}
          </span>
          <div class="data">
            <span
              class="column-item"
              v-for="(item2, index) in item.columns"
              :key="item2.name"
            >
              <el-tag>
                {{ item2.name }} {{ item2.alias ? `(${item2.alias})` : '' }}
              </el-tag>
              <!--  <span-->
              <!--    class="column-name"-->
              <!--  >{{ item2.name }}</span><span-->
              <!--  class="column-type"-->
              <!--&gt;({{ item2.alias }})</span><span v-if="index !== item.columns.length-1">;</span>-->
            </span>
          </div>
        </div>
        <p class="url-data-item">
          <span class="label">
            {{ $t('meta.DS.tableDetail.dataService.returnVal') }}
          </span>
          <span class="data">JSON</span>
        </p>
        <div class="control-btn-container">
          <datablau-button
            type="text"
            @click="copyUrl(`${baseURL}${item.url}`)"
          >
            {{ $t('common.button.copy') }}
          </datablau-button>
          <datablau-button
            type="text"
            @click="applyApi(item)"
            v-if="hasAccessApply"
          >
            {{ $t('common.button.apply') }}
          </datablau-button>
          <!--APPLYING-->
          <!--<el-button type="text" class="copy-btn" :disabled="true" v-if="item.data.apiApplyStatus === 'APPLYING'">-->
          <!--  申请中-->
          <!--</el-button>-->
          <!--<el-button type="text" class="copy-btn" :disabled="true" v-if="item.data.apiApplyStatus === 'APPLY'">-->
          <!--  已申请-->
          <!--</el-button>-->
        </div>
      </div>
    </div>
    <div class="no-data-info" v-else>
      {{ $t('meta.DS.tableDetail.noData') }}
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
// import ddsHTTP from '@/view/dataAplication/ddsHTTP.js'
// import applyInfo from '@/view/dataAplication/apiOverview/applyInfo.vue'

export default {
  data() {
    return {
      hasAccessApply: this.$auth.API_DEVELOP_APPLYING,
      baseURL: '',
      tableDataShow: [],
      /* paraDataArr: [
        {
          name: '$sql',
          description:
            'SQL语句，需要经过BASE64转码，使用SQL语句时，所有其他参数会被忽略',
          example: 'SELECT * FROM table_name',
        },
        {
          name: '$select',
          description: '需要获取的列名',
          example: 'col_name1, col_name2',
        },
        {
          name: '$pageSize',
          description: '数据会分页返回，每页的数据条数，默认值：100',
          example: '100',
          // default: 100
        },
        {
          name: '$page',
          description: '数据会分页返回，返回的页数',
          example: '1',
        },
        {
          name: '$where',
          description: 'SQL语句的 where 条件',
          example: 'col_name=1',
        },
        {
          name: '$groupBy',
          description: '数据的分组依据，填入选择的列名',
          example: 'col_name1, col_name2',
        },
        {
          name: '$orderBy',
          description: '数据的排序依据，填入选择的列名',
          example: 'col_name1, col_name2',
        },
      ], */
      applyApiData: null,
      showApplyDetail: false,
      apiApplyStatus: '',
      // $sql=Base64(sql select)
      // $select=col1,col2
      // $page=currrentPageNumber
      // $pageSize=pageSize default 100
      // $where=where condition
      // $groupBy=col1,col2
      // $orderBy=col1,col2
      name: '',
      addMap: {},
      removedMap: {},
      loading: false,
    }
  },
  props: {
    apiList: {
      type: Array,
      required: true,
      default() {
        return []
      },
    },
  },
  components: {
    // applyInfo,
  },
  computed: {
    isApplyRole() {
      return (
        !(
          this.$isRole(
            this.$t('meta.DS.tableDetail.dataService.dataEngineer')
          ) ||
          this.$isRole(
            this.$t('meta.DS.tableDetail.dataService.dataServeManager')
          ) ||
          this.$isAdmin
        ) &&
        this.$isRole(this.$t('meta.DS.tableDetail.dataService.appEngineer'))
      )
    },
  },
  mounted() {
    /* ddsHTTP
      .getApiBaseurl()
      .then(res => {
        this.baseURL = res.data
      })
      .catch(e => {
        this.$showFailure(e)
      }) */
    // this.dataInit();
  },
  methods: {
    dataInit() {
      this.loading = true
      const arr = []
      this.apiList.forEach(item => {
        const obj = {
          name: item.name,
          creator: item.creator,
          // dependsOn: item.dependsOn.join(','),
          description: item.description,
          id: item.id,
          expire: item.effectiveTime || '',
          url: item.api,
          columns: null,
          data: item,
        }

        ddsHTTP
          .getApiDetail({
            id: obj.id,
          })
          .then(res => {
            obj.data = res.data.api
            obj.columns = res.data.responses
          })
          .catch(e => {
            this.$showFailure(e)
          })

        arr.push(obj)
      })
      this.tableDataShow = arr
      this.loading = false
    },
    applyApi(data) {
      this.proposeItem(data)
    },
    applySuccess() {
      this.showApplyDetail = false
      this.$showSuccess(this.$t('meta.DS.message.submitApplySucceed'))
      this.refreshTable()
    },
    cancelItem() {
      this.showApplyDetail = false
    },
    proposeItem(data) {
      // console.log(data, 'data')
      // data.e.stopPropagation();
      this.showApplyDetail = true
      this.applyApiData = data.data
      this.applyApiData.baseURL =
        this.baseURL.slice() + data.data.api + '/' + data.data.version
    },
    skipToUrlEdit(url) {},
    copyUrl(url) {
      const input = document.createElement('input')
      input.setAttribute('readonly', 'readonly')
      input.setAttribute('value', url)
      document.body.appendChild(input)
      input.focus()
      input.select()
      input.setSelectionRange(0, url.length)
      if (document.execCommand('copy')) {
        document.execCommand('copy', false, null)
        this.$message.success(this.$t('meta.DS.message.copySuccess'))
      }
      document.body.removeChild(input)
    },
    skipToDataShowPage(item) {
      this.$skip2({
        name: 'api',
        query: {
          apiId: item.data.id,
        },
      })
    },
  },
  watch: {
    apiList: {
      deep: true,
      immediate: true,
      handler: function () {
        // this.dataInit()
      },
    },
  },
}
</script>

<style lang="scss">
@import '../../../assets/styles/constForDDC.sass';

.data-viste-page {
  .table-line {
    position: relative;
    max-height: 600px;
  }

  .table-url-card {
    width: 100%;
    margin-bottom: 20px;
    position: relative;

    .url-card {
      border-bottom: $greyBorder2;
      width: 90%;
      margin: 20px 0 0 0;
      margin-left: 2%;
      position: relative;

      &.only-one-item {
        border-bottom: none;
      }

      .api-name {
        cursor: pointer;
        color: var(--color-primary);
      }

      .url-data-item {
        margin: 4px 0 4px 4px;
        position: relative;

        .title {
          font-weight: bold;
          font-size: 15px;
        }

        .icon-box {
          margin-right: 5px;
        }

        .description {
          padding-left: 10px;
          color: #a7a7a6;
          font-size: 12px;
        }

        .copy-btn {
          margin: 0;
          padding: 0;
          margin-left: 20px;
        }

        .label {
          display: inline-block;
          width: 50px;
          width: 60px;
          font-size: 12px;
          padding-top: 12px;
          text-align: right;
        }

        .data {
          display: inline-block;
          margin-left: 8px;
          // display: block;
          // margin-top: 10px;
          // width: 65%;
          // text-indent: 2em;
        }

        &.columns-list {
          //border: 1px solid red;

          .label {
            position: absolute;
          }

          .data {
            padding-top: 8px;
            margin-left: 65px;
          }
        }

        .para-data-table {
          margin: 10px 0 10px 0;
        }

        .column-item {
          display: inline-block;
          margin: 4px 6px 0 0;

          .column-name {
            // font-weight: bold;
          }
        }
      }
    }

    .para-contain {
      padding: 20px;

      .para-title {
        margin: 0 0 10px 0;
      }
    }

    .control-btn-container {
      position: absolute;
      //border: 1px solid red;
      top: 20px;
      right: 20px;
    }
  }

  .no-data-info {
    //border: 1px solid red;
    margin-top: 30px;
    font-size: 20px;
    color: #ccc;
  }
}
</style>
<style lang="scss">
@import '../../../assets/styles/constForDDC.sass';

.data-viste-page {
  // 自定义 table style
  .el-table__header-wrapper {
    border: 1px solid #dddddd;
  }

  .table-header-cell {
    background: #f6f6f6;
    height: 34px;
    color: #000;
    padding: 0 10px;
  }

  .table-check-box {
    text-align: center;
  }

  .view-table-cell {
    padding: 0 10px;
    line-height: 34px;

    .cell {
      line-height: 34px;
    }
  }
}
</style>
