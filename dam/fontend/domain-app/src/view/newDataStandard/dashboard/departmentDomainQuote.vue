<template>
  <div class="dashboard-item">
    <!--sort by system / department abort-->
    <title-line
      :title-text="`${$t('domain.dashboard.domainSortBySystemGroup')} TOP20`"
    ></title-line>
    <div class="bottom-container">
      <div class="table-outer">
        <div
          class="table-item departments-table"
          v-if="currentTab === 'department'"
        >
          <datablau-table
            ref="departmentTable"
            :data="departmentTableData"
            :data-selectable="false"
            height="100%"
          >
            <el-table-column
              showOverflowTooltip
              prop="toName"
              :label="$t('domain.common.departmentName')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="theme"
              :label="$t('domain.common.themeName')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="categoryName"
              :label="$t('domain.common.systemName')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="refCount"
              :label="$t('domain.common.quote')"
              width="100"
            ></el-table-column>
          </datablau-table>
        </div>
        <div class="table-item theme-table" v-if="currentTab !== 'department'">
          <datablau-table
            ref="departmentTable"
            :data="departmentTableData"
            :data-selectable="false"
            height="100%"
            :row-style="{ cursor: 'pointer' }"
            @row-click="handleRowClick"
          >
            <el-table-column
              showOverflowTooltip
              :label="
                $i18n.locale === 'zh' ? $t('domain.common.orderIndex') : ''
              "
              :width="$i18n.locale === 'zh' ? 50 : 40"
            >
              <template slot-scope="scope">
                <span
                  class="start-index"
                  v-if="scope.$index + 1 < 4"
                  :class="{
                    'sort-first': scope.$index + 1 === 1,
                    'sort-second': scope.$index + 1 === 2,
                    'sort-third': scope.$index + 1 === 3,
                  }"
                >
                  <i class="el-icon-star-on"></i>
                  <span class="index-num">{{ scope.$index + 1 }}</span>
                </span>
                <span class="index-span" v-else>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="theme"
              :label="$t('domain.common.themeName')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="categoryName"
              :label="$t('domain.common.systemName')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="domainName"
              :label="$t('domain.common.domainName')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              showOverflowTooltip
              prop="refCount"
              :label="$t('domain.common.quote')"
              width="100"
              align="right"
              :formatter="insertComma"
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
  name: 'departmentDomainQuote',
  data() {
    return {
      loading: false,
      echartsInstance: null,
      getOrganizations: null,
      getCount: null,
      getThemeCount: null,
      currentTab: 'theme',
      buttonIndex: 1,
      showButtons: true,
      departmentTableData: null,
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
      this.countByTheme()
    },
    countByDepartment() {
      this.loading = true
      const getCount = HTTP.dashboardDomainDepartmentCount({
        pageSize: 40,
        currentPage: 1,
        categoryName: '',
        toName: '',
      })
      if (!this.getCount) {
        this.getCount = getCount
      }
      getCount
        .then(res => {
          let departmentTableData = res.data
          this.departmentTableData = departmentTableData.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    countByTheme() {
      this.loading = true
      const getThemeCount = HTTP.dashboardDomainThemeCount({
        theme: '',
        categoryName: '',
        domainName: '',
        domainCode: '',
        pageSize: 20,
        currentPage: 1,
      })
      if (!this.getThemeCount) {
        this.getThemeCount = getThemeCount
      }
      getThemeCount
        .then(res => {
          let departmentTableData = res.data
          this.departmentTableData = departmentTableData.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
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
      // console.log(row, 'row')
      let originData = row
      this.$skip2Domain(originData.domainId)
    },
    async getCategoryAuth(categoryId) {
      let bool = false
      if (categoryId < 4) {
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
      if (newVal === 'theme') {
        this.countByTheme()
      } else {
        this.countByDepartment()
      }
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
        bottom: 20px;
        //border: 1px solid red;
      }

      .departments-table {
      }
    }
  }

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

  /deep/ .is-block + .is-block {
    margin-left: 0;
    //border-left: transparent;
  }
}
</style>
