<template>
  <div id="masking-option-list" style="">
    <div class="page-title-row">
      <span class="menu font-medium">数据脱敏配置</span>
    </div>
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
    <masking-option
      v-if="showOption"
      :currentCol="currentCol"
      @close="showOption = false"
    ></masking-option>
  </div>
</template>
<script>
import columnTable from '@/components/safeManage/columnTable.vue'
import maskingOption from './maskingOption.vue'
export default {
  data() {
    return {
      getAllTages: null,
      safeTagCatalogName: '数据安全等级',
      statusTypeArr: ['未处理', '处理中', '已处理'],
      allUserData: {},
      allSafeType: [],
      showOption: false,
      currentCol: {},
    }
  },
  components: {
    columnTable,
    maskingOption,
  },
  beforeMount() {
    this.refreshGetSafeType()
    this.setUserOptions()
    this.refreshGetAllTags()
  },
  methods: {
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
    editCol(col) {
      this.currentCol = col
      this.showOption = true
    },
    updataColData() {
      this.refreshGetSafeType()
    },
  },
}
</script>
<style lang="scss">
#masking-option-list {
  position: relative;
  height: 100%;
  background-color: var(--default-bgc);
  .tab-bottom-line {
    .bottom-container {
      display: none;
    }
  }
  .vertical-container {
    .search-item:nth-of-type(5) {
      display: none;
    }
  }
  .el-checkbox {
    display: none;
  }
  .tab-bottom-line {
    height: 50px;
  }
  .tab-table-line {
    bottom: 50px;
  }
}
</style>
