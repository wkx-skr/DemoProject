<template>
  <div class="db-richtip">
    <div class="topInfo">
      <datablau-icon
        class="topIcon"
        data-type="daima"
        :size="28"
      ></datablau-icon>
      <div class="info">
        <div class="code">{{ details.code }}</div>
        <el-form
          class="info-form"
          :inline="true"
          :model="details"
          style="margin-top: 15px"
        >
          <el-form-item
            class="info-form-span"
            :label="$t('component.richtip.daima_chineseName')"
          >
            <datablau-tooltip
              class="item"
              effect="dark"
              :content="details.name"
              placement="top-start"
              :open-delay="200"
            >
              <span class="nowrap-span">
                {{ details.name }}
              </span>
            </datablau-tooltip>
          </el-form-item>
          <el-form-item
            class="info-form-span"
            :label="$t('component.richtip.daima_standardTheme')"
          >
            <datablau-tooltip
              class="item"
              effect="dark"
              :content="details.datasetName"
              placement="top-start"
              :open-delay="200"
            >
              <span class="nowrap-span">
                {{ details.datasetName }}
              </span>
            </datablau-tooltip>
          </el-form-item>

          <el-form-item
            class="info-form-span form_oneline"
            :label="$t('component.richtip.daima_remark')"
          >
            <datablau-tooltip
              class="item"
              effect="dark"
              :content="details.comment"
              placement="top-start"
              :open-delay="200"
            >
              <span class="nowrap-span">
                {{ details.comment }}
              </span>
            </datablau-tooltip>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="table-box" ref="tableBox">
      <datablau-table
        ref="tableref"
        :data="tableDataShow"
        height="200px"
        max-height="200px"
        :empty-text="$t('component.richtip.daima_emptyText')"
        :svgSize="160"
        svgType="search"
        @sort-change="handleSortChange"
      >
        <el-table-column
          :label="$t('component.richtip.daima_orderNum')"
          prop="order"
          sortable="custom"
          min-width="80"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('component.richtip.daima_codeValue')"
          prop="value"
          sortable="custom"
          min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('component.richtip.daima_codeName')"
          prop="name"
          sortable="custom"
          min-width="120"
          show-overflow-tooltip
        ></el-table-column>

        <el-table-column
          :label="$t('component.richtip.daima_mapCodeValue')"
          :min-width="120"
          v-if="categoryId !== 1"
        >
          <template slot-scope="scope">
            {{ scope.row.refValue ? scope.row.refValue.value : '' }}
          </template>
        </el-table-column>
      </datablau-table>
      <datablau-button
        class="showMore"
        type="text"
        v-show="showMore"
        @click="gotoDaima"
      >
        {{ $t('component.richtip.daima_showMore') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
export default {
  props: {
    dataId: {
      type: String,
      default: '',
    },
    categoryId: {
      type: [String, Number],
      default: 1,
    },
  },
  data() {
    return {
      visible: true,
      details: {},
      valueSave: [],
      tableDataShow: [],
      sortData: {},
      currentPage: 1,
      pageSize: 10,
      showMore: false,
    }
  },
  beforeMount() {},
  computed: {
    gszcCustomer() {
      return this.$customerId === 'gszc'
    },
  },
  created() {},
  mounted() {
    /* let dom = this.$refs.tableref.$el.querySelector('.el-table__body-wrapper')
  dom.addEventListener('scroll', () => {
     // 滚动距离
     let scrollTop = dom.scrollTop
     // 可视区的高度
     let windowHeight = dom.clientHeight
     // 滚动条的总高度
     let scrollHeight = dom.scrollHeight
     if (scrollTop + windowHeight === scrollHeight) {
       this.showMore = this.totalShow > 9
     } else {
       this.showMore = false
     }
   }) */
  },
  methods: {
    getData() {
      this.showMore = false
      this.getCodeDetail()
    },
    gotoDaima() {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl + 'main/dataStandard/code?code=' + this.dataId,
        '_blank'
      )
    },
    getCodeDetail() {
      this.showLoading = true
      HTTP.getCodeContent({
        codeNumber: this.dataId,
        categoryId: 1,
      })
        .then(res => {
          this.showLoading = false
          this.details = res.data
          this.valueSave = res.data.values
          this.resetPageData({
            currentPage: this.currentPage,
          })
        })
        .catch(e => {
          this.showLoading = false
          this.$showFailure(e)
        })
    },
    handleSortChange(sortData) {
      this.sortData = sortData
      this.resetPageData({
        sortData: sortData,
      })
    },
    resetPageData({ currentPage, pageSize, keyword, sortData }) {
      if (!this.valueSave) {
        this.showLoading = false
        return
      }
      if (currentPage) {
        sortData = sortData || this.sortData
      }
      keyword = ''
      sortData = sortData || {}
      currentPage = currentPage || 1
      this.currentPage = currentPage
      pageSize = pageSize || this.pageSize
      const arr = []
      this.valueSave.forEach(item => {
        let bool = false
        const testArr = ['name', 'value']
        testArr.forEach(attr => {
          if (
            item[attr] &&
            item[attr].toLowerCase().indexOf(keyword.toLowerCase()) !== -1
          ) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      if (!sortData || !sortData.prop || !sortData.sort) {
        this.$utils.sort.sortConsiderChineseNumber(arr, 'order')
      } else if (sortData && sortData.prop) {
        this.$utils.sort.sortConsiderChineseNumber(arr, sortData.prop)
      }
      if (sortData.prop && sortData.order === 'descending') {
        arr.reverse()
      }
      this.totalShow = arr.length
      this.showMore = this.totalShow > 10
      /* const resultArr = arr.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ) */
      const resultArr = arr.slice(0, 10)
      this.$nextTick(() => {
        this.tableDataShow = resultArr.map(item => {
          const result = _.cloneDeep(item)
          delete result.children
          return result
        })
      })
      this.showLoading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.db-richtip {
  /deep/ .table-box {
    .el-table th .cell {
      font-weight: bold;
    }
  }
}
</style>
<style lang="scss" scoped>
@import '../richtip.scss';
@import '../../../basic/color.sass';
.db-richtip {
  .info {
    /deep/.info-form {
      max-width: 412px;
      margin-top: 0 !important;
      .info-form-span {
        width: calc(50% - 10px);
        margin: 0;
        line-height: 20px;
        height: 20px;
        &:nth-child(odd) {
          margin-right: 20px;
        }
        .item {
          width: 100%;
        }
        .el-form-item__label {
          line-height: 20px !important;
          padding-right: 0 !important;
          font-size: 12px;
          font-weight: 400;
          color: $grey-2;
          padding: 0;
        }
        .el-form-item__content {
          width: calc(100% - 60px);
          font-size: 12px;
          font-weight: 400;
          color: $grey-2;
          line-height: 20px !important;
          position: relative;
          top: 2px;
          .nowrap-span {
            width: 100%;
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 20px;
          }
        }
        &.form_oneline {
          width: 100%;
          margin-right: 0;
          .el-form-item__content {
            width: calc(100% - 36px);
          }
        }
      }
    }
  }
  .table-box {
    .el-table.datablau-table td {
      height: 32px;
    }
  }
  .showMore {
    margin-left: calc(50% - 24px);
    display: inline-block;
    height: 24px;
    line-height: 24px;
  }
}
</style>
