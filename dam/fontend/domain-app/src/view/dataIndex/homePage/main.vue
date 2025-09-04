<template>
  <div class="home-page">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="showApplyDetails"
      custom-class="apply-detail-dialog"
      :append-to-body="true"
      width="960px"
      class="my-apply-dia"
    >
      <div class="dialog-outer detail-dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
        ></apply-detail>
      </div>
    </datablau-dialog>
    <div class="home-page-top">
      <div class="top-main">
        <el-tag>{{ $t('indicator.home.tag') }}</el-tag>
        <div class="searchBox">
          <el-select v-model="model">
            <el-option
              v-for="item in optionsList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-input
            :placeholder="'搜索指标编码、指标名称、英文名称'"
            v-model="keyword"
            @keyup.native.enter="search"
            size="small"
          >
            <i
              slot="suffix"
              class="el-input__icon el-icon-search"
              style="cursor: pointer"
              @click="search"
            ></i>
          </el-input>
        </div>

        <div class="search-result">
          <span>{{ $t('indicator.home.recent') }}</span>
          <el-button
            type="text"
            v-for="(item, index) in currentKw"
            :key="item.value + index"
            @click.native="handleCurrentKw(item)"
          >
            {{ item.value }}
          </el-button>
        </div>
      </div>
    </div>
    <div class="home-page-bottom">
      <div class="home-page-bottom-item">
        <div class="title">{{ $t('indicator.home.publish') }}</div>
        <div class="table-box" v-if="currentIndexData.length">
          <el-table
            :data="currentIndexData"
            :show-header="false"
            class="datablau-table"
            @row-click="handleRowClick"
            row-class-name="row-can-click"
            style="width: 100%"
          >
            <el-table-column
              prop="chineseName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="firstPublish"
              :formatter="$timeFormatter"
              width="150px"
            ></el-table-column>
          </el-table>
        </div>
        <div class="no-data-tip" v-else>{{ $t('component.table.noData') }}</div>
      </div>
      <div class="home-page-bottom-item">
        <div class="title">{{ $t('indicator.home.wait') }}</div>
        <div
          class="table-box"
          v-if="currentPendData && currentPendData.length > 0"
        >
          <el-table
            :data="currentPendData"
            :show-header="false"
            style="width: 100%"
          >
            <el-table-column
              prop="itemName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="startTime"
              :formatter="$timeFormatter"
              width="100px"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="handleTodoTask(scope.row)"
                >
                  {{ $t('indicator.home.approve') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="no-data-tip" v-else>{{ $t('component.table.noData') }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main.js'
import LDMTypes from '@constant/LDMTypes'
import applyDetail from '../../../view/processControl/applyDetail.vue'
export default {
  data() {
    return {
      dialogTitle: '',
      keyword: '',
      currentIndexData: [],
      currentServerData: [],
      currentPendData: [],
      currentKw: [],
      approveResult: '0',
      showApplyDetails: false,
      applyDetailData: [],
      optionsList: [
        { label: '原子/衍生指标', value: 1 },
        { label: '派生指标', value: 2 },
      ],
      model: 1,
    }
  },
  components: {
    applyDetail,
  },
  mounted() {
    this.getApplyPend()
    this.getCurrentSearch()
    this.getCurrentIndex()
    this.$bus.$on('completeTask', () => {
      this.showApplyDetails = false
      this.getApplyPend()
    })
  },
  beforeDestroy() {
    this.$bus.$off('completeTask')
  },
  methods: {
    handleTodoTask(data) {
      this.dialogTitle = data.processName
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.requestType = 2
      this.applyDetailData.processType = data.processType
    },
    handleRowClick(row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (row.categoryId === 5) {
        window.open(baseUrl + `main/indexDefinition?id=${row.domainId}`)
      } else {
        window.open(baseUrl + `main/forkIndexDefinition?id=${row.domainId}`)
      }
    },
    search() {
      // 衍生指标
      if (this.model === 1) {
        this.$router.push({
          name: 'indexDefinition',
          query: {
            keyword: this.keyword,
            types: LDMTypes.Index,
          },
        })
      } else if (this.model === 2) {
        // 派生指标
        this.$router.push({
          name: 'forkIndexDefinition',
          query: {
            keyword: this.keyword,
            types: LDMTypes.Index,
          },
        })
      }

      this.setHomePageKw(this.keyword, this.model)
    },
    getApplyPend() {
      HTTP.getApplyPend()
        .then(res => {
          this.currentPendData = res.data.value
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setHomePageKw(val, model) {
      let value = String(val).trim()
      if (value) {
        let homePageKw = localStorage.getItem('homePageKw')
        let obj = { value: value, model: model }
        if (homePageKw) {
          homePageKw = homePageKw + '||' + JSON.stringify(obj)
        } else {
          homePageKw = JSON.stringify(obj)
        }
        localStorage.setItem('homePageKw', homePageKw)
      }
    },
    getCurrentSearch() {
      let homePageKw = localStorage.getItem('homePageKw')
      if (homePageKw) {
        this.currentKw = [...new Set(homePageKw.split('||'))]
          .reverse()
          .slice(0, 10)
          .map(item => item && JSON.parse(item))
      }
    },
    handleCurrentKw(item) {
      // 衍生指标
      if (item.model === 1) {
        this.$router.push({
          name: 'indexDefinition',
          query: {
            keyword: item.value,
            types: LDMTypes.Index,
          },
        })
      } else if (item.model === 2) {
        // 派生指标
        this.$router.push({
          name: 'forkIndexDefinition',
          query: {
            keyword: item.value,
            types: LDMTypes.Index,
          },
        })
      }
    },
    getCurrentIndex() {
      const obj = {
        // domainCode: '',
        chineseName: '',
        domainState: 'A',
        folderId: null,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        categoryIds: [5, 6],
        // ownerOrg: '',
        orderColumn: ['firstPublish'],
        ascOrder: [false],
        currentPage: 1,
        pageSize: 25,
        // categoryId: '',
      }
      HTTP.getFolderListService(obj)
        .then(res => {
          this.currentIndexData = res.data.content
            .filter(i => i.firstPublish)
            .slice(0, 20)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.home-page {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  .home-page-top {
    width: 100%;
    height: 210px;
    .top-main {
      width: 40%;
      margin: 0 auto;
      padding-top: 6%;
      .el-tag {
        margin-bottom: 6px;
      }
      .search-result {
        margin-top: 10px;
      }
    }
  }
  .home-page-bottom {
    width: 70%;
    height: 450px;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    padding-bottom: 20px;
    margin: 0 auto;
  }
  .home-page-bottom-item {
    width: 45%;
    height: 100%;
    border: 1px solid #eee;
    position: relative;
    .title {
      margin: 6px;
      font-size: 18px;
    }
    .table-box {
      position: absolute;
      top: 40px;
      left: 0;
      bottom: 0;
      right: 0;
      overflow: scroll;
    }
    .no-data-tip {
      width: 100%;
      height: 100%;
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  }
}
.searchBox {
  display: flex;
  /deep/.el-select .el-input__inner {
    height: 32px;
    line-height: 32px;
    border-right: 0;
  }

  /deep/.el-input .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
}
</style>
