<template>
  <div class="type-fliter">
    <div class="check-box-container">
      <el-checkbox
        class="filter-item"
        :label="item"
        :key="item"
        v-for="item in filterArr"
        v-model="resultMap[item]"
        @change="filterChange"
      ></el-checkbox>
    </div>
    <div class="bottom-line">
      <el-button size="mini" type="text" @click="chooseAll">{{$v.udp.allColumn}}</el-button>
      <el-button size="mini" type="text" @click="resetChoose">{{$v.udp.reset}}</el-button>

    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      filterArr: [],
      resultMap: {},
      getFilterItem: null,
      autoRefresh: false,
      choosedAll: false
    }
  },
  components: {

  },
  created () {
  },
  computed: {
  },
  beforeMount () {
    this.autoRefresh = !!this.params.autoRefresh
    if (!this.autoRefresh) {
      this.refreshGetFilterItem()
    }
  },
  mounted () {
  },
  methods: {
    getFilterArr () {
      this.getFilterItem
        .then(res => {
          let resultMap = {}
          let resultArr = []
          let arr = res
          arr.forEach(item => {
            if (item) {
              resultMap[item] = !!this.resultMap[item]
              resultArr.push(item)
            }
          })
          this.filterArr = resultArr
          this.resultMap = resultMap
        })
        .catch(e => {
          console.log(e)
        })
    },
    isFilterActive () {
      let result = false
      for (let key in this.resultMap) {
        if (this.resultMap[key]) {
          result = true
        }
      }
      return result
    },
    refreshGetFilterItem () {
      if (this.params.getFilterItem) {
        this.getFilterItem = this.params.getFilterItem()
        this.getFilterArr()
      } else {
        console.error('getFilterItem is required')
      }
    },
    doesFilterPass (params) {
      return true
    },

    getModel () {
      let result = []
      for (let key in this.resultMap) {
        if (this.resultMap[key]) {
          result.push(key)
        }
      }
      return result
    },

    setModel (result, value) {
      this.resultMap = {}
      // let map = {}
      if (result && Array.isArray(result)) {
        result.forEach(item => {
          // map[item] = value
          this.$set(this.resultMap, item, value)
        })
      }
      console.log(this.resultMap, 'this.resultMap')
      // this.resultMap = map
    },

    afterGuiAttached () {
      if (this.autoRefresh) {
        this.refreshGetFilterItem()
      }
    },

    componentMethod (message) {
    },
    onNewRowsLoaded () {
    },
    filterChange () {
      // console.log(this.resultMap, 'this.resultMap ')
      this.params.filterChangedCallback()
    },
    chooseAll () {
      console.log('chooseAll')
      if (!this.choosedAll) {
        this.setModel(this.filterArr, true)
        this.filterChange()
      }
    },
    resetChoose () {
      this.setModel(this.filterArr, false)
      this.filterChange()
    }
  },
  watch: {
    resultMap: {
      deep: true,
      // immediate: true,
      handler: function (newVal) {
        let bool = true
        if (!this.filterArr || !Array.isArray(this.filterArr)) {
          bool = false
        } else {
          this.filterArr.forEach(item => {
            if (bool) {
              bool = !!this.resultMap[item]
            }
          })
        }
        this.choosedAll = bool
      }
    }
  }
}
</script>

<style lang="scss" scpoed>
.type-fliter {
  margin: 10px;
  max-width: 150px;
  .filter-item {
    margin-top: 4px;
    display: block;
  }
}
.check-box-container {
  border-bottom: 1px solid #eee;
  min-height: 10px;
  padding: 0 4px 10px;
}
.bottom-line {
  padding-top: 4px;
}
.bottom-line /deep/ .el-button {
  padding: 2px;
}

</style>
