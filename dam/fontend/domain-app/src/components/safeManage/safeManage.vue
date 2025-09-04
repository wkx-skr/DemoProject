<template>
  <div class="safe-manage-page">
    <el-tabs
      type="card"
      class="new-page-card-tabs"
      :class="{ hideTab: !showTabs }"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <el-tab-pane label="敏感数据分布" name="dataSecurity" ref="dataSourceTab">
        <div class="data-security-tab">
          <div class="page-title-row" v-if="!showTabs">
            <span class="safe-page-title">安全概览</span>
          </div>
          <div class="top-echart-line">
            <div class="left-top all-system-count">
              <system-echart
                :getData="getPieData"
                :getAllTages="getAllTages"
                :colorMap="colorMap"
              ></system-echart>
            </div>
            <div class="right-top group-by-system">
              <every-system-count
                :safeTagCatalogName="safeTagCatalogName"
                :colorMap="colorMap"
                :getData="getESystemData"
                :getAllTages="getAllTages"
              ></every-system-count>
            </div>
          </div>
          <div class="bottom-table">
            <column-table
              ref="columnTable"
              :getAllTages="getAllTages"
              :safeTagCatalogName="safeTagCatalogName"
              :allUserData="allUserData"
              :allSafeType="allSafeType"
              :statusTypeArr="statusTypeArr"
              @editCol="editCol"
              @updataColData="updataColData"
            ></column-table>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-for="tab in tabsArr"
        :label="tab.label"
        :name="tab.name"
        :key="tab.id"
        closable
      >
        <edit-security
          v-if="tab.type === 'edit'"
          :oldData="tab.oldData"
          :statusTypeArr="statusTypeArr"
          :allUserData="allUserData"
          :allSafeType="allSafeType"
          :tabNameMap="tabNameMap"
          @updateSecurityInfo="updateSecurityInfo"
          @cancel="removeTab(tab.name)"
        ></edit-security>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import systemEchart from './systemCountEchart.vue'
import everySystemCount from './everySystemCount.vue'
import columnTable from './columnTable.vue'
import editSecurity from './editSecurity.vue'
import themeMixin from '@/components/common/themePick/themeMixin.js'
export default {
  mixins: [themeMixin],
  data() {
    return {
      getAllTages: null,
      allUserData: {},
      tagIdMap: null,
      tabNameMap: null,
      getPieData: null,
      getESystemData: null,
      colorMap: {
        default: '#CCCCCC',
        'L1-外部公开': '#36D692',
        'L2-内部公开': '#29A7CA',
        'L3-普通数据': '#4386F5',
        'L4-敏感数据': '#F04C5C',
        'L5-商密数据': '#8C5DFF',
      },
      safeTagCatalogName: '数据安全等级',
      // showTabs: false,
      defaultTabName: 'dataSecurity',
      currentTab: 'dataSecurity',
      tabsArr: [],
      statusTypeArr: ['未处理', '处理中', '已处理'],
      getAllSafeType: null,
      allSafeType: [],
    }
  },
  components: {
    systemEchart,
    everySystemCount,
    columnTable,
    editSecurity,
  },
  computed: {
    showTabs() {
      const arr = this.tabsArr
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  beforeMount() {
    this.refreshGetSafeType()
    this.setUserOptions()
    this.dataInit()
  },
  mounted() {},
  methods: {
    handleThemeChange(theme) {
      this.colorMap.default = theme === 'dark' ? '#444' : '#ccc'
    },
    dataInit() {
      this.refreshGetAllTags()
      this.setPieData()
      this.setEsystemData()
    },
    setPieData() {
      const url = `${this.$url}/service/tags/securityPie`
      this.getPieData = this.$http.get(url)
    },
    setEsystemData() {
      const url = `${this.$url}/service/tags/securityBar`
      this.getESystemData = this.$http.get(url)
    },
    refreshGetAllTags() {
      this.getAllTages = this.$http.get(`${this.$url}/service/tags/`)
      this.getAllTages
        .then(res => {
          const tagIdMap = {}
          const tabNameMap = {}
          const tagArr = res.data
          if (tagArr && Array.isArray(tagArr) && tagArr.length > 0) {
            tagArr.forEach(tag => {
              tagIdMap[tag.id] = tag
              tabNameMap[tag.name] = tag
            })
          }
          this.tagIdMap = tagIdMap
          this.tabNameMap = tabNameMap
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshGetSafeType() {
      const result = this.$http.get(`${this.$url}/service/tags/dataTypes`)
      this.getAllSafeType = result
      result
        .then(res => {
          let arr = []
          const data = res.data
          if (data && Array.isArray(data) && data.length > 0) {
            arr = data.filter(item => {
              return !!item
            })
          }
          this.allSafeType = arr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleResize() {},
    editCol(col) {
      // let tab = {
      //   name: col.id+'',
      //   label: col.objectPhysicalName,
      //   id: col.id,
      //   type: 'edit',
      //   oldData: col
      // };
      // this.addTab(tab);
      this.$router.push('/main/accessControl')
      setTimeout(() => {
        this.$bus.$emit('jumpToObject', {
          type: 'TABLE',
          object: { objectId: col.tableId },
        })
      }, 500)
    },
    removeTab(name) {
      const index = this.tabsArr.findIndex(item => {
        return item.name == name
      })
      if (index !== -1) {
        this.tabsArr.splice(index, 1)
        this.currentTab = this.defaultTabName
      }
    },
    addTab(tab) {
      const index = this.tabsArr.findIndex(item => {
        return item.id == tab.id
      })
      if (index === -1) {
        this.tabsArr.push(tab)
      }
      this.currentTab = tab.name
    },
    setUserOptions() {
      this.$http
        .get(`/user/usermanagement/users?includeDisabled=false`)
        .then(res => {
          let allUserData = {}
          const data = res.data
          allUserData = data
          this.allUserData = allUserData
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshTable() {
      if (this.$refs.columnTable && this.$refs.columnTable.refreshTable) {
        this.$refs.columnTable.refreshTable()
      }
    },
    updateSecurityInfo(col) {
      this.removeTab(col.id)
      this.refreshGetSafeType()
      this.refreshTable()
    },
    updataColData() {
      this.refreshGetSafeType()
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.safe-manage-page {
  position: relative;
  // border: 1px solid red;
  background-color: #fff;
  height: 100%;

  .new-page-card-tabs {
    top: 0;
    // height: 100%;
  }

  .data-security-tab {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    .page-title-row {
      padding: 0 10px 10px;
      .safe-page-title {
        display: inline-block;
        font-size: 22px;
        font-weight: bold;
        padding-top: 10px;
        line-height: 30px;
        // padding-bottom: 10px;
      }
    }
    .top-echart-line {
      position: relative;
      height: 300px;
      padding: 10px;
      .left-top,
      .right-top {
        display: inline-block;
        // position: relative;
        // width: 400px;
        border: 1px solid var(--border-color-lighter);
        width: 40%;
        height: 100%;
      }
      .right-top {
        width: 59%;
      }
    }
    .bottom-table {
      position: absolute;
      top: 302px;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  .hideTab {
    .top-echart-line {
      padding-top: 0;
    }
    .data-security-tab {
      .bottom-table {
        top: 360px;
      }
    }
  }
}
</style>
