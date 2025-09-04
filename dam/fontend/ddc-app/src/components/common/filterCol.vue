<template>
  <div class="type-fliter">
    <el-checkbox
      :label="item"
      :key="item"
      v-for="item in filterArr"
      v-model="resultMap[item]"
      @change="filterChange"
    ></el-checkbox>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterArr: [],
      resultMap: {},
      getFilterItem: null,
      autoRefresh: false,
    }
  },
  components: {},
  created() {},
  computed: {},
  beforeMount() {
    this.autoRefresh = !!this.params.autoRefresh
    if (!this.autoRefresh) {
      this.refreshGetFilterItem()
    }
  },
  mounted() {},
  methods: {
    getFilterArr() {
      this.getFilterItem
        .then(res => {
          const resultMap = {}
          const resultArr = []
          const arr = res
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
    isFilterActive() {
      let result = false
      for (const key in this.resultMap) {
        if (this.resultMap[key]) {
          result = true
        }
      }
      return result
    },
    refreshGetFilterItem() {
      if (this.params.getFilterItem) {
        this.getFilterItem = this.params.getFilterItem()
        this.getFilterArr()
      } else {
        console.error('getFilterItem is required')
      }
    },
    doesFilterPass(params) {
      return true
    },

    getModel() {
      const result = []
      for (const key in this.resultMap) {
        if (this.resultMap[key]) {
          result.push(key)
        }
      }
      return result
    },

    setModel(result) {
      const map = {}
      if (result && Array.isArray(result)) {
        result.forEach(item => {
          map[item] = true
        })
      }
      this.resultMap = map
    },

    afterGuiAttached() {
      if (this.autoRefresh) {
        this.refreshGetFilterItem()
      }
    },

    componentMethod(message) {},
    onNewRowsLoaded() {},
    filterChange() {
      this.params.filterChangedCallback()
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.type-fliter {
  margin: 10px;
}
</style>
