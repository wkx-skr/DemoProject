<template>
  <div class="dashboard-item">
    <title-line :title-text="`${$t('domain.dashboard.domainSortByInfluence')}`">
      <div class="tab-outer">
        <el-button-group :key="buttonIndex" v-if="showButtons && false">
          <datablau-button
            @click="tabClick('first')"
            :type="currentTab === 'first' ? 'normal' : 'secondary'"
          >
            TOP10
          </datablau-button>
          <datablau-button
            @click="tabClick('second')"
            :type="currentTab === 'second' ? 'normal' : 'secondary'"
            v-if="allListData && allListData.length > 10"
          >
            TOP20
          </datablau-button>
        </el-button-group>
      </div>
    </title-line>
    <div class="bottom-container">
      <div class="table-outer">
        <div class="table-item theme-table">
          <datablau-table
            ref="departmentTable"
            :data="showData"
            :data-selectable="false"
            height="100%"
            :show-header="false"
            :row-style="{ cursor: 'pointer' }"
            @row-click="handleRowClick"
          >
            <el-table-column
              showOverflowTooltip
              :label="$t('domain.common.orderIndex')"
              width="50"
            >
              <template slot-scope="scope">
                <span
                  class="start-index"
                  v-if="scope.row.index < 4"
                  :class="{
                    'sort-first': scope.row.index === 1,
                    'sort-second': scope.row.index === 2,
                    'sort-third': scope.row.index === 3,
                  }"
                >
                  <i class="el-icon-star-on"></i>
                  <span class="index-num">{{ scope.row.index }}</span>
                </span>
                <span class="index-span" v-else>{{ scope.row.index }}</span>
              </template>
            </el-table-column>

            <el-table-column
              showOverflowTooltip
              prop="label"
              :label="$t('domain.common.domainName')"
              min-width="150"
            ></el-table-column>

            <el-table-column
              showOverflowTooltip
              prop="theme"
              :label="$t('domain.common.standardTheme')"
              min-width="100"
            ></el-table-column>

            <el-table-column
              showOverflowTooltip
              prop="value"
              :label="$t('domain.common.quote')"
              align="right"
              :formatter="insertComma"
              width="80"
            ></el-table-column>
          </datablau-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import titleLine from './titleLine'
import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'

export default {
  name: 'domainQuoteTop',
  data() {
    return {
      loading: false,
      getCount: null,
      currentTab: 'first',
      buttonIndex: 1,
      showButtons: true,
      allListData: [],
      showData: null,
    }
  },
  components: {
    titleLine,
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.countByDepartment()
    },
    countByDepartment() {
      this.loading = true
      const getCount = HTTP.dashboardDomainCount()
      if (!this.getCount) {
        this.getCount = getCount
      }
      getCount
        .then(res => {
          let count = res.data.domainUsedDetailCount || []
          let arr = []
          count.forEach(item => {
            arr.push({
              label: item.domainName,
              value: item.usedNumber,
              theme: item.theme,
              originData: item,
            })
          })
          arr.sort((a, b) => b.value - a.value)
          arr.forEach((item, index) => {
            item.index = index + 1
          })
          this.allListData = arr
          this.getShowData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getShowData() {
      let arr = []
      // if (this.currentTab === 'first') {
      //   arr = this.allListData.slice(0, 10)
      // } else {
      //   arr = this.allListData.slice(10, 20)
      // }
      arr = this.allListData.slice(0, 20)
      this.showData = arr
    },

    tabClick(tabName) {
      this.showButtons = false
      this.currentTab = tabName

      this.$nextTick(() => {
        this.buttonIndex++
        this.showButtons = true
      })
    },
    indexMethod(index) {
      return index + 1
    },
    handleRowClick(row, column, event) {
      let originData = row.originData
      this.getCategoryAuth(originData.categoryId)
        .then(res => {
          if (res) {
            this.$skip2Domain(originData.domainId)
          } else {
            this.$datablauMessage({
              message: this.$t('domain.common.permissionDenied'),
              type: 'info',
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async getCategoryAuth(categoryId) {
      let bool = false
      if (categoryId <= 4) {
        bool = true
      } else {
        let auth = await HTTP.getFolderAuthService({
          username: this.$user.username,
          folderId: categoryId,
        })
        if (auth.data !== 'NONE') {
          bool = true
        }
      }
      return bool
    },
    insertComma(row, column, cellValue, index) {
      return nUtils.insertComma(cellValue)
    },
  },
  watch: {
    currentTab(newVal) {
      this.getShowData()
    },
  },
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.dashboard-item {
  background-color: #fff;
  position: relative;

  .bottom-container {
    @include absPos();
    top: 47px;

    .table-outer {
      @include absPos();

      .table-item {
        @include absPos();
        left: 20px;
        right: 20px;
        bottom: 17px;
        //border: 1px solid red;
        .start-index {
          position: relative;
          display: inline-block;
          text-align: center;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          //border: 1px solid red;

          .el-icon-star-on {
            font-size: 28px;
            position: absolute;
            left: 050%;
            transform: translate(-50%, -50%);
            top: 50%;
          }

          .index-num {
            position: relative;
            z-index: 2;
            //position: absolute;
            color: #fff;
            line-height: 20px;
            font-size: 12px;
            //top: -1px;
          }

          &.sort-first {
            background: rgba(244, 101, 101, 0.2);

            .el-icon-star-on {
              color: #f46565;
            }
          }

          &.sort-second {
            background: rgba(237, 164, 67, 0.2);

            .el-icon-star-on {
              color: #eda443;
            }
          }

          &.sort-third {
            background: rgba(224, 198, 90, 0.2);

            .el-icon-star-on {
              color: #e0c65a;
            }
          }
        }

        .index-span {
          display: inline-block;
          text-align: center;
          width: 20px;
          height: 20px;
          background: #efefef;
          border-radius: 50%;
          line-height: 20px;
        }
      }
    }
  }

  /deep/ .is-block + .is-block {
    margin-left: 0;
    //border-left: transparent;
  }
}
</style>
