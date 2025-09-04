<template>
  <div class="search-result">
    <result-list
      :keywordProp="keyword"
      v-if="showList"
    ></result-list>
  </div>
</template>

<script>
import resultList from './resultList.vue'
export default {
  data () {
    return {
      keyword: '',
      showList: false
    }
  },
  components: {
    resultList
  },
  computed: {

  },
  mounted () {
    let query = this.$route.query
    if (query.keyword) {
      this.keyword = query.keyword
    }
    this.showList = true
  },
  methods: {

  },
  watch: {
    $route (to, from) {
      let query = to.query
      if (query && query.keyword) {
        this.keyword = query.keyword
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-result {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
