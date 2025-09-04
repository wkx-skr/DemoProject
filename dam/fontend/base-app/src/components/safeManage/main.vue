<template>
  <div class="safe-manage-page" v-loading="loading">
    <ul class="security-summary-list">
      <li>
        <div class="bg-white">
          <h2>数据分级总体分布</h2>
          <system-echart
            :getData="getPieData"
            :getAllTages="getAllTages"
            :colorMap="colorMap"
          ></system-echart>
        </div>
      </li>
      <li>
        <div class="bg-white bg-image">
          <h2>数据等级统计</h2>
          <div class="data-panel shangmi">
            <p>{{ shangmiObj.value }}</p>
            <div class="name">
              {{ shangmiObj.name.replace(/^L[0-9]+-/g, '') }}
              <span class="hint">
                {{ '等级' + shangmiObj.name.match(/^L[0-9]+/g) }}
              </span>
            </div>
            <a @click="$router.push('/main/dataLevel?tagId=' + shangmiObj.id)">
              查看详情
              <i class="icon el-icon-arrow-right"></i>
            </a>
          </div>
        </div>
      </li>
      <li>
        <div class="bg-white bg-image">
          <h2>数据等级统计</h2>
          <div class="data-panel mingan">
            <p>{{ minganObj.value }}</p>
            <div class="name">
              {{ minganObj.name.replace(/^L[0-9]+-/g, '') }}
              <span class="hint">
                {{ '等级' + minganObj.name.match(/^L[0-9]+/g) }}
              </span>
            </div>
            <a @click="$router.push('/main/dataLevel?tagId=' + minganObj.id)">
              查看详情
              <i class="icon el-icon-arrow-right"></i>
            </a>
          </div>
        </div>
      </li>
      <li>
        <div class="bg-white bg-image">
          <h2>数据等级统计</h2>
          <div class="data-panel waibu">
            <p>{{ waibuObj.value }}</p>
            <div class="name">
              {{ waibuObj.name.replace(/^L[0-9]+-/g, '') }}
              <span class="hint">
                {{ '等级' + waibuObj.name.match(/^L[0-9]+/g) }}
              </span>
            </div>
            <a @click="$router.push('/main/dataLevel?tagId=' + waibuObj.id)">
              查看详情
              <i class="icon el-icon-arrow-right"></i>
            </a>
          </div>
        </div>
      </li>
      <li>
        <div class="bg-white bg-image">
          <h2>数据安全分类</h2>
          <div class="data-panel">
            <p>{{ systemSize }}</p>
            <div class="name">数据分类</div>
          </div>
        </div>
      </li>
      <li>
        <div class="bg-white">
          <h2>按照业务统计</h2>
          <folder-echart
            v-if="getFolderPieData && muluData"
            :getData="getFolderPieData"
            :colorMap="colorMap"
            :muluData="muluData"
          ></folder-echart>
        </div>
      </li>
      <li style="width: 50%">
        <div class="bg-white">
          <h2>数据分类敏感数据项统计</h2>
          <every-folder-count
            v-if="getFolderData && muluData"
            :safeTagCatalogName="safeTagCatalogName"
            :colorMap="colorMap"
            :getData="getFolderData"
            :getAllTages="getAllTages"
            :muluData="muluData"
          ></every-folder-count>
        </div>
      </li>
      <li>
        <div class="bg-white bg-image">
          <h2>涉及安全数据的业务系统</h2>
          <div class="data-panel">
            <p>{{ sSize }}</p>
            <div class="name">业务系统</div>
          </div>
        </div>
      </li>
      <li>
        <div class="bg-white bg-image">
          <h2>涉及业务部门</h2>
          <div class="data-panel">
            <p>{{ orgSize }}</p>
            <div class="name">组织部门</div>
          </div>
        </div>
      </li>
      <li style="width: 50%">
        <div class="bg-white">
          <h2>各系统安全标签统计</h2>
          <every-system-count
            v-if="getESystemData"
            :safeTagCatalogName="safeTagCatalogName"
            :colorMap="colorMap"
            :getData="getESystemData"
            :getAllTages="getAllTages"
          ></every-system-count>
          <component is="systemEchart"></component>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import systemEchart from './systemCountEchart.vue'
import folderEchart from './folderCountEchart.vue'
import everySystemCount from './everySystemCount.vue'
import columnTable from './columnTable.vue'
import editSecurity from './editSecurity.vue'
import themeMixin from '@/components/common/themePick/themeMixin.js'
import everyFolderCount from './everyFolderCount'
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
      getFolderData: null,
      getFolderPieData: null,
      colorMap: {
        default: '#CCCCCC',
        'L1-外部公开': '#52CBF0',
        'L2-内部公开': '#A756F4',
        'L3-普通数据': '#51A1FF',
        'L4-敏感数据': '#F8B95D',
        'L5-商密数据': '#FF7575',
      },
      safeTagCatalogName: '数据安全等级',
      // showTabs: false,
      defaultTabName: 'dataSecurity',
      currentTab: 'dataSecurity',
      tabsArr: [],
      statusTypeArr: ['未处理', '处理中', '已处理'],
      getAllSafeType: null,
      allSafeType: [],
      seriesData: [],
      shangmiObj: {
        name: '',
        value: 0,
        id: '',
      },
      minganObj: {
        name: '',
        value: 0,
        id: '',
      },
      waibuObj: {
        name: '',
        value: 0,
        id: '',
      },
      systemSize: 0,
      orgSize: 0,
      folderSize: 0,
      sSize: 0,
      muluData: null,
      loading: true,
    }
  },
  components: {
    systemEchart,
    everySystemCount,
    columnTable,
    editSecurity,
    everyFolderCount,
    folderEchart,
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
  mounted() {
    this.$bus.$on('security-all', seriesData => {
      this.seriesData = seriesData
      this.seriesData.forEach(data => {
        if (data.name.indexOf('商密数据') !== -1) {
          this.shangmiObj = data
        } else if (data.name.indexOf('敏感数据') !== -1) {
          this.minganObj = data
        } else if (data.name.indexOf('外部公开') !== -1) {
          this.waibuObj = data
        }
      })
      this.loading = false
    })
    this.$bus.$on('system-size', size => {
      this.sSize = size
    })
    this.$bus.$on('folder-size', size => {
      this.folderSize = size
    })
    this.getOrgNum()
    this.getSystemSize()
    this.getMuluData()
  },
  beforeDestroy() {
    this.$bus.$off('security-all')
    this.$bus.$off('system-size')
    this.$bus.$off('folder-size')
  },
  methods: {
    getSystemSize() {
      this.$http
        .get(this.$url + '/service/tags/dataAuth/dataType/count')
        .then(res => {
          this.systemSize = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getOrgNum() {
      this.$http
        .get(this.$url + '/service/tags/dataAuth/department/count')
        .then(res => {
          this.orgSize = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleThemeChange(theme) {
      this.colorMap.default = theme === 'dark' ? '#444' : '#ccc'
    },
    dataInit() {
      this.refreshGetAllTags()
      this.setPieData()
      this.setEsystemData()
      this.setFolderData()
      this.setFolderPieData()
    },
    getMuluData() {
      this.muluData = this.$http.get(this.$url + '/service/catalogs/root')
    },
    setPieData() {
      const url = `${this.$url}/service/tags/securityPie`
      this.getPieData = this.$http.get(url)
    },
    setEsystemData() {
      const url = `${this.$url}/service/tags/securityBar`
      this.getESystemData = this.$http.get(url)
    },
    setFolderData() {
      const url = `${this.$url}/service/tags/dataType/bar`
      this.getFolderData = this.$http.get(url)
    },
    setFolderPieData() {
      const url = `${this.$url}/service/tags/dataType/pie`
      this.getFolderPieData = this.$http.get(url)
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
              tagIdMap[tag.tagId] = tag
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
    handleThemeChange(theme) {
      this.colorMap.default = theme === 'dark' ? '#444' : '#ccc'
    },
    dataInit() {
      this.refreshGetAllTags()
      this.setPieData()
      this.setEsystemData()
      this.setFolderData()
      this.setFolderPieData()
      this.getComputedData()
    },
    getComputedData() {
      this.$http
        .get(this.$url + '/service/tags/dataAuth/collect/count')
        .then(res => {
          console.log(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getMuluData() {
      this.muluData = this.$http.get(this.$url + '/service/catalogs/root')
    },
    setPieData() {
      let url = `${this.$url}/service/tags/securityPie`
      this.getPieData = this.$http.get(url)
    },
    setEsystemData() {
      let url = `${this.$url}/service/tags/securityBar`
      this.getESystemData = this.$http.get(url)
    },
    setFolderData() {
      let url = `${this.$url}/service/tags/dataType/bar`
      this.getFolderData = this.$http.get(url)
    },
    setFolderPieData() {
      let url = `${this.$url}/service/tags/dataType/pie`
      this.getFolderPieData = this.$http.get(url)
    },
    refreshGetAllTags() {
      this.getAllTages = this.$http.get(`${this.$url}/service/tags/`)
      this.getAllTages
        .then(res => {
          let tagIdMap = {}
          let tabNameMap = {}
          let tagArr = res.data
          if (tagArr && Array.isArray(tagArr) && tagArr.length > 0) {
            tagArr.forEach(tag => {
              tagIdMap[tag.tagId] = tag
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
      let result = this.$http.get(`${this.$url}/service/tags/dataTypes`)
      this.getAllSafeType = result
      result
        .then(res => {
          let arr = []
          let data = res.data
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
      let index = this.tabsArr.findIndex(item => {
        return item.name == name
      })
      if (index !== -1) {
        this.tabsArr.splice(index, 1)
        this.currentTab = this.defaultTabName
      }
    },
    addTab(tab) {
      let index = this.tabsArr.findIndex(item => {
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
          let data = res.data
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
}
</script>

<style lang="scss">
#main-content {
  overflow: auto;
}
.safe-manage-page {
  background-color: #f2f4fa;
  height: 100%;
  overflow-x: auto;
  .new-page-card-tabs {
    top: 0;
    // height: 100%;
  }
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  h1 {
    font-size: 22px;
    line-height: 1;
    padding: 16px 20px 0;
  }
  .page-title-row {
    padding: 0 10px 10px;
    background-color: #f2f4fa;
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
  .security-summary-list {
    min-width: 1200px;
    padding-left: 16px;
    padding-bottom: 20px;
    & > li {
      display: inline-block;
      width: 25%;
      height: 250px;
      box-sizing: border-box;
      padding: 16px 16px 0 0;
    }
  }
  .bg-white {
    position: relative;
    height: 100%;
    background: #fff;
    border-radius: 2px;
    box-sizing: border-box;
    h2 {
      position: absolute;
      top: 17px;
      left: 16px;
      font-size: 14px;
      line-height: 1;
      color: #555;
      border-left: 4px solid #409eff;
      padding-left: 6px;
    }
  }
  .bg-image {
    background: url('../../assets/images/security-bg.png') no-repeat center #fff;
    background-size: 40% auto;
  }
  .data-panel {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    p {
      font-size: 50px;
      color: #444;
    }
    &.shangmi {
      p {
        color: #ff8484;
      }
    }
    &.mingan {
      p {
        color: #e9b265;
      }
      .name {
        .hint {
          background: #e9b265;
        }
      }
    }
    &.waibu {
      p {
        color: #52cbf0;
      }
      .name {
        .hint {
          background: #52cbf0;
        }
      }
    }
    .name {
      margin-top: 12px;
      position: relative;
      display: inline-block;
      font-size: 20px;
      line-height: 1;
      color: #444;
      .hint {
        position: absolute;
        top: -24px;
        right: -60px;
        padding: 6px 8px;
        border-radius: 10px 10px 10px 0px;
        background: #ff8484;
        font-size: 12px;
        line-height: 1;
        color: #fff;
        white-space: nowrap;
      }
    }
    a {
      display: block;
      margin-top: 24px;
      color: #409eff;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      .icon {
        margin-left: 8px;
      }
    }
  }
}
</style>
